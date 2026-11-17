out = ["_RECTANG", "0,0", "100,50", "_ZOOM", "_E"]
for t in ["0", "0.25", "0.5", "0.75", "1", "2", "-1"]:
    out += ["_-HATCH", "_P", "_G", "_S", "1", t, "_P", "_G", "GR_LINEAR", "0", "_Y", "50,25", "",
            "(princ (vl-remove-if-not (quote (lambda (p) (member (car p) (quote (452 453 462 63 421 470 2))))) (entget (entlast))))",
            "_ERASE", "_L", ""]
# a single colour of a true colour, and the two-colour defaults after it
out += ["_-HATCH", "_P", "_G", "_S", "_T", "200,100,50", "0.3", "_P", "_G", "GR_LINEAR", "0", "_Y", "50,25", "",
        "(princ (vl-remove-if-not (quote (lambda (p) (member (car p) (quote (452 453 462 63 421 470 2))))) (entget (entlast))))",
        "(getvar \"GFCLR1\")", "(getvar \"GFCLR2\")", "(getvar \"GFCLRLUM\")", "(getvar \"GFCLRSTATE\")", "(getvar \"GFNAME\")", "(getvar \"GFANG\")", "(getvar \"GFSHIFT\")", "(getvar \"HPNAME\")"]
print("\n".join(out))
