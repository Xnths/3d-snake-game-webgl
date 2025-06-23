class Plano extends Objeto {
  constructor(tamanho, z, cor) {
    super(cor);
    this.tamanho = tamanho;
    this.z = z;
    this.temTextura = false;
    this.texture;
  }

  init() {
    const meio = this.tamanho / 2;
    this.centro = vec3(0, 0, this.z);

    const vertices = [
      vec3(-meio, -meio, this.z),
      vec3(-meio, meio, this.z),
      vec3(meio, meio, this.z),

      vec3(-meio, -meio, this.z),
      vec3(meio, meio, this.z),
      vec3(meio, -meio, this.z),
    ];

    const uvs = [
      vec2(0, 0),
      vec2(0, 4),
      vec2(4, 4),

      vec2(0, 0),
      vec2(4, 4),
      vec2(4, 0),
    ];

    const normais = Array(6).fill(vec3(0, 0, 1));

    this.pos = vertices;
    this.nor = normais;
    this.texCoord = uvs;
    this.np = this.pos.length;

    this.bufPos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(this.pos), gl.STATIC_DRAW);

    this.bufNor = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(this.nor), gl.STATIC_DRAW);

    this.bufTexCoords = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTexCoords);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(this.texCoord), gl.STATIC_DRAW);
  }
}
