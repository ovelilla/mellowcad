W = r"C:\Users\oveli\AppData\Local\Temp\mcaddxf\out"
G = "(princ (vl-remove-if-not (quote (lambda (p) (member (car p) (quote (0 2 52 70 450 452 460 461 462 63 421 470 10))))) (entget (entlast))))"
out = ["_RECTANG", "0,0", "100,50", "_ZOOM", "_E",
       "_-HATCH", "_P", "_G", "GR_LINEAR", "20", "_N", "50,25", "", G,
       "_ROTATE", "_L", "", "0,0", "30", G,
       "_MIRROR", "_L", "", "0,0", "0,10", "_N", G,
       "_SCALE", "_L", "", "0,0", "2", G,
       "QAFLAGS", "2", "_LIST", "_L", "",
       "_EXPLODE", "_L", "",
       "(princ (cdr (assoc 0 (entget (entlast)))))",
       "(princ (sslength (ssget \"_P\")))",
       ]
print("\n".join(out))
