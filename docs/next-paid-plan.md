# Cuenta, suscripción, nube y asistente — pinceladas

> **Estado:** ideas sin acordar ni fecha, anotadas el 26/11/2026 de una conversación con el dueño:
> nada de esto es una decisión ni un plan, y nada se empieza sin su palabra. Llegado el momento, se
> investiga y se escribe el brief de verdad sobre estas notas; se borra cuando ese brief exista o
> la idea se descarte.

## 1. La idea del dueño

Añadir una cuenta **opcional** y una suscripción que desbloquee dos cosas: guardar los dibujos en
la nube y un asistente de IA dentro del editor. El editor gratis y sin registro sigue como está.

Lo único que el dueño dejó dicho como criterio (26/11/2026): **no paga el uso de IA de otros**.
Cada uno se paga el suyo con su suscripción; no hay asistente gratis a su costa.

Todo lo demás de este fichero son observaciones de la sesión, para discutir cuando toque.

## 2. Lo que ya hay y encaja

- **La nube** sería un adaptador más: guardar pasa ya por un puerto con dos adaptadores
  (`cad/adapters/localStorageDrawingStore.ts` y el de memoria). El motor no se toca.
- **El asistente** es lo que ya hace el MCP (`CadDriver.keyIn`), medido en `docs/next-mcp.md` §4:
  por dibujo difícil, 0,003–0,005 $ con Haiku 5.5 y 0,02–0,05 $ con Sonnet 5.5. Dentro del editor,
  con varios turnos y el dibujo como contexto, costará más por petición: sin medir.
- **Quien ya paga Claude** puede dibujar hoy con su propia suscripción por el conector MCP, sin
  coste para el dueño.

## 3. Lo que choca o habría que resolver

- **Los textos del sitio**: la landing, las preguntas frecuentes y la página de privacidad dicen
  «sin cuenta» y «lo que dibujas nunca llega a un servidor» (`messages/en.json` y cada idioma), y
  el SEO se apoya en «gratis, sin registro» (`docs/next-seo.md`). Con la cuenta opcional sigue
  siendo verdad para el editor gratis, pero hay que reescribirlo en todos los idiomas.
- **La decisión del 29/10/2026** (`docs/next-integrations.md` §3): «sin tier de pago (se
  reconsidera solo si hay adopción)». Sigue en pie mientras esto no se acuerde.
- **Vercel Hobby** no permite uso comercial (sin verificar en sus condiciones actuales): cobrar
  pediría Pro, 20 $/mes, o salir a Cloudflare (`docs/next-vercel-usage.md` §6).
- **Las obligaciones** que llegan con las cuentas y el cobro: IVA por país, RGPD con datos de
  otros, borrado de cuentas, copias, soporte.
- **Lo que un usuario diario de AutoCAD pagaría**: hoy no puede entregar trabajo aquí (no hay DWG
  ni trazado a PDF). La nube sola vende poco, porque ya se guarda en fichero y en DXF; vale como
  sincronización entre dispositivos, enlace para compartir e historial.
- **El `/mcp` remoto** excluye hoy sesiones, cuentas y OAuth a propósito (`docs/next-mcp.md` §8):
  el asistente del editor sería otra ruta, no un cambio de esa.

## 4. Pinceladas de diseño

- **Cupo mensual, no tarifa plana**: sin límite, el dueño vuelve a pagar el uso de otros, el del
  suscriptor que más gasta. Créditos incluidos y, al agotarse, parar hasta el mes siguiente o
  hasta que compre más.
- **El cupo, fijado por coste**: que lo máximo que un suscriptor pueda gastar en tokens quede en
  una fracción de lo que paga (se habló de un 40 % y de una cuota de 8–10 €, como orden de
  magnitud, no como precio).
- **El contador, en el servidor**: la clave de la API nunca llega al navegador, y cada petición se
  descuenta de la cuenta antes de llamar al modelo.
- **El cobro, con un comerciante registrado** (Paddle, o Stripe Managed Payments: sin verificar
  cuál sirve desde España), que se encarga del IVA de cada país.
- **Medir la demanda sin gastar**: el botón del asistente a la vista de todos, que sin
  suscripción abre la página de precios; los clics dicen si interesa.
- **Traer cada uno su clave de API**: descartable de entrada, porque quien usa AutoCAD a diario no
  tiene una.

## 5. Un orden posible

1. La cuenta opcional (sin ella no hay a quién contarle el uso).
2. La suscripción.
3. El asistente, de pago desde el primer día.
4. La nube, como segundo beneficio de la misma suscripción.

Las cuatro piezas no caben en semanas si siguen a la vez la interfaz de AutoCAD
(`docs/next-autocad-ui.md`) y los sólidos (`docs/next-solids.md`): algo tendría que esperar.

## 6. Por investigar cuando toque

- Las condiciones de Vercel y la alternativa en Cloudflare, con sus costes fijos.
- El proveedor de cuentas y la base de datos, y dónde quedan los datos (RGPD).
- El comerciante registrado y sus comisiones.
- El coste real por petición del asistente dentro del editor, con un banco como el del MCP.
- Qué cobran por algo parecido las herramientas de dibujo en el navegador, y por qué.
- Si DWG o el trazado a PDF pesan más que la nube para quien pagaría.
