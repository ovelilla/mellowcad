---
title: "Comando PURGE (ELIMINAR) no AutoCAD"
metaTitle: "PURGE no AutoCAD: eliminar blocos não usados"
description: "Como o PURGE do AutoCAD em português, ELIMINAR (alias ELM), exclui os blocos e tipos de linha que nada usa, por nome ou todos, e os aninhados. Experimente."
figure: "Dois blocos, TAG colocado numa parede e BOX, cuja única referência foi apagada: o ELIMINAR, todos os nomes, sem verificar, exclui só o BOX."
sourceHash: "7a22ff19d409"
---

O PURGE, ELIMINAR no AutoCAD em português, remove o que um desenho define mas não usa; aqui, os blocos e os tipos de linha. O ELIMINAR do AutoCAD abre a caixa de diálogo Eliminar; o MellowCAD não a tem, então o ELIMINAR pergunta na linha de comando o mesmo que o <Command id="-PURGE" />, como faz o console do AutoCAD. Ele mostra as configurações Itens aninhados e Dados órfãos, ambas desativadas, e pergunta que tipo de objetos não usados eliminar, oferecendo <Keyword id="Blocks" /> e <Keyword id="LTypes" />; Enter ali o encerra.

Um bloco está em uso enquanto uma referência no desenho o coloca, ou a definição de um bloco em uso o contém, em qualquer profundidade. Apagar a última referência de um bloco deixa a definição dele no desenho, onde o <Command id="INSERT" /> pode colocá-lo de novo: é o ELIMINAR que a exclui. Um bloco contido num bloco que fica nunca é eliminado, e uma cadeia de blocos que só contêm uns aos outros sai numa só execução. Sem nenhum a eliminar, ele diz <Message id="noUnreferencedBlocks" />. Cada execução é um passo que o <Command id="U" /> desfaz.

## Options

### Blocks

Pede os nomes a eliminar, `*` para todos os blocos não usados por padrão, ou nomes com curingas, separados por vírgulas. Depois pergunta se cada nome deve ser verificado: <Keyword id="Yes" />, o padrão, pergunta sobre cada bloco antes de excluí-lo, <Keyword id="No" /> exclui todos e diz cada nome e quantos foram.

### LTypes

Pede os nomes e se cada um deve ser verificado, como o <Keyword id="Blocks" />, e exclui os tipos de linha que nada usa. Continuous, o tipo de linha atual e um que uma camada ou um objeto usa, dentro de um bloco também, sempre ficam; sem nenhum a eliminar, ele diz <Message id="noUnreferencedLinetypes" />. A opção Carregar do <Command id="LINETYPE" /> o traz de volta.

## Missing

A caixa de diálogo Eliminar, e todos os outros tipos: camadas, estilos de texto e de cota, grupos, materiais, estilos de linha de chamada múltipla, de tabela e visuais, aplicativos registrados, geometria de comprimento zero, objetos de texto vazios, dados órfãos e Todos. As configurações Itens aninhados e Dados órfãos não podem ser alteradas.

## Questions

### Qual é o comando PURGE no AutoCAD em português?

ELIMINAR, com o alias `ELM`; `PU` não é comando nenhum no AutoCAD em português. `-ELM` é o <Command id="-PURGE" />, a forma de linha de comando, que aqui o ELIMINAR também executa. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_PURGE`.

### Como eliminar blocos não usados no AutoCAD?

Digite `ELM`, escolha <Keyword id="Blocks" />, pressione Enter para todos os nomes e responda <Keyword id="No" /> para excluí-los todos sem perguntar sobre cada um.

### Por que não consigo eliminar um bloco?

Porque ele está em uso: uma referência no desenho o coloca, ou um bloco em uso o contém, talvez aninhado vários níveis abaixo. Apague as referências dele, ou exploda os blocos que o contêm, e o ELIMINAR pode excluí-lo.

### Como eliminar layers no AutoCAD?

No AutoCAD, com o tipo Camadas do ELIMINAR. Aqui ainda não, porque o ELIMINAR só elimina blocos e tipos de linha; exclua uma camada vazia no Gerenciador de propriedades de camadas.
