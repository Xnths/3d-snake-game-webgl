class Esfera {
  constructor(ndivisoes = 2, cor, invertida = false) {
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
    this.invertida = invertida;

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
      dividaTriangulo(this.pos, this.nor, a, b, c, this.ndivs, this.invertida);
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
