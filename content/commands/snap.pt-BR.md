---
title: "Comando SNAP no AutoCAD"
metaTitle: "SNAP no AutoCAD: modo snap, espaçamento e F9"
description: "Como funciona o SNAP (SN, F9) do AutoCAD em português: o cursor preso a uma malha no espaçamento definido, ASpecto para X e Y e o snap polar. Experimente."
figure: "SNAP 10 com a grade ativada, e depois a LINHA indicada fora da malha: cada ponto cai nela, e o cursor também."
sourceHash: "a1089484f2f1"
---

O modo snap prende o cursor a uma malha: cada ponto indicado cai no ponto da malha mais próximo, então com um espaçamento de 10 um clique em 13,7 é 10,10. A malha é a do UCS atual, a partir da sua origem, ao longo dos seus eixos. F9 ativa e desativa o modo snap, escrevendo `<Snap ativado>` ou `<Snap desativado>`, e o seu botão na barra de status também. Só os pontos indicados são arredondados: uma coordenada digitada é aceita como foi digitada, e um snap ao objeto vence a malha. A grade (F7) desenha uma malha própria, e a mostra com o snap ativado ou desativado.

O comando SNAP, com o mesmo nome no AutoCAD em português, define o espaçamento: digite-o, ou dê dois pontos a essa distância, e o modo snap é ativado com ele em X e em Y. Enter o ativa como está. Um espaçamento de 0 ou menos é recusado com <Message id="positiveNonzero" />. Digitado com um apóstrofo na frente, `'SNAP`, ele funciona dentro de outro comando. O modo snap e o seu espaçamento são salvos com o desenho, e o D desfaz um SNAP.

O menu do Snap na barra de status escolhe em vez disso o Snap polar: ao longo de um caminho do rastreamento polar, o cursor avança em passos de POLARDIST, ou do espaçamento X do snap enquanto POLARDIST for 0.

## Options

### ON

Ativa o modo snap com o espaçamento atual, como o Enter.

### OFF

Desativa o modo snap; o espaçamento é mantido.

### Aspect

Pede um espaçamento horizontal e depois um vertical, e ativa o modo snap: uma malha mais alta ou mais larga do que quadrada. O padrão do prompt passa então a ser ASpecto, então Enter os pede de novo.

## Missing

Estilo, o snap isométrico, e Tipo, de grade ou polar, no prompt: o menu da barra de status escolhe o tipo. Herança, o oculto Rotacionar (SNAPANG) e SNAPBASE. Um POLARDIST negativo, pelo qual o snap polar do AutoCAD avança como pelo seu valor absoluto: −10 avança 10.

## Questions

### Qual é o atalho do SNAP no AutoCAD?

F9 ativa e desativa o modo snap. O comando é `SN`, depois Enter ou a barra de espaço, para definir o espaçamento; ele tem o mesmo nome no AutoCAD em português, e `_SNAP` funciona em qualquer idioma.

### Qual é a diferença entre SNAP e OSNAP?

O modo snap arredonda o cursor para uma malha de pontos no espaço. Os snaps ao objeto (F3) o prendem a pontos dos objetos: pontos finais, meios, centros. Eles funcionam juntos, e um snap ao objeto vence onde os dois encontram um ponto.

### Por que o cursor do AutoCAD anda aos saltos?

O modo snap está ativado: pressione F9, ou o botão do snap na barra de status, para desativá-lo. Defina um espaçamento menor com o SNAP se quiser passos mais finos.

### Como definir espaçamentos de snap diferentes em X e Y?

Execute o SNAP, escolha <Keyword id="Aspect" /> e dê o espaçamento horizontal, depois o vertical.

### Existe snap isométrico?

Ainda não: a opção Estilo do SNAP, que gira a malha para o desenho isométrico, não é oferecida.
