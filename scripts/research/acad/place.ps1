# place.ps1 <hwnd> [info | at <x> <y> <w> <h> | max | front] : a window's rectangles and which
# window has the foreground; `at` restores it and puts its visible frame there at that size (a
# capture at 1280×720 or 1920×1080) without activating it; `max` maximises it again; `front` hands
# it the foreground — to give it back to the owner's window after `com send`, which brings
# AutoCAD forward.
param([long]$hwnd, [string]$op = "info", [int]$x = 0, [int]$y = 0, [int]$w = 0, [int]$h = 0)
[Console]::OutputEncoding = [Text.Encoding]::UTF8
Add-Type @"
using System; using System.Text; using System.Runtime.InteropServices;
public static class Wn {
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int L, T, R, B; }
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool GetClientRect(IntPtr h, out RECT r);
  [DllImport("dwmapi.dll")] public static extern int DwmGetWindowAttribute(IntPtr h, int a, out RECT r, int s);
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int c);
  [DllImport("user32.dll")] public static extern bool IsZoomed(IntPtr h);
  [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr h, IntPtr a, int x, int y, int w, int hh, uint f);
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern int GetWindowText(IntPtr h, StringBuilder s, int n);
}
"@
[Wn]::SetProcessDPIAware() | Out-Null
$p = [IntPtr]$hwnd
$r = New-Object Wn+RECT; $f = New-Object Wn+RECT; $c = New-Object Wn+RECT
function Measure-Window {
  [Wn]::GetWindowRect($p, [ref]$script:r) | Out-Null
  # DWMWA_EXTENDED_FRAME_BOUNDS: the frame one sees, without the invisible resize borders.
  [Wn]::DwmGetWindowAttribute($p, 9, [ref]$script:f, 16) | Out-Null
  [Wn]::GetClientRect($p, [ref]$script:c) | Out-Null
}
if ($op -eq "max") { [Wn]::ShowWindow($p, 3) | Out-Null }
if ($op -eq "front") { [Wn]::SetForegroundWindow($p) | Out-Null }
if ($op -eq "at") {
  # SW_SHOWNOACTIVATE, then SWP_NOZORDER | SWP_NOACTIVATE: whoever is typing keeps the keyboard.
  [Wn]::ShowWindow($p, 4) | Out-Null
  Measure-Window
  $dl = $f.L - $r.L; $dt = $f.T - $r.T; $dr = $r.R - $f.R; $db = $r.B - $f.B
  [Wn]::SetWindowPos($p, [IntPtr]::Zero, $x - $dl, $y - $dt, $w + $dl + $dr, $h + $dt + $db, 0x0014) | Out-Null
}
Measure-Window
$fg = [Wn]::GetForegroundWindow(); $t = New-Object Text.StringBuilder 256; [Wn]::GetWindowText($fg, $t, 256) | Out-Null
"window $($r.L),$($r.T) $($r.R-$r.L)x$($r.B-$r.T)  frame $($f.L),$($f.T) $($f.R-$f.L)x$($f.B-$f.T)  client $($c.R)x$($c.B)  zoomed=$([Wn]::IsZoomed($p))"
"foreground=$fg  $t"
