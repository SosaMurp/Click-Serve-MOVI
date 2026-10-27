---
version: 1
slug: "app-layout-tsx"
primary_target: "app/_layout.tsx"
related_targets: ["components"]
---

# Surface brief — app móvil Click & Serve (cliente y técnico)

Mode: Operate. Audiencia: clientes con una falla urgente y técnicos trabajando en la calle en Lázaro Cárdenas. Tarea: pedir, seguir, aprobar, pagar y calificar (cliente); aceptar, ejecutar, cotizar, documentar y cobrar (técnico). Restricciones: Material 3 en estructura (barra de navegación inferior, top app bar, snackbars, diálogos, bottom sheets), 48 dp, español de México, sin datos inventados. Verificación en Expo web (no hay emulador en esta máquina).

## Direction contract

THESIS: La app habla como los rótulos pintados de los talleres de Lázaro Cárdenas: cada orden anuncia su estado en una placa de esmalte, a la vista desde lejos. Rechaza la pantalla gris con un acento naranja y tarjetas de ícono-título-texto.

OWN-WORLD: Fondo blanco de cal con superficies blancas y filetes de 1 px; azul cobalto de rótulo para la barra superior y la acción principal; amarillo cromo para atención y cotización; verde bandera para pagado y confirmado; bermellón para SOS, cancelación y errores; tinta negra para el texto. Bungee (letra de rótulo) solo en placas, encabezados de pantalla y montos grandes; texto del sistema para todo lo demás, con cifras tabulares.

STORY: El cliente entiende de un vistazo en qué va su servicio y qué le toca hacer; el técnico ve sus trabajos cercanos, actúa con un toque grande y ve su dinero.

FIRST VIEWPORT: Barra superior cobalto con saludo y avatar (cuenta). Si hay un servicio en curso, su tarjeta manda arriba: placa de estado grande + prueba (técnico, ETA, folio) + acción principal. Debajo, el letrero de categorías pintado en placas y el botón "Pedir servicio". Barra inferior: Inicio, Servicios, Soporte, Cuenta. Técnico: pestañas NUEVAS / EN CURSO / HISTORIAL con contadores, interruptor ONLINE en la barra, lista de solicitudes con placa en celda fija y distancia.

FORM: Rótulos pintados a mano (candidato 3 de 7 en mi lista ordenada; asignado por la tirada). seed:c3304be1aba3394a. Subidas: (canon monocromo) cada placa va junto a su prueba: hora, distancia, monto o folio; (catálogo de personajes) la ficha del técnico siempre lleva los mismos elementos en el mismo lugar; (horario en placas) el estado vive en una celda fija arriba a la derecha de cada fila; (riel de líneas) el estado nunca depende solo del color: placa con texto, ícono y una línea de avance continua para lo hecho y punteada para lo pendiente; (funda de catálogo) el folio es el identificador visible y copiable. Retadora competitiva conservada: cartera de boletos; de ella, nada desaparece: lo cancelado queda con su placa.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
