const fragmentShader = `#version 300 es
precision mediump float;
out vec4 fragColor;

uniform vec2 resolution;
uniform vec4 mouse;
uniform float time;
uniform float zoom;
uniform float colorA;
uniform float colorB;

/**
 @pjkarlik
 */

#define R           resolution
#define T           time
#define M           mouse
#define PI          3.1415926535
#define PI2         6.2831853070

#define MAX_DIST    20.
#define MIN_DIST    .0002
#define SCALE 1.15

#define r2(a) mat2(cos(a),sin(a),-sin(a),cos(a))
#define hue(a) .45 + .45 * cos(PI2* a * vec3(1.,.15,.25));
float hash21(vec2 p){  return fract(sin(dot(p, vec2(27.609, 57.583)))*43758.5453); }

void getMouse( inout vec3 p ) {
    float x = M.xy == vec2(0) ? 0. : -(M.y/R.y * .25 - .125) * PI;
    float y = M.xy == vec2(0) ? 0. : (M.x/R.x * .25 - .125) * PI;
    p.zy *=r2(x);
    p.xz *=r2(y);   
}

//http://mercury.sexy/hg_sdf/
float vmax(vec3 v) {    return max(max(v.x, v.y), v.z);     }
float fBox(vec3 p, vec3 b, float r) {
    vec3 d = abs(p) - b;
    return length(max(d, vec3(0))) + vmax(min(d, vec3(0)))-r;
}
//@iq
mat2 trs;// - with added precal
float sdTorus( vec3 p, vec2 t, float a ) {
  if(a>0.){p.xy *= trs;p.yz *= trs;}
  vec2 q = vec2(length(p.xy)-t.x,p.z);
  return length(q)-t.y;
}

// globals
vec3 shp,fhp;
vec2 sip,bid;
float thsh;

const float size = 1./SCALE;
const float hlf = size/2.;

vec2 map(vec3 q3){
    vec2 res = vec2(1000.,0.);

    q3.x -= T*.35;

    float d = 1e5, t = 1e5;
    vec2 qid=floor((q3.xy+hlf)/size);

    vec3 qm = vec3(
        mod(q3.x+hlf,size)-hlf,
        mod(q3.y+hlf,size)-hlf,
        q3.z
    );

    q3.z+=size;
    vec3 qb = vec3(
        mod(q3.x+hlf,size)-hlf,
        mod(q3.y+hlf,size)-hlf,
        q3.z
    );

    float ht = hash21(qid); 
    vec3 bm = qm;
    // build box parts
    float f = length(bm)-(hlf*1.25);
    float b = fBox(bm,vec3(hlf),.012);
    float c = fBox(bm,vec3(hlf)*.93,.012);
    float di = ht > .28 ? max(c,-b) : max(c,-f);

    float c2 = fBox(qb,vec3(hlf)*.93,.012);

    di=min(c2,di);
    // box
    if(di<d) {
        d = di;
        sip = qid;
        fhp = bm;
        thsh = ht;
    }

    // truchet build parts
    float thx = (.115+.1*sin(q3.y*1.05) ) *size;
    if(ht>.5) qm.x *= -1.;

    float ti = min(
      sdTorus(qm-vec3(hlf,hlf,0),vec2(hlf,thx),0.),
      sdTorus(qm-vec3(-hlf,-hlf,0),vec2(hlf,thx),0.)
    );

    // truchet
    if(ti<t) {
        t = ti;
        sip = qid;
        shp = qm;
        thsh = ht;
    }

    if(d<res.x) res = vec2(d,1.);
    if(t<res.x) res = vec2(t,2.);
    return res;
}

// Tetrahedron technique @iq
// https://www.iquilezles.org/www/articles/normalsSDF/normalsSDF.htm
vec3 getNormal(vec3 p, float t){
    float e = t*MIN_DIST;
    vec2 h = vec2(1.,-1.)*.5773;
    return normalize( h.xyy*map( p + h.xyy*e).x + 
					  h.yyx*map( p + h.yyx*e).x + 
					  h.yxy*map( p + h.yxy*e).x + 
	 				  h.xxx*map( p + h.xxx*e).x );
}

vec2 marcher(vec3 ro, vec3 rd, int maxsteps) {
    float d = 0.;
    float m = -1.;
    for(int i=0;i<maxsteps;i++){
        vec2 t = map(ro + rd * d);
        if(abs(t.x)<d*MIN_DIST||d>MAX_DIST) break;
        d += t.x*.75;
        m  = t.y;
    }
    return vec2(d,m);
}

float getDiff(vec3 p, vec3 n, vec3 lpos) {
    vec3 l = normalize(lpos-p);
    float dif = clamp(dot(n,l),.1 , 1.);
    float shadow = marcher(p + n * .01, l, 84).x;
    if(shadow < length(p -  lpos)) dif *= .25;
    return dif;
}

vec3 camera(vec3 lp, vec3 ro, vec2 uv) {
    vec3 cf = normalize(lp - ro),
         cr = normalize(cross(vec3(0,1,0),cf)),
         cu = normalize(cross(cf,cr)),
         c  = ro + cf *.85,
         i  = c + uv.x * cr + uv.y * cu,
         rd = i - ro;
    return rd;
}

vec3 thp,ghp;
vec2 tip,fid;
float hsh;

vec3 getColor(float m, vec3 p, vec3 n) {
    vec3 h = vec3(.5);      
    if(m==1.) {
        h = .6-vec3(hsh*.75);
    }
    if(m==2.) {    
        // strip patterns..
        thp/=1./SCALE;
        float dir = mod(tip.x + tip.y,2.) * 2. - 1.;  

        vec2 cUv = thp.xy-sign(thp.x+thp.y+.001)*.5;
        float angle = atan(cUv.x, cUv.y);
        float a = sin( dir * angle * 6. + T * 2.25);
        a = abs(a)-.45;a = abs(a)-.35;
        vec3 nz = hue((p.x+(T*.12))*.25);
        h = mix(nz, vec3(1), smoothstep(.01, .02, a));  
    }
    return h;
}

void main() {
    // precal
    trs = r2(PI*4.5);
    // Normalized coordinates (from -1 to 1)
    vec2 uv = (2.*gl_FragCoord.xy-R.xy)/max(R.x,R.y);
    vec3 C = vec3(0.);
    vec3 FC = vec3(.3+(uv.y*.3));
    vec3 lp = vec3(0.,0.,0.),
         ro = vec3(0.,0.,2.75);
         getMouse(ro);

    vec3 rd = camera(lp,ro,uv);
    vec2 t = marcher(ro,rd, 128);
    // save all globals
    thp = shp;
    ghp = fhp;
    tip = sip;
    hsh = thsh;

    if(t.x<MAX_DIST){
        vec3 p = ro + rd * t.x;
        vec3 n = getNormal(p, t.x);
        vec3 lpos = vec3(0.,3.,6.);
        float diff = getDiff(p, n, lpos);
        vec3 h = getColor(t.y, p, n);
        C+=diff * h;
        
        // reflection
        // if material && hue not black 
        if(h.x<.9999 &&h.y<.9999 &&h.z<.9999){
            vec3 rr=reflect(rd,n); 
            vec2 tr = marcher(p ,rr, 98);
            thp = shp;
            ghp = fhp;
            tip = sip;
            hsh = thsh;
            
            if(tr.x<MAX_DIST){
                p += rr*tr.x;
                n = getNormal(p,tr.x);
                diff = getDiff(p,n,lpos);
                h = getColor(tr.y, p, n);
                C+=diff * h;
                
            } else {
                C += FC;
            }
        } 
        
    } 
    C = mix( C, FC, 1.-exp(-.0015*t.x*t.x*t.x));
    // Output to screen
    fragColor = vec4(pow(C, vec3(0.4545)),1.0);
}
`;

export default fragmentShader;
