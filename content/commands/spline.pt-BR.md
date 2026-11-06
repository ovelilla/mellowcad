---
title: "Comando SPLINE no AutoCAD: curvas spline"
description: "Como funciona o SPLINE (SPL) do AutoCAD em português: uma curva por pontos de ajuste ou por vértices de controle, Nós, Grau, tangentes e Fechar. Experimente."
figure: "Uma spline de ajuste por cinco pontos e, abaixo, uma spline VC sobre cinco vértices dispostos do mesmo jeito: a primeira passa por eles, a segunda se aproxima deles."
sourceHash: "1056b5067125"
---

O SPLINE desenha uma curva suave de duas maneiras: passando pelos pontos que você dá (Ajustar, o padrão) ou puxada pelos vértices de controle que você posiciona (VC). Ele começa mostrando as configurações, `Método=Ajustar Nós=Banzo`, e pede o primeiro ponto; Enter ali é recusado, como no AutoCAD. Cada ponto seguinte curva a spline, cuja imagem acompanha o cursor, e Enter a encerra. Os pontos são indicados, com ou sem snap a objetos, ou digitados; um comprimento digitado segue a direção do cursor, e cada ponto mantém o seu Z, então uma spline pode subir no espaço. Esc descarta a curva; a spline inteira é um único passo que o <Command id="U" /> desfaz. Os botões Spline de ajuste e Spline VC da faixa de opções executam o SPLINE com o método já respondido.

## Options

### Method

<Keyword id="Fit" /> ou <Keyword id="CV" />. Uma spline de ajuste passa por cada ponto que você dá; uma de vértices de controle passa só pelo primeiro e pelo último, e os outros a puxam, então ela sai mais suave e mais longe deles. O método, como os nós e o grau, vale pelo resto da sessão.

### Knots

Como uma spline de ajuste distribui os pontos ao longo da curva: <Keyword id="Chord" /> (o padrão, pela distância entre eles), <Keyword id="Square root" /> dessa distância ou <Keyword id="Uniform" />, todos iguais. Pelos mesmos pontos, cada um dá uma curva um pouco diferente.

### Degree

O grau de uma spline VC, de 1 (retas entre os vértices) a 10; 3, o padrão, é uma cúbica. Com menos vértices do que o grau pede, a curva fica com o maior grau possível.

### Object

Converte uma polilinha ajustada pela opção Spline do <Command id="PEDIT" />, 2D ou 3D, numa spline VC da mesma curva e apaga a polilinha, num único passo. Qualquer outra coisa é recusada com <Message id="onlySplineFittedPolylines" />.

### start Tangency

Oferecida depois do primeiro ponto: a direção em que a curva sai dele, indicada ou digitada a partir desse ponto.

### end Tangency

A direção em que a curva chega ao último ponto; depois a spline termina.

### Undo

Desfaz o último ponto, até o primeiro.

### Close

A partir do terceiro ponto: liga o fim ao começo num laço suave, sem canto, e encerra o comando.

## Missing

A tolerância de ajuste: uma spline de ajuste passa sempre exatamente pelos pontos, e a opção de tolerância não é oferecida. Enquanto é desenhada, a spline ainda não é um objeto para o snap ou o rastreamento, como é no AutoCAD. Objeto sempre apaga a polilinha (DELOBJ). Numa spline pronta não há CVSHOW nem CVHIDE nem os menus de grip para adicionar ou remover um ponto; a paleta Propriedades edita os pontos, mas não o método, o grau, os nós, os pesos nem o fechamento, e Centro geométrico, Perpendicular e Tangente não a encontram. O <Command id="HATCH" /> não reconhece uma spline como contorno, e o BLEND ainda não existe.

## Questions

### Qual é o atalho do SPLINE no AutoCAD?

`SPL`, depois Enter ou a barra de espaço. O comando tem o mesmo nome no AutoCAD em português, e `_SPLINE` funciona em qualquer idioma.

### Qual é a diferença entre Ajustar e VC?

Uma spline de ajuste passa pelos pontos que você clica, o que serve quando a curva precisa tocá-los. Uma VC é formada pelos vértices de controle, dos quais ela só se aproxima, o que dá uma forma suave e regular. A escolha é feita com <Keyword id="Method" /> no primeiro prompt.

### Como converter uma spline em polilinha?

Execute o <Command id="PEDIT" /> e selecione a spline: ele diz <Message id="objectNotPolyline" />, oferece transformá-la e pede uma precisão de 0 a 99, 10 por padrão. A polilinha acompanha a spline com segmentos retos curtos, mais do que o AutoCAD faz.

### Como converter uma polilinha em spline?

Ajuste a polilinha com a opção Spline do <Command id="PEDIT" />, depois execute o SPLINE e escolha <Keyword id="Object" />: a polilinha vira uma spline da mesma curva.

### Dá para explodir uma spline no AutoCAD?

Não: o <Command id="EXPLODE" /> recusa uma spline, como no AutoCAD. Para quebrá-la em pedaços, converta-a antes em polilinha com o <Command id="PEDIT" /> e exploda a polilinha em linhas.
