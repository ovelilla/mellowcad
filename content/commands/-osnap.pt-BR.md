---
title: "Comando -OSNAP no AutoCAD: snap ao objeto"
metaTitle: "OSNAP no AutoCAD: snap ao objeto, F3 e -OSNAP"
description: "Como funcionam os snaps ao objeto do AutoCAD em português: o -OSNAP (-OS) define os modos, F3 os ativa, e MEI ou Shift + clique direito força um. Experimente."
figure: "O -OSNAP define Meio e Centro como snaps em execução; a LINHA vai então do meio de uma aresta ao centro do círculo, e a aresta de cima mostra o seu marcador de Meio."
sourceHash: "627cd26c12df"
---

Os snaps ao objeto põem um ponto indicado exatamente num ponto de um objeto: uma extremidade, um meio, um centro. Com o snap ao objeto ativado, o cursor perto de um desses pontos mostra o seu marcador, em verde, e o seu nome numa dica de ferramenta; um clique cai então nesse ponto, não onde está o cursor. Os snaps em execução são os modos que atuam em cada prompt de ponto: no início Ponto final, Centro, Intersecção e Extensão, como no AutoCAD. F3 ativa e desativa o snap ao objeto, escrevendo `<Osnap ativado>` ou `<Osnap desativado>`, e o botão Snap ao objeto na barra de status também, cujo menu tem uma caixa de seleção para cada modo. Com vários snaps sob o cursor, vence o mais próximo, e Tab percorre os outros. O modo Orto, o Polar e o modo snap nunca desviam um ponto de snap.

O -OSNAP, com o mesmo nome no AutoCAD em português, define os snaps em execução na linha de comando. Ele lista os modos em execução agora e depois pede uma lista de modos: cada um pelas suas três letras, separados por vírgulas, como em `MEI,CEN,INT`, ou `_END,_MID` em qualquer idioma do AutoCAD. A lista substitui o conjunto em execução e ativa o snap ao objeto; <Keyword id="NONe" />, <Keyword id="OFF" /> ou Enter sozinho o limpa. Um modo que ele não conhece recebe <Message id="invalidOsnapModes" />, e a pergunta de novo. Digitado com um apóstrofo na frente, `'-OSNAP`, ele funciona dentro de outro comando. Os snaps em execução duram até a página ser recarregada, e então voltam a ser os quatro do AutoCAD: como no AutoCAD, o desenho não os guarda.

Para um ponto só, use uma sobreposição: digite as três letras de um modo num prompt de ponto, `MEI` ou `_MID`, ou segure Shift e clique com o botão direito para escolhê-lo num menu. Só esse snap é procurado, seja qual for o conjunto em execução, e só para esse ponto; um que não encontra nada recusa o ponto e pergunta de novo. Digitado pelas suas maiúsculas, <Keyword id="NONe" /> desativa o snap para um ponto. O mesmo menu oferece <Command id="FROM" />: um ponto base, depois um deslocamento a partir dele, então `@10,0` fica 10 à sua direita.

## Options

### ENDpoint

A extremidade mais próxima de uma linha, um arco, um segmento de polilinha, um arco elíptico ou uma spline: os cantos de um retângulo, os vértices de um polígono. O seu marcador é um quadrado.

### MIDpoint

O ponto na metade de uma linha, um arco, um segmento de polilinha, um arco elíptico ou uma spline. Um triângulo.

### CENter

O centro de um círculo, um arco ou um arco de polilinha. Passe o cursor sobre a própria curva: no centro não há nada para pegar. Um círculo.

### NODe

Um objeto de ponto, os que o <Command id="POINT" />, o <Command id="DIVIDE" /> e o <Command id="MEASURE" /> criam, seja qual for a figura que o <Command id="PTYPE" /> lhes dá. No início não está entre os snaps em execução. Um círculo com uma cruz.

### QUAdrant

Os pontos de um círculo ou um arco a 0°, 90°, 180° e 270°, ao longo do X e do Y do UCS, e as extremidades dos eixos de uma elipse. Um losango.

### INTersection

Onde dois objetos se cruzam, ou onde um caminho do rastreamento polar cruza um objeto. Um xis.

### EXTension

Além da extremidade de uma linha, um arco ou um segmento reto de polilinha: passe o cursor sobre a extremidade e depois afaste-o ao longo da linha do objeto. Um caminho tracejado aparece a partir da extremidade, e uma distância digitada corre ao longo dele. Um sinal de mais.

### INSertion

O ponto pelo qual se posicionam um texto, uma definição de atributo ou uma referência de bloco.

### PERpendicular

O pé da perpendicular do último ponto sobre uma linha, também além das suas extremidades, um círculo, um arco ou um segmento de polilinha. No primeiro ponto da <Command id="LINE" />, ele espera o próximo ponto: a linha sai do objeto em esquadro com ele. Um ângulo reto.

### TANgent

O ponto de um círculo ou um arco onde uma linha a partir do último ponto o toca. No primeiro ponto da <Command id="LINE" />, ele espera o próximo ponto: a linha sai da curva tangente a ela. Um círculo com uma barra.

### NEArest

O ponto de um objeto mais próximo do cursor. Uma ampulheta.

### APParent

Intersecção aparente: onde dois objetos se cruzam na vista, embora estejam em alturas diferentes; onde eles se encontram de fato, é a sua intersecção.

### PARallel

Pare o cursor sobre uma linha por um momento e depois mova-o na direção dela a partir do último ponto: um caminho paralelo à linha segura o próximo ponto.

### NONe

Nenhum snap em execução: o snap ao objeto não encontra nada até que um modo seja definido de novo.

### OFF

O mesmo que <Keyword id="NONe" />: o conjunto em execução é limpo.

## Missing

A caixa de diálogo Configurações do desenho que o OSNAP e o OS abrem no AutoCAD: aqui eles são comandos desconhecidos, e o menu da barra de status define os modos. Centro geométrico, como modo e nos menus. O snap Ponto nos pontos de definição de uma cota e na origem do seu texto: aqui ele só encontra objetos de ponto. Meio entre 2 pontos, o ponto de rastreamento temporário e as teclas mantidas pressionadas para um snap de um ponto só (Shift + A, Shift + Q…). Intersecção, Perpendicular e Tangente em elipses, Perpendicular e Tangente em splines, e Extensão a partir da extremidade de um arco de polilinha, ou com a sua distância e o seu ângulo na dica de ferramenta. Uma Perpendicular ou uma Tangente que espera o outro ponto no início de um comando que não seja a <Command id="LINE" /> ou o <Command id="CIRCLE" />. As configurações da abertura e do marcador, APERTURE e AUTOSNAP.

## Questions

### Para que serve o comando OSNAP no AutoCAD?

No AutoCAD, o OSNAP (`OS`) abre a caixa de diálogo Configurações do desenho na guia Snap ao objeto, para escolher os snaps em execução. O MellowCAD não tem essa caixa de diálogo: digite `-OSNAP` ou `-OS` e uma lista de modos, ou marque-os no menu do botão Snap ao objeto da barra de status.

### Como se chama o OSNAP em português, e qual é o atalho?

O mesmo nome: o AutoCAD em português mantém OSNAP e `-OSNAP` (`-OS`). F3 ativa e desativa o snap ao objeto, como no AutoCAD; o botão Snap ao objeto da barra de status faz o mesmo. Shift + clique com o botão direito num prompt de ponto abre o menu dos snaps de um ponto só.

### Por que o osnap não funciona no AutoCAD?

O F3 pode tê-lo desativado: o botão na barra de status mostra isso. Ou o modo não está em execução: defina-o com o `-OSNAP` ou com o menu do botão. O cursor precisa chegar a cerca de 10 pixels do ponto e, para um centro, passar sobre o próprio círculo ou arco. Os snaps só funcionam enquanto um comando pede um ponto.

### Como usar um snap ao objeto só para um ponto?

No prompt de ponto, digite as letras do modo, como `MEI` ou `TAN`, ou escolha-o no menu do Shift + clique com o botão direito. Ele vale só para esse ponto, esteja esse modo em execução ou não.

### As configurações do snap ao objeto ficam salvas?

Até a página ser recarregada; então voltam a ser Ponto final, Centro, Intersecção e Extensão. O AutoCAD também não as guarda no desenho.
