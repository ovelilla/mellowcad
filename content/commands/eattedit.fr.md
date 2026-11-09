---
title: "Commande EATTEDIT dans AutoCAD"
description: "Comment EATTEDIT d'AutoCAD en français modifie les valeurs d'attributs d'un bloc dans l'Editeur d'attributs étendu, d'un double-clic. Essayez-le en ligne."
figure: "Deux bureaux, références d'un bloc aux attributs NUM et PART : EATTEDIT sélectionne le second, et son champ PART devient B-200."
sourceHash: "3517c89fd5da"
---

EATTEDIT ouvre l'Editeur d'attributs étendu d'AutoCAD pour une référence de bloc : elle vous demande de sélectionner un bloc, puis affiche un champ pour chacun de ses attributs, nommé par son étiquette et rempli de sa valeur, comme les liste l'onglet Attribut de l'éditeur. Retapez les valeurs, Tab passant d'un champ à l'autre, et Entrée les applique en une seule étape que <Command id="U" /> annule ; Echap ne change rien.

Un double-clic sur une référence avec attributs lance EATTEDIT, comme dans AutoCAD : la ligne de commande l'écrit avec pour réponse le point double-cliqué, et la boîte s'ouvre aussitôt. La sélection prend l'objet sous la cible de sélection : tout ce qui n'est pas une référence de bloc est refusé, un bloc sans attributs aussi, et la question est reposée. Seule la référence sélectionnée change ; la définition du bloc et ses autres références gardent leurs valeurs.

## Missing

L'onglet Options de texte de l'éditeur (style, justification, hauteur, rotation, facteur de largeur et le reste du texte de chaque attribut) et son onglet Propriétés (calque, type de ligne, couleur, épaisseur de ligne), et son bouton Sélectionner bloc. MODIFATTRINSITU (ATTIPEDIT), qui modifie un attribut sur place, et son Ctrl+double-clic. La poignée propre d'un attribut déverrouillé sur une référence, et les lignes d'attributs de la palette Propriétés. `-ATTEDIT`.

## Questions

### Comment ouvrir l'Editeur d'attributs étendu dans AutoCAD ?

Double-cliquez sur une référence de bloc qui a des attributs, ou tapez `EATTEDIT` et sélectionnez-la. La commande porte le même nom dans AutoCAD en français, et `_EATTEDIT` fonctionne dans toutes les langues d'AutoCAD.

### Comment modifier la valeur d'un attribut dans AutoCAD ?

Double-cliquez sur le bloc, tapez la nouvelle valeur dans le champ de l'attribut et appuyez sur Entrée. Chaque référence garde ses propres valeurs : en changer une laisse les autres telles quelles.

### Pourquoi le double-clic ne modifie pas les attributs du bloc ?

EATTEDIT s'ouvre pour une référence dont le bloc contient des attributs, et un bloc créé sans eux n'en a aucun : définissez-les avec <Command id="ATTDEF" /> et sélectionnez-les avec les autres objets quand vous créez le bloc. Si la valeur d'un attribut ne s'affiche pas, vérifiez <Command id="ATTDISP" />, qui peut masquer les attributs invisibles, ou tous.

### Quelle est la différence entre EATTEDIT et ATTEDIT ?

Elles modifient les mêmes valeurs. EATTEDIT nomme chaque champ par son étiquette, comme l'onglet Attribut de l'Editeur d'attributs étendu ; <Command id="ATTEDIT" />, par son invite, comme la boîte de dialogue Editer les attributs. Dans AutoCAD, EATTEDIT modifie aussi les options de texte et les propriétés de chaque attribut.
