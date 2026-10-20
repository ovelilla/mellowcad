# wins.ps1 [pid] : the visible top-level windows of an acad.exe (default: the first), to find a
# dialog that blocks it (a modal dialog makes COM calls fail with RPC_E_CALL_REJECTED).
param([int]$procId = 0)
[Console]::OutputEncoding = [Text.Encoding]::UTF8
Add-Type @"
using System; using System.Text; using System.Runtime.InteropServices; using System.Collections.Generic;
public static class W {
  public delegate bool EnumProc(IntPtr h, IntPtr l);
  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumProc f, IntPtr l);
  [DllImport("user32.dll")] public static extern int GetWindowText(IntPtr h, StringBuilder s, int n);
  [DllImport("user32.dll")] public static extern int GetClassName(IntPtr h, StringBuilder s, int n);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid);
  public static List<string> List(uint pid) { var r = new List<string>();
    EnumWindows((h,l)=>{ uint p; GetWindowThreadProcessId(h, out p); if (p==pid && IsWindowVisible(h)) { var t=new StringBuilder(512); var c=new StringBuilder(256); GetWindowText(h,t,512); GetClassName(h,c,256); r.Add(h+"\t"+c+"\t"+t); } return true; }, IntPtr.Zero); return r; }
}
"@
if ($procId -eq 0) { $procId = (Get-Process acad | Select -First 1).Id }
[W]::List($procId)
