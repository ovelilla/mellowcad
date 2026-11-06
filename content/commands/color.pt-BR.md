---
title: "Comando COLOR (COR) no AutoCAD"
metaTitle: "Cor no AutoCAD: COLOR (COR), PorCamada e RGB"
description: "Como o COLOR do AutoCAD em português, COR (alias C), define a cor de novos objetos: PorCamada, uma cor de índice por nome ou número ou RGB. Experimente grátis."
figure: "Uma placa desenhada PorCamada, o furo em vermelho, o furo menor dentro dele na true color 0,128,255, e depois a COR de volta a PorCamada."
sourceHash: "93793c2915da"
---

O COLOR, COR no AutoCAD em português, define a cor com que os novos objetos são desenhados. O AutoCAD abre a caixa de diálogo Selecionar cor; o MellowCAD ainda não a tem, então o COR executa a forma de linha de comando que o AutoCAD também tem, <Command id="-COLOR" />. Ele pede a cor padrão dos objetos, oferecendo a atual, `PORCAMADA` num desenho novo: PorCamada quer dizer que cada objeto usa a cor da sua camada, e uma cor escolhida no lugar é a do próprio objeto. Digite o número ou o nome de uma cor de índice, ou escolha <Keyword id="Truecolor" />. Enter mantém a cor atual, e a mudança é um passo que o <Command id="U" /> desfaz.

Uma palavra que ele não entende mostra <Message id="colorRequired" />, e 0, um número negativo ou um acima de 255, <Message id="invalidColorNumber" />; ele pergunta de novo. Digitado com um apóstrofo dentro de um comando, `'COR`, cada objeto desenhado depois dele recebe a nova cor: cada segmento de um <Command id="LINE" /> recebe a cor atual quando começa. O COR só define o que vem depois; a paleta Propriedades ou a lista de cores da barra superior muda os objetos já desenhados.

## Options

### Truecolor

Pede uma cor como três valores de 0 a 255, vermelho, verde e azul, separados por vírgulas sem espaço: `0,128,255` é um azul médio. Uma cor que também é uma cor de índice, `255,0,0`, é guardada como essa cor de índice.

### BYLAYER

Os novos objetos usam a cor da sua camada, como no início.

### RED

Cor de índice 1, também digitada como `1`.

### YELLOW

Cor de índice 2, também digitada como `2`.

### GREEN

Cor de índice 3, também digitada como `3`.

### CYAN

Cor de índice 4, também digitada como `4`.

### BLUE

Cor de índice 5, também digitada como `5`.

### MAGENTA

Cor de índice 6, também digitada como `6`.

### WHITE

Cor de índice 7, também digitada como `7`: branca num fundo escuro e preta num claro.

## Missing

A caixa de diálogo Selecionar cor, os livros de cores e a forma HSL. As cores de índice de 8 a 255: só as de 1 a 7 são aceitas. PorBloco. Uma true color igual a uma cor de índice é guardada como essa cor de índice, onde o AutoCAD mantém o RGB. A transparência (CETRANSPARENCY) e os padrões por tipo HPCOLOR, HPLAYER, DIMLAYER e TEXTLAYER.

## Questions

### Qual é o comando COLOR no AutoCAD em português?

COR, com os aliases `C`, `COLOUR` e `CORDIAG`: no AutoCAD em português, `C` é a cor, não o círculo, que é `CI`. Como lá, o nome em inglês também funciona com um sublinhado na frente: `_COLOR`.

### Como mudar a cor de um objeto no AutoCAD?

Selecione-o e escolha a cor na lista de cores da barra superior ou na linha Cor da paleta Propriedades: ela muda num só passo. Ou copie a cor de outro objeto com o <Command id="MATCHPROP" />. O COR só define a cor dos objetos desenhados depois dele.

### O que significa PorCamada no AutoCAD?

Que o objeto usa a cor da sua camada, então mudar a cor da camada no Gerenciador de propriedades de camadas muda todos os objetos PorCamada dela. É o padrão, e mantém as cores de um desenho organizadas por camada: <Command id="LAYER" />.

### Como usar cores RGB no AutoCAD?

Escolha <Keyword id="Truecolor" /> e digite os três valores separados por vírgulas, como `0,128,255`.
