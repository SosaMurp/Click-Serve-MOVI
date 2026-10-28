# Click & Serve móvil: reporte de cambios

Fecha: 27 de octubre de 2026 (actualizado el 28 con la sección 11) · App: `Click-Serve-MOVI`, rama `claude/project-thread-9in69s` y después `claude/rediseno-simple` · Backend: `Click-Serve-Back`, rama `claude/requisitos-moviles` (se entrega como parche).

## 1. Resumen

- La app quedó conectada a un backend real, sin datos inventados, y cubre los 84 requisitos funcionales móviles de la matriz: 83 se cumplen y 1 queda parcial (RF-107, el asesor responde desde el panel web, que no forma parte de este trabajo).
- De los 43 RNF, 23 se cumplen, 17 son parciales (casi todos dependen de infraestructura de producción: TLS 1.3, WAF, Redis, ELK/WORM, PostGIS) y 3 no se cumplen (son del panel de administrador o de almacenamiento WORM). De las 16 RD, 11 se cumplen y 5 son parciales.
- El backend pasó de un solo `index.js` de 2,300 líneas a módulos con migraciones, 108 pruebas automáticas, idempotencia, transacciones con bloqueo de filas, auditoría, URLs firmadas y WebSocket.
- Se rediseñó toda la app con el estilo de la referencia TravelMate y los colores del logo: azul `#0B4F85` y naranja `#E8801F`.
- Se corrigieron las fallas graves del análisis original (correos maestros, tarjeta y CVV al backend, biometría falsa, tokens en la URL, XSS en el mapa, entre otras) y las que encontraron dos rondas de revisión de seguridad y de calidad.
- Verificación: las 108 pruebas del backend pasan, también sobre `main` limpio con los 23 parches aplicados. La app pasa 18/18 pruebas y el chequeo de tipos. El bundle web y el de Android se generan sin errores. Se recorrió el flujo completo en web con las dos cuentas de prueba.

| | App | Backend |
|---|---|---|
| Commits de la rama | 23 (incluye el reporte) | 23 (parches `0001`–`0023`) |
| Diff contra `main` | 256 archivos, +11,949 / −15,391 (se borró la app anterior) | 55 archivos, +6,326 / −2,440 (sin `node_modules`) |
| Pruebas | 18 (`npm test`) + `tsc --noEmit` | 108 (`npm test`, base `clickyserve_test`) |

## 2. Cambios del backend

**Estructura.** `index.js` solo arranca: migraciones, HTTP, WebSocket en `/ws` y el barrido de disponibilidad. La app Express vive en `src/app.js` y las rutas en `src/routes/` (auth, cuenta, solicitudes, incidencias y reprogramación, pagos y billetera, técnico, soporte, direcciones, biometría y archivos). Las utilidades están en `src/lib/` y los middlewares (`auth`, roles y aprobación, límite de intentos, mantenimiento) en `src/middleware/`. Las migraciones `migrations/001–003` se aplican solas al arrancar y quedan registradas en `schema_migraciones`.

**Reglas transversales.**
- La aprobación de una cuenta se decide en el servidor (`requireApproved` → 403 `ACCOUNT_PENDING`). No hay listas de correos maestros.
- El dinero se maneja solo en SQL `NUMERIC(19,4)`. La liquidación (`cs_liquidacion`) calcula la comisión del 10 %, la retención de ISR, la de IVA y el neto del técnico, con suma cero.
- `Idempotency-Key` (UUID v4, 24 h) es obligatoria al crear una solicitud, pagar, mandar SOS, retirar y finalizar. Solo se guardan las respuestas exitosas, así que un rechazo se puede reintentar con la misma clave.
- Aceptar, pagar, finalizar, cancelar y retirar corren en transacciones con `SELECT … FOR UPDATE`. Si dos técnicos aceptan a la vez, solo uno obtiene la solicitud.
- El pago se hace en dos pasos: se reserva el cobro (`estado_pago = PROCESANDO`), se cobra y luego se registra. Si la pasarela no responde, la orden queda en revisión y nunca se cobra dos veces.
- Los errores de sesión tienen código (`AUTH_REQUIRED`, `AUTH_INVALID`, `AUTH_REVOKED`). Una contraseña actual incorrecta responde 400 `PASSWORD_INCORRECT`, no 401.
- Hay límite de intentos en login, 2FA, recuperación y reenvío. El texto libre se sanea y las consultas SQL van parametrizadas.
- La auditoría (`auditoria`) guarda usuario, acción, IP, user-agent y hora UTC. Los archivos se guardan en la base y se sirven con una URL firmada HMAC de 5 minutos.
- Con `MAINTENANCE=1` toda la API responde 503. Sin `NODE_ENV=development` el servidor se comporta como producción y falla cerrado: sin cobros sandbox, sin secretos de respaldo y sin códigos en consola.
- El servidor revalida las sesiones del WebSocket en cada ping (25 s) y corta con el código 4401 las que se cerraron o se revocaron.

**Endpoints nuevos o rehechos** (las rutas que ya usaba el panel de administrador siguen respondiendo):
- Cuenta: `POST /api/login` con reto 2FA → `POST /api/login/verify-2fa`, `/api/usuarios/2fa/{iniciar,confirmar}`, `DELETE /api/usuarios/2fa`, `GET /api/me`, `PUT /api/usuarios/{perfil,preferencias,avatar}`, `DELETE /api/cuenta` (anonimiza) y `GET /api/cuenta/exportar` (ARCO).
- Solicitudes: crear (multipart, idempotente), detalle (oculta los datos personales del cliente a los técnicos no asignados), `GET /api/solicitudes/tecnico?vista=nuevas|en_curso|historial`, recomendados, proponer técnico, búsqueda automática, aceptar, descartar, estado, cotizar con conceptos, responder cotización, conceptos extra, tareas, evidencias, finalizar, confirmar y pagar, cancelar, calificar en ambos sentidos, SOS, incidencias y resolución, reprogramaciones y chat con adjuntos.
- Pagos: `/api/metodos-pago` (solo token; rechaza número completo y CVV), predeterminada, `/api/billetera` (CLABE enmascarada), `PUT /api/billetera/clabe` (dígito verificador y banco), movimientos con comprobante `TRX-…` y retiro (idempotente, mínimo $100).
- Técnico: disponibilidad, latido, resumen, perfil público, especialidades con alertas, portafolio, documentos y cédula SEP (timeout de 5 s).
- Soporte: tickets `TCK-…` con mensajes, adjuntos y escalación. Direcciones: CRUD con `PUT` corregido, predeterminada y coordenadas.

## 3. Cambios de la app por flujo

Estructura: `app/(auth)`, `app/(cliente)`, `app/(tecnico)`, `app/(comun)` y `app/legal`, con rutas protegidas por rol (`Stack.Protected` en `app/_layout.tsx`). El código de apoyo está en `src/api` (cliente HTTP con timeout, idempotencia y códigos de error), `src/state` (sesión, tiempo real, conectividad, disponibilidad), `src/design` (sistema de diseño), `src/features` (componentes por dominio), `src/lib` y `src/ui` (diálogos y avisos propios, sin `Alert.alert`). Se borró la app anterior (`components/`, `services/`, pantallas huérfanas) y las dependencias y permisos que ya no se usan.

- **Acceso:** login, registro por pasos (rol, calendario de nacimiento, INE y rostro con cámara o galería, contraseña fuerte, aviso de privacidad), verificación por código con autoverificación, 2FA, recuperación con elección de canal (correo o SMS) y avisos legales. El `reset_token` y el reto de 2FA viven en memoria y no viajan en la URL.
- **Cliente, solicitar:** inicio con buscador y categorías, nueva solicitud (qué, dónde con mapa, cuándo y cómo elegir técnico), elegir técnico (lista y mapa con posición aproximada, perfil con métricas, búsqueda automática) y seguimiento de la orden con mapa en vivo, llegada estimada, chat, SOS, cotización por conceptos y reprogramación.
- **Cliente, cierre:** "Confirma y paga" con evidencia, conceptos, tarjeta y calificación. Solo "Enviar y finalizar" cobra. Después vienen el comprobante (compartir o imprimir), el reporte de incidencias (no llegó, cobro indebido, garantía…) con reasignar, cancelar sin cargo o continuar, y la agenda e historial.
- **Común:** perfil y datos personales (nombre bloqueado con identidad verificada), notificaciones, seguridad (2FA, sesiones activas con "Desvincular", cambio de contraseña), direcciones con mapa, tarjetas, soporte con tickets y chat, ayuda, mis datos (exportar y eliminar cuenta). "¿Salir sin guardar?" también responde al botón atrás de Android y al gesto de iOS.
- **Técnico:** panel con interruptor de disponibilidad y latido, contadores, pestaña NUEVAS por defecto, lista y mapa. Incluye detalle con aceptar o descartar; servicio activo con "Ya llegué", tareas, cotización con "+ Agregar otro concepto", extras, evidencias antes, durante y después, finalizar, cancelar, reprogramar, SOS, llamada y "Cómo llegar"; y calificar al cliente. También perfil profesional, especialidades, portafolio, verificación, billetera, movimientos, comprobante, retiro y CLABE.
- **Robustez:** banner cuando el servidor no responde, un solo WebSocket por sesión, diálogos a prueba de doble toque y montos de vista previa en centavos enteros. Cuando el servidor corta el WebSocket por sesión terminada, la app consulta `/api/me` y sale al momento.

## 4. Diseño

> **Reemplazado** por el rediseño de la sección 11 (marino y naranja según las referencias de Diego, cliente sencillo). Lo que sigue describe la versión anterior.

La primera dirección visual, "rótulos pintados" (placas tipo letrero de taller), se reemplazó a petición de Diego por el estilo de su referencia **TravelMate**, con los colores del logo:

- **Paleta** (`src/design/tokens.ts`): fondo casi blanco `#F7F8FA`, tarjetas blancas muy redondeadas, marca azul `#0B4F85` (pin del logo) y acento naranja `#E8801F` (cursor del logo), con bloques pastel derivados (`#D8E9F8`, `#FFE3CC`). Verde, ámbar y rojo quedan solo para estados (pagado, requiere acción, error o SOS).
- **Tipografía:** Outfit para títulos y cifras, Inter para texto.
- **Componentes:** encabezado con botones circulares de 48 dp, tarjeta destacada con degradado para la orden en curso, píldoras de estado con color por estado (RNF-31), barra inferior, hojas, calendario propio, campo OTP, esqueletos de carga y SOS siempre en la capa superior.
- La estructura y la lógica se conservaron al cambiar de dirección; solo cambiaron los tokens y los componentes base. Por ahora solo hay esquema claro.

## 5. Fallas de seguridad corregidas

**Del análisis original de la app:**

| Problema | Corrección | Evidencia |
|---|---|---|
| Correos maestros que saltaban la aprobación | La aprobación la decide el servidor | `src/middleware/auth.js` (backend), `computeApproved` |
| Número de tarjeta y CVV enviados al backend | Se tokeniza en el teléfono; el backend rechaza número y CVV con 400 | `src/lib/tokenizer.ts`, prueba "tarjeta: enviar número completo o CVV se rechaza" |
| Tarjeta 4242 fija y `monto \|\| 450` | El total lo calcula el servidor; 4242 solo se acepta como tarjeta de prueba en modo sandbox | `POST /api/solicitudes/:id/confirmar` |
| Biometría falsa | La comparación la hace el servicio biométrico y no aprueba identidad | `src/routes/biometria.js`, `app/(tecnico)/verificacion.tsx` |
| `mockIne` y evidencias como `file://` | Archivos reales en multipart, servidos con URL firmada | `src/features/auth/DocCapture.tsx`, `POST /api/solicitudes/:id/evidencias` |
| Token en AsyncStorage y URL `http` | SecureStore en el teléfono (en web, localStorage); en producción se rechaza una URL sin HTTPS | `src/state/tokenStore.ts`, `src/lib/apiUrl.ts` |
| XSS en `SafeMapWrapper` | El mapa recibe JSON y escribe con `textContent`; en web se valida el origen del mensaje | `src/features/map/leafletHtml.ts`, `MapView.web.tsx` |
| RECHAZAR cancelaba la solicitud para todos | "Descartar" la oculta solo para ese técnico | `POST /api/solicitudes/:id/descartar` |
| CANCELAR sin llamar a la API | Cancela en el servidor, con sus reglas | `src/features/orders/actions.ts`, `POST /api/solicitudes/:id/cancelar` |
| Órdenes y técnicos inventados | Todo viene del servidor; si no hay datos, se dice | `GET /api/solicitudes/*`, `GET /api/tecnicos/recomendados` |
| RateService con id 1 fijo | Califica la orden real | `solicitudesApi.calificar(id, …)` |
| EditAddress con POST | Usa `PUT /api/direcciones/:id` | `src/api/endpoints.ts` |
| Doble solicitud al elegir técnico | Se propone sobre la solicitud ya creada | `app/(cliente)/elegir-tecnico/[id].tsx` |
| Cualquier 401 cerraba la sesión | Solo los 401 `AUTH_*` cierran la sesión | `src/api/client.ts` |
| GUARDAR que no guardaba | Cada botón Guardar llama a la API | `datos-personales.tsx`, `notificaciones.tsx`, `direccion.tsx`, `cuenta-bancaria.tsx` |

**Las 4 fallas del backend de la primera revisión de seguridad**, cada una con su prueba:
1. La biometría aprobada daba identidad verificada a un técnico sin revisión humana. Ahora la identidad la aprueba un administrador (commit `2635c69`).
2. `reset-password` aceptaba cambiar la contraseña sin `reset_token` durante 10 minutos. Ahora siempre lo exige (`59c76f0`).
3. En producción sin `CONEKTA_PRIVATE_KEY`, los cobros se registraban como pagados sin cobrar. Ahora fallan cerrado (`f50310d`).
4. Con la identidad verificada se podía cambiar el nombre, y la cédula SEP se validaba con una cuenta sin aprobar. Ahora el nombre queda bloqueado y la cédula exige la cuenta aprobada (`0c97ae2`).

**Segunda revisión (seguridad y calidad del diff completo):**
- Backend (`0104b3c`…`5fdd2b3`): la idempotencia ya no repite un rechazo 4xx; con 2FA activa ya no se reemplaza el secreto; reserva del cobro contra cargos dobles; el cliente ya no puede cerrar el SOS ni retirar el reporte del técnico; el WebSocket se corta al revocar la sesión; las cotizaciones de la versión anterior ya no dan 500; falla cerrado sin `NODE_ENV=development`; funciona el reintento de folio duplicado; un técnico suspendido sale de línea; se agregó `TRUST_PROXY`; "hoy" es la fecha de México; el timeout de Conekta es de 5 s.
- App (`8e0fdd0`…`0607429`): URL sin HTTPS rechazada en producción; tokens fuera de la URL; marcadores del mapa que se perdían; dinero en centavos; un solo WebSocket; diálogos contra doble toque; "salir sin guardar" con los gestos del sistema; errores que se tragaban; código muerto eliminado; salida inmediata cuando el servidor termina la sesión.

## 6. Cumplimiento contra la matriz

Estados: **Cumple**, **Parcial** (lo que falta va en la nota) o **No cumple**. Las rutas de la app son relativas a `Click-Serve-MOVI` y los endpoints son del backend.

### 6.1 Requisitos funcionales (84)

| RF | Requisito | Estado | Evidencia |
|---|---|---|---|
| RF-01 | Cierre de sesión global | Cumple | `src/features/account/ProfileScreen.tsx` ("Cerrar sesión", en ambos roles), `wipeLocalData` · `POST /api/logout` |
| RF-02 | Sesión y dashboard por rol | Cumple | `app/_layout.tsx` (`Stack.Protected`), `app/index.tsx` · `POST /api/login`, `GET /api/me` |
| RF-03 | "¿No tienes cuenta? Regístrate aquí" (texto de la referencia) | Cumple | `app/(auth)/login.tsx`, también "Crear cuenta" en `bienvenida.tsx` |
| RF-04 | Recuperación de acceso | Cumple | `app/(auth)/recuperar.tsx` → `recuperar-codigo.tsx` → `nueva-contrasena.tsx` · `/api/request-recovery`, `/api/verify-recovery`, `/api/reset-password` |
| RF-05 | Usuarios existentes → iniciar sesión | Cumple | `app/(auth)/registro.tsx` ("¿Ya tienes cuenta?") |
| RF-06 | Crear cuenta y redirigir | Cumple | `registro.tsx` → `verificar.tsx` · `POST /api/register` |
| RF-07 | Validar el código y redirigir | Cumple | `app/(auth)/verificar.tsx`, `src/features/auth/CodeScreen.tsx` · `POST /api/verify-token` |
| RF-08 | Reenviar código | Cumple | `CodeScreen.tsx` (espera de 60 s) · `POST /api/resend-code` (con límite) |
| RF-09 | Cambiar clave y cerrar otros dispositivos | Cumple | `app/(comun)/cambiar-contrasena.tsx` · `POST /api/update-password` (sube `version_sesion`) |
| RF-10 | Elegir canal SMS o correo | Cumple | `app/(auth)/recuperar.tsx` · `POST /api/request-recovery {canal}` |
| RF-12 | Sesiones activas, "Desvincular" | Cumple | `app/(comun)/sesiones.tsx` · `GET/DELETE /api/auth/sessions[/:id]` |
| RF-13 | Flujos de seguridad de la cuenta | Cumple | `app/(comun)/seguridad.tsx`, `verificacion-dos-pasos.tsx` · `/api/usuarios/2fa/*` |
| RF-15 | Validar la contraseña actual | Cumple | `cambiar-contrasena.tsx` · 400 `PASSWORD_INCORRECT` |
| RF-16 | Baja con validación de credenciales | Cumple | `app/(comun)/mis-datos.tsx` · `DELETE /api/cuenta {password}` (anonimiza) |
| RF-18 | Selector CLIENTE / TÉCNICO | Cumple | `registro.tsx` · `POST /api/register` |
| RF-19 | Calendario de fecha de nacimiento | Cumple | `src/design/Pickers.tsx`, `registro.tsx` (valida 18 años o más) |
| RF-20 | Perfil del técnico con métricas | Cumple | `app/(comun)/tecnico/[id].tsx` (desde "Ver perfil") · `GET /api/tecnicos/:id/perfil` |
| RF-21 | Disponibilidad del técnico | Cumple | píldora ONLINE/OFFLINE de `src/features/tech/PanelHeader.tsx`, `src/state/availability.tsx` · `PUT /api/tecnico/disponibilidad`, `POST /api/tecnico/latido` |
| RF-22 | Foto profesional | Cumple | `app/(comun)/datos-personales.tsx` · `PUT /api/usuarios/avatar` |
| RF-23 | Alertas por categoría | Cumple | `app/(tecnico)/especialidades.tsx` · `PATCH /api/tecnico/especialidades/:id/toggle` |
| RF-24 | Habilidades y portafolio | Cumple | `especialidades.tsx`, `portafolio.tsx` · `POST /api/tecnico/especialidades`, `/api/tecnico/portafolio` |
| RF-25 | Carga secuencial de documentos | Cumple | `src/features/ine/IneCapture.tsx` (INE verificada al tomar la foto · `POST /api/ine/verificar`), `src/features/auth/DocCapture.tsx` (rostro), `app/(tecnico)/verificacion.tsx` · `/api/tecnico/documentos`, `/api/tecnicos/validar-cedula` |
| RF-43 | Calificación bidireccional | Cumple | `app/(cliente)/orden/[id]/calificar.tsx`, `app/(tecnico)/trabajo/[id]/calificar.tsx` · `/calificar`, `/calificar-cliente` |
| RF-45 | Iniciar solicitud → detalles | Cumple | `app/(cliente)/(tabs)/inicio.tsx` ("Pedir un servicio") → `nueva-solicitud.tsx` (3 pasos) |
| RF-46 | Registrar la necesidad → selección | Cumple | `nueva-solicitud.tsx` → `elegir-tecnico/[id].tsx` · `POST /api/solicitudes` |
| RF-47 | Búsqueda automática | Cumple | `elegir-tecnico/[id].tsx`, `nueva-solicitud.tsx` · `POST /api/solicitudes/:id/busqueda-automatica` |
| RF-48 | Asignación por recomendación | Cumple | `elegir-tecnico/[id].tsx` (lista y mapa) · `GET /api/tecnicos/recomendados` |
| RF-49 | Confirmar contratación | Cumple | `elegir-tecnico/[id].tsx` · `POST /api/solicitudes/:id/proponer-tecnico` |
| RF-50 | Base de conocimientos | Cumple | `app/(comun)/ayuda/index.tsx`, `ayuda/[slug].tsx`, `src/features/help/content.ts` |
| RF-51 | Detener búsqueda y cancelar | Cumple | `app/(cliente)/orden/[id]/index.tsx`, `src/features/orders/actions.ts` · `POST /api/solicitudes/:id/cancelar` |
| RF-52 | Rastreo del servicio activo | Cumple | `orden/[id]/index.tsx` (mapa con el técnico y llegada estimada) · evento WebSocket `tecnico.ubicacion` |
| RF-53 | Redirigir a "Confirmar servicio" | Cumple | `orden/[id]/confirmar.tsx` al quedar `POR_CONFIRMAR` · `POST /api/solicitudes/:id/finalizar` |
| RF-54 | Confirmar atención → calificación | Cumple | `confirmar.tsx` · `POST /api/solicitudes/:id/confirmar` |
| RF-55 | Reasignación | Cumple | `orden/[id]/index.tsx` ("Pedir otro técnico") · `POST /api/incidencias/:id/resolver {REASIGNAR}` |
| RF-56 | "El técnico no llegó" | Cumple | `orden/[id]/incidencia.tsx` (`NO_SE_PRESENTO`) · `POST /api/solicitudes/:id/incidencias` |
| RF-57 | Cancelar sin cargo | Cumple | `orden/[id]/index.tsx` · `/resolver {CANCELAR}`, `/cancelar` |
| RF-58 | Aceptar o descartar | Cumple | `app/(tecnico)/solicitud/[id].tsx` · `/aceptar` (`FOR UPDATE`), `/descartar` |
| RF-59 | Resumen del servicio | Cumple | `app/(tecnico)/trabajo/[id]/index.tsx` · `GET /api/solicitudes/:id` |
| RF-60 | Notificar llegada | Cumple | `trabajo/[id]/index.tsx` ("Ya llegué") · `PATCH /api/solicitudes/:id/estado {EN_SITIO}` |
| RF-61 | Cancelar en ruta | Cumple | `trabajo/[id]/index.tsx` · `/cancelar` (vuelve a buscar técnico sin él) |
| RF-62 | Tareas e imprevistos | Cumple | `trabajo/[id]/index.tsx` · `/api/solicitudes/:id/tareas`, `POST /conceptos` |
| RF-63 | Ir a reprogramación | Cumple | `trabajo/[id]/index.tsx`, `orden/[id]/index.tsx` → `app/(comun)/reprogramar/[id].tsx` |
| RF-64 | El técnico propone nuevo horario | Cumple | `reprogramar/[id].tsx` · `POST /api/solicitudes/:id/reprogramaciones` |
| RF-65 | Agregar evidencia e inspeccionarla | Cumple | `trabajo/[id]/evidencias.tsx` ("Tomar foto" / "Elegir de la galería"), visor a pantalla completa en `Gallery.tsx` · `POST /evidencias`. Los rótulos difieren de la matriz ("AGREGAR", lupa) |
| RF-66 | Tarjeta principal o nueva | Cumple | `app/(cliente)/tarjetas.tsx`, `tarjeta-nueva.tsx` · `GET/POST /api/metodos-pago` |
| RF-67 | Tarjeta predeterminada | Cumple | `tarjetas.tsx` · `PATCH /api/metodos-pago/:id/predeterminada` |
| RF-68 | Guardar el método de pago | Cumple | `tarjeta-nueva.tsx`, `src/lib/tokenizer.ts` · `POST /api/metodos-pago` (solo token) |
| RF-69 | Ir a "Servicio finalizado" | Cumple | `orden/[id]/confirmar.tsx` ("Confirma y paga") |
| RF-70 | Pagar solo con "ENVIAR Y FINALIZAR" | Cumple | `confirmar.tsx` ("Enviar y finalizar") · `POST /confirmar` (idempotente, reserva del cobro) |
| RF-71 | CLABE con "GUARDAR NUEVA CUENTA" | Cumple | `app/(tecnico)/cuenta-bancaria.tsx` · `PUT /api/billetera/clabe` |
| RF-72 | "+ AGREGAR OTRO CONCEPTO" | Cumple | `trabajo/[id]/cotizar.tsx` · `POST /api/solicitudes/:id/cotizar {conceptos}` |
| RF-73 | Saldo y "RETIRAR A BANCO" | Cumple | `app/(tecnico)/(tabs)/billetera.tsx` (botón "Retirar") · `GET /api/billetera` |
| RF-74 | "CAMBIAR" la cuenta de depósito | Cumple | `billetera.tsx` (fila de la CLABE) → `cuenta-bancaria.tsx` |
| RF-75 | "VER TODOS LOS MOVIMIENTOS" | Cumple | `billetera.tsx` ("Movimientos") → `movimientos.tsx` · `GET /api/billetera/movimientos` |
| RF-76 | Definir el monto y retirar | Cumple | `app/(tecnico)/retiro.tsx` · `POST /api/billetera/retiro` (mínimo $100) |
| RF-79 | Comprobante con folio `#TRX-…` | Cumple | `app/(tecnico)/movimiento/[id].tsx` · `GET /api/billetera/movimientos/:id` |
| RF-84 | Salir sin guardar | Cumple | `src/design/AppBar.tsx` (`confirmDiscard`, botón atrás y gesto) |
| RF-85 | Guardado explícito | Cumple | `datos-personales.tsx`, `notificaciones.tsx`, `direccion.tsx` · `PUT /api/usuarios/perfil`, `/preferencias` |
| RF-86 | Avatar → cuenta y datos | Cumple | avatar de la cabecera en `inicio.tsx` (→ Mi cuenta) y en `PanelHeader.tsx` del técnico (→ Perfil) |
| RF-87 | Direcciones, pagos, seguridad y soporte | Cumple | `ProfileScreen.tsx` |
| RF-88 | Abrir correo o marcador | Cumple | `app/(comun)/ayuda/index.tsx` (`mailto:` y `tel:`) |
| RF-89 | Preferencias de acceso y alertas | Cumple | `app/(comun)/notificaciones.tsx` · `PUT /api/usuarios/preferencias` |
| RF-90 | Llamar al cliente | Cumple | `trabajo/[id]/index.tsx` (`tel:`; el teléfono solo llega al técnico asignado) |
| RF-91 | Ajustes avanzados y de seguridad | Cumple | `seguridad.tsx` |
| RF-92 | Artículos de pagos, validaciones y penalizaciones | Cumple | `src/features/help/content.ts` |
| RF-94 | Ticket o imprimir folio | Cumple | `soporte/nuevo.tsx`, `orden/[id]/comprobante.tsx` (`src/lib/receipt.ts`) · `POST /api/soporte/tickets` |
| RF-100 | SOS con GPS | Cumple | `src/features/orders/SosButton.tsx` · `POST /api/solicitudes/:id/sos` (idempotente) |
| RF-101 | Administrar direcciones | Cumple | `app/(cliente)/direcciones.tsx`, `direccion.tsx` · `/api/direcciones` |
| RF-102 | Ajustar el punto exacto | Cumple | `direccion.tsx` (tocar el mapa) · `PUT /api/direcciones/:id` |
| RF-103 | Borrar domicilio | Cumple | `direcciones.tsx` · `DELETE /api/direcciones/:id` |
| RF-104 | Guía satelital al cliente | Cumple | `trabajo/[id]/index.tsx` ("Cómo llegar" abre Google Maps o Apple Maps) |
| RF-105 | Recentrar el mapa | Cumple | `src/features/map/MapView*.tsx` ("Centrar en mi ubicación") |
| RF-106 | Marcadores de solicitudes | Cumple | `app/(tecnico)/(tabs)/mapa.tsx` · `GET /api/solicitudes/tecnico?vista=nuevas` |
| RF-107 | Chat de soporte con un asesor | Parcial | `app/(comun)/soporte/*` · `/api/soporte/tickets/*`, WebSocket `soporte.mensaje`. El asesor responde con `POST /api/admin/soporte/tickets/:id/mensajes`, pero falta su pantalla en el panel web |
| RF-108 | Chat con archivos | Cumple | `app/(comun)/chat/[id].tsx`, `src/features/chat/ChatThread.tsx` · `/api/solicitudes/:id/chat` (multipart) |
| RF-109 | Ir a "Reportar incidencia" | Cumple | `orden/[id]/incidencia.tsx` |
| RF-110 | Registrar la queja y suspender | Cumple | `POST /api/solicitudes/:id/incidencias` → `SUSPENDIDA` |
| RF-111 | Panel abre en NUEVAS | Cumple | `app/(tecnico)/(tabs)/trabajos.tsx` (vista inicial `nuevas`) |
| RF-112 | Chat con el solicitante | Cumple | `trabajo/[id]/index.tsx` → `chat/[id].tsx` |
| RF-113 | Escalación crítica | Cumple | "Escalar" en `chat/[id].tsx` y `soporte/[id].tsx` · `POST /api/solicitudes/:id/escalar` (ticket ALTA + incidencia SEGURIDAD) |
| RF-122 | Agenda: pendientes e historial | Cumple | `app/(cliente)/(tabs)/servicios.tsx`, `trabajos.tsx` |
| RF-123 | Detalle de trabajos finalizados o cancelados | Cumple | historial → `orden/[id]` y `trabajo/[id]` |
| RF-124 | Aceptar o rechazar el horario propuesto | Cumple | `src/features/orders/ReprogramCard.tsx` · `PATCH /api/reprogramaciones/:id` (con contrapropuesta) |
| RF-125 | Formalizar el cambio o no modificar | Cumple | `ReprogramCard.tsx` · `PATCH /api/reprogramaciones/:id` |

### 6.2 Requisitos no funcionales (43)

Algunos dependen de infraestructura que no existe en un entorno local (TLS 1.3, WAF, Redis, ELK o WORM, PostGIS, balanceador). En esos casos el código queda preparado y el estado es Parcial.

| RNF | Estado | Evidencia / nota |
|---|---|---|
| RNF-01 Acceso seguro y anti-enumeración | Cumple | bcrypt, mensajes genéricos (la recuperación responde igual si el correo no existe), `src/middleware/rateLimit.js`; la app exige HTTPS en producción (`src/lib/apiUrl.ts`) |
| RNF-02 PCI: sin PAN ni CVV | Cumple | `src/lib/tokenizer.ts`; el backend rechaza número y CVV y guarda solo el token |
| RNF-03 PII en tránsito | Parcial | Dirección exacta y teléfono solo para el técnico asignado, validado en el servidor (prueba incluida). TLS 1.3 se configura en el servidor de producción |
| RNF-04 MFA TOTP | Parcial | RFC 6238 en el servidor, ±30 s, reto de 3 min destruido tras 3 intentos (`src/lib/totp.js`, pruebas). Falta cerrar sesiones por 3 min de inactividad (hoy duran 7 días) |
| RNF-05 TLS 1.3, AES-256, Argon2id | Parcial | Contraseñas con bcrypt, no Argon2id; TLS y cifrado dependen del despliegue |
| RNF-06 WAF y saneamiento | Parcial | Límite de intentos por IP en memoria, `sanitizeText`, SQL parametrizado; sin WAF ni bloqueo automático de IP |
| RNF-07 Kill switch | Parcial | La revocación por usuario es inmediata (sesión validada en la base en cada petición); para todos, rotar `JWT_SECRET`. Sin Redis |
| RNF-08 bcrypt y protección de documentos | Parcial | bcrypt y URLs firmadas; el AES-256 en tránsito depende del TLS del despliegue |
| RNF-09 CLABE enmascarada y nada financiero local | Cumple | `GET /api/billetera` enmascara en el servidor; `wipeLocalData` al salir |
| RNF-10 Invalidación de sesión | Cumple | `version_sesion` y estado de sesión revisados en cada petición; logout destruye la sesión en el servidor; el WebSocket se corta (≤ 25 s) y la app sale |
| RNF-11 Respuesta en 2 a 5 s | Cumple | En local: técnicos recomendados 4.5 ms, NUEVAS 5.7 ms (medianas). Sin prueba de carga |
| RNF-12 WebSocket wss | Cumple | `/ws` (`src/lib/realtime.js`, `src/state/realtime.tsx`); con URL https la app usa wss. Latencia sin medición formal |
| RNF-13 Lazy loading y compresión | Cumple | `compression()` en el servidor; imágenes comprimidas antes de subir (`src/lib/media.ts`) |
| RNF-14 Réplicas y Redis para el dashboard | No cumple | Es del panel de administrador y de infraestructura |
| RNF-15 Reportes por chunks | No cumple | Es del panel de administrador |
| RNF-16 Full-duplex con prioridad SOS | Parcial | WebSocket y push inmediato del SOS; sin cola con prioridad |
| RNF-17 Asignación en menos de 2 s, cierre de socket | Parcial | Eventos por WebSocket; un socket caído se detecta con el ping de 25 s, no de inmediato |
| RNF-18 Autoverificación del 2FA | Cumple | `src/design/OtpField.tsx` (salto de foco), `CodeScreen.tsx` (verifica al completar) |
| RNF-19 Servidor caído | Parcial | Banner y bloqueo de acciones (`src/state/connectivity.tsx`); el uptime de 99.9 % depende del hosting |
| RNF-20 Atomicidad ACID | Cumple | `withTransaction` (BEGIN/COMMIT/ROLLBACK) en pagos y cancelaciones |
| RNF-21 Coherencia de estado | Cumple | Esquema 3NF, validación y normalización en el servidor antes de guardar |
| RNF-22 Resoluciones financieras en transacción | Cumple | Confirmar, retiro y liquidación en transacción |
| RNF-23 Bloqueo pesimista de tickets | Parcial | `FOR UPDATE` en solicitudes, incidencias y pagos; la edición simultánea de tickets por administradores es del panel |
| RNF-24 Row locks en finanzas | Cumple | `SELECT … FOR UPDATE` en aceptar, pagar y retirar; prueba de aceptación concurrente |
| RNF-25 Trazabilidad | Parcial | Tabla `auditoria` (IP, user-agent, UTC); sin ELK ni retención de 12 meses |
| RNF-26 URLs firmadas de 5 min | Parcial | `signFileUrl` usa 5 min por defecto; avatares y portafolio usan 1 h |
| RNF-27 Logs inmutables | Parcial | Registro síncrono con IP y user-agent en la base; no es WORM |
| RNF-28 Feedback de conexión | Cumple | Indicadores de carga en botones, esqueletos y banner de conexión |
| RNF-29 Validación en tiempo real | Cumple | `src/lib/validators.ts` (Luhn, CLABE, correo, contraseña); el servidor valida de nuevo |
| RNF-30 48 dp y háptica | Cumple | Botones e íconos de 48 dp; háptica después de la respuesta del servidor (`hapticSuccess`) |
| RNF-31 Color por estado y SOS arriba | Cumple | `src/lib/estado.ts`, `StatusPlate.tsx`; SOS con `zIndex: 100` |
| RNF-32 Pago y SOS sin doble ejecución | Cumple | Idempotencia y reserva del cobro; pruebas "un solo cobro" y "una sola alerta" |
| RNF-33 Idempotencia UUID v4 de 24 h | Cumple | `src/lib/idempotency.js`, `src/lib/useOperationKey.ts` |
| RNF-34 Heartbeat | Parcial | Latido HTTP cada 20 s y ventana de 90 s; no es MQTT/WSS ni detecta en menos de 5 s |
| RNF-35 Idempotencia de red | Cumple | Igual que RNF-33 |
| RNF-36 Timeout de 5 s en APIs externas | Cumple | SEP, biometría y Conekta con 5 s; responden "no disponible" sin guardar nada para después |
| RNF-37 Sin flotantes en el cliente | Cumple | Totales en SQL `NUMERIC(19,4)` con suma cero; la app solo formatea (la vista previa usa centavos enteros) |
| RNF-38 PostGIS GIN/GiST | Parcial | Distancia con Haversine en SQL; sin PostGIS ni índice espacial |
| RNF-39 Precisión centralizada | Cumple | `cs_liquidacion` en la base |
| RNF-40 Historial limpio y challenge-response | Cumple | Tokens nunca en la URL (`src/features/auth/handoff.ts`); contraseña o código para eliminar la cuenta, desactivar 2FA y cambiar la clave |
| RNF-41 Almacenamiento WORM | No cumple | Requiere almacenamiento de objetos con retención legal |
| RNF-42 Mantenimiento con 503 | Parcial | `MAINTENANCE=1` → 503 en la API (prueba incluida); no está en el balanceador |
| RNF-43 GPS y ETA | Parcial | Ubicación cada 4 s con precisión alta; ETA estimada por distancia, sin API de tráfico |

### 6.3 Reglas de dominio (16)

| RD | Estado | Evidencia / nota |
|---|---|---|
| RD-001 Técnico electricista: certificaciones | Cumple | Especialidades con documentos y certificaciones en revisión (`especialidades.tsx`, `verificacion.tsx`); insignia SEP en el perfil |
| RD-002 Dominio web electricista (SSL, correo) | Parcial | Correo de soporte configurable (`EXPO_PUBLIC_SUPPORT_EMAIL`); el dominio y el SSL son del despliegue |
| RD-003 Técnico en cómputo | Cumple | Categoría "Cómputo y redes" con certificaciones y portafolio |
| RD-004 Dominio web en cómputo (tickets, descargas) | Parcial | Tickets de soporte en la app; la sección de descargas y el dominio son del sitio web |
| RD-005 Técnico en plomería | Cumple | Categoría y especialidad de plomería con certificaciones |
| RD-006 Dominio web plomería (citas en línea) | Parcial | Fecha y hora preferidas y reprogramación en la app; el dominio es del sitio web |
| RD-007 Técnico en mecánica (garantías) | Cumple | Categoría de mecánica automotriz, garantía de 90 días |
| RD-008 Web mecánica (cotización rápida, Maps) | Parcial | Cotización por conceptos y "Cómo llegar" con Google Maps; el dominio es del sitio web |
| RD-009 Contexto local | Cumple | Lázaro Cárdenas como centro por defecto, español de México, pesos, fecha de México en el servidor (`src/lib/dates.js`) |
| RD-010 Cercanía, especialidad y disponibilidad | Cumple | `GET /api/tecnicos/recomendados` ordena por especialidad, distancia y calificación; solo técnicos en línea y aprobados |
| RD-011 LFPDPPP y ARCO | Cumple | Consentimiento en el registro, `app/legal/privacidad.tsx`, exportar datos y anonimizar. El texto legal es un borrador para revisar con un abogado |
| RD-012 Garantía PROFECO | Cumple | 90 días desde la finalización; el reclamo abre una incidencia GARANTIA |
| RD-013 Retenciones ISR e IVA | Parcial | Desglose calculado en SQL (`cs_liquidacion`). La tasa de ISR (2.1 %) debe confirmarse con un contador (ver riesgos) |
| RD-014 CLABE de 18 dígitos | Cumple | Dígito verificador y banco por prefijo en app y servidor (pruebas) |
| RD-015 NOM-001-SEDE | Cumple | Las tareas de electricidad y de equipos eléctricos incluyen los puntos de la norma (plantillas en `src/services/solicitudes.js` del backend, tabla `tareas_servicio`) |
| RD-016 Protección civil STPS | Cumple | Todas las órdenes empiezan con las tareas de seguridad en sitio y equipo de protección (`src/services/solicitudes.js`) |

## 7. Pendientes y riesgos

1. **Urgente: cambiar las contraseñas y llaves filtradas.** La contraseña de aplicación de la cuenta de Gmail `projectcys1@gmail.com` (estaba escrita en `index.js`) y la de la base de datos (en `.env`) estuvieron en texto plano en el repositorio público del backend. Hay que revocarlas y generar nuevas ya, porque están en el historial de `main` aunque se borren. En la misma revisión aparecieron otras dos:
   - **Llave privada de Conekta** (`key_…`) escrita en `index.js` de `main` como valor por defecto de `CONEKTA_PRIVATE_KEY`. Hay que revocarla en el panel de Conekta y generar otra.
   - **Secreto de JWT por defecto** en `index.js` y `middleware/authMiddleware.js` de `main`: si el servidor corrió sin `JWT_SECRET`, cualquiera pudo firmar tokens válidos. Define un `JWT_SECRET` largo y aleatorio; con los parches, el servidor ya no arranca sin él fuera de desarrollo.
   - El parche `0001` contiene la contraseña de Gmail, en la línea que la borra de `index.js`, y la llave de Conekta, al mover las rutas viejas a `src/routes/legacy.js`. El `0005` vuelve a mostrar la llave al borrar `legacy.js`. Un parche que borra una línea tiene que incluirla, así que no se puede evitar. Por eso el cambio es obligatorio antes de compartir los parches; la rama final ya no contiene ninguna de las dos.
   - Sacar `.env` del control de versiones: `git rm --cached .env`. Ya está en `.gitignore`; los parches no lo tocan.
2. **ISR de plataformas digitales:** la liquidación retiene 2.1 % de ISR sobre la base sin IVA y 8 % de IVA (la mitad del 16 %). Ese 2.1 % es la tasa del art. 113-A de la LISR para transporte y entrega de bienes. Para enajenación de bienes y prestación de servicios la tasa era 1 %, y la reforma fiscal de 2026 pudo modificarla. Un contador debe confirmarla antes de cobrar de verdad. Se cambia en `cs_liquidacion` (`migrations/002_requisitos_moviles.sql`).
3. **Infraestructura de producción:** TLS 1.3, WAF, un limitador de intentos compartido (Redis) si hay varias instancias, logs WORM, PostGIS y monitoreo de uptime (ver RNF Parciales).
4. **Llaves y servicios:** `CONEKTA_PRIVATE_KEY` y `EXPO_PUBLIC_CONEKTA_PUBLIC_KEY` para cobrar de verdad, SMTP y Twilio para enviar códigos, el servicio biométrico (`BIOMETRIC_SERVICE_URL`) levantado y la consulta SEP. Sin ellos, en producción el servidor responde "no disponible", como debe.
5. **Panel de administrador:** falta la pantalla para que un asesor responda tickets (RF-107) y otra para aprobar técnicos (`PATCH /api/admin/usuarios/:id/aprobar`; mientras tanto se usa `node scripts/aprobar-usuario.js`).
6. **Pruebas en teléfono:** se verificó en web y con el bundle de Android, sin emulador ni dispositivo físico. Las notificaciones push y los permisos de cámara y ubicación requieren un build con EAS y una prueba en Android real.
7. **Seguridad residual menor:** en web el token vive en `localStorage` (limitación documentada de la versión web); las sesiones no expiran por inactividad (RNF-04); un socket caído tarda hasta 25 s en detectarse.
8. **Contenido legal:** el aviso de privacidad y los términos son borradores alineados a LFPDPPP y PROFECO; deben revisarlos con un abogado.
9. **Diseño:** falta el modo oscuro.

## 8. Cómo probar

**Backend** (`C:\Proyectos\Click-Serve-Back`, rama `claude/requisitos-moviles` o `main` con los parches):
```bash
npm install
cp .env.example .env        # llenar DB_*, JWT_SECRET, FILES_SECRET; NODE_ENV=development para pruebas locales
npm start                   # aplica migraciones y escucha en PORT
npm test                    # requiere una base vacía clickyserve_test → 147 pruebas
npm run db:seed             # cuentas de prueba (solo desarrollo; ver README del backend)
```
En desarrollo, los códigos de verificación se imprimen en la consola del servidor y los cobros son sandbox.

**App** (`C:\Proyectos\Click-Serve-MOVI`):
```bash
npm install
# .env → EXPO_PUBLIC_API_URL=http://localhost:3001 (o la IP de la PC para un teléfono en la misma red)
npm test                    # 26 pruebas
npx tsc --noEmit            # chequeo de tipos
npm run web                 # http://localhost:8081 · o `npm start` y Expo Go / dev client
```

**Cuentas de prueba** (las crea `npm run db:seed` en el backend, ya aprobadas; antes `scripts/local-dev-setup.sql`): `cliente.prueba@clickserve.test` y `tecnico.prueba@clickserve.test`. Las contraseñas están en ese script. **Tarjetas de prueba:** `4242 4242 4242 4242` (aprobada) y `4000 0000 0000 0002` (rechazada), con cualquier fecha futura y CVV.

**Recorrido sugerido:**
1. Como cliente, crea una solicitud con mapa y elige un técnico.
2. Como técnico, ponte en línea, acepta, marca en camino y "Ya llegué", y envía una cotización con varios conceptos.
3. Como cliente, aprueba la cotización.
4. Como técnico, sube la evidencia y finaliza.
5. Como cliente, usa "Confirma y paga" con la tarjeta 4242 y califica.
6. Como técnico, revisa la billetera (saldo acreditado con el desglose), haz un retiro y abre su comprobante `TRX-…`.
7. Prueba también la cancelación, una incidencia, la reprogramación, un ticket de soporte, la recuperación de contraseña y la desvinculación de sesiones.

## 9. Cómo aplicar el parche del backend

Los 29 parches están en `Click-Serve-Back\parches\` (y en `entregables\parches\`). No incluyen `.env`, `node_modules` ni `scripts/local-*`. `main` versiona `node_modules`, y las dependencias nuevas son `ws`, `jose`, `sharp`, `tesseract.js` y `@tesseract.js-data/spa` y `eng`, así que hay que correr `npm install` después de aplicar.

```bash
cd Click-Serve-Back
git checkout main && git pull
git checkout -b requisitos-moviles
git am parches/*.patch          # aplican limpio sobre main (37b8a1a)
npm install                     # agrega ws, jose, sharp y tesseract.js
npm test                        # 147/147 con la base clickyserve_test
```
Si `git am` se detiene por un conflicto (por ejemplo, si `main` avanzó), resuélvelo y usa `git am --continue`, o `git am --abort` para volver atrás.

## 10. Commits

**App** (`main..claude/project-thread-9in69s`): `92e05ce` sistema de diseño e infraestructura · `5037dd3` acceso · `fb181c7` componentes de órdenes · `caf487c` cambio a la referencia TravelMate · `9571e28` flujo del cliente · `33b2efc` flujo del técnico · `dee1475` borra la app anterior · `8e0fdd0` `b8c028b` `8cff026` `71561ad` `7d4f315` `f67bbfb` `19f813a` `26f8811` `39c1029` `b447e98` `0f3614b` `85ced74` `0607429` correcciones de seguridad y calidad · este reporte.

**Backend** (`main..claude/requisitos-moviles`): `3dcd422` backend modular · `f9395a4` cuenta · `8067efe` solicitudes · `4cf08bf` técnico y pagos · `7dea8ad` soporte y direcciones · `5a12f89` fotos firmadas · `061cee2` posición aproximada · `2635c69` `59c76f0` `f50310d` `0c97ae2` las 4 fallas de seguridad · `0104b3c`…`5fdd2b3` segunda revisión.

## 11. Rediseño según las referencias, cliente sencillo y verificación real de la INE (28 de octubre)

Pedido de Diego: que la credencial se reconozca de verdad al tomar la foto, cambios de diseño según seis pantallas de referencia y pantallas del cliente más sencillas, con el enfoque del portal ciudadano de CILIM. Diseño y plan: `docs/superpowers/specs/2026-10-27-rediseno-cliente-simple-ine-design.md` y `docs/superpowers/plans/2026-10-27-rediseno-cliente-simple-ine.md`.

### 11.1 Diseño (referencias de Diego)

- **Estilo:** fondo blanco, azul marino `#0C1C40` para títulos y la acción principal, y naranja para la acción destacada. Etiquetas de campo en MAYÚSCULAS, campos blancos con borde e ícono, botones de 52/56 dp con texto en mayúsculas, tarjetas de radio 16 y solo Inter. Sin degradados ni bloques pastel.
- **Accesibilidad:** el naranja `#FF6B00` con texto blanco da 2.9:1, así que los botones naranjas usan `#E25900` (3.7:1, etiqueta en negrita). Los enlaces naranjas usan `#B84A00` (5.2:1) y el borde de los campos `#8B93A1` (3.1:1).
- **Logo nuevo:** flecha de cursor con llave inglesa, redibujada en SVG (`src/design/Brand.tsx`). Con el mismo dibujo se generaron el ícono, el ícono adaptativo y monocromo de Android, el splash y el favicon.
- **Pantallas:**
  - bienvenida nueva (`app/(auth)/bienvenida.tsx`; la app sin sesión abre aquí);
  - login;
  - crear cuenta en 3 pasos: el paso 1 es la pantalla de la referencia; teléfono y confirmación van en el 2 y la identidad en el 3;
  - verifica tu correo: 6 cajas, que son los dígitos reales; VERIFICAR CÓDIGO; sigue verificando al teclear el último dígito (RNF-18);
  - Panel de Trabajo del técnico: píldora ONLINE/OFFLINE (RF-21), cifras de la semana, pestañas NUEVAS/EN CURSO/HISTORIAL, tarjeta "Asignación directa / Solicitud cercana" con RECHAZAR y ACEPTAR TRABAJO, y "Siguiente destino" con ETA, CITA, ESTATUS, CHAT y VER EN MAPA.
- La barra inferior del técnico conserva Trabajos, Mapa, Billetera y Perfil. No se agregó "Comunidad" porque ningún requisito la pide.

### 11.2 Inicio con Google y Apple (listo, apagado)

Los botones aparecen solo si existe la credencial; sin ella no se muestran.

| Dónde | Google | Apple (solo iOS) |
|---|---|---|
| App `.env` | `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | `EXPO_PUBLIC_APPLE_SIGNIN=1` |
| Backend `.env` | `GOOGLE_CLIENT_IDS` (los mismos IDs separados por comas) | `APPLE_BUNDLE_ID` |
| Cuenta | Proyecto en Google Cloud Console (gratis): pantalla de consentimiento y un ID de cliente OAuth por plataforma. El de web lleva como origen y redirección el dominio de la app. | Apple Developer Program (99 USD al año) con "Sign in with Apple" en el bundle `com.gallo122.clickservemovil`. En `app.json`, `ios.usesAppleSignIn = true` y el plugin `expo-apple-authentication`. Después, una build nueva. |

- **Backend:** `POST /api/auth/google` y `POST /api/auth/apple` verifican la firma del id_token con las llaves públicas del proveedor, además del emisor, la audiencia y el correo verificado. Con un correo registrado inician sesión (respetando 2FA); con uno nuevo devuelven nombre y correo para prellenar el registro, que sigue exigiendo la INE. Sin variables responden 404 `PROVIDER_DISABLED`.
- **App:** Google usa `expo-auth-session` (OpenID con nonce), que funciona en web. Para la app instalada, Expo v57 recomienda `@react-native-google-signin/google-signin`; conviene cambiarlo al activarlo en Android o iOS.

### 11.3 Cliente más sencillo (enfoque CILIM)

De `C:\Proyectos\CILIM\src\views\ciudadano\ciudadano.css` se tomaron la letra de cuerpo de 18 px, los botones de 56 dp, una pregunta por pantalla, bordes visibles y el lenguaje llano.

- **Inicio** (`inicio.tsx`): saludo, "Tu servicio" (el estado en una frase con un solo botón; `clientStatusText` en `src/lib/estado.ts`) y tres acciones grandes: Pedir un servicio, Mis servicios y Ayuda.
- **Pedir un servicio** (`nueva-solicitud.tsx`): "Paso N de 3" con Regresar siempre visible: 1) qué arreglar; 2) dónde, con el mapa como opción; 3) cuándo y quién va. Al final confirma con el folio.
- **Mis servicios y detalle:** el estado en palabras y un botón con la siguiente acción ("Revisar el precio", "Confirmar y pagar"). Avance, precio, fotos y detalle están en "Ver detalles del servicio"; reprogramar, garantía o reporte, soporte y cancelar, en "Más opciones". El SOS sigue siempre visible.
- **Mi cuenta:** filas grandes para lo diario; notificaciones, descargar o borrar mis datos y términos están en "Más opciones". La barra inferior del cliente es más grande.
- Se revisó a 320 px y con la letra al 160 %: nada se corta ni se encima. Ningún RF se perdió; RF-51, RF-57 y RF-63 quedaron un nivel más adentro.

### 11.4 Verificación real de la credencial INE

**Qué prueba:** que la foto es de una credencial para votar con datos legibles, coherentes entre sí y con lo que la persona registró. **Qué no prueba:** que el INE la haya emitido ni que esté vigente en la lista nominal. Eso solo lo confirma un proveedor con convenio (ver 11.5).

**En la app** (`src/features/ine/`):
- **Web** (`IneCamera.web.tsx`): cámara en vivo con `getUserMedia` y un marco de 85.6 × 54 mm. Cada 250 ms analiza el cuadro (`src/lib/frameAnalysis.ts`: brillo, reflejo, nitidez y documento en el marco) y avisa "Acerca la credencial", "Hay reflejo", "Está borrosa" o "Falta luz". Dispara sola tras ~1 s estable y recorta al marco; también se puede tomar a mano.
- **App instalada** (`IneCamera.tsx`, `expo-camera`): marco y disparo manual; la revisión es la del servidor al instante. Si la build no trae `expo-camera`, usa la cámara del sistema. Para la INE no se acepta galería.
- `IneCapture.tsx` manda cada foto a revisar y muestra "Revisando tu credencial…", luego "Credencial verificada" o el motivo con "Tomar otra vez". El registro avanza solo con frente y reverso verificados.

**En el backend** (`POST /api/ine/verificar`, pública, 30 intentos cada 15 min por IP):
1. **Calidad** con `sharp`: tamaño, brillo, reflejo y nitidez.
2. **OCR** con `tesseract.js`. Los datos de español e inglés van como paquetes, sin descargas al arrancar; una lectura tarda ~0.5 s.
3. **Frente:**
   - al menos 2 textos de la credencial (INSTITUTO NACIONAL ELECTORAL, CREDENCIAL PARA VOTAR, CURP…);
   - CURP con estructura, estado, fecha real y dígito verificador de RENAPO;
   - fecha de nacimiento de la CURP igual a la registrada;
   - iniciales de la CURP coherentes con el nombre;
   - nombre leído igual al registrado, sin acentos y tolerando errores de lectura;
   - sexo impreso igual al de la CURP.
4. **Reverso:**
   - MRZ TD1 `IDMEX` con los dígitos verificadores de documento, nacimiento, vigencia y compuesto (ICAO 9303);
   - fecha, sexo y nombre iguales a los del frente;
   - credencial vigente.
5. Si todo pasa, devuelve un **ticket** firmado (HMAC), ligado al SHA-256 de la imagen, a la CURP y al nombre y fecha registrados, que vence en 30 min. `POST /api/register` exige los dos tickets y que las imágenes subidas sean las mismas; guarda cada comprobación en `verificaciones_ine` (migración `004`).
6. Si algo falla, el motivo va en palabras sencillas y nunca se devuelven los datos de una credencial que no coincide.

**Pruebas:**
- `test/ine.test.js` (16): CURP, MRZ con el ejemplar oficial de ICAO, nombres, relleno de la MRZ, proveedor apagado e imagen de dimensiones enormes (se rechaza sin decodificar).
- `test/ine-endpoint.test.js` (13), con credenciales sintéticas generadas en la prueba: válida, foto que no es INE, borrosa, CURP alterada, fecha y nombre de otra persona, MRZ alterada, reverso de otra persona, reverso sin frente, registro sin tickets, con tickets de otras imágenes y registro correcto.
- Navegador con una cámara simulada: la foto que no es INE no dispara; el frente y el reverso se verifican solos.
- Link público: la verificación responde en ~1.5 s.
- **Falta:** probar con una INE real y en un teléfono.

### 11.5 Proveedores para validar contra la lista nominal (sin contratar nada)

| Proveedor | Lo que se encontró | API y pruebas | Precio público |
|---|---|---|---|
| Verificamex | No se encontró documentación pública en la búsqueda | — | Pedir cotización |
| Nubarium | Empresa mexicana con más de 50 servicios de identidad por API o SDK, incluida la INE | Documentación por contacto | Listado no oficial en RapidAPI: plan Pro 5,000 consultas al mes + 0.0267 USD c/u; Mega 3,483 USD al mes por 200,000. Confirmar con ellos |
| Truora | API de validaciones (`api.validations.truora.com`, encabezado `Truora-API-Key`) y colección de Postman | No confirma la INE en su documentación pública | No público |
| MetaMap | "GovChecks: Mexico INE" (`POST api.prod.metamap.com/govchecks/v1/mx/ine`) valida contra el INE | No menciona sandbox | No público |
| Didit (alternativa) | "INE vigencia" contra el registro del INE | API documentada | 0.20 USD por consulta con resultado concluyente |
| Veriff, Jumio, Incode | También validan contra la lista nominal | API y SDK | Por contrato |

El adaptador `src/services/ineProvider.js` queda apagado sin `INE_PROVIDER` e `INE_PROVIDER_KEY`. Al elegir un proveedor, hay que escribir ahí su llamada (frente, reverso, selfie y datos) y guardar el resultado con `proveedor` en `verificaciones_ine`.

### 11.6 Verificación de esta etapa

- **App:** `npx tsc --noEmit` sin errores; `npm test` 26/26 (estado del cliente, llegada estimada y análisis de cuadros).
- **Backend:** `npm test` 147/147. Los 29 parches aplican limpio sobre `main` y dejan el mismo árbol que la rama.
- **Navegador** (375 y 320 px):
  - bienvenida, login, registro, verificación del correo, panel del técnico (Nuevas y En curso con una solicitud real), inicio del cliente, pedir un servicio en 3 pasos (solicitud real creada y cancelada), mis servicios, detalle y cuenta;
  - el link público muestra todo lo nuevo.
- **Dependencias nuevas:**
  - app: `expo-camera`, `expo-auth-session`, `expo-web-browser`, `expo-apple-authentication`;
  - backend: `jose`, `sharp`, `tesseract.js`, `@tesseract.js-data/spa` y `eng`.
- **App instalada:** necesita una build nueva con EAS para tener la cámara de la INE y los inicios con Google y Apple. Las builds anteriores siguen funcionando: cargan esos módulos solo si existen.

### 11.7 Pendientes de Diego

1. Probar la verificación con tu INE real: en el link web desde el celular y después en una build nueva.
2. Elegir si se contrata un proveedor de lista nominal (11.5).
3. Credenciales de Google (Google Cloud) y, si se quiere Apple, la cuenta de Apple Developer (11.2).
4. Pasar el archivo original del logo, si existe, para reemplazar el redibujado.
5. Subir las ramas cuando lo indiques: nada de esta etapa se subió a GitHub.

### 11.8 Commits de esta etapa

**App** (`b9f838b..claude/rediseno-simple`): `b275b16` diseño · `f0238b7` plan · `87b9b2e` tokens, componentes y logo · `a8519a0` bienvenida, login, registro y verificación · `e5c803f` panel del técnico · `a4b0bac` inicio del cliente · `cb101b8` pedir servicio en 3 pasos · `f923230` mis servicios, detalle y cuenta · `60ae5c0` captura guiada de la INE · este reporte.

**Backend** (`5fdd2b3..claude/requisitos-moviles`, parches `0024`–`0029`): `9542064` inicio con Google y Apple · `5d8a574` CURP, MRZ y nombres · `be9ce4a` verificación de la INE y registro con tickets · `f52d439` fotos desde 500 px · `d644e26` rechazo de imágenes enormes · `43f5ea3` seed de cuentas de prueba (`npm run db:seed`) y guía para recrear la base en el README.
