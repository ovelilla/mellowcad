---
title: "Elipse no AutoCAD: comando ELIPSE (ELLIPSE)"
description: "Como funciona o ELLIPSE do AutoCAD em português, ELIPSE (alias EL), prompt a prompt: um eixo e o outro semieixo, pelo Centro, Rotação ou um Arco elíptico."
figure: "Uma elipse pelas duas pontas de um eixo, outra pelo Centro, e meio Arco elíptico, de 0 a 180 graus."
sourceHash: "2ee0d1b3a8a4"
---

O ELIPSE, ELLIPSE no AutoCAD em inglês, desenha uma elipse a partir das duas pontas de um eixo e depois a distância do centro até a ponta do outro eixo: metade do comprimento do outro eixo. Qualquer um dos dois eixos pode ser o maior. É uma elipse de verdade, como a do AutoCAD, não uma polilinha, então os snaps Centro, Quadrante e Mais próximo a encontram, e as suas alças a movem e definem cada semieixo. Enquanto você dá a segunda ponta, uma linha tracejada âmbar sai da primeira; na distância, a elipse acompanha o cursor. A elipse é criada na camada atual, com as propriedades atuais no momento em que fica definida.

## Options

### Arc

Desenha um arco elíptico: os mesmos prompts de uma elipse, e depois um ângulo inicial e um ângulo final, no sentido anti-horário a partir da ponta do primeiro eixo que você deu.

### Center

Começa pelo centro: depois a ponta de um eixo, e depois a distância até o outro.

### Rotation

Em vez da distância: o ângulo em que a elipse gira em torno do primeiro eixo, como um círculo visto nesse ângulo. 0 desenha um círculo; um ângulo a menos de 0,6 grau de 90 é recusado com <Message id="invalid" />.

### Parameter

Num arco, em vez do ângulo inicial ou final: o ângulo sobre o círculo a partir do qual a elipse é desenhada, o parâmetro do AutoCAD. <Keyword id="Angle" /> volta aos ângulos.

### Included angle

Num arco, em vez do ângulo final: quanto ele percorre a partir do início. Enter toma 180, meia elipse.

## Missing

Isocírculo, que o AutoCAD só oferece com o estilo de snap isométrico, que aqui não foi feito. PELLIPSE 1, uma elipse desenhada como polilinha. Hachurar ou cotar uma elipse, e os snaps Interseção, Tangente e Perpendicular sobre ela. As alças em seta das pontas de um arco elíptico, aqui quadradas, e digitar um comprimento ou um ângulo com uma alça ativa. Um ponto com Z na distância é medido em planta, onde o AutoCAD o mede no espaço.

## Questions

### Qual é o comando ELLIPSE no AutoCAD em português?

ELIPSE, com o alias `EL`. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_ELLIPSE`.

### Como fazer meia elipse no AutoCAD?

Escolha <Keyword id="Arc" />, dê o eixo e a distância, e depois um ângulo inicial de `0` e um ângulo final de `180`. Ou pressione Enter em <Keyword id="Included angle" />, que percorre 180 por padrão.

### Como fazer uma elipse pelo centro?

Escolha <Keyword id="Center" />, dê o centro, depois a ponta de um eixo e depois a distância do centro até a ponta do outro: os dois semieixos da elipse.

### Como fazer um círculo isométrico no AutoCAD?

O AutoCAD o desenha com a opção Isocírculo do ELIPSE, depois que o estilo de snap é isométrico. Nenhuma das duas coisas foi feita ainda no MellowCAD.
