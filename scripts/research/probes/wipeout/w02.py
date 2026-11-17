W = r"C:\Users\oveli\AppData\Local\Temp\mcaddxf\out"
plot = lambda name: ["_ZOOM", "_E", "_-PLOT", "_Y", "Model", "PublishToWeb PNG.pc3", "Sun Hi-Res (1600.00 x 1280.00 Pixels)",
                     "_L", "_N", "_E", "_F", "_C", "_Y", "acad.ctb", "_N", "_A", W + "\\" + name + ".png", "_N", "_Y"]
out = ["(princ (getvar \"WIPEOUTFRAME\"))",
       "_COLOR", "1", "_LINE", "-20,25", "120,25", "", "_COLOR", "_BYLAYER",
       "_WIPEOUT", "0,0", "100,0", "100,50", "0,50", "",
       "_LINE", "50,-20", "50,70", "",
       "_RECTANG", "200,0", "300,50",
       "_WIPEOUT", "_P", "250,0", "_Y",
       "QAFLAGS", "2", "_LIST", "_L", "",
       ] + plot("wipe-frame1") + [
       "_WIPEOUT", "_F", "_OFF",
       ] + plot("wipe-frame0") + [
       "(princ (getvar \"WIPEOUTFRAME\"))",
       "_WIPEOUT", "_F", "_D",
       "(princ (getvar \"WIPEOUTFRAME\"))",
       ] + plot("wipe-frame2")
print("\n".join(out))
