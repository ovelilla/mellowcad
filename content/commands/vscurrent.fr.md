---
title: "Commande STYLVISCOURANT (VSCURRENT) dans AutoCAD"
description: "STYLVISCOURANT (VSCURRENT, alias SV) d'AutoCAD règle le style visuel : Filaire 2D, Masqué et Conceptuel, ce que chacun dessine et comment revenir au filaire."
figure: "Une pièce percée d'un trou, vue du sud-est : STYLVISCOURANT Conceptuel ombre ses faces et dessine ses arêtes par-dessus."
sourceHash: "ddb8f2338e68"
---

STYLVISCOURANT (VSCURRENT) règle le style visuel : la façon dont la vue dessine les solides 3D. La commande demande un style, en proposant le style courant par défaut, et Entrée le garde. <Keyword id="2dwireframe" /> dessine toutes les arêtes, celles de derrière aussi ; <Keyword id="Hidden" /> masque ce que cachent les faces ; <Keyword id="Conceptual" /> peint les faces, ombrées. Le style appartient à la vue et est enregistré avec le dessin, et chaque exécution est une seule étape d'annulation. La commande ne peut pas s'utiliser à l'intérieur d'une autre.

Ce qui n'est pas un solide (lignes, cercles, régions, textes) est dessiné comme en Filaire 2D quel que soit le style, dans ses propres couleurs. En Masqué et en Conceptuel, un clic prend le solide dont la face est la plus proche de vous sous le curseur, jamais un solide à travers une face qui le cache, et les accrochages aux objets trouvent toujours toutes les arêtes. Un solide sur un calque verrouillé dessine ses arêtes plus pâles. La 3D de MellowCAD ne connaît que les solides et reste partielle.

## Options

### 2dwireframe

Toutes les arêtes de tous les solides, celles de derrière comprises, avec les lignes qui montrent leurs faces courbes ; le style par défaut d'un nouveau dessin. En y revenant depuis un autre style, STYLVISCOURANT affiche <Message id="regeneratingModel" />.

### Hidden

Les arêtes de chaque solide, et les contours de ses faces courbes, là où aucune face d'aucun solide ne les cache, dans la couleur de l'objet : un solide situé derrière un autre est caché par lui. Les lignes qui montrent une face courbe en Filaire 2D ne sont pas dessinées.

### Conceptual

Les faces tournées vers vous, peintes dans la couleur de l'objet, qui tire vers un bleu froid du côté opposé à la lumière, laquelle suit votre point de vue, et les arêtes de Masqué dessinées par-dessus en une seule couleur, quelle que soit celle de l'objet. Ici comme en Masqué, un cylindre ou un cône vu en plan ne montre que son cercle, comme dans AutoCAD.

## Missing

Les autres styles d'AutoCAD (Filaire, Réaliste, Ombré, Ombré avec arêtes, Nuances de gris, Esquisse et Rayon X) et le fait de nommer un style ou de les lister par `?` : l'invite ne liste que les trois styles qui existent, et refuse toute autre réponse.

## Questions

### Comment changer le style visuel dans AutoCAD ?

Lancez STYLVISCOURANT (ou `SV`) et choisissez le style : <Keyword id="Hidden" /> pour masquer les arêtes situées derrière, <Keyword id="Conceptual" /> pour ombrer les faces. Seule la vue change, pas les objets. Comme dans AutoCAD en français, le nom anglais fonctionne aussi, précédé d'un trait de soulignement : `_VSCURRENT`.

### Comment revenir en Filaire 2D ?

Lancez STYLVISCOURANT et choisissez <Keyword id="2dwireframe" />, dont la lettre est `2`.

### Quelle est la différence entre Masqué et Conceptuel ?

Les deux masquent ce que cachent les faces. Masqué ne dessine que les arêtes, sur le fond, comme un dessin au trait ; Conceptuel peint aussi les faces, ombrées par la lumière, avec les mêmes arêtes par-dessus.

### Pourquoi je vois encore des lignes à travers mon solide ?

Elles ne font pas partie d'un solide. Les lignes, les cercles et les régions sont dessinés comme en Filaire 2D dans tous les styles : une ligne derrière une boîte reste donc visible. En <Keyword id="2dwireframe" />, les arêtes du solide lui-même situées derrière se voient aussi : choisissez <Keyword id="Hidden" />.
