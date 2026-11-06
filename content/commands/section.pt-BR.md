---
title: "Comando SECTION (CORTE) no AutoCAD 3D"
metaTitle: "SECTION (CORTE) no AutoCAD: seção de sólidos 3D"
description: "Como o SECTION, CORTE (alias SECAO) no AutoCAD em português, faz a seção de sólidos 3D numa região: 3 pontos, Objeto, Eixo Z, Vista, XY, YZ e ZX. Teste grátis."
figure: "Um bloco com um furo passante, cortado pelo plano ZX que passa pelo centro do furo: o CORTE faz o perfil, levado para a frente, dois retângulos com o vão do furo entre eles."
sourceHash: "f1c01b76c810"
---

O SECTION, CORTE no AutoCAD em português, faz uma seção transversal de sólidos 3D: uma região onde um plano corta cada um, e os sólidos ficam como estavam. Ele pede os sólidos, até o Enter: como no AutoCAD 2027, uma seleção feita antes dele é descartada e pedida de novo, o que não é sólido é ignorado, e uma seleção sem nenhum sólido diz <Message id="noSolidsSelected" />. Depois, o plano: por padrão você dá três pontos nele, e as opções o dão de outro jeito, como no <Command id="SLICE" />.

Cada sólido que o plano corta ganha a sua região, no plano: um bloco com um furo passante dá o contorno com o vão do furo; um cilindro cortado ao longo do eixo, um retângulo. Um plano sobre uma das faces de um sólido dá essa face. Um sólido que o plano não atinge diz <Message id="sectionMissedOne" />. As regiões ficam na camada e com as propriedades atuais, não nas do sólido; o <Command id="MOVE" /> tira uma para fora para vê-la, o <Command id="AREA" /> e o <Command id="MASSPROP" /> a medem, e o <Command id="EXTRUDE" /> a transforma num sólido. O comando inteiro é um passo de desfazer. O 3D do MellowCAD é só de sólidos e ainda parcial.

## Options

### Object

Usa o plano de um objeto que você seleciona: um círculo, uma elipse, um arco, uma spline 2D ou uma polilinha 2D.

### Zaxis

Pede um ponto no plano e depois um ponto no seu eixo Z, a linha perpendicular a ele.

### View

O plano paralelo à tela, passando por um ponto que você dá.

### XY

O plano XY do UCS, passando por um ponto que você dá: um ponto numa altura faz ali uma seção horizontal. O Enter aceita a origem do UCS.

### YZ

O plano YZ do UCS, passando por um ponto que você dá; o Enter aceita a origem do UCS.

### ZX

O plano ZX do UCS, passando por um ponto que você dá; o Enter aceita a origem do UCS. A seção da figura é este plano passando pelo centro do furo.

### 3points

Três pontos no plano, que então pode se inclinar para qualquer lado. É o padrão do primeiro prompt, então um ponto ali é o primeiro dos três.

## Missing

Superfícies e malhas, que o MellowCAD não tem. Uma polilinha 3D plana como objeto do plano, que o AutoCAD aceita. Os cortes para os quais o MellowCAD ainda não tem forma exata, como no <Command id="SLICE" />, que dizem que uma operação booleana falhou. O SECTIONPLANE e o corte automático, que a faixa de opções do AutoCAD oferece no lugar do SECTION: aqui o CORTE é digitado.

## Questions

### Como fazer um corte de um sólido 3D no AutoCAD?

Execute o CORTE, selecione o sólido e pressione Enter, depois dê o plano: <Keyword id="ZX" /> e um ponto no meio o cortam de frente para trás; <Keyword id="XY" /> e um ponto numa altura, na horizontal. A região fica dentro do sólido: tire-a com o <Command id="MOVE" /> para vê-la.

### Qual a diferença entre SECTION e SLICE?

O <Command id="SLICE" /> corta o sólido em dois e mantém uma parte ou as duas. O CORTE deixa o sólido inteiro e desenha uma região onde o plano o corta.

### Qual é o comando SECTION no AutoCAD em português?

CORTE, com o alias `SECAO`, depois Enter ou a barra de espaço. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_SECTION`.

### Por que o CORTE diz que o plano não faz intersecção com o sólido?

O plano não o atinge: confira como você o deu. <Keyword id="XY" />, <Keyword id="YZ" /> e <Keyword id="ZX" /> são os planos do UCS, então um ponto na altura ou no lado errado põe o plano fora do sólido.
