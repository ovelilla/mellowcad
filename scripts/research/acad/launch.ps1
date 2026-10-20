# launch.ps1 [script.scr] : starts another acad.exe, separate from the user's (/nologo, and /b runs
# the script once the drawing opens). COM's GetActiveObject keeps answering for the instance that
# registered first, so drive a second one with type.ps1 and read it with shot.ps1.
param([string]$script = "")
$argv = @('/nologo')
if ($script) { $argv += @('/b', $script) }
$p = Start-Process "C:\Program Files\Autodesk\AutoCAD 2027\acad.exe" -ArgumentList $argv -PassThru
"pid=$($p.Id)"
