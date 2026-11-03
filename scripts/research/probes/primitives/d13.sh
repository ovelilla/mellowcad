#!/usr/bin/env bash
# d13: pt-BR's Enter at CONE's and PYRAMID's height with no default (PRIM-D20, D40), on the
# desktop through COM alone (acad.sh launch "" pt-BR, a fresh session, a drawing of the probe's
# own, MellowProbe NETLOADed): both end with nothing made, as the console's k04, p215, p352.
# Seen: `Especificar altura ou [2Pontos/ponto final Eixo/Raio superior]:` then `Comando:`, 0
# objects, for both.
source "$(dirname "$0")/lib.sh"
$A com send "_CONE 0,0,0 5\n\n"
$A com eval '(if (ssget "_X") (sslength (ssget "_X")) 0)'
$A com send "_PYRAMID 0,0,0 5\n\n"
$A com eval '(if (ssget "_X") (sslength (ssget "_X")) 0)'
$A com hist 14
