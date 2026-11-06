---
title: "Comando UNDO (DESFAZER) no AutoCAD"
metaTitle: "UNDO (DESFAZER) no AutoCAD: Marca, D e Ctrl+Z"
description: "Como funciona o UNDO do AutoCAD em português, DESFAZER: vários passos, Marca e Voltar, cOmeço e Fim, Controle, e como difere do D e do Ctrl+Z. Experimente."
before: "Uma placa com dois furos e uma linha que a atravessa, desenhados por quatro comandos: RETANGULO, CIRCULO duas vezes e LINHA."
figure: "DESFAZER 2: os dois últimos comandos são desfeitos, a linha e o segundo furo, e a placa fica com o primeiro furo."
sourceHash: "b4fed2178b6a"
---

O UNDO, DESFAZER no AutoCAD em português, desfaz comandos. Um passo é um comando inteiro: tudo o que uma LINHA desenhou sai de uma vez, quantos segmentos tivesse, e também o que um comando definiu, como o ESCALATL. O DESFAZER escreve as suas configurações atuais e depois pede o número de operações a desfazer ou uma opção; Enter desfaz uma. Ele escreve numa linha os nomes dos comandos que desfez, `CIRCULO LINHA`, e <Message id="everythingUndone" /> quando eles acabam; depois disso, <Message id="nothingToUndo" />. Um comando que não mudou nada, como o ID ou o LISTA, também é um passo, e também o que o ZOOM e o PAN fizeram com a vista.

O <Command id="U" /> é a forma curta: um passo atrás, sem pergunta. Ctrl+Z no prompt Comando executa o D; dentro de um comando, é o Desfazer desse comando, como a macro do AutoCAD o digita: a LINHA desfaz o seu último segmento e continua. O <Command id="REDO" />, logo em seguida, devolve o que o último D ou DESFAZER desfez.

## Options

### Auto

Pergunta <Keyword id="ON" /> ou <Keyword id="OFF" />, oferecendo a configuração atual, que a linha de configurações passa a mostrar. No AutoCAD, faz um só passo dos comandos que um item de menu executa; aqui nenhum menu executa mais de um, então aqui ele não junta nada.

### Control

Pergunta quanto desfazer guardar, <Keyword id="All" /> por padrão. <Keyword id="None" /> descarta todos os passos guardados e desativa o desfazer: o D então diz <Message id="uDisabled" />, e o DESFAZER pede o Controle de imediato. <Keyword id="One" /> guarda só o último passo, e o DESFAZER passa a pedir 1 ou Controle. Todos reativa o desfazer completo. <Keyword id="Combine" /> diz se ZOOMs e PANs seguidos são um só passo, e <Keyword id="Layer" /> se o são as edições seguidas no Gerenciador de propriedades de camadas, Sim por padrão nos dois. As configurações são do desenho, e não são salvas com ele: um desenho novo ou aberto começa em Todos, COmbinar Sim e CAmada Sim.

### BEgin

Abre um grupo: os comandos executados até <Keyword id="End" /> formam um passo, que o D desfaz inteiro e nomeia `GRUPO` junto com eles. Enquanto um grupo está aberto, o D, um número e Voltar param no início dele. cOmeço com um grupo aberto fecha-o antes.

### End

Fecha o grupo que o cOmeço abriu.

### Mark

Deixa uma marca nos passos. Voltar, o D e um número param nela, com <Message id="markEncountered" />.

### Back

Desfaz todos os passos até a última marca, e a marca com eles. Sem marca, pergunta se deve desfazer tudo, Sim por padrão.

## Missing

Auto não junta nada, já que nenhum menu aqui executa mais de um comando. COmbinar e CAmada duram a sessão do navegador, onde o AutoCAD os mantém de uma sessão para a outra. Os botões Desfazer e Refazer da barra superior não escrevem nada no histórico, onde a barra de ferramentas de acesso rápido do AutoCAD escreve as suas linhas. Ctrl+Shift+Z também refaz, em silêncio, embora o AutoCAD não associe nada a ele.

## Questions

### Qual é o atalho do DESFAZER no AutoCAD?

Ctrl+Z, ou `D` e Enter: um passo atrás. O DESFAZER não tem alias; digite-o inteiro para um número de passos ou as suas opções, ou `_UNDO` em qualquer idioma do AutoCAD.

### Qual é a diferença entre o U e o UNDO (D e DESFAZER)?

O <Command id="U" /> desfaz o último comando e não pergunta nada. O DESFAZER pergunta quantos desfazer, e tem Marca e Voltar para voltar a um ponto marcado, cOmeço e Fim para fazer de vários comandos um passo, e Controle para limitar o desfazer ou desativá-lo.

### Como desfazer vários comandos de uma vez?

Digite `DESFAZER` e o número de comandos, como `5`. Ou escolha <Keyword id="Mark" /> antes de uma série que você talvez queira descartar, e <Keyword id="Back" /> para voltar a ela.

### Por que o DESFAZER não funciona?

O desfazer foi desativado com o Controle <Keyword id="None" />: o D avisa, e o DESFAZER pede o Controle. Responda <Keyword id="All" /> para reativá-lo. Os passos anteriores a isso se perderam.

### Como refazer o que eu desfiz?

O <Command id="REDO" />, logo depois do D ou do DESFAZER, devolve tudo o que ele desfez. Ctrl+Y refaz um passo de cada vez.
