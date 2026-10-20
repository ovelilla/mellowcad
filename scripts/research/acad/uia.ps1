# uia.ps1 <hwnd> [buttonName] : lists a window's UI Automation tree (with each field's text), or
# presses the named button. Reads and answers AutoCAD's dialogs without a mouse.
param([long]$hwnd, [string]$button = "")
[Console]::OutputEncoding = [Text.Encoding]::UTF8
Add-Type -AssemblyName UIAutomationClient, UIAutomationTypes
$root = [Windows.Automation.AutomationElement]::FromHandle([IntPtr]$hwnd)
$all = $root.FindAll([Windows.Automation.TreeScope]::Descendants, [Windows.Automation.Condition]::TrueCondition)
if ($button -eq "") {
  foreach ($e in $all) { $c = $e.Current; $v = $null; $val = ""
    if ($e.TryGetCurrentPattern([Windows.Automation.ValuePattern]::Pattern, [ref]$v)) { $val = "`tvalue=" + $v.Current.Value }
    "{0}`t{1}`t{2}`t{3}{4}" -f $c.ControlType.ProgrammaticName, $c.Name, $c.AutomationId, $c.ClassName, $val }
} else {
  $b = $all | Where-Object { $_.Current.Name -eq $button } | Select -First 1
  if (-not $b) { "not found: $button"; exit 1 }
  $o = $null
  if ($b.TryGetCurrentPattern([Windows.Automation.InvokePattern]::Pattern, [ref]$o)) { $o.Invoke(); "invoked: $button"; exit 0 }
  # Task dialog buttons (CCPushButton) expose no Invoke: TDM_CLICK_BUTTON with the id in their AutomationId.
  if ($b.Current.AutomationId -match '^CommandButton_(\d+)$') {
    Add-Type 'using System; using System.Runtime.InteropServices; public static class M { [DllImport("user32.dll")] public static extern IntPtr SendMessage(IntPtr h, int m, IntPtr w, IntPtr l); }'
    [M]::SendMessage([IntPtr]$hwnd, 0x466, [IntPtr][int]$Matches[1], [IntPtr]::Zero) | Out-Null; "task-dialog clicked: $button"; exit 0
  }
  "no way to click: $button"; exit 1
}
