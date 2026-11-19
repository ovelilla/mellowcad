# An image AutoCAD cannot find

How AutoCAD 2027 opens, draws, lists and edits a raster image whose file is not where its
definition says, which a page always is. The probes run on a DXF of AutoCAD's own:

1. A 40 × 20 BMP in `%TEMP%\mcaddxf\img\pic.bmp` (any; i13 also attaches a 20 × 40 `tall.bmp`).
2. `i00.txt` attaches it at 10,20 by 3 and DXFOUTs `i00.dxf`.
3. Its IMAGEDEF's path rewritten to `C:\nowhere\pic.bmp` is `gone\i01.dxf`, which every other
   probe opens (`runacc.sh -i …\gone\i01.dxf <probe> en-US`). `dxfvar.py` writes its variants
   (path, size, pixel sides, clip, RASTERVARIABLES' 70; it drops the cached graphics, 160 and 310,
   which AutoCAD otherwise frames the image by).
4. `plotimg.sh <dxf> <name> [answers]` plots one, after the answers, to `img\<name>.png`;
   `measure.mjs` reads the path's ink box off a plot of an upright frame filling it.

i13 builds the reference drawing of `cad/serialization/dxf/fixtures/images-2018.dxf.gz` (its paths
made `C:\maps\…`); `s*.txt` are STRETCH's cases, i07 and i12 LIST's in every console.
