---
title: "Comando VSCURRENT (EVATUAL) no AutoCAD"
metaTitle: "Estilos visuais no AutoCAD: VSCURRENT (EVATUAL)"
description: "Como o VSCURRENT do AutoCAD em português, EVATUAL (alias EVA), define o estilo visual: Estrutura de arame 2D, Oculto e Conceitual, e como voltar. Teste grátis."
figure: "Um bloco com um furo passante, visto do sudeste: o EVATUAL Conceitual sombreia as faces e desenha as arestas por cima delas."
sourceHash: "ddb8f2338e68"
---

O VSCURRENT, EVATUAL no AutoCAD em português, define o estilo visual: como a vista desenha os sólidos 3D. Ele pede um estilo, oferecendo o atual como padrão, e o Enter o mantém. <Keyword id="2dwireframe" /> desenha todas as arestas, também as de trás; <Keyword id="Hidden" /> oculta o que as faces ocultam; <Keyword id="Conceptual" /> pinta as faces, sombreadas. O estilo pertence à vista e é salvo com o desenho, e cada execução é um passo de desfazer. Ele não pode ser usado dentro de outro comando.

O que não é sólido — linhas, círculos, regiões, textos — é desenhado como na Estrutura de arame 2D, qualquer que seja o estilo, nas suas próprias cores. No Oculto e no Conceitual, um clique pega o sólido cuja face está mais perto de você sob o cursor, nunca um sólido através de uma face que o oculta, e os snaps ao objeto continuam encontrando todas as arestas. Um sólido numa camada bloqueada tem as arestas desenhadas mais apagadas. O 3D do MellowCAD é só de sólidos e ainda parcial.

## Options

### 2dwireframe

Todas as arestas de todos os sólidos, incluindo as de trás, com as linhas que mostram as suas faces curvas; o padrão num desenho novo. Ao voltar a ele de outro estilo, o EVATUAL diz <Message id="regeneratingModel" />.

### Hidden

As arestas de cada sólido, e os contornos das suas faces curvas, onde nenhuma face de nenhum sólido as oculta, na cor do objeto: um sólido atrás de outro fica oculto por ele. As linhas que mostram uma face curva na Estrutura de arame 2D não são desenhadas.

### Conceptual

As faces voltadas para você pintadas na cor do objeto, puxando para um azul frio no lado oposto à luz, que acompanha o seu ponto de vista, e as arestas do Oculto desenhadas por cima numa só cor, qualquer que seja a do objeto. Aqui e no Oculto, um cilindro ou um cone vistos em planta mostram só o círculo, como no AutoCAD.

## Missing

Os outros estilos do AutoCAD — Estrutura de arame, Realista, Sombreado, Sombreado com arestas, Tons de cinza, Croqui e Raio X — e dar o nome de um estilo ou listá-los com `?`: o prompt lista só os três estilos que existem aqui, e recusa qualquer outra resposta.

## Questions

### Como mudar o estilo visual no AutoCAD?

Execute o EVATUAL (ou `EVA`) e escolha o estilo: <Keyword id="Hidden" /> para ocultar as arestas de trás, <Keyword id="Conceptual" /> para sombrear as faces. Ele muda só a vista, não os objetos. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_VSCURRENT`.

### Como voltar para a Estrutura de arame 2D?

Execute o EVATUAL e escolha <Keyword id="2dwireframe" />, a letra `2`.

### Qual a diferença entre Oculto e Conceitual?

Os dois ocultam o que as faces ocultam. O Oculto desenha só as arestas, sobre o fundo, como um desenho a traço; o Conceitual também pinta as faces, sombreadas pela luz, com as mesmas arestas por cima.

### Por que ainda vejo linhas através do sólido?

Elas não fazem parte de um sólido. Linhas, círculos e regiões são desenhados como na Estrutura de arame 2D em todos os estilos, então uma linha atrás de uma caixa continua aparecendo. Em <Keyword id="2dwireframe" />, as arestas de trás do próprio sólido também aparecem: escolha <Keyword id="Hidden" />.
