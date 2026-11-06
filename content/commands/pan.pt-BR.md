---
title: "Comando PAN no AutoCAD"
metaTitle: "Comando PAN no AutoCAD: atalho P e -PAN"
description: "Como funciona o PAN (P) do AutoCAD em português: arraste a vista com o cursor de mão ou o botão da roda, o -PAN por dois pontos e o PAN dentro de outro comando."
figure: "O PAN arrastado para a direita e para baixo, e depois Enter: a placa desliza na vista, com as coordenadas intactas."
sourceHash: "0ca3050831f3"
---

O PAN desliza a vista; nada no desenho se move. Ele tem o mesmo nome no AutoCAD em português. Começa com <Message id="panExit" /> e não pergunta mais nada: o cursor vira uma mão, e arrastar com o botão esquerdo move a vista junto, quantas vezes você quiser, até que Enter ou Esc o encerre. Sem o PAN, arrastar com o botão da roda do mouse faz o pan a qualquer momento, mesmo no meio de um comando. Cada PAN é um passo de desfazer, juntado aos ZOOMs e PANs em volta dele, então o <Command id="U" /> devolve a vista. Digitado com um apóstrofo na frente, `'PAN` ou `'P`, ele funciona dentro de outro comando, que continua depois.

O <Command id="-PAN" /> faz o pan por dois pontos: um ponto base e um segundo ponto, e a vista se move pela distância entre eles; ou um deslocamento digitado no primeiro prompt, como `50,0`, e Enter no segundo. Ele também é transparente, e é um passo de desfazer próprio.

## Missing

O menu de atalho que o AutoCAD mostra num clique com o botão direito durante o pan, com Sair, Pan, Zoom, Órbita 3D, Janela de zoom, Zoom original e Zoom estendido.

## Questions

### Qual é o atalho do PAN no AutoCAD?

`P`, depois Enter ou a barra de espaço. Ou nenhum comando: segure a roda do mouse e arraste. O comando tem o mesmo nome no AutoCAD em português, e `_PAN` funciona em qualquer idioma.

### Como fazer pan com o mouse no AutoCAD?

Segure o botão da roda e arraste: a vista acompanha o cursor. Gire a roda para aproximar e afastar o zoom em torno do cursor. Num touchpad, execute o PAN e arraste com o botão esquerdo.

### Como fazer pan enquanto desenha?

Arraste com o botão da roda, ou digite `'P` no prompt do comando: o comando espera enquanto você faz o pan, e depois pergunta de novo onde estava.

### Como fazer pan por uma distância exata?

Use o <Command id="-PAN" />: digite o deslocamento, como `100,0`, e pressione Enter no segundo ponto. A vista se move 100 unidades ao longo de X.
