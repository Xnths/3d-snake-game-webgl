# 3d-snake-game-webgl

## Introdução

Inspirado pelo famoso jogo Snake dos celulares Nokia, 3D Snake Game implementa-o com regras tridimensionais. Dessa forma, o jogador deve vencer em todos os planos para vencer o jogo.

O objetivo do projeto não é investigar as implicações do jogo ou sua jogabilidade, mas demonstrar os conhecimentos obtidos na matéria MAC0420 - Introdução à Computação Gráfica.

## Por onde começar?

Executa-se o jogo abrindo o arquivo index.hmtl na raiz do projeto.

Explicaremos brevemente a organização dos arquivos. No diretório:

- **modelos** temos todos as classes para construir os objetos 3D das cenas. Usamos herança de orientação de objetos para facilitar o desenvolvimento deles.
- **assets** temos as imagens usadas nas texturas
- **./ (Raiz do projeto)** temos as constantes, funções auxiliares, inicialização de interface, configuração dos shaders, render e o programa principal \*_index.js_.

## Conceitos usados

Com o objetivo de garantir maior realismo, usamos

- Modelo de Iluminação Phong
- Texturas
- Sombras suavizadas com Percentage-Closer Filtering
