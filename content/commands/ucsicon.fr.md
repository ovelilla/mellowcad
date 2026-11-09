---
title: "Commande ICONESCU (UCSICON) dans AutoCAD"
description: "Comment ICONESCU (UCSICON) d'AutoCAD affiche ou masque l'icône du SCU et la place à l'origine ou dans le coin : ACtif, INactif, Nonorigine, Origine. Essayez-le."
figure: "ICONESCU Nonorigine envoie l'icône dans le coin ; SCU déplace l'origine sur le gradin de la pièce, et Origine y dessine l'icône, son X rouge, son Y vert et son Z bleu."
sourceHash: "c431e70eda01"
---

ICONESCU (UCSICON) affiche ou masque l'icône du SCU, les bras X et Y qui montrent où se trouve le SCU courant et dans quelle direction il pointe, et dit où elle se place : à l'origine du SCU, ou dans le coin inférieur gauche du dessin. Son unique invite propose l'état courant comme valeur par défaut : Entrée le garde donc. Le réglage est enregistré dans le dessin, et chaque ICONESCU est une étape d'annulation.

L'icône est celle, en 3D, d'AutoCAD 2027 : un bras pour X et un pour Y, une lettre au bout de chacun, et un carré à l'origine tant que le SCU est le SCG. Hors de la vue en plan, un bras Z montre où pointe le Z du SCU, et un bras vu en bout est omis. En Filaire 2D, elle est blanche ; en Masqué et en Conceptuel, son X est rouge, son Y vert et son Z bleu. La variable garde son nom anglais : tapée avec une apostrophe, `'UCSICON` définit la variable UCSICON au lieu de lancer ICONESCU, même à l'intérieur d'une autre commande : de 0 à 3, où 1 affiche l'icône et 2 la place à l'origine.

## Options

### ON

Affiche l'icône.

### OFF

Masque l'icône. Le SCU est toujours là, et ce que vous dessinez s'y trouve toujours.

### Noorigin

Garde l'icône dans le coin inférieur gauche du dessin, où que soit l'origine.

### ORigin

Dessine l'icône à l'origine du SCU, l'option par défaut. Quand l'origine est hors de l'écran, ou si près de son bord que l'icône n'y tiendrait pas, l'icône passe dans le coin inférieur gauche jusqu'à ce que l'origine soit de nouveau visible.

## Missing

Tout, qui dans AutoCAD applique le réglage à toutes les fenêtres (il n'y en a qu'une ici) ; Sélectionner, les poignées de l'icône ; et Propriétés, la boîte de dialogue Icône SCU, avec le style 2D, la taille, l'épaisseur de ligne et les couleurs.

## Questions

### Comment désactiver l'icône du SCU dans AutoCAD ?

Tapez `ICONESCU`, appuyez sur Entrée, puis <Keyword id="OFF" />. <Keyword id="ON" /> la fait revenir.

### Comment placer l'icône du SCU à l'origine ?

ICONESCU, puis <Keyword id="ORigin" /> : l'icône se place à l'origine du SCU. Si elle reste dans le coin, l'origine est hors de l'écran ou trop près de son bord : faites un panoramique ou un zoom arrière. <Keyword id="Noorigin" /> la garde dans le coin.

### Que signifie le carré sur l'icône du SCU ?

Que le SCU est le système de coordonnées général. Déplacez ou faites pivoter le SCU avec <Command id="UCS" /> et le carré disparaît ; <Command id="UCS" /> puis Entrée ramènent le SCG, et le carré avec lui.

### Comment changer le style, la taille ou la couleur de l'icône du SCU ?

Dans AutoCAD, avec l'option Propriétés d'ICONESCU, la boîte de dialogue Icône SCU. MellowCAD ne l'a pas encore : l'icône est dessinée comme AutoCAD 2027 la dessine par défaut, dans le style 3D.
