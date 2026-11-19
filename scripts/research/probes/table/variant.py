# Writes variants of AutoCAD's own table DXF (t00.dxf) to test what its reader trusts.
#   python3 -I variant.py <t00.dxf> <out dir>
import os
import sys

src, out = sys.argv[1], sys.argv[2]
text = open(src, encoding="utf-8", newline="").read()
nl = "\r\n" if "\r\n" in text else "\n"
L = text.split(nl)


def write(name, lines):
    open(os.path.join(out, name), "w", encoding="utf-8", newline="").write(nl.join(lines))


def find_pair(lines, code, value, start=0):
    for i in range(start, len(lines) - 1):
        if lines[i].strip() == code.strip() and lines[i + 1] == value:
            return i
    raise ValueError((code, value))


blocks = find_pair(L, "2", "BLOCKS")
i = find_pair(L, "2", "*T1", blocks)
j = find_pair(L, "0", "LINE", i)
e = find_pair(L, "0", "ENDBLK", i)
t = find_pair(L, "0", "ACAD_TABLE", find_pair(L, "2", "ENTITIES"))

# v1: a circle added to *T1: does AutoCAD keep the block it reads?
circle = ["  0", "CIRCLE", "  5", "FFF0", "330", "2DA", "100", "AcDbEntity", "  8", "0",
          "100", "AcDbCircle", " 10", "50.0", " 20", "-10.0", " 30", "0.0", " 40", "30.0"]
write("v1.dxf", L[:j] + circle + L[j:])

# v2: the first column 63.5 -> 100 in the table's data only.
k = find_pair(L, "142", "63.5", t)
v2 = L[:]
v2[k + 1] = "100.0"
write("v2.dxf", v2)

# v3: the table's block reference scale 41/42/43 = 2 (AutoCAD writes 1), after its 10/20/30.
b = find_pair(L, " 30", "0.0", find_pair(L, "100", "AcDbBlockReference", t))
write("v3.dxf", L[: b + 2] + [" 41", "2.0", " 42", "2.0", " 43", "2.0"] + L[b + 2 :])

# v4: an empty *T1: does AutoCAD rebuild it?
write("v4.dxf", L[:j] + L[e:])
