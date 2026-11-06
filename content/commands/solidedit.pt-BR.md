---
title: "Comando SOLIDEDIT (EDITARSOLIDO) no AutoCAD 3D"
metaTitle: "SOLIDEDIT no AutoCAD: editar faces de sólidos 3D"
description: "Como o SOLIDEDIT do AutoCAD em português, EDITARSOLIDO, edita faces de sólidos 3D: Extrusão, Mover, Rotacionar, Deslocar, Afilar, Excluir, Copiar. Teste grátis."
figure: "A face de cima de uma caixa extrudada 15 para cima com uma conicidade de 15 graus pelo EDITARSOLIDO: um tronco de pirâmide sobre a caixa, visto do sudeste."
sourceHash: "775cdc271d4f"
---

O SOLIDEDIT, EDITARSOLIDO no AutoCAD em português, edita um sólido 3D pelas suas faces. Ele diz se cada edição é verificada e depois pergunta o que editar: <Keyword id="Face" />, depois a opção de face, depois as faces, depois o que a opção precisa. Cada edição é feita na hora, e as opções de face são perguntadas de novo, então uma execução pode fazer várias edições; <Keyword id="eXit" /> ou Enter sai das opções de face e depois do comando. As vizinhas de uma face a acompanham: mova o topo de uma caixa para cima e os lados crescem até encontrá-lo.

O sólido mantém a camada e as propriedades, mas perde o que o fez: uma caixa deixa de ser uma caixa. A execução inteira é um passo de desfazer, e o seu <Keyword id="Undo" /> desfaz as edições uma a uma dentro dela. O Enter no prompt `Comando:` o executa de novo desde a primeira pergunta. O botão de faces do painel Editar sólidos executa cada opção de face diretamente. O 3D do MellowCAD é só de sólidos e ainda parcial.

## Options

### Face

As opções de face. Cada uma pede faces, até o Enter: um clique ou um ponto digitado pega a face mais perto de você sob ele, ou as duas faces de uma aresta ali, e uma face já selecionada dá a que está atrás dela. Depois que uma face é selecionada, <Keyword id="ALL" /> pega todas as faces do seu sólido; <Keyword id="Remove" /> passa a tirar faces do conjunto, e <Keyword id="Undo" /> desfaz a última seleção. Um clique no vazio diz <Message id="noSolidsDetected" />. Faces de um só sólido.

### Extrude

Pede uma altura e um ângulo de conicidade: cada face cresce num prisma, somado ao sólido ou, com uma altura negativa, retirado dele, que se estreita à medida que sobe com um ângulo positivo. O Enter na altura aceita a última altura que as primitivas ou o <Command id="EXTRUDE" /> usaram.

### Move

Pede um ponto base e um segundo ponto: uma face plana se move o quanto esse deslocamento corre ao longo da sua normal, levando as vizinhas com ela. O Enter no segundo ponto toma o ponto base como o deslocamento.

### Rotate

Pede um eixo, por dois pontos ou ao longo do <Keyword id="Xaxis" />, do <Keyword id="Yaxis" /> ou do <Keyword id="Zaxis" /> do UCS, ou perpendicular à tela por <Keyword id="View" />, e depois um ângulo: a face gira em torno dele pela regra da mão direita.

### Offset

Pede uma distância: a face se move para fora ao longo da sua normal, ou para dentro com uma negativa, levando as vizinhas com ela, e as faces redondas em torno do seu eixo também. Um deslocamento para dentro de metade do maior lado da caixa em volta do sólido é recusado, e ele diz até onde pode ir.

### Taper

Pede um ponto base, um ponto ao longo do eixo de afilamento e um ângulo: a face se inclina em torno da linha onde encontra o plano que passa pelo ponto base, e um ângulo positivo a inclina para dentro ao longo do eixo.

### Delete

Tira a parede de um furo, fechando o furo, ou a faixa de uma concordância ou de um chanfro, devolvendo a aresta que ela substituiu.

### Copy

Faz uma região de cada face plana, onde ela está ou movida por dois pontos, na camada atual e com as propriedades atuais.

### Undo

Nas opções de face, desfaz a última edição desta execução; quando não resta nenhuma, <Message id="commandCompletelyUndone" />.

### eXit

Sai das opções de face para a primeira pergunta, e o da primeira pergunta sai do comando; o Enter faz o mesmo.

## Missing

<Keyword id="Edge" /> e <Keyword id="Body" />, e <Keyword id="coLor" /> e <Keyword id="mAterial" /> das faces, que são oferecidos e recusados, assim como <Keyword id="Path" /> da Extrusão, o eixo por objeto de Rotacionar e o seu ângulo <Keyword id="Reference" />. Intersecção, Cerca e PIntersecção para selecionar faces. Mover, rotacionar, afilar ou copiar uma face curva, deslocar uma face curva entre outras vizinhas, excluir uma que não seja a parede de um furo ou uma faixa, e uma edição que muda tanto a forma do sólido que uma face acaba consumindo outra. Edições ao lado de uma face extrudada com conicidade. Um deslocamento para fora longo demais para ser feito, que o AutoCAD descarta em silêncio e o MellowCAD faz. Uma prévia enquanto você dá uma distância ou um ângulo.

## Questions

### Como editar um sólido 3D no AutoCAD?

Execute o EDITARSOLIDO, escolha <Keyword id="Face" /> e depois o que fazer: <Keyword id="Extrude" /> ou <Keyword id="Move" /> numa face para deixar o sólido mais alto, <Keyword id="Delete" /> para preencher um furo, <Keyword id="Taper" /> para inclinar um lado. Selecione as faces, pressione Enter e responda aos prompts da opção. Para empurrar ou puxar rápido, o <Command id="PRESSPULL" /> também arrasta uma face.

### Como extrudar uma face de um sólido 3D?

EDITARSOLIDO, <Keyword id="Face" />, <Keyword id="Extrude" />, selecione a face e pressione Enter, depois a altura e o ângulo de conicidade: os `15` e `15` da figura levantam um tronco de pirâmide no topo de uma caixa.

### Como tirar um furo de um sólido?

EDITARSOLIDO, <Keyword id="Face" />, <Keyword id="Delete" />, selecione a parede do furo e pressione Enter: o furo é preenchido. O mesmo tira uma concordância ou um chanfro.

### Qual a diferença entre SOLIDEDIT e PRESSPULL?

O <Command id="PRESSPULL" /> move uma face por um arraste ou uma distância, perpendicular a ela. O EDITARSOLIDO faz isso e mais: afila, gira, desloca, exclui e copia faces, várias de uma vez.
