# dialog.ps1 <hwnd> <op> [ctrl] [arg] : drives a Win32 dialog of AutoCAD's by control id, with no
# mouse or keys (window messages), where uia.ps1 cannot press: a Tools button's popup menu, a tab, a
# check box on a tab's page. Control ids are uia.ps1's AutomationId column.
#   items <ctrl>            a combo box's entries (CB_GETLBTEXT), e.g. Files of type, 13002
#   select <ctrl> <index>   picks an entry and tells the dialog (CBN_SELCHANGE)
#   settext <ctrl> <text>   writes a field (WM_SETTEXT, then EN_CHANGE)
#   click <ctrl>            BM_CLICK on a button, posted (OK 1, Cancel 2)
#   check|uncheck <ctrl>    a check box set, the dialog told (BN_CLICKED)
#   state <ctrl>            a check box's state and whether it is enabled
#   tab <ctrl> <index>      a tab control's page (TCM_SETCURFOCUS)
#   menu <popup-hwnd> [item]  a popup menu's items (#32768 in wins.ps1), or chooses the one whose
#                           text starts with <item>: the menu closed, its command sent to <hwnd>
# A control on a tab's page sits in a child dialog: looked for there first.
param([long]$hwnd, [string]$op, [string]$ctrl = "0", [string]$arg = "")
[Console]::OutputEncoding = [Text.Encoding]::UTF8
Add-Type @'
using System; using System.Text; using System.Runtime.InteropServices;
public static class D {
  [DllImport("user32.dll")] public static extern IntPtr GetDlgItem(IntPtr h, int id);
  [DllImport("user32.dll")] public static extern IntPtr GetParent(IntPtr h);
  [DllImport("user32.dll")] public static extern bool IsWindowEnabled(IntPtr h);
  [DllImport("user32.dll")] public static extern IntPtr FindWindowEx(IntPtr p, IntPtr a, string c, string n);
  [DllImport("user32.dll")] public static extern IntPtr SendMessage(IntPtr h, int m, IntPtr w, IntPtr l);
  [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern IntPtr SendMessage(IntPtr h, int m, IntPtr w, string l);
  [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern IntPtr SendMessage(IntPtr h, int m, IntPtr w, StringBuilder l);
  [DllImport("user32.dll")] public static extern bool PostMessage(IntPtr h, int m, IntPtr w, IntPtr l);
  [DllImport("user32.dll")] public static extern int GetMenuItemCount(IntPtr m);
  [DllImport("user32.dll")] public static extern uint GetMenuItemID(IntPtr m, int i);
  [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern int GetMenuString(IntPtr m, uint id, StringBuilder s, int n, uint f);
}
'@
$h = [IntPtr]$hwnd
if ($op -eq "menu") {
  $popup = [IntPtr][long]$ctrl
  $menu = [D]::SendMessage($popup, 0x01E1, [IntPtr]::Zero, [IntPtr]::Zero)
  $chosen = 0
  for ($i = 0; $i -lt [D]::GetMenuItemCount($menu); $i++) {
    $sb = New-Object Text.StringBuilder 256
    [D]::GetMenuString($menu, [uint32]$i, $sb, 256, 0x400) | Out-Null
    $id = [D]::GetMenuItemID($menu, $i)
    "$id`t$($sb.ToString())"
    if ($arg -and $sb.ToString().Replace('&', '') -like "$arg*") { $chosen = $id }
  }
  if ($chosen) {
    [D]::PostMessage($popup, 0x100, [IntPtr]0x1B, [IntPtr]::Zero) | Out-Null
    Start-Sleep -Milliseconds 500
    [D]::PostMessage($h, 0x111, [IntPtr][long]$chosen, [IntPtr]::Zero) | Out-Null
    "chose $chosen"
  }
  exit 0
}
$id = [int]$ctrl
$page = [D]::FindWindowEx($h, [IntPtr]::Zero, "#32770", $null)
$c = if ($page -ne [IntPtr]::Zero) { [D]::GetDlgItem($page, $id) } else { [IntPtr]::Zero }
if ($c -eq [IntPtr]::Zero) { $c = [D]::GetDlgItem($h, $id) }
if ($c -eq [IntPtr]::Zero) { "no control $id"; exit 1 }
$parent = [D]::GetParent($c)
$notify = { param($code) [D]::SendMessage($parent, 0x111, [IntPtr](($code -shl 16) -bor $id), $c) | Out-Null }
switch ($op) {
  "items" {
    $n = [int][D]::SendMessage($c, 0x146, [IntPtr]::Zero, [IntPtr]::Zero)
    for ($i = 0; $i -lt $n; $i++) { $sb = New-Object Text.StringBuilder 512; [D]::SendMessage($c, 0x148, [IntPtr]$i, $sb) | Out-Null; $sb.ToString() }
  }
  "select" { [D]::SendMessage($c, 0x14E, [IntPtr][int]$arg, [IntPtr]::Zero) | Out-Null; & $notify 1 }
  "settext" { [D]::SendMessage($c, 0x0C, [IntPtr]::Zero, $arg) | Out-Null; & $notify 0x300 }
  "click" { [D]::PostMessage($c, 0xF5, [IntPtr]::Zero, [IntPtr]::Zero) | Out-Null }
  "check" { [D]::SendMessage($c, 0xF1, [IntPtr]1, [IntPtr]::Zero) | Out-Null; & $notify 0 }
  "uncheck" { [D]::SendMessage($c, 0xF1, [IntPtr]0, [IntPtr]::Zero) | Out-Null; & $notify 0 }
  "state" { "checked={0} enabled={1}" -f [int][D]::SendMessage($c, 0xF0, [IntPtr]::Zero, [IntPtr]::Zero), [D]::IsWindowEnabled($c) }
  "tab" { [D]::SendMessage($c, 0x1330, [IntPtr][int]$arg, [IntPtr]::Zero) | Out-Null }
  default { "unknown op $op"; exit 2 }
}
