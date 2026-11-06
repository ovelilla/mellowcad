---
title: "Comando REDO (REFAZER) no AutoCAD"
metaTitle: "REDO (REFAZER) no AutoCAD: Ctrl+Y e REFAZERM"
description: "Como funciona o REDO do AutoCAD em português, REFAZER: devolve o que o último D ou DESFAZER desfez, logo depois; REFAZERM e Ctrl+Y refazem passo a passo."
figure: "Um furo desenhado numa placa, desfeito com o D e devolvido com o REFAZER."
sourceHash: "be2e44b98ac0"
---

O REDO, REFAZER no AutoCAD em português, reverte o último <Command id="U" /> ou <Command id="UNDO" />: o que ele desfez é desenhado de novo, por inteiro, então depois de um DESFAZER de cinco comandos o REFAZER devolve os cinco. Ele escreve os nomes dos comandos enquanto isso, e depois <Message id="everythingRedone" /> quando não sobra nada a refazer. Não pergunta nada e não tem opções.

Ele só funciona logo depois do desfazer. Em qualquer outro momento diz <Message id="redoMustFollowUndo" />, e depois que outro comando foi executado, mesmo um que não muda nada, como o LISTA ou o ZOOM, <Message id="nothingToRedo" />. Com o desfazer desativado pelo Controle Nenhum do DESFAZER, o REFAZER diz que está desativado.

O <Command id="MREDO" /> refaz passo a passo: pede um número de ações, ou <Keyword command="MREDO" id="All" /> ou <Keyword command="MREDO" id="Last" />, e refaz essa quantidade dos passos que os desfazer desfizeram, quaisquer que sejam os D, DESFAZER e REFAZER executados desde então; Último é o último desfazer inteiro, uma vez (<Message id="alreadyRedone" />). Ctrl+Y e o Refazer do menu de atalho executam o REFAZERM com 1, cancelando o comando em andamento.

## Missing

Ctrl+Shift+Z também refaz, em silêncio, embora o AutoCAD não associe nada a ele. Os botões Desfazer e Refazer da barra superior não escrevem nada no histórico, onde a barra de ferramentas de acesso rápido do AutoCAD escreve as suas linhas.

## Questions

### Qual é o atalho do REFAZER no AutoCAD?

Ctrl+Y, que refaz um passo (REFAZERM 1). O REFAZER em si não tem alias: digite `REFAZER`, ou `_REDO` em qualquer idioma do AutoCAD.

### Por que o REFAZER não funciona?

O REFAZER só reverte o D ou o DESFAZER logo antes dele. Depois de qualquer outro comando não há nada a refazer, mesmo que ele não tenha mudado nada: desfaça e refaça em seguida.

### Qual é a diferença entre o REDO e o MREDO (REFAZER e REFAZERM)?

O REFAZER devolve o último desfazer inteiro, e só logo depois dele. O <Command id="MREDO" /> refaz um número dos passos desfeitos, um a um, ou todos, e ainda funciona depois de um REFAZER.

### Como repetir o último comando no AutoCAD?

Pressione Enter ou a barra de espaço no prompt Comando: o último comando começa de novo. O REFAZER não repete um comando; ele reverte um desfazer.
