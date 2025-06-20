"use strict";

const LUZ = {
  pos: vec4(0.0, 3.0, 2.0, 0.0),
  amb: vec4(1.0, 1.0, 1.0, 1.0),
  dif: vec4(1.0, 1.0, 1.0, 1.0),
  esp: vec4(1.0, 1.0, 1.0, 1.0),
};

const MAT = {
  amb: vec4(0.1, 0.2, 0.8, 1.0),
  dif: vec4(1.0, 0.5, 1.0, 1.0),
  alfa: 100.0,
};

const eye = vec3(2, 2, 0);
const at = vec3(0, 0, 0);
const up = vec3(0, 0, 1);

const CAMERA_RAIO = 3;
const CAMERA_STEP = 5;

const BOARD_SLOTS = 3;

const FOVY = 60;
const ASPECT = 1;
const NEAR = 0.1;
const FAR = 50;

const FUNDO = [1, 0.1, 0.0, 0.2];

const BALAO_CANTOS = [
  vec3(1.0, 0.0, 0.0),
  vec3(0.0, 1.0, 0.0),
  vec3(0.0, 0.0, 1.0),
  vec3(-1.0, 0.0, 0.0),
  vec3(0.0, -1.0, 0.0),
  vec3(0.0, 0.0, -1.0),
];

const EIXO_X_IND = 0;
const EIXO_Y_IND = 1;
const EIXO_Z_IND = 2;
const EIXO_X = vec3(1, 0, 0);
const EIXO_Y = vec3(0, 1, 0);
const EIXO_Z = vec3(0, 0, 1);

var gl;
var gCanvas;

var gCtx = {
  view: mat4(),
  perspective: mat4(),
};

var gObjs = [];

var gShader = {
  aTheta: null,
};

var animando = true;
var umPasso = false;

var board;
var playerSize = 1;
const middle = Math.floor(BOARD_SLOTS / 2);

// Posição do jogador na horizontal
let iX = middle;
let iY = middle;

// Localização do jogador em relação ao tabuleiro
let pX = middle;
let pY = middle;
let pZ = middle;

window.onload = main;

function main() {
  gCanvas = document.getElementById("glcanvas");
  gl = gCanvas.getContext("webgl2");
  if (!gl) alert("Vixe! Não achei WebGL 2.0 aqui :-(");

  crieInterface();
  crieBoard();

  addPlayer();
  addFruit();

  gl.viewport(0, 0, gCanvas.width, gCanvas.height);
  gl.clearColor(FUNDO[0], FUNDO[1], FUNDO[2], FUNDO[3]);
  gl.enable(gl.DEPTH_TEST);

  crieShaders();
  render();
}

function crieBoard() {
  const array3D = [];

  for (let i = 0; i < 3; i++) {
    array3D[i] = [];
    for (let j = 0; j < 3; j++) {
      array3D[i][j] = [];
      for (let k = 0; k < 3; k++) {
        array3D[i][j][k] = 0;
      }
    }
  }

  board = array3D;
  board[1][1][1] = 1;
}

function atualizaBoard() {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) {
        if (board[i][j][k] > 0) board[i][j][k]--;
      }
    }
  }
}

function desenhaPlayer() {
  const hue = 0.4;
  const sat = 1.0;
  const val = 0.4;

  let ndivs = 2;
  let cor = vec4(...hsv2rgb(hue, sat, val), 1.0);

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) {
        if (board[i][j][k] > 0 && board[i][j][k] != playerSize) {
          const esfera = new crieEsfera(ndivs, cor);
          esfera.init(ndivs);
          esfera.centro = vec3(k, i, j);

          esfera.rodando = true;
          esfera.theta = vec3(0, 0, 0);
          esfera.axis = EIXO_Y_IND;
          esfera.raio = 0.2;
          esfera.raioX = 0.2;
          esfera.raioY = 0.2;
          esfera.raioZ = 0.2;

          gObjs.push(esfera);
        }
      }
    }
  }
}

function addPlayer() {
  const hue = 0.4;
  const sat = 1.0;
  const val = 0.4;

  let ndivs = 2;
  let cor = vec4(...hsv2rgb(hue, sat, val), 1.0);
  const esfera = new crieEsfera(ndivs, cor);
  esfera.init(ndivs);
  esfera.centro = vec3(0, 0, 0);

  esfera.rodando = true;
  esfera.theta = vec3(0, 0, 0);
  esfera.axis = EIXO_Y_IND;
  esfera.raio = 0.2;
  esfera.raioX = 0.2;
  esfera.raioY = 0.2;
  esfera.raioZ = 0.2;

  gObjs.push(esfera);
}

function addFruit() {
  const hue = 0;
  const sat = 1.0;
  const val = 1.0;

  let ndivs = 2;
  let cor = vec4(...hsv2rgb(hue, sat, val), 1.0);
  const esfera = new crieEsfera(ndivs, cor);
  esfera.init(ndivs);
  esfera.centro = vec3(0, 0, 0.4);

  esfera.theta = vec3(0, 0, 0);
  esfera.raio = 0.2;
  esfera.raioX = 0.2;
  esfera.raioY = 0.2;
  esfera.raioZ = 0.2;
  gObjs.push(esfera);
}

function crieInterface() {
  document.getElementById("bRun").onclick = function () {
    if (!animando) {
      animando = true;
      render();
    } else {
      animando = false;
    }
  };

  document.getElementById("bStep").onclick = function () {
    if (!animando) {
      umPasso = true;
      render();
    }
  };

  let anguloHorizontal = 0;
  let anguloVertical = 45;

  document.addEventListener("keydown", (event) => {
    const tecla = event.key;
    const player = gObjs[0];
    const passo = 0.4;
    const padding = 0.05;

    if (tecla === "w") {
      if (iX < BOARD_SLOTS - 1) {
        player.centro[1] -= passo + padding;
        iX++;

        atualizaBoard();
        board[pZ][pX - 1][pY] = playerSize;
        pX--;
      }
    } else if (tecla === "s") {
      if (iX > 0) {
        player.centro[1] += passo + padding;
        iX--;

        atualizaBoard();
        board[pZ][pX + 1][pY] = playerSize;
        pX++;
      }
    } else if (tecla === "a") {
      if (iY > 0) {
        player.centro[0] += passo + padding;
        iY--;

        atualizaBoard();
        board[pZ][pX][pY - 1] = playerSize;
        pY--;
      }
    } else if (tecla === "d") {
      if (iY < BOARD_SLOTS - 1) {
        player.centro[0] -= passo + padding;
        iY++;

        atualizaBoard();
        board[pZ][pX][pY + 1] = playerSize;
        pY++;
      }
    } else if (tecla === "ArrowDown") {
      anguloHorizontal = Math.max(anguloHorizontal - CAMERA_STEP, -89);
    } else if (tecla === "ArrowUp") {
      anguloHorizontal = Math.min(anguloHorizontal + CAMERA_STEP, 89);
    } else if (tecla === "ArrowRight") {
      anguloVertical += CAMERA_STEP;
    } else if (tecla === "ArrowLeft") {
      anguloVertical -= CAMERA_STEP;
    } else {
      return;
    }

    const theta = radians(anguloVertical);
    const phi = radians(90 - anguloHorizontal);

    const x = CAMERA_RAIO * Math.sin(phi) * Math.cos(theta);
    const y = CAMERA_RAIO * Math.sin(phi) * Math.sin(theta);
    const z = CAMERA_RAIO * Math.cos(phi);

    const novoEye = vec3(x, y, z);
    gCtx.view = lookAt(novoEye, at, up);
    gl.uniformMatrix4fv(gShader.uView, false, flatten(gCtx.view));

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        let linha = "";
        for (let k = 0; k < 3; k++) {
          linha += board[i][j][k];
        }
        console.log(linha);
      }
      if (i < 2) {
        console.log("-----");
      }
    }

    // Força renderização
    if (!animando) render();
  });
}

function crieShaders() {
  gShader.program = makeProgram(gl, gVertexShaderSrc, gFragmentShaderSrc);
  gl.useProgram(gShader.program);

  var bufNormais = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufNormais);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(gObjs[0].nor), gl.STATIC_DRAW);

  var aNormal = gl.getAttribLocation(gShader.program, "aNormal");
  gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aNormal);

  var bufVertices = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufVertices);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(gObjs[0].pos), gl.STATIC_DRAW);

  var aPosition = gl.getAttribLocation(gShader.program, "aPosition");
  gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aPosition);

  gShader.uModel = gl.getUniformLocation(gShader.program, "uModel");
  gShader.uView = gl.getUniformLocation(gShader.program, "uView");
  gShader.uPerspective = gl.getUniformLocation(gShader.program, "uPerspective");
  gShader.uInverseTranspose = gl.getUniformLocation(
    gShader.program,
    "uInverseTranspose"
  );

  gCtx.perspective = perspective(FOVY, ASPECT, NEAR, FAR);
  gl.uniformMatrix4fv(gShader.uPerspective, false, flatten(gCtx.perspective));

  gCtx.view = lookAt(eye, at, up);
  gl.uniformMatrix4fv(gShader.uView, false, flatten(gCtx.view));

  gShader.uLuzPos = gl.getUniformLocation(gShader.program, "uLuzPos");
  gl.uniform4fv(gShader.uLuzPos, LUZ.pos);

  gShader.uCorAmb = gl.getUniformLocation(gShader.program, "uCorAmbiente");
  gShader.uCorDif = gl.getUniformLocation(gShader.program, "uCorDifusao");
  gShader.uCorEsp = gl.getUniformLocation(gShader.program, "uCorEspecular");
  gShader.uAlfaEsp = gl.getUniformLocation(gShader.program, "uAlfaEsp");

  gl.uniform4fv(gShader.uCorAmb, mult(LUZ.amb, MAT.amb));
  gShader.uCorDifusaInd = gl.getUniformLocation(
    gShader.program,
    "uCorDifusaInd"
  );
  gl.uniform4fv(gShader.uCorEsp, LUZ.esp);
  gl.uniform1f(gShader.uAlfaEsp, MAT.alfa);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function render() {
  if (!animando && !umPasso) {
    return;
  }

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  let novosObjs = [];

  for (let obj of gObjs) {
    const corDifusa = mult(LUZ.dif, obj.cor);
    gl.uniform4fv(gShader.uCorDifusaInd, corDifusa);
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.bufPos);
    let aPosition = gl.getAttribLocation(gShader.program, "aPosition");
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, obj.bufNor);
    let aNormal = gl.getAttribLocation(gShader.program, "aNormal");
    gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aNormal);

    if (obj.rodando) obj.theta[obj.axis] += 0.5;

    novosObjs.push(obj);

    let model = mat4();

    let translacao = mat4();
    translacao[0][3] = obj.centro[0];
    translacao[1][3] = obj.centro[1];
    translacao[2][3] = obj.centro[2];

    let escala = mat4();
    escala[0][0] = obj.raioX;
    escala[1][1] = obj.raioY;
    escala[2][2] = obj.raioZ;

    model = mult(model, translacao);
    model = mult(model, escala);

    model = mult(model, rotate(-obj.theta[EIXO_X_IND], EIXO_X));
    model = mult(model, rotate(-obj.theta[EIXO_Y_IND], EIXO_Y));
    model = mult(model, rotate(-obj.theta[EIXO_Z_IND], EIXO_Z));

    let modelView = mult(gCtx.view, model);
    let modelViewInv = inverse(modelView);
    let modelViewInvTrans = transpose(modelViewInv);

    gl.uniformMatrix4fv(gShader.uModel, false, flatten(model));
    gl.uniformMatrix4fv(
      gShader.uInverseTranspose,
      false,
      flatten(modelViewInvTrans)
    );

    gl.drawArrays(
      gl.TRIANGLES,
      0,
      gObjs.reduce((soma, obj) => soma + obj.pos.length, 0)
    );
  }

  gObjs = novosObjs;

  if (umPasso) {
    umPasso = false;
  } else {
    window.requestAnimationFrame(render);
  }
}

function crieEsfera(ndivisoes = 2, cor) {
  this.np = 0;
  this.pos = [];
  this.nor = [];
  this.centro = vec3(0.0, 0.0, 0.0);
  this.velocidade = vec3(0, 0, 0);
  this.raio;
  this.raioX = this.raio;
  this.raioY = this.raio;
  this.raioZ = this.raio;

  this.cor = cor;
  this.rodando = false;
  this.bufPos = null;
  this.bufNor = null;

  let vp = [BALAO_CANTOS[0], BALAO_CANTOS[1], BALAO_CANTOS[2]];
  let vn = [BALAO_CANTOS[3], BALAO_CANTOS[4], BALAO_CANTOS[5]];

  let triangulo = [
    [vp[0], vp[1], vp[2]],
    [vp[0], vp[1], vn[2]],
    [vp[0], vn[1], vp[2]],
    [vp[0], vn[1], vn[2]],
    [vn[0], vp[1], vp[2]],
    [vn[0], vp[1], vn[2]],
    [vn[0], vn[1], vp[2]],
    [vn[0], vn[1], vn[2]],
  ];

  this.init = function (ndivs = ndivisoes) {
    this.pos = [];
    this.nor = [];

    for (let i = 0; i < triangulo.length; i++) {
      let [a, b, c] = triangulo[i];
      dividaTriangulo(this.pos, this.nor, a, b, c, ndivs);
    }

    this.np = this.pos.length;

    this.bufPos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(this.pos), gl.STATIC_DRAW);

    this.bufNor = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(this.nor), gl.STATIC_DRAW);
  };

  this.escala = function (escala) {
    this.raioX = escala[0];
    this.raioY = escala[1];
    this.raioZ = escala[2];
  };
}

function dividaTriangulo(pos, nor, a, b, c, ndivs) {
  if (ndivs > 0) {
    let ab = mix(a, b, 0.5);
    let bc = mix(b, c, 0.5);
    let ca = mix(c, a, 0.5);

    ab = normalize(ab);
    bc = normalize(bc);
    ca = normalize(ca);

    dividaTriangulo(pos, nor, a, ab, ca, ndivs - 1);
    dividaTriangulo(pos, nor, b, bc, ab, ndivs - 1);
    dividaTriangulo(pos, nor, c, ca, bc, ndivs - 1);
    dividaTriangulo(pos, nor, ab, bc, ca, ndivs - 1);
  } else {
    let ab = subtract(b, a);
    let ac = subtract(c, a);
    let normal = normalize(cross(ab, ac));

    if (dot(normal, a) < 0) {
      normal = negate(normal);
    }

    pos.push(a);
    nor.push(normal);
    pos.push(b);
    nor.push(normal);
    pos.push(c);
    nor.push(normal);
  }
}

// ========================================================
// Código fonte dos shaders em GLSL
// a primeira linha deve conter "#version 300 es"
// para WebGL 2.0

var gVertexShaderSrc = `#version 300 es

in  vec3 aPosition;
in  vec3 aNormal;

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uPerspective;
uniform mat4 uInverseTranspose;

uniform vec4 uLuzPos;

out vec3 vNormal;
out vec3 vLight;
out vec3 vView;

void main() {
    mat4 modelView = uView * uModel;
    gl_Position = uPerspective * modelView * vec4(aPosition, 1.0);

    // orienta as normais como vistas pela câmera
    vNormal = mat3(uInverseTranspose) * aNormal;
    vec4 pos = modelView * vec4(aPosition, 1.0);

    vLight = (uView * uLuzPos - pos).xyz;
    vView = -(pos.xyz);
}
`;

var gFragmentShaderSrc = `#version 300 es

precision highp float;

in vec3 vNormal;
in vec3 vLight;
in vec3 vView;
out vec4 corSaida;

// cor = produto luz * material
uniform vec4 uCorAmbiente;
uniform vec4 uCorDifusaInd;
uniform vec4 uCorEspecular;
uniform float uAlfaEsp;

void main() {
    vec3 normalV = normalize(vNormal);
    vec3 lightV = normalize(vLight);
    vec3 viewV = normalize(vView);
    vec3 halfV = normalize(lightV + viewV);
  
    // difusao
    float kd = max(0.0, dot(normalV, lightV) );
    vec4 difusao = kd * uCorDifusaInd;

    // especular
    float ks = pow( max(0.0, dot(normalV, halfV)), uAlfaEsp);
    
    vec4 especular = vec4(0.0);
    if (kd > 0.0) {  // parte iluminada
        especular = ks * uCorEspecular;
    }
    corSaida = difusao + especular + uCorAmbiente;    
    corSaida.a = 1.0;
}
`;

function hsv2rgb(h, s, v) {
  let r, g, b;

  let i = Math.floor(h * 6);
  let f = h * 6 - i;
  let p = v * (1 - s);
  let q = v * (1 - f * s);
  let t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
  }

  return [r, g, b];
}
