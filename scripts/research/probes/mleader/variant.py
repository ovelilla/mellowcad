# Writes variants of AutoCAD's own MULTILEADER DXF (m03.dxf) to test what its reader trusts:
# each changes one group of the HELLO multileader (handle 2DF) and leaves the rest.
#   python3 -I variant.py <m03.dxf> <out dir>
import os
import sys

src, out = sys.argv[1], sys.argv[2]
text = open(src, encoding="utf-8", newline="").read()
nl = "\r\n" if "\r\n" in text else "\n"
L = text.split(nl)


def span(lines, handle):
    for i in range(len(lines) - 3):
        if lines[i].strip() == "0" and lines[i + 1] == "MULTILEADER" and lines[i + 3] == handle:
            j = i + 2
            while not (lines[j].strip() == "0"):
                j += 2
            return i, j
    raise ValueError(handle)


def setpair(lines, handle, code, old, new, after=None):
    """Sets the first `code old` pair of the multileader, after the marker value `after`."""
    lines = lines[:]
    i, j = span(lines, handle)
    k = i
    if after:
        while lines[k + 1] != after:
            k += 2
    while k < j:
        if lines[k].strip() == code and lines[k + 1].strip() == old:
            lines[k + 1] = new
            return lines
        k += 2
    raise ValueError((code, old, after))


def write(name, lines):
    open(os.path.join(out, name), "w", encoding="utf-8", newline="").write(nl.join(lines))


H = "2DF"
# v1: the text's location (context 12/22) moved by (20, 20).
v = setpair(L, H, "12", "40.0", "60.0")
v = setpair(v, H, "22", "30.53069577080491", "50.53069577080491")
write("v1.dxf", v)
# v2: the landing point (LEADER 10/20) moved to (25, 20).
v = setpair(L, H, "10", "30.0", "25.0", "LEADER{")
v = setpair(v, H, "20", "29.2593792633015", "20.0", "LEADER{")
write("v2.dxf", v)
# v3: the branch's dogleg length (LEADER 40) 8 -> 15; the entity's 41 stays 8.
write("v3.dxf", setpair(L, H, "40", "8.0", "15.0", "LEADER{"))
# v4: the context's arrowhead size (140) 4 -> 10; the entity's 42 stays 4.
write("v4.dxf", setpair(L, H, "140", "4.0", "10.0"))
# v5: the entity's arrowhead size (42) 4 -> 10; the context's 140 stays 4.
write("v5.dxf", setpair(L, H, "42", "4.0", "10.0", "}"))
# v6: the entity's leader type (170) straight -> spline.
write("v6.dxf", setpair(L, H, "170", "1", "     2", "}"))
# v7: the entity's dogleg (291) off.
write("v7.dxf", setpair(L, H, "291", "1", "     0", "}"))
# v8: the entity's landing (290) off.
write("v8.dxf", setpair(L, H, "290", "1", "     0", "}"))
# v9: the arrowhead vertex (LEADER_LINE 10/20) moved to (0, 20).
v = setpair(L, H, "10", "10.0", "0.0", "LEADER_LINE{")
v = setpair(v, H, "20", "10.0", "20.0", "LEADER_LINE{")
write("v9.dxf", v)
# v10: the context's text height (41) 2.5 -> 5.
write("v10.dxf", setpair(L, H, "41", "2.5", "5.0"))
# v11: the context's landing gap (145) 2 -> 6.
write("v11.dxf", setpair(L, H, "145", "2.0", "6.0"))
# v12: the context's scale (40) 1 -> 2.
write("v12.dxf", setpair(L, H, "40", "1.0", "2.0"))
# v13: two words, at the 30 wide it was made: does the 1.0 AutoCAD reads it back as wrap them?
write("v13.dxf", setpair(L, H, "304", "HELLO", "HELLO WORLD"))
# v14: the same with no columns (173 0, AutoCAD's 2 being dynamic).
write("v14.dxf", setpair(setpair(L, H, "304", "HELLO", "HELLO WORLD"), H, "173", "2", "     0"))
# v15: the arrowhead 6.6 from the landing, less than twice its size (4): is it drawn?
v = setpair(L, H, "10", "10.0", "25.0", "LEADER_LINE{")
write("v15.dxf", setpair(v, H, "20", "10.0", "25.0", "LEADER_LINE{"))
# v16: 3.5 from it, less than its size.
v = setpair(L, H, "10", "10.0", "27.0", "LEADER_LINE{")
write("v16.dxf", setpair(v, H, "20", "10.0", "27.0", "LEADER_LINE{"))
# v17: the text's colour (context 90) an index, 0xC3000001 (red); v18: the leader lines'
# (the object's 91) a true colour, 0xC200FF00: how AutoCAD reads the method byte.
write("v17.dxf", setpair(L, H, "90", "-1073741824", "-1023410175"))
write("v18.dxf", setpair(L, H, "91", "-1056964608", "-1040122112", "}"))
# v19: the object's text colour (92) a true red, 0xC2FF0000; v20: the context's (90) so.
write("v19.dxf", setpair(L, H, "92", "-1073741824", "-1040252928", "}"))
write("v20.dxf", setpair(L, H, "90", "-1073741824", "-1040252928"))
# v21: the leader lines (91) an index, 0xC3000001.
write("v21.dxf", setpair(L, H, "91", "-1056964608", "-1023410175", "}"))
# v22: no leader lines (170 0), for LIST's word.
write("v22.dxf", setpair(L, H, "170", "1", "     0", "}"))
# v23: no leader lines and the dogleg off, for LIST's words in each language.
write("v23.dxf", setpair(setpair(L, H, "170", "1", "     0", "}"), H, "291", "1", "     0", "}"))
