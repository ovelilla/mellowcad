---
title: "Comando ARRAYPATH (MATRIZCAMINHO) no AutoCAD"
description: "Como funciona o ARRAYPATH do AutoCAD em português, MATRIZCAMINHO, prompt a prompt: o caminho, Medir ou Dividir, os itens e o alinhamento. Experimente grátis."
figure: "Um quadrado pequeno no início de um arco, em matriz ao longo dele: Dividir, 7 itens, cada um girado com o arco."
sourceHash: "d0d77418d682"
---

O ARRAYPATH, MATRIZCAMINHO no AutoCAD em português, copia uma seleção ao longo de um caminho (uma linha, um arco, um círculo ou uma polilinha) como um só objeto de matriz. Ele pede os objetos, diz o tipo e se a matriz é associativa, pede a curva de caminho e mostra a matriz na hora: os itens afastados uma vez e meia o tamanho da seleção, quantos couberem ao longo do caminho, cada um girado conforme o caminho gira. Um caminho aberto começa pela ponta mais próxima do ponto selecionado; um círculo, no seu ângulo 0, no sentido anti-horário. Depois, um só prompt edita a matriz ao vivo até o Enter criá-la, com as opções ou com as alças da visualização, como no AutoCAD. Os objetos selecionados ficam onde estão, como o primeiro item.

## Options

### ASsociative

<Keyword id="Yes" />, o padrão, cria um só objeto de matriz, que as alças e a paleta Propriedades alteram depois; <Keyword id="No" /> cria cópias independentes ao lado dos objetos selecionados. A resposta vale pela sessão, também para o <Command id="ARRAYRECT" /> e o <Command id="ARRAYPOLAR" />.

### Method

<Keyword id="Measure" />, o padrão, põe os itens a uma distância, quantos couberem; <Keyword id="Divide" /> distribui uma quantidade de itens por igual ao longo de todo o caminho, um em cada ponta de um caminho aberto.

### Items

Com <Keyword id="Divide" />, a quantidade de itens. Com <Keyword id="Measure" />, a distância entre eles e depois quantos, até o máximo que cabe, que ele informa; <Keyword id="Fill entire path" /> usa todos.

### Align items

<Keyword id="Yes" />, o padrão, gira cada item conforme o caminho gira desde o início; <Keyword id="No" /> só o move ao longo dele.

### eXit

Cria a matriz e encerra o comando, como o Enter.

## Missing

A matriz não acompanha o caminho: se você editar o caminho depois, a matriz mantém o caminho com que foi criada. Splines, elipses e polilinhas 3D ainda não podem ser caminhos, nem um caminho fora do plano do UCS. Não são oferecidos o ponto base, a direção da tangente, as linhas, os níveis, a direção Z nem Expressão, nem um grupo no prompt do caminho, e as alças da matriz não têm menus.

## Questions

### Como fazer um array ao longo de uma curva?

Digite <Command id="ARRAYPATH" />, selecione os objetos, pressione Enter e selecione o caminho perto da ponta por onde ele deve começar; ou digite `MA` para o <Command id="ARRAY" /> e escolha <Keyword command="ARRAY" id="PAth" /> depois dos objetos. Então defina a distância ou a quantidade de itens, e pressione Enter para criá-la.

### Por que o array não acompanha o caminho?

Aqui uma matriz mantém o caminho como ele era quando ela foi criada: se você mover ou esticar o caminho depois, a matriz fica como está, enquanto a matriz de caminho associativa do AutoCAD o acompanharia. Apagar o caminho também mantém a matriz. Se os itens não giram com o caminho, escolha <Keyword id="Align items" /> e responda <Keyword id="Yes" />.

### Como mudar o sentido de um array de caminho?

Selecione o caminho perto da outra ponta: um caminho aberto começa pela ponta mais próxima do ponto selecionado. Um círculo sempre vai no sentido anti-horário a partir do ângulo 0.

### Como distribuir os itens por igual em todo o caminho?

Escolha <Keyword id="Method" />, depois <Keyword id="Divide" /> e depois <Keyword id="Items" />, e digite quantos: eles são distribuídos por igual, o primeiro e o último nas pontas de um caminho aberto.
