---
title: "Comando TEXT (TEXTO) no AutoCAD"
metaTitle: "Texto no AutoCAD: comando TEXT (TEXTO)"
description: "Como funciona o TEXT do AutoCAD em português, TEXTO (alias ETE), prompt a prompt: ponto inicial, altura, rotação e Justificar para alinhar. Experimente grátis."
figure: "Duas linhas de texto centralizadas num retângulo com a justificação meio centro: cada linha, um objeto próprio."
sourceHash: "44d0e1a420a7"
---

O TEXT, TEXTO no AutoCAD em português, escreve texto de uma linha. Você especifica um ponto inicial, uma altura e um ângulo de rotação, depois digita uma linha e pressiona Enter: a linha vira um objeto próprio, e a seguinte começa uma linha abaixo. Uma linha vazia encerra o comando. Um clique em outro ponto antes disso começa ali as linhas seguintes, e Esc mantém as linhas já digitadas e descarta a que estava sendo digitada. Para um parágrafo que se ajusta a uma largura, num só objeto, use o <Command id="MTEXT" />.

A primeira linha mostra o estilo, a altura e a justificação atuais. A altura é a que ele compartilha com o <Command id="MTEXT" /> e o <Command id="ATTDEF" />, fica guardada no desenho e o próximo TEXTO a oferece como padrão; um estilo com altura própria pula o prompt da altura. Enter no prompt do ponto inicial continua abaixo da última linha que o TEXTO escreveu, sem pedir de novo a altura nem o ângulo. O Desfazer reverte a execução inteira.

## Options

### Justify

Pergunta de que ponto o texto fica pendurado: <Keyword id="Left" /> (o padrão), <Keyword id="Center" />, <Keyword id="Right" />, <Keyword id="Middle" /> ou um de nove pontos, superior, meio e inferior por esquerda, centro e direita, como o prompt os lista. Depois, o prompt do ponto inicial pede o ponto que a justificação nomeia: para meio centro, o ponto do meio. Como no AutoCAD, os nove também são aceitos fora da lista no primeiro prompt, então digitar ali as letras de meio centro já pede o ponto do meio. A justificação fica guardada no desenho para o próximo TEXTO.

### Style

Pede o nome do estilo de texto que passa a ser o atual; Enter mantém o que está. <Keyword id="?" /> lista os estilos do desenho, e um nome que o desenho não tem é recusado e pedido de novo. Os estilos são criados na paleta que o <Command id="STYLE" /> abre.

## Missing

As justificações Alinhar e Ajustar. A opção <Keyword id="?" /> de <Keyword id="Style" /> lista todos os estilos de uma vez, sem perguntar quais nem parar página a página. O texto é digitado na caixa da entrada dinâmica, não com um cursor sobre o desenho, e o seu conteúdo não pode ser redigitado na paleta Propriedades, que também não tem as linhas de anotativo, fator de largura, ângulo oblíquo e texto de cabeça para baixo ou invertido. Um clique dentro da caixa de um texto o seleciona mesmo fora das letras, onde o AutoCAD não seleciona nada.

## Questions

### Qual é o comando TEXT no AutoCAD em português?

TEXTO, com os aliases `ETE` e `ETEXTO`. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_TEXT`. `T` não é do TEXTO: inicia o <Command id="MTEXT" />, o texto multilinha.

### Como alinhar texto no AutoCAD?

Escolha <Keyword id="Justify" /> no primeiro prompt, ou digite ali as letras da justificação, e especifique o ponto que ela nomeia: meio centro põe o meio de cada linha nesse ponto, como um rótulo no meio de uma caixa. Para o texto seguir uma linha inclinada, digite o ângulo dela no prompt da rotação.

### Qual é a diferença entre TEXTO e TEXTOM?

O TEXTO cria um objeto por linha, que se move, se edita e se justifica à parte, e nunca ajusta o texto a uma largura. O <Command id="MTEXT" /> cria um só objeto de parágrafos que se ajustam à largura de uma caixa, justificado como um todo. Os dois compartilham a altura do texto e os estilos de texto.

### Como editar um texto no AutoCAD?

Clique duas vezes nele: o <Command id="TEXTEDIT" /> o abre para você redigitá-lo e depois pede o próximo texto, até você pressionar Esc. A altura e a rotação dele são linhas da paleta Propriedades, e as suas alças o movem.
