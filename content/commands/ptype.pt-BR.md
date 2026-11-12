---
title: "Estilo de ponto no AutoCAD: comando TIPOP (PTYPE)"
metaTitle: "Estilo de ponto no AutoCAD: TIPOP (PTYPE)"
description: "Como funciona o PTYPE do AutoCAD em português, TIPOP (alias DDPTYPE): a caixa Estilo de ponto, as suas vinte figuras, o tamanho, o PDMODE e o PDSIZE."
figure: "O TIPOP abre a caixa Estilo de ponto; o seu OK grava PDMODE e PDSIZE, digitados aqui como 35 e 8, e depois três pontos desenhados dentro de uma placa."
sourceHash: "02cea384a2a9"
---

O PTYPE, TIPOP no AutoCAD em português, abre a caixa de diálogo Estilo de ponto, que define como cada objeto de ponto do desenho é desenhado: os que o <Command id="POINT" /> desenha e os que o <Command id="DIVIDE" /> e o <Command id="MEASURE" /> deixam. `DDPTYPE` é o seu alias, como no AutoCAD, além de `TIP` e `TIPOPD`. O estilo é do desenho, não de um ponto: mude-o e todos mudam de uma vez, e ele é salvo com o desenho. O botão Estilo de ponto fica ao lado de Ponto de identificação nas ferramentas de Utilitários; digitado com um apóstrofo, `'TIPOP`, ele abre dentro de um comando em andamento.

A caixa mostra vinte figuras em quatro linhas de cinco, com a atual escolhida: um ponto minúsculo, nada, um sinal de mais, uma cruz e um traço curto, e depois cada um dentro de um círculo, dentro de um quadrado e dentro dos dois. Abaixo, Tamanho do ponto e como ele é lido: Definir o tamanho relativo à tela, uma porcentagem da altura da vista, ou Definir o tamanho em unidades absolutas, unidades de desenho. O padrão é 5 % relativo à tela. O OK grava a escolha como um passo que o <Command id="U" /> desfaz; Cancelar ou Esc não mudam nada. Um tamanho que não é um número, ou menor que 0, é recusado (Entrada não válida.) e a caixa continua aberta.

O que a caixa grava são duas variáveis, que também podem ser digitadas na linha de comando: PDMODE, a figura (de 0 a 4, mais 32 para o círculo, 64 para o quadrado e 96 para os dois: 35 é uma cruz num círculo), e PDSIZE, o tamanho (um número positivo são unidades de desenho, um negativo uma porcentagem da tela, e 0 é 5 %).

## Missing

O botão Ajuda da caixa. Um ponto com tamanho relativo à tela mantém esse tamanho na tela ao dar zoom, onde o AutoCAD o mantém só até a próxima regeneração do desenho.

## Questions

### O que é DDPTYPE no AutoCAD?

O alias do TIPOP (PTYPE em inglês): os dois abrem a caixa Estilo de ponto, em qualquer idioma do AutoCAD.

### Por que os pontos não aparecem no AutoCAD?

O estilo de ponto padrão é um ponto de um pixel, que uma linha desenhada por cima esconde, e o PDMODE 1 não desenha nada. Abra o TIPOP e escolha uma cruz ou uma figura com círculo, ou digite PDMODE e `3`. Com um tamanho relativo à tela, eles aparecem em qualquer zoom.

### Como mudar o tamanho dos pontos?

No TIPOP, digite o Tamanho do ponto: uma porcentagem da tela com Definir o tamanho relativo à tela, para o ponto manter o seu tamanho ao dar zoom, ou unidades de desenho com Definir o tamanho em unidades absolutas, para ele crescer e diminuir com o desenho. Ou digite PDSIZE: um valor negativo é a porcentagem.

### Posso dar a um ponto um estilo só dele?

Não: no AutoCAD e aqui, o estilo de ponto é do desenho, e todos os objetos de ponto o seguem. Para marcar lugares de outro jeito, insira um bloco neles; o <Command id="DIVIDE" /> e o <Command id="MEASURE" /> podem pôr um bloco no lugar dos pontos.
