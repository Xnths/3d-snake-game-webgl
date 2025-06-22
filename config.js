function crieInterface() {
  document.getElementById("bRun").onclick = function () {
    if (!animando) {
      animando = true;
      render();
    } else {
      animando = false;
    }
  };

  document.getElementById("bStep").onclick = function () {
    if (!animando) {
      umPasso = true;
      render();
    }
  };

  let anguloHorizontal = 0;
  let anguloVertical = 45;

  document.addEventListener("keydown", (event) => {
    const tecla = event.key;
    const player = gObjs[0];
    const passo = 0.4;
    const padding = 0.05;

    if (tecla === "w") {
      if (iX < BOARD_SLOTS - 1) {
        pX--;
        iX++;
        let hitFruit = board[pZ][pX][pY] == -1;

        if (board[pZ][pX][pY] > 0) {
          pX++;
          iX--;
          return;
        }

        if (hitFruit) playerSize++;

        player.centro[1] -= passo + padding;

        atualizaBoard();
        board[pZ][pX][pY] = playerSize;
        if (hitFruit) moveFruta();
      }
    } else if (tecla === "s") {
      if (iX > 0) {
        pX++;
        iX--;

        let hitFruit = board[pZ][pX][pY] == -1;

        if (board[pZ][pX][pY] > 0) {
          pX--;
          iX++;
          return;
        }

        if (board[pZ][pX][pY] == -1) playerSize++;

        player.centro[1] += passo + padding;

        atualizaBoard();
        board[pZ][pX][pY] = playerSize;
        if (hitFruit) moveFruta();
      }
    } else if (tecla === "a") {
      if (iY > 0) {
        pY--;
        iY--;
        let hitFruit = board[pZ][pX][pY] == -1;

        if (hitFruit) playerSize++;

        if (board[pZ][pX][pY] > 0) {
          pY++;
          iY++;
          return;
        }

        player.centro[0] += passo + padding;

        atualizaBoard();
        board[pZ][pX][pY] = playerSize;
        if (hitFruit) moveFruta();
      }
    } else if (tecla === "d") {
      if (iY < BOARD_SLOTS - 1) {
        pY++;
        iY++;

        let hitFruit = board[pZ][pX][pY] == -1;

        if (board[pZ][pX][pY] > 0) {
          pY--;
          iY--;
          return;
        }

        if (hitFruit) playerSize++;

        player.centro[0] -= passo + padding;

        atualizaBoard();
        board[pZ][pX][pY] = playerSize;
        if (hitFruit) moveFruta();
      }
    } else if (tecla === "e") {
      if (iZ < BOARD_SLOTS - 1) {
        pZ++;
        iZ++;

        let hitFruit = board[pZ][pX][pY] == -1;

        if (board[pZ][pX][pY] > 0) {
          pZ--;
          iZ--;
          return;
        }

        if (hitFruit) playerSize++;

        player.centro[2] += passo + padding;

        atualizaBoard();
        board[pZ][pX][pY] = playerSize;
        if (hitFruit) moveFruta();
      }
    } else if (tecla === "c") {
      if (iZ > 0) {
        pZ--;
        iZ--;

        let hitFruit = board[pZ][pX][pY] == -1;

        if (board[pZ][pX][pY] > 0) {
          pZ++;
          iZ++;
          return;
        }

        if (hitFruit) playerSize++;

        player.centro[2] -= passo + padding;

        atualizaBoard();
        board[pZ][pX][pY] = playerSize;
        if (hitFruit) moveFruta();
      }
    } else if (tecla === "ArrowDown") {
      anguloHorizontal = Math.max(anguloHorizontal - CAMERA_STEP, -89);
    } else if (tecla === "ArrowUp") {
      anguloHorizontal = Math.min(anguloHorizontal + CAMERA_STEP, 89);
    } else if (tecla === "ArrowRight") {
      anguloVertical += CAMERA_STEP;
    } else if (tecla === "ArrowLeft") {
      anguloVertical -= CAMERA_STEP;
    } else {
      return;
    }

    const theta = radians(anguloVertical);
    const phi = radians(90 - anguloHorizontal);

    const x = CAMERA_RAIO * Math.sin(phi) * Math.cos(theta);
    const y = CAMERA_RAIO * Math.sin(phi) * Math.sin(theta);
    const z = CAMERA_RAIO * Math.cos(phi);

    const novoEye = vec3(x, y, z);
    gCtx.view = lookAt(novoEye, at, up);
    gl.uniformMatrix4fv(gShader.uView, false, flatten(gCtx.view));

    printBoard();

    if (!animando) render();
  });
}

function crieShaders() {
  gShader.program = makeProgram(gl, gVertexShaderSrc, gFragmentShaderSrc);
  gl.useProgram(gShader.program);

  var bufNormais = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufNormais);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(gObjs[0].nor), gl.STATIC_DRAW);

  var aNormal = gl.getAttribLocation(gShader.program, "aNormal");
  gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aNormal);

  var bufVertices = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufVertices);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(gObjs[0].pos), gl.STATIC_DRAW);

  var aPosition = gl.getAttribLocation(gShader.program, "aPosition");
  gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aPosition);

  gShader.uModel = gl.getUniformLocation(gShader.program, "uModel");
  gShader.uView = gl.getUniformLocation(gShader.program, "uView");
  gShader.uPerspective = gl.getUniformLocation(gShader.program, "uPerspective");
  gShader.uInverseTranspose = gl.getUniformLocation(
    gShader.program,
    "uInverseTranspose"
  );

  gCtx.perspective = perspective(FOVY, ASPECT, NEAR, FAR);
  gl.uniformMatrix4fv(gShader.uPerspective, false, flatten(gCtx.perspective));

  gCtx.view = lookAt(eye, at, up);
  gl.uniformMatrix4fv(gShader.uView, false, flatten(gCtx.view));

  gShader.uLuzPos = gl.getUniformLocation(gShader.program, "uLuzPos");
  gl.uniform4fv(gShader.uLuzPos, LUZ.pos);

  gShader.uCorAmb = gl.getUniformLocation(gShader.program, "uCorAmbiente");
  gShader.uCorDif = gl.getUniformLocation(gShader.program, "uCorDifusao");
  gShader.uCorEsp = gl.getUniformLocation(gShader.program, "uCorEspecular");
  gShader.uAlfaEsp = gl.getUniformLocation(gShader.program, "uAlfaEsp");

  gl.uniform4fv(gShader.uCorAmb, mult(LUZ.amb, MAT.amb));
  gShader.uCorDifusaInd = gl.getUniformLocation(
    gShader.program,
    "uCorDifusaInd"
  );
  gl.uniform4fv(gShader.uCorEsp, LUZ.esp);
  gl.uniform1f(gShader.uAlfaEsp, MAT.alfa);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function render() {
  if (!animando && !umPasso) {
    return;
  }

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  let novosObjs = [];

  for (let obj of gObjs) {
    const corDifusa = mult(LUZ.dif, obj.cor);
    gl.uniform4fv(gShader.uCorDifusaInd, corDifusa);
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.bufPos);
    let aPosition = gl.getAttribLocation(gShader.program, "aPosition");
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, obj.bufNor);
    let aNormal = gl.getAttribLocation(gShader.program, "aNormal");
    gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aNormal);

    if (obj.rodando) obj.theta[obj.axis] += 0.5;

    novosObjs.push(obj);

    let model = mat4();

    let translacao = mat4();
    translacao[0][3] = obj.centro[0];
    translacao[1][3] = obj.centro[1];
    translacao[2][3] = obj.centro[2];

    let escala = mat4();
    escala[0][0] = obj.raioX;
    escala[1][1] = obj.raioY;
    escala[2][2] = obj.raioZ;

    model = mult(model, translacao);
    model = mult(model, escala);

    model = mult(model, rotate(-obj.theta[EIXO_X_IND], EIXO_X));
    model = mult(model, rotate(-obj.theta[EIXO_Y_IND], EIXO_Y));
    model = mult(model, rotate(-obj.theta[EIXO_Z_IND], EIXO_Z));

    let modelView = mult(gCtx.view, model);
    let modelViewInv = inverse(modelView);
    let modelViewInvTrans = transpose(modelViewInv);

    gl.uniformMatrix4fv(gShader.uModel, false, flatten(model));
    gl.uniformMatrix4fv(
      gShader.uInverseTranspose,
      false,
      flatten(modelViewInvTrans)
    );

    gl.drawArrays(
      gl.TRIANGLES,
      0,
      gObjs.reduce((soma, obj) => soma + obj.pos.length, 0)
    );
  }

  gObjs = novosObjs;

  if (umPasso) {
    umPasso = false;
  } else {
    window.requestAnimationFrame(render);
  }
}

// ========================================================
// Código fonte dos shaders em GLSL
// a primeira linha deve conter "#version 300 es"
// para WebGL 2.0

var gVertexShaderSrc = `#version 300 es

in  vec3 aPosition;
in  vec3 aNormal;

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uPerspective;
uniform mat4 uInverseTranspose;

uniform vec4 uLuzPos;

out vec3 vNormal;
out vec3 vLight;
out vec3 vView;

void main() {
    mat4 modelView = uView * uModel;
    gl_Position = uPerspective * modelView * vec4(aPosition, 1.0);

    // orienta as normais como vistas pela câmera
    vNormal = mat3(uInverseTranspose) * aNormal;
    vec4 pos = modelView * vec4(aPosition, 1.0);

    vLight = (uView * uLuzPos - pos).xyz;
    vView = -(pos.xyz);
}
`;

var gFragmentShaderSrc = `#version 300 es

precision highp float;

in vec3 vNormal;
in vec3 vLight;
in vec3 vView;
out vec4 corSaida;

// cor = produto luz * material
uniform vec4 uCorAmbiente;
uniform vec4 uCorDifusaInd;
uniform vec4 uCorEspecular;
uniform float uAlfaEsp;

void main() {
    vec3 normalV = normalize(vNormal);
    vec3 lightV = normalize(vLight);
    vec3 viewV = normalize(vView);
    vec3 halfV = normalize(lightV + viewV);
  
    // difusao
    float kd = max(0.0, dot(normalV, lightV) );
    vec4 difusao = kd * uCorDifusaInd;

    // especular
    float ks = pow(max(0.0, dot(normalV, halfV)), uAlfaEsp);
    
    vec4 especular = vec4(0.0);
    if (kd > 0.0) {  // parte iluminada
        especular = ks * uCorEspecular;
    }
    corSaida = difusao + especular + uCorAmbiente;    
    corSaida.a = 1.0;
}
`;
