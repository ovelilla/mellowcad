---
title: "Apagar no AutoCAD: comando APAGAR (ERASE)"
description: "Como funciona o ERASE do AutoCAD em português, APAGAR (alias APG): selecione, Enter e pronto; a tecla Delete, apagar tudo e recuperar. Experimente grátis."
figure: "Um retângulo e as suas duas diagonais: uma diagonal selecionada, depois Enter, e ela é apagada."
sourceHash: "2de33971060a"
---

O APAGAR, ERASE no AutoCAD em inglês, tira do desenho os objetos que você seleciona. Selecione-os no prompt `Selecionar objetos:`, clicando neles ou com qualquer um dos modos de seleção do AutoCAD, entre eles uma janela ou uma janela de intersecção, e pressione Enter ou a barra de espaço: eles somem, e o comando não diz mais nada. Esc o encerra sem apagar nada. Como no AutoCAD, se havia objetos selecionados antes do comando, eles são apagados na hora, e a tecla Delete com objetos selecionados executa o APAGAR sobre eles. Enquanto você seleciona, o objeto sob o cursor e os já escolhidos aparecem esmaecidos, como o AutoCAD antecipa o que vai apagar. Todo o apagamento é um passo que o Desfazer reverte.

## Missing

O OOPS, que no AutoCAD recupera o último conjunto que o APAGAR apagou, mesmo depois de outros comandos. Aqui <Command id="U" /> ou Ctrl+Z desfazem o apagamento, com tudo o que veio depois.

## Questions

### Qual é o comando ERASE no AutoCAD em português?

APAGAR, com os aliases `APG` e `DELETE`. Ou selecione os objetos no `Comando:` e pressione a tecla Delete. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_ERASE`.

### Como apagar tudo no AutoCAD?

Execute o APAGAR, digite `_ALL`, o modo que seleciona tudo em qualquer idioma, em `Selecionar objetos:` e pressione Enter. Os objetos de uma camada bloqueada ficam de fora, e a seleção diz quantos eram.

### Como recuperar o que eu apaguei?

Digite <Command id="U" /> ou pressione Ctrl+Z logo em seguida: o apagamento é um único passo de desfazer. O OOPS, que recupera o último conjunto apagado mesmo depois de outros comandos, ainda não foi feito.

### Qual a diferença entre APAGAR e APARAR?

O APAGAR tira objetos inteiros. O <Command id="TRIM" /> tira só a parte de um objeto que passa das arestas que ele encontra, e mantém o resto.
