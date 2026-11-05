---
title: "Comando LAYER (CAMADA) no AutoCAD"
metaTitle: "Layers no AutoCAD: comando LAYER (CAMADA)"
description: "O LAYER do AutoCAD em português, CAMADA (alias CA): Gerenciador de propriedades de camadas, criar, excluir, desativar e bloquear layers. Experimente grátis."
figure: "Três camadas, cada uma tornada atual antes de desenhar nela: as paredes em branco, uma porta em amarelo e um eixo em vermelho, traço e ponto."
sourceHash: "0d282504181d"
---

O LAYER, CAMADA no AutoCAD em português, abre o Gerenciador de propriedades de camadas, onde as camadas do desenho são criadas, nomeadas e configuradas. Como no AutoCAD, é uma paleta e não uma caixa de diálogo: fica aberta enquanto você desenha, aqui como uma guia do painel de paletas, até o <Command id="LAYERCLOSE" /> fechá-la, e digitado com um apóstrofo na frente dentro de outro comando, ele se abre sem encerrar esse comando. Todo objeto está numa camada, e a cor, o tipo de linha e a espessura de linha dele, quando são PorCamada, são os da camada. Os objetos novos vão para a camada atual.

Cada camada é uma linha, com as colunas na ordem do AutoCAD: Status, com uma marca na camada atual, depois Nome, Ativado, Bloquear, Cor, Tipo de linha e Espessura de linha, e quantos objetos ela contém; as linhas ficam ordenadas por nome. Nova camada acrescenta uma camada com a cor, o tipo de linha e a espessura de linha da selecionada, com o nome pronto para digitar, e deixa a camada atual como estava. Definir atual, ou um clique duplo numa linha, torna uma camada atual. Um clique no nome da camada selecionada, ou F2, a renomeia, e um nome em uso ou com caracteres que o AutoCAD não aceita é recusado, como renomear a camada 0. Excluir camada remove uma camada, mas nunca a camada 0, a atual ou uma que contenha objetos: a caixa Camada – Não excluída do AutoCAD diz quais. Cada mudança no gerenciador é um passo que o Desfazer reverte, e as consecutivas, juntas.

## Missing

-CAMADA, LAYDEL e as outras ferramentas do painel Camadas: a que torna atual a camada de um objeto, a que corresponde camadas, a da camada anterior e o resto, e os ícones de ativar, congelar e bloquear da sua lista suspensa. As camadas não podem ser congeladas, e o gerenciador não tem as colunas de congelar, plotar, transparência, estilo de plotagem, congelar em novas janelas de visualização nem descrição, nem reordenação das colunas, filtros de camadas, árvore ou caixa de configurações. Executar o CAMADA não é um passo de desfazer próprio. Uma camada nova é ordenada na hora, enquanto o AutoCAD a mostra abaixo da selecionada até ser renomeada, e a espessura de linha da camada 0 é 0,25 mm, não Padrão. LAYLOCKFADECTL não pode ser digitada: os objetos de uma camada bloqueada ficam sempre esmaecidos pela metade.

## Questions

### Qual é o comando LAYER no AutoCAD em português?

CAMADA, com os aliases `CA`, `LAYER` e `DDLMODES`. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_LAYER`. Ele abre o Gerenciador de propriedades de camadas, que o <Command id="LAYERCLOSE" /> fecha.

### Como mudar um objeto de layer no AutoCAD?

Selecione o objeto e escolha a camada na lista suspensa Camadas da barra superior: ele passa para ela num só passo de desfazer, e a camada atual continua a mesma. A linha Camada da paleta Propriedades faz o mesmo. Sem nada selecionado, a lista suspensa torna atual a camada escolhida.

### Como apagar um layer no AutoCAD?

Selecione-o no Gerenciador de propriedades de camadas e clique em Excluir camada. A camada 0, a camada atual e uma camada que contém objetos, também dentro de uma definição de bloco, não podem ser excluídas: apague ou mude de camada os objetos dela e torne outra camada atual antes.

### Qual é a diferença entre desativar e bloquear um layer?

Uma camada desativada esconde os seus objetos: eles não podem ser selecionados nem pegos por snap ao objeto, e saem da seleção. Os objetos de uma camada bloqueada continuam à vista, esmaecidos, e aceitam snap ao objeto e seleção, mas nenhum comando os modifica: o comando que os recebe os conta e os deixa de fora. Desativar a camada atual pergunta antes, como no AutoCAD.

### Como criar um novo layer no AutoCAD?

Clique em Nova camada no Gerenciador de propriedades de camadas e digite o nome: a camada recebe a cor, o tipo de linha e a espessura de linha da selecionada, que você depois muda na linha dela. Torne-a atual para desenhar nela.
