class Objeto {
  constructor(cor) {
    this.np = 0;
    this.pos = [];
    this.nor = [];
    this.coords = [];
    this.centro = vec3(0.0, 0.0, 0.0);
    this.velocidade = vec3(0, 0, 0);
    this.raio = 0.2;
    this.raioX = this.raio;
    this.raioY = this.raio;
    this.raioZ = this.raio;

    this.temTextura = false;
    this.bufTexCoords = gl.createBuffer();
    this.texture;

    this.cor = cor;
    this.rodando = false;
    this.bufPos = null;
    this.bufNor = null;
  }

  escala(escala) {
    this.raioX = escala[0];
    this.raioY = escala[1];
    this.raioZ = escala[2];
  }
}
