---
title: "Comando SPLINEDIT (EDITARSPLINE) no AutoCAD"
metaTitle: "Editar spline no AutoCAD: SPLINEDIT, alias ESPL"
description: "Como funciona o SPLINEDIT do AutoCAD em português, EDITARSPLINE (ESPL): Fechar, Unir, AJustar, Editar vértice, Polilinha e REverter. Experimente grátis."
figure: "Uma spline por cinco pontos de ajuste, fechada pelo EDITARSPLINE: um laço suave que passa por todos eles."
sourceHash: "bedcaab2fac3"
---

O SPLINEDIT, EDITARSPLINE no AutoCAD em português, edita uma spline. Selecione uma em `Selecionar spline:`, ou antes do comando; um clique duplo numa spline também executa o EDITARSPLINE nela. Qualquer outra coisa diz <Message id="objectNotSpline" /> e pergunta de novo; uma polilinha ajustada pela opção Spline do EDITARP é transformada numa spline da mesma curva, sem dizer nada. Depois ele pede uma opção de novo e de novo, cada uma aplicada na hora, até <Keyword id="eXit" /> ou Enter. A spline mostra as alças dos seus pontos de ajuste e, enquanto você edita os vértices, os vértices de controle e o quadro. A edição inteira é um passo que o <Command id="U" /> desfaz. `'ZOOM` digitado funciona em qualquer um dos seus prompts.

## Options

### Close

Fecha a spline suavemente: uma spline de ajuste pelos seus pontos de ajuste, uma spline VC pelos seus vértices. Numa spline fechada a opção é <Keyword id="Open" />, e Unir não é oferecida.

### Join

Une as curvas abertas que encontram as suas extremidades, pelas regras do UNIR para uma spline, e diz quantas uniu.

### Fit data

Edita os pontos pelos quais a spline passa. Uma spline VC, que não os tem, recebe antes pontos de ajuste sobre a sua curva. As suas opções: <Keyword id="Add" /> seleciona um ponto de ajuste e adiciona novos depois dele, de novo e de novo (no primeiro ponto de uma spline aberta, <Keyword id="After" /> ou <Keyword id="Before" />); <Keyword id="Delete" /> remove pontos de ajuste, até sobrarem dois, três numa spline fechada (<Message id="cannotDeleteBeyond" />); <Keyword id="Move" /> percorre os pontos de ajuste com <Keyword id="Next" /> e <Keyword id="Previous" />, ou <Keyword id="Select point" />, e move o atual para o ponto que você der; <Keyword id="Purge" /> descarta os dados de ajuste, deixando uma spline VC; <Keyword id="Tangents" /> define as direções inicial e final, ou <Keyword id="System default" />; <Keyword id="Close" /> e <Keyword id="eXit" />, como no primeiro prompt. Um ponto indicado que não é ponto de ajuste diz <Message id="notAFitPoint" />.

### Edit vertex

Edita os vértices de controle; uma spline de ajuste perde os dados de ajuste na primeira edição. <Keyword id="Add" /> põe um vértice no ponto que você indica na spline; <Keyword id="Delete" /> remove um, até sobrarem dois, três numa spline fechada; <Keyword id="Elevate order" /> aumenta a ordem, até 26, nunca para baixo; <Keyword id="Move" /> move vértices, percorrendo-os como o Mover do AJustar; <Keyword id="Weight" /> define o peso de um vértice, depois de <Message id="splineMadeRational" />, para que a curva se aproxime ou se afaste dele. Um ponto indicado que não é vértice diz <Message id="notAControlVertex" />.

### convert to Polyline

Pede uma precisão de 0 a 99, 10 por padrão, e substitui a spline por uma polilinha de segmentos retos, mais numerosos quanto maior a precisão; uma polilinha 3D onde a spline não fica plana, paralela ao plano XY. Encerra o comando. A precisão vale pela sessão, e a conversão do EDITARP também a usa.

### Reverse

Inverte a spline, o primeiro ponto por último: <Message id="splineReversed" />.

### Undo

Desfaz a última opção, um AJustar ou um Editar inteiro de uma vez. Sem nenhuma: <Message id="commandCompletelyUndone" />.

### eXit

Encerra o comando, como o Enter.

## Missing

Ponto de inflexão, que põe um canto vivo num ponto de ajuste ou vértice; TOLerância, que reajusta a spline dentro de uma tolerância; Tangentes de uma spline fechada. Polilinha cria muito mais vértices a partir de uma spline de ajuste do que o AutoCAD, nunca arcos, e sempre substitui a spline. Grupo em `Selecionar spline:`. O `+` que o AutoCAD desenha no ponto atual enquanto você percorre os pontos.

## Questions

### Qual é o comando SPLINEDIT no AutoCAD em português?

EDITARSPLINE, com o atalho `ESPL`, depois Enter ou a barra de espaço. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_SPLINEDIT`. Um clique duplo numa spline também o executa.

### Como converter uma spline em polilinha?

Execute o EDITARSPLINE, selecione a spline e escolha <Keyword id="convert to Polyline" />; uma precisão de 10 dá uma polilinha suave. O <Command id="PEDIT" /> numa spline também oferece convertê-la.

### Como adicionar ou mover pontos numa spline?

Escolha <Keyword id="Fit data" /> para trabalhar nos pontos pelos quais ela passa, e depois <Keyword id="Add" /> ou <Keyword id="Move" />. Escolha <Keyword id="Edit vertex" /> para trabalhar nos vértices de controle que a emolduram.

### Como fechar uma spline?

Escolha <Keyword id="Close" />: ela se fecha suavemente, sem um canto onde encontra a si mesma. <Keyword id="Open" /> a abre de novo.

### Como unir duas splines?

Escolha <Keyword id="Join" /> e selecione a spline cuja extremidade encontra a desta, ou use o <Command id="JOIN" />.
