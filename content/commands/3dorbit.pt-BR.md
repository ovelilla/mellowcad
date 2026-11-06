---
title: "Comando 3DORBIT (ORBITA3D) no AutoCAD"
metaTitle: "Órbita 3D no AutoCAD: 3DORBIT (ORBITA3D)"
description: "A órbita 3D do AutoCAD em português, ORBITA3D (alias O3D): girar a vista arrastando, sair, orbitar com Shift e a roda e voltar à vista em planta. Teste grátis."
figure: "Uma caixa vista primeiro em planta: ORBITA3D, um arraste para o lado e para baixo, depois Enter, e a caixa é vista de cima do seu canto da frente."
sourceHash: "66fc1859c8fd"
---

O 3DORBIT, ORBITA3D no AutoCAD em português, gira a vista em volta do desenho enquanto você arrasta; nada no desenho se move nem muda. Arrastar para os lados gira a câmera em torno do eixo Z universal, e arrastar para cima e para baixo a sobe ou a desce, em torno do meio do desenho que está sob o centro da tela, em projeção paralela. Ao começar, ele diz como sair: enquanto ele roda, você só pode orbitar, e o Enter ou o Esc o encerram, com ou sem arraste.

Segurar Shift e o botão da roda orbita de qualquer lugar, até dentro de outro comando, e o botão Órbita da barra de navegação também o executa. Digitado com um apóstrofo, `'ORBITA3D`, ele funciona dentro de outro comando, que continua depois. Cada arraste é um passo para o <Keyword command="ZOOM" id="Previous" /> do <Command id="ZOOM" />, e a execução inteira é um passo de desfazer, então o <Command id="U" /> devolve a vista. Para ver os sólidos como sólidos, e não como arames, use o <Command id="VSCURRENT" />; o 3D do MellowCAD é só de sólidos e ainda parcial.

## Missing

O menu de atalho, com as suas projeções, estilos visuais e outros modos de navegação. Orbitar só em torno dos objetos selecionados. A perspectiva. 3DFORBIT, 3DCORBIT e o resto da navegação 3D do AutoCAD.

## Questions

### Qual é o atalho da órbita 3D no AutoCAD em português?

`O3D`, depois Enter ou a barra de espaço; o comando é ORBITA3D. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_3DORBIT`. Sem digitar nada, segure Shift e o botão da roda e arraste.

### Como orbitar com o mouse?

Segure Shift, pressione o botão da roda e arraste: para os lados para girar o modelo, para cima e para baixo para vê-lo de mais alto ou de mais baixo. Solte e você volta ao comando em que estava.

### Como sair da órbita 3D?

Pressione Enter ou Esc. A vista fica onde você a deixou.

### Como voltar à vista em planta depois de orbitar?

Execute o <Command id="PLAN" /> e pressione Enter, ou o <Command id="-VIEW" /> e <Keyword command="VIEW" id="Top" />, ou clique no topo do ViewCube. O <Command id="ZOOM" /> <Keyword command="ZOOM" id="Previous" /> volta um arraste de cada vez.
