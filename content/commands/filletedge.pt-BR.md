---
title: "Comando FILLETEDGE (ARESTACONCORD) no AutoCAD 3D"
metaTitle: "FILLETEDGE no AutoCAD: fillet de arestas 3D"
description: "Como o FILLETEDGE do AutoCAD em português, ARESTACONCORD, arredonda arestas de sólidos 3D, prompt a prompt: Cadeia, Loop, Raio e a alça de seta. Teste grátis."
figure: "Uma caixa vista do sudeste: o ARESTACONCORD com raio 8 arredonda as suas duas arestas verticais da direita."
sourceHash: "403a055efb24"
---

O FILLETEDGE, ARESTACONCORD no AutoCAD em português, arredonda as arestas de um sólido 3D. Ele diz o raio atual e depois pede arestas, até o Enter: um clique pega a aresta sob o cursor, que se acende quando ele passa por cima, e um ponto digitado pega a aresta desenhada por ele. À medida que as arestas são selecionadas, o sólido é desenhado como vai ficar, com as concordâncias no lugar. O Enter conta as arestas e pede que você pressione Enter de novo para aceitar, ou que mude o raio; esse Enter faz as concordâncias. Arestas de um só sólido: a de outro diz <Message id="filletMultipleBodies" />, e uma selecionada duas vezes, <Message id="edgeAlreadyPicked" />.

Uma aresta reta entre duas faces planas vira um quarto de cilindro, e a aresta redonda de um furo ou de uma borda, um quarto de toroide; concordâncias que se encontram num canto são unidas, três delas por um pedaço de esfera. O raio é salvo no desenho e oferecido de novo na próxima vez. O sólido mantém a camada e as propriedades, mas perde o que o fez: uma caixa deixa de ser uma caixa. O comando inteiro é um passo de desfazer. O 3D do MellowCAD é só de sólidos e ainda parcial.

## Options

### Chain

Pega a aresta que você seleciona e todas as arestas tangentes a ela, uma depois da outra: as oito em volta do topo de um bloco cujas arestas verticais já estão arredondadas. Sem nenhuma tangente, diz <Message id="noTangentChainEdges" /> e pega a selecionada. <Keyword id="Edge" /> volta às arestas uma a uma.

### Loop

Pega todas as arestas em volta de uma face: selecione uma aresta e depois escolha <Keyword id="Accept" /> para o loop mostrado, ou <Keyword id="Next" /> para o loop da outra face a que a aresta pertence.

### Radius

Pede o raio, digitado ou como a distância entre dois pontos; 0 ou menos diz <Message id="radiusTooSmall" />. <Keyword id="Expression" /> o aceita como uma fórmula. No prompt de aceitar, muda o raio das concordâncias mostradas. A alça de seta no meio da primeira concordância o define arrastando: clique nela, mova, clique; <Keyword id="eXit" /> ou Esc o deixam como estava.

## Missing

Concordâncias de dois raios que se encontram, e uma concordância que termina numa face curva. Uma concordância mais larga que uma face ao lado, que o AutoCAD faz rolar por cima da aresta seguinte: aqui ela falha com um erro de modelagem. Uma aresta reta ao lado de uma face curva, uma aresta redonda fora do eixo do seu cilindro, e qualquer aresta de uma esfera, de um toroide, de uma extrusão ou de um sólido de revolução, que falham do mesmo jeito. Alguns cantos onde concordâncias se encontram em arestas de inclinações diferentes. A alça de seta em qualquer aresta que não seja a primeira, e a linha dela até o cursor. O <Command id="FILLET" /> selecionando a aresta de um sólido, o que o AutoCAD também permite. A concordância desenhada como malha enquanto você seleciona, e as superfícies.

## Questions

### Como fazer fillet numa aresta de um sólido 3D no AutoCAD?

Execute o ARESTACONCORD, escolha <Keyword id="Radius" /> e digite-o, selecione as arestas e pressione Enter duas vezes: uma para terminar a seleção, outra para aceitar. O `8` da figura arredonda duas arestas de uma caixa.

### Como arredondar todas as arestas de uma face?

Escolha <Keyword id="Loop" /> e selecione uma aresta da face, depois <Keyword id="Accept" />, ou <Keyword id="Next" /> se o loop mostrado for o da outra face. Para arestas que já se continuam umas nas outras, em volta do topo de um bloco arredondado, <Keyword id="Chain" /> pega todas.

### Por que o FILLET não funciona num sólido 3D?

O <Command id="FILLET" /> do AutoCAD também arredonda a aresta de um sólido, mas o do MellowCAD ainda não: use o ARESTACONCORD, e o <Command id="CHAMFEREDGE" /> para um chanfro.

### Como mudar o raio da concordância?

Escolha <Keyword id="Radius" /> antes de selecionar ou no prompt de aceitar, ou arraste a alça de seta no meio da primeira concordância. O último raio é oferecido na próxima vez.
