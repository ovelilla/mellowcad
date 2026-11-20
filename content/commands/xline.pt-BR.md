---
title: "Comando XLINE (LINHAINF) no AutoCAD"
metaTitle: "Comando XLINE (LINHAINF): linha de construção"
description: "Como o XLINE do AutoCAD, LINHAINF (alias LINF), desenha linhas infinitas: por dois pontos, horizontais, verticais, em ângulo, bissetriz ou deslocadas."
figure: "Linhas infinitas por um ponto, uma horizontal e a bissetriz do ângulo entre duas linhas, cada uma atravessando a vista inteira."
sourceHash: "5b81d2c75993"
---

O XLINE, LINHAINF no AutoCAD em português, desenha linhas de construção: linhas de comprimento infinito, que atravessam a vista inteira por mais que você faça pan ou zoom, para traçar um desenho antes de as linhas definitivas entrarem. Indique um ponto e depois um ponto de passagem: a linha infinita passa pelos dois, e cada ponto a mais faz outra pelo primeiro, até Enter encerrar o comando. Um ponto de passagem sobre o primeiro ponto é recusado com <Message id="invalid" />. Cada linha infinita fica na camada atual com a cor, o tipo de linha e a espessura de linha atuais.

Uma linha infinita não tem pontas: um zoom na extensão do desenho a deixa de fora, como no AutoCAD. O snap ao objeto Meio encontra o ponto pelo qual ela foi desenhada; Mais próximo, Perpendicular e Intersecção funcionam ao longo dela, e o <Command id="TRIM" /> ou o <Command id="BREAK" /> a transformam numa linha semi-infinita, ou em duas, que é como as linhas de construção viram linhas do desenho. O <Command id="RAY" /> desenha a metade dela que começa num ponto.

## Options

### Hor

Linhas infinitas horizontais, ao longo do eixo X do UCS, cada uma por um ponto que você indica, até Enter.

### Ver

Linhas infinitas verticais, ao longo do eixo Y do UCS, cada uma por um ponto que você indica.

### Ang

Linhas infinitas em ângulo: digite-o, ou indique dois pontos, e depois os pontos de passagem. Enter no ângulo assume 0. <Keyword id="Reference" /> mede o ângulo a partir de uma linha que você seleciona, uma linha, uma linha infinita ou uma linha semi-infinita, no sentido anti-horário: qualquer outra coisa é recusada com <Message id="noUsableObjectSelected" />.

### Bisect

A linha infinita que divide um ângulo ao meio: indique o vértice, um ponto no primeiro lado e depois um ponto no segundo lado, e a bissetriz passa pelo vértice. Cada ponto a mais no segundo lado faz outra bissetriz do mesmo primeiro lado.

### Offset

Linhas infinitas paralelas a um objeto linear, uma linha, uma linha infinita ou uma linha semi-infinita: informe a distância, selecione o objeto e clique no lado, de novo e de novo até Enter. <Keyword id="Through" /> faz cada uma passar por um ponto que você indica. A distância é a que o <Command id="OFFSET" /> lembra, e a que ele oferece em seguida.

## Missing

O ALONGAR (LENGTHEN) e o <Command id="JOIN" /> de uma linha infinita ainda não foram conferidos com o AutoCAD, nem os menus das suas alças.

## Questions

### Qual é o comando XLINE no AutoCAD em português?

LINHAINF, com o alias `LINF`; digite-o e pressione Enter ou a barra de espaço. A faixa de opções o chama de Linha de construção, no painel Desenhar expandido; aqui ele fica nas ferramentas de Desenhar, ao lado de Raio.

### Como desenhar uma linha de construção horizontal ou vertical?

Execute o LINHAINF, digite a letra de <Keyword id="Hor" /> ou a de <Keyword id="Ver" /> e clique nos pontos por onde ela passa. Horizontal e vertical são as do UCS atual.

### Como aparar uma linha infinita?

Com o <Command id="TRIM" />, como qualquer linha: cortada de um lado, uma linha infinita vira uma linha semi-infinita; cortada dos dois, uma linha. O mesmo acontece com o <Command id="BREAK" />.

### Por que o ZOOM Estendido ignora as minhas linhas de construção?

Uma linha infinita não tem extensão: ela vai ao infinito nos dois sentidos. O AutoCAD deixa as linhas infinitas e semi-infinitas fora da extensão do desenho, e o MellowCAD também.

### Qual a diferença entre XLINE e RAY?

Uma linha infinita vai ao infinito nos dois sentidos; uma linha semi-infinita, do <Command id="RAY" />, começa num ponto e segue num sentido só.
