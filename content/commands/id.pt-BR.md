---
title: "Comando ID no AutoCAD"
metaTitle: "Comando ID no AutoCAD: coordenadas de um ponto"
description: "Como funciona o ID do AutoCAD em português: indique um ponto, com ou sem snap, e leia X, Y e Z no UCS atual, também dentro de outro comando. Experimente."
figure: "O ID com o snap Centro no furo de uma placa: o X, o Y e o Z do centro."
sourceHash: "3f6bc32d12e5"
---

O ID escreve as coordenadas de um ponto, e tem o mesmo nome no AutoCAD em português. Em `Especificar ponto:` indique o ponto, use um snap nele ou digite-o, e o ID escreve o seu X, Y e Z numa linha no prompt de comando, e encerra. Os valores estão no UCS atual, na precisão do desenho. Com um snap ao objeto, o Z é a altura do objeto nesse ponto; senão, é a do plano de elevação. Enter o encerra sem dizer nada, e os objetos selecionados antes do ID são descartados quando ele começa. Digitado com um apóstrofo na frente, `'ID`, ele funciona dentro de outro comando, que continua depois.

## Questions

### O que faz o comando ID no AutoCAD?

Informa onde está um ponto: X, Y e Z, no UCS atual. Não desenha nem muda nada.

### Como saber as coordenadas de um ponto no AutoCAD?

Digite `ID` e clique no ponto com um snap ao objeto, Ponto final ou Centro, para cair exatamente nele. As coordenadas são escritas no prompt de comando.

### Como obter a coordenada Z de um ponto?

Use um snap ao objeto nele: o ID escreve ali o Z do objeto. Um clique simples dá o Z do plano de elevação, 0 a não ser que o ELEVATION ou o UCS o elevem.

### Por que o ID mostra coordenadas que eu não esperava?

O ID lê no UCS atual. Se o UCS foi movido ou girado, os números são medidos a partir da origem dele, ao longo dos seus eixos: <Command id="UCS" /> Universal para ler as coordenadas universais.
