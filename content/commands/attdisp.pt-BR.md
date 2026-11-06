---
title: "Comando ATTDISP (VISATRIB) no AutoCAD"
metaTitle: "ATTDISP no AutoCAD: exibir ou ocultar atributos"
description: "Como o ATTDISP do AutoCAD em português, VISATRIB, exibe os atributos: Normal, Ativado mostra os invisíveis, Desativado oculta todos. Experimente grátis."
figure: "Duas mesas cujos números de peça são atributos invisíveis: o VISATRIB Ativado os mostra embaixo de cada mesa, ao lado dos números visíveis."
sourceHash: "8821fdeb2077"
---

O ATTDISP, VISATRIB no AutoCAD em português, define quais atributos as referências de bloco do desenho mostram. Ele pede a configuração, oferecendo a atual, Normal num desenho novo; qualquer outra palavra é recusada como palavra-chave inválida e a pergunta se repete, e Enter mantém a atual. Uma mudança redesenha o desenho inteiro, `Regenerando modelo.` como diz o AutoCAD 2027 em português, e é salva com o desenho como ATTMODE, um passo que o <Command id="U" /> desfaz. Digitado com um apóstrofo dentro de um comando, ele também funciona ali.

Ele só muda o que aparece: um atributo invisível mantém o seu valor, e um oculto ainda pode ser editado com o <Command id="ATTEDIT" /> ou o <Command id="EATTEDIT" />.

## Options

### Normal

Mostra cada atributo como foi definido: os visíveis, não os definidos com o modo <Keyword command="ATTDEF" id="Invisible" /> do <Command id="ATTDEF" />.

### ON

Mostra todos os atributos, também os invisíveis.

### OFF

Oculta todos os atributos, também os visíveis.

## Questions

### Como mostrar atributos invisíveis no AutoCAD?

Digite `VISATRIB` e escolha <Keyword id="ON" />: todos os atributos aparecem, também os invisíveis. <Keyword id="Normal" /> volta a ocultá-los. O nome em inglês funciona com um sublinhado na frente em qualquer idioma do AutoCAD: `_ATTDISP`.

### Por que os atributos do bloco não aparecem?

O <Command id="ATTDISP" /> pode estar em <Keyword id="OFF" />, que oculta todos os atributos, ou em <Keyword id="Normal" /> com os atributos definidos como invisíveis. Escolha <Keyword id="ON" /> para ver todos. Uma referência cujo bloco não tem atributos não mostra nenhum, qualquer que seja a configuração.

### Como ocultar os valores dos atributos no AutoCAD?

Defina-os como invisíveis: o modo <Keyword command="ATTDEF" id="Invisible" /> do <Command id="ATTDEF" />, antes de criar o bloco. O VISATRIB <Keyword id="OFF" /> oculta todos os atributos de uma vez, no desenho inteiro.
