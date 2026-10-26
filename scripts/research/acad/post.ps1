# post.ps1 <hwnd> [id] : posts WM_COMMAND <id> (2, IDCANCEL, by default) to a window — closes a modal
# dialog that UIA cannot press and that holds COM locked (the Edit Attributes or Purge dialog).
param([long]$hwnd, [int]$id = 2)
Add-Type 'using System; using System.Runtime.InteropServices; public static class P { [DllImport("user32.dll")] public static extern bool PostMessage(IntPtr h, int m, IntPtr w, IntPtr l); }'
[P]::PostMessage([IntPtr]$hwnd, 0x111, [IntPtr]$id, [IntPtr]::Zero) | Out-Null; "posted WM_COMMAND $id"
