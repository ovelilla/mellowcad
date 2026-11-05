---
title: "Comando EXTEND (ESTENDER) no AutoCAD"
description: "Como funciona o EXTEND do AutoCAD em português, ESTENDER (alias EST), prompt a prompt: modos Rápido e Padrão, arestas de limite e cerca. Experimente grátis."
figure: "Duas linhas estendidas até a linha que cruza o caminho delas: cada uma selecionada uma vez perto da ponta que cresce, no modo Rápido."
sourceHash: "b2c0044f8e87"
---

O EXTEND, ESTENDER no AutoCAD em português, prolonga um objeto até encontrar outro: você o seleciona perto da ponta que deve crescer, e essa ponta segue até a aresta mais próxima no caminho. Ele estende linhas, arcos, arcos elípticos, polilinhas abertas (pelo segmento final, reto ou seguindo o arco), polilinhas 3D e splines abertas. Começa no modo Rápido, como o do AutoCAD: todo objeto é limite. Segurando Shift ao selecionar, ele apara em vez de estender, como o <Command id="TRIM" />. Cada seleção é um passo que o Desfazer reverte; Enter encerra o comando.

## Options

### Boundary

Escolhe quais objetos servem de limite: selecione-os, ou pressione Enter para usar todos. Daí em diante só eles servem de limite, qualquer que seja o modo, até o comando terminar.

### Fence

Pede os pontos de uma linha, quantos você quiser até Enter: cada objeto que ela cruza é estendido pela ponta mais próxima de onde é cruzado, num só passo. O modo Padrão a lista; o Rápido também a aceita.

### Crossing

Pede os dois cantos de uma janela: cada objeto que o contorno dela cruza é estendido, num só passo.

### mOde

Alterna entre <Keyword id="Quick" /> e <Keyword id="Standard" />. No modo Padrão, o ESTENDER pede primeiro as arestas de limite (Enter usa todas) e lista Cerca e Aresta. O modo vale para o ESTENDER e o APARAR, e dura a sessão.

### Edge

Só no modo Padrão. Com <Keyword id="Extend" />, um objeto também para onde um limite estaria se fosse prolongado (uma linha para os dois lados, um arco pelo círculo inteiro), de modo que uma linha pode crescer até outra que não alcança o caminho dela; <Keyword id="No extend" /> é o padrão.

### Undo

Aparece assim que o prompt teve uma resposta (uma seleção, uma cerca, uma janela): desfaz a última extensão e, quando não resta nada a desfazer, avisa.

## Missing

Projeção: a opção de projeção do AutoCAD (Nenhuma, UCS, Vista) não é oferecida, e tudo é calculado projetado no plano XY do UCS, que é o padrão do AutoCAD, UCS. A cerca ainda não pode ser arrastada com o cursor, só indicada ponto a ponto. O modo e a escolha de Aresta duram a sessão, enquanto o AutoCAD os guarda de uma sessão para outra. Um objeto inclinado em relação ao UCS, exceto uma spline, não serve de limite nem é estendido, e uma polilinha suavizada pelo <Keyword command="PEDIT" id="Fit" /> do <Command id="PEDIT" /> é recusada, enquanto o AutoCAD estende o último arco dela.

## Questions

### Qual é o comando EXTEND no AutoCAD em português?

ESTENDER, com o alias `EST`. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_EXTEND`.

### Por que o extend diz que não há aresta?

Porque nada cruza o caminho que essa ponta seguiria. Uma linha diz <Message id="noEdgeInThatDirection" /> quando a outra ponta alcançaria uma aresta, e uma linha ou um arco, <Message id="pathDoesNotIntersectBoundingEdge" /> nos outros casos; uma polilinha ou uma spline diz <Message id="objectDoesNotIntersectEdge" />. Selecione perto da outra ponta ou, no modo Padrão, escolha <Keyword id="Edge" /> e <Keyword id="Extend" /> para que um limite que fica curto conte como se fosse prolongado. Um círculo, uma polilinha fechada, uma elipse inteira, um texto ou uma hachura não podem ser estendidos: <Message id="cannotExtendObject" />

### Como estender várias linhas de uma vez?

Clique num ponto vazio e indique um segundo ponto: cada objeto que essa cerca cruza cresce pela ponta mais próxima, num só passo. Ou escolha <Keyword id="Crossing" /> e desenhe uma janela sobre as pontas a estender.

### Como aparar com o extend?

Segure Shift ao selecionar: o trecho é aparado até os cruzamentos mais próximos, como o <Command id="TRIM" /> faria, e um objeto que nada cruza é apagado. A próxima seleção sem Shift volta a estender.
