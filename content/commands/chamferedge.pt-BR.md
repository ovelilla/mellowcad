---
title: "Comando CHAMFEREDGE (CHANFRARARESTA) no AutoCAD 3D"
metaTitle: "Chanfro de arestas 3D no AutoCAD: CHAMFEREDGE"
description: "Como o CHAMFEREDGE do AutoCAD em português, CHANFRARARESTA, faz o chanfro de arestas de sólidos 3D: as arestas de uma face, Loop e Distância. Teste grátis."
figure: "Uma caixa vista do sudeste: o CHANFRARARESTA com as duas distâncias 6 chanfra as duas arestas de cima no seu canto da frente, que se encontram numa linha."
sourceHash: "43b1908ad4b3"
---

O CHAMFEREDGE, CHANFRARARESTA no AutoCAD em português, faz o chanfro das arestas de um sólido 3D. Ele diz as duas distâncias atuais e depois pede uma aresta e, depois da primeira, outras da mesma face, até o Enter: um clique pega a aresta sob o cursor, e um ponto digitado, a aresta desenhada por ele. Uma aresta que não tem nenhuma face em comum com as primeiras diz <Message id="edgesOneFace" />, e uma de outro sólido, <Message id="chamferMultipleBodies" />. À medida que as arestas são selecionadas, o sólido é desenhado como vai ficar. O Enter então pede que você pressione Enter de novo para aceitar, ou que mude as distâncias deste chanfro; esse Enter o faz.

A primeira distância corre ao longo da face que as arestas compartilham; para uma aresta sozinha, ao longo da face que o AutoCAD toma: a da frente, para a aresta de cima da frente de uma caixa, e a de cima, para a borda de um cilindro. Uma aresta reta entre duas faces planas vira uma faixa plana; a aresta redonda de um furo ou de uma borda, uma faixa de cone; e chanfros que se encontram num canto são unidos numa linha. As distâncias são oferecidas de novo na próxima vez. O sólido mantém a camada e as propriedades, mas perde o que o fez: uma caixa deixa de ser uma caixa. O comando inteiro é um passo de desfazer. O 3D do MellowCAD é só de sólidos e ainda parcial.

## Options

### Loop

Pega todas as arestas em volta de uma face: selecione uma aresta e depois escolha <Keyword id="Accept" /> para o loop mostrado, ou <Keyword id="Next" /> para o loop da outra face a que a aresta pertence. <Keyword id="Edge" /> volta às arestas uma a uma.

### Distance

Pede a primeira distância e depois a segunda, cada uma digitada ou como a distância entre dois pontos; 0 ou menos diz <Message id="distanceTooSmall" />. <Keyword id="Expression" /> aceita uma delas como fórmula. No prompt de aceitar, pede a distância da superfície de base e a da outra superfície, só para este chanfro.

## Missing

Um canto onde três arestas chanfradas se encontram. Uma aresta reta ao lado de uma face curva, uma aresta redonda fora do eixo do seu cilindro, e qualquer aresta de uma esfera, de um toroide, de uma extrusão ou de um sólido de revolução: aqui elas falham com um erro de modelagem. As duas alças de seta que o AutoCAD mostra no prompt de aceitar, uma por distância. O <Command id="CHAMFER" /> selecionando a aresta de um sólido, o que o AutoCAD também permite. O chanfro desenhado como malha enquanto você seleciona, e as superfícies.

## Questions

### Como fazer chanfro numa aresta no AutoCAD 3D?

Execute o CHANFRARARESTA, escolha <Keyword id="Distance" /> e dê as duas distâncias, selecione as arestas de uma face e pressione Enter duas vezes: uma para terminar a seleção, outra para aceitar. Os `6` e `6` da figura chanfram duas arestas de cima de uma caixa.

### Por que o CHANFRARARESTA diz que as arestas precisam pertencer a uma face?

As arestas de um chanfro compartilham uma face: a primeira distância corre ao longo dela. Chanfre as arestas de outra face numa segunda execução.

### Por que o CHAMFER não funciona num sólido 3D?

O <Command id="CHAMFER" /> do AutoCAD também chanfra a aresta de um sólido, mas o do MellowCAD ainda não: use o CHANFRARARESTA, e o <Command id="FILLETEDGE" /> para arredondar uma aresta.

### Como chanfrar a aresta de um furo?

Selecione a aresta redonda onde ele encontra a face plana: o chanfro é uma faixa de cone em volta do furo.
