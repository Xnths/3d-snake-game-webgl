window.onload = main;

function main() {
  gCanvas = document.getElementById("glcanvas");
  gl = gCanvas.getContext("webgl2");
  if (!gl) alert("Vixe! Não achei WebGL 2.0 aqui :-(");

  crieInterface();
  crieBoard();

  addPlayer();
  addFruit();
  criaChao();
  criaSkyDome();

  gl.viewport(0, 0, gCanvas.width, gCanvas.height);
  gl.clearColor(FUNDO[0], FUNDO[1], FUNDO[2], FUNDO[3]);
  gl.enable(gl.DEPTH_TEST);

  crieShaders();
  configureShadowMap();
  renderSombras();
  render();
}

function criaSkyDome() {
  const hue = 0.61;
  const sat = 0.7;
  const val = 0.8;

  let ndivs = 6;
  let cor = vec4(...hsv2rgb(hue, sat, val), 1.0);

  const esfera = new Esfera(ndivs, cor, true, true);
  esfera.temTextura = true;
  esfera.texture = createTexture("./horizon.png");

  esfera.init();
  esfera.centro = vec3(0, 0, -0.9);

  esfera.theta = vec3(0, 0, 0);
  esfera.axis = EIXO_Y_IND;
  esfera.raio = 4;
  esfera.raioX = 4;
  esfera.raioY = 4;
  esfera.raioZ = 4;

  gObjs.push(esfera);
}

function criaChao() {
  let tamanho = 80;
  let z = -0.7;
  let cor = corAreia;

  const plano = new Plano(tamanho, z, cor);
  plano.init();
  plano.addTexture("sand.jpg");
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
  gObjs = gObjs.slice(0, 4);

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

  fruit.rodando = true;
  fruit.theta = vec3(0, 0, 0);
  fruit.axis = EIXO_Z_IND;
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
