---
title: "Befehl SPLINE in AutoCAD"
description: "Wie SPLINE (Alias SPL) in AutoCAD funktioniert: eine Kurve durch Anpassungspunkte oder von Kontrollscheitelpunkten gezogen, Knoten, Grad, Tangenten, Schließen."
figure: "Ein Anpassungs-Spline durch fünf Punkte und darunter ein KS-Spline über fünf ebenso gesetzten Scheitelpunkten: Der erste verläuft durch sie, der zweite wird zu ihnen hingezogen."
sourceHash: "1056b5067125"
---

SPLINE zeichnet eine glatte Kurve auf zwei Arten: durch Punkte, die Sie angeben (Anpassen, die Vorgabe), oder zu Kontrollscheitelpunkten hingezogen, die Sie setzen (KS). Er beginnt mit der Meldung seiner Einstellungen, `Verfahren=Anpassen   Knoten=Sehne`, und fragt dann nach dem ersten Punkt; die Eingabetaste wird dort abgelehnt, wie in AutoCAD. Jeder weitere Punkt biegt die Kurve, die Vorschau folgt dem Fadenkreuz, und die Eingabetaste beendet den Befehl. Punkte lassen sich wählen, fangen oder eingeben, eine eingegebene Länge verläuft entlang des Fadenkreuzes, und ein Punkt behält sein Z, sodass ein Spline im Raum ansteigen kann. Esc verwirft die Kurve; der ganze Spline ist ein Schritt, den <Command id="U" /> zurücknimmt. Die Schaltflächen Spline Anpassen und Spline KS des Menübands starten SPLINE mit bereits beantwortetem Verfahren.

## Options

### Method

<Keyword id="Fit" /> oder <Keyword id="CV" />. Ein Anpassungs-Spline verläuft durch jeden angegebenen Punkt; ein KS-Spline verläuft nur durch seinen ersten und letzten Scheitelpunkt, die anderen ziehen ihn zu sich hin, sodass er glatter ausfällt und weiter von ihnen entfernt bleibt. Das Verfahren wird, wie die Knoten und der Grad, für den Rest der Sitzung beibehalten.

### Knots

Wie ein Anpassungs-Spline seine Punkte entlang der Kurve verteilt: <Keyword id="Chord" /> (die Vorgabe, nach dem Abstand zwischen ihnen), <Keyword id="Square root" /> dieses Abstands oder <Keyword id="Uniform" />, alle gleich. Durch dieselben Punkte ergibt jede eine etwas andere Kurve.

### Degree

Der Grad eines KS-Splines, von 1 (gerade Linien zwischen den Scheitelpunkten) bis 10; 3, die Vorgabe, ist kubisch. Bei weniger Scheitelpunkten, als der Grad braucht, nimmt die Kurve den höchsten, der möglich ist.

### Object

Wandelt eine Polylinie, die die Option Spline von PEDIT angepasst hat, 2D oder 3D, in einen KS-Spline derselben Kurve um und löscht die Polylinie, in einem Schritt. Alles andere wird mit <Message id="onlySplineFittedPolylines" /> abgelehnt.

### start Tangency

Nach dem ersten Punkt angeboten: die Richtung, in der die Kurve ihn verlässt, von diesem Punkt aus gewählt oder eingegeben.

### end Tangency

Die Richtung, in der die Kurve ihren letzten Punkt erreicht, dann endet der Spline.

### Undo

Nimmt den letzten Punkt zurück, bis hinunter zum ersten.

### Close

Ab dem dritten Punkt: verbindet das Ende wieder mit dem Anfang in einer glatten Schleife ohne Ecke und beendet den Befehl.

## Missing

Anpassungstoleranz: Ein Anpassungs-Spline verläuft immer genau durch seine Punkte, und die Option toLerance wird nicht angeboten. Solange er gezeichnet wird, ist der Spline noch kein Objekt, an dem sich fangen oder verfolgen lässt, wie es der von AutoCAD ist. Object löscht die Polylinie immer (DELOBJ). An einem fertigen Spline gibt es kein CVSHOW oder CVHIDE und keine Griffmenüs zum Hinzufügen oder Entfernen eines Punktes, die Eigenschaftenpalette bearbeitet seine Punkte, aber nicht Verfahren, Grad, Knoten, Gewichte oder Schließen, und Geometrischer Mittelpunkt, Lot und Tangente fangen nicht an ihm. SCHRAFF findet einen Spline nicht als Begrenzung, und BLEND gibt es noch nicht.

## Questions

### Wie lautet das Alias von SPLINE in AutoCAD, und wie heißt der Befehl auf Deutsch?

Der Befehl heißt auch im deutschen AutoCAD SPLINE. Das Alias ist `SPL`, dann die Eingabetaste oder die Leertaste. Der volle Name funktioniert ebenfalls, und `_SPLINE` in jeder Sprache von AutoCAD.

### Was ist der Unterschied zwischen Anpassen und KS?

Ein Anpassungs-Spline verläuft durch die Punkte, die Sie anklicken, was für eine Kurve passt, die sie berühren muss. Ein KS-Spline wird von seinen Kontrollscheitelpunkten geformt, denen er sich nur nähert, was für eine glatte, gefällige Form passt. Wählen Sie mit <Keyword id="Method" /> bei der ersten Eingabeaufforderung.

### Wie wandelt man einen Spline in eine Polylinie um?

Starten Sie <Command id="PEDIT" /> und wählen Sie den Spline: Er meldet <Message id="objectNotPolyline" /> und bietet an, ihn umzuwandeln, dann fragt er nach einer Genauigkeit von 0 bis 99, vorgegeben 10. Die Polylinie folgt dem Spline mit kurzen geraden Segmenten, mehr davon, als AutoCAD erzeugt.

### Wie wandelt man eine Polylinie in einen Spline um?

Passen Sie die Polylinie mit der Option Spline von <Command id="PEDIT" /> an, starten Sie dann SPLINE und wählen Sie <Keyword id="Object" />: Die Polylinie wird zu einem Spline derselben Kurve.

### Kann man einen Spline in AutoCAD auflösen?

Nein: <Command id="EXPLODE" /> lehnt einen Spline ab, wie es AutoCAD tut. Um ihn in Stücke zu zerlegen, wandeln Sie ihn zuerst mit <Command id="PEDIT" /> in eine Polylinie um und lösen diese dann in Linien auf.
