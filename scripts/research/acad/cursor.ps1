# cursor.ps1 <screenX> <screenY> [hwnd] [crop] : moves the real mouse cursor there, lets AutoCAD
# redraw (rubber band, snap marker, tooltip), captures like shot.ps1, then puts the cursor back.
# AutoCAD reads the real cursor: a posted WM_MOUSEMOVE does not move its crosshair. Screen
# coordinates come from children.ps1 (the view is ACADDM_CHILD_DXGI_FLIP_MODE_VIEW_CLASS).
param([int]$x, [int]$y, [long]$hwnd = 0, [string]$crop = "")
Add-Type 'using System; using System.Runtime.InteropServices; public static class Cu { [StructLayout(LayoutKind.Sequential)] public struct P { public int X, Y; } [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y); [DllImport("user32.dll")] public static extern bool GetCursorPos(out P p); [DllImport("user32.dll")] public static extern bool SetProcessDPIAware(); }'
[Cu]::SetProcessDPIAware() | Out-Null
$old = New-Object Cu+P; [Cu]::GetCursorPos([ref]$old) | Out-Null
# Two moves: AutoCAD redraws a jig on a change of position, not on arrival.
[Cu]::SetCursorPos($x - 3, $y - 3) | Out-Null; Start-Sleep -Milliseconds 150
[Cu]::SetCursorPos($x, $y) | Out-Null; Start-Sleep -Milliseconds 600
& "$PSScriptRoot\shot.ps1" $hwnd $crop
[Cu]::SetCursorPos($old.X, $old.Y) | Out-Null
