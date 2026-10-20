# children.ps1 <hwnd> : visible descendant windows (handle, class, rect, title)
param([long]$hwnd)
[Console]::OutputEncoding = [Text.Encoding]::UTF8
Add-Type @"
using System; using System.Text; using System.Runtime.InteropServices; using System.Collections.Generic;
public static class K {
  public delegate bool EnumProc(IntPtr h, IntPtr l);
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int L, T, R, B; }
  [DllImport("user32.dll")] public static extern bool EnumChildWindows(IntPtr p, EnumProc f, IntPtr l);
  [DllImport("user32.dll")] public static extern int GetWindowText(IntPtr h, StringBuilder s, int n);
  [DllImport("user32.dll")] public static extern int GetClassName(IntPtr h, StringBuilder s, int n);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  public static List<string> List(IntPtr p) { SetProcessDPIAware(); var r = new List<string>();
    EnumChildWindows(p, (h,l)=>{ if (IsWindowVisible(h)) { var t=new StringBuilder(256); var c=new StringBuilder(256); GetWindowText(h,t,256); GetClassName(h,c,256); RECT x; GetWindowRect(h, out x); r.Add(h+"\t"+c+"\t"+x.L+","+x.T+","+(x.R-x.L)+"x"+(x.B-x.T)+"\t"+t); } return true; }, IntPtr.Zero); return r; }
}
"@
[K]::List([IntPtr]$hwnd)
