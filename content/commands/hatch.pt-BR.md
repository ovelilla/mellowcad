---
title: "Hachura no AutoCAD: comando HACHURA (HATCH)"
description: "Como funciona o HATCH do AutoCAD em português, HACHURA (alias HC): ponto interno ou objetos, padrão, escala, ângulo e ilhas. Experimente grátis online."
figure: "Um retângulo com um círculo dentro, hachurado com ANSI31 a partir de um ponto interno: o círculo fica livre, como ilha."
sourceHash: "d3ed16b85a19"
---

O HATCH, HACHURA no AutoCAD em português, preenche uma área fechada com um padrão de linhas, ou sólido. Indique um ponto dentro da área e ele encontra o limite nos objetos ao redor, deixando livre como ilha o que está dentro — um círculo num retângulo, um texto —; ou selecione os objetos que a limitam. Indique quantas áreas quiser: Enter, ou Esc, faz uma só hachura de todas, na camada atual e atrás do seu limite. O comando inteiro é um passo que o Desfazer reverte.

A HACHURA do AutoCAD define o padrão na guia contextual Criação de hachura ou numa caixa de diálogo, que o MellowCAD não tem: aqui ela pergunta na linha de comando o mesmo que o <Command id="-HATCH" />, com o padrão em <Keyword id="Properties" />. Os dois só diferem no Esc, que no <Command id="-HATCH" /> descarta as áreas. Cada hachura começa com o padrão, a escala e o ângulo dados à anterior: ANGLE, na escala 1 e ângulo 0, num desenho novo.

## Options

### Properties

Pede o nome do padrão, em maiúsculas ou minúsculas, oferecendo o atual: <Keyword id="Solid" /> preenche a área, e <Keyword id="?" /> lista os padrões com as suas descrições e volta ao ponto. Para um padrão, pede depois a escala — um número maior que 0, ou dois pontos medidos — e o ângulo, digitado ou por dois pontos. A próxima hachura mantém os três.

<Session name="hatchPatterns" caption="SOLID e onze padrões do acadiso.pat, cada um hachurado num quadrado de 30 de lado na escala 1, e AR-CONC e AR-SAND em 0.08 e 0.1." />

### Select objects

Em vez de um ponto interno, selecione os objetos que limitam a área; Enter volta ao ponto. Um objeto que não fecha nenhuma área fica de fora; quando nenhum limita uma, Enter mostra <Message id="unableToHatchBoundary" /> e não faz nada. Uma região dá o seu contorno, e os seus furos como ilhas.

### Undo

Não aparece no prompt, mas é aceito nele: desfaz as áreas do último ponto indicado e pergunta de novo, sem mexer nos objetos selecionados. Mostra <Message id="noBoundaryToUndo" /> quando não resta nenhum ponto para desfazer.

## Missing

Elipses e splines como limite: uma área que elas fecham não é encontrada, e uma região com uma aresta assim fica de fora. Tolerância de lacunas (HPGAPTOL): a área tem que estar totalmente fechada. Hachuras associativas, os estilos de ilha Normal e Ignorar, gradientes, padrões definidos pelo usuário e o resto dos padrões do acadiso.pat. As outras opções do <Command id="-HATCH" />: desenhar um limite, remover limites, opções avançadas, ordem de desenho, origem, anotativo, cor, camada e transparência. A edição de hachuras (`_HATCHEDIT`) e a sua guia contextual, que no AutoCAD um clique duplo abre. MIRRHATCH 1: uma hachura espelhada sempre mantém o ângulo do seu padrão. Os menus dos grips de uma hachura.

## Questions

### Qual é o comando HATCH no AutoCAD em português?

HACHURA, com o alias `HC`: no AutoCAD em português, `H` é outro comando. Como lá, o nome em inglês também funciona com um sublinhado na frente: `_HATCH`. Sem a guia Criação de hachura, ele pergunta na linha de comando, como o <Command id="-HATCH" />.

### Por que a hachura não funciona no AutoCAD?

Quase sempre porque a área não está fechada: ela mostra <Message id="hatchNoBoundary" />, e a menor lacuna basta, porque nada a fecha. Feche o contorno e indique o ponto de novo. Uma área fechada por uma elipse ou uma spline ainda não é encontrada, e os objetos numa camada desativada não são vistos.

### Quais padrões de hachura existem, e posso baixar outros?

Uma seleção do acadiso.pat, o arquivo de padrões métrico do AutoCAD: SOLID, ANGLE, de ANSI31 a ANSI38, AR-CONC, AR-SAND, BRICK, CROSS, DASH, DOTS, EARTH, HONEY, LINE, NET, NET3, SQUARE, STEEL e ZIGZAG. <Keyword id="?" /> em <Keyword id="Properties" /> os lista. Ainda não é possível carregar um arquivo de padrões próprio ou baixado.

### Como mudar a escala da hachura?

Antes de indicar o ponto, em <Keyword id="Properties" />: a escala vem depois do nome do padrão. Depois de feita, selecione a hachura e mude Escala na paleta Propriedades, ou dê a ela o padrão, a escala e o ângulo de outra com o <Command id="MATCHPROP" />. Uma escala tão pequena que o padrão precisaria de linhas demais mostra <Message id="hatchTooDense" /> e não faz a hachura.

### Como calcular a área de uma hachura?

Selecione-a e leia Área em Geometria, na paleta Propriedades, sem as ilhas; com várias selecionadas, Área cumulativa as soma. Ou execute o <Command id="AREA" />, escolha <Keyword command="AREA" id="Object" /> e selecione a hachura.
