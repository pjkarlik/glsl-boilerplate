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
#define PI          3.14159265358
#define PI2         6.28318530718

#define MAX_DIST    100.
#define MIN_DIST    .001

float vmax(vec3 v) 
{	
    return max(max(v.x,v.y),v.z);
}

mat2 rot(float a)
{
    return mat2(cos(a),sin(a),-sin(a),cos(a));
}

float fBox(vec3 p, vec3 b)
{
	vec3 d = abs(p) - b;
	return length(max(d, vec3(0))) + vmax(min(d, vec3(0)));
}

void GetMouse(inout vec3 p) 
{
    float x = M.xy == vec2(0) ? 0. : -(M.y/R.y * 1. - .5) * PI;
    float y = M.xy == vec2(0) ? 0. : -(M.x/R.x * 1. - .5) * PI;
    if(x<-.01) x=-.01;
    p.yz*=rot(x);
    p.xz*=rot(y);
}

float sid,gid;

vec2 map(vec3 p)
{
    vec2 res=vec2(1e5,0.);
    float sz =.75;
    float hf =sz/2.;
    float ft = T*.5;
  
    float pd = floor((ft-p.x+hf)/sz);
   
    float wt = .5+.5*cos(ft+pd);
    
    vec3 q = p-vec3(ft,1.5+wt,0);
    float id = floor((q.x+hf)/sz);
    gid=id;

    q.z = abs(q.z)-1.5;
    q.x = mod(q.x+hf,sz)-hf;
    q.zy *=rot(ft+id);

    float b = fBox(q,vec3(.05,.25,.25));
    float f = p.y;
    float x = fBox(p-vec3(0,1,-5.5),vec3(25.,8.,.05));

    if(b<res.x) res = vec2(b,1.);
    if(f<res.x) res = vec2(f,2.);
    if(x<res.x) res = vec2(x,3.);
    
    return res;
}

vec2 marcher(vec3 ro, vec3 rd, int steps)
{
    float d,m;
    for(int i=0;i<steps;i++)
    {
        vec3 p = ro + rd * d;
        vec2 dist = map(p);
        d+= i<32 ? dist.x*.5 : dist.x;
        m =dist.y;
        if(d>MAX_DIST||abs(dist.x)<MIN_DIST) break;
    }
    return vec2(d,m);
}

vec3 normal(vec3 p, float t)
{
    t*=MIN_DIST;
    float d = map(p).x;
    vec2 e = vec2(t,0);
    vec3 n = d - vec3(
        map(p-e.xyy).x,
        map(p-e.yxy).x,
        map(p-e.yyx).x
    );
    return normalize(n);
}

const vec3 c = vec3(.95,.97,.98),
           d = vec3(.91,.40,.07);
           
vec3 hue(float t){ 
    return .45 + .45*cos( 13.+PI2*t*(c*d) ); 
}

void debug(vec2 uv, inout vec3 C)
{
    if(uv.x>0.&&uv.x<.005) C = vec3(1);
    if(uv.y>0.&&uv.y<.005) C = vec3(1);
}

vec3 getColor(vec3 p, float m)
{
    vec3 h = vec3(.5);
    if(m==1.) h=hue(sid);
    if(m>1.) {
        p.xz-=T*.25;
        p.x+=.25+.25*sin(p.z*3.1+T*.3);
        float id = floor((p.x+.5)/1.);
        h=hue(id);
    }
    return h;
}

void main()
{
    vec3 C;
    vec2 uv = (2.*gl_FragCoord.xy-R.xy)/max(R.x,R.y);
    vec3 ro = vec3(0,1,5),
         rd = normalize(vec3(uv,-1));

    GetMouse(ro);
    GetMouse(rd);

    vec2 ray = marcher(ro,rd,128);
    float d = ray.x;
    float m = ray.y;
    
    if(d<MAX_DIST)
    {
        sid=gid;
        vec3 p = ro + rd * d;
        vec3 n = normal(p,d);

        vec3 lightPos = vec3(-2,5,1); 
   
        vec3 l = normalize(lightPos-p);
        // shade
        float diff = clamp(dot(n,l),0.,1.);

                
        // shadows;
        float shadow = 0.;
        for(int i=0;i<96;i++)
        {
            vec3 q = (p + n * .1) + l * shadow;
            float h = map(q).x;
            if(h<MIN_DIST*d||shadow>MAX_DIST)break;
            shadow += h * .75;
        }
        if(shadow < length(p -  lightPos)) diff *= .1;

        
        vec3 h = getColor(p,m);
        
        //temp
        C += vec3(1) * diff * h;
    }

    // Output to screen
    C = mix( C, vec3(.05), 1.-exp(-.0025*d*d*d));
    
    debug(uv, C);
        
    fragColor = vec4(pow(C, vec3(0.4545)),1.0);
}
`;

export default fragmentShader;
