/**
 * How far a press on the drawing moves before it drags rather than clicks
 * (a lasso, ZOOM's window, the press the Selection list defers), in screen
 * pixels round the press. WHY not AutoCAD's: its lasso starts only past 7 px
 * across and 8 down (desktop erase/d15), which no review has taken yet
 * (docs/coverage/command-line.md). The ViewCube's is `leavesCubeClick`.
 */
export const DRAG_THRESHOLD_PX = 4
