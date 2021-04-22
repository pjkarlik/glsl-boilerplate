###

![travis ci build](https://travis-ci.org/pjkarlik/truchet-webgl.svg?branch=main)

# GLSL Fragment Shader Boilerplate

This is my basic WebGL2 & Frgament Shader boilerplate. It's close to the bare minimum required to start developing GLSL fragment shaders. Curious about what a shader is, then go here [Book Of Shaders](https://thebookofshaders.com/01/)!


## Bootstrap Code

`bootstrap.js` is the basic WebGL bootstrap, which sets up the canvas, shader uniforms and loads the shaders into the GPU for display. The `frg-shader` (Fragment shader) contains the meat of the graphics demo which is compiled and pushed to the GPU. the `vrt-shader` (Vertext shader) is a stage in the rendering pipeline that handles the processing of individual vertices. However we're not excatly touching them, but it's required part of rendering the fragment shader to a canvas/screen.

![version](https://img.shields.io/badge/version-0.0.1-e05d44.svg?style=flat-square) ![webpack](https://img.shields.io/badge/webpack-4.44.1-51b1c5.svg?style=flat-square) ![WebGL2](https://img.shields.io/badge/GLSL-3.0-blue.svg?style=flat-square)

- WebGL2 boilterplate.
- [vertext shader] + [fragment shader] version 300 es.
- Query parameter resolution switching (?rez=1/2/3/4)

## Run the example

Check your browser [WebGL support](https://caniuse.com/webgl2).

Requires Node v12.xx.xx or greater

```bash
$ npm install
$ npm run dev
```
and to build out to dist
```bash
$ npm run build
```

open http://localhost:2020/?rez=1 (1 to 4+ depending on systems GPU)
