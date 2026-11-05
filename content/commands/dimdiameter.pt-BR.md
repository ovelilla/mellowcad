---
title: "Comando DIMDIAMETER (COTADIAMETRO) no AutoCAD"
metaTitle: "Cota de diâmetro no AutoCAD: COTADIAMETRO"
description: "Como cotar o diâmetro de um círculo ou de um arco com o DIMDIAMETER do AutoCAD, COTADIAMETRO em português (atalho CDI). Experimente grátis online."
figure: "Um círculo grande cotado por dentro e um pequeno por fora: cada círculo selecionado e depois o texto colocado."
sourceHash: "76537f5f9854"
---

O DIMDIAMETER, COTADIAMETRO no AutoCAD em português, cota o diâmetro de um círculo, um arco ou um segmento de arco de uma polilinha, com os prompts do <Command id="DIMRADIUS" />: selecione a curva, e a linha de comando diz a medida na hora; depois coloque a cota, e o comando termina. O texto é o diâmetro depois do símbolo de diâmetro. Colocada dentro do círculo, uma linha vai do texto até uma seta na borda; colocada fora, a linha atravessa o círculo de borda a borda, e a seta do outro lado aponta para dentro a partir de um trecho curto, como o ISO-25 a desenha.

## Options

### Text

Pede o texto a escrever no lugar da medida, que ele oferece como padrão: Enter mantém a medida. No que você digita, `<>` representa a medida com o seu símbolo, então `<> PASSANTE` escreve o diâmetro seguido de PASSANTE.

### Angle

Pede o ângulo do texto, que passa a ser desenhado nesse ângulo, com o meio sobre a linha, e a linha para nele. 0 o devolve à linha.

## Missing

A opção de texto multilinha: o texto de uma cota é uma linha só, definida com <Keyword id="Text" /> na linha de comando, nunca no editor de texto. O símbolo é desenhado Ø, onde o AutoCAD escreve ∅: a fonte do desenho não tem ∅. Num arco, as setas ficam entre as pontas dele, enquanto o AutoCAD desenha uma linha de extensão de arco. Como no <Command id="DIMRADIUS" />, uma curva dentro de uma referência de bloco não pode ser selecionada, as linhas de centro do estilo não são desenhadas e os ajustes dele para o texto fora da curva não são oferecidos. Uma cota não é associativa: ela não acompanha a curva que mede.

## Questions

### Qual é o comando DIMDIAMETER no AutoCAD em português?

COTADIAMETRO, com os aliases `CDI` e `DIMDIA`. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_DIMDIAMETER`.

### Como cotar um furo pequeno?

Coloque o texto fora do círculo: a linha de cota então atravessa o furo com uma seta de cada lado, e o texto fica fora dele. Dentro, o texto precisa de espaço no círculo.

### Dá para cotar um arco com o COTADIAMETRO?

Sim: um arco ou um segmento de arco de uma polilinha, como um círculo, e ele dá o diâmetro do círculo do arco. Qualquer outro objeto diz <Message id="notCircleOrArc" /> e pergunta de novo.

### Como acrescentar PASSANTE ou outra nota à cota de diâmetro?

Escolha <Keyword id="Text" /> antes de colocá-la e digite `<> PASSANTE`: `<>` é a medida com o seu símbolo. Depois de colocada, quem a muda é Sobrepor texto, na paleta Propriedades.
