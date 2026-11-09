---
title: "Commande TRAJECTOIRERESEAU (ARRAYPATH) dans AutoCAD"
metaTitle: "TRAJECTOIRERESEAU (ARRAYPATH) dans AutoCAD"
description: "Réseau le long d'une trajectoire dans AutoCAD en français : TRAJECTOIRERESEAU (ARRAYPATH), Mesurer ou Diviser, les éléments, leur alignement. Essayez-le."
figure: "Un petit carré au début d'un arc, mis en réseau le long de celui-ci : Diviser, 7 éléments, chacun tourné avec l'arc."
sourceHash: "d0d77418d682"
---

TRAJECTOIRERESEAU (ARRAYPATH en anglais) copie une sélection le long d'une trajectoire, une ligne, un arc, un cercle ou une polyligne, en un seul objet réseau. Elle demande les objets, indique le type et si le réseau est associatif, demande la courbe de la trajectoire et affiche aussitôt le réseau : les éléments espacés d'une fois et demie la taille de la sélection, autant qu'il en tient le long de la trajectoire, chacun tourné comme tourne la trajectoire. Une trajectoire ouverte part de l'extrémité la plus proche du point où vous la désignez, un cercle de son angle 0 dans le sens inverse des aiguilles d'une montre. Ensuite, une seule invite modifie le réseau en direct jusqu'à ce qu'Entrée le crée, par ses options ou par les poignées de l'aperçu, comme dans AutoCAD. Les objets sélectionnés restent où ils sont, comme son premier élément.

## Options

### ASsociative

<Keyword id="Yes" />, la valeur par défaut, crée un seul objet réseau, que ses poignées et la palette Propriétés modifient ensuite ; <Keyword id="No" /> crée des copies indépendantes à côté des objets sélectionnés. La réponse est conservée pour la session, par RESEAURECT et RESEAUPOLAIRE aussi.

### Method

<Keyword id="Measure" />, la valeur par défaut, place les éléments à une distance donnée les uns des autres, autant qu'il en tient ; <Keyword id="Divide" /> répartit un nombre d'éléments régulièrement sur toute la trajectoire, un à chaque extrémité d'une trajectoire ouverte.

### Items

Avec Diviser, le nombre d'éléments. Avec Mesurer, la distance qui les sépare, puis leur nombre, jusqu'au maximum qui tient, qu'elle indique ; <Keyword id="Fill entire path" /> les prend tous.

### Align items

<Keyword id="Yes" />, la valeur par défaut, fait tourner chaque élément comme tourne la trajectoire depuis son début ; <Keyword id="No" /> le déplace seulement le long de celle-ci.

### eXit

Crée le réseau et termine la commande, comme Entrée.

## Missing

Le réseau ne suit pas sa trajectoire : modifiez la trajectoire par la suite, et le réseau garde celle sur laquelle il a été créé. Les splines, les ellipses et les polylignes 3D ne peuvent pas encore servir de trajectoire, ni une trajectoire hors du plan du SCU. Le point de base, la direction tangente, les lignes, les niveaux, la direction Z et Expression ne sont pas proposés, ni un groupe à l'invite de la trajectoire, et les poignées du réseau n'ont pas de menus.

## Questions

### Comment faire un réseau le long d'une courbe ?

Tapez `TRAJECTOIRERESEAU`, sélectionnez les objets, appuyez sur Entrée et désignez la trajectoire près de l'extrémité par laquelle commencer ; ou tapez `RE` pour <Command id="ARRAY" /> et choisissez <Keyword command="ARRAY" id="PAth" /> après les objets. Réglez ensuite l'espacement ou le nombre d'éléments, et appuyez sur Entrée pour le créer.

### Pourquoi mon réseau ne suit pas la trajectoire ?

Ici, un réseau garde la trajectoire telle qu'elle était à sa création : déplacez ou étirez la trajectoire par la suite, et le réseau reste tel quel, là où le réseau associatif le long d'une trajectoire d'AutoCAD la suivrait. Effacer la trajectoire laisse aussi le réseau. Si les éléments ne tournent pas avec la trajectoire, choisissez <Keyword id="Align items" /> et répondez <Keyword id="Yes" />.

### Comment changer le sens d'un réseau le long d'une trajectoire ?

Désignez la trajectoire près de son autre extrémité : une trajectoire ouverte part de l'extrémité la plus proche du point désigné. Un cercle part toujours de son angle 0, dans le sens inverse des aiguilles d'une montre.

### Comment répartir les éléments régulièrement sur toute la trajectoire ?

Choisissez <Keyword id="Method" />, puis <Keyword id="Divide" />, puis <Keyword id="Items" />, et tapez leur nombre : ils sont répartis régulièrement, le premier et le dernier aux extrémités d'une trajectoire ouverte.
