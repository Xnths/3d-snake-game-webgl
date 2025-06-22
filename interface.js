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
      anguloHorizontal = Math.max(anguloHorizontal - CAMERA_STEP, -10);
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
