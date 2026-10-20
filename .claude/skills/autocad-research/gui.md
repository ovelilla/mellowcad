# The desktop AutoCAD

For what the console cannot show: dialogs and palettes, the jig and rubber band, grips, snap
markers, dynamic input, and the raw initget of each prompt (tracing.md). The tools are
`scripts/research/acad.sh <tool>`, each a PowerShell script in `scripts/research/acad/` that
says its arguments in its first lines. They act on the acad.exe the user has open, on the
Windows desktop.

## Rules: it is the user's AutoCAD

- **Probe in a drawing of your own**: `acad.sh com new` first, `acad.sh com close` at the end
  (closes without saving). Never type into, save or close a drawing you did not create.
- **Leave settings as found.** `com netload` restores SECURELOAD itself; anything else you change
  (COMMANDLINE shown, DYNMODE, OSMODE…) you set back. Their profile persists in the registry.
- **Never press Alt** (nor send keys while the ribbon's key tips show): it opens the key tips, and
  the next digit runs a Quick Access Toolbar button — a probe once saved the user's drawing
  that way. `type.ps1` brings AutoCAD forward without it.
- **A pending prompt locks COM.** SendCommand returns only when AutoCAD waits for input; while a
  command waits, every COM call fails with "call rejected by callee". Finish the command in the
  same `com send` (end it with `\n`), or answer it with `acad.sh type`.
- **A dialog locks it too**: an untrusted DLL's security task dialog, a .NET exception dialog.
  `acad.sh wins` lists the open windows, `acad.sh uia <hwnd>` reads one (fields included) and
  `acad.sh uia <hwnd> "<button>"` presses a button.

## How each part works

- **COM** (`com`): GetActiveObject on AutoCAD.Application.26, from Windows PowerShell 5.1.
  SendCommand types at the command line; GetVariable and SetVariable take the variable's own COM
  type (SECURELOAD is an Int16: an Int32 is refused); `com eval` returns a Lisp value. With two
  acad.exe running, COM always answers for the first.
- **Reading the command line**: `com hist` (MellowProbe's MPHIST), or `com trace` for the prompts.
  The getvar LASTPROMPT holds only the last line.
- **Seeing**: `acad.sh shot [hwnd] [x,y,w,h]` captures with PrintWindow, even a covered window,
  and prints the PNG's path for Read. The capture is in physical pixels: read the window and view
  rectangles with `acad.sh children <hwnd>` (the drawing area is the view window of class
  ACADDM_CHILD_DXGI_FLIP_MODE_VIEW_CLASS). AutoCAD may sit on a second monitor, at x ≥ 2560.
- **Moving the crosshair**: `acad.sh cursor <x> <y>` moves the real mouse, captures and puts it
  back. AutoCAD reads the real cursor; posted mouse messages move nothing.
- **Typing**: `acad.sh type "<text>"` (SendInput; `\n` Enter, `\e` Esc). The keys reach AutoCAD
  only if the command line is visible or dynamic input is on — this profile hides the command
  line and has DYNMODE 0: show it with `com send "_COMMANDLINE\n"`, hide it after with
  `_COMMANDLINEHIDE`.
- **A second instance**: `acad.sh launch [script.scr]` starts one beside the user's (`/b` runs a
  script). COM will not reach it; type and capture by its window handle.

## What does not work

- **The MCP server bundled with AutoCAD 2027**
  (`ApplicationPlugins/AutoCAD-MCP-Server-2027.bundle`, acmcp.dll) serves only the Autodesk
  Assistant, in process. Its HTTP transport (`http://localhost:5001-5050/mcp`, the hidden
  commands MCPHTTPSTART and MCPCONFIG, enabled by the environment variable
  ACMCP_TOOLS_CONFIG_FILE) cannot start: the release ships without
  ModelContextProtocol.AspNetCore.dll. Its tools only query objects and zoom anyway.
- **WM_COPYDATA** with a command string, **WM_CHAR** to the frame or the view, and posted
  **WM_MOUSEMOVE**: AutoCAD 2027 ignores them all.
- From WSL, Windows' `localhost` is not reachable (NAT networking): a Windows-side server is
  called through `curl.exe` or PowerShell.
