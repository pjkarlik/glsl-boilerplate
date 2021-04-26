###

![travis ci build](https://travis-ci.org/pjkarlik/glsl-boilerplate.svg?branch=main)

# GLSL Fragment Shader Boilerplate

This is my basic WebGL2 & Frgament Shader boilerplate. It's close to the bare minimum required to start developing GLSL fragment shaders. Curious about what a shader is, then go here [Book Of Shaders](https://thebookofshaders.com/01/)!


## Set up and Overview
By default you can just clone and edit the `/src/shaders/frg-shader.js` and add in your own code and go. The basic uniforms instated are time from start and 
mouse position which is normalized to the screen resolution.

```js
|-- src
|   |-- shaders
|   |   |-- frg-shader.js
|   |   |-- vrt-shader.js
|   |   
|   |-- utils
|   |   |-- mouse.js
|   |   
|   |-- bootstrap.js
|   |-- index.js
```

`index.js` is the application start and loads in `bootstrap.js` that created the WebGL2 canvas and attaches the shaders. 
`bootstrap.js` is the basic WebGL bootstrap, which sets up the canvas, shader uniforms and loads the shaders into the GPU for display. 

- **frg-shader** (Fragment shader) contains the meat of the graphics demo which is compiled and pushed to the GPU. 
- **vrt-shader** (Vertext shader) is a stage in the rendering pipeline that handles the processing of individual vertices. 

### Default uniforms

I added two basic uniforms into the shader bootstrap by default. **time** and **resolution** which give you the items needed for interactive
graphics with shaders. The resolution is pulled from the current browser viewport and then divided by an optimization setting in the query string. 

```js
  const urlParams = new URLSearchParams(window.location.search);
  const queryRez = urlParams.get("rez");
  const rez = parseInt(queryRez, 10) || 2;

  return ~~(document.documentElement.clientWidth, window.innerWidth || 0) / rez;
```

![version](https://img.shields.io/badge/version-0.0.1-e05d44.svg?style=flat-square) ![webpack](https://img.shields.io/badge/webpack-4.44.1-51b1c5.svg?style=flat-square) ![WebGL2](https://img.shields.io/badge/GLSL-3.0-blue.svg?style=flat-square)

- WebGL2 boilterplate.
- [vertext shader] + [fragment shader] version 300 es.
- Query parameter resolution switching (?rez=1/2/3/4)

## Run the example

Check your browser [WebGL support](https://caniuse.com/webgl2).

Requires Node v12.xx.xx or greater

```bash
$ npm install
$ npm run start
```
and to build out to dist
```bash
$ npm run build
```

open http://localhost:2020/?rez=1 (1 to 4+ depending on systems GPU)

