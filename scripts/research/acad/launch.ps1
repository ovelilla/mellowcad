# launch.ps1 [script.scr] [language] : starts acad.exe as the owner's shortcut does (/product ACAD
# /language es-ES), or in another installed language (en-US), with /nologo; /b runs the script once
# the drawing opens. Without /language, acad.exe takes the install's default, English, and opens
# that profile with settings of its own. With no other instance running, COM reaches the new one;
# otherwise GetActiveObject keeps answering for the one that registered first, so drive a second
# one with type.ps1 and read it with shot.ps1.
param([string]$script = "", [string]$language = "es-ES")
$argv = @('/product', 'ACAD', '/language', $language, '/nologo')
if ($script) { $argv += @('/b', $script) }
$p = Start-Process "C:\Program Files\Autodesk\AutoCAD 2027\acad.exe" -ArgumentList $argv -PassThru
"pid=$($p.Id)"
