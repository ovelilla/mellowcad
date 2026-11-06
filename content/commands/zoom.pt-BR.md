---
title: "Comando ZOOM no AutoCAD: opções e atalhos"
metaTitle: "Comando ZOOM no AutoCAD: opções e atalhos"
description: "Como funciona o ZOOM (Z) do AutoCAD em português: ESTendido, Janela, Anterior, ESCala com nX, Objeto e TOtal, a roda do mouse e o zoom transparente."
figure: "Uma placa com um furo pequeno perto do canto: ZOOM ESTendido e depois uma janela em volta do furo, que então enche a vista."
sourceHash: "cd72af4956e4"
---

O ZOOM aumenta ou diminui a vista; nada no desenho se move nem muda de tamanho. O seu primeiro prompt aceita um canto, que começa uma janela, um fator de escala ou uma opção. Digitado com um apóstrofo na frente, `'ZOOM` ou `'Z`, ele funciona dentro de outro comando, que continua depois. A roda do mouse aproxima e afasta em torno do cursor, e um clique duplo no botão da roda é o ZOOM Estendido. Cada ZOOM é um passo de desfazer, e vários seguidos um só, então o <Command id="U" /> também devolve a vista.

## Options

### All

Enquadra tudo o que está desenhado, como <Keyword id="Extents" />.

### Extents

Enquadra tudo o que está desenhado, tão grande quanto a janela permite. Sem nada desenhado, diz <Message id="regeneratingModel" />, e digitado dentro de outro comando recusa com <Message id="requiresRegen" />, como o do AutoCAD.

### Previous

Volta à vista anterior, até 20 vistas atrás. Se não sobrar nenhuma: <Message id="noPreviousView" />.

### Scale

Um fator: `2X` aproxima o dobro da vista atual, `0.5X` a metade, e `2` sem o X o dobro da escala da vista do ZOOM Total. `nXP`, o fator do espaço do papel, é lido como `nX`: aqui só há o espaço do modelo. Um fator digitado no primeiro prompt faz o mesmo sem escolher a opção.

### Window

Dois cantos, indicados ou arrastados, enquadram esse retângulo. Um canto indicado no primeiro prompt faz o mesmo.

### Object

Enquadra os objetos que você seleciona, ou os selecionados antes do ZOOM.

## Missing

Tempo real: Enter no primeiro prompt encerra o ZOOM, onde o AutoCAD começa a dar zoom com o mouse; aqui a roda faz isso. Dinâmico, Centro e os ocultos Esquerda e Vmax.

## Questions

### Qual é o atalho do ZOOM no AutoCAD?

`Z`, depois Enter ou a barra de espaço. O comando tem o mesmo nome no AutoCAD em português, e `_ZOOM` funciona em qualquer idioma. Para o Estendido, digite em seguida a letra de <Keyword id="Extents" />.

### Como dar zoom para ver o desenho inteiro?

<Keyword id="Extents" />: digite `Z`, Enter, a letra da opção e Enter. Ou dê um clique duplo no botão da roda do mouse.

### O que significa ZOOM XP no AutoCAD?

`nXP` ajusta uma viewport de layout a uma escala em relação ao espaço do papel: `1/50XP` mostra o modelo em 1:50 na folha. O MellowCAD não tem layouts, então `XP` é lido como `X`.

### Como dar zoom num objeto no AutoCAD?

Escolha <Keyword id="Object" /> e selecione-o, ou selecione-o antes e execute o ZOOM Objeto: a vista o enquadra.

### Como voltar à vista anterior?

<Keyword id="Previous" />, de novo e de novo para as vistas de antes, até 20.
