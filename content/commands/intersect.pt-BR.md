---
title: "Comando INTERSECT (INTERSEC) no AutoCAD"
metaTitle: "INTERSECT no AutoCAD: intersecção de sólidos"
description: "Como funciona o INTERSECT do AutoCAD em português, INTERSEC (alias INT): sólidos 3D, ou regiões de um plano, reduzidos ao que têm em comum. Experimente grátis."
figure: "Uma caixa e uma esfera que a ultrapassa, intersectadas: o que têm em comum é uma bola com seis faces planas, vista do sudeste."
sourceHash: "c8ea61c0525d"
---

O INTERSECT, INTERSEC no AutoCAD em português, mantém só o que dois ou mais sólidos 3D têm em comum, ou duas ou mais regiões de um mesmo plano, e apaga o resto: uma caixa e uma esfera que a ultrapassa deixam uma bola com faces planas. Ele pede objetos até o Enter, como o <Command id="UNION" />, e ignora o que não é um sólido nem uma região. Como no AutoCAD 2027, ele descarta o conjunto selecionado antes do comando e volta a pedi-lo. Os sólidos e as regiões são calculados à parte, e as regiões, plano a plano.

O objeto selecionado primeiro passa a ser o resultado, com a sua camada e a sua cor, e os outros são apagados; se forem selecionados com uma janela, uma seleção por intersecção ou todos de uma vez, é o mais recente deles. O resultado é um sólido composto, que não é mais uma caixa nem uma esfera e não tem histórico. Quando os objetos não têm nada em comum, ele diz <Message id="nullSolid" /> ou <Message id="nullRegion" /> e apaga todos, como o AutoCAD. O comando inteiro é um só passo de desfazer. O 3D do MellowCAD ainda é parcial: há sólidos, mas não superfícies nem malhas.

## Missing

As superfícies, que aqui não existem. As faces curvas que se cortam numa curva para a qual o MellowCAD ainda não tem uma forma exata: cilindros, cones, esferas ou toroides cujos eixos nem coincidem nem são paralelos (dois cilindros também podem se cruzar); um cone com algo que não seja um plano ou um sólido no seu eixo; um toroide ou um sólido de revolução com um plano que nem é perpendicular ao seu eixo nem passa por ele, ou com um sólido fora do seu eixo; um sólido extrudado com algo que não seja um plano ou uma face extrudada na sua direção. Eles são recusados com uma mensagem de que uma operação booleana falhou, e os sólidos ficam como estavam; assim como um corte que toca uma aresta de forma tangente, faces quase, mas não de todo, sobre uma mesma superfície e uma lâmina muito fina entre um corte e uma aresta. Um cilindro deitado ao longo de uma face de uma caixa se une com o volume certo, mas com uma aresta e uma face a menos que no AutoCAD. O histórico do sólido não é guardado (SOLIDHIST, SHOWHISTORY), e qual objeto Cerca ou Anterior mantêm não foi verificado.

## Questions

### Qual é o comando INTERSECT no AutoCAD em português?

INTERSEC, com o alias `INT`. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_INTERSECT`.

### Qual é a diferença entre UNION, SUBTRACT e INTERSECT?

Os três fazem um só objeto de sólidos 3D, ou de regiões de um mesmo plano. O <Command id="UNION" /> mantém tudo o que qualquer um deles cobre, o <Command id="SUBTRACT" /> mantém o primeiro conjunto menos o segundo, e o INTERSEC mantém só o que todos compartilham. Cada um é um só passo de desfazer, e cada um apaga os objetos que consome.

### Como fazer a intersecção de linhas no AutoCAD?

Não com o INTERSEC, que trabalha com sólidos e regiões e ignora as linhas. Para achar o ponto onde elas se cruzam, use o snap ao objeto Intersecção; para que se encontrem, o <Command id="FILLET" /> com raio 0, o <Command id="TRIM" /> ou o <Command id="EXTEND" />.

### Por que o INTERSEC apaga os meus objetos?

Porque eles não têm nada em comum: sem parte compartilhada, ele diz <Message id="nullSolid" />, ou <Message id="nullRegion" /> com regiões, e os apaga, como o AutoCAD. O <Command id="U" /> os traz de volta. Um sólido e uma região, ou duas regiões de planos diferentes, não são intersectados: ele diz <Message id="booleanNeedsTwo" /> e não muda nada.
