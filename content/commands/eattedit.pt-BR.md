---
title: "Comando EATTEDIT (EDITARATRIBA) no AutoCAD"
metaTitle: "EATTEDIT no AutoCAD: editor de atributos"
description: "Como o EATTEDIT do AutoCAD em português, EDITARATRIBA, edita valores de atributo no Editor de atributos aprimorados, aberto com clique duplo. Experimente."
figure: "Duas mesas, referências a um bloco com os atributos NUM e PART: o EDITARATRIBA seleciona a segunda e o seu campo PART passa a B-200."
sourceHash: "3517c89fd5da"
---

O EATTEDIT, EDITARATRIBA no AutoCAD em português, abre o Editor de atributos aprimorados do AutoCAD para uma referência de bloco: pede que você selecione um bloco e mostra um campo para cada um dos seus atributos, rotulado pelo identificador e preenchido com o valor, como a guia Atributo do editor os lista. Redigite os valores, com Tab passando de campo em campo, e Enter os aplica num passo que o <Command id="U" /> desfaz; Esc não muda nada.

Um clique duplo numa referência com atributos executa o EDITARATRIBA, como no AutoCAD: a linha de comando o escreve com o ponto clicado como resposta, e a caixa abre na hora. A seleção pega o objeto sob a caixa de seleção do cursor: qualquer coisa que não seja uma referência de bloco é recusada, assim como um bloco sem atributos, e a pergunta se repete. Só a referência selecionada muda; a definição do bloco e as suas outras referências mantêm os seus valores.

## Missing

A guia Opções de texto do editor (estilo, justificação, altura, rotação, fator de largura e o resto do texto de cada atributo) e a sua guia Propriedades (camada, tipo de linha, cor, espessura de linha), e o seu botão Selecionar bloco. O ATTIPEDIT, que edita um atributo no lugar, e o seu Ctrl+clique duplo. A alça própria de um atributo desbloqueado numa referência, e as linhas de atributos da paleta Propriedades. O `-EDITARATRIB`.

## Questions

### Como abrir o Editor de atributos aprimorados no AutoCAD?

Clique duas vezes numa referência de bloco que tenha atributos, ou digite `EDITARATRIBA`, que não tem alias, e selecione-a. O nome em inglês funciona com um sublinhado na frente em qualquer idioma do AutoCAD: `_EATTEDIT`.

### Como mudar o valor de um atributo no AutoCAD?

Clique duas vezes no bloco, digite o novo valor no campo do atributo e pressione Enter. Cada referência mantém os seus próprios valores: mudar uma deixa as outras como estão.

### Por que o clique duplo não edita os atributos do bloco?

O EDITARATRIBA abre para uma referência cujo bloco tem atributos, e um bloco criado sem eles não tem nenhum: defina-os com o <Command id="ATTDEF" /> e selecione-os junto com os outros objetos ao criar o bloco. Se o valor de um atributo não aparece, confira o <Command id="ATTDISP" />, que pode ocultar os atributos invisíveis ou todos eles.

### Qual é a diferença entre EDITARATRIBA e EDITARATRIB?

Eles editam os mesmos valores. O EDITARATRIBA rotula cada campo pelo identificador, como a guia Atributo do Editor de atributos aprimorados; o <Command id="ATTEDIT" />, pelo prompt, como a caixa de diálogo Editar atributos. No AutoCAD, o EDITARATRIBA também edita as opções de texto e as propriedades de cada atributo.
