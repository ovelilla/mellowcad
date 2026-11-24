# act.ps1 <hwnd> <automationId> [n] : acts on an element of the window by its AutomationId (as
# tree.ps1 prints it) through its pattern — Invoke, else Toggle, else Expand/Collapse — with no
# mouse and without bringing AutoCAD forward: a ribbon tab, the minimize button, a drop-down's
# arrow (`…_FlyoutButtonShowFlyout`), a panel's title (its slide-out), a status bar arrow. A popup
# it opens stays until it is acted on again or another opens. `parent>child` looks for the child
# under the parent (`ID_PopupPane_1>PART_ToggleButton`, the status bar's Customization); n picks
# the n-th match, from the end when negative.
param([long]$hwnd, [string]$id, [int]$n = 0)
[Console]::OutputEncoding = [Text.Encoding]::UTF8
Add-Type -AssemblyName UIAutomationClient, UIAutomationTypes
$byId = { param($v) New-Object Windows.Automation.PropertyCondition([Windows.Automation.AutomationElement]::AutomationIdProperty, $v) }
$root = [Windows.Automation.AutomationElement]::FromHandle([IntPtr]$hwnd)
if ($id -match '^(.+)>(.+)$') {
  $root = $root.FindFirst([Windows.Automation.TreeScope]::Descendants, (& $byId $Matches[1])); $id = $Matches[2]
  if (-not $root) { "parent not found"; exit 1 }
}
$found = $root.FindAll([Windows.Automation.TreeScope]::Descendants, (& $byId $id))
if ($n -lt 0) { $n = $found.Count + $n }
if ($n -lt 0 -or $found.Count -le $n) { "not found: $id ($($found.Count) matches)"; exit 1 }
$e = $found[$n]; $o = $null
if ($e.TryGetCurrentPattern([Windows.Automation.InvokePattern]::Pattern, [ref]$o)) { $o.Invoke(); "invoked $id"; exit 0 }
if ($e.TryGetCurrentPattern([Windows.Automation.TogglePattern]::Pattern, [ref]$o)) { $o.Toggle(); "toggled $id -> $($o.Current.ToggleState)"; exit 0 }
if ($e.TryGetCurrentPattern([Windows.Automation.ExpandCollapsePattern]::Pattern, [ref]$o)) {
  if ($o.Current.ExpandCollapseState -eq 'Collapsed') { $o.Expand() } else { $o.Collapse() }; "expanded or collapsed $id"; exit 0 }
"no pattern: $id"; exit 1
