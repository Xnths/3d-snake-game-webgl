class Cubo extends Objeto {
  constructor(cor) {
    super(cor);
  }

  init() {
    this.pos = [];
    this.nor = [];
    this.coords = [];

    const vertices = [
      vec3(-0.5, -0.5, 0.5),
      vec3(0.5, -0.5, 0.5),
      vec3(0.5, 0.5, 0.5),
      vec3(-0.5, 0.5, 0.5),
      vec3(-0.5, -0.5, -0.5),
      vec3(0.5, -0.5, -0.5),
      vec3(0.5, 0.5, -0.5),
      vec3(-0.5, 0.5, -0.5),
    ];

    const faces = [
      [0, 1, 2, 3], // frente
      [1, 5, 6, 2], // direita
      [5, 4, 7, 6], // trás
      [4, 0, 3, 7], // esquerda
      [3, 2, 6, 7], // topo
      [4, 5, 1, 0], // base
    ];

    const normais = [
      vec3(0, 0, 1),
      vec3(1, 0, 0),
      vec3(0, 0, -1),
      vec3(-1, 0, 0),
      vec3(0, 1, 0),
      vec3(0, -1, 0),
    ];

    const texCoords = [vec2(0, 0), vec2(1, 0), vec2(1, 1), vec2(0, 1)];

    for (let i = 0; i < 6; i++) {
      const [a, b, c, d] = faces[i];
      const normal = normais[i];

      this.pos.push(vertices[a], vertices[b], vertices[c]);
      this.pos.push(vertices[a], vertices[c], vertices[d]);

      this.nor.push(normal, normal, normal);
      this.nor.push(normal, normal, normal);

      this.coords.push(texCoords[0], texCoords[1], texCoords[2]);
      this.coords.push(texCoords[0], texCoords[2], texCoords[3]);
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
