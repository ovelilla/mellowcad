# Tracing prompts with MellowProbe

`scripts/research/mellowprobe/` is a .NET 10 plugin for AutoCAD 2027 that prints what a
transcript cannot: each prompt's options as AutoCAD built them, each answer, and each object the
drawing gains, changes or loses. Build it once (`scripts/research/mellowprobe/build.sh`, which
needs the .NET 10 SDK in `~/.dotnet`; the script says how to install it). Then
`scripts/research/runacc.sh -t probe.txt` loads it in the console, or
`scripts/research/acad.sh com netload` loads it in the desktop AutoCAD (gui.md).

Every line it writes is `«MP <event> <json>»`, interleaved with AutoCAD's echo:

```
Precise distancia de desfase o [punto a Atravesar/Borrar/Capa] <punto a Atravesar>:
«MP ed.PromptingForDistance {"AllowNegative":false,"AllowNone":true,"AllowZero":false,
  "Keywords":{"default":null,"items":[{"g":"Atravesar","l":"Through","d":"Through"},
  {"g":"Pun","l":"Thru","d":"Thru"},{"g":"Borrar","l":"Erase","d":"Erase"},...]},
  "Message":"\nPrecise distancia de desfase o [...]: ","UseBasePoint":false,...}»
«MP ed.PromptedForDistance {"Status":"OK","Value":1}»
«MP db.appended "CIRCLE" "82"»
```

## Reading it

- **Keywords come in both languages**: `g` is the Spanish (local) word and `l` the English
  (global) one — the managed wrapper swaps the two names for built-in prompts. Hidden aliases
  show too (OFFSET's `Thru`, absent from the prompt text).
- **What the options say**: AllowNone (Enter accepted), AllowZero / AllowNegative, UseBasePoint
  and BasePoint (rubber band from where), UseDashedLine, the default keyword. Not every default
  is an option: OFFSET's `<punto a Atravesar>` lives in the message only.
- **A prompt can be two events**: a distance or angle prompt that also takes a point fires
  PromptingForDistance and then PromptingForPoint for the same message.
- **Entity prompts** (entsel) list a dozen `dummy` keywords before the real ones: placeholders,
  not options. Status `Error` is a pick that hit nothing.
- **Jig samples**: the console feeds a jig one keystroke at a time, and each keystroke is a
  sample that returns the console's fixed cursor. The tracer learns that point and drops the
  samples; `MPTRACE Raw` keeps them.
- **db lines** say what one gesture did: appended, modified (repeatedly, that is normal),
  erased — an `_U` inside LINE erases the last segment, it does not modify it.
- Lisp shows as doc.LispWillStart / doc.LispEnded lines, commands as doc.CommandWillStart /
  doc.CommandEnded.

## Desktop only: the raw initget

In acad.exe the tracer also hooks the command line monitor (in acmgd, which the console lacks),
whose clm.GetInput lines carry what the command passed to initget, verbatim:

```
"initget":"Atravesar Pun Borrar Capa _Through Thru Erase Layer","initgetFlags":6
"initget":"Diámetro _Diameter","initgetFlags":39      (CIRCLE radius, no default yet)
"initget":"Diámetro _Diameter","initgetFlags":38      (CIRCLE radius with a <default>)
```

The flags are initget's bits: 1 no null, 2 no zero, 4 no negative, 32 dashed rubber band, 64
ignore Z… — so 39 = Enter refused; 38 = Enter takes the default. The `control` field adds
the input-control flags (udNULLOK, udNOLAST…), and basePt the rubber band's origin.

## Its other commands

Each says what it does above its body in `scripts/research/mellowprobe/Probe.cs`: a JSON dump of
model space with the geometry LIST rounds away (MPDUMP), every registered system variable with its
type, range and storage (MPSYSVARS), and, in the desktop only, command lookup (MPCMD) and the
command line history (MPHIST). Traps:

- MPSYSVARS misses the legacy variables (OSMODE, AUTOSNAP…): read those with getvar.
- An empty answer to a .NET prompt hangs the console: these commands take `-` for "none".
- An exception escaping a .NET command opens a dialog that hangs the console; theirs are caught.
- .NET cannot unload an assembly: an acad.exe that loaded the plugin keeps the old build until it
  exits (the console loads a fresh copy per run).
