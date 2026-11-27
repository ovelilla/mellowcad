# chprop/d02 (desktop, en-US profile, DYNMODE 3 read and left as found): dynamic input at
# CHPROP's prompts, typed after d01's drawing (keys need the click d01 gave).
acad.sh type 'CHPROP\n'
acad.sh type 'ALL\n\n'
acad.sh click 900 700 none
acad.sh shot -hwnd -1 -crop 0,0,2576,1408         # d02-1: `Enter property to change` and its 9 keywords listed at once
acad.sh type 'C\n'
acad.sh shot -hwnd -1 -crop 400,450,1200,500      # d02-2: `New color` + options icon, `1 (red)` preloaded, selected
acad.sh type '\nS\n'
acad.sh shot -hwnd -1 -crop 400,450,1200,500      # d02-3: `Specify new linetype scale <1.0000>:`, `1.0000` preloaded
acad.sh type '\e'
acad.sh com hist 40                               # `New color [Truecolor/COlorbook] <1 (red)>:` on the desktop
acad.sh com info                                  # the active one is ours
acad.sh com close
