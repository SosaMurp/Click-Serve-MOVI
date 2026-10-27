# Product

<!-- impeccable:product-schema 1 -->

> Registro inferido del repositorio (Click-Serve-MOVI, Click-Serve-Back) y de la matriz de requisitos del proyecto (RF-01…RF-125, RNF-01…RNF-43, RD-001…RD-016). El dueño delegó la aprobación del diseño ("No hace falta que Diego apruebe el diseño antes"); no hubo entrevista. Los hechos marcados *(inferido)* deben confirmarse.

## Platform

android

La app es Expo / React Native con paquete Android (`com.gallo122.clickservemovil`) y builds EAS; iOS está habilitado en `app.json` y el equipo la revisa también en Expo web. *(inferido: Android es el objetivo principal por el mercado local)*

## Users

- **Cliente**: una persona o negocio de Lázaro Cárdenas, Michoacán, con una falla en casa, la oficina o el auto (electricidad, plomería, cómputo, línea blanca, clima, cerrajería, pintura, mecánica). Quiere a alguien confiable que llegue pronto, saber cuánto le van a cobrar antes de que empiecen y pagar solo cuando el trabajo quedó.
- **Técnico**: un prestador independiente del oficio que trabaja desde su teléfono, a menudo en la calle o en el domicilio del cliente, con las manos ocupadas y poca paciencia para pantallas complicadas. Quiere recibir trabajos cercanos de su especialidad, cotizar rápido y cobrar sin pelear.
- **Administrador**: atiende un panel web aparte; queda fuera de esta app.

## Product Purpose

Conectar a clientes y técnicos verificados en Lázaro Cárdenas con un flujo seguro de punta a punta: solicitud con fotos y ubicación, asignación por cercanía y especialidad, seguimiento en vivo, cotización por conceptos que el cliente aprueba, evidencia del trabajo, confirmación y pago dentro de la app, calificación en ambos sentidos y soporte cuando algo sale mal. El éxito es que el cliente confirme el servicio y pague sin fricción, y que el técnico vea su dinero en la billetera.

## Positioning

Verificación real antes de entrar (INE, rostro, cédula SEP, certificaciones por especialidad) y un servicio que no se cobra hasta que el cliente confirma que quedó, con garantía de 90 días y desglose transparente de lo que gana el técnico. Es local: opera en Lázaro Cárdenas y habla su idioma. *(inferido de RF-25, RF-53/54/69/70, RD-012/013)*

## Operating Context

- El técnico usa la app en la calle, al sol, en el puerto o dentro de un domicilio, con guantes o manos sucias; necesita objetivos táctiles grandes y estados legibles de un vistazo.
- El cliente la abre con prisa (una fuga, un apagón, la puerta cerrada) y vuelve a ella para seguir al técnico en el mapa, aprobar la cotización y pagar.
- Cada orden tiene folio (SRV-…), los reportes INC-…, los casos de soporte TCK-… y los movimientos TRX-…; el folio es la referencia que se comparte por teléfono o se imprime.
- Conectividad móvil irregular: la app debe avisar cuando no hay servidor y no inventar datos.

## Capabilities and Constraints

- Roles: cliente y técnico en la misma app, con rutas protegidas por rol; el administrador usa otro panel.
- Estados de una orden: PENDIENTE, ASIGNADA, EN_CAMINO, EN_SITIO, ESPERANDO_APROBACION (cotización), EN_PROCESO, POR_CONFIRMAR, FINALIZADA, SUSPENDIDA, CANCELADA.
- Categorías: Cómputo y redes, Electricidad, Plomería, Climatización, Línea blanca, Cerrajería, Pintura e impermeabilización, Mecánica automotriz.
- Pagos con tarjeta tokenizada (Conekta); el monto lo calcula el servidor. Retiros a CLABE validada.
- Tiempo real por WebSocket; mapas con OpenStreetMap; cámara para INE, rostro y evidencias.
- Textos en español de México. Unidades: pesos MXN, kilómetros, horario de 24 h en datos y 12 h legible.

## Brand Commitments

- Nombre: **Click & Serve** (con "&"). Plaza: Lázaro Cárdenas, Michoacán.
- Activos existentes: `assets/icon.png` (logotipo con pin y engranes en naranja y azul marino), `assets/fondo.jpeg` (ilustración). El dueño autorizó cambiar la identidad visual conservando el nombre.

## Evidence on Hand

- No hay reseñas, clientes, cifras ni testimonios reales; no se inventan. Las cuentas de prueba (`cliente.prueba@clickserve.test`, `tecnico.prueba@clickserve.test`) son sintéticas.
- Contenido legal real por redactar con un abogado: el aviso de privacidad y los términos de la app son borradores alineados a LFPDPPP y PROFECO.

## Product Principles

1. **Primero la confianza**: verificación visible, precios claros antes de empezar y pago solo al confirmar.
2. **Un vistazo basta**: el estado de cada orden y la siguiente acción se entienden sin leer párrafos.
3. **Nada inventado**: si no hay dato o no hay servidor, se dice; nunca se rellenan pantallas con ejemplos.
4. **Local y en su idioma**: Lázaro Cárdenas, pesos, folios, CLABE, SEP, como se habla aquí.
5. **Seguridad sin estorbar**: SOS, escalación y soporte siempre a la mano, sin convertir cada acción en un trámite.

## Accessibility & Inclusion

Objetivos táctiles de 48 × 48 dp (RNF-30), contraste suficiente bajo sol directo, texto que escala con el ajuste del sistema y estados con color más texto (RNF-31), nunca solo color.
