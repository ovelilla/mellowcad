# make.py base.dxf outdir: the drawings the hatchpat probes open, each AutoCAD's own p00 file
# (two rectangles, an ANSI31 hatch at scale 2 and a user-defined _U one at 30°, spacing 5,
# double) with one hatch left, the last object, its pattern edited:
#   custom.dxf    the ANSI31 hatch as MYPAT, type 2 (custom), in no .pat AutoCAD has:
#                   *MYPAT  0, 0,0, 2,5, 4,-2  /  90, 0,0, 0,6, 3,-3   at scale 2
#   user.dxf      the _U hatch alone
#   imperial.dxf  the ANSI31 hatch with acad.pat's lines (spacing 0.125 × 2) in this metric drawing
#   hound.dxf     the ANSI31 hatch as HOUND, type 1, with the lines the sample A-03 has (scale 7, 45°)
import sys, os

src, out = sys.argv[1], sys.argv[2]
L = open(src, encoding="utf-8").read().split("\n")
pairs = [(L[i], L[i + 1]) for i in range(0, len(L) - 1, 2)]


def entity_spans():
    spans, i = [], 0
    while i < len(pairs):
        if pairs[i][0].strip() == "0" and pairs[i][1].strip() == "HATCH":
            j = i + 1
            while pairs[j][0].strip() != "0":
                j += 1
            spans.append((i, j))
            i = j
        else:
            i += 1
    return spans


def pattern_block(lines):
    """Groups 78.. for pattern lines given as (angle, x, y, dx, dy, dashes)."""
    g = [(" 78", "%6d" % len(lines))]
    for a, x, y, dx, dy, dashes in lines:
        g += [(" 53", repr(a)), (" 43", repr(x)), (" 44", repr(y)), (" 45", repr(dx)), (" 46", repr(dy)),
              (" 79", "%6d" % len(dashes))]
        g += [(" 49", repr(d)) for d in dashes]
    return g


def rewrite(hatch, name, kind, lines):
    """The hatch's groups with its name, 76 and its 78…49 run replaced."""
    res, k = [], 0
    while k < len(hatch):
        c, v = hatch[k]
        cs = c.strip()
        if cs == "2":
            res.append((c, name))
        elif cs == "76":
            res.append((c, "%6d" % kind))
        elif cs == "78":
            res += pattern_block(lines)
            k += 1
            while hatch[k][0].strip() in ("53", "43", "44", "45", "46", "79", "49"):
                k += 1
            continue
        else:
            res.append((c, v))
        k += 1
    return res


def write(name, keep, edit=None):
    spans = entity_spans()
    body = []
    i = 0
    hatch_pairs = None
    for idx, (a, b) in enumerate(spans):
        body += pairs[i:a]
        if idx == keep:
            hatch_pairs = pairs[a:b]
        i = b
    # put the kept hatch at the end of ENTITIES
    end = next(k for k in range(i, len(pairs)) if pairs[k][1].strip() == "ENDSEC")
    body += pairs[i:end]
    body += edit(hatch_pairs) if edit else hatch_pairs
    body += pairs[end:]
    with open(os.path.join(out, name), "w", encoding="utf-8", newline="\n") as f:
        for c, v in body:
            f.write(c + "\n" + v + "\n")
        f.write(L[-1] if len(L) % 2 else "")


s = 2.0
mypat = lambda h: rewrite(h, "MYPAT", 2, [
    (0.0, 0.0, 0.0, 2 * s, 5 * s, [4 * s, -2 * s]),
    (90.0, 0.0, 0.0, -6 * s, 0.0, [3 * s, -3 * s]),
])
write("custom.dxf", 0, mypat)

# pair.dxf: MYPAT, then the _U hatch, both kept (MATCHPROP from one to the other)
spans = entity_spans()
(a0, b0), (a1, b1) = spans[0], spans[1]
body = pairs[:a0] + mypat(pairs[a0:b0]) + pairs[b0:]
with open(os.path.join(out, "pair.dxf"), "w", encoding="utf-8", newline="\n") as f:
    for c, v in body:
        f.write(c + "\n" + v + "\n")
write("user.dxf", 1)
r = 0.125 * s / 2 ** 0.5
write("imperial.dxf", 0, lambda h: rewrite(h, "ANSI31", 1, [(45.0, 0.0, 0.0, -r, r, [])]))
write("hound.dxf", 0, lambda h: rewrite(h, "HOUND", 1, [
    (45.0, 0.0, 0.0, 0.9280776503073436, 1.546796083845571, [7.0, -3.5]),
    (135.0, 0.0, 0.0, 0.9280776503073433, -1.546796083845571, [7.0, -3.5]),
]))
