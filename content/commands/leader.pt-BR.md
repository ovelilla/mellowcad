---
title: "Linha de chamada no AutoCAD: comando LINHACHAM (LEADER)"
metaTitle: "Linha de chamada no AutoCAD: LEADER (LINHACHAM)"
description: "Como funciona o LEADER do AutoCAD em português, LINHACHAM (alias LCHAM): uma linha da seta ao texto, a linha no gancho e o formato. Experimente grátis."
figure: "Um furo e a sua nota: LINHACHAM a partir da borda do círculo, dois pontos e depois duas linhas de texto; o último trecho sobe, então uma linha no gancho o liga ao texto."
sourceHash: "1bf39ac320fd"
---

O LEADER, LINHACHAM no AutoCAD em português, desenha uma linha de uma seta até uma nota. Especifique o ponto inicial, onde fica a seta, e depois quantos pontos quiser; a partir do segundo o prompt oferece <Keyword id="Annotation" />, que o Enter também escolhe, <Keyword id="Format" /> e <Keyword id="Undo" />. Enter nos dois primeiros pontos encerra o comando sem desenhar nada. Depois digite a nota linha a linha, Enter após cada uma, e Enter numa linha vazia para terminar: a linha de chamada e o seu texto, um texto multilinha, são criados juntos num só passo, na camada atual com a cor, o tipo de linha e a espessura de linha atuais.

O texto toma a altura, a distância da linha e o lugar do estilo de cota atual: depois do fim da linha de chamada, ou antes quando ela chega pela direita, e acima do último trecho, que continua por baixo do texto. Quando o último trecho sobe mais de 15° em relação à horizontal, o LINHACHAM acrescenta uma linha no gancho, um traço horizontal do comprimento da seta que termina no ponto especificado. A seta é a preenchida fechada, desenhada só quando o primeiro trecho mede pelo menos o dobro dela.

A linha de chamada segue o seu texto: mova, gire ou dimensione o texto e o fim da linha vai com ele, com a linha no gancho refeita; apague o texto e a linha de chamada fica, sem gancho. Uma linha de chamada e o seu texto copiados juntos continuam um par. Os grips da linha de chamada ficam nos seus pontos; a paleta Propriedades mostra o tipo, o tamanho da seta, o deslocamento e a posição do texto, e a escala.

## Options

### Annotation

Pede o texto, linha a linha. Enter na primeira linha pede outro tipo de anotação: <Keyword id="Mtext" /> (o padrão) abre o editor de texto no fim da linha de chamada, onde Enter quebra a linha e Ctrl+Enter ou um clique fora termina; <Keyword id="Copy" /> põe no fim uma cópia do texto multilinha, do texto de linha única ou da referência de bloco que você selecionar, e recusa qualquer outra coisa com <Message id="leaderCopyRefused" />; <Keyword id="None" /> desenha só a linha de chamada.

### Format

Define como a linha de chamada é desenhada e volta aos pontos: <Keyword id="Spline" /> a transforma numa curva suave pelos pontos, <Keyword id="STraight" /> volta aos trechos retos, <Keyword id="Arrow" /> recoloca a seta e <Keyword id="None" /> a tira. Enter deixa o formato como está.

### Undo

Desfaz o último ponto e o pede de novo. No segundo ponto não há nada a desfazer, e <Message id="invalidInputCapital" /> diz isso.

## Missing

As anotações Tolerância e Bloco: o MellowCAD não tem objeto de tolerância geométrica, e um bloco não é inserido de dentro do LINHACHAM, então o prompt de opções oferece Cópia, Nenhum e textoM. As setas que não são a preenchida fechada, e a cor e a espessura de linha próprias da linha de chamada vindas do estilo de cota. O QLEADER e o MLEADER, a linha de chamada rápida e a múltipla, ainda não estão: as linhas de chamada múltipla de um DXF ficam de fora ao abri-lo.

## Questions

### Como se chama o comando linha de chamada em inglês?

LEADER. No AutoCAD em português é LINHACHAM, com os atalhos `LCHAM` e `LEAD`; digite um deles e pressione Enter ou Espaço. `_LEADER` funciona em qualquer idioma do AutoCAD.

### Qual a diferença entre LEADER e MLEADER?

O LEADER é o comando antigo: uma linha de chamada e um texto à parte que a linha segue. O MLEADER, que o AutoCAD recomenda hoje, cria um único objeto de linha de chamada múltipla, com estilos próprios e várias linhas para uma mesma nota. O MellowCAD tem o LEADER; ele abre e salva as linhas de chamada de um arquivo DXF, e deixa de fora as múltiplas.

### Como faço uma linha de chamada com texto?

Execute o LINHACHAM, especifique o ponto para onde ela aponta e depois onde vai o texto, pressione Enter e digite o texto, linha a linha. Enter numa linha vazia termina. Enter na primeira linha mostra as outras anotações, o editor de texto entre elas.

### Como mudo o tamanho da seta da linha de chamada?

Selecione a linha de chamada e mude Tamanho da seta na paleta Propriedades, o que vale só para ela; ou mude o tamanho da seta do estilo de cota, que todas as linhas de chamada desse estilo seguem. O comprimento da linha no gancho segue o tamanho da seta também.

### Por que a linha de chamada não tem seta?

Ou o Nenhum do Formato a tirou, ou o primeiro trecho mede menos que o dobro do tamanho da seta, quando o AutoCAD também não desenha a seta. Especifique o segundo ponto mais longe do primeiro, ou use um tamanho de seta menor.
