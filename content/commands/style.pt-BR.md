---
title: "Estilo de texto no AutoCAD: comando STYLE (ESTILO)"
metaTitle: "Estilo de texto no AutoCAD: STYLE (ESTILO)"
description: "Como o STYLE do AutoCAD em português, ESTILO (alias ET), gerencia os estilos de texto: novo, renomear, excluir, definir atual e altura fixa. Experimente grátis."
figure: "Uma placa de identificação: o ESTILO, depois o TEXTO, cujo Estilo ? lista o estilo do desenho, Standard em Arial, e o nome da placa escrito nele."
sourceHash: "5e9a49c82ada"
---

O STYLE, ESTILO no AutoCAD em português, gerencia os estilos de texto do desenho: aquilo com que um texto é escrito. Todo texto, texto multilinha e atributo tem um estilo, e os novos recebem o estilo atual, Standard num desenho novo. O ESTILO abre a caixa de diálogo Estilo de texto, como no AutoCAD. Uma seleção feita antes dele é descartada, como a caixa de diálogo a descarta, e digitado com um apóstrofo dentro de um comando, `'ESTILO`, ele abre sem encerrar esse comando, que continua assim que a caixa de diálogo fecha.

A caixa de diálogo mostra o estilo atual e lista os estilos, todos os estilos ou só os estilos em uso. Novo... pede um nome, oferecendo o primeiro livre entre `estilo1`, `estilo2`…, e cria uma cópia do estilo selecionado, já como atual. Definir atual torna atual o estilo selecionado; F2 edita o nome dele, e um nome já em uso, em maiúsculas ou minúsculas, é recusado, como o AutoCAD o recusa. Excluir remove um estilo, mas nunca o Standard, o estilo atual ou um em uso. Altura dá a um estilo uma altura fixa, aplicada com Aplicar: 0, o padrão, a deixa livre, e o <Command id="TEXT" /> pede uma a cada vez; com uma altura definida, o TEXTO não pergunta. Cancelar descarta uma altura não aplicada, e passa a se chamar Fechar assim que algo mudou. Tudo o que se faz na caixa de diálogo é um só passo que o <Command id="U" /> desfaz. Com textos selecionados, a linha Estilo da paleta Propriedades dá a eles outro estilo, num só passo.

## Missing

A visualização da caixa de diálogo. Fonte, estilo da fonte e fonte grande, fator de largura, ângulo oblíquo e os efeitos De cabeça para baixo, Invertido e Vertical: todo estilo é desenhado em Arial, sem inclinação, com largura 1. Estilos anotativos, e o estilo Anotativo que um desenho novo do AutoCAD tem ao lado do Standard. O `-ESTILO`, que pergunta tudo na linha de comando.

## Questions

### Qual é o comando de estilo de texto no AutoCAD em português?

ESTILO, com os aliases `ET` e `DDSTYLE`; `ST` não é comando nenhum no AutoCAD em português. Em inglês o comando é STYLE, que funciona com um sublinhado na frente em qualquer idioma do AutoCAD: `_STYLE`.

### Como mudar o estilo de texto no AutoCAD?

Para textos novos, torne o estilo atual com Definir atual na caixa de diálogo que o ESTILO abre, ou com a opção <Keyword command="TEXT" id="Style" /> do <Command id="TEXT" />. Para textos já escritos, selecione-os e escolha o estilo na linha Estilo da paleta Propriedades.

### Como mudar a fonte de um estilo de texto?

No AutoCAD, em Nome da fonte, na caixa de diálogo Estilo de texto. Aqui ainda não: todo estilo é desenhado em Arial, e um estilo só difere pelo nome e pela altura.

### Por que o TEXTO não pede a altura?

O estilo atual tem uma altura própria. Defina a altura dele como 0 na caixa de diálogo Estilo de texto, depois Aplicar, e o <Command id="TEXT" /> volta a pedir a altura, oferecendo a última usada.
