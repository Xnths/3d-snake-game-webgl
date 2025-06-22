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

function dividaTriangulo(pos, nor, a, b, c, ndivs, invertida) {
  if (ndivs > 0) {
    let ab = mix(a, b, 0.5);
    let bc = mix(b, c, 0.5);
    let ca = mix(c, a, 0.5);

    ab = normalize(ab);
    bc = normalize(bc);
    ca = normalize(ca);

    dividaTriangulo(pos, nor, a, ab, ca, ndivs - 1, invertida);
    dividaTriangulo(pos, nor, b, bc, ab, ndivs - 1, invertida);
    dividaTriangulo(pos, nor, c, ca, bc, ndivs - 1, invertida);
    dividaTriangulo(pos, nor, ab, bc, ca, ndivs - 1, invertida);
  } else {
    let ab = subtract(b, a);
    let ac = subtract(c, a);
    let normal = normalize(cross(ab, ac));

    if (dot(normal, a) < 0) {
      normal = negate(normal);
    }

    if (invertida) {
      normal = negate(normal);
    }

    pos.push(a);
    nor.push(normal);
    pos.push(b);
    nor.push(normal);
    pos.push(c);
    nor.push(normal);
  }
}
