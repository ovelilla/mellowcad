# Changelog

Every release of MellowCAD, newest first. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions follow
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

This file is also the page at mellowcad.com/changelog. Write for the people who draw with
MellowCAD: what they can do now that they could not before. Never state a count the code should
supply, and nothing that does not exist yet. The newest release must be the version in
`package.json`.

## [Unreleased]

## [0.1.0] - 2026-09-26

### Added

- A home page at mellowcad.com that shows how MellowCAD works. Every drawing on it is drawn by the
  engine itself when the site is built.
- Try it here: on a computer, the flange at the top of the home page opens as a live sketch. It
  never touches the drawing autosaved in your browser, and Open in the full editor takes it with
  you.
- `ELLIPSE`, by axis and end, with its Center, Arc and Rotation options.
- Blocks: `BLOCK`, `INSERT` and the Blocks palette.
- `HATCH` picks an internal point and traces the boundary around it.
- The clipboard: `COPYCLIP`, `CUTCLIP`, `COPYBASE` and `PASTECLIP`, on Ctrl+C, Ctrl+X,
  Ctrl+Shift+C and Ctrl+V.
- An About panel in the editor, with a quick start and a contact address.
- A privacy page, and this changelog.

### Changed

- The editor moved to mellowcad.com/draw. A drawing autosaved in your browser is still there, and
  the home page offers to continue it.

## [0.0.1] - 2026-08-27

### Added

- The first public version: 2D drafting in the browser with AutoCAD's command names, aliases,
  prompt order and option letters.
- Drawing with lines, polylines with arc segments, circles, arcs, rectangles, polygons,
  single-line text and hatches.
- Editing with move, copy, rotate, scale, mirror, stretch, offset, trim, extend, fillet, chamfer,
  break, join, explode, match properties and rectangular, polar and path arrays.
- Linear, aligned, radius, diameter, angular, baseline and continued dimensions.
- Object snaps, object snap tracking, polar tracking, Ortho, snap mode and dynamic input.
- Layers, linetypes, lineweights and colours.
- Autosave in the browser, and saving and opening a file with Ctrl+S and Ctrl+O.
