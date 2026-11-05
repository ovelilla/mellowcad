---
title: "Comando ARRAY (MATRIZ) no AutoCAD"
description: "Como funciona o ARRAY do AutoCAD em português, MATRIZ (alias MA), prompt a prompt: matriz retangular, polar ou de caminho, editada ao vivo. Experimente grátis."
figure: "Um quadrado e seu círculo em matriz com os valores padrão: Enter para uma retangular, 4 colunas e 3 linhas."
sourceHash: "5e0a412c9f13"
---

O ARRAY, MATRIZ no AutoCAD em português, copia uma seleção num padrão: em colunas e linhas, em volta de um centro ou ao longo de um caminho. Ele pede os objetos e depois o tipo de matriz, e o Enter escolhe a retangular; então passa a seleção ao <Command id="ARRAYRECT" />, ao <Command id="ARRAYPOLAR" /> ou ao <Command id="ARRAYPATH" />, que continuam sem pedir os objetos de novo. Cada um mostra a matriz na hora e a edita ao vivo, com suas opções e suas alças, até o Enter criá-la: um objeto de matriz, ou cópias soltas se você disse que ela não deve ser associativa. A execução inteira é um só passo que o Desfazer reverte, e o Enter no prompt de comando repete o MATRIZ.

## Options

### Rectangular

Colunas e linhas, e níveis empilhados em Z se você quiser: <Command id="ARRAYRECT" />. Começa com 4 colunas e 3 linhas, afastadas uma vez e meia o tamanho da seleção.

### PAth

Ao longo de uma linha, um arco, um círculo ou uma polilinha: <Command id="ARRAYPATH" />. Pede a curva de caminho e distribui os itens ao longo dela, cada um girado conforme o caminho gira.

### POlar

Em volta de um ponto central: <Command id="ARRAYPOLAR" />. Pede o centro e começa com 6 itens numa volta completa.

## Missing

O tipo oferecido é sempre <Keyword id="Rectangular" />: a ARRAYTYPE, a variável que define o padrão do AutoCAD, não é lida.

## Questions

### Qual é o comando ARRAY no AutoCAD em português?

MATRIZ, com o alias `MA`. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_ARRAY`. <Command id="ARRAYRECT" />, <Command id="ARRAYPOLAR" /> e <Command id="ARRAYPATH" /> não têm alias e, digitados por inteiro, pulam a pergunta do tipo.

### Como fazer um array polar?

Escolha <Keyword id="POlar" />, ou execute o <Command id="ARRAYPOLAR" />, e indique o ponto central: a seleção é copiada em volta dele, com 6 itens no início. Mude quantos são com <Keyword command="ARRAYPOLAR" id="Items" />, e o ângulo que ocupam com <Keyword command="ARRAYPOLAR" id="Fill angle" />.

### Como explodir um array?

Selecione-o e execute o <Command id="EXPLODE" />: a matriz vira os objetos dos seus itens, cada objeto na sua própria camada. Para ter cópias soltas desde o início, responda <Keyword command="ARRAYRECT" id="No" /> a <Keyword command="ARRAYRECT" id="ASsociative" /> antes de pressionar Enter.

### Como alterar um array depois de criado?

Selecione-o. As alças o alteram: o quadrado no ponto base o move, as setas definem as quantidades e os espaçamentos, e um número digitado enquanto uma seta de quantidade está ativa é a quantidade. A paleta Propriedades mostra as colunas, linhas e espaçamentos, ou os itens e ângulos, para digitá-los de novo. O ARRAYEDIT ainda não existe.
