---
title: "Comando TRIM (APARAR) no AutoCAD"
description: "Como funciona o TRIM do AutoCAD em português, APARAR (alias AP), prompt a prompt: modos Rápido e Padrão, arestas de corte e cerca. Experimente grátis."
figure: "Uma linha aparada até as duas linhas que a cruzam: cada ponta selecionada uma vez, no modo Rápido."
sourceHash: "fcbf44618cf3"
---

O TRIM, APARAR no AutoCAD em português, apara um objeto até onde outros o cruzam: você seleciona o trecho a tirar, e ele some até o cruzamento mais próximo de cada lado. Começa no modo Rápido, como o do AutoCAD: todo objeto é aresta de corte, e um objeto que nada cruza é apagado inteiro. Segurando Shift ao selecionar, o objeto é estendido até a aresta mais próxima, como com <Command id="EXTEND" />. Cada seleção é um passo que o Desfazer reverte; Enter encerra o comando.

## Options

### cuTting

Escolhe quais objetos cortam: selecione-os, ou pressione Enter para usar todos. Daí em diante só eles cortam, qualquer que seja o modo, até o comando terminar.

### Fence

Pede os pontos de uma linha, quantos você quiser até Enter: cada objeto que ela cruza é aparado onde é cruzado, num só passo. O modo Padrão a lista; o Rápido também a aceita, e nele uma seleção no vazio já começa uma cerca de dois pontos.

### Crossing

Pede os dois cantos de uma janela: tudo o que o contorno dela cruza é aparado, num só passo. Um objeto inteiro dentro da janela não é cruzado por ela.

### mOde

Alterna entre <Keyword id="Quick" /> e <Keyword id="Standard" />. No modo Padrão, o APARAR pede primeiro as arestas de corte (Enter usa todas), deixa o objeto que nenhuma aresta cruza com <Message id="doesNotIntersectCuttingEdge" />, lista Cerca e Aresta, e uma seleção no vazio começa uma janela de intersecção. O modo vale para o APARAR e o ESTENDER, e dura a sessão.

### Edge

Só no modo Padrão. Com <Keyword id="Extend" />, uma aresta corta também onde cruzaria se fosse estendida: uma linha para os dois lados, um arco pelo círculo inteiro; <Keyword id="No extend" /> é o padrão.

### eRase

Apaga objetos sem sair do comando: selecione-os e o Enter os apaga, como mais um passo do APARAR que o Desfazer pode reverter.

### Undo

Aparece assim que o prompt teve uma resposta (uma seleção, uma cerca, uma janela): desfaz o último corte e, quando não resta nada a desfazer, avisa.

## Missing

Projeção: a opção de projeção do AutoCAD (Nenhuma, UCS, Vista) não é oferecida, e tudo é calculado projetado no plano XY do UCS, que é o padrão do AutoCAD, UCS. A cerca ainda não pode ser arrastada com o cursor, só indicada ponto a ponto. O modo de aparar e a escolha de Aresta duram a sessão, enquanto o AutoCAD os guarda de uma sessão para outra. Um objeto inclinado em relação ao UCS, exceto uma spline, não corta nem é aparado.

## Questions

### Qual é o comando TRIM no AutoCAD em português?

APARAR, com o alias `AP`. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_TRIM`.

### Por que o trim apaga a linha inteira?

Porque o comando está no modo Rápido, o padrão do AutoCAD desde a versão 2021: selecionar um objeto que nenhuma aresta cruza o apaga. Escolha <Keyword id="mOde" /> e depois <Keyword id="Standard" /> para que ele o deixe e avise.

### Como aparar várias linhas de uma vez?

Clique num ponto vazio e indique um segundo ponto: cada objeto que essa cerca cruza é aparado num só passo. Ou escolha <Keyword id="Crossing" /> e desenhe uma janela sobre os trechos a tirar.

### Como estender uma linha com o trim?

Segure Shift ao selecionar a linha perto da ponta a estender: ela cresce até a aresta mais próxima, como com <Command id="EXTEND" />, e a próxima seleção sem Shift volta a aparar.
