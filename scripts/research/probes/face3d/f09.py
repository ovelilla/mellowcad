# f09: the 3DFACE fixture — a flat quad, a triangle, a chained pair with hidden edges, a tilted
# quad, a red one DASHED, all saved as a 2018 DXF and plotted.
W = r"C:\Users\oveli\AppData\Local\Temp\mcaddxf\out"
out = ["_-LINETYPE", "_L", "DASHED", "acadiso.lin", "",
       "_3DFACE", "0,0", "100,0", "100,50", "0,50", "",
       "_3DFACE", "150,0", "250,0", "200,50", "", "",
       "_3DFACE", "0,100", "100,100", "_I", "100,150", "0,150", "200,100", "_I", "200,160", "",
       "_3DFACE", "300,0,0", "400,0,0", "400,50,40", "300,50,40", "",
       "_3DFACE", "300,100", "400,100", "400,150", "300,150", "",
       "_CHPROP", "_L", "", "_C", "1", "_LT", "DASHED", "_S", "2", "",
       "_ZOOM", "_E",
       "_-PLOT", "_Y", "Model", "PublishToWeb PNG.pc3", "Sun Hi-Res (1600.00 x 1280.00 Pixels)",
       "_L", "_N", "_E", "_F", "_C", "_Y", "acad.ctb", "_N", "_A", W + "\\faces-acad.png", "_N", "_Y",
       "_DXFOUT", W + "\\faces-2018.dxf", "_V", "2018", "16"]
print("\n".join(out))
