---
title: "Comando SUBTRACT (SUBTRAIR) no AutoCAD"
metaTitle: "Comando SUBTRACT no AutoCAD: subtrair sólidos"
description: "Como funciona o SUBTRACT do AutoCAD em português, SUBTRAIR (alias SU): o que fica, Enter e o que se subtrai, sólidos 3D ou regiões. Experimente grátis."
figure: "Um cilindro subtraído de uma caixa pelo SUBTRAIR, deixando um furo passante: primeiro a caixa, depois o cilindro."
sourceHash: "416991f5f4d1"
---

O SUBTRACT, SUBTRAIR no AutoCAD em português, subtrai sólidos 3D de outros sólidos, ou regiões de outras regiões do mesmo plano: um cilindro subtraído de uma caixa deixa um furo passante, e um círculo subtraído de um quadrado, um quadrado com um furo. Ele pergunta duas vezes. Primeiro diz <Message id="subtractFrom" /> e pede os objetos que ficam, até o Enter; depois diz <Message id="subtractWhat" /> e pede os objetos a subtrair, até outro Enter. Como no AutoCAD 2027, ele descarta o conjunto selecionado antes do comando e volta a pedi-lo.

Os sólidos do primeiro conjunto passam a ser um só, e cada sólido do segundo é subtraído dele e apagado, tenha se sobreposto ou não. As regiões vão plano a plano: as do primeiro conjunto num plano são unidas, as do segundo nesse plano são subtraídas delas e apagadas, e uma região num plano onde o primeiro conjunto não tem nenhuma fica como estava. Um resultado sólido é um sólido composto, que não é mais uma caixa nem um cilindro e não tem histórico. Quando não sobra nada, ele diz <Message id="nullSolid" /> ou <Message id="nullRegion" /> e os apaga. O comando inteiro é um só passo de desfazer. O 3D do MellowCAD ainda é parcial: há sólidos, mas não superfícies nem malhas.

## Missing

As superfícies, que aqui não existem. As faces curvas que se cortam numa curva para a qual o MellowCAD ainda não tem uma forma exata: cilindros, cones, esferas ou toroides cujos eixos nem coincidem nem são paralelos (dois cilindros também podem se cruzar); um cone com algo que não seja um plano ou um sólido no seu eixo; um toroide ou um sólido de revolução com um plano que nem é perpendicular ao seu eixo nem passa por ele, ou com um sólido fora do seu eixo; um sólido extrudado com algo que não seja um plano ou uma face extrudada na sua direção. Eles são recusados, e os sólidos ficam como estavam; assim como um corte que toca uma aresta de forma tangente, faces quase, mas não de todo, sobre uma mesma superfície e uma lâmina muito fina entre um corte e uma aresta. Anterior logo depois do SUBTRAIR diz que não há conjunto de seleção anterior, onde o AutoCAD não encontra nenhum dos objetos apagados. O histórico do sólido não é guardado (SOLIDHIST, SHOWHISTORY).

## Questions

### Qual é o comando SUBTRACT no AutoCAD em português?

SUBTRAIR, com o alias `SU`. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_SUBTRACT`.

### Como subtrair um sólido de outro no AutoCAD?

Desenhe o sólido a tirar onde ele se sobrepõe ao outro: um cilindro que atravesse uma caixa, para um furo. Execute o SUBTRAIR, selecione a caixa e pressione Enter, depois selecione o cilindro e pressione Enter: a caixa fica com um furo e o cilindro desaparece. A ordem importa, pois o que você seleciona primeiro é o que fica.

### Por que o SUBTRACT não funciona?

Muitas vezes, pela ordem: o que fica vai no primeiro conjunto, e o que se subtrai, no segundo. Se o primeiro conjunto não tiver nenhum sólido nem região, ou o segundo não tiver nenhum que já não esteja no primeiro, ele diz <Message id="noSolidsOrRegionsSelected" /> e termina; se nada do segundo puder ser subtraído do primeiro, como um sólido de uma região ou uma região de outro plano, ele diz <Message id="subtractNeedsTwo" /> e não muda nada. Linhas e polilinhas precisam virar regiões antes. Quando ele diz que uma operação booleana falhou, os sólidos se cortam de um jeito que o MellowCAD ainda não sabe calcular, e ficam como estavam.

### Como subtrair área no AutoCAD?

Para tirar uma forma 2D de outra, transforme as duas em regiões com o <Command id="REGION" /> e subtraia a interna da externa com o SUBTRAIR: um quadrado do qual se subtrai um círculo passa a ser uma só região com um furo. Para medir uma área sem mudar o desenho, o <Command id="AREA" /> subtrai espaços do seu total acumulado com <Keyword command="AREA" id="Subtract" />.

### Como subtrair sem apagar o objeto?

O SUBTRAIR apaga o que subtrai, como o do AutoCAD. Para guardá-lo, copie-o antes no mesmo lugar: <Command id="COPY" />, o objeto e Enter, um ponto base 0,0 e outro Enter, que o copia com um deslocamento de 0,0, em cima de si mesmo. O SUBTRAIR gasta depois uma das duas cópias.
