W = r"C:\Users\oveli\AppData\Local\Temp\mcaddxf\out"
plot = lambda name: ["_ZOOM", "_E", "_-PLOT", "_Y", "Model", "PublishToWeb PNG.pc3", "Sun Hi-Res (1600.00 x 1280.00 Pixels)",
                     "_L", "_N", "_E", "_F", "_C", "_Y", "acad.ctb", "_N", "_A", W + "\\" + name + ".png", "_N", "_Y"]
G = "(princ (vl-remove-if-not (quote (lambda (p) (member (car p) (quote (0 460 10))))) (entget (entlast))))"
out = ["_RECTANG", "0,0", "100,50", "_ZOOM", "_E",
       "_-HATCH", "_P", "_G", "GR_LINEAR", "0", "_Y", "50,25", "",
       "_ERASE", "_W", "-1,-1", "101,51", "_R", "_L", "",
       "_-BLOCK", "G", "0,0", "_L", "",
       "_-INSERT", "G", "0,0", "1", "1", "90"] + plot("insr90") + [
       "_EXPLODE", "_L", "", G,
       "_-INSERT", "G", "200,0", "-1", "1", "0", "_EXPLODE", "_L", "", G,
       ]
print("\n".join(out))
