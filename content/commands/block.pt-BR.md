---
title: "Comando BLOCK (BLOCO) no AutoCAD"
metaTitle: "Comando BLOCK (BLOCO) no AutoCAD: criar um bloco"
description: "Como funciona o BLOCK do AutoCAD em português, BLOCO (alias CB), prompt a prompt: nome, ponto base e objetos; redefinir, atributos. Experimente grátis online."
figure: "Uma cadeira, um retângulo e uma linha, transformada no bloco B1: o nome, um ponto base no meio da borda da frente e os dois objetos selecionados."
sourceHash: "ca24f209008c"
---

O BLOCK, BLOCO no AutoCAD em português, guarda um conjunto de objetos no desenho com um nome, para que o <Command id="INSERT" /> possa colocá-lo de novo quantas vezes você quiser, cada cópia uma referência a essa única definição. Ele pede o nome, depois o ponto base de inserção — o ponto pelo qual cada referência é colocada — e depois os objetos. Enter encerra a seleção e define o bloco, e os objetos selecionados viram uma referência a ele, onde estavam. O comando inteiro é um passo que o Desfazer reverte.

O BLOCO do AutoCAD abre a caixa de diálogo Definição de bloco, que o MellowCAD não tem: aqui o BLOCO pede na linha de comando o mesmo que o <Command id="-BLOCK" />, como faz o console do AutoCAD. Um nome pode ter espaços e até 255 caracteres, mas nenhum de `< > / \ " : ; ? * | , =` nem o acento grave: Enter sozinho ou um nome assim mostra <Message id="invalidNewBlockName" /> e pergunta de novo. Um nome que o desenho já tem, em maiúsculas ou minúsculas, pergunta se esse bloco deve ser redefinido, <Keyword id="Yes" /> ou <Keyword id="No" /> (o padrão, que encerra o comando).

## Options

### ?

Lista os blocos do desenho: pergunta quais, `*` (todos) por padrão ou um nome com curingas, escreve os nomes que correspondem e quantos há de cada tipo, e encerra. Os blocos anônimos, como os de uma matriz, são contados, mas nunca nomeados.

## Missing

A caixa de diálogo Definição de bloco do AutoCAD: o BLOCO pergunta na linha de comando. No ponto base, as opções para tornar o bloco anotativo e para manter ou apagar os objetos: aqui eles sempre viram uma referência. ATTREQ 0, que pula a caixa de valores de atributo, e os comandos que sincronizam e ordenam os atributos de um bloco (`_ATTSYNC`, `_ATTREDEF`, `_BATTMAN`, `_BATTORDER`): um bloco redefinido deixa os atributos das suas referências como estavam, como faz o AutoCAD. PorBloco: um objeto dentro de um bloco não pode assumir a cor, o tipo de linha nem a espessura de linha próprios da referência, como faz no AutoCAD um objeto desenhado PorBloco. Num UCS girado, o AutoCAD 2027 desloca os objetos que converte; aqui eles ficam onde estavam, de propósito.

## Questions

### Qual é o comando BLOCK no AutoCAD em português?

BLOCO, com o alias `CB`: no AutoCAD em português, `B` não é comando nenhum. Como lá, o nome em inglês também funciona com um sublinhado na frente: `_BLOCK`. No AutoCAD ele abre a caixa de diálogo Definição de bloco; aqui pergunta na linha de comando, como o `-CB` (<Command id="-BLOCK" />).

### Como criar um bloco no AutoCAD?

Digite `CB` e um nome, indique o ponto base — um canto, ou o meio da borda em que o bloco vai se apoiar — e selecione os objetos. O Enter define o bloco e transforma os objetos numa referência a ele. Uma seleção feita antes do comando também é usada, depois do ponto base.

### Como redefinir um bloco?

Execute o BLOCO com o nome do bloco e responda <Keyword id="Yes" />; depois indique um ponto base e selecione os novos objetos: cada referência ao bloco mostra a nova definição. Os objetos não podem incluir uma referência ao próprio bloco: um conjunto assim é recusado e o comando termina.

### Como criar um bloco com atributos?

Defina antes os atributos com o <Command id="ATTDEF" /> e selecione-os junto com os outros objetos: eles entram no bloco na ordem em que você os seleciona. A referência que os substitui abre uma caixa com um campo por atributo, com o prompt como rótulo e o valor padrão preenchido: Enter aplica os valores, Esc mantém os padrões.

### Como explodir um bloco no AutoCAD?

O <Command id="EXPLODE" /> transforma uma referência de volta nos objetos que ela mostra, um nível de aninhamento por vez, cada um na sua camada e com a sua cor. Os atributos voltam como definições, e os valores se perdem.
