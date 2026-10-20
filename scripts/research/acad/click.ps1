# click.ps1 <screenX> <screenY> [button] [count] [hold] : moves the real mouse cursor there and
# clicks it (button left, right, middle, none to only move, or wheel with count the notches,
# negative towards the user; count 2 is a double-click; hold "shift" or "ctrl" held during the
# click), then leaves the cursor where it is,
# so what hovering shows stays on the screen for shot.ps1. It moves the owner's mouse: a session
# that clicks asks the owner first (.claude/skills/command-review/annex-probes.md, the desktop).
# A click in the drawing area is also what gives AutoCAD's keyboard focus to its prompt, which
# type.ps1 needs. Screen coordinates are physical pixels, as children.ps1 prints them.
param([int]$x, [int]$y, [string]$button = "left", [int]$count = 1, [string]$hold = "")
Add-Type @"
using System; using System.Runtime.InteropServices;
public static class Cl {
  [StructLayout(LayoutKind.Sequential)] public struct MI { public int dx, dy; public uint data, flags, time; public IntPtr extra; }
  [StructLayout(LayoutKind.Explicit, Size = 40)] public struct IN { [FieldOffset(0)] public uint type; [FieldOffset(8)] public MI mi; }
  [DllImport("user32.dll")] public static extern uint SendInput(uint n, IN[] i, int size);
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  public static void Button(uint flags, uint data = 0) { var a = new IN[1]; a[0].type = 0; a[0].mi = new MI { flags = flags, data = data }; SendInput(1, a, Marshal.SizeOf(typeof(IN))); }
  [StructLayout(LayoutKind.Sequential)] public struct KI { public ushort vk, scan; public uint flags, time; public IntPtr extra; }
  [StructLayout(LayoutKind.Explicit, Size = 40)] public struct KN { [FieldOffset(0)] public uint type; [FieldOffset(8)] public KI ki; }
  [DllImport("user32.dll")] public static extern uint SendInput(uint n, KN[] i, int size);
  public static void Key(ushort vk, bool up) { var a = new KN[1]; a[0].type = 1; a[0].ki = new KI { vk = vk, flags = up ? 2u : 0u }; SendInput(1, a, Marshal.SizeOf(typeof(KN))); }
}
"@
[Cl]::SetProcessDPIAware() | Out-Null
$flags = @{ left = @(0x2, 0x4); right = @(0x8, 0x10); middle = @(0x20, 0x40); none = @(); wheel = @() }[$button]
if ($null -eq $flags) { throw "button is left, right, middle, none or wheel" }
$holdVk = @{ shift = 0x10; ctrl = 0x11 }[$hold]
# Two moves: AutoCAD redraws on a change of position, not on arrival.
[Cl]::SetCursorPos($x - 3, $y - 3) | Out-Null; Start-Sleep -Milliseconds 120
[Cl]::SetCursorPos($x, $y) | Out-Null; Start-Sleep -Milliseconds 250
if ($holdVk) { [Cl]::Key([uint16]$holdVk, $false); Start-Sleep -Milliseconds 60 }
if ($button -eq "wheel") { [Cl]::Button(0x800, [uint32](120 * $count -band 0xFFFFFFFF)) }
elseif ($flags.Count) {
  for ($i = 0; $i -lt $count; $i++) {
    [Cl]::Button($flags[0]); Start-Sleep -Milliseconds 40; [Cl]::Button($flags[1]); Start-Sleep -Milliseconds 80
  }
}
if ($holdVk) { Start-Sleep -Milliseconds 60; [Cl]::Key([uint16]$holdVk, $true) }
Start-Sleep -Milliseconds 300
"clicked $button x$count at $x,$y"
