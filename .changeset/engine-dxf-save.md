---
"@mellowcad/engine": minor
---

SAVEAS, SAVE and DXFOUT run while their Save Drawing As dialog shows (`state.saveAsDialog`), which the host answers with `saveAs({ fileName, fileType, dxf })` or closes with `setSaveAsDialog(false)`: the engine's drawing, or a DXF of AutoCAD 2000 to 2018, ASCII or binary, with DXF Options' decimal places and Select objects (`SAVE_FILE_TYPES`, `saveFileName`). `FileTransport.save` receives a DXF as a `Uint8Array`: a host's transport writes bytes as well as text.
