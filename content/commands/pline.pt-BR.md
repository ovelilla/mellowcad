---
title: "Polilinha no AutoCAD: comando PLINHA (PLINE)"
description: "Como funciona a polyline do AutoCAD em português, PLINHA (PLINE, alias PL), prompt a prompt: linhas e arcos, Largura, Comprimento e Fechar. Experimente grátis."
figure: "Uma linha, um arco tangente e uma linha de volta, e uma ponta de largura 10 a 0: uma só polilinha."
sourceHash: "216b83656483"
---

O PLINE, PLINHA no AutoCAD em português, desenha uma polilinha: um só objeto feito de segmentos retos e arcos unidos pelas pontas, cada um com sua largura. Depois do ponto inicial ele mostra a largura atual; em seguida, cada ponto acrescenta um segmento, até o Enter ou <Keyword id="Close" /> encerrá-lo. Como no AutoCAD, ele começa com linhas: <Keyword id="Arc" /> passa para arcos, cada um tangente ao segmento anterior, e <Keyword id="Line" /> volta às linhas. Enter no ponto inicial continua a partir do fim da última linha, arco ou polilinha desenhados.

## Options

### Arc

Modo arco: cada ponto final desenha um arco tangente ao último segmento ou, se for o primeiro, saindo na direção em que termina a última linha, arco ou polilinha desenhados. Segure Ctrl para inverter o sentido. As opções abaixo dão forma ao próximo arco.

### Close

Aparece assim que há um segmento: fecha a polilinha até o início e encerra o comando; no modo arco, com um arco tangente.

### Halfwidth

Como <Keyword id="Width" />, mas cada largura é medida do centro do segmento até a borda.

### Length

Uma linha do comprimento que você der, na direção em que a polilinha segue: ao longo do último segmento, ou tangente ao último arco. Um comprimento negativo volta para trás.

### Undo

Desfaz o último segmento e continua no modo do anterior. Quando não resta nenhum, avisa <Message id="allSegmentsUndone" />

### Width

A largura inicial e depois a final, cada uma digitada ou indicada a partir do último vértice: de 10 a 0 ela se estreita até um ponto, como uma ponta de seta. A largura final continua nos segmentos seguintes e, como PLINEWID, na próxima polilinha.

### Angle

Modo arco: o ângulo incluído do arco e depois o ponto final, o centro ou o raio.

### Center

Modo arco: o centro do arco e depois o ponto final, o ângulo incluído ou o comprimento da corda.

### Direction

Modo arco: a direção em que o arco sai do último vértice, no lugar da tangente, e depois o ponto final.

### Line

Modo arco: volta aos segmentos retos.

### Radius

Modo arco: o raio do arco e depois o ponto final ou o ângulo incluído. Um raio negativo desenha o arco maior.

### Second pt

Modo arco: um ponto por onde o arco passa e depois o ponto final: um arco por três pontos.

## Missing

PLINEGEN: uma polilinha nova aplica o tipo de linha segmento a segmento, como com PLINEGEN 0 (<Keyword command="PEDIT" id="Ltype gen" /> do <Command id="PEDIT" /> o ativa numa polilinha). Um tipo de linha tracejado num segmento com largura é desenhado contínuo. A visualização de um segmento com largura não é desenhada num tom mais apagado, e o prompt do arco é escrito numa só linha, onde o AutoCAD o divide em duas.

## Questions

### Qual é o comando polyline (PLINE) no AutoCAD em português?

PLINHA, com o alias `PL`. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_PLINE`.

### Como fazer uma polyline curva?

Escolha <Keyword id="Arc" />: cada ponto passa a terminar um arco tangente ao segmento anterior, até <Keyword id="Line" />. Para suavizar pelos vértices uma polilinha já desenhada, use o <Command id="PEDIT" /> e a opção <Keyword command="PEDIT" id="Fit" /> ou <Keyword command="PEDIT" id="Spline" />.

### Como engrossar uma polilinha?

Escolha <Keyword id="Width" /> e dê a largura inicial e a final. Essa largura fica guardada, e a próxima polilinha começa com ela, como diz a linha depois do ponto inicial: dê 0 duas vezes para voltar a desenhar fino. Com o <Command id="FILL" /> desativado, as polilinhas com largura aparecem só pelo contorno.

### Como unir linhas numa polyline?

Execute o <Command id="JOIN" /> e selecione linhas, arcos e polilinhas que se tocam pelas pontas: cada cadeia vira uma polilinha. Ou execute o <Command id="PEDIT" /> numa linha, responda <Keyword command="PEDIT" id="Yes" /> para transformá-la em polilinha e acrescente as outras com <Keyword command="PEDIT" id="Join" />.

### Como medir uma polilinha?

Execute o <Command id="AREA" />, pressione Enter para escolher <Keyword command="AREA" id="Object" /> e selecione a polilinha: uma fechada mostra a área e o perímetro; uma aberta, o comprimento.
