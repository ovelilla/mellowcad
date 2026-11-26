# key.ps1 <chord> [chord...] : presses keys by their virtual-key codes, each chord like "ctrl+z",
# "shift+tab", "f8", "down", "enter", "esc", "space", "minus", "period", "comma", "backspace". type.ps1 types text; this sends what text
# cannot: function keys, arrows, Ctrl and Shift chords. Never Alt (gui.md). AutoCAD must hold the
# keyboard focus: a click in the drawing area gives it (click.ps1).
# Before every chord it checks that the foreground window is acad.exe's, and refuses (exit 2)
# otherwise: SendInput types into whatever is in front, and on 2026-11-26 a mouse moved by hand
# put a browser there and a probe's keys were sent as chat messages.
param([Parameter(ValueFromRemainingArguments = $true)][string[]]$chords)
Add-Type @"
using System; using System.Runtime.InteropServices;
public static class Ke {
  [StructLayout(LayoutKind.Sequential)] public struct KI { public ushort vk, scan; public uint flags, time; public IntPtr extra; }
  [StructLayout(LayoutKind.Explicit, Size = 40)] public struct IN { [FieldOffset(0)] public uint type; [FieldOffset(8)] public KI ki; }
  [DllImport("user32.dll")] public static extern uint SendInput(uint n, IN[] i, int size);
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid);
  public static uint ForegroundPid() { uint pid; GetWindowThreadProcessId(GetForegroundWindow(), out pid); return pid; }
  public static void Key(ushort vk, bool up) { var a = new IN[1]; a[0].type = 1; a[0].ki = new KI { vk = vk, flags = up ? 2u : 0u }; SendInput(1, a, Marshal.SizeOf(typeof(IN))); }
}
"@
$acadPids = @(Get-Process acad -ErrorAction SilentlyContinue | ForEach-Object { [uint32]$_.Id })
function Guard {
  $p = [Ke]::ForegroundPid()
  if ($acadPids -notcontains $p) {
    $name = (Get-Process -Id $p -ErrorAction SilentlyContinue).ProcessName
    "refused: the foreground window is $name's, not AutoCAD's; nothing more pressed"; exit 2
  }
}
$names = @{ ctrl = 0x11; shift = 0x10; tab = 0x09; enter = 0x0D; esc = 0x1B; space = 0x20; up = 0x26; down = 0x28; left = 0x25; right = 0x27; del = 0x2E; minus = 0xBD; period = 0xBE; comma = 0xBC; backspace = 0x08 }
foreach ($chord in $chords) {
  $vks = foreach ($k in $chord.ToLower().Split('+')) {
    if ($names.ContainsKey($k)) { $names[$k] }
    elseif ($k -match '^f(\d+)$') { 0x6F + [int]$Matches[1] }
    elseif ($k.Length -eq 1) { [int][char]$k.ToUpper() }
    else { throw "unknown key $k" }
  }
  Guard
  foreach ($v in $vks) { [Ke]::Key([uint16]$v, $false); Start-Sleep -Milliseconds 30 }
  [array]::Reverse($vks); foreach ($v in $vks) { [Ke]::Key([uint16]$v, $true); Start-Sleep -Milliseconds 30 }
  Start-Sleep -Milliseconds 150
}
"pressed $($chords -join ' ')"
