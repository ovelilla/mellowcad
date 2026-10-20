# type.ps1 <text> [hwnd] : types text into AutoCAD with real keystrokes (SendInput), "\n" = Enter,
# "\e" = Esc, then gives the focus back. This is the way to answer a prompt that a COM call left
# pending, since COM is refused until AutoCAD is quiescent. The command line must be visible
# (Ctrl+9, COMMANDLINE) or dynamic input on: with neither, typed text goes nowhere.
param([string]$text, [long]$hwnd = 0)
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
  static void Send(ushort vk, ushort scan, uint flags) { var a = new IN[2]; a[0].type = 1; a[0].ki = new KI { vk = vk, scan = scan, flags = flags }; a[1] = a[0]; a[1].ki.flags |= 2; SendInput(2, a, Marshal.SizeOf(typeof(IN))); }
  public static void Type(string s) { foreach (var c in s) { if (c == '\x1b') Send(0x1B, 0, 0); else if (c == '\r') Send(0x0D, 0, 0); else Send(0, c, 4); System.Threading.Thread.Sleep(15); } }
  // Never tap Alt to win the foreground: in AutoCAD it opens the ribbon's key tips, and the next
  // digit typed runs a Quick Access Toolbar button (that is how a probe once saved a drawing).
  public static void Focus(IntPtr h) { uint fg = GetWindowThreadProcessId(GetForegroundWindow(), IntPtr.Zero), me = GetCurrentThreadId(); AttachThreadInput(me, fg, true); SetForegroundWindow(h); AttachThreadInput(me, fg, false); }
}
"@
if ($hwnd -eq 0) { $hwnd = (Get-Process acad | Select-Object -First 1).MainWindowHandle }
$prev = [Ty]::GetForegroundWindow()
if ($prev -ne [IntPtr]$hwnd) { [Ty]::Focus([IntPtr]$hwnd); Start-Sleep -Milliseconds 200 }
[Ty]::Type($text.Replace('\e', [string][char]27).Replace('\n', [string][char]13))
Start-Sleep -Milliseconds 300
if ($prev -ne [IntPtr]$hwnd) { [Ty]::Focus($prev) }
"typed"
