---
title: "Commande SPLINE dans AutoCAD"
description: "Comment fonctionne SPLINE (SPL) d'AutoCAD en français : une courbe par des points de lissage ou des sommets de contrôle, Noeuds, Degré, tangences et Clore."
figure: "Une spline par ajustement passant par cinq points et, en dessous, une spline SC sur cinq sommets placés de la même façon : la première passe par eux, la seconde est tirée vers eux."
sourceHash: "1056b5067125"
---

SPLINE dessine une courbe lisse, de deux façons : passant par les points que vous indiquez (Ajustement, la méthode par défaut), ou tirée vers les sommets de contrôle que vous placez (SC). Elle commence par dire ses paramètres, `Méthode=Ajustement   Noeuds=Corde`, puis demande le premier point ; Entrée y est refusée, comme dans AutoCAD. Chaque point suivant courbe la spline, dont l'aperçu suit le curseur, et Entrée la termine. Les points peuvent être désignés, accrochés ou tapés, une longueur tapée suit la direction du curseur, et chaque point garde son Z : une spline peut donc monter dans l'espace. Echap abandonne la courbe ; toute la spline est une seule étape, que <Command id="U" /> défait. Les deux boutons de spline du ruban, par ajustement et SC, lancent SPLINE avec la méthode déjà choisie.

## Options

### Method

<Keyword id="Fit" /> ou <Keyword id="CV" />. Une spline par ajustement passe par chaque point que vous indiquez ; une spline SC ne passe que par son premier et son dernier sommet, et les autres la tirent vers eux : elle sort plus lisse et plus éloignée d'eux. La méthode, comme les noeuds et le degré, est gardée pour le reste de la session.

### Knots

La façon dont une spline par ajustement espace ses points le long de la courbe : <Keyword id="Chord" /> (par défaut, selon la distance qui les sépare), <Keyword id="Square root" /> de cette distance, ou <Keyword id="Uniform" />, tous égaux. Par les mêmes points, chacun donne une courbe légèrement différente.

### Degree

Le degré d'une spline SC, de 1 (des segments droits entre les sommets) à 10 ; 3, la valeur par défaut, est une cubique. Avec moins de sommets que le degré n'en demande, la courbe prend le plus haut degré possible.

### Object

Convertit une polyligne lissée par l'option Spline de PEDIT, 2D ou 3D, en une spline SC de la même courbe, et efface la polyligne, en une seule étape. Tout autre objet est refusé avec <Message id="onlySplineFittedPolylines" />.

### start Tangency

Proposée après le premier point : la direction dans laquelle la courbe en part, désignée ou tapée depuis ce point.

### end Tangency

La direction dans laquelle la courbe arrive à son dernier point ; puis la spline se termine.

### Undo

Défait le dernier point, jusqu'au premier.

### Close

À partir du troisième point : relie la fin au début en une boucle lisse, sans angle, et termine la commande.

## Missing

La tolérance d'ajustement : une spline par ajustement passe toujours exactement par ses points, et l'option toLérance n'est pas proposée. Pendant son tracé, la spline n'est pas encore un objet auquel s'accrocher ou sur lequel faire du repérage, comme l'est celle d'AutoCAD. Objet efface toujours la polyligne (DELOBJ). Sur une spline terminée, il n'y a ni AFFICHERSC ni MASQUERSC, ni menus de poignée pour ajouter ou supprimer un point ; la palette Propriétés modifie ses points mais pas sa méthode, son degré, ses noeuds, ses poids ni sa fermeture, et Centre géométrique, Perpendiculaire et Tangente ne s'y accrochent pas. <Command id="HATCH" /> ne trouve pas une spline comme contour, et FUSIONNER (BLEND) n'existe pas encore.

## Questions

### Quel est le raccourci de SPLINE dans AutoCAD ?

`SPL`, puis Entrée ou la barre d'espace. La commande porte le même nom dans AutoCAD en français, et `_SPLINE` fonctionne quelle que soit la langue.

### Quelle est la différence entre Ajustement et SC ?

Une spline par ajustement passe par les points que vous désignez, ce qui convient à une courbe qui doit les toucher. Une spline SC est façonnée par ses sommets de contrôle, dont elle ne fait que s'approcher, ce qui convient à une forme régulière et lisse. Le choix se fait avec <Keyword id="Method" /> à la première invite.

### Comment convertir une spline en polyligne ?

Lancez <Command id="PEDIT" /> et sélectionnez la spline : la commande dit <Message id="objectNotPolyline" /> et propose de la convertir, puis demande une précision de 0 à 99, 10 par défaut. La polyligne suit la spline par de courts segments droits, plus nombreux que ceux d'AutoCAD.

### Comment convertir une polyligne en spline ?

Lissez la polyligne avec l'option Spline de <Command id="PEDIT" />, puis lancez SPLINE et choisissez <Keyword id="Object" /> : la polyligne devient une spline de la même courbe.

### Peut-on décomposer une spline dans AutoCAD ?

Non : <Command id="EXPLODE" /> refuse une spline, comme AutoCAD. Pour la couper en morceaux, convertissez-la d'abord en polyligne avec <Command id="PEDIT" />, puis décomposez celle-ci en lignes.
