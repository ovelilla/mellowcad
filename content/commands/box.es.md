---
title: "Prisma rectangular en AutoCAD: PRISMARECT (BOX)"
metaTitle: "Prisma en AutoCAD 3D: comando PRISMARECT (BOX)"
description: "Cómo funciona PRISMARECT (BOX) de AutoCAD en español, solicitud a solicitud: dos esquinas y una altura, Centro, Cubo, Longitud y 2Puntos. Pruébalo gratis."
figure: "Un prisma de 60 por 40 por 25, con dos esquinas y una altura, visto desde el sureste con el estilo visual Oculto."
sourceHash: "46936b3da48e"
---

PRISMARECT (BOX en inglés) dibuja un prisma rectangular, un sólido 3D con sus caras alineadas con los ejes del SCP: precisa la primera esquina, la otra esquina y después la altura. La altura sube por el eje Z del SCP, una negativa baja, y un punto la da por su distancia a la esquina; una esquina precisada a otra Z que la primera fija la altura sin preguntarla. La última altura, y la última longitud y anchura de un cubo o de <Keyword id="Length" />, se ofrecen como valores por defecto que Intro acepta, compartidos con las demás primitivas y con <Command id="EXTRUDE" />. El prisma va a la capa actual, y Deshacer lo revierte en un paso.

El prisma conserva sus medidas: <Command id="LIST" /> muestra su posición, longitud, anchura, altura y rotación, y la paleta Propiedades deja escribir las cuatro primeras. Sus pinzamientos lo desplazan, lo estiran y, fuera de la vista en planta, fijan su altura. Es un sólido 3D para <Command id="UNION" />, <Command id="SUBTRACT" /> y el resto del 3D de MellowCAD, que es solo de sólidos y aún parcial.

## Options

### Center

En la primera solicitud: pide el centro y después una esquina, <Keyword id="Cube" /> o <Keyword id="Length" />. El prisma queda centrado en el punto, también en altura.

### Cube

En la otra esquina: pide una longitud, escrita o señalada, y crea un cubo con todos los lados de esa longitud. Una longitud escrita va hacia el cursor; una negativa, en sentido contrario.

### Length

En la otra esquina: pide la longitud y después la anchura. La longitud va hacia el cursor, así que el prisma puede quedar girado; la anchura va hacia el lado en el que está el cursor.

### 2Point

En la altura: pide dos puntos, y la altura es la distancia entre ellos.

## Missing

Desplazar, Girar, Escalar y Simetría desde un pinzamiento activo, que AutoCAD recorre con Intro. Los comandos 3D propios —desplazar, girar, escalar, simetría y alinear en 3D— con sus gizmos, y desplazar sus caras, aristas y vértices uno a uno. El SCP dinámico. Las cotas punteadas que AutoCAD dibuja mientras precisas la esquina, la longitud y la anchura. <Command id="FILLET" /> y <Command id="CHAMFER" /> de sus aristas, que hacen <Command id="FILLETEDGE" /> y <Command id="CHAMFEREDGE" />. Registrar historial y Mostrar historial, del Historial de sólido, y la fila Material. Los estilos visuales que le faltan a <Command id="VSCURRENT" /> además de Estructura alámbrica 2D, Oculto y Conceptual.

## Questions

### ¿Cómo se llama el comando BOX en español?

PRISMARECT, sin alias. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_BOX`.

### ¿Por qué el prisma se ve como un rectángulo?

Lo estás mirando desde arriba, en planta. Gira la vista: una esquina del ViewCube, <Command id="-VIEW" /> y <Keyword command="VIEW" id="SEiso" />, o <Command id="3DORBIT" />. <Command id="VSCURRENT" /> con <Keyword command="VSCURRENT" id="Hidden" /> oculta las aristas que quedan detrás.

### ¿Cómo hacer un cubo en AutoCAD?

Precisa la primera esquina, elige <Keyword id="Cube" /> y escribe la longitud de un lado.

### ¿Cómo dibujar un prisma desde su centro?

Elige <Keyword id="Center" /> y precisa el centro, y después una esquina, <Keyword id="Cube" /> o <Keyword id="Length" />: el prisma queda centrado en el punto, también en altura.
