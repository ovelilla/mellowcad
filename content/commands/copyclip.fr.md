---
title: "Commande COPIERPRESS (COPYCLIP) dans AutoCAD"
description: "Copier-coller dans AutoCAD en français : COPIERPRESS (COPYCLIP, Ctrl+C), COUPERPRESS, COPIERBASE et COLLERPRESS, au Presse-papiers et à un point. Essayez-le."
figure: "COPIERPRESS du trou d'une plaque, puis COLLERPRESS à 65,20 : la copie posée là par son coin inférieur gauche, un deuxième trou."
sourceHash: "f84c995e7c2b"
---

COPIERPRESS (COPYCLIP en anglais) copie les objets que vous sélectionnez dans le Presse-papiers, avec les calques, les styles et les blocs qu'ils utilisent ; le dessin ne change pas, et les objets sélectionnés avant la commande restent sélectionnés. Ctrl+C la lance, en annulant une commande en cours. <Command id="PASTECLIP" />, Ctrl+V, demande ensuite un point d'insertion : les objets suivent le curseur et se posent avec le coin inférieur gauche de leur étendue sur le point, dans le SCU courant, le tout en une seule étape que <Command id="U" /> annule. Collez dans le même dessin ou dans un autre : le Presse-papiers est celui du système, si bien qu'un dessin ouvert dans un autre onglet peut le lire, si le navigateur autorise la page à lire le Presse-papiers. Quand un calque, un style ou un bloc collé porte le nom d'un élément que le dessin a déjà, c'est celui du dessin qui est utilisé.

<Command id="CUTCLIP" />, Ctrl+X, copie les objets et les efface, comme le fait EFFACER. <Command id="COPYBASE" />, Ctrl+Maj+C, demande d'abord un point de base, et COLLERPRESS place alors les objets par ce point au lieu de leur coin, pour qu'ils arrivent exactement là où vous le voulez. Ctrl+A sélectionne tous les objets du dessin.

## Missing

COLLERBLOC et COUPERPOINTBASE, et donc Ctrl+Maj+V et Ctrl+Maj+X, laissés au navigateur, comme Ctrl+Maj+A. COLLERORIG, COLLAGSPEC, le glisser-déposer d'objets entre fenêtres, et le texte d'un autre programme collé comme texte multiligne. Les options cachées d'INSERER au point de COLLERPRESS, si bien qu'un collage ne peut être ni mis à l'échelle, ni tourné, ni décomposé au moment où il est posé.

## Questions

### Quelle est la différence entre COPIER et COPIERPRESS ?

<Command id="COPY" /> place des copies dans le même dessin, d'un point de base à un deuxième point. COPIERPRESS met les objets dans le Presse-papiers, pour les coller avec COLLERPRESS dans ce dessin ou dans un autre.

### Comment copier avec un point de base ?

Appuyez sur Ctrl+Maj+C, ou tapez `COPIERBASE`, donnez le point de base et sélectionnez les objets. Ctrl+V les place ensuite par ce point.

### Comment copier des objets d'un dessin à un autre ?

Sélectionnez-les et appuyez sur Ctrl+C, ouvrez l'autre dessin et appuyez sur Ctrl+V, puis désignez le point d'insertion. Leurs calques, styles et blocs les accompagnent.

### Pourquoi le collage ne fonctionne pas ?

Le navigateur peut demander si la page peut lire le Presse-papiers : autorisez-le. S'il refuse, COLLERPRESS colle ce qui a été copié en dernier dans la même page. Si rien n'a été copié, rien n'est collé.
