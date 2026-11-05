---
title: "Escala no AutoCAD: comando ESCALA (SCALE)"
description: "Como funciona o SCALE do AutoCAD em português, ESCALA (alias ES), prompt a prompt: um fator, Cópia e Referência para uma medida conhecida. Experimente grátis."
figure: "Uma placa com o seu furo escalada numa cópia com Referência, a partir do canto: a aresta de 40 indicada e transformada em 60."
sourceHash: "005829bf17ad"
---

O SCALE, ESCALA no AutoCAD em português, aumenta ou reduz os objetos que você seleciona em relação a um ponto base, que fica onde está: um fator 2 os dobra e um de 0.5 os reduz à metade, igual em todas as direções. Selecione os objetos, indique o ponto base e digite o fator, ou mova o cursor e clique: os objetos o acompanham. Enter ali, sem digitar nada, escala pelo último fator usado. Cada execução é um passo que o Desfazer reverte.

Ele escala tudo o que recebe, como o AutoCAD: o padrão de uma hachura cresce com o seu limite, uma cota mede o novo comprimento, e um objeto fora do plano também é escalado em Z em relação ao ponto base.

## Options

### Copy

Escala uma cópia e deixa os objetos como estavam: mostra <Message id="scalingCopy" /> e volta a pedir o fator, com <Keyword id="Copy" /> ainda na lista.

### Reference

Pede um comprimento de referência, digitado ou indicado por dois pontos, e depois o comprimento que ele deve ter: o fator é o novo comprimento dividido pelo de referência. O novo comprimento é digitado, ou é a distância de um ponto até o ponto base; <Keyword id="Points" /> pede dois pontos e mede entre eles. Os dois comprimentos oferecem os últimos dados, 1 num desenho novo.

## Missing

Enter no primeiro ou no segundo ponto de <Keyword id="Points" /> encerra o comando sem escalar, enquanto o AutoCAD escala pela leitura do cursor ali. Um fator minúsculo é aplicado sem aviso, enquanto o AutoCAD diz que o ignora. Os objetos arrastados são desenhados como o <Command id="MOVE" /> os arrasta, só com a sua cor.

## Questions

### Qual é o comando SCALE no AutoCAD em português?

ESCALA, com o alias `ES`: no AutoCAD em português, `SC` não é comando nenhum. Como lá, o nome em inglês também funciona com um sublinhado na frente: `_SCALE`.

### Como usar o comando escala com referência?

Escolha <Keyword id="Reference" /> no fator, indique as duas pontas de uma aresta cujo comprimento você conhece e digite o que ela deve ter. Tudo o que foi selecionado é escalado pelo novo comprimento dividido pelo antigo, então um desenho no tamanho errado fica certo a partir de uma só medida conhecida.

### Como escalar uma cópia e manter o original?

Escolha <Keyword id="Copy" /> no fator: a cópia é escalada e o original fica onde estava.

### Como mudar a escala da linha tracejada?

Não com o ESCALA, que muda o tamanho dos objetos: o <Command id="LTSCALE" /> define o comprimento com que os traços e os espaços de todos os tipos de linha são desenhados.

### Como colocar escala no layout para plotar?

O MellowCAD não tem layouts, viewports nem plotagem: você desenha em tamanho real no espaço do modelo, e o ESCALA muda o tamanho dos próprios objetos, não como eles seriam impressos.
