// Shaders that will be attached to our canvas
import fragmentSource from "./shaders/frg-shader";
import vertexSource from "./shaders/vrt-shader";
// Other Packages
import dat from "dat.gui";
// Other utility functions
import Mouse from "./utils/mouse";

/**
  Resolution query parameter for canvas display
  rez = 1 Highest quality | 2 = Medium qality
  the rez query number is divids the base width
  and height set by the browser window and used
  then is used to configure the canvas object.
 */
const urlParams = new URLSearchParams(window.location.search);
const queryRez = urlParams.get("rez");
const rez = parseInt(queryRez, 10) || 2;

// helper functions
export const getWidth = () => {
  return ~~(document.documentElement.clientWidth, window.innerWidth || 0) / rez;
};
export const getHeight = () => {
  return (
    ~~(document.documentElement.clientHeight, window.innerHeight || 0) / rez
  );
};

// Render Class Object //
export default class Render {
  constructor() {
    this.start = Date.now();

    // mouse var storage
    this.umouse = [0.0, 0.0, 0.0, 0.0];
    this.tmouse = [0.0, 0.0, 0.0, 0.0];
    this.color1 = 113;
    this.color2 = 294.5;

    /**
      Setup for WebGL canvas and render context object
    */
    const width = (this.width = getWidth());
    const height = (this.height = getHeight());
    const canvas = (this.canvas = document.createElement("canvas"));
    canvas.id = "WebGLShader";
    canvas.width = width;
    canvas.height = height;
    document.body.appendChild(canvas);

    this.mouse = new Mouse(canvas);

    const gl = (this.gl = canvas.getContext("webgl2"));

    if (!gl) {
      console.warn("WebGL 2 is not available.");
      return;
    }
    // WebGl and WebGl2 Extension //
    this.gl.getExtension("OES_standard_derivatives");
    /**
      The OES_standard_derivatives extension is part of the 
      WebGL API and adds the GLSL derivative functions dFdx, 
      dFdy, and fwidth.
     */
    this.gl.getExtension("EXT_shader_texture_lod");
    /**
      The EXT_shader_texture_lod extension is part of the 
      WebGL API and adds additional texture functions to 
      the OpenGL ES Shading Language which provide the shader 
      writer with explicit control of LOD (Level of detail).
     */
    this.gl.getExtension("OES_texture_float");
    /**
      The OES_texture_float extension is part of the WebGL 
      API and exposes floating-point pixel types for textures.
     */
    this.gl.getExtension("WEBGL_color_buffer_float");
    /**
      The WEBGL_color_buffer_float extension is part of the 
      WebGL API and adds the ability to render to 32-bit 
      floating-point color buffers.
     */
    this.gl.getExtension("OES_texture_float_linear");
    /**
      The OES_texture_float_linear extension is part of the 
      WebGL API and allows linear filtering with floating-point 
      pixel types for textures.
     */
    this.gl.viewport(0, 0, canvas.width, canvas.height);

    /**
      Event handler to resize canvas resolution to match
      browser window 
     */
    window.addEventListener(
      "resize",
      () => {
        this.canvas.width = getWidth();
        this.canvas.height = getHeight();
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.resolution = new Float32Array([
          this.canvas.width,
          this.canvas.height,
        ]);
        this.gl.uniform2fv(
          this.gl.getUniformLocation(this.program, "resolution"),
          this.resolution
        );
        this.clearCanvas();
      },
      false
    );

    //this.createGui();
    this.init();
  }

  /**
    Attach and compile shader
  */
  createShader = (type, source) => {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    const success = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);
    if (!success) {
      console.log(this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return false;
    }
    return shader;
  };

  createWebGL = (vertexSource, fragmentSource) => {
    this.vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexSource);
    this.fragmentShader = this.createShader(
      this.gl.FRAGMENT_SHADER,
      fragmentSource
    );

    this.program = this.gl.createProgram();
    this.gl.attachShader(this.program, this.vertexShader);
    this.gl.attachShader(this.program, this.fragmentShader);
    this.gl.linkProgram(this.program);
    this.gl.useProgram(this.program);

    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      console.warn(
        "Unable to initialize the shader program: " +
          this.gl.getProgramInfoLog(this.program)
      );
      return null;
    }

    const buffer = (this.buffer = this.gl.createBuffer());
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);

    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array([-1, 1, -1, -1, 1, -1, 1, 1]),
      this.gl.STATIC_DRAW
    );

    const vPosition = this.gl.getAttribLocation(this.program, "vPosition");

    this.gl.enableVertexAttribArray(vPosition);
    this.gl.vertexAttribPointer(
      vPosition,
      2, // size: 2 components per iteration
      this.gl.FLOAT, // type: the data is 32bit floats
      false, // normalize: don't normalize the data
      0, // stride: 0 = move forward size * sizeof(type) each iteration to get the next position
      0 // start at the beginning of the buffer
    );

    this.clearCanvas();
    this.importUniforms();
  };

  clearCanvas = () => {
    this.gl.clearColor(0, 0, 0, 0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  };

  /**
    Adding shader uniforms
  */
  importUniforms = () => {
    this.width = getWidth();
    this.height = getHeight();
    this.resolution = new Float32Array([this.width, this.height]);
    this.gl.uniform2fv(
      this.gl.getUniformLocation(this.program, "resolution"),
      this.resolution
    );
    this.ut = this.gl.getUniformLocation(this.program, "time");
    this.ms = this.gl.getUniformLocation(this.program, "mouse");
  };

  /**
    Update shader uniforms
  */
  updateUniforms = () => {
    this.gl.uniform1f(this.ut, (Date.now() - this.start) / 1000);
    const mouse = this.mouse.pointer();
    //normalize mouse to screen size and resolution
    this.umouse = [mouse.x / rez, this.canvas.height - mouse.y / rez, mouse.z];
    const factor = 0.15;
    // cheap lerp on movement - makes it feel softer
    this.tmouse[0] =
      this.tmouse[0] - (this.tmouse[0] - this.umouse[0]) * factor;
    this.tmouse[1] =
      this.tmouse[1] - (this.tmouse[1] - this.umouse[1]) * factor;
    this.tmouse[2] = this.umouse[2];

    this.gl.uniform4fv(this.ms, this.tmouse);

    this.gl.drawArrays(
      this.gl.TRIANGLE_FAN, // primitiveType
      0, // Offset
      4 // Count
    );
  };

  init = () => {
    this.createWebGL(vertexSource, fragmentSource);
    this.renderLoop();
  };

  renderLoop = () => {
    this.updateUniforms();
    this.animation = window.requestAnimationFrame(this.renderLoop);
  };
}
