---
title: "Comando VIEW (VISTA) no AutoCAD: vistas isométricas"
metaTitle: "Vista isométrica no AutoCAD: VIEW (VISTA)"
description: "Como o VIEW do AutoCAD em português, VISTA (alias V), gira para as seis vistas ortogonais e as quatro isométricas, e o UCS de cada ortogonal. Teste grátis."
figure: "Um bloco em degraus desenhado em planta: -VISTA e Isométrico SO, e ele é visto do sudoeste e de cima, no estilo visual Oculto."
sourceHash: "261c8657f5f7"
---

O VIEW, VISTA no AutoCAD em português, gira a vista para uma das dez vistas predefinidas do AutoCAD: seis ortogonais, que olham de frente para um lado do modelo, e quatro isométricas, que olham de cima a partir de um canto. Nada no desenho se move. O VISTA executa o <Command id="-VIEW" />, a forma de linha de comando: o seu primeiro prompt lista <Keyword id="Orthographic" />, que então pede o lado, e ele também aceita o nome de uma vista diretamente, como os menus do AutoCAD respondem: <Command id="-VIEW" />, depois <Keyword id="SWiso" />. Cada vista enquadra o desenho inteiro e diz <Message id="regeneratingModel" />.

Os controles de vista, no canto superior esquerdo do desenho, listam as mesmas dez vistas e executam o <Command id="-VIEW" />, e as faces e os cantos do ViewCube também giram para elas, deixando o UCS como está. Cada VISTA é um passo de desfazer, então o <Command id="U" /> devolve a vista, com o UCS que ela definiu. Digitado com um apóstrofo dentro de outro comando, ele recusa com <Message id="requiresRegen" />. O 3D do MellowCAD é só de sólidos e ainda parcial.

## Options

### Orthographic

Pede o lado para onde olhar, <Keyword id="Top" /> por padrão, então o Enter ali dá a planta: <Keyword id="Top" />, <Keyword id="Bottom" />, <Keyword id="Front" />, <Keyword id="BAck" />, <Keyword id="Left" /> ou <Keyword id="Right" />. Cada uma fica de pé: a Superior mostra o X para a direita e o Y para cima, a Frontal o X para a direita e o Z para cima, e a Inferior, vista de baixo, o X para a esquerda. Digitado no primeiro prompt, cada lado funciona sem a opção.

Cada uma também gira o UCS para ficar de frente para você, a partir dos eixos universais qualquer que fosse o UCS, com a origem em `0,0,0`, como faz a opção ortogonal do <Command id="UCS" />: depois da Frontal, o plano XY dele é a frente, então o que você desenha fica plano na tela, e o UCS se chama `*FRONTAL*`. Depois da Superior, ele tem os eixos universais e se chama `*SUPERIOR*`.

### SWiso

Isométrico sudoeste: olha de cima a partir do canto da frente e à esquerda, vendo a frente, o lado esquerdo e o topo. O UCS fica como está. É a vista da figura.

### SEiso

Isométrico sudeste: olha de cima a partir do canto da frente e à direita, vendo a frente, o lado direito e o topo. O UCS fica como está.

### NEiso

Isométrico nordeste: olha de cima a partir do canto de trás e à direita, vendo a parte de trás, o lado direito e o topo. O UCS fica como está.

### NWiso

Isométrico noroeste: olha de cima a partir do canto de trás e à esquerda, vendo a parte de trás, o lado esquerdo e o topo. O UCS fica como está.

## Missing

As vistas nomeadas: <Keyword id="Orthographic" /> é a única opção que o primeiro prompt lista, onde o do AutoCAD lista também `?`, Excluir, Restaurar, Salvar, Configurações e Janela, e um nome digitado ali é recusado. O Gerenciador de vistas, que o VISTA abre no AutoCAD. Sem nada desenhado, uma vista mantém o zoom, onde o AutoCAD enquadra os limites do desenho. UCSORTHO e UCSBASE como variáveis: uma vista ortogonal sempre alinha o UCS, a partir dos eixos universais. O UCS alinhado na lista do <Keyword command="UCS" id="Previous" /> do <Command id="UCS" />.

## Questions

### Como fazer vista isométrica no AutoCAD?

Digite <Command id="-VIEW" /> e depois <Keyword id="SWiso" /> para o isométrico sudoeste; <Keyword id="SEiso" />, <Keyword id="NEiso" /> e <Keyword id="NWiso" /> dão os outros três cantos. Ou escolha Isométrico SO nos controles de vista, no canto superior esquerdo, ou clique num canto de cima do ViewCube. O <Command id="VSCURRENT" /> com <Keyword command="VSCURRENT" id="Hidden" /> oculta as arestas de trás.

### Qual é o comando da vista superior no AutoCAD?

<Command id="-VIEW" /> e depois <Keyword id="Top" />, que também põe o UCS nos eixos universais. Já o <Command id="PLAN" /> olha de cima para o UCS atual, e o deixa como está.

### Por que o UCS mudou depois de uma vista frontal?

Uma vista ortogonal gira o UCS para ficar de frente para você, para que o que você desenha fique na tela. O <Command id="UCS" /> e Enter voltam ao Universal; o <Command id="U" /> desfaz a vista e o UCS dela juntos.

### Vista isométrica é o mesmo que desenho isométrico?

Não. Uma vista isométrica olha para um modelo 3D a partir de um canto. Um desenho isométrico é 2D, desenhado nos planos isométricos com o estilo isométrico do SNAP, que o MellowCAD ainda não tem.

### Onde fica o Gerenciador de vistas?

O VISTA executa o <Command id="-VIEW" /> na linha de comando: não há Gerenciador de vistas, e as vistas nomeadas (Salvar, Restaurar) ainda não existem aqui.
