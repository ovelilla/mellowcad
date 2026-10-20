# com.ps1 <op> [args] : COM (ActiveX) on the running acad.exe.
#   info                 the instance, its documents, which is active, whether it is quiescent
#   new                  a new drawing, made active (probe there, never in the user's drawings)
#   send <text>          types <text> at the command line of the active drawing (\n = Enter);
#                        returns when AutoCAD waits for input again. A prompt left pending
#                        blocks every later COM call (RPC_E_CALL_REJECTED): end it, or type Esc.
#   get <var>            a system variable
#   set <var> <value>    a system variable, cast to the type it already has
#   eval <lisp>          the value of an AutoLISP expression, as text
#   netload [dll]        NETLOAD (default: MellowProbe, as build.sh deploys it) with SECURELOAD 0
#                        for that call only (an untrusted DLL would open a security dialog)
#   trace <file>|off     MellowProbe's MPTRACE to a file (MellowProbe must be NETLOADed)
#   hist [n]             the last n lines of the command line (MellowProbe's MPHIST)
#   dump                 MPDUMP of model space, one JSON object per line
#   close                closes the active drawing WITHOUT saving: only a drawing `new` made
param([string]$op = "info", [string]$a1 = "", [string]$a2 = "")
$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [Text.Encoding]::UTF8
$acad = [Runtime.InteropServices.Marshal]::GetActiveObject("AutoCAD.Application.26")
$doc = $acad.ActiveDocument
$tmp = Join-Path $env:TEMP "mellowcad-acad"
New-Item -ItemType Directory -Force $tmp | Out-Null

function Send([string]$text) { $doc.SendCommand($text.Replace('\n', "`n")) }
function ProbeFile([string]$name) { $f = Join-Path $tmp $name; Remove-Item $f -ErrorAction SilentlyContinue; $f }

switch ($op) {
  "info" {
    "{0} {1}  quiescent={2}  hwnd={3}" -f $acad.Name, $acad.Version, $acad.GetAcadState().IsQuiescent, $acad.HWND
    foreach ($d in $acad.Documents) { "  {0}{1}  saved={2}  {3}" -f ($(if ($d.Active) { "* " } else { "  " })), $d.Name, $d.Saved, $d.FullName }
  }
  "new" { $d = $acad.Documents.Add(); $d.Activate(); $d.Name }
  "send" { Send $a1; "ok" }
  "get" { $doc.GetVariable($a1) }
  "set" {
    $old = $doc.GetVariable($a1)
    # SetVariable refuses a value of another COM type (an Int32 for SECURELOAD's Int16).
    $doc.SetVariable($a1, [Convert]::ChangeType($a2, $old.GetType(), [Globalization.CultureInfo]::InvariantCulture))
    $doc.GetVariable($a1)
  }
  "eval" {
    Send "(setvar `"USERS5`" (vl-prin1-to-string $a1)) "
    $doc.GetVariable("USERS5")
  }
  "netload" {
    if (-not $a1) { $a1 = Join-Path $env:LOCALAPPDATA "MellowProbe\MellowProbe.dll" }
    $old = $doc.GetVariable("SECURELOAD")
    $doc.SetVariable("SECURELOAD", [int16]0)
    try { Send ("(command `"_NETLOAD`" `"" + $a1.Replace('\', '/') + "`") ") }
    finally { $doc.SetVariable("SECURELOAD", $old) }
    "loaded; SECURELOAD=" + $doc.GetVariable("SECURELOAD")
  }
  "trace" { if ($a1 -eq "off") { Send "MPTRACE Off\n" } else { Send "MPTRACE File $a1\n" }; "ok" }
  "hist" {
    $f = ProbeFile "hist.txt"
    $n = if ($a1) { $a1 } else { "40" }
    Send "MPHIST $n $f\n"
    # AutoCAD hands the history newest first.
    $lines = @(Get-Content $f -Encoding UTF8); [array]::Reverse($lines); $lines
  }
  "dump" { $f = ProbeFile "dump.jsonl"; Send "MPDUMP $f\n"; Get-Content $f -Encoding UTF8 }
  "close" { $name = $doc.Name; $doc.Close($false); "closed $name without saving" }
  default { "unknown op: $op"; exit 2 }
}
