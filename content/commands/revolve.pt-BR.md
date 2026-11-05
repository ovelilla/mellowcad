---
title: "Comando REVOLVE (REVOLUCAO) no AutoCAD"
description: "Como funciona o REVOLVE do AutoCAD em português, REVOLUCAO (alias REV): um sólido 3D de revolução a partir de um perfil 2D, eixo e ângulo. Experimente grátis."
figure: "Um perfil escalonado girado uma volta inteira em torno do eixo Y: um carretel, visto do sudeste no estilo visual Oculto."
sourceHash: "dc0576311912"
---

O REVOLVE, REVOLUCAO no AutoCAD em português, gira perfis 2D fechados em torno de um eixo e os transforma em sólidos 3D: um retângulo com uma aresta no eixo dá um cilindro; um círculo ao lado dele, um anel. Selecione os perfis — círculos, elipses, polilinhas ou splines fechadas, regiões — e pressione Enter; dê o eixo por dois pontos ou por uma das suas opções e depois o ângulo, com Enter para uma volta inteira. Cada perfil vira um sólido na camada atual e é apagado, como DELOBJ diz por padrão. O comando inteiro é um passo que o Desfazer reverte.

O eixo fica no plano do perfil, com o perfil inteiro de um lado dele, ou o comando termina com <Message id="revolveOneSide" /> antes de pedir qualquer ângulo. O ângulo gira pela regra da mão direita em torno do eixo, do primeiro ponto para o segundo; um negativo gira ao contrário. O 3D do MellowCAD é só de sólidos, e ainda parcial: perfis abertos, que o AutoCAD transforma em superfícies, são recusados.

## Options

### MOde

Pede <Keyword id="SOlid" /> ou <Keyword id="SUrface" />, como o <Command id="EXTRUDE" />: sem objetos de superfície ainda, só <Keyword id="SOlid" />, o padrão, é aceito.

### Object

O padrão do prompt do eixo, então o Enter o escolhe: selecione uma linha, uma polilinha, um arco ou uma spline, e o eixo vai em linha reta entre as suas duas pontas, a partir da ponta mais perto do ponto selecionado. Um objeto fechado não tem pontas: <Message id="revolveClosedAxis" />, e o comando termina.

### X

O eixo X do UCS, pela sua origem.

### Y

O eixo Y do UCS, pela sua origem: um perfil desenhado à direita dele, como na sessão, vira uma peça deitada ao longo de Y.

### Z

O eixo Z do UCS, pela sua origem. Um perfil no plano XY do UCS é perpendicular a ele, então o REVOLUCAO responde <Message id="revolvePerpendicular" /> e termina: Z é para um perfil em pé.

### STart

No prompt do ângulo: o ângulo de partida, sempre 0 por padrão. O perfil é girado até lá primeiro, e o ângulo é pedido de novo.

### Reverse

Inverte o eixo, para que o ângulo gire ao contrário, e pede o ângulo de novo.

### EXpression

O ângulo como expressão aritmética, como no <Command id="EXTRUDE" />.

## Missing

Um eixo fora do plano do perfil, em torno do qual o AutoCAD gira o perfil e gera superfícies: aqui o REVOLUCAO diz <Message id="revolveUnable" /> e termina. Um arco elíptico ou uma aresta de sólido como eixo de <Keyword id="Object" />. O modo <Keyword id="SUrface" /> e os perfis abertos, sem objetos de superfície ainda. A prévia girando com o cursor: enquanto você dá o ângulo, a volta inteira é mostrada. O <Command id="EXPLODE" /> de um sólido de revolução, que o AutoCAD transforma em superfícies e regiões. Suas alças, e o ângulo editado na paleta Propriedades.

## Questions

### Qual é o comando REVOLVE no AutoCAD em português?

REVOLUCAO, com o alias `REV`. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_REVOLVE`.

### Como fazer um sólido de revolução?

Desenhe meia seção como um só objeto fechado ao lado da linha do eixo: uma polilinha fechada ou uma região. Execute o REVOLUCAO, selecione o perfil e pressione Enter; Enter de novo para <Keyword id="Object" /> e selecione a linha do eixo, ou dê as suas duas pontas; depois, Enter para uma volta inteira.

### Por que o revolve não funciona?

Quase sempre porque o eixo cruza o perfil: o REVOLUCAO diz <Message id="revolveOneSide" /> e termina. Leve o eixo até a borda do perfil ou além dela; uma aresta sobre o eixo é permitida. Um eixo perpendicular ao plano do perfil recebe <Message id="revolvePerpendicular" />, e um perfil aberto é recusado, pois o MellowCAD ainda não tem superfícies.

### Como fazer uma revolução de menos de 360 graus?

Digite o ângulo, 90 ou 270, no prompt do ângulo. <Keyword id="STart" /> começa o giro mais adiante, e <Keyword id="Reverse" /> o faz girar ao contrário.
