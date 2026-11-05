---
title: "Comando UNION (UNIAO) no AutoCAD"
metaTitle: "Comando UNION no AutoCAD: união de sólidos 3D"
description: "Como funciona o UNION do AutoCAD em português, UNIAO (alias U): sólidos 3D, ou regiões de um mesmo plano, unidos num só objeto. Experimente grátis online."
figure: "Duas caixas que se sobrepõem, unidas num só sólido pelo UNIAO: vistas do sudeste, sem as linhas ocultas."
sourceHash: "be43813a7dee"
---

O UNION, UNIAO no AutoCAD em português, une dois ou mais sólidos 3D num só sólido, ou duas ou mais regiões de um mesmo plano numa só região: o que se sobrepõe conta uma vez, e as arestas internas desaparecem. Ele pede objetos, quantos você quiser, e o Enter os une. Como no AutoCAD 2027, ele descarta o conjunto selecionado antes do comando e volta a pedi-lo, e ignora o que não é um sólido nem uma região. Os sólidos e as regiões são unidos à parte: todos os sólidos num só, e as regiões, plano a plano.

O objeto selecionado primeiro passa a ser o resultado, com a sua camada e a sua cor, e os outros são apagados; se forem selecionados com uma janela, uma seleção por intersecção ou todos de uma vez, é o mais recente deles. O resultado é um sólido composto: não é mais uma caixa nem um cilindro, não tem histórico (o <Command id="LIST" /> mostra isso) e, selecionado, mostra uma só alça, que o move inteiro. Sólidos que não se tocam passam a ser um objeto de duas peças. O comando inteiro é um só passo de desfazer. O 3D do MellowCAD ainda é parcial: há sólidos, mas não superfícies nem malhas.

## Missing

As superfícies, que aqui não existem. As faces curvas que se cortam numa curva para a qual o MellowCAD ainda não tem uma forma exata: cilindros, cones, esferas ou toroides cujos eixos nem coincidem nem são paralelos (dois cilindros também podem se cruzar); um cone com algo que não seja um plano ou um sólido no seu eixo; um toroide ou um sólido de revolução com um plano que nem é perpendicular ao seu eixo nem passa por ele, ou com um sólido fora do seu eixo; um sólido extrudado com algo que não seja um plano ou uma face extrudada na sua direção. Eles são recusados, e os sólidos ficam como estavam; assim como um corte que toca uma aresta de forma tangente, faces quase, mas não de todo, sobre uma mesma superfície e uma lâmina muito fina entre um corte e uma aresta. Um cilindro deitado ao longo de uma face de uma caixa se une com o volume certo, mas com uma aresta e uma face a menos que no AutoCAD. O histórico do sólido não é guardado (SOLIDHIST, SHOWHISTORY).

## Questions

### Qual é o comando UNION no AutoCAD em português?

UNIAO, com o alias `U`: no AutoCAD em português, `U` une sólidos e não desfaz, pois desfazer é <Command id="U" />. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_UNION`.

### Por que o UNION não funciona?

Ele precisa de dois sólidos, ou de duas regiões do mesmo plano: com menos, diz <Message id="booleanNeedsTwo" /> e não muda nada. Linhas, arcos e polilinhas não são regiões, mesmo fechados: transforme-os antes em regiões com o <Command id="REGION" />. Os objetos selecionados antes do UNIAO são descartados, como no AutoCAD 2027: selecione-os no prompt dele. Quando ele diz que uma operação booleana falhou, os sólidos se cortam de um jeito que o MellowCAD ainda não sabe calcular, e ficam como estavam.

### Como desfazer um UNION no AutoCAD?

Com <Command id="U" /> ou Ctrl+Z logo depois: o comando inteiro volta atrás num só passo, com os objetos como estavam. Mais tarde não há mais o que separar, porque o sólido unido não guarda as suas partes. A operação oposta é o <Command id="SUBTRACT" />, que subtrai sólidos em vez de somá-los.

### Como unir regiões com o UNION?

Transforme cada contorno fechado numa região com o <Command id="REGION" /> e una-as com o UNIAO: as regiões de cada plano passam a ser uma só, com os lados comuns fundidos. Formas que se fecham em volta de um vão deixam um furo, e regiões separadas passam a ser uma só região de várias peças. Uma região sozinha no seu plano fica como está.
