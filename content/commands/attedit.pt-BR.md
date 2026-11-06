---
title: "Editar atributos no AutoCAD: comando ATTEDIT (EDITARATRIB)"
metaTitle: "Editar atributos de bloco no AutoCAD: ATTEDIT"
description: "Como o ATTEDIT do AutoCAD em português, EDITARATRIB (alias EAT), muda os valores dos atributos de uma referência de bloco, num só passo. Experimente grátis."
figure: "Três etiquetas de porta, referências a um bloco com o atributo NUM: o EDITARATRIB seleciona a última, inserida como 2, e a sua caixa a muda para 3."
sourceHash: "4a8ee28ecc53"
---

O ATTEDIT, EDITARATRIB no AutoCAD em português, muda os valores dos atributos de uma referência de bloco. Ele pede que você selecione a referência e abre uma caixa com um campo para cada um dos seus atributos, com o prompt do atributo como rótulo e o valor preenchido, como a caixa de diálogo Editar atributos do AutoCAD. Redigite os valores, com Tab passando de um campo ao seguinte, e Enter, o OK do AutoCAD, os aplica num passo que o <Command id="U" /> desfaz; Esc, o seu Cancelar, não muda nada.

A seleção pega o objeto sob a caixa de seleção do cursor. Qualquer coisa que não seja uma referência de bloco é recusada, assim como uma referência cujo bloco não tem atributos, e a pergunta se repete; um clique no vazio pergunta de novo em silêncio. A definição do bloco não muda, nem as suas outras referências: cada uma guarda os seus próprios valores. O <Command id="EATTEDIT" /> edita os mesmos valores numa caixa rotulada pelo identificador, e um clique duplo numa referência com atributos o executa.

## Missing

O `-EDITARATRIB`, a forma de linha de comando que edita os atributos um a um ou globalmente, e o seu alias `-EAT`. Os botões Anterior e Avançar da caixa Editar atributos, para um bloco com mais atributos do que cabem numa página, e a sua linha Nome do bloco. O ATTIPEDIT, que edita um atributo no lugar, e o seu Ctrl+clique duplo. A alça própria de um atributo desbloqueado numa referência, e as linhas de atributos da paleta Propriedades.

## Questions

### Qual é o comando ATTEDIT no AutoCAD em português?

EDITARATRIB, com os aliases `EAT` e `EATRIBD`; `ATE` não é comando nenhum no AutoCAD em português. Como lá, o nome em inglês também funciona com um sublinhado na frente: `_ATTEDIT`.

### Como editar atributos de bloco no AutoCAD?

Digite `EAT` e selecione a referência, ou clique duas vezes nela, o que executa o <Command id="EATTEDIT" />. Mude os valores na caixa e pressione Enter. Para mudar os próprios atributos, o identificador, o prompt ou a posição, edite as definições e redefina o bloco com o <Command id="BLOCK" />.

### Por que o EDITARATRIB diz que o bloco não tem atributos editáveis?

Porque o bloco da referência selecionada não tem atributos: o EDITARATRIB edita os valores de uma referência a um bloco que os tem. Uma definição que ainda não entrou num bloco é editada com o <Command id="TEXTEDIT" />, com um clique duplo nela.

### Qual é a diferença entre EDITARATRIB e EDITARATRIBA?

Os dois editam os valores de uma referência. A caixa do EDITARATRIB rotula cada campo pelo prompt do atributo, como a caixa de diálogo Editar atributos do AutoCAD; a do <Command id="EATTEDIT" />, o Editor de atributos aprimorados, pelo identificador. No AutoCAD, o EDITARATRIBA também tem guias para as opções de texto e as propriedades de cada atributo.
