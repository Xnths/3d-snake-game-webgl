window.onload = main;

function main() {
  gCanvas = document.getElementById("glcanvas");
  gl = gCanvas.getContext("webgl2");
  if (!gl) alert("Vixe! Não achei WebGL 2.0 aqui :-(");

  crieInterface();
  crieBoard();

  addPlayer();
  addFruit();
  criaChao(8, -0.7, corAreia);
  criaSkyDome();

  gl.viewport(0, 0, gCanvas.width, gCanvas.height);
  gl.clearColor(FUNDO[0], FUNDO[1], FUNDO[2], FUNDO[3]);
  gl.enable(gl.DEPTH_TEST);

  crieShaders();
  render();
}

function criaSkyDome() {
  const hue = 0.61;
  const sat = 0.7;
  const val = 0.8;

  let ndivs = 5;
  let cor = vec4(...hsv2rgb(hue, sat, val), 1.0);
  const esfera = new Esfera(ndivs, cor, true);
  esfera.init();
  esfera.centro = vec3(0, 0, 0);

  esfera.theta = vec3(0, 0, 0);
  esfera.axis = EIXO_Y_IND;
  esfera.raio = 4;
  esfera.raioX = 4;
  esfera.raioY = 4;
  esfera.raioZ = 4;

  gObjs.push(esfera);
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
  gObjs = [gObjs[0], gObjs[1], gObjs[2], gObjs[3]];

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
