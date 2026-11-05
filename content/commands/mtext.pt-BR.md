---
title: "Comando MTEXT (TEXTOM) no AutoCAD"
metaTitle: "Caixa de texto no AutoCAD: MTEXT (TEXTOM)"
description: "O MTEXT do AutoCAD em português, TEXTOM (alias T): dois cantos ou Largura, Altura, Justificar e espaçamento de linha, parágrafos num objeto. Experimente grátis."
figure: "Uma nota numa caixa: primeiro a altura, depois o canto oposto, e um parágrafo ajustado à largura entre eles."
sourceHash: "a53001f9674d"
---

O MTEXT, TEXTOM no AutoCAD em português, escreve texto multilinha: um só objeto com parágrafos que se ajustam a uma largura. Você especifica um primeiro canto e o oposto, e a caixa entre eles define a largura; depois digita num editor desenhado no lugar, onde Enter começa um novo parágrafo e Ctrl+Enter, ou um clique fora do quadro, mantém o texto. Esc com algo digitado pergunta se você quer salvá-lo, como a caixa de alterações não salvas do AutoCAD. Para linhas que sejam cada uma um objeto próprio, use o <Command id="TEXT" />.

A primeira linha mostra o estilo e a altura atuais. Cada opção é pedida no prompt do canto oposto e volta a ele, então uma execução define a altura, a justificação e o resto antes de fechar a caixa. As palavras passam para a linha seguinte onde uma linha passaria da largura, e uma palavra mais longa que a largura fica para fora. A altura é compartilhada com o <Command id="TEXT" /> e fica guardada no desenho; a justificação, a rotação e o espaçamento de linha voltam ao padrão a cada execução. O <Command id="-MTEXT" /> pergunta o mesmo e depois recebe o texto na linha de comando, uma linha por vez.

## Options

### Height

Define a altura do texto, digitada ou como a distância do primeiro canto até um ponto; precisa ser maior que zero. Fica para a próxima execução e para o <Command id="TEXT" />.

### Justify

Define de qual dos nove pontos da caixa o texto fica pendurado: superior esquerdo por padrão, ou superior, meio e inferior por esquerda, centro e direita, como o prompt os lista. O texto fica preso a esse ponto da caixa, seja qual for o sentido em que a caixa foi arrastada.

### Line spacing

Pede o tipo, pelo menos (o padrão), que abre espaço para uma linha com letras mais altas, ou exatamente, e depois um fator escrito com x, como `2x`, ou uma distância. O espaçamento simples é 1x, e o fator vai de 0.25x a 4x.

### Rotation

Gira a caixa e o seu texto, por um ângulo digitado ou indicado a partir do primeiro canto.

### Style

Torna atual um estilo de texto, pelo nome; <Keyword id="?" /> lista os estilos do desenho, e um nome que o desenho não tem é recusado. Os estilos são criados na paleta que o <Command id="STYLE" /> abre.

### Width

Pede a largura em vez do canto oposto, digitada ou como a distância até um ponto, e depois abre o editor. Uma largura 0, ou Enter, deixa as linhas sem ajuste, cada uma do tamanho em que foi digitada.

## Missing

As colunas, que o AutoCAD 2027 lista no prompt do canto oposto, não são oferecidas. A formatação dentro do texto, como a altura, a fonte ou a cor de uma palavra, frações empilhadas ou sublinhado, não é desenhada nem aplicada, e o editor não tem régua, tabulações, recuos, listas nem a guia Editor de texto da faixa de opções, nem um cursor sobre o desenho. Não há máscara de fundo nem quadro de texto, altura definida, escala anotativa ou snap ao objeto Nó nos seus cantos, e um clique dentro da sua caixa o seleciona mesmo fora das letras, onde o AutoCAD não seleciona nada.

## Questions

### Qual é o comando MTEXT no AutoCAD em português?

TEXTOM, com os aliases `T` e `TXM`. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_MTEXT`. O <Command id="-MTEXT" />, `-T`, pergunta o mesmo e recebe o texto na linha de comando.

### Como quebrar linha no texto multilinha?

Pressione Enter: começa um novo parágrafo. Dentro de um parágrafo, as linhas se ajustam sozinhas à largura da caixa. Ctrl+Enter, ou um clique fora do quadro, fecha o editor e mantém o texto.

### Como mudar a largura de um texto multilinha?

Selecione-o e arraste a alça do lado: o texto se ajusta de novo à largura, a partir do seu ponto de justificação. A linha Largura definida da paleta Propriedades faz o mesmo por número, e as linhas de espaçamento de linha mudam o espaçamento.

### Como explodir um texto multilinha no AutoCAD?

Use o <Command id="EXPLODE" />: cada linha dele vira um <Command id="TEXT" />, justificado à esquerda onde a linha estava, como no AutoCAD. Para redigitá-lo, em vez disso, clique duas vezes nele e o editor se abre.
