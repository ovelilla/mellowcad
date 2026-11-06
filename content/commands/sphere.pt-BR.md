---
title: "Comando SPHERE (ESFERA) no AutoCAD 3D"
description: "Como funciona o SPHERE do AutoCAD em português, ESFERA, prompt a prompt: centro e raio, Diâmetro, 3P, 2P e Ttr, e por que aparece em linhas. Experimente grátis."
figure: "Uma esfera de raio 25 a partir do centro, vista do sudeste no estilo visual Conceitual."
sourceHash: "a35a57352d16"
---

O SPHERE, ESFERA no AutoCAD em português, desenha uma esfera, um sólido 3D: especifique o centro e depois o raio. Um raio indicado com o mouse é lido no plano que passa pelo centro, e o último raio é oferecido como padrão que o Enter aceita, compartilhado com o <Command id="CYLINDER" />, o <Command id="CONE" /> e as outras primitivas. A esfera fica na camada atual, e o Desfazer a reverte num passo.

Em Estrutura de arame 2D e Oculto ela é desenhada em linhas: meridianos e paralelos, tantos quantos o `ISOLINES` diz, e o snap ao objeto não encontra nela nada além do centro. O <Command id="LIST" /> mostra posição e raio, e a paleta Propriedades permite digitar o raio ou o diâmetro. Suas alças a movem e, em cada quarto do equador, definem o raio. É um sólido 3D para o <Command id="UNION" />, o <Command id="SUBTRACT" /> e o resto do 3D do MellowCAD, que é só de sólidos e ainda parcial.

## Options

### 3P

No centro: pede três pontos, e a esfera fica centrada no círculo que passa por eles, com o raio dele.

### 2P

No centro: pede as duas pontas de um diâmetro, em qualquer lugar do espaço.

### Ttr

No centro: selecione duas linhas, círculos ou arcos, com o snap ao objeto Tangente, e dê um raio: o centro fica no círculo desse raio que toca os dois, na altura deles.

### Diameter

No raio: pede o diâmetro no lugar dele, oferecendo o dobro do último raio.

## Missing

O <Command id="EXPLODE" /> de uma esfera, que o AutoCAD transforma numa superfície: o MellowCAD não tem superfícies, então diz que não conseguiu explodi-la. Mover, Rotacionar, Escala e Espelhar a partir de uma alça ativa, e os comandos 3D próprios (mover, rotacionar e escalar em 3D). A silhueta que o `DISPSILH` do AutoCAD desenha. Os estilos visuais que faltam ao <Command id="VSCURRENT" /> além de Estrutura de arame 2D, Oculto e Conceitual.

## Questions

### Como fazer uma esfera no AutoCAD?

Execute o ESFERA, especifique o centro e depois o raio: `0,0,0` e `25` desenham a esfera da figura. Gire a vista para vê-la redonda, com um canto do ViewCube ou com <Command id="-VIEW" /> e <Keyword command="VIEW" id="SEiso" />.

### Por que a esfera aparece como um círculo com linhas?

Estrutura de arame 2D e Oculto desenham uma esfera pelos seus meridianos e paralelos; em planta, eles são um círculo e linhas que o atravessam. O <Command id="VSCURRENT" /> com <Keyword command="VSCURRENT" id="Conceptual" /> a sombreia, e o `ISOLINES` define quantas linhas ela mostra.

### Como fazer uma meia esfera no AutoCAD?

Desenhe a esfera e corte-a pelo centro com o <Command id="SLICE" />: três pontos no plano, ou <Keyword command="SLICE" id="XY" /> e o centro, e o lado a manter.

### Como desenhar uma esfera pelo diâmetro?

No raio, escolha <Keyword id="Diameter" /> e digite o diâmetro. Com <Keyword id="2P" />, as duas pontas de um diâmetro também a posicionam.
