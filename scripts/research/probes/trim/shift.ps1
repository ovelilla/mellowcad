# shift.ps1 <down|up> : presses or releases Shift with SendInput, so it stays held between two
# calls and a hover or a screenshot is taken with it down (TRIM/EXTEND review, desktop probes).
param([string]$step)
Add-Type @"
using System; using System.Runtime.InteropServices;
public static class Sk {
  [StructLayout(LayoutKind.Sequential)] public struct KI { public ushort vk, scan; public uint flags, time; public IntPtr extra; }
  [StructLayout(LayoutKind.Explicit, Size = 40)] public struct KN { [FieldOffset(0)] public uint type; [FieldOffset(8)] public KI ki; }
  [DllImport("user32.dll")] public static extern uint SendInput(uint n, KN[] i, int size);
  public static void Key(ushort vk, bool up) { var a = new KN[1]; a[0].type = 1; a[0].ki = new KI { vk = vk, flags = up ? 2u : 0u }; SendInput(1, a, Marshal.SizeOf(typeof(KN))); }
}
"@
[Sk]::Key([uint16]0x10, $step -eq "up"); Start-Sleep -Milliseconds 120; "shift $step"
