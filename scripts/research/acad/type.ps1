# type.ps1 <text> [hwnd] [delayMs] : types text into AutoCAD with real keystrokes (SendInput), "\n" =
# Enter, "\e" = Esc, then gives the focus back. This is the way to answer a prompt that a COM call
# left pending, since COM is refused until AutoCAD is quiescent, and the only way to type into the
# dynamic-input tooltip. The keys reach a prompt only when the drawing area holds the keyboard
# focus: click there first (click.ps1). Each character is its virtual key (Shift where the layout
# needs it) and a pause (delayMs, 180 by default): typed faster, the tooltip mixed a comma's
# field switch with the next digits. A character the layout types with AltGr (`#` on a Spanish
# keyboard) goes as a Unicode key, since AltGr is never pressed. Never Alt (gui.md).
param([string]$text, [long]$hwnd = 0, [int]$delayMs = 180)
Add-Type @"
using System; using System.Runtime.InteropServices;
public static class Ty {
  [StructLayout(LayoutKind.Sequential)] public struct KI { public ushort vk, scan; public uint flags, time; public IntPtr extra; }
  [StructLayout(LayoutKind.Explicit, Size = 40)] public struct IN { [FieldOffset(0)] public uint type; [FieldOffset(8)] public KI ki; }
  [DllImport("user32.dll")] public static extern uint SendInput(uint n, IN[] i, int size);
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h, IntPtr p);
  [DllImport("kernel32.dll")] public static extern uint GetCurrentThreadId();
  [DllImport("user32.dll")] public static extern bool AttachThreadInput(uint a, uint b, bool attach);
  [DllImport("user32.dll")] public static extern short VkKeyScan(char c);
  static void Key(ushort vk, bool up) { var a = new IN[1]; a[0].type = 1; a[0].ki = new KI { vk = vk, flags = up ? 2u : 0u }; SendInput(1, a, Marshal.SizeOf(typeof(IN))); }
  static void Unicode(char c) { var a = new IN[2]; a[0].type = 1; a[0].ki = new KI { scan = c, flags = 4 }; a[1] = a[0]; a[1].ki.flags = 6; SendInput(2, a, Marshal.SizeOf(typeof(IN))); }
  public static void Type(string s, int delay) {
    foreach (var c in s) {
      if (c == '\x1b') { Key(0x1B, false); Key(0x1B, true); }
      else if (c == '\r') { Key(0x0D, false); Key(0x0D, true); }
      else {
        short v = VkKeyScan(c); int shift = (v >> 8) & 0xff;
        if (v == -1 || (shift & 6) != 0) Unicode(c);
        else {
          if ((shift & 1) != 0) Key(0x10, false);
          Key((ushort)(v & 0xff), false); Key((ushort)(v & 0xff), true);
          if ((shift & 1) != 0) Key(0x10, true);
        }
      }
      System.Threading.Thread.Sleep(delay);
    }
  }
  // Never tap Alt to win the foreground: in AutoCAD it opens the ribbon's key tips, and the next
  // digit typed runs a Quick Access Toolbar button (that is how a probe once saved a drawing).
  public static void Focus(IntPtr h) { uint fg = GetWindowThreadProcessId(GetForegroundWindow(), IntPtr.Zero), me = GetCurrentThreadId(); AttachThreadInput(me, fg, true); SetForegroundWindow(h); AttachThreadInput(me, fg, false); }
}
"@
if ($hwnd -eq 0) { $hwnd = (Get-Process acad | Select-Object -First 1).MainWindowHandle }
$prev = [Ty]::GetForegroundWindow()
if ($prev -ne [IntPtr]$hwnd) { [Ty]::Focus([IntPtr]$hwnd); Start-Sleep -Milliseconds 200 }
[Ty]::Type($text.Replace('\e', [string][char]27).Replace('\n', [string][char]13), $delayMs)
Start-Sleep -Milliseconds 300
if ($prev -ne [IntPtr]$hwnd) { [Ty]::Focus($prev) }
"typed"
