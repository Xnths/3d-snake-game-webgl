function printBoard() {
  console.log("=====================================");
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let linha = "";
      for (let k = 0; k < 3; k++) {
        linha += " " + board[i][j][k];
      }
      console.log(linha);
    }
    if (i < 2) {
      console.log("-----");
    }
  }
  console.log("=====================================");
}

function hsv2rgb(h, s, v) {
  let r, g, b;

  let i = Math.floor(h * 6);
  let f = h * 6 - i;
  let p = v * (1 - s);
  let q = v * (1 - f * s);
  let t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
  }

  return [r, g, b];
}

function dividaTriangulo(pos, nor, a, b, c, ndivs, invertida, coords) {
  if (ndivs > 0) {
    let ab = normalize(mix(a, b, 0.5));
    let bc = normalize(mix(b, c, 0.5));
    let ca = normalize(mix(c, a, 0.5));

    dividaTriangulo(pos, nor, a, ab, ca, ndivs - 1, invertida, coords);
    dividaTriangulo(pos, nor, b, bc, ab, ndivs - 1, invertida, coords);
    dividaTriangulo(pos, nor, c, ca, bc, ndivs - 1, invertida, coords);
    dividaTriangulo(pos, nor, ab, bc, ca, ndivs - 1, invertida, coords);
  } else {
    let ab = subtract(b, a);
    let ac = subtract(c, a);
    let normal = normalize(cross(ab, ac));

    if (dot(normal, a) < 0) normal = negate(normal);
    if (invertida) normal = negate(normal);

    pos.push(a);
    nor.push(normal);
    coords.push(texCoordEsferica(a));

    pos.push(b);
    nor.push(normal);
    coords.push(texCoordEsferica(b));

    pos.push(c);
    nor.push(normal);
    coords.push(texCoordEsferica(c));
  }
}

function createTexture(url) {
  const texture = gl.createTexture();
  const image = new Image();
  image.onload = function () {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
  };
  image.src = url;
  return texture;
}

function texCoordEsferica(p) {
  let [x, y, z] = normalize(p);
  let u = 0.5 + Math.atan2(x, y) / (2 * Math.PI);
  let v = 0.5 - Math.asin(z) / Math.PI;
  return [u, v];
}

function texCoordFisheye(p) {
  let [x, y, z] = normalize(p);

  let theta = Math.atan2(y, x);

  let r = Math.acos(z) / Math.PI;

  let u = 0.5 + r * Math.cos(theta);
  let v = 0.5 + r * Math.sin(theta);

  return [u, v];
}
