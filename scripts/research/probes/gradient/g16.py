# g16: the gradients fixture — the nine names in 100×50 rectangles, centred at 0°,
# then LINEAR and SPHERICAL turned 30° and not centred, and a one-colour true
# colour at tint 0.25 turned 45° (CURVED), saved as a 2018 DXF.
W = r"C:\Users\oveli\AppData\Local\Temp\mcaddxf\out"
names = ["GR_LINEAR", "GR_CYLIN", "GR_INVCYL", "GR_SPHER", "GR_HEMISP", "GR_CURVED", "GR_INVSPH", "GR_INVHEM", "GR_INVCUR"]
cases = [(n, "0", "_Y") for n in names] + [("GR_LINEAR", "30", "_N"), ("GR_SPHER", "30", "_N")]
out = []
for i in range(len(cases) + 1):
    x, y = (i % 4) * 120, -(i // 4) * 70
    out += ["_RECTANG", f"{x},{y}", f"{x + 100},{y + 50}"]
out += ["_ZOOM", "_E"]
for i, case in enumerate(cases):
    n, ang, cen = case
    x, y = (i % 4) * 120, -(i // 4) * 70
    out += ["_-HATCH", "_P", "_G", n, ang, cen, f"{x + 50},{y + 25}", ""]
i = len(cases)
x, y = (i % 4) * 120, -(i // 4) * 70
out += ["_-HATCH", "_P", "_G", "_S", "_T", "200,100,50", "0.25", "_P", "_G", "GR_CURVED", "45", "_Y", f"{x + 50},{y + 25}", ""]
out += ["_-PLOT", "_Y", "Model", "PublishToWeb PNG.pc3", "Sun Hi-Res (1600.00 x 1280.00 Pixels)",
        "_L", "_N", "_E", "_F", "_C", "_Y", "acad.ctb", "_N", "_A", W + "\\gradients-acad.png", "_N", "_Y"]
out += ["_DXFOUT", W + "\\gradients-2018.dxf", "_V", "2018", "16"]
print("\n".join(out))
