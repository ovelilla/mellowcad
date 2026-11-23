"""x045 (23/11/2026): what AutoCAD's CONVERT makes of an R12 hatch whose links are broken.

    python3 -I x045.py <x034-2018-R12.dxf> <out dir>

Writes five variants of x034's R12 (two associative ANSI hatches bounded by LINEs) for back.sh:
  v1  one boundary LINE of the first hatch deleted (its handle dangles in ASC_BOUNDS and R14)
  v2  one boundary LINE without its ASC_BOUNDS xdata
  v3  the references without ASC_BOUNDS and ASC_SEEDPOINT, R14_HATCH_DATA whole
  v4  the references without R14_HATCH_DATA (a hatch as R12 itself wrote one)
  v5  the references' blocks emptied (the R14 data alone says what the hatch is)
"""
import sys

src, out = sys.argv[1], sys.argv[2]
lines = open(src, encoding="latin-1").read().split("\n")
pairs = [(lines[i].strip(), lines[i + 1].rstrip("\r")) for i in range(0, len(lines) - 1, 2)]


def records(pairs):
    recs, cur = [], None
    for p in pairs:
        if p[0] == "0":
            cur = [p]
            recs.append(cur)
        else:
            cur.append(p)
    return recs


def write(name, recs):
    with open(f"{out}/{name}.dxf", "w", encoding="latin-1", newline="") as f:
        for r in recs:
            for c, v in r:
                f.write(f"{c:>3}\r\n{v}\r\n")
    print(name)


def cut(rec, start, stop):
    """Drops the xdata from the 1000 `start` up to (not including) the 1000 `stop` or the closing brace."""
    i = next((k for k, (c, v) in enumerate(rec) if c == "1000" and v.strip() == start), None)
    if i is None:
        return rec
    j = next(
        k
        for k in range(i + 1, len(rec))
        if (rec[k][0] == "1000" and rec[k][1].strip() == stop) or (rec[k] == ("1002", "}") and stop == "}")
    )
    return rec[:i] + rec[j:]


recs = records(pairs)
first_line = next(k for k, r in enumerate(recs) if r[0][1] == "LINE" and any(c == "1001" for c, _ in r))

write("x045-v1", recs[:first_line] + recs[first_line + 1 :])
v2 = list(recs)
v2[first_line] = [p for p in recs[first_line] if int(p[0]) < 1000]
write("x045-v2", v2)
write("x045-v3", [cut(r, "ASC_BOUNDS", "R14_HATCH_DATA") if r[0][1] == "INSERT" else r for r in recs])
write("x045-v4", [cut(r, "R14_HATCH_DATA", "}") if r[0][1] == "INSERT" else r for r in recs])
# v5: every entity inside a *X block dropped.
v5, inside = [], False
for r in recs:
    kind = r[0][1]
    if kind == "BLOCK":
        inside = any(c == "2" and v.strip().startswith("*X") for c, v in r)
        v5.append(r)
    elif kind == "ENDBLK":
        inside = False
        v5.append(r)
    elif not inside:
        v5.append(r)
write("x045-v5", v5)
