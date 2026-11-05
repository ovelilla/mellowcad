---
title: "Estilo de cota no AutoCAD: comando ESTILOCOTA (DIMSTYLE)"
metaTitle: "Estilo de cota no AutoCAD: ESTILOCOTA (DIMSTYLE)"
description: "O DIMSTYLE do AutoCAD em português, ESTILOCOTA (alias EC): estilos de cota a partir do ISO-25, altura do texto, setas, escala e separador. Experimente grátis."
figure: "Cotas desenhadas no ISO-25, o estilo atual: setas, o texto acima da linha e uma vírgula como separador decimal."
sourceHash: "a363c0740c11"
---

O DIMSTYLE, ESTILOCOTA no AutoCAD em português, gerencia os estilos de cota do desenho: conjuntos nomeados de configurações, tamanho da seta, altura do texto, escala global, unidades e o resto, que cada cota recebe do seu estilo. Um desenho novo começa com o ISO-25 como estilo atual, o estilo métrico com que o AutoCAD começa. Onde o AutoCAD abre a caixa Gerenciador de estilos de cota, o ESTILOCOTA abre aqui a tabela de cotas da paleta Estilos, uma guia do painel de paletas que fica aberta enquanto você desenha; o <Command id="STYLE" /> abre a mesma paleta nos estilos de texto.

A paleta lista os estilos, com o atual marcado. Novo cria uma cópia do estilo selecionado, com um nome baseado no dele, e a torna atual; um estilo é renomeado na própria lista, e um nome já em uso é recusado. O ISO-25, o estilo atual e um estilo em uso não podem ser excluídos. Abaixo da lista, as configurações do estilo selecionado ficam agrupadas com os nomes das guias do gerenciador: Linhas (espaçamento da linha de base, extensão além das linhas de cota, deslocamento da origem), Símbolos e setas (tamanho da seta, tamanho da marca de centro), Texto (altura do texto, deslocamento a partir da linha de cota), Ajustar (a escala global, e se a linha de cota é desenhada entre as linhas de extensão) e Unidades primárias (precisão, separador decimal, zeros à direita, precisão angular). Uma mudança redesenha na hora todas as cotas daquele estilo. Cada mudança, e cada estilo novo, renomeação, exclusão e troca de estilo atual, é um passo que o Desfazer reverte.

## Missing

A própria caixa Gerenciador de estilos de cota: a paleta não tem visualização, filtro da lista, substituições do estilo, comparação de estilos nem descrição, nem subestilos para um tipo de cota, nem unidades alternativas ou tolerâncias, e só tem as configurações listadas acima. Uma variável de cota digitada na linha de comando, como DIMSCALE, não cria uma substituição do estilo atual. Um desenho novo só tem o ISO-25, sem os estilos Standard e Anotativo que um desenho métrico novo do AutoCAD também contém.

## Questions

### Qual é o comando de estilo de cota no AutoCAD em inglês?

DIMSTYLE, que no AutoCAD em português é ESTILOCOTA, com os aliases `EC` e `DIMSTY`. O nome em inglês funciona com um sublinhado na frente em qualquer idioma do AutoCAD: `_DIMSTYLE`. O <Command id="-DIMSTYLE" /> trabalha na linha de comando: salva as configurações atuais como um estilo novo ou torna atual um estilo pelo nome.

### Como mudar o tamanho do texto da cota no AutoCAD?

Selecione o estilo na paleta e mude Altura do texto, em Texto, ou Usar escala global de, em Ajustar, que multiplica todos os tamanhos do estilo, setas e deslocamentos junto com o texto. Todas as cotas desse estilo são redesenhadas na hora. Para mudar só algumas cotas, dê a elas um estilo próprio.

### Como mudar o estilo de cota de cotas já desenhadas?

Selecione as cotas e escolha o estilo na linha Estilo de cota da paleta Propriedades, ou clique com o botão direito e escolha-o em Estilo da cota: um só passo de desfazer nos dois casos. As cotas novas recebem o estilo atual, que Definir atual na paleta troca.

### Como trocar a vírgula por ponto nas cotas?

O ISO-25 escreve uma vírgula, como `82,5`. Em Unidades primárias, mude Separador decimal para ponto ou espaço; Precisão e Suprimir zeros à direita também estão ali. A linha de comando continua mostrando a medida com ponto, como a do AutoCAD.

### Como copiar um estilo de cota no AutoCAD?

Selecione o estilo de partida e clique em Novo: a cópia recebe um nome baseado no dele, fica como atual e pronta para ser renomeada e alterada. Toda cota desenhada a partir daí usa esse estilo.
