---
title: "Unir en AutoCAD: comando UNIR (JOIN)"
metaTitle: "Unir líneas en AutoCAD: comando UNIR (JOIN)"
description: "Cómo funciona UNIR (JOIN, alias U) de AutoCAD en español: líneas y arcos que se tocan en una polilínea, líneas alineadas en una, arcos en un círculo. Pruébalo."
figure: "Tres líneas unidas en una sola polilínea, a la que una sola designación de DESFASE sigue entera."
sourceHash: "c4f26ede4174"
---

UNIR (JOIN en inglés) hace un solo objeto de varios. Desígnalos, tantos como quieras, y pulsa Intro: las líneas y los arcos que se tocan por sus extremos pasan a ser una polilínea, unida a una polilínea de entre ellos si la hay; las líneas sobre una misma recta, una sola línea, por encima de cualquier hueco; los arcos de un mismo círculo, un solo arco, y cuando lo cierran, UNIR pregunta si lo convierte en círculo, <Keyword id="Yes" /> por defecto, o lo deja como arco con <Keyword id="No" />. Los arcos elípticos de una misma elipse pasan a ser un solo arco, y una spline o un arco elíptico entre curvas que se tocan hacen una spline. Después dice qué ha hecho y cuántos objetos ha dejado fuera. Una polilínea solo se une por sus extremos, y una cerrada no se une a nada. La unión es un paso que Deshacer revierte.

## Options

### cLose

Cuando el origen es un arco elíptico, designado solo: completa su elipse.

## Missing

El paso propio de AutoCAD cuando el origen es una sola línea, arco o polilínea, designada sola (`Designe líneas que unir al origen`): aquí no une nada. Un objeto cerrado designado solo, que AutoCAD vuelve a pedir. Las hélices, los objetos en un plano inclinado o del revés, y las líneas que no están en un mismo plano, que AutoCAD une en una polilínea 3D o aplana en una polilínea.

## Questions

### ¿Cómo se llama el comando JOIN en español?

UNIR, con el alias `U` (en AutoCAD en español, deshacer es <Command id="U" />). Como allí, el nombre inglés también funciona con un guion bajo delante: `_JOIN`.

### ¿Cómo uno líneas en una polilínea en AutoCAD?

Ejecuta UNIR, designa las líneas, con una ventana si quieres, y pulsa Intro: las que se tocan por sus extremos pasan a ser una sola polilínea.

### ¿Por qué no funciona UNIR?

Los objetos tienen que tocarse exactamente, extremo con extremo y en un mismo plano: un hueco o un cruce los deja fuera, y UNIR dice cuántos ha descartado. Solo las líneas alineadas, los arcos de un mismo círculo y los de una misma elipse se unen por encima de un hueco. Una polilínea cerrada no se une a nada.

### ¿Cómo uno arcos en un círculo?

Designa arcos de un mismo círculo que lo cubran entero y pulsa Intro: UNIR pregunta si los convierte en círculo, y <Keyword id="Yes" />, la opción por defecto, lo hace.
