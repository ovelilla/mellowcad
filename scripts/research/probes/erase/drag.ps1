# drag.ps1 <down|move|up|key> <screenX> <screenY> [shift] : one step of a press-and-drag on the
# owner's screen, so a screenshot can be taken between steps with the button still held. down
# moves there and presses the left button, move moves with it held (two moves: AutoCAD redraws on
# a change of position), up moves there and releases it; key presses the virtual key <screenX>
# (0x20 Space) with the button still held. shift holds Shift through the step (down: until up).
# Run with powershell.exe -File (ERASE review, desktop probes; not an acad.sh tool).
param([string]$step, [int]$x, [int]$y, [string]$hold = "")
Add-Type @"
using System; using System.Runtime.InteropServices;
public static class Dr {
  [StructLayout(LayoutKind.Sequential)] public struct MI { public int dx, dy; public uint data, flags, time; public IntPtr extra; }
  [StructLayout(LayoutKind.Explicit, Size = 40)] public struct IN { [FieldOffset(0)] public uint type; [FieldOffset(8)] public MI mi; }
  [DllImport("user32.dll")] public static extern uint SendInput(uint n, IN[] i, int size);
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  public static void Button(uint flags) { var a = new IN[1]; a[0].type = 0; a[0].mi = new MI { flags = flags }; SendInput(1, a, Marshal.SizeOf(typeof(IN))); }
  [StructLayout(LayoutKind.Sequential)] public struct KI { public ushort vk, scan; public uint flags, time; public IntPtr extra; }
  [StructLayout(LayoutKind.Explicit, Size = 40)] public struct KN { [FieldOffset(0)] public uint type; [FieldOffset(8)] public KI ki; }
  [DllImport("user32.dll")] public static extern uint SendInput(uint n, KN[] i, int size);
  public static void Key(ushort vk, bool up) { var a = new KN[1]; a[0].type = 1; a[0].ki = new KI { vk = vk, flags = up ? 2u : 0u }; SendInput(1, a, Marshal.SizeOf(typeof(KN))); }
}
"@
[Dr]::SetProcessDPIAware() | Out-Null
if ($step -eq "key") { [Dr]::Key([uint16]$x, $false); Start-Sleep -Milliseconds 60; [Dr]::Key([uint16]$x, $true); Start-Sleep -Milliseconds 300; "key $x"; exit }
if ($hold -eq "shift" -and $step -eq "down") { [Dr]::Key(0x10, $false); Start-Sleep -Milliseconds 60 }
[Dr]::SetCursorPos($x - 3, $y - 3) | Out-Null; Start-Sleep -Milliseconds 80
[Dr]::SetCursorPos($x, $y) | Out-Null; Start-Sleep -Milliseconds 200
if ($step -eq "down") { [Dr]::Button(0x2) }
if ($step -eq "up") { [Dr]::Button(0x4); if ($hold -eq "shift") { Start-Sleep -Milliseconds 60; [Dr]::Key(0x10, $true) } }
Start-Sleep -Milliseconds 300
"$step at $x,$y"
