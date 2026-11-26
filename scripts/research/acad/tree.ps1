# tree.ps1 <hwnd> [maxDepth] : the window's UI Automation tree, one element per line, indented by
# depth: type, name, AutomationId, class, rectangle (x,y w×h from the window's visible corner, in
# pixels) and the patterns it answers; `off` marks one that is off screen, `disabled` a greyed one,
# `range=min..max value= small= large=` a slider or spinner, `value="…"` a box. AutoCAD's WPF chrome —
# the title bar, the ribbon, the file and layout tabs, the status bar, the command line, an open
# drop-down — is all there with its measures; the application button and what the view draws (the
# ViewCube, the navigation bar, the viewport controls) are not.
param([long]$hwnd, [int]$maxDepth = 30)
[Console]::OutputEncoding = [Text.Encoding]::UTF8
Add-Type -AssemblyName UIAutomationClient, UIAutomationTypes
Add-Type @"
using System; using System.Runtime.InteropServices;
public static class Wf {
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int L, T, R, B; }
  [DllImport("dwmapi.dll")] public static extern int DwmGetWindowAttribute(IntPtr h, int a, out RECT r, int s);
}
"@
$f = New-Object Wf+RECT; [Wf]::DwmGetWindowAttribute([IntPtr]$hwnd, 9, [ref]$f, 16) | Out-Null
$root = [Windows.Automation.AutomationElement]::FromHandle([IntPtr]$hwnd)
$walker = [Windows.Automation.TreeWalker]::ControlViewWalker
function Walk($e, $d) {
  $c = $e.Current; $r = $c.BoundingRectangle
  $pats = ($e.GetSupportedPatterns() | ForEach-Object { $_.ProgrammaticName -replace 'PatternIdentifiers.Pattern','' }) -join ','
  $rect = if ($r.IsEmpty) { "-" } else { "{0},{1} {2}x{3}" -f [int]($r.X - $f.L), [int]($r.Y - $f.T), [int]$r.Width, [int]$r.Height }
  $off = if ($c.IsOffscreen) { " off" } else { "" }
  # A greyed control (Hatch Creation's Angle with a solid fill) and a slider's or spinner's range.
  if (-not $c.IsEnabled) { $off += " disabled" }
  $rv = $null
  if ($e.TryGetCurrentPattern([Windows.Automation.RangeValuePattern]::Pattern, [ref]$rv)) {
    $v = $rv.Current; $off += " range={0}..{1} value={2} small={3} large={4}" -f $v.Minimum, $v.Maximum, $v.Value, $v.SmallChange, $v.LargeChange
  }
  $vp = $null
  # One element per line: a box's breaks and tabs (MTEXT's editor) written as \r \n \t.
  if ($e.TryGetCurrentPattern([Windows.Automation.ValuePattern]::Pattern, [ref]$vp)) { $off += " value=`"{0}`"" -f ($vp.Current.Value -replace "`r", '\r' -replace "`n", '\n' -replace "`t", '\t') }
  "{0}{1}`t{2}`t{3}`t{4}`t{5}`t{6}{7}" -f ("  " * $d), ($c.ControlType.ProgrammaticName -replace 'ControlType.',''), $c.Name, $c.AutomationId, $c.ClassName, $rect, $pats, $off
  if ($d -ge $maxDepth) { return }
  $k = $walker.GetFirstChild($e)
  while ($k) { Walk $k ($d + 1); $k = $walker.GetNextSibling($k) }
}
Walk $root 0
