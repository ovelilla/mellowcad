---
title: "Arco no AutoCAD: comando ARCO (ARC)"
description: "Como funciona o ARC do AutoCAD em português, ARCO (alias A), prompt a prompt: três pontos, início-centro-fim ou centro-início-fim, e o Ctrl. Experimente grátis."
figure: "Três arcos: por três pontos, de um início em torno de um Centro até um fim, e de um Centro, o seu início e depois o seu fim."
sourceHash: "af9b22e35456"
---

O ARCO, ARC no AutoCAD em inglês, desenha por padrão um arco por três pontos: o início, um ponto por onde ele passa e o fim. Ou o desenha em torno de um centro, de um ponto inicial até um final, como os botões Início, centro, fim e Centro, início, fim da faixa de opções o executam. Como no AutoCAD, um arco dado pelo centro corre no sentido anti-horário a partir do início, e o fim só marca onde ele para: não precisa estar sobre o arco. Enquanto você indica os pontos, o arco acompanha o cursor, com uma linha tracejada âmbar a partir do início ou do centro. O arco fica no plano do seu primeiro ponto. Um arco que não pode ser feito, três pontos alinhados ou um fim sobre o início, diz <Message id="invalid" /> e não desenha nada.

## Options

### Center

No primeiro prompt: dê primeiro o centro, depois o ponto inicial e o final. No segundo, depois do início: o centro vem em seguida, e depois o fim. No fim de qualquer um dos dois, mantenha o Ctrl pressionado para o arco correr no sentido horário.

## Missing

As opções que terminam um arco pelo ângulo, pelo comprimento da corda, por uma direção ou por um raio em vez de um ponto final, e Fim no segundo ponto, que leva a elas; os botões da faixa de opções para essas formas também faltam. Continuar: Enter no primeiro prompt, que no AutoCAD desenha um arco tangente à última linha ou arco, aqui encerra o ARCO. A caixa do ângulo incluído que a entrada dinâmica mostra no fim de um modo com centro.

## Questions

### Qual é o comando ARC no AutoCAD em português?

ARCO, com o alias `A`. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_ARC`.

### Como fazer um arco por três pontos no AutoCAD?

Execute o ARCO e dê três pontos: o início, qualquer ponto por onde o arco passe e o fim. É a forma padrão, sem escolher nenhuma opção.

### Por que o arco sai invertido?

Um arco desenhado pelo centro corre no sentido anti-horário a partir do início, como no AutoCAD. Troque o início pelo fim, ou mantenha o Ctrl pressionado enquanto dá o ponto final para ele correr no sentido horário.

### Como fazer um arco tangente a duas linhas?

Com o <Command id="FILLET" /> e um raio: ele desenha o arco tangente às duas linhas e as apara até ele. Para um arco tangente ao trecho anterior, desenhe-o numa polilinha, com a opção de arco do <Command id="PLINE" />.
