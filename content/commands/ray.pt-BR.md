---
title: "Comando RAY (RAIO) no AutoCAD"
metaTitle: "Comando RAY (RAIO): linha até o infinito"
description: "Como o RAY (RAIO) do AutoCAD desenha linhas de construção que começam num ponto e seguem ao infinito num sentido, e como aparar em linhas. Experimente."
figure: "Linhas semi-infinitas de um mesmo ponto inicial por três pontos, cada uma seguindo além da borda da vista."
sourceHash: "732d6e8c23de"
---

O RAY, RAIO no AutoCAD em português, desenha linhas semi-infinitas: linhas de construção que começam num ponto e seguem ao infinito num sentido. Indique o ponto inicial e depois um ponto de passagem: a linha começa no primeiro e passa pelo segundo. Cada ponto a mais faz outra a partir do mesmo início, até Enter encerrar o comando. Um ponto de passagem sobre o início é recusado com <Message id="invalid" />. Cada uma fica na camada atual com a cor, o tipo de linha e a espessura de linha atuais.

Uma linha semi-infinita atravessa a vista por mais que você faça pan ou zoom, e a extensão do desenho a deixa de fora, como no AutoCAD. O snap ao objeto Ponto final encontra o início dela; Mais próximo, Perpendicular e Intersecção funcionam ao longo dela. O <Command id="TRIM" /> e o <Command id="BREAK" /> transformam numa linha o trecho que contém o início, e o <Command id="EXTEND" /> leva o início para trás até uma aresta que esteja atrás dele. O <Command id="XLINE" /> desenha linhas que seguem nos dois sentidos.

## Missing

O ALONGAR (LENGTHEN) e o <Command id="JOIN" /> de uma linha semi-infinita ainda não foram conferidos com o AutoCAD, nem os menus das suas alças.

## Questions

### O que é o comando RAIO no AutoCAD?

Uma linha de construção com início: ela começa num ponto e segue para sempre num sentido. Use-a como referência para desenhar, depois apare-a numa linha ou apague-a.

### O comando RAIO tem atalho?

Não: o AutoCAD não dá alias ao RAIO, então digite `RAIO` por extenso. Ele fica no painel Desenhar expandido da faixa de opções, e aqui nas ferramentas de Desenhar, ao lado de Linha de construção.

### Como fazer uma linha semi-infinita parar numa linha?

Apare-a: execute o <Command id="TRIM" /> e clique na parte que passa da linha. O que sobra do início até a linha é um objeto linha.

### Qual a diferença entre RAIO e LINHA no AutoCAD?

Uma linha tem duas pontas; uma linha semi-infinita tem uma, o seu início, e segue sem fim. Num arquivo DXF ela é salva como RAY, e abre como tal.
