---
title: "Comando BREAK (QUEBRAR) no AutoCAD"
description: "Como funciona o BREAK do AutoCAD em português, QUEBRAR (alias QU), prompt a prompt: o clique é o primeiro ponto, depois o segundo, ou Primeiro ponto."
figure: "Uma linha quebrada entre dois pontos dados com Primeiro ponto, e um círculo quebrado de onde foi selecionado, no sentido anti-horário, até um segundo ponto."
sourceHash: "f351112ef2fc"
---

O BREAK, QUEBRAR no AutoCAD em português, tira um trecho de um objeto, ou o divide em dois. Selecione o objeto: como no AutoCAD, o ponto onde você o selecionou é o primeiro ponto de quebra, então o prompt seguinte pede só o segundo, e o que fica entre os dois é tirado. Uma linha, um arco, uma polilinha aberta, um arco elíptico ou uma spline perdem o que há entre os pontos e viram dois objetos; um círculo ou uma elipse perdem o que corre no sentido anti-horário do primeiro ponto ao segundo, e uma polilinha fechada o que há entre eles na ordem dos seus vértices: cada um vira um único objeto aberto. Um ponto fora do objeto é tomado no ponto mais próximo dele, e um além de uma ponta corta até essa ponta. Enquanto você dá o segundo ponto, o que o QUEBRAR manteria aparece sobre o objeto. A quebra é um passo que o Desfazer reverte.

## Options

### First point

No segundo ponto de quebra: dê de novo o primeiro ponto e depois o segundo, quando o lugar onde você selecionou o objeto não é onde começa o vão.

## Missing

Um arco, um círculo ou uma elipse que não estejam paralelos ao UCS, que o AutoCAD quebra e o MellowCAD não encontra. Uma elipse inteira que o <Command id="MIRROR" /> virou, que o AutoCAD quebra no outro sentido.

## Questions

### Qual é o comando BREAK no AutoCAD em português?

QUEBRAR, com o alias `QU`. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_BREAK`.

### Como quebrar uma linha num ponto?

Execute o <Command id="BREAKATPOINT" />, selecione a linha e dê o ponto: ela vira duas linhas que se encontram ali. No QUEBRAR, digite `@` no segundo ponto de quebra para o mesmo.

### Como quebrar uma linha entre dois pontos?

Selecione a linha, escolha <Keyword id="First point" /> e dê o primeiro e o segundo ponto: o que há entre eles é tirado. Ou selecione a linha no primeiro ponto e dê só o segundo.

### Por que não consigo quebrar um bloco ou um texto?

O QUEBRAR quebra linhas, arcos, círculos, polilinhas, elipses e splines. Uma referência de bloco diz <Message id="cannotBreakBlock" />, e um texto, uma cota ou uma hachura <Message id="objectCannotBeBroken" />; use antes o <Command id="EXPLODE" /> num bloco para quebrar as peças.

### Para que lado o QUEBRAR corta um círculo?

No sentido anti-horário, do primeiro ponto ao segundo, como no AutoCAD. Dê os pontos ao contrário para ficar com a outra parte.
