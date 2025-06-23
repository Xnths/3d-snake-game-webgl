class Esfera extends Objeto {
  constructor(ndivisoes = 2, cor, invertida = false, isDome = false) {
    super(cor);

    this.ndivs = ndivisoes;
    this.invertida = invertida;

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

    this.isDome = isDome;
  }

  init() {
    this.pos = [];
    this.nor = [];
    this.coords = [];

    for (const [a, b, c] of this.triangulosBase) {
      dividaTriangulo(
        this.pos,
        this.nor,
        a,
        b,
        c,
        this.ndivs,
        this.invertida,
        this.coords
      );
    }

    this.np = this.pos.length;

    this.bufPos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(this.pos), gl.STATIC_DRAW);

    this.bufNor = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(this.nor), gl.STATIC_DRAW);

    if (this.temTextura) {
      this.bufTexCoords = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTexCoords);
      gl.bufferData(gl.ARRAY_BUFFER, flatten(this.coords), gl.STATIC_DRAW);
    }
  }
}
