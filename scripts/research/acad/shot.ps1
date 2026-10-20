# shot.ps1 [hwnd] [crop] : captures a window (default: AutoCAD's main window) to a PNG and prints
# its path. PrintWindow sees the window even when it is covered. crop is "x,y,w,h" in window
# pixels; a negative x or y counts from the right or bottom edge. `-hwnd -1` (named: a bare -1 reads
# as a switch) captures the screen
# itself (crop then in screen pixels, required): what PrintWindow misses — tooltips, the snap
# marker's tip, shortcut menus, a floating command line, the cursor's own drawing.
param([long]$hwnd = 0, [string]$crop = "", [string]$out = "")
Add-Type -AssemblyName System.Drawing
Add-Type @"
using System; using System.Runtime.InteropServices;
public static class S {
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int L, T, R, B; }
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr h, IntPtr dc, uint f);
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
}
"@
[S]::SetProcessDPIAware() | Out-Null
if ($hwnd -eq 0) { $hwnd = (Get-Process acad | Select-Object -First 1).MainWindowHandle }
if (-not $out) { $dir = Join-Path $env:TEMP "mellowcad-acad"; New-Item -ItemType Directory -Force $dir | Out-Null; $out = Join-Path $dir ("shot-" + (Get-Date -Format "HHmmss-fff") + ".png") }
if ($hwnd -eq -1) {
  $c = $crop.Split(',') | ForEach-Object { [int]$_ }
  $bmp = New-Object Drawing.Bitmap $c[2], $c[3]
  $g = [Drawing.Graphics]::FromImage($bmp); $g.CopyFromScreen($c[0], $c[1], 0, 0, $bmp.Size); $g.Dispose()
  $bmp.Save($out, [Drawing.Imaging.ImageFormat]::Png); $bmp.Dispose()
  $out
  return
}
$r = New-Object S+RECT; [S]::GetWindowRect([IntPtr]$hwnd, [ref]$r) | Out-Null
$w = $r.R - $r.L; $h = $r.B - $r.T
$bmp = New-Object Drawing.Bitmap $w, $h
$g = [Drawing.Graphics]::FromImage($bmp); $dc = $g.GetHdc()
# 2 = PW_RENDERFULLCONTENT: without it the DirectX drawing area comes out black.
[S]::PrintWindow([IntPtr]$hwnd, $dc, 2) | Out-Null
$g.ReleaseHdc($dc); $g.Dispose()
if ($crop) {
  $c = $crop.Split(',') | ForEach-Object { [int]$_ }
  if ($c[0] -lt 0) { $c[0] += $w }; if ($c[1] -lt 0) { $c[1] += $h }
  $c[2] = [Math]::Min($c[2], $w - $c[0]); $c[3] = [Math]::Min($c[3], $h - $c[1])
  $part = $bmp.Clone((New-Object Drawing.Rectangle $c[0], $c[1], $c[2], $c[3]), $bmp.PixelFormat); $bmp.Dispose(); $bmp = $part
}
$bmp.Save($out, [Drawing.Imaging.ImageFormat]::Png); $bmp.Dispose()
$out
