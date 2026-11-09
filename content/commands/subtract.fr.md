---
title: "Commande SOUSTRACTION (SUBTRACT) dans AutoCAD"
description: "Comment fonctionne SOUSTRACTION (SUBTRACT, alias SU) d'AutoCAD : les solides ou régions à garder, Entrée, puis ceux à soustraire, trous compris. Essayez-le."
figure: "Un cylindre soustrait d'une boîte par SOUSTRACTION, ce qui la perce de part en part : la boîte sélectionnée d'abord, puis le cylindre."
sourceHash: "416991f5f4d1"
---

SOUSTRACTION (SUBTRACT) soustrait des solides 3D d'autres solides, ou des régions d'autres régions du même plan : un cylindre soustrait d'une boîte y laisse un trou traversant, un cercle soustrait d'un carré un carré troué. Elle demande deux fois. D'abord, elle dit <Message id="subtractFrom" /> et demande les objets à garder, jusqu'à Entrée ; puis <Message id="subtractWhat" />, et demande les objets à soustraire, jusqu'à une nouvelle Entrée. Comme dans AutoCAD 2027, un jeu sélectionné avant la commande est abandonné et redemandé.

Les solides du premier jeu deviennent un seul solide, et chaque solide du second jeu en est soustrait puis effacé, qu'il l'ait chevauché ou non. Les régions vont plan par plan : les régions du premier jeu situées dans un plan sont réunies, celles du second jeu dans ce plan en sont soustraites puis effacées, et une région dans un plan où le premier jeu n'en a aucune reste telle qu'elle était. Un résultat solide est un solide composé, qui n'est plus une boîte ni un cylindre et n'a pas d'historique. Quand il ne reste rien, elle dit <Message id="nullSolid" /> ou <Message id="nullRegion" /> et les efface. Toute la commande est une seule étape d'annulation. La 3D de MellowCAD reste partielle : les solides existent, pas les surfaces ni les maillages.

## Missing

Les surfaces, qui n'existent pas ici. Les faces courbes qui se coupent selon une courbe dont MellowCAD n'a pas encore de forme exacte : des cylindres, cônes, sphères ou tores dont les axes ne sont ni confondus ni parallèles (deux cylindres peuvent aussi se croiser) ; un cône avec autre chose qu'un plan ou un solide sur son axe ; un tore ou un solide de révolution avec un plan ni perpendiculaire à son axe ni passant par lui, ou avec un solide hors de son axe ; un solide extrudé avec autre chose qu'un plan ou une face extrudée dans sa direction. Ces cas sont refusés, et les solides restent tels qu'ils étaient ; de même pour une coupe qui touche une arête de façon tangente, des faces presque mais pas tout à fait sur une même surface, et une lamelle très fine entre une coupe et une arête. Précédent juste après SOUSTRACTION dit qu'il n'y a pas de jeu de sélection précédent, là où AutoCAD ne trouve aucun des objets effacés. Aucun historique de solide n'est gardé (SOLIDHIST, SHOWHISTORY).

## Questions

### Comment s'appelle la commande SUBTRACT en français ?

SOUSTRACTION, avec l'alias `SU` : tapez-le, puis Entrée ou la barre d'espace. Comme dans AutoCAD en français, le nom anglais fonctionne aussi, précédé d'un trait de soulignement : `_SUBTRACT`.

### Comment soustraire un solide d'un autre ?

Dessinez le solide à enlever là où il chevauche l'autre : un cylindre qui traverse une boîte, pour un trou. Lancez SOUSTRACTION, sélectionnez la boîte et appuyez sur Entrée, puis sélectionnez le cylindre et appuyez sur Entrée : la boîte garde un trou et le cylindre disparaît. L'ordre compte, car ce que vous sélectionnez d'abord est ce qui reste.

### Pourquoi la soustraction ne fonctionne pas dans AutoCAD ?

Souvent à cause de l'ordre : ce qu'il faut garder va dans le premier jeu, ce qu'il faut enlever dans le second. Quand le premier jeu ne contient ni solide ni région, ou que le second n'en contient aucun qui ne soit pas déjà dans le premier, la commande dit <Message id="noSolidsOrRegionsSelected" /> et se termine ; quand rien du second ne peut être soustrait du premier, comme un solide d'une région ou une région d'un autre plan, elle dit <Message id="subtractNeedsTwo" /> et ne change rien. Les lignes et les polylignes doivent d'abord devenir des régions. Quand elle dit qu'une opération booléenne a échoué, les solides se rencontrent d'une façon que MellowCAD ne sait pas encore calculer, et restent tels qu'ils étaient.

### Comment soustraire une aire dans AutoCAD ?

Pour découper une forme 2D dans une autre, faites des deux des régions avec <Command id="REGION" /> et soustrayez l'intérieure de l'extérieure avec SOUSTRACTION : un carré dont on soustrait un cercle devient une seule région trouée. Pour mesurer une aire sans modifier le dessin, <Command id="AREA" /> retire des surfaces de son total cumulé avec <Keyword command="AREA" id="Subtract" />.

### Peut-on soustraire sans supprimer l'objet ?

SOUSTRACTION efface ce qu'elle soustrait, comme celle d'AutoCAD. Pour le garder, copiez-le d'abord sur place : <Command id="COPY" />, l'objet et Entrée, un point de base de 0,0, puis de nouveau Entrée pour le copier de 0,0, sur lui-même. SOUSTRACTION consomme ensuite l'un des deux.
