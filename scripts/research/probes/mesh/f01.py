# f01: the polygon mesh fixture — a plain 3 x 4 mesh rising in Z, a 4 x 4 closed in M and N, a
# cubic-smoothed 4 x 4 (SURFU 4, SURFV 3), a quadratic one closed in N, a Bezier one, and a red
# DASHED 2 x 3; plotted, and saved as 2018 and 2000 ASCII DXF.
#   python3 f01.py > f01.txt
W = r"C:\Users\oveli\AppData\Local\Temp\mcaddxf\out"


def mesh(m, n, x0, y0, z=lambda i, j: 0):
    out = ["_3DMESH", str(m), str(n)]
    for i in range(m):
        for j in range(n):
            out.append(f"{x0 + 10 * j},{y0 + 10 * i},{z(i, j)}")
    return out


hump = lambda i, j: 20 if 0 < i < 3 and 0 < j < 3 else (5 if 0 < i < 3 or 0 < j < 3 else 0)
out = ["_-LINETYPE", "_L", "DASHED", "acadiso.lin", "",
       *mesh(3, 4, 0, 0, lambda i, j: i * 4 + j),
       *mesh(4, 4, 50, 0, hump), "_PEDIT", "_L", "_M", "_N", "_X",
       "SURFU", "4", "SURFV", "3", "SURFTYPE", "6",
       *mesh(4, 4, 100, 0, hump), "_PEDIT", "_L", "_S", "_X",
       "SURFTYPE", "5",
       *mesh(4, 5, 0, 50, hump), "_PEDIT", "_L", "_N", "_S", "_X",
       "SURFTYPE", "8",
       *mesh(4, 4, 70, 50, hump), "_PEDIT", "_L", "_S", "_X",
       *mesh(2, 3, 120, 50),
       "_CHPROP", "_L", "", "_C", "1", "_LT", "DASHED", "_S", "2", "",
       "_ZOOM", "_E",
       "_-PLOT", "_Y", "Model", "PublishToWeb PNG.pc3", "Sun Hi-Res (1600.00 x 1280.00 Pixels)",
       "_L", "_N", "_E", "_F", "_C", "_Y", "acad.ctb", "_N", "_A", W + "\\meshes-acad.png", "_N", "_Y",
       "_DXFOUT", W + "\\meshes-2018.dxf", "_V", "2018", "16",
       "_DXFOUT", W + "\\meshes-2000.dxf", "_V", "2000", "16"]
print("\n".join(out))
