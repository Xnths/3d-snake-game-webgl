class Cilindro extends Objeto {
  constructor(nLados = 20, nAltura = 1, cor, invertida = false) {
    super(cor);

    this.raio = 0.2;
    this.altura = 0.4;
    this.raioX = this.raio;
    this.raioY = this.altura;
    this.raioZ = this.raio;
    this.nLados = nLados;
    this.nAltura = nAltura;
    this.invertida = invertida;
  }

  init() {
    this.pos = [];
    this.nor = [];

    const angStep = (2 * Math.PI) / this.nLados;

    for (let i = 0; i < this.nLados; i++) {
      const theta0 = i * angStep;
      const theta1 = (i + 1) * angStep;

      for (let j = 0; j < this.nAltura; j++) {
        const h0 = j / this.nAltura;
        const h1 = (j + 1) / this.nAltura;

        const x0 = Math.cos(theta0);
        const z0 = Math.sin(theta0);
        const x1 = Math.cos(theta1);
        const z1 = Math.sin(theta1);

        const v00 = vec3(x0, h0 - 0.5, z0);
        const v10 = vec3(x1, h0 - 0.5, z1);
        const v01 = vec3(x0, h1 - 0.5, z0);
        const v11 = vec3(x1, h1 - 0.5, z1);

        const normal0 = vec3(x0, 0, z0);
        const normal1 = vec3(x1, 0, z1);

        this.pos.push(v00, v10, v11);
        this.nor.push(normal0, normal1, normal1);

        this.pos.push(v00, v11, v01);
        this.nor.push(normal0, normal1, normal0);
      }
    }

    const centroInf = vec3(0, -0.5, 0);
    for (let i = 0; i < this.nLados; i++) {
      const theta0 = i * angStep;
      const theta1 = (i + 1) * angStep;
      const p0 = vec3(Math.cos(theta0), -0.5, Math.sin(theta0));
      const p1 = vec3(Math.cos(theta1), -0.5, Math.sin(theta1));
      const normal = vec3(0, -1, 0);

      this.pos.push(centroInf, p0, p1);
      this.nor.push(normal, normal, normal);
    }

    const centroSup = vec3(0, 0.5, 0);
    for (let i = 0; i < this.nLados; i++) {
      const theta0 = i * angStep;
      const theta1 = (i + 1) * angStep;
      const p0 = vec3(Math.cos(theta0), 0.5, Math.sin(theta0));
      const p1 = vec3(Math.cos(theta1), 0.5, Math.sin(theta1));
      const normal = vec3(0, 1, 0);

      this.pos.push(centroSup, p1, p0);
      this.nor.push(normal, normal, normal);
    }

    this.np = this.pos.length;

    this.bufPos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(this.pos), gl.STATIC_DRAW);

    this.bufNor = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(this.nor), gl.STATIC_DRAW);
  }
}
