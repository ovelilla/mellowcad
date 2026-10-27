# burst.ps1 <screenX> <screenY> <n> <ms> : n wheel notches (delta 120) at that point, ms apart, sent
# with SendInput from one process, so the gaps are exact (View review, d01: the burst that is one
# ZOOM Previous step). It moves the owner's mouse. Run with powershell.exe -File.
param([int]$x, [int]$y, [int]$n, [int]$ms)
Add-Type @"
using System; using System.Runtime.InteropServices;
public static class Bw {
  [StructLayout(LayoutKind.Sequential)] public struct MI { public int dx, dy; public uint data, flags, time; public IntPtr extra; }
  [StructLayout(LayoutKind.Explicit, Size = 40)] public struct IN { [FieldOffset(0)] public uint type; [FieldOffset(8)] public MI mi; }
  [DllImport("user32.dll")] public static extern uint SendInput(uint n, IN[] i, int size);
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  public static void Wheel(int d) { var a = new IN[1]; a[0].type = 0; a[0].mi = new MI { flags = 0x800, data = unchecked((uint)d) }; SendInput(1, a, Marshal.SizeOf(typeof(IN))); }
}
"@
[Bw]::SetProcessDPIAware() | Out-Null
[Bw]::SetCursorPos($x, $y) | Out-Null; Start-Sleep -Milliseconds 200
for ($i = 0; $i -lt $n; $i++) { [Bw]::Wheel(120); Start-Sleep -Milliseconds $ms }
"burst $n every $ms ms"
