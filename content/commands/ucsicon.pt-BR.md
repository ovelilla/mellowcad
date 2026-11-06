---
title: "Comando UCSICON (ICONEUCS) no AutoCAD"
metaTitle: "Ícone UCS no AutoCAD: UCSICON (ICONEUCS)"
description: "Como o UCSICON do AutoCAD em português, ICONEUCS, mostra, oculta e posiciona o ícone UCS: ATIVADO, DESATIVADO, Sem origem e Origem. Teste grátis."
figure: "O ICONEUCS Sem origem manda o ícone para o canto; o UCS leva a origem ao degrau do bloco, e Origem desenha o ícone ali, com o X vermelho, o Y verde e o Z azul."
sourceHash: "c431e70eda01"
---

O UCSICON, ICONEUCS no AutoCAD em português, mostra ou oculta o ícone UCS, os braços X e Y que mostram onde está o UCS atual e para onde ele aponta, e diz onde o ícone fica: na origem do UCS ou no canto inferior esquerdo do desenho. O seu único prompt oferece o estado atual como padrão, então o Enter o mantém. A configuração é salva no desenho, e cada ICONEUCS é um passo de desfazer.

O ícone é o 3D do AutoCAD 2027: um braço para o X e um para o Y, uma letra na ponta de cada um, e um quadrado na origem enquanto o UCS é o universal. Fora da vista em planta, um braço Z mostra para onde aponta o Z do UCS, e um braço visto de topo é omitido. Na Estrutura de arame 2D ele é branco; no Oculto e no Conceitual, o X é vermelho, o Y verde e o Z azul. Digitado com um apóstrofo, `'UCSICON` define a variável UCSICON, cujo nome é o mesmo em todos os idiomas, em vez de executar o comando, mesmo dentro de outro comando: de 0 a 3, onde 1 mostra o ícone e 2 o põe na origem.

## Options

### ON

Mostra o ícone.

### OFF

Oculta o ícone. O UCS continua lá, e o que você desenha continua ficando nele.

### Noorigin

Mantém o ícone no canto inferior esquerdo do desenho, onde quer que esteja a origem.

### ORigin

Desenha o ícone na origem do UCS, o padrão. Quando a origem está fora da tela, ou tão perto da borda que o ícone não caberia, o ícone vai para o canto inferior esquerdo até a origem voltar a aparecer.

## Missing

Todos, que no AutoCAD aplica a configuração a todas as viewports (aqui há uma só); Selecionável, as alças do ícone; e Propriedades, a caixa de diálogo Ícone UCS, com o estilo 2D, o tamanho, a espessura da linha e as cores.

## Questions

### Como desativar o ícone UCS no AutoCAD?

Digite `ICONEUCS`, pressione Enter e depois <Keyword id="OFF" />. <Keyword id="ON" /> o traz de volta.

### Como colocar o ícone UCS na origem?

ICONEUCS, depois <Keyword id="ORigin" />: o ícone fica na origem do UCS. Se ele continua no canto, a origem está fora da tela ou perto demais da borda: faça um pan ou afaste o zoom. <Keyword id="Noorigin" /> o mantém no canto.

### O que significa o quadrado no ícone UCS?

Que o UCS é o sistema de coordenadas universal. Mova ou gire o UCS com o <Command id="UCS" /> e o quadrado some; o <Command id="UCS" /> e Enter trazem o universal de volta, e o quadrado com ele.

### Como mudar o estilo, o tamanho ou a cor do ícone UCS?

No AutoCAD, com as Propriedades do ICONEUCS, a caixa de diálogo Ícone UCS. O MellowCAD ainda não a tem: o ícone é desenhado como o AutoCAD 2027 o desenha por padrão, no estilo 3D.
