---
title: "Commande ID dans AutoCAD"
description: "Coordonnées d'un point avec ID d'AutoCAD en français : cliquez ou accrochez un point, lisez X, Y et Z dans le SCU courant, même en pleine commande. Essayez-le."
figure: "ID avec l'accrochage Centre sur le trou d'une plaque : les X, Y et Z du centre."
sourceHash: "3f6bc32d12e5"
---

ID écrit les coordonnées d'un point. À `Spécifiez un point:`, cliquez-le, prenez-le avec l'accrochage aux objets ou tapez-le : ID écrit ses X, Y et Z en une ligne sur la ligne de commande, puis se termine. Les valeurs sont dans le SCU courant, à la précision du dessin. Avec un accrochage aux objets, Z est la hauteur de l'objet en ce point ; sinon, celle du plan d'élévation. Entrée la termine sans un mot, et les objets sélectionnés avant ID sont abandonnés à son lancement. Tapée avec une apostrophe, `'ID`, elle s'exécute à l'intérieur d'une autre commande, qui reprend ensuite.

## Questions

### À quoi sert la commande ID dans AutoCAD ?

Elle indique où se trouve un point : X, Y et Z, dans le SCU courant. Elle ne dessine et ne modifie rien.

### Comment connaître les coordonnées d'un point dans AutoCAD ?

Tapez `ID`, puis cliquez le point avec un accrochage aux objets, Extrémité ou Centre, pour tomber exactement dessus. Les coordonnées s'écrivent sur la ligne de commande.

### Comment obtenir la coordonnée Z d'un point ?

Prenez-le avec un accrochage aux objets : ID y écrit le Z de l'objet. Un simple clic donne le Z du plan d'élévation, 0 sauf si ELEVATION ou le SCU le relèvent.

### Pourquoi ID affiche des coordonnées inattendues ?

ID lit dans le SCU courant. Si le SCU a été déplacé ou tourné, les nombres sont mesurés depuis son origine, le long de ses axes : <Command id="UCS" />, option <Keyword command="UCS" id="World" />, pour lire des coordonnées générales.
