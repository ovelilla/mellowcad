---
title: "Comando UCS no AutoCAD 3D"
metaTitle: "Comando UCS no AutoCAD 3D: opções e Universal"
description: "Como o UCS do AutoCAD em português (alias UCSDD) move e gira as coordenadas: origem, 3 pontos, Objeto, Vista, X, Y, Z, Nomeado e Universal. Teste grátis."
figure: "Uma caixa vista do sudeste: o UCS leva a origem ao topo dela, e um círculo desenhado em 30,20 depois disso fica na face de cima, não no chão."
sourceHash: "8ac3b844fe16"
---

O UCS, com o mesmo nome no AutoCAD em português, define o sistema de coordenadas do usuário: uma origem e os eixos X e Y em qualquer lugar do espaço, de modo que o plano XY dele pode ficar inclinado. As coordenadas que você digita são lidas nele, e o que você desenha fica no plano XY dele: com a origem levada ao topo de uma caixa, um círculo com centro em `30,20` fica no topo. Primeiro ele diz o nome do UCS atual — `*UNIVERSAL*`, `*SEM NOME*` ou o nome com que foi salvo — e depois pede a nova origem ou uma opção; o Enter ali volta ao Universal. Um ponto é a origem, com o seu Z, e um ponto sem Z fica na elevação atual. Depois, um ponto no lado positivo do eixo X e um ponto no plano XY, lidos no UCS atual: o Enter em qualquer um deles mantém os eixos como estão. Um ponto move o UCS; três o giram de qualquer jeito.

Os comandos então trabalham no plano XY do UCS: o <Command id="LINE" /> e o <Command id="CIRCLE" /> desenham nele, e o <Command id="BOX" /> e o <Command id="EXTRUDE" /> sobem a partir dele pelo seu Z. Cada objeto mantém o seu próprio plano quando o UCS muda, e o <Command id="PLAN" /> mostra o UCS atual visto de cima, em planta. O UCS é salvo no desenho, e cada execução é um passo de desfazer. O 3D do MellowCAD é só de sólidos e ainda parcial.

## Options

### Face

Listada como o AutoCAD 2027 a lista, para alinhar o UCS a uma face de um sólido. O MellowCAD pede a face, mas ainda não se alinha a nenhuma: nenhum clique encontra uma.

### NAmed

Os UCSs salvos, por nome. <Keyword id="Save" /> guarda o atual, perguntando <Keyword id="Yes" /> ou <Keyword id="No" /> antes de substituir um nome já salvo; <Keyword id="Restore" /> torna atual um dos salvos, com o nome digitado em maiúsculas ou minúsculas; <Keyword id="Delete" /> aceita nomes, com vírgulas e curingas; <Keyword id="?" /> os lista, cada um com a sua origem e os seus eixos. Um nome pode ter espaços, mas não `<>/\":;|,=*?` nem um acento grave: <Message id="invalidUcsName" />.

### OBject

Alinha o UCS a um objeto que você seleciona: uma linha, um círculo, um arco, uma elipse, uma polilinha, uma spline, um texto, um texto multilinha, uma definição de atributo ou uma referência de bloco. A origem e o eixo X vão para onde o AutoCAD os põe em cada tipo, e o Z é a normal do próprio objeto, então o UCS fica no plano do objeto. Um objeto numa camada bloqueada pode ser selecionado. Uma hachura diz <Message id="ucsNoCoordinateSystem" />, e o UCS termina com o UCS como estava.

### Previous

Volta ao UCS anterior, até dez para trás numa sessão, entre eles os nomeados e os ortogonais. Quando não resta nenhum: <Message id="noPreviousUcs" />.

### View

Gira o plano XY até ficar perpendicular à sua linha de visão, com o X na horizontal da tela, mantendo a origem: um texto desenhado depois dele fica plano na tela de uma vista 3D.

### World

Volta ao sistema de coordenadas universal, que nunca se move. É o padrão do primeiro prompt, então o Enter ali o escolhe, e também volta a elevação a 0.

### X

Gira o UCS em torno do seu eixo X: 90 graus por padrão, um ângulo digitado ou um ponto que o dá. Um ângulo positivo gira pela regra da mão direita, então 90 põe o plano XY de pé sobre o antigo eixo X.

### Y

Gira o UCS em torno do seu eixo Y, como <Keyword id="X" /> em torno do X.

### Z

Gira o UCS em torno do seu eixo Z, como <Keyword id="X" /> em torno do X: 30 gira X e Y 30 graus no sentido anti-horário, vistos de cima.

### ZAxis

Uma nova origem, o Enter mantendo a atual, e depois um ponto no lado positivo do eixo Z: o plano XY fica perpendicular a ele, com o X mantido nivelado com o plano XY universal. Dois pontos que são um só dizem <Message id="pointsAreCoincident" />. O seu <Keyword id="Object" /> aceita uma linha, um arco, uma polilinha aberta ou uma spline: a origem na ponta mais próxima do clique, o Z ao longo do objeto, apontando para fora dele.

## Missing

<Keyword id="Face" />, que alinha o UCS a uma face de um sólido: pede uma, mas ainda não encontra nenhuma. Aplicar e Seção, previstas no primeiro prompt e recusadas aqui, já que há uma só viewport e não há objetos de seção. A caixa de diálogo UCS (UCSMAN, GERUCS em português), as alças do ícone e o seu menu de atalho, e o ícone mostrando o novo UCS enquanto você o posiciona. A cruz do cursor girando com o UCS: ela fica reta na tela até o <Command id="PLAN" /> alinhar a vista com ele. UCSFOLLOW, UCSVP e o UCS dinâmico. <Keyword id="OBject" /> numa cota, e Grupo na sua seleção. A profundidade que um UCS ortogonal mantém. A pausa, Pressione ENTER para continuar, numa lista longa.

## Questions

### Como voltar o UCS para o Universal no AutoCAD?

Execute o UCS e pressione Enter: <Keyword id="World" /> é o padrão. Para voltar a olhar o desenho de cima, execute o <Command id="PLAN" /> e escolha <Keyword command="PLAN" id="World" />.

### Como rotacionar o UCS no AutoCAD?

Execute o UCS, escolha <Keyword id="Z" /> e digite o ângulo: `30` gira X e Y 30 graus no sentido anti-horário. <Keyword id="X" /> e <Keyword id="Y" /> levantam o plano XY, 90 graus por padrão.

### Qual a diferença entre UCS e WCS?

O sistema de coordenadas universal (WCS) nunca se move; o sistema de coordenadas do usuário (UCS) é o que você move e gira. No começo os dois são o mesmo, e o UCS diz que o atual é `*UNIVERSAL*`. As coordenadas que você digita são lidas no UCS, e o que você desenha fica no plano XY dele.

### Como desenhar numa face de um sólido 3D?

Leve o UCS até ela. No topo de uma caixa, basta a origem: UCS, depois um canto do topo, depois Enter, como faz a figura. Para um lado, dê três pontos: a origem num canto, um ponto ao longo de uma aresta para o X e mais um na face para o Y. Depois desenhe: o que você desenha fica na face.
