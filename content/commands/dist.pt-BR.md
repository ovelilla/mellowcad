---
title: "Medir distância no AutoCAD: comando DIST"
metaTitle: "Medir distância no AutoCAD: comando DIST"
description: "Como funciona o DIST (DI) do AutoCAD em português: a distância entre dois pontos com os ângulos e os deltas em X, Y e Z, ou o comprimento de vários trechos."
figure: "O DIST ao longo da diagonal de uma placa de 100 por 60: a distância, o ângulo no plano XY e os deltas."
sourceHash: "31fbe420bc43"
---

O DIST mede a distância entre dois pontos. Indique, com ou sem snap a objetos, ou digite o primeiro ponto e o segundo, e ele escreve no prompt de comando a distância, o ângulo no plano XY e o ângulo a partir dele, e os deltas em X, Y e Z, e encerra. Cada ponto é medido onde está, com o seu Z, então a distância é a verdadeira no espaço. Enter no primeiro ponto parte do último ponto dado, e no segundo mede de volta até o primeiro. Os números seguem a precisão do desenho, e os ângulos o AUPREC.

## Options

### Multiple

<Keyword id="Multiple" />, no segundo prompt: uma série de pontos em vez de um trecho, com a distância acumulada escrita antes de cada ponto seguinte e mostrada acima do cursor, até Enter ou <Keyword id="Total" />.

### Arc

Mede ao longo de arcos, com as opções de arco do <Command id="PLINE" />: <Keyword id="Angle" />, <Keyword id="Center" />, <Keyword id="Close" />, <Keyword id="Direction" />, <Keyword id="Line" />, <Keyword id="Radius" />, <Keyword id="Second pt" />, <Keyword id="Undo" />. O comprimento de cada arco é somado à série.

### Close

Volta ao primeiro ponto, soma esse último trecho, escreve o total e encerra.

### Length

Adiciona um trecho do comprimento que você digita na direção do último.

### Undo

Desfaz o último ponto da série.

### Total

Escreve o total da série e encerra; Enter faz o mesmo.

## Missing

O MEASUREGEOM, as ferramentas Medir da faixa de opções, que pedem os prompts do DIST dentro de um laço com Raio, Ângulo, Área, Volume e Rápido: aqui o botão Distância da faixa executa o DIST. No <Keyword id="Center" /> da opção Arco, o ângulo incluído é lido em graus, onde o AutoCAD 2027 lê ali um número como uma distância na direção do cursor.

## Questions

### Qual é o comando para medir distância no AutoCAD?

DIST, com o atalho `DI`, depois Enter ou a barra de espaço. Ele tem o mesmo nome no AutoCAD em português e em inglês, e `_DIST` funciona em qualquer idioma.

### Como medir uma distância no AutoCAD?

Digite `DI` e indique os dois pontos, com snap a objetos para cair nas extremidades ou nos centros. A distância é escrita no prompt de comando com o ângulo e os deltas.

### Como medir o comprimento total de vários trechos?

No segundo ponto escolha <Keyword id="Multiple" /> e continue indicando: a distância acumulada aparece em cada ponto, e Enter escreve o total.

### Como medir uma distância em 3D?

Dê os pontos com o seu Z, ou use o snap em objetos na altura deles: o DIST mede a distância verdadeira no espaço e escreve o ângulo a partir do plano XY e o delta em Z.

### Por que o DIST mostra menos casas decimais do que eu preciso?

Ele escreve os comprimentos na precisão do desenho, duas casas num desenho novo aqui. Aumente-a no <Command id="UNITS" />, até oito.
