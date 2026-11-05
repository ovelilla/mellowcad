---
title: "Comando MIRROR (ESPELHAR) no AutoCAD"
description: "Como funciona o MIRROR do AutoCAD em português, ESPELHAR (alias ESP), prompt a prompt: dois pontos da linha de espelhamento e excluir ou não a origem."
figure: "Um contorno fechado espelhado em relação a uma linha de espelhamento vertical, mantendo a origem."
sourceHash: "fd4b7540311a"
---

O MIRROR, ESPELHAR no AutoCAD em português, reflete os objetos que você seleciona em relação a uma linha: você os seleciona, dá o primeiro e o segundo ponto da linha de espelhamento e depois diz se os objetos de origem são excluídos. O reflexo é uma cópia e, com a resposta padrão, Não, os originais ficam: é assim que se desenha uma peça simétrica pela metade. Os dois pontos são tomados na planta do UCS, então uma linha de espelhamento desenhada com Orto reflete reto, na horizontal ou na vertical. Como no AutoCAD com o MIRRTEXT em 0, seu valor padrão, um texto continua sendo lido da esquerda para a direita no reflexo, e uma hachura mantém o ângulo do padrão. O espelhamento é um passo que o Desfazer reverte.

## Options

### Yes

Exclui os objetos de origem e só fica o reflexo: uma inversão no lugar.

### No

A resposta padrão: mantém os objetos de origem ao lado do reflexo.

## Missing

O MIRRTEXT e o MIRRHATCH ficam em 0: um texto nunca é espelhado para ser lido ao contrário, e um padrão de hachura nunca é refletido. Um texto dentro de uma referência de bloco espelhada volta a ser lido como um solto, enquanto o AutoCAD o espelha com o bloco. Uma elipse espelhada mantém a normal, então o ângulo inicial e o ângulo final dela são lidos de outro jeito que no AutoCAD para a mesma curva. Enquanto acompanha o cursor, o reflexo tem a cor de cada objeto, não o tipo de linha nem a espessura de linha.

## Questions

### Qual é o comando MIRROR no AutoCAD em português?

ESPELHAR, com o alias `ESP`. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_MIRROR`.

### Como espelhar sem o texto ficar invertido?

Não precisa fazer nada: como no AutoCAD com o MIRRTEXT em 0, um texto espelhado continua sendo lido normalmente, colocado onde cai o reflexo do retângulo dele.

### Como espelhar e apagar o original?

Responda <Keyword id="Yes" /> quando o ESPELHAR perguntar se exclui os objetos de origem.

### Como espelhar na horizontal ou na vertical?

Ligue o Orto (F8) e dê os dois pontos da linha de espelhamento ao longo do eixo em relação ao qual quer refletir: uma linha vertical inverte esquerda e direita; uma horizontal, cima e baixo.
