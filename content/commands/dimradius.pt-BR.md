---
title: "Comando DIMRADIUS (COTARAIOS) no AutoCAD"
metaTitle: "Cota de raio no AutoCAD: DIMRADIUS (COTARAIOS)"
description: "Como cotar o raio de um arco, um círculo ou uma concordância com o DIMRADIUS do AutoCAD, COTARAIOS em português (atalho CRA). Experimente grátis online."
figure: "O canto arredondado de uma placa cotado por fora e o furo por dentro: cada curva selecionada e depois o texto colocado."
sourceHash: "6b1cdea584be"
---

O DIMRADIUS, COTARAIOS no AutoCAD em português, cota o raio de um círculo, um arco ou um segmento de arco de uma polilinha. Selecione a curva, e a linha de comando diz a medida na hora; depois coloque a cota, e o comando termina. Como no AutoCAD, o texto é o raio depois de um R, numa linha na direção de um raio que termina numa seta sobre a curva, por dentro ou por fora dela, conforme onde você a coloca. Por fora, a linha continua através da curva até o centro, como o ISO-25 a desenha.

## Options

### Text

Pede o texto a escrever no lugar da medida, que ele oferece como padrão: Enter mantém a medida. No que você digita, `<>` representa a medida com o seu R, então `<> TÍP.` escreve `R10 TÍP.` para um raio de 10.

### Angle

Pede o ângulo do texto, que passa a ser desenhado nesse ângulo, com o meio sobre a linha, e a linha para nele. 0 o devolve à linha.

## Missing

A opção de texto multilinha: o texto de uma cota é uma linha só, definida com <Keyword id="Text" /> na linha de comando, nunca no editor de texto. Num arco, a seta fica entre as pontas dele, enquanto o AutoCAD desenha uma linha de extensão de arco até uma cota colocada além delas. Uma curva dentro de uma referência de bloco não pode ser selecionada. As linhas de centro do estilo (um tamanho de marca de centro negativo) não são desenhadas, e os ajustes dele para o texto fora da curva não são oferecidos: o texto vai sempre ao longo da linha, sem trecho horizontal, como o ISO-25 o desenha. Uma cota não é associativa: ela não acompanha a curva que mede.

## Questions

### Qual é o comando DIMRADIUS no AutoCAD em português?

COTARAIOS, com os aliases `CRA` e `DIMRAD`. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_DIMRADIUS`.

### Como cotar uma concordância ou um canto arredondado?

Selecione o arredondamento: uma concordância é um arco, ou um segmento de arco de uma polilinha, como os cantos que o <Command id="RECTANG" /> arredonda com a opção <Keyword command="RECTANG" id="Fillet" />, e o COTARAIOS aceita os dois.

### Por que não consigo selecionar o objeto a cotar?

O COTARAIOS aceita um círculo, um arco ou um segmento de arco de uma polilinha, também numa camada bloqueada. Qualquer outro objeto, uma elipse inclusive, diz <Message id="notCircleOrArc" /> e pergunta de novo; uma curva dentro de uma referência de bloco ainda não pode ser selecionada.

### Como acrescentar um texto à cota de raio?

Escolha <Keyword id="Text" /> antes de colocá-la e digite `<> TÍP.`: `<>` é a medida com o seu R, então a cota diz `R10 TÍP.`. Depois de colocada, quem a muda é Sobrepor texto, na paleta Propriedades.
