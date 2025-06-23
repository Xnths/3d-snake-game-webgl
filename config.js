var shadowFramebuffer, shadowTexture;

function configureShadowMap() {
  shadowFramebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFramebuffer);

  shadowTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, shadowTexture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.DEPTH_COMPONENT16,
    1024,
    1024,
    0,
    gl.DEPTH_COMPONENT,
    gl.UNSIGNED_SHORT,
    null
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.DEPTH_ATTACHMENT,
    gl.TEXTURE_2D,
    shadowTexture,
    0
  );

  gl.readBuffer(gl.NONE);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function renderSombras() {
  gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFramebuffer);
  gl.viewport(0, 0, 1024, 1024);
  gl.clear(gl.DEPTH_BUFFER_BIT);
  gl.useProgram(gShader.shadowProgram);

  gl.uniformMatrix4fv(
    gl.getUniformLocation(gShader.shadowProgram, "uLightSpaceMatrix"),
    false,
    flatten(gCtx.lightSpaceMatrix)
  );

  for (let obj of gObjs) {
    if (obj.rodando) obj.theta[obj.axis] += 0.5;

    let model = mat4();
    let translacao = translate(obj.centro[0], obj.centro[1], obj.centro[2]);
    let escala = scale(obj.raioX, obj.raioY, obj.raioZ);
    let rotX = rotate(-obj.theta[EIXO_X_IND], EIXO_X);
    let rotY = rotate(-obj.theta[EIXO_Y_IND], EIXO_Y);
    let rotZ = rotate(-obj.theta[EIXO_Z_IND], EIXO_Z);

    model = mult(model, translacao);
    model = mult(model, escala);
    model = mult(model, rotX);
    model = mult(model, rotY);
    model = mult(model, rotZ);

    gl.uniformMatrix4fv(
      gl.getUniformLocation(gShader.shadowProgram, "uModel"),
      false,
      flatten(model)
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, obj.bufPos);
    let aPosition = gl.getAttribLocation(gShader.shadowProgram, "aPosition");
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    gl.uniform1f(
      gl.getUniformLocation(gShader.shadowProgram, "uOpacidade"),
      obj.opacidade
    );

    gl.drawArrays(gl.TRIANGLES, 0, obj.pos.length);
  }

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, gCanvas.width, gCanvas.height);
}

function render() {
  if (!animando && !umPasso) return;

  renderSombras();

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(gShader.program);

  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, shadowTexture);
  gl.uniform1i(gShader.uShadowMap, 1);
  gl.uniformMatrix4fv(
    gShader.uLightSpaceMatrix,
    false,
    flatten(gCtx.lightSpaceMatrix)
  );

  let novosObjs = [];

  for (let obj of gObjs) {
    if (obj.rodando) obj.theta[obj.axis] += 0.5;
    let isSky = obj.isDome ? true : false;

    if (obj.opacidade != 1.0) {
      gl.depthMask(false);
    } else {
      gl.depthMask(true);
    }

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.uniform1i(gl.getUniformLocation(gShader.program, "uIsSkyDome"), isSky);

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

    const locTex = gl.getAttribLocation(gShader.program, "aTexCoord");

    gl.uniform1i(
      gl.getUniformLocation(gShader.program, "uTemTextura"),
      obj.temTextura
    );

    if (obj.temTextura) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, obj.texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
      gl.uniform1i(gl.getUniformLocation(gShader.program, "uSampler"), 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, obj.bufTexCoords);
      gl.vertexAttribPointer(locTex, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(locTex);
    } else {
      gl.uniform4fv(gl.getUniformLocation(gShader.program, "uCor"), obj.cor);
      gl.disableVertexAttribArray(locTex);
    }

    let uOpacidade = gl.getUniformLocation(gShader.program, "uOpacidade");
    gl.uniform1f(uOpacidade, obj.opacidade);

    let model = mat4();
    let translacao = translate(obj.centro[0], obj.centro[1], obj.centro[2]);
    let escala = scale(obj.raioX, obj.raioY, obj.raioZ);
    let rotX = rotate(-obj.theta[EIXO_X_IND], EIXO_X);
    let rotY = rotate(-obj.theta[EIXO_Y_IND], EIXO_Y);
    let rotZ = rotate(-obj.theta[EIXO_Z_IND], EIXO_Z);

    model = mult(model, translacao);
    model = mult(model, escala);
    model = mult(model, rotX);
    model = mult(model, rotY);
    model = mult(model, rotZ);

    let modelView = mult(gCtx.view, model);
    let modelViewInv = inverse(modelView);
    let modelViewInvTrans = transpose(modelViewInv);

    gl.uniformMatrix4fv(gShader.uModel, false, flatten(model));
    gl.uniformMatrix4fv(
      gShader.uInverseTranspose,
      false,
      flatten(modelViewInvTrans)
    );

    gl.drawArrays(gl.TRIANGLES, 0, obj.pos.length);
    novosObjs.push(obj);
  }

  gObjs = novosObjs;

  if (umPasso) {
    umPasso = false;
  } else {
    window.requestAnimationFrame(render);
  }
}

function crieShaders() {
  gShader.program = makeProgram(gl, gVertexShaderSrc, gFragmentShaderSrc);
  gShader.shadowProgram = makeProgram(
    gl,
    shadowVertexShaderSrc,
    shadowFragmentShaderSrc
  );

  gl.useProgram(gShader.program);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.POLYGON_OFFSET_FILL);
  gl.polygonOffset(1.0, 1.0);

  gShader.uModel = gl.getUniformLocation(gShader.program, "uModel");
  gShader.uView = gl.getUniformLocation(gShader.program, "uView");
  gShader.uPerspective = gl.getUniformLocation(gShader.program, "uPerspective");
  gShader.uInverseTranspose = gl.getUniformLocation(
    gShader.program,
    "uInverseTranspose"
  );

  gShader.uShadowMap = gl.getUniformLocation(gShader.program, "uShadowMap");
  gShader.uLightSpaceMatrix = gl.getUniformLocation(
    gShader.program,
    "uLightSpaceMatrix"
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
  gl.disable(gl.CULL_FACE);

  gCtx.lightView = lookAt(vec3(LUZ.pos[0], LUZ.pos[1], LUZ.pos[2]), at, up);
  gCtx.lightProj = ortho(-20, 20, -20, 20, 1.0, 100.0);
  gCtx.lightSpaceMatrix = mult(gCtx.lightProj, gCtx.lightView);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

var shadowVertexShaderSrc = `#version 300 es
in vec3 aPosition;
uniform mat4 uModel;
uniform mat4 uLightSpaceMatrix;
void main() {
  gl_Position = uLightSpaceMatrix * uModel * vec4(aPosition, 1.0);
}`;

var shadowFragmentShaderSrc = `#version 300 es
precision highp float;
uniform float uOpacidade;
void main() {
  float transparencia = clamp(uOpacidade, 0.0, 1.0);
  gl_FragDepth = gl_FragCoord.z + (1.0 - transparencia) * 0.01;
}`;

var gVertexShaderSrc = `#version 300 es
in vec3 aPosition;
in vec3 aNormal;
in vec2 aTexCoord;

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uPerspective;
uniform mat4 uInverseTranspose;
uniform vec4 uLuzPos;
uniform mat4 uLightSpaceMatrix;

out vec3 vNormal;
out vec3 vLight;
out vec3 vView;
out vec2 vTexCoord;
out vec4 vShadowCoord;

void main() {
  mat4 modelView = uView * uModel;
  gl_Position = uPerspective * modelView * vec4(aPosition, 1.0);

  vNormal = mat3(uInverseTranspose) * aNormal;
  vec4 pos = modelView * vec4(aPosition, 1.0);
  vLight = (uView * uLuzPos - pos).xyz;
  vView = -(pos.xyz);
  vTexCoord = aTexCoord;
  vShadowCoord = uLightSpaceMatrix * uModel * vec4(aPosition, 1.0);
}`;

var gFragmentShaderSrc = `#version 300 es
precision highp float;

in vec3 vNormal;
in vec3 vLight;
in vec3 vView;
in vec2 vTexCoord;
in vec4 vShadowCoord;
out vec4 corSaida;

uniform vec4 uCorAmbiente;
uniform vec4 uCorDifusaInd;
uniform sampler2D uSampler;
uniform bool uTemTextura;
uniform vec4 uCorEspecular;
uniform float uAlfaEsp;
uniform sampler2D uShadowMap;
uniform bool uIsSkyDome;
uniform float uOpacidade;

float sombra(vec4 shadowCoord) {
  vec3 projCoords = shadowCoord.xyz / shadowCoord.w;
  projCoords = projCoords * 0.5 + 0.5;

  if (projCoords.z > 1.0) return 1.0; // fora do range

  float bias = 0.005;
  float vis = 0.0;
  float texelSize = 1.0 / 1024.0; // tamanho de texel do shadow map

  for (int x = -1; x <= 1; ++x) {
    for (int y = -1; y <= 1; ++y) {
      float pcfDepth = texture(uShadowMap, projCoords.xy + vec2(x, y) * texelSize).r;
      vis += projCoords.z - bias > pcfDepth ? 0.0 : 1.0;
    }
  }

  vis /= 9.0; // média das 9 amostras
  return vis;
}

void main() {
  if (uIsSkyDome) {
    vec4 texColor = texture(uSampler, vTexCoord);
    corSaida = vec4(texColor.rgb, 1.0);
  } else {
    vec3 normalV = normalize(vNormal);
    vec3 lightV = normalize(vLight);
    vec3 viewV = normalize(vView);
    vec3 halfV = normalize(lightV + viewV);

    float kd = max(0.0, dot(normalV, lightV));
    vec4 difusao = kd * uCorDifusaInd;

    float ks = pow(max(0.0, dot(normalV, halfV)), uAlfaEsp);
    vec4 especular = vec4(0.0);
    if (kd > 0.0) {
      especular = ks * uCorEspecular;
    }
    vec4 texColor = texture(uSampler, vTexCoord);
    vec4 corFinal = uTemTextura ? texColor : uCorDifusaInd;

    float vis = sombra(vShadowCoord);
    corFinal.a *= uOpacidade;
    corSaida = (corFinal * kd + especular) * vis + uCorAmbiente;
    corSaida.a = corFinal.a;
  }
}`;
