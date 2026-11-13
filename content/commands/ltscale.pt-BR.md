---
title: "Escala de linha no AutoCAD: comando LTSCALE (ESCALATL)"
metaTitle: "Escala de linha no AutoCAD: LTSCALE (ESCALATL)"
description: "Como o LTSCALE do AutoCAD em português, ESCALATL (alias ETL), define a escala do tipo de linha do desenho, para o tracejado aparecer. Experimente grátis."
before: "Uma placa de 4 metros, o furo desenhado com HIDDEN e os eixos com CENTER, na escala de tipo de linha padrão, 1: os traços finos demais para se ver."
figure: "A mesma placa depois do ESCALATL 20: os traços do furo e dos eixos desenhados 20 vezes mais longos."
sourceHash: "33b956c956fa"
---

O LTSCALE, ESCALATL no AutoCAD em português, define o fator de escala global do tipo de linha, a «escala de linha»: o comprimento dos traços e dos espaços de todo tipo de linha tracejado do desenho. Ele pede o novo fator, oferecendo o atual, 1.0000 num desenho novo: 2 deixa cada traço duas vezes mais longo, 0.5 com a metade do comprimento. O fator tem de ser maior que 0, senão ele mostra <Message id="positiveNonzero" /> e pergunta de novo, e `1/2` e `1e3` são lidos como números. Uma mudança redesenha o desenho inteiro, `Regenerando modelo.` como diz o AutoCAD 2027 em português, e é salva com o desenho; é um passo que o <Command id="U" /> desfaz. Digitado com um apóstrofo dentro de um comando, `'ESCALATL`, o desenho é redesenhado quando esse comando termina.

Os tipos de linha são padrões feitos para um desenho do tamanho do papel: num desenho de 4 metros de largura, em milímetros, o padrão do CENTER, de umas 51 unidades, se repete umas 80 vezes, fino demais para se ver, e uma linha mais curta que um padrão é desenhada contínua. A escala a usar costuma ser a do próprio desenho: 20 para um desenho que será lido em 1:20, 50 em 1:50.

## Missing

O Gerenciador de tipos de linha, cujo Fator de escala global é o ESCALATL e a Escala do objeto atual, o CELTSCALE. PSLTSCALE e MSLTSCALE, porque não há espaço do papel. As formas dos tipos de linha complexos como BATTING, desenhadas como os seus vãos.

## Questions

### Qual é o comando LTSCALE no AutoCAD em português?

ESCALATL, com o alias `ETL`; `LTS` não é comando nenhum no AutoCAD em português. Como lá, o nome em inglês também funciona com um sublinhado na frente: `_LTSCALE`.

### Por que a minha linha tracejada aparece contínua?

O padrão dela não cabe no desenho na escala atual. Uma linha mais curta do que uma repetição do seu padrão é desenhada contínua; uma longa numa escala pequena junta tanto os traços que parece contínua. Aumente o ESCALATL num desenho grande e diminua num pequeno, até os traços aparecerem.

### Qual escala de linha usar no AutoCAD?

A escala do desenho: num desenho em milímetros que será lido em 1:50, `50`. Para um desenho do tamanho do papel, 1.

### Qual é a diferença entre o ESCALATL e o tipo de linha?

O tipo de linha, definido com o <Command id="LINETYPE" /> ou pela camada, é o padrão: traços, pontos e espaços. O ESCALATL é o comprimento com que esse padrão é desenhado, o mesmo fator para todos os objetos do desenho.
