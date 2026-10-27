# The Inquiry review's desktop pass, 2026-10-27, es-ES: `acad.sh launch` (the Spanish profile), the
# same drawing and view as d01-d09.sh. Helpers: lib-dsk.sh. Read before and put back: OSMODE 4133,
# DYNMODE -1, ORTHOMODE 0.
. "$(dirname "${BASH_SOURCE[0]}")/lib-dsk.sh"
$A com eval '(setvar "OSMODE" 0)'; cs "_ZOOM _C 50,25 120\n"; at 90 45; ty "\e\e"

# e01 the Spanish look: Multiple's `Distancia = 19.9922` / `Precise punto siguiente o` with this
# profile's pointer input (the total at the prompt, not to the cursor) (e01-1); `Modificación de
# ángulo: 49.7374 < 30°` (e01-2); AREA's green fill (e01-3), the `?` badge throughout.
ty "_DIST\n"; at 20 15; ty "_M\n"; at 40 15; mv 55 35; scr 40 25 e01-1 1100 700; ty "\e\e"
at 90 45; ty "\e\e"; ty "_DIST\n0,0\n<30\n"; mv 40 30; scr 20 15 e01-2 1100 700; ty "10\n"
at 90 45; ty "\e\e"; ty "_AREA\n"; at 20 15; at 60 15; mv 50 40; scr 40 25 e01-3 1100 700; ty "\e\e"
# Escape at Length goes back (`Precise longitud de línea: *Cancelado*`, `Distancia = 10.0000` and the
# prompt again); ID refuses `<45` with `Punto no válido.`
$A com netload; $A com set DYNMODE 0; at 90 45; ty "\e\e"
ty "_DIST\n0,0\n_M\n10,0\n_L\n"; ty "\e"; ty "\e"; ty "_AREA\n0,0\n10,0\n_L\n"; ty "\e"; ty "\e"; ty "_ID\n<45\n"; ty "\e"; hist 30

# e02 with dimensional input (DYNMODE 3) the prompt's `Distancia = …` is the run to the cursor:
# 45.0567 (19.9922 + 25.0645, e02-1), 49.9805 with the cursor moved on (e02-2).
$A com set DYNMODE 3; at 90 45; ty "\e\e"; ty "_DIST\n"; at 20 15; ty "_M\n"; at 40 15; mv 55 35; scr 40 25 e02-1 1100 700
mv 70 15; scr 40 25 e02-2 1100 700; ty "\e\e"

# e03 ID's point: the `?` badge too.
$A com eval '(setvar "DYNMODE" -1)'; at 90 45; ty "\e\e"; ty "_ID\n"; mv 40 25; scr 40 25 e03-1 500 300; ty "\e\e"

$A com eval '(setvar "OSMODE" 4133)'; $A com close
