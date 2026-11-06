---
title: "Espaçar cotas no AutoCAD: comando DIMSPACE (ESPACOCOTA)"
metaTitle: "Alinhar e espaçar cotas no AutoCAD: DIMSPACE"
description: "Como o DIMSPACE do AutoCAD em português, ESPACOCOTA, iguala o espaço entre cotas ou as alinha com 0, e o Auto pela altura do texto. Experimente grátis online."
before: "A borda superior de uma placa cotada numa cadeia de três, cada cota numa altura própria, como foram desenhadas."
figure: "O ESPACOCOTA a partir da primeira cota, as outras duas selecionadas e o espaçamento 0: a cadeia alinhada numa só linha."
sourceHash: "7ec7c0eb9883"
---

O DIMSPACE, ESPACOCOTA no AutoCAD em português (Ajustar espaço na faixa de opções), ajusta o espaço entre cotas lineares e alinhadas paralelas. Você seleciona a cota base, que fica onde está, e depois as cotas a espaçar; Enter encerra a seleção e pede o espaçamento. A linha de cada cota é então movida, afastando-se da base na ordem em que as cotas estão, a essa distância da anterior. Um espaçamento de 0 alinha todas na linha da base: uma cadeia escalonada como foi desenhada passa a ser lida como uma só. A única mudança é onde ficam as linhas de cota, num passo que o <Command id="U" /> desfaz.

A base é selecionada, digitada como um ponto ou pega com `Último`; uma que não é cota mostra <Message id="selectedObjectNotDimension" /> e pergunta de novo. Um conjunto selecionado antes do comando é o conjunto a espaçar. Uma cota num ângulo diferente do da base é contada e fica onde está, e um espaçamento negativo é recusado com <Message id="negativeSpacing" />.

## Options

### Auto

O padrão, Enter: um espaçamento de duas vezes a altura do texto do estilo de cota da base, multiplicado pela sua escala global, para que a pilha caiba no seu próprio texto.

## Missing

As cotas angulares, que o ESPACOCOTA ainda não espaça. O AutoCAD só move uma cota onde é preciso; aqui toda cota selecionada é espaçada de novo.

## Questions

### Como alinhar cotas no AutoCAD?

Execute o ESPACOCOTA, selecione a cota com que as outras devem se alinhar, selecione-as, pressione Enter e digite `0`: todas as linhas de cota passam para a linha da base.

### Como deixar igual o espaçamento entre cotas?

Execute o ESPACOCOTA, selecione como base a cota mais próxima do objeto, selecione as outras e pressione Enter duas vezes: <Keyword id="Auto" /> as espaça por duas vezes a altura do texto. Ou digite a distância que quiser, como `8`.

### Qual é o espaçamento padrão entre cotas no AutoCAD?

O <Keyword id="Auto" /> do ESPACOCOTA é duas vezes a altura do texto do estilo de cota. O <Command id="DIMBASELINE" /> usa, em vez disso, o espaçamento da linha de base do estilo, 3.75 no ISO-25, para cada cota que acrescenta.

### Por que o ESPACOCOTA não move uma cota?

Ele só espaça cotas paralelas à base: uma em outro ângulo é contada e fica onde está. As cotas angulares ainda não são espaçadas.
