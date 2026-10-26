param([long]$hwnd, [int]$id = 2)
Add-Type 'using System; using System.Runtime.InteropServices; public static class P { [DllImport("user32.dll")] public static extern bool PostMessage(IntPtr h, int m, IntPtr w, IntPtr l); }'
[P]::PostMessage([IntPtr]$hwnd, 0x111, [IntPtr]$id, [IntPtr]::Zero) | Out-Null; "posted WM_COMMAND $id"
