---
title: "Comando REGION (REGIAO) no AutoCAD"
description: "Como funciona o REGION do AutoCAD em português, REGIAO (alias REG): formas fechadas em regiões, que loops encontra e por que não cria nenhuma. Experimente."
figure: "Quatro linhas fechadas ponta a ponta e um círculo dentro delas: o REGIAO, com uma janela em volta dos dois, faz duas regiões e apaga os objetos."
sourceHash: "69a5423c3d5c"
---

O REGION, REGIAO no AutoCAD em português, transforma formas fechadas em regiões: áreas planas sem espessura, cada uma delimitada pelos seus loops. Selecione os objetos e pressione Enter; cada loop que eles formam vira uma região. Um objeto fechado é um loop por si só: um círculo, uma elipse, uma polilinha ou uma spline fechadas. Os abertos — linhas, arcos, arcos elípticos, polilinhas e splines abertas — são encadeados ponta a ponta, nunca onde se cruzam, e uma cadeia que não se fecha é descartada. A linha de comando então conta os loops que encontrou, os que rejeitou e por quê, e as regiões que criou; Enter sem nada selecionado diz <Message id="regionNoneFound" />.

Os objetos que formaram uma região são apagados, os outros ficam, e as regiões recebem a camada e as propriedades atuais, não as dos objetos. Um loop dentro de outro faz uma região própria, não um furo nela: o <Command id="SUBTRACT" /> tira uma da outra. Uma região é desenhada pelas suas arestas e tem snap nelas; a paleta Propriedades mostra a sua área e o seu perímetro, que o <Command id="AREA" />, o <Command id="LIST" /> e o <Command id="MASSPROP" /> também medem. O <Command id="UNION" />, o <Command id="SUBTRACT" /> e o <Command id="INTERSECT" /> combinam regiões de um mesmo plano, o <Command id="EXTRUDE" />, o <Command id="REVOLVE" /> e o <Command id="PRESSPULL" /> as transformam em sólidos 3D, e o <Command id="EXPLODE" /> devolve as suas linhas, arcos e círculos. O comando inteiro é um só passo de desfazer.

## Missing

O `DELOBJ` do AutoCAD: aqui os objetos que formaram uma região são sempre apagados. O BOUNDARY, que pode fazer uma região da área em volta de um ponto, e uma região feita do contorno de uma hachura. Editar uma região pelas alças: elas aparecem, mas arrastar uma não muda nada. As suas arestas como arestas de corte ou de limite para o <Command id="TRIM" /> e o <Command id="EXTEND" /> no modo Rápido, e o <Command id="HATCH" /> de uma região com uma aresta elíptica ou de spline. Regiões combinadas com superfícies, que o MellowCAD não tem, e a linha Material na paleta Propriedades.

## Questions

### Como usar o comando REGION no AutoCAD?

Execute o REGIAO (ou `REG`), selecione as formas fechadas ou as linhas que fecham uma ponta a ponta e pressione Enter. A janela da figura, em volta de quatro linhas e um círculo, faz duas regiões, e a linha de comando conta dois loops extraídos e duas regiões criadas.

### Por que o REGION não cria a região?

A forma não está fechada ponta a ponta. Linhas que se cruzam, ou que param antes de se encontrar, não fecham nada: o REGIAO só encadeia objetos abertos pelas pontas, e uma folga de um fio de cabelo basta para descartar a cadeia. Um loop que cruza a si mesmo, como uma gravata-borboleta, é rejeitado e contado nas autointersecções. Junte as pontas com o <Command id="FILLET" /> de raio 0, ou corte o que passa do ponto com o <Command id="TRIM" />, e tente de novo.

### Como fazer uma região com furo?

Faça uma região do contorno e uma do furo, depois execute o <Command id="SUBTRACT" />: selecione o contorno, Enter, o furo, Enter. O resultado é uma só região, e o <Command id="EXTRUDE" /> a transforma num sólido com o furo atravessando-o.

### Como saber a área de uma região?

Selecione-a e leia Área na paleta Propriedades, ou execute o <Command id="AREA" />, escolha <Keyword command="AREA" id="Object" /> e selecione-a. O <Command id="MASSPROP" /> acrescenta o perímetro, o centroide e os momentos de inércia.
