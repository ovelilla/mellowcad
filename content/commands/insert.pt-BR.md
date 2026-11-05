---
title: "Comando INSERT (INSERIR) no AutoCAD"
description: "Como inserir um bloco com o INSERT do AutoCAD em português, INSERIR (alias I): a paleta Blocos, ou -INSERIR com escala, rotação e atributos. Experimente grátis."
figure: "Uma cadeira transformada em bloco e depois inserida duas vezes junto a uma mesa: girada 180 depois do ponto e 90 com Rotacionar antes dele."
sourceHash: "e9859c7871f3"
---

O INSERT, INSERIR no AutoCAD em português, coloca um bloco definido no desenho como referência: mais uma cópia dele, com ponto, escala e rotação próprios, desenhada a partir da única definição que o <Command id="BLOCK" /> criou. Como o INSERIR do AutoCAD 2027, ele abre a paleta Blocos, que mostra os blocos do desenho; clique num deles e a linha de comando pede o ponto de inserção, com o bloco arrastado sob o cursor, e depois a escala e a rotação. A paleta continua aberta, então um bloco atrás do outro é um clique em cada um.

O <Command id="-INSERT" /> pede tudo na linha de comando: o nome do bloco (Enter aceita o oferecido: o último inserido ou, senão, o último definido), o ponto de inserção, o fator de escala X, o fator de escala Y (Enter usa o de X) e o ângulo de rotação. Um fator negativo espelha o bloco, e dois diferentes o esticam: um círculo dentro dele é desenhado como elipse. Um bloco com atributos pede depois cada valor pelo seu prompt, oferecendo o padrão. Os objetos do bloco na camada 0 assumem a camada da referência; os outros mantêm a sua. Cada inserção é um passo que o Desfazer reverte.

## Options

### ?

No nome do bloco: lista os blocos do desenho, como o <Command id="BLOCK" />, e encerra.

### Scale

No ponto de inserção: pede um fator para os dois eixos e volta a pedir o ponto, com o bloco arrastado nesse tamanho. Depois do ponto, os fatores X e Y não são perguntados.

### Rotate

No ponto de inserção: pede o ângulo, digitado ou entre dois pontos, e volta a pedir o ponto, com o bloco arrastado já girado. Depois do ponto, a rotação não é perguntada.

## Missing

Inserir outro arquivo de desenho: só blocos definidos no desenho podem ser inseridos, e um nome que ele não tem é recusado. No ponto de inserção, as opções de ponto base, X, Y, Z, explodir e repetir; na escala X, Canto e XYZ, e indicar um ponto como canto oposto. Com fatores X e Y diferentes, um texto ou um atributo é desenhado no tamanho de X em vez de esticado, e o arco de uma polilinha continua sendo arco; um X negativo não escreve um texto ao contrário. ATTDIA 1, a caixa de diálogo de atributos ao inserir, e ATTREQ 0. As linhas de anotativo e de unidades do bloco na paleta Propriedades. PorBloco: um objeto dentro de um bloco não pode assumir a cor, o tipo de linha nem a espessura de linha próprios da referência, como faz no AutoCAD um objeto desenhado PorBloco.

## Questions

### Qual é o comando INSERT no AutoCAD em português?

INSERIR, com o alias `I`. Ele abre a paleta Blocos, como no AutoCAD 2027; `-I` é o <Command id="-INSERT" />, que pergunta na linha de comando. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_INSERT`.

### Como inserir um bloco no AutoCAD?

Digite `I` e clique no bloco na paleta Blocos, ou digite `-I` e o nome dele; indique o ponto de inserção e responda a escala e a rotação, com Enter para cada padrão. <Keyword id="?" /> no nome lista os blocos que existem.

### Como inserir um bloco na escala do desenho?

Digite o fator de escala X depois do ponto de inserção, e Enter no de Y para que fiquem iguais; ou escolha <Keyword id="Scale" /> antes do ponto e digite um fator para os dois. Um bloco definido no próprio desenho já está nas unidades dele: na escala 1, ele entra no tamanho em que foi desenhado.

### Como inserir um bloco de outro desenho?

Não a partir do arquivo: o INSERIR só coloca blocos definidos no desenho. Copie uma referência (Ctrl+C), abra o desenho em que você a quer e cole (Ctrl+V): o bloco vem com ela, a não ser que esse desenho já tenha um bloco com esse nome, cuja definição é mantida.
