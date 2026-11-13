---
title: "Comando CHPROP (ALTPROP) no AutoCAD"
metaTitle: "Alterar propriedades no AutoCAD: CHPROP"
description: "Como funciona o CHPROP do AutoCAD em português, ALTPROP: mude cor, camada, tipo de linha e sua escala, espessura de linha ou espessura dos objetos, no prompt."
figure: "O ALTPROP numa linha que atravessa o furo de uma placa: cor 1 e tipo de linha CENTER, um eixo, na camada em que estava."
sourceHash: "4ba30c3c6070"
---

O CHPROP, ALTPROP no AutoCAD em português, muda as propriedades dos objetos que você seleciona, na linha de comando: as linhas Geral da paleta Propriedades, perguntadas como prompts. Selecione os objetos, ou selecione-os antes do comando, e escolha uma propriedade a mudar; ele pede outra depois de cada uma, até que Enter o encerre. O prompt de cada propriedade oferece como padrão o valor do conjunto, <Message id="varies" /> onde os objetos diferem, e Enter ali deixa a cada objeto o seu. O que você define é aplicado quando o comando termina, então Esc deixa todos os objetos como estavam. Os objetos numa camada bloqueada são contados e deixados de fora, cada um dizendo <Message id="objectOnLockedLayer" />. A execução inteira é um passo que o <Command id="U" /> desfaz.

## Options

### Color

Um número de cor de 1 a 255, um nome como `vermelho`, `PORCAMADA`, ou <Keyword id="Truecolor" /> e o seu `Vermelho,Verde,Azul`, como o <Command id="COLOR" /> os aceita; o que o COR recusa é recusado aqui e perguntado de novo.

### LAyer

O nome de uma camada, em maiúsculas ou minúsculas. Um nome que não pode ser o de uma camada diz <Message id="invalidLayerName" />, um que não está no desenho diz que não foi encontrado; os dois perguntam de novo. O ALTPROP não cria camadas.

### LType

O nome de um tipo de linha, em maiúsculas ou minúsculas, ou `PorCamada`. Um que o desenho não carregou é carregado do acad.lin, o arquivo do AutoCAD em polegadas, como faz o AutoCAD mesmo num desenho métrico; um nome que esse arquivo também não tem diz que não foi encontrado e volta ao prompt da propriedade.

### ltScale

A escala do tipo de linha dos próprios objetos, que multiplica a do <Command id="LTSCALE" /> só para eles: uma distância, digitada ou medida por dois pontos; uma negativa é tomada pelo seu tamanho, e 0 diz <Message id="valueMustBeNonzero" /> e pergunta de novo.

### LWeight

Uma espessura de linha em milímetros, arredondada para a padrão mais próxima como o <Command id="LWEIGHT" /> a arredonda, ou `PorCamada`; `?` as lista.

### Thickness

Uma distância, digitada ou medida por dois pontos, negativa e zero também. É aplicada às linhas, aos círculos, aos arcos e às polilinhas do conjunto, ao longo da normal de cada um; para cada outro tipo, ele diz, ao terminar, que não pode mudar a sua espessura.

## Missing

TRansparência, Material e Anotativo, que os objetos aqui não têm, então o prompt não os lista. PorBloco em Cor, TIpolinha e ESplinha, e o Padrão de ESplinha. Uma true color igual a uma cor de índice volta como a de índice: `255,0,0` é oferecida como `1 (vermelho)`. Os livros de cores. A espessura de um texto e de uma definição de atributo, que ficam como estão. O ALTERAR (`_CHANGE`), cuja opção Propriedades faz o mesmo prompt com ELevação.

## Questions

### Existe atalho para o CHPROP no AutoCAD?

Ele não tem alias: digite `ALTPROP`, ou `_CHPROP` em qualquer idioma do AutoCAD. Enter no prompt Comando o repete.

### Qual é a diferença entre ALTPROP e PROPRIEDADES?

Eles mudam as mesmas propriedades. O <Command id="PROPERTIES" /> as mostra numa paleta, com a geometria de cada objeto também; o ALTPROP as pede na linha de comando, o que mantém as suas mãos no teclado.

### Como mudar a cor de objetos pela linha de comando?

Digite `ALTPROP`, selecione os objetos, pressione Enter, escolha <Keyword id="Color" /> e digite a cor, como `1` para vermelho. Pressione Enter de novo para terminar.

### Como passar vários objetos para outra camada?

Execute o ALTPROP, selecione-os, escolha <Keyword id="LAyer" /> e digite o nome da camada. A camada precisa existir: crie-a antes no <Command id="LAYER" />.
