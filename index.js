window.onload = main;

const corAreia = vec4(0.2, 0.87, 0.7, 1.0);

function main() {
  gCanvas = document.getElementById("glcanvas");
  gl = gCanvas.getContext("webgl2");
  if (!gl) alert("Vixe! Não achei WebGL 2.0 aqui :-(");

  crieInterface();
  crieBoard();

  addPlayer();
  addFruit();
  criaChao(3, -0.7, corAreia);

  gl.viewport(0, 0, gCanvas.width, gCanvas.height);
  gl.clearColor(FUNDO[0], FUNDO[1], FUNDO[2], FUNDO[3]);
  gl.enable(gl.DEPTH_TEST);

  crieShaders();
  render();
}

function criaChao(tamanho = 3, z = 0, cor) {
  const meio = tamanho / 2;

  const vertices = [
    vec3(-meio, -meio, z),
    vec3(-meio, meio, z),
    vec3(meio, meio, z),

    vec3(-meio, -meio, z),
    vec3(meio, meio, z),
    vec3(meio, -meio, z),
  ];

  const normais = [
    vec3(0, 0, 1),
    vec3(0, 0, 1),
    vec3(0, 0, 1),

    vec3(0, 0, 1),
    vec3(0, 0, 1),
    vec3(0, 0, 1),
  ];

  const plano = {
    pos: flatten(vertices),
    nor: flatten(normais),
    cor: cor,
    centro: vec3(0, 0, 0),
    theta: vec3(0, 0, 0),
    axis: EIXO_Z_IND,
    rodando: false,
    raioX: 1.0,
    raioY: 1.0,
    raioZ: 1.0,
  };

  plano.bufPos = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, plano.bufPos);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

  plano.bufNor = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, plano.bufNor);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(normais), gl.STATIC_DRAW);

  gObjs.push(plano);
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
        if (board[i][j][k] > 0) {
          board[i][j][k]--;
        }
      }
    }
  }
  desenhaPlayer();
}

function desenhaPlayer() {
  gObjs = [gObjs[0], gObjs[1], gObjs[2]];

  const hue = 0.4;
  const sat = 1.0;
  const val = 0.4;

  let ndivs = 2;
  let cor = vec4(...hsv2rgb(hue, sat, val), 1.0);

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) {
        if (board[i][j][k] > 0 && board[i][j][k] != playerSize) {
          const esfera = new Esfera(ndivs, cor);
          esfera.init();
          esfera.centro = vec3((k - 1) * -0.45, (j - 1) * 0.45, (i - 1) * 0.45);

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
  const val = 1.0;

  let ndivs = 2;
  let cor = vec4(...hsv2rgb(hue, sat, val), 1.0);
  const esfera = new Esfera(ndivs, cor);
  esfera.init();
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
  const limit = BOARD_SLOTS - 1;
  const middle = Math.floor(BOARD_SLOTS / 2);
  let x = Math.floor(Math.random() * limit);
  let y = Math.floor(Math.random() * limit);
  let z = Math.floor(Math.random() * limit);
  z = 1;

  if (x == middle && y == middle && z == middle) {
    board[z][x - 1][y] = -1;
    x = x - 1;
  } else {
    board[z][x][y] = -1;
  }

  console.log(x, y, 1);
  console.log(x - middle, y - middle, 1);

  printBoard();

  const hue = 328 / 360;
  const sat = 1.0;
  const val = 1.0;

  let ndivs = 2;
  let cor = vec4(...hsv2rgb(hue, sat, val), 1.0);
  fruit = new Esfera(ndivs, cor);
  fruit.init();
  fruit.centro = vec3((y - 1) * -0.45, (x - 1) * 0.45, (z - 1) * 0.45);

  fruit.theta = vec3(0, 0, 0);
  fruit.raio = 0.2;
  fruit.raioX = 0.2;
  fruit.raioY = 0.2;
  fruit.raioZ = 0.2;

  gObjs.push(fruit);
}

function moveFruta() {
  console.log("moveu");
  const limit = BOARD_SLOTS - 1;
  let x = Math.floor(Math.random() * limit);
  let y = Math.floor(Math.random() * limit);
  let z = Math.floor(Math.random() * limit);

  while (board[z][x][y] > 0) {
    x = Math.floor(Math.random() * limit);
    y = Math.floor(Math.random() * limit);
    z = Math.floor(Math.random() * limit);
  }

  board[z][x][y] = -1;

  console.log(z, x, y);

  fruit.centro = vec3((y - 1) * -0.45, (x - 1) * 0.45, (z - 1) * 0.45);
}

class Esfera {
  constructor(ndivisoes = 2, cor) {
    this.np = 0;
    this.pos = [];
    this.nor = [];
    this.centro = vec3(0.0, 0.0, 0.0);
    this.velocidade = vec3(0, 0, 0);
    this.raio = 0.2;
    this.raioX = this.raio;
    this.raioY = this.raio;
    this.raioZ = this.raio;
    this.ndivs = ndivisoes;

    this.cor = cor;
    this.rodando = false;
    this.bufPos = null;
    this.bufNor = null;

    this.triangulosBase = [
      [BALAO_CANTOS[0], BALAO_CANTOS[1], BALAO_CANTOS[2]],
      [BALAO_CANTOS[0], BALAO_CANTOS[1], BALAO_CANTOS[5]],
      [BALAO_CANTOS[0], BALAO_CANTOS[4], BALAO_CANTOS[2]],
      [BALAO_CANTOS[0], BALAO_CANTOS[4], BALAO_CANTOS[5]],
      [BALAO_CANTOS[3], BALAO_CANTOS[1], BALAO_CANTOS[2]],
      [BALAO_CANTOS[3], BALAO_CANTOS[1], BALAO_CANTOS[5]],
      [BALAO_CANTOS[3], BALAO_CANTOS[4], BALAO_CANTOS[2]],
      [BALAO_CANTOS[3], BALAO_CANTOS[4], BALAO_CANTOS[5]],
    ];
  }

  init() {
    this.pos = [];
    this.nor = [];

    for (const [a, b, c] of this.triangulosBase) {
      dividaTriangulo(this.pos, this.nor, a, b, c, this.ndivs);
    }

    this.np = this.pos.length;

    this.bufPos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(this.pos), gl.STATIC_DRAW);

    this.bufNor = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(this.nor), gl.STATIC_DRAW);
  }

  escala(escala) {
    this.raioX = escala[0];
    this.raioY = escala[1];
    this.raioZ = escala[2];
  }
}
