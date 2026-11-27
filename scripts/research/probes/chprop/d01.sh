# chprop/d01 (desktop, en-US profile): does the set show the run's changes while CHPROP asks?
# Answer: no; it stays highlighted, unchanged, until the property prompt's Enter (d01-1, d01-2).
acad.sh com new
acad.sh com send '_LINE\n0,0\n100,0\n\n_LINE\n0,20\n100,20\n\n_CIRCLE\n50,50\n15\n_ZOOM\n_E\n'
acad.sh shot                                      # before
acad.sh com send '_CHPROP\n_ALL\n\n_C\n1\n' &     # returns at the property prompt; COM locked
acad.sh shot                                      # d01-1: highlighted, not red
acad.sh click 520 520 left                        # the drawing takes the keys (owner's mouse)
acad.sh type '\n'                                 # Enter at the property prompt
acad.sh shot                                      # d01-2: red, unhighlighted
