---
title: "Editar texto no AutoCAD: comando EDITARTEXTO (TEXTEDIT)"
metaTitle: "Editar texto no AutoCAD: EDITARTEXTO, ED, DDEDIT"
description: "Como o TEXTEDIT do AutoCAD em português, EDITARTEXTO (alias ED), edita textos, textos multilinha e definições de atributo, um após o outro. Experimente grátis."
figure: "O PALTE mal escrito de uma placa, selecionado com o EDITARTEXTO e redigitado PLATE, e depois Esc para encerrar o comando."
sourceHash: "2d0ed6fe5acc"
---

O TEXTEDIT, EDITARTEXTO no AutoCAD em português, edita objetos de anotação: mostra o modo de edição atual, Múltiplo no início, e pede que você selecione um. Um texto de uma linha abre para ser redigitado onde está, um texto multilinha no editor do <Command id="MTEXT" />, uma definição de atributo com o seu identificador, prompt e valor padrão. No modo Múltiplo, ele pede em seguida o próximo objeto, até que Esc ou Enter encerre o comando, e a execução inteira é um passo que o <Command id="U" /> desfaz. Um clique duplo num texto ou numa definição de atributo executa o EDITARTEXTO, e num texto multilinha abre o editor para esse único objeto.

Esc no editor de um texto de uma linha descarta essa edição e pede o próximo objeto; um segundo Esc encerra o comando. Um objeto numa camada bloqueada mostra <Message id="objectOnLockedLayer" /> e pergunta de novo, e um clique em qualquer outra coisa pergunta de novo em silêncio. Um texto selecionado antes do comando abre na hora.

## Options

### Undo

Desfaz a última edição desta execução e pergunta de novo; sem nenhuma, diz que o comando foi totalmente desfeito.

### Mode

Pede o modo de edição: <Keyword id="Single" /> encerra o comando depois de um objeto, <Keyword id="Multiple" /> pede outro. O modo fica guardado para o próximo EDITARTEXTO, em todos os desenhos.

## Missing

O texto das cotas: o EDITARTEXTO não edita o texto de uma cota, que a opção Texto do <Command id="DIMLINEAR" /> define ao colocá-la. Editar o conteúdo de um texto na paleta Propriedades. O MTEDIT digitado e o -MTEDIT. Enquanto o editor está aberto, a linha de comando mostra `EDITARTEXTO:`, onde o AutoCAD edita no lugar e não pergunta nada.

## Questions

### Qual é o comando TEXTEDIT no AutoCAD em português?

EDITARTEXTO, com o alias `ED`; também `DDEDIT` e `TEDIT`, os nomes antigos do AutoCAD. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_TEXTEDIT`.

### Como editar texto no AutoCAD?

Clique duas vezes nele, ou digite `ED` e selecione-o; redigite-o e pressione Enter. O EDITARTEXTO então pede o próximo texto a editar, até você pressionar Esc. A altura e a rotação dele são linhas da paleta Propriedades, e o estilo, a linha Estilo.

### Como editar vários textos um após o outro?

Deixe o EDITARTEXTO no modo <Keyword id="Multiple" />, o padrão: depois de cada texto, ele pede o próximo. <Keyword id="Mode" /> e <Keyword id="Single" /> fazem com que ele encerre depois de um, como faz um clique duplo.

### Por que o clique duplo não edita o meu texto?

O texto pode estar numa camada bloqueada: desbloqueie a camada no Gerenciador de propriedades de camadas. O texto de uma cota ainda não é editado pelo EDITARTEXTO, e os valores de atributo de um bloco abrem o <Command id="EATTEDIT" />.
