# Un MCP de MellowCAD — brief

> **Estado:** investigación, prototipo y banco hechos el 15/11/2026, en una sesión intercalada
> entre la fase 4 del DXF y el idioma siguiente; es la propuesta de la sesión, sin acordar por el
> dueño, y nada está publicado ni desplegado. Construirlo espera su palabra; publicar en npm,
> desplegar, el registro de MCP, los directorios y el push, su sí. Lo siguiente del plan no cambia
> (`docs/next-seo.md`): lo que queda de la fase 4 del DXF. Se borra cuando cada entrega de §6
> esté hecha o descartada.

## 1. Qué se propone, en corto

Un **MCP remoto y sin estado** en mellowcad.com, de una sola herramienta: el agente manda un
guion de comandos de AutoCAD y recibe la ventana de comandos, lo que quedó dibujado y un enlace
que abre ese dibujo en `/draw`. Después, por valor: el visor dentro del chat, el paquete de npm
para quien trabaja en un terminal, y las fichas en el registro y los directorios.

Por qué eso, y no «el MCP de AutoCAD para Claude Code» que parecía la idea obvia:

1. **La hipótesis se cumple.** Los modelos ya saben AutoCAD: con la ventana de comandos y nada
   más, el modelo más pequeño de Claude dibujó bien 28 de 29 encargos (§4).
2. **Pero no es un producto único ni un salto de capacidad.** CADCraft ofrece desde octubre lo
   mismo para agentes de terminal, con mucha más tracción (§2); y un agente que puede ejecutar
   Python acierta igual escribiendo el DXF con ezdxf (57 de 58), solo que más despacio y más
   caro (§4).
3. **Lo que nadie tiene** es lo que MellowCAD ya es: un editor en el navegador. Un MCP remoto
   llega a quien usa Claude o ChatGPT en la web, donde no hay terminal ni binario que instalar,
   y cada dibujo termina en un enlace que lo abre en un CAD de verdad, gratis, a un clic.
4. **Sirve a lo que le falta al sitio** (`docs/next-seo.md`): el directorio de conectores de
   Claude es el único listado con enlace seguido a la web que la investigación comprobó, y exige
   un servidor remoto (§3); y cada dibujo hecho por un agente es una visita a `/draw`.
5. **Es barato**: unos 40 ms de CPU por dibujo, nada que guardar, ninguna cuenta (§7).

Es, pues, una vía de entrada al editor y una fuente de enlaces más que una proeza técnica; se
construye pequeño.

## 2. Quién hay ya

Mirado el 15/11/2026. La creencia de partida («nadie ofrece esto») **es falsa desde octubre**.

| Quién | Qué es | Interfaz del agente | Necesita | Sale |
| --- | --- | --- | --- | --- |
| **CADCraft** (storytold/cadcraft: 8.100 estrellas y 3.415 forks desde el 7/10/2026, Apache-2.0) | Un CAD en Rust «clean-room» que apunta a AutoCAD 2027, con MCP por stdio | `command_line` (teclear como una persona), `script`, `execute` (JSON), `inspect_drawing`, `query_entities`, `render` (PNG al modelo) | Su binario; nada de AutoCAD | DXF, DWG, SVG, PNG, PDF |
| puran-water/autocad-mcp (653), U-C4N/Autocad-MCP (293) | Dos modos: AutoCAD en Windows, o ezdxf sin él | Herramientas estructuradas; los comandos crudos, vetados sin AutoCAD | Python; AutoCAD para lo fino | DXF |
| daobataotie/CAD-MCP (705), multiCAD-mcp (181) | Puentes COM a AutoCAD, ZWCAD, GstarCAD | Herramientas y `send_command` | Windows y el CAD abierto | DWG, DXF |
| Autodesk | MCP de Fusion, Revit y de la ayuda; **ninguno de AutoCAD**, cuya IA «will not create content or geometry» | — | — | — |
| FreeCAD (3.341), build123d, OpenSCAD, Zoo, Onshape | 3D mecánico, por código | Python, SCAD, KCL | Su programa o su nube | STEP, STL |
| draw.io (5.827), Excalidraw (5.678) | Diagramas, **hospedados** y con dibujo dentro del chat | XML del diagrama | Nada: una URL | El diagrama en el chat |

- **CADCraft es el competidor directo** y, por las fechas, el mismo que la auditoría vio subir
  en Bing. Se declara pre-alfa («≈ 38% ready for real work»), no tiene MCP remoto ni paquete de npm, y su
  fidelidad es la que él mismo dice, no la medida contra AutoCAD. Su MCP es casi idéntico al
  diseño al que llegó esta sesión por su cuenta, lo que dice que el diseño es el natural.
- **Lo que no existe**: un MCP de CAD hospedado (los de diagramas prueban que el patrón
  funciona), uno que se instale con una línea de `npx`, y uno cuyo resultado se abra en un
  editor sin instalar nada.
- **Demanda**: freecad-mcp tiene 104.646 descargas al mes en PyPI y autocad-mcp-pro 16.504; el
  MCP de Blender, 34.477 estrellas. En Hacker News el interés es el 3D mecánico; «AutoCAD MCP»
  no pasa de un punto. Las quejas de los puentes a AutoCAD son todas de instalación (Windows,
  COM, permisos): justo lo que un servidor remoto no tiene.

## 3. Dónde están los usuarios

| Dónde | Cómo se añade un MCP | Qué pide |
| --- | --- | --- |
| Claude en la web, el móvil y el escritorio | Un conector propio por URL; también en el plan gratis (uno) | Remoto; sin inicio de sesión vale. Hasta unos 150.000 caracteres y 240 s por llamada |
| ChatGPT | Un servidor MCP propio por URL, solo en la web | Remoto; sin autenticación vale. En qué planes: sin verificar (parece que no en el gratis) |
| Claude Code, Cursor, Codex, VS Code | Una línea: un paquete por stdio (`npx`) o una URL | Resultados de menos de 25.000 tokens en Claude Code |

- **La interfaz dentro del chat** es ya un estándar: MCP Apps (extensión oficial, enero de 2026),
  que pintan Claude en la web y el escritorio, ChatGPT, Cursor y VS Code; una sola implementación
  vale para Claude y ChatGPT. Claude Code no la pinta. La página puede cargar código de nuestro
  dominio si se declara, y abrir un enlace pasa por una confirmación del anfitrión.
- **La especificación vigente (28/7/2026) es sin estado**: sin sesiones ni `initialize`. El
  adaptador de Vercel, `mcp-handler` 2, solo sirve eso. Diseñar sin estado es ir con el estándar.
- **Fichas y enlaces.** El registro oficial (en vista previa) se publica con un `server.json`,
  que lleva la web del proyecto, y alimenta a los demás. Enlace **seguido** a la web, comprobado
  en el HTML: el directorio de conectores de Claude (pide servidor remoto, privacidad y
  documentación; lo envía quien tiene un plan de pago) y el catálogo de Docker. Con `nofollow` o
  solo a GitHub: el registro de GitHub, Glama, mcpservers.org, Smithery, MCP Market y las listas
  «awesome». El directorio de ChatGPT pide además términos, casos de prueba y un vídeo.
- **Los resultados largos se copian mal**: en el banco, un modelo cambió un carácter de una ruta
  de 150 y dio la tarea por imposible. Un enlace opaco y largo fallaría igual (§5).

## 4. Lo medido

### 4.1 El prototipo

`scripts/mcp/server.ts` es un servidor MCP por stdio sobre `CadDriver`, sin dependencias, y
`scripts/mcp/session.ts` la sesión de dibujo: teclea cada línea del guion en la línea de
comandos del motor y pulsa Enter, como un usuario. `test/mcp.test.ts` lo prueba. Lo que la sonda
enseñó antes de medir nada:

- **El motor ya se dibuja entero por texto**: coordenadas absolutas, relativas y polares,
  referencias a objetos (`TAN`, `END`…), selección por punto, `L`, `ALL`, ventana y captura,
  palabras clave, `U`. Nada de eso hubo que escribirlo.
- **El riesgo es el guion que descarrila**: una respuesta rechazada deja el comando preguntando
  y las líneas siguientes contestan a otra pregunta (un `E` suelto es ERASE). El servidor para en
  la primera respuesta que el motor rechaza, dice cuál y cuántas líneas quedaron sin correr, y
  cancela lo que siga preguntando al final. Uno de cada cuatro guiones paró así, y el agente
  corrigió con la transcripción delante.
- **Designar tecleando un punto depende del zoom** (la mira mide píxeles): el servidor encuadra
  el dibujo entre comando y comando, para que «sobre el objeto» sea siempre la misma fracción de
  su tamaño.
- **Un espacio termina la respuesta**, como en un fichero de guion de AutoCAD, salvo donde la
  pregunta toma texto; un Enter en `Command:` no repite el último comando.

### 4.2 El banco

Quince encargos de dibujo con todos sus números dichos, cada uno comprobado por geometría sobre
el DXF que queda, lo dibuje quien lo dibuje (`scripts/mcp/bench/tasks.ts`): ocho básicos (una
placa con taladros, un redondeo y un chaflán, una habitación con su puerta, una brida, una
correa tangente a dos poleas, editar un DXF, cotas y texto, sombreados) y siete difíciles (un
piso con tabique y encuentros limpios, una junta con ranura y hexágono, una biela, reordenar un
DXF por capas y radios, una sección con isla y cotas, sillas como bloque girado, el contorno de
la unión de tres discos). Cada uno tiene un guion de referencia que la prueba ejecuta: todos son
resolubles con la línea de comandos de hoy.

Los agentes: Claude Code sin interfaz (`claude -p`), sin más herramientas que las de su
condición, con Haiku 5.5 y Sonnet 5.5. Cinco condiciones:

- **consola**: la ventana de comandos y nada más;
- **texto**: además, los objetos que cambió cada guion y un listado del dibujo;
- **imagen**: además, el dibujo en PNG;
- **sin estado**: una herramienta; cada llamada dibuja desde cero, como un servidor que no guarda;
- **código**: sin MCP; el agente escribe un script de Python con ezdxf, lo que haría hoy.

Aciertos (el dibujo pasa todas sus comprobaciones). Los básicos, una vez cada uno; los difíciles,
tres:

| Modelo | Nivel | Consola | Texto | Imagen | Sin estado | Código |
| --- | --- | --- | --- | --- | --- | --- |
| Haiku 5.5 | básico | 8/8 | 8/8 | 8/8 | 7/7 | 8/8 |
| Haiku 5.5 | difícil | 20/21 | 21/21 | 20/21 | 16/18 | 20/21 |
| Sonnet 5.5 | básico | 8/8 | 8/8 | 8/8 | 7/7 | 8/8 |
| Sonnet 5.5 | difícil | 21/21 | 21/21 | 20/21 | 18/18 | 21/21 |

Por dibujo, en el nivel difícil (el coste es el que da Claude Code, a precio de API):

| | Consola | Texto | Imagen | Sin estado | Código |
| --- | --- | --- | --- | --- | --- |
| Haiku 5.5 | 26 s · 0,004 $ | 22 s · 0,003 $ | 20 s · 0,003 $ | 24 s · 0,004 $ | 31 s · 0,005 $ |
| Sonnet 5.5 | 11 s · 0,029 $ | 10 s · 0,026 $ | 10 s · 0,028 $ | 10 s · 0,023 $ | 20 s · 0,047 $ |

En total, 291 ejecuciones y unos 4,6 $. Los datos, con cada guion tecleado y cada DXF, están
fuera del repo, en `~/mcp-data/bench-2026-11-15/`.

Los seis fallos, leídos uno a uno:

- **Dos, del modelo**: Haiku con la consola sola borró dos círculos de más al leer mal un
  listado; Haiku calculó a mano los puntos de tangencia en vez de pedirle `TAN` al motor y se
  quedó fuera de tolerancia.
- **Dos, de la variante sin estado** (Haiku): dibujó bien a la primera y luego «comprobó» con
  una segunda llamada (`LIST`), que por diseño empezaba de cero; el banco lee la última. Los dos
  dibujos, repetidos, pasan. La lección va a §5.
- **Uno, de copia**: Sonnet escribió mal la ruta del DXF que debía abrir y se rindió.
- **Uno, del código**: Haiku dedujo mal el arco pequeño de la biela, y su propia comprobación
  no lo vio. El motor, con `TAN` y TRIM, no deja ese error al agente.

### 4.3 Lo que enseña

1. **La línea de comandos fiel basta.** Con la consola sola, 57 de 58; nadie tuvo que explicar
   un comando. Lo que el agente lee es lo que AutoCAD habría escrito, y lo entiende.
2. **Ninguna realimentación mejora el acierto a este nivel**: texto e imagen no ganan a la
   consola, y la imagen no arregló nada que el texto no dijera (coincide con lo publicado: la
   geometría exacta ayuda más que ver, §Fuentes). El texto de cambios sí sustituye a los LIST
   que Haiku teclea para comprobar (5,6 guiones por dibujo con la consola, 3,8 con texto) y
   cuesta poco; se queda. La imagen es para la persona, no para el modelo.
3. **Sin estado funciona**: los agentes mandan el dibujo entero en un guion de unas 30 líneas y
   aciertan en 1,7 llamadas (Sonnet) o 2,4 (Haiku).
4. **Frente a escribir código, el MCP no acierta más: es más rápido y más barato.** Con Sonnet
   tarda la mitad y cuesta la mitad; con Haiku, una cuarta parte menos. Su ventaja no es de
   capacidad, es de camino: no hace falta Python ni ezdxf, el resultado se ve y se abre en un
   editor, y la transcripción la lee quien sabe AutoCAD.
5. **Donde más tropiezan** es en los comandos que aquí abren un cuadro: escribieron `BLOCK`,
   `INSERT` o `LAYER` y a continuación el nombre, que cayó en `Command:` (44 veces `CHAIR`, 13
   `BIG`). Aprendieron la versión con guion al segundo intento. Después, HATCH (el patrón
   tecleado donde se pide el punto) y FILLET (que sigue preguntando tras el radio).
6. **Quieren designar por identificador**: teclearon `#4` en `Select objects:`. Con la lista de
   cambios delante usaron la preselección por identificador en uno de cada tres guiones.
7. **El DXF que sale lo abre AutoCAD**: cinco dibujos de agentes, abiertos en la consola de
   AutoCAD 2027 con `scripts/research/probes/dxf/audit.sh`: 0 errores de AUDIT, sus objetos
   como LWPOLYLINE, ARC, HATCH, DIMENSION y TEXT.

### 4.4 Lo que no mide

Los encargos dicen cada coordenada: miden si el agente sabe **ejecutar** un dibujo, no
**diseñarlo** («un piso de 60 m² con dos dormitorios»), que no se comprueba solo. Son dibujos de
decenas de objetos, no de miles. Solo modelos de Claude. Los básicos, una sola vez. Y no se
comparó con CADCraft: ejecutar su binario en esta máquina no estaba entre lo aprobado.

## 5. El diseño

**Una herramienta, `draw`, y el guion es el dibujo.**

- **Entra** un guion: una respuesta por línea o separadas por espacios, como en un fichero de
  guion de AutoCAD. **Sale** la transcripción de la ventana de comandos; si paró, en qué línea y
  cuántas quedaron; los objetos que quedaron, uno por línea con su geometría exacta; la
  extensión del dibujo, y el enlace que lo abre.
- **Sin estado**: cada llamada dibuja desde un dibujo vacío. Para corregir, el agente manda el
  guion entero corregido. La descripción lo dice dos veces y de dos formas, que es donde falló
  Haiku: no hay nada que inspeccionar después, todo lo que hay que saber vuelve en la respuesta,
  y una llamada que no dibuja nada lo avisa.
- **El enlace lleva el guion, no el dibujo**: `/draw#run=` y el guion codificado. Es corto (un
  guion de 30 líneas, menos de mil caracteres), legible, no pasa por ningún servidor (va en el
  fragmento) y no pide almacenamiento. El editor lo teclea en un dibujo nuevo, a la vista, con
  la misma regla que ya protege el autoguardado al abrir un ejercicio. Vale además para las
  páginas de comandos del sitio («pruébalo en el editor»).
- **La descripción** nombra los comandos que existen, leídos del catálogo del motor, y dice qué
  comando abre un cuadro y cuál es su versión de guion. Un comando de cuadro tecleado en un
  guion para el guion con ese aviso, en vez de dejar caer las líneas siguientes.
- **Sin imagen para el modelo** de entrada: no mejoró nada (§4.3). La imagen es el visor del
  chat (entrega 2). Si un anfitrión sin visor la necesita, un PNG de 800 px son 11 ms y 10 KB.
- **Marcada de solo lectura**: no escribe en ningún sitio, y ChatGPT pide confirmación a cada
  llamada de una herramienta que no lo diga.
- **Topes** por llamada: tamaño del guion, número de líneas, número de objetos y un plazo
  comprobado entre línea y línea.

El paquete de npm (entrega 3) es el mismo núcleo **con estado**, porque en un terminal hay
ficheros: abrir un DXF, guardarlo, listar el dibujo, preseleccionar por identificador y seguir
dibujando sobre lo hecho. Es el prototipo de hoy.

**Lo que se afirma** (`.claude/rules/i18n.md`): «comandos de AutoCAD», nunca «el MCP de
AutoCAD»; mismo orden y mismas letras de opción, no «los mismos prompts»; DXF sí, DWG no; el 3D,
parcial, y no se anuncia aquí. Con la nota de marca de Autodesk.

## 6. Entregas, por valor

Cada una espera la palabra del dueño; lo que sale hacia fuera, su sí (§9).

1. **El MCP remoto.** Lo que más aporta y lo único que nadie tiene. Lleva delante lo que le
   falta al motor, que es AutoCAD por derecho propio:
   1. **`-LAYER`**: hoy no hay forma de crear una capa tecleando (el prototipo lo suple con una
      herramienta aparte). Con él, el guion es el dibujo entero. Por la skill `new-command`.
   2. **Teclear un guion, en `CadDriver`**: una entrada pública que teclee una línea y diga si
      la pregunta la tomó. El prototipo llega al `runtime` interno y cuenta líneas de error.
   3. **DXF sin cuadro**: el dibujo a DXF y de DXF como funciones públicas del paquete; hoy solo
      se llega por el cuadro de DXFOUT, que además es un paso de deshacer.
   4. **`/draw#run=`** en el editor.
   5. **La ruta** en el sitio, fuera de los idiomas, con `mcp-handler`; sus topes y sus reglas
      del cortafuegos (§7); la página de privacidad corregida en todos los idiomas, porque hoy
      dice «no servers that see your drawings» y dejaría de ser verdad, y una página de
      documentación en inglés, que el directorio de Claude pide.

   **Terminado:** añadido como conector en Claude y en ChatGPT desde una vista previa de
   Vercel, dibuja los quince encargos del banco y cada enlace abre su dibujo en `/draw`.
2. **El visor en el chat** (MCP Apps): el dibujo en SVG dentro de la conversación, con
   desplazamiento y zoom, y «Abrir en MellowCAD». Es lo que convierte una respuesta de texto en
   un dibujo, y lo que copia el éxito de draw.io y Excalidraw. **Terminado:** se ve en Claude y
   en ChatGPT, y el botón abre el editor con el dibujo.
3. **El paquete de npm**, por stdio y con estado, para Claude Code, Cursor y Codex. Ahí compite
   con CADCraft y con escribir código, así que vale menos; pero el núcleo es el mismo y cuesta
   poco. **Terminado:** una línea de `npx` lo instala y edita un DXF del disco.
4. **Las fichas y el lanzamiento**, que hace el dueño: el directorio de conectores de Claude (el
   enlace que cuenta), el registro oficial, el directorio de ChatGPT, y el anuncio. Es un
   segundo lanzamiento ante otro público y va detrás del calendario de L5, que no se mueve.

## 7. Coste y abuso

- **Coste**: una llamada son unos 25 ms de CPU en esta máquina (crear el motor, correr el
  guion, el SVG), 35 con un PNG, y menos de 20 KB de respuesta. En el plan Hobby de Vercel caben unas 350.000 al
  mes por CPU (4 h incluidas) y un millón por invocaciones: mil dibujos al mes son el 0,3 %. No
  hay base de datos, ni blobs, ni cuentas.
- **La web ya tiene una función**: `app/api/search/route.ts`, la búsqueda de la documentación,
  una invocación por consulta nueva. El MCP no abre esa puerta; añade otra más pesada.
- **El riesgo real** es de Hobby: al pasar un límite no se cobra, **se pausa el equipo entero**,
  la web incluida, hasta 30 días. Una inundación contra la ruta tumbaría el sitio en pleno
  lanzamiento. Es improbable y grave.
- **Las guardas**, todas gratis: los topes por llamada y una duración máxima corta; en el
  cortafuegos de Vercel (tres reglas en Hobby, una de ellas de frecuencia), dejar pasar a la
  ruta los rangos de Anthropic y OpenAI, que es desde donde llaman Claude y ChatGPT, y limitar
  por IP a los demás; y un interruptor que apague la ruta sin desplegar. Limitar por IP a los
  proveedores no sirve: todos sus usuarios salen por las mismas. Qué deja configurar Hobby en
  esas reglas se comprueba al construir.
- **Si hay tracción o abuso**, la salida es mover la misma función a Workers de Cloudflare de
  pago (5 $ al mes), que aísla el sitio: su plan gratis da 10 ms de CPU por petición y no llega.
  Es gasto, así que es del dueño. El núcleo se escribe sin nada de Vercel para que el paso sea
  corto.
- **Privacidad**: el servidor ve el guion que le mandan y no guarda nada. Hay que decirlo donde
  hoy se dice lo contrario.

## 8. Fuera, y por qué

- **DWG**: no existe aquí, y es la ventaja de CADCraft que no se discute.
- **Sesiones, almacenamiento, cuentas u OAuth** en el remoto: son coste, datos de otros y la
  mitad del riesgo de abuso, y el banco dice que no hacen falta.
- **Editar el fichero de un usuario desde el chat web**: el chat no le pasa el fichero a la
  herramienta. Eso es del paquete de npm, que tiene disco.
- **Ver al agente dibujar en vivo en el editor abierto**: pide un relé entre el servidor y el
  navegador, que es estado y coste. El enlace que teclea el guion a la vista da casi lo mismo.
- **Herramientas estructuradas** (una por primitiva, o comandos con parámetros en JSON): es lo
  que hacen los demás y no hizo falta; duplicaría el motor en un segundo idioma que mantener.
- **Un MCP de la documentación** y **la skill para quien integra**: siguen donde estaban
  (`docs/next-integrations.md`); `llms.txt` ya sirve lo primero.
- **Los otros idiomas** del lenguaje de comandos: el MCP habla el inglés de AutoCAD, que es el
  que saben los modelos.
- **Compararse con CADCraft tecleando lo mismo en los dos**: sería el dato que falta, y pide
  ejecutar un binario ajeno en esta máquina. Con el sí del dueño, antes de anunciar nada que se
  compare con él.

## 9. Lo que espera el sí del dueño

Publicar el paquete en npm; desplegar la ruta en producción (el push); dar de alta en el
registro de MCP, en el directorio de conectores de Claude, en el de ChatGPT y en cualquier otro;
el anuncio y su fecha; ejecutar el binario de CADCraft; y cualquier gasto (Cloudflare).

## 10. Repetir el banco

El servidor y el corredor se empaquetan desde el código fuente, porque Node no ejecuta el del
motor (`scripts/mcp/build.ts`), y el corredor lanza `claude -p` una vez por encargo
(`scripts/mcp/bench/run.ts`, que dice sus opciones): gasta de la cuenta de quien lo corre. La
línea base pide un Python con ezdxf. Un banco que da 100 % no distingue nada: para comparar
diseños hay que añadirle encargos que fallen, y los de diseño libre piden un juez.

## Fuentes

Comprobado por la sesión: el repositorio de CADCraft y la página de su MCP (API de GitHub), el
prototipo, el banco y AutoCAD 2027. Lo demás lo leyeron tres investigaciones en la web el
15/11/2026, con la fecha de cada página; lo que no pudieron abrir va aquí como sin verificar.

- Quién hay: github.com/storytold/cadcraft, puran-water/autocad-mcp, U-C4N/Autocad-MCP,
  daobataotie/CAD-MCP, neka-nat/freecad-mcp, jgraph/drawio-mcp, excalidraw/excalidraw-mcp;
  aps.autodesk.com/blog/building-agentic-ai-whats-new-autodesk-platform-services; pypistats.org.
- Qué ayuda a dibujar sin ver: CADSmith (arxiv.org/abs/2603.26512: la geometría del núcleo sube
  la mediana de 0,81 a 0,956 y la visión, a 0,963) y CADCodeVerify (arxiv.org/abs/2410.05340).
- Clientes y especificación: modelcontextprotocol.io (la revisión 2026-07-28, la matriz de
  clientes de MCP Apps, el registro), claude.com/docs/connectors, developers.openai.com/apps-sdk,
  code.claude.com/docs/en/mcp.
- Coste: vercel.com/docs/plans/hobby, vercel.com/docs/functions/usage-and-pricing,
  vercel.com/docs/vercel-firewall, github.com/vercel/mcp-handler,
  developers.cloudflare.com/workers/platform/limits.
- Sin verificar: en qué planes de ChatGPT se puede añadir un servidor propio; si el usuario
  puede guardar un fichero que venga en el resultado de una herramienta; si un PNG devuelto se
  le enseña al usuario en Claude; el tráfico de cada directorio.
