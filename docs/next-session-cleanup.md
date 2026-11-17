# Cerrar las conversaciones terminadas — brief

> **Estado:** acordado por el dueño y en sombra desde el 17/11/2026; la primera sesión del 18/11 o
> después lo activa como dice §2, antes de su tarea, y borra este brief.

## 1. Qué es

La extensión de VS Code mantiene vivo el proceso de `claude` de cada conversación, con sus MCP,
hasta recargar la ventana: archivar no lo cierra. El 17/11 había siete de mellowcad, seis ociosas
desde hacía 13 h (unos 1,3 GB). `.claude/hooks/reap.mjs`, el de nubigest (48 h en sombra allí sin
cerrar nada que se retomara), cierra con SIGINT las archivadas ociosas 5 min y las vacías ociosas
10 min; deja todo lo que no puede leer o verificar y las que lanzaron trabajo en segundo plano. Al
escribir otra vez en una conversación cerrada, se reanuda con su historial. Lo lanza el hook
`SessionStart` con `--dry-run`: solo anota en su log lo que habría cerrado.

## 2. Activarlo

1. `node .claude/hooks/reap.mjs --report --hours 48`.
2. Si «Candidates active later» es 0, quitar `--dry-run` de su línea en `.claude/settings.json`,
   borrar este brief y hacer commit (`chore: close finished conversations`). Si no es 0, una
   conversación señalada se retomó: se mira por qué en su transcript antes de activar nada, y se
   anota aquí.
