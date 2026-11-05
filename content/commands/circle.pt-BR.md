---
title: "Comando CIRCLE (CIRCULO) no AutoCAD"
description: "Como funciona o CIRCLE do AutoCAD em português, CIRCULO (alias CI), prompt a prompt: centro e raio ou Diâmetro, 2P, 3P e Ttr. Experimente grátis online."
figure: "Três círculos: centro e raio, as duas pontas de um diâmetro (2P), e centro e Diâmetro."
sourceHash: "62e25bc029f9"
---

O CIRCLE, CIRCULO no AutoCAD em português, desenha um círculo a partir do centro e do raio, digitado ou dado por um ponto do círculo, ou de qualquer das outras formas que o primeiro prompt oferece. Enter no raio repete o tamanho do último círculo, guardado para o desenho. Enquanto você dá o raio, uma linha tracejada âmbar vai do centro ao cursor, e passa da borda quando você dá o diâmetro, como o AutoCAD a desenha. O círculo fica no plano do primeiro ponto, na elevação atual se o ponto não tem um Z próprio.

## Options

### 3P

Por três pontos. Digitado com snaps Tangente, `_TAN` em cada um, é o Tan, Tan, Tan do AutoCAD: o círculo tangente a três objetos.

### 2P

Pelas duas pontas de um diâmetro.

### Ttr

Tangente a dois objetos, com um raio: selecione cada linha, círculo ou arco perto de onde o círculo deve tocá-lo e depois dê o raio. Dos círculos que cabem, ele desenha o que toca mais perto das suas seleções; quando nenhum cabe, diz <Message id="circleDoesNotExist" />.

### Diameter

No prompt do raio: dê o diâmetro no lugar dele, digitado ou como um ponto.

## Missing

Ttr sobre um segmento de polilinha, que o AutoCAD aceita e o MellowCAD recusa; a entrada Tan, Tan, Tan da paleta de ferramentas (digitado, 3P com três snaps Tangente, funciona); as propriedades rápidas com um clique duplo num círculo.

## Questions

### Qual é o comando CIRCLE no AutoCAD em português?

CIRCULO, com o alias `CI`. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_CIRCLE`.

### Como desenhar um círculo tangente a duas linhas?

Escolha <Keyword id="Ttr" />, selecione a primeira linha e depois a segunda, perto de onde o círculo deve tocá-las, e digite o raio.

### Como desenhar um círculo tangente a três objetos?

Escolha <Keyword id="3P" /> e digite `_TAN` antes de cada um dos três pontos, selecionando cada objeto perto de onde o círculo deve tocá-lo.

### Como desenhar um círculo pelo diâmetro?

Dê o centro, escolha <Keyword id="Diameter" /> e digite-o. Ou escolha <Keyword id="2P" /> e dê as duas pontas do diâmetro.
