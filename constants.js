"use strict";

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

var board;
var playerSize = 1;
let fruit;
const middle = Math.floor(BOARD_SLOTS / 2);

// Posição do jogador na horizontal
let iX = middle;
let iY = middle;
let iZ = middle;

// Localização do jogador em relação ao tabuleiro
let pX = middle;
let pY = middle;
let pZ = middle;

const corAreia = vec4(0.2, 0.87, 0.7, 1.0);
