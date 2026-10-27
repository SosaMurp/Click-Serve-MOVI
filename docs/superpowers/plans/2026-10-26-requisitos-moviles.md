# Click & Serve móvil — plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cumplir los 84 RF móviles, los RNF y RD aplicables, con backend real y una app rediseñada.

**Architecture:** Backend Express modular (routers + migración SQL idempotente + WebSocket) que conserva todas las rutas existentes; app Expo Router reorganizada por rol con sistema de diseño propio, cliente HTTP con idempotencia y sesión segura.

**Tech Stack:** Node 24, Express 5, pg, ws, bcrypt, jsonwebtoken, multer, node:test · Expo SDK 57, expo-router, React 19, RN 0.86, expo-secure-store, expo-image-picker, expo-image-manipulator, expo-location, expo-haptics, react-native-webview, react-native-svg.

**Spec:** `docs/superpowers/specs/2026-10-26-requisitos-moviles-design.md`

**Ejecución elegida:** nativa (yo implemento todo), con revisión final de seguridad y calidad; el dueño pidió solo reportes en hitos.

## Global Constraints

- No commitear `.env`, `node_modules`, `metro.config.js` ni `web-stubs` (salvo que el stub se vuelva intencional y documentado), ni `scripts/local-*` del backend.
- App: commits por etapa en `claude/project-thread-9in69s`. Backend: commits en `claude/requisitos-moviles` + `git format-patch` en `Click-Serve-Back/parches/`.
- Todas las rutas actuales del backend siguen respondiendo con el mismo contrato (el panel de administrador las usa).
- Importes: `NUMERIC(19,4)` en SQL; la app solo formatea cadenas que devuelve el servidor.
- Idempotencia obligatoria (`Idempotency-Key` UUID v4) en: crear solicitud, pagar, SOS, retiro, finalizar.
- Ningún `Alert.alert` en la app; ningún dato inventado (sin fallbacks a técnicos, órdenes ni montos falsos).
- Textos de interfaz en español de México; nombre de marca "Click & Serve".
- Leer la documentación versionada de Expo v57 antes de usar una API de Expo (AGENTS.md del repo).

## Review Focus

1. Sesión expirada o revocada a mitad de un flujo → la app vuelve al acceso sin perder la navegación en bucle; un 401 de negocio (contraseña actual incorrecta) no cierra la sesión.
2. Doble toque en "ENVIAR Y FINALIZAR", SOS o "RETIRAR" con red lenta → un solo cobro, una sola alerta, un solo retiro.
3. Dos técnicos aceptan la misma solicitud al mismo tiempo → solo uno la obtiene; el otro ve "ya no está disponible".
4. Servidor caído → banner visible, acciones bloqueadas, sin datos falsos en pantalla.
5. Cuenta pendiente de aprobación → el servidor rechaza crear/aceptar/cotizar (403 `ACCOUNT_PENDING`) aunque la app se modifique.

---

## Fase A — Backend

### Task A1: Estructura modular, migración y arnés de pruebas

**Files:** Create `src/app.js`, `src/db/migrate.js`, `migrations/002_requisitos_moviles.sql`, `src/lib/{http,sanitize,audit,idempotency,files,mailer,validators,totp,geo,realtime}.js`, `src/middleware/{auth,roles,rateLimit,maintenance}.js`, `test/helpers.js`, `test/*.test.js`; Modify `index.js` (arranque), `middleware/authMiddleware.js` (reexporta `src/middleware/auth`), `package.json` (scripts `test`, `db:migrate`; dep `ws`).

**Interfaces (Produces):**
- `createApp(): express.Application` (sin listen) · `start(port)` en `index.js` con WebSocket en `/ws`.
- `auth` middleware → `req.user = { id_usuario, id_rol, sessionId, correo, estado_cuenta, identidad_verificada, aprobado }`; errores `401 {code:'AUTH_REQUIRED'|'AUTH_INVALID'|'AUTH_REVOKED'}`.
- `requireRole(...roles)` → 403 `{code:'ROLE_FORBIDDEN'}` · `requireApproved` → 403 `{code:'ACCOUNT_PENDING'}`.
- `idempotent(scope)` middleware: exige `Idempotency-Key` UUID v4, reproduce respuesta guardada 24 h (`idempotencia(clave, id_usuario, alcance, status, cuerpo, creado)`).
- `audit(req, accion, entidad, idEntidad, detalle)`; `signFileUrl(idArchivo): string` / ruta `GET /api/archivos/:id?exp&sig`.
- `validators`: `isValidClabe(s)`, `bankFromClabe(s)`, `luhn(s)`, `isEmail(s)`, `isStrongPassword(s)`.
- `totp`: `generateSecret()`, `verifyTotp(secret, code, window=1)`, `otpauthUri(secret, email)`.
- `realtime.emitToUser(idUsuario, evento, datos)`.
- Migración: tablas `idempotencia`, `auditoria`, `archivos`, `solicitudes_descartadas`, `conceptos_cotizacion`, `tareas_servicio`, `evidencias` (archivo), `incidencias`, `reprogramaciones`, `soporte_tickets`, `soporte_mensajes`, `portafolio_tecnico`, `documentos_tecnico`, `retos_2fa`; columnas nuevas en `usuarios` (`disponible`, `ultimo_latido`, `preferencias JSONB`, `totp_secreto`, `foto_archivo`, `anonimizado`), `solicitudes_servicio` (`id_tecnico_propuesto`, `propuesto_hasta`, `fecha_finalizacion`, `motivo_cancelacion`, `cancelado_por`, `monto_total NUMERIC(19,4)`, `modo_pago`, `alerta_sos`, `latitud_sos`, `longitud_sos`, `fecha_sos`), `metodos_pago` (`token`, `marca`, `predeterminada`), `transacciones` (`folio`, `concepto`, `id_solicitud`, `desglose JSONB`), `mensajes_chat` (`id_archivo`); estados `EN_SITIO`, `COTIZADA`, `POR_CONFIRMAR`, `SUSPENDIDA`.

- [ ] Prueba `test/auth.test.js`: token ausente → 401 `AUTH_REQUIRED`; sesión revocada → 401 `AUTH_REVOKED`.
- [ ] Prueba `test/validators.test.js`: CLABE `002010077777777771` válida, `002010077777777770` inválida; Luhn `4242424242424242` válido.
- [ ] Prueba `test/idempotency.test.js`: misma clave dos veces → mismo cuerpo, un solo efecto.
- [ ] Implementar, migrar `clickyserve_test`, `npm test` en verde, commit.

### Task A2: Autenticación y cuenta

Rutas existentes se conservan (`/api/login`, `/api/register`, `/api/verify-token`, `/api/resend-code`, `/api/request-recovery {canal}`, `/api/verify-recovery`, `/api/reset-password`, `/api/update-password`, `/api/logout`, `/api/auth/sessions*`, `/api/login-admin`, `/api/verify-login-admin`, `/api/check-session`). Nuevas/cambiadas:
- `POST /api/login` → si 2FA: `{requires2FA:true, reto}` (reto 3 min, 3 intentos) · `POST /api/login/verify-2fa {reto, codigo}` TOTP.
- `POST /api/usuarios/2fa/iniciar` → `{secreto, otpauth}` · `POST /api/usuarios/2fa/confirmar {codigo}` · `DELETE /api/usuarios/2fa {codigo}`.
- `GET /api/me` (perfil completo) · `PUT /api/usuarios/perfil` · `PUT /api/usuarios/preferencias` · `PUT /api/usuarios/avatar` (multipart).
- `DELETE /api/cuenta {password}` anonimiza (RF-16, LFPDPPP) · `GET /api/cuenta/exportar` (ARCO).
- `POST /api/update-password` contraseña actual incorrecta → 400 `PASSWORD_INCORRECT`.
- Registro: valida contraseña fuerte, edad ≥ 18, consentimiento de privacidad; INE y rostro como archivos.

- [ ] Pruebas: 2FA tres intentos fallidos invalidan el reto; eliminar cuenta sin contraseña → 400; contraseña incorrecta en cambio → 400 (no 401).
- [ ] Implementar, pruebas en verde, commit.

### Task A3: Solicitudes, cotización, ejecución y cierre

- `POST /api/solicitudes` (multipart, idempotente) · `GET /api/solicitudes/cliente` · `GET /api/solicitudes/:id` (cliente o técnico asignado; PII del cliente oculta para técnicos no asignados, RNF-03).
- `GET /api/solicitudes/tecnico?vista=nuevas|en_curso|historial` (NUEVAS ordenadas por distancia, excluye descartadas; incluye `distancia_km`).
- `GET /api/tecnicos/recomendados?id_solicitud=` · `POST /api/solicitudes/:id/proponer-tecnico {id_tecnico}` · `POST /api/solicitudes/:id/busqueda-automatica`.
- `POST /api/solicitudes/:id/aceptar` (FOR UPDATE) · `POST /api/solicitudes/:id/descartar`.
- `PATCH /api/solicitudes/:id/estado {estado: EN_CAMINO|EN_SITIO|EN_PROCESO}` · `POST /api/solicitudes/:id/cotizar {conceptos:[{tipo,descripcion,monto}], detalles, minutos}` · `PATCH /api/solicitudes/:id/responder-cotizacion {respuesta}` · `POST /api/solicitudes/:id/conceptos` (extra) · `GET|POST|PATCH /api/solicitudes/:id/tareas`.
- `POST /api/solicitudes/:id/evidencias` (multipart) · `POST /api/solicitudes/:id/finalizar` (idempotente; exige ≥1 evidencia) → POR_CONFIRMAR.
- `POST /api/solicitudes/:id/confirmar {id_metodo, calificacion, comentario}` (idempotente): cobra, FINALIZADA, acredita billetera con desglose RD-013 → `{solicitud, pago, transaccion}`.
- `POST /api/solicitudes/:id/cancelar {motivo}` (cliente o técnico; reglas del spec §2.2).
- `POST /api/solicitudes/:id/calificar` (cliente→técnico, se conserva) · `POST /api/solicitudes/:id/calificar-cliente` (técnico→cliente).
- `POST /api/solicitudes/:id/sos` (idempotente) · `POST /api/solicitudes/:id/incidencias {tipo, descripcion}` → SUSPENDIDA · `POST /api/incidencias/:id/resolver {accion: REASIGNAR|CANCELAR}`.
- `POST /api/solicitudes/:id/reprogramaciones {fecha, hora, motivo}` · `PATCH /api/reprogramaciones/:id {respuesta: ACEPTAR|RECHAZAR, contrapropuesta?}`.
- Chat: `GET|POST /api/solicitudes/:id/chat` (POST acepta multipart con `adjunto`).
- Rutas viejas `/api/solicitudes/:id/aceptar` (PUT), `/api/cotizaciones`, `/api/pagos/checkout`, `/api/solicitudes/:id/estado` con ASIGNADA/CANCELADA se mantienen como alias que delegan en la lógica nueva.

- [ ] Pruebas: aceptación concurrente (solo uno gana); descartar no oculta a otros; finalizar sin evidencia → 400; confirmar dos veces con la misma clave → un cobro; cliente pendiente → 403 `ACCOUNT_PENDING`; liquidación con total 1160.00 → neto técnico calculado en SQL.
- [ ] Implementar, pruebas en verde, commit.

### Task A4: Pagos, billetera y técnico

- `GET|POST|DELETE /api/metodos-pago` (token, sin PAN/CVV; rechaza `numero_tarjeta`/`cvv` con 400) · `PATCH /api/metodos-pago/:id/predeterminada`.
- `GET /api/billetera` (CLABE enmascarada) · `PUT /api/billetera/clabe {clabe}` (dígito verificador, banco) · `GET /api/billetera/movimientos` · `GET /api/billetera/movimientos/:id` (comprobante `TRX-…`) · `POST /api/billetera/retiro` (idempotente, mínimo $100).
- `PUT /api/tecnico/disponibilidad {disponible}` · `POST /api/tecnico/latido` · `GET /api/tecnico/resumen` (ganancias semana, servicios, calificación, contadores) · `GET /api/tecnicos/:id/perfil` · `GET|POST|DELETE /api/tecnico/portafolio` · `GET|POST /api/tecnico/documentos` · `POST /api/tecnicos/validar-cedula` (timeout 5 s, sin aprobar por formato).
- `PUT /api/usuarios/ubicacion` emite `tecnico.ubicacion` al cliente de su servicio activo.

- [ ] Pruebas: CLABE inválida → 400; retiro mayor al saldo → 400; enviar `cvv` → 400; técnico sin latido en 60 s no aparece en recomendados.
- [ ] Implementar, pruebas en verde, commit.

### Task A5: Soporte, direcciones y tiempo real

- `GET|POST /api/soporte/tickets` (folio `TCK-…`) · `GET|POST /api/soporte/tickets/:id/mensajes` (multipart) · `POST /api/soporte/tickets/:id/escalar`.
- Direcciones: `PUT` corrige la columna `id` inexistente; `PATCH /api/direcciones/:id/predeterminada`; latitud/longitud.
- WebSocket `/ws?token=` con autenticación igual que `auth`; eventos del spec §2.1.

- [ ] Pruebas: un usuario no puede leer el ticket de otro (403); editar dirección de otro usuario → 404.
- [ ] Implementar, pruebas en verde, commit backend + format-patch parcial.

## Fase B — Fundaciones de la app

### Task B1: Sistema de diseño (skill de diseño de interfaces)

**Files:** `src/design/tokens.ts`, `src/design/typography.ts`, `src/design/components/*.tsx`, `src/design/index.ts`; fuentes vía `@expo-google-fonts/*`.
**Produces:** componentes del spec §3 con props tipadas; `useTheme()`.
- [ ] Definir dirección visual con la skill, implementar tokens y componentes, pantalla de muestra temporal verificada en web, commit.

### Task B2: Infraestructura

**Files:** `src/api/client.ts` (fetch con timeout 15 s, `Idempotency-Key`, códigos de error, evento de conectividad), `src/api/*.ts` (un módulo por dominio con tipos), `src/state/session.tsx` (secure-store/localStorage, `/api/me`), `src/state/realtime.tsx` (WebSocket + suscripción + reintento), `src/state/connectivity.tsx`, `src/ui/dialog.tsx` + `src/ui/toast.tsx`, `src/lib/{validators,format,idempotency,images,haptics}.ts`, `src/features/map/MapView.{native,web}.tsx` + `leafletHtml.ts`, `app/_layout.tsx` con `Stack.Protected`.
- [ ] Pruebas `node --test src/lib/*.test.ts`: validadores (CLABE, Luhn, correo, contraseña), formato de dinero desde cadena, fecha DD/MM/AAAA.
- [ ] Implementar, verificar arranque con sesión y redirección por rol en web, commit.

## Fase C — Flujos (cada uno: pantallas rediseñadas + API real + verificación en web + commit)

- **C1 Acceso:** login, registro (rol, calendario, INE/rostro con cámara o galería, consentimiento), verificación, 2FA, recuperación con canal, aviso de privacidad, términos.
- **C2 Cliente — solicitar:** home, nueva solicitud, elegir técnico / búsqueda automática / perfil del técnico, buscando (cancelar), seguimiento en vivo, cotización, chat con adjuntos y escalación, SOS.
- **C3 Cliente — cierre:** confirmar servicio + pago + calificación, comprobante/folio, incidencia, resolución, reprogramación, agenda e historial, garantía.
- **C4 Cuenta común:** cuenta y datos, preferencias, seguridad (2FA, sesiones, cambiar contraseña, biometría), direcciones con mapa, métodos de pago, soporte (tickets, chat, correo/llamada), ayuda, eliminar cuenta, exportar datos.
- **C5 Técnico — trabajo:** panel (NUEVAS por defecto, contadores, lista/mapa), detalle y aceptar/descartar, servicio activo (en camino con GPS, llegué, tareas, cotización con conceptos, extras, evidencias con visor, finalizar, cancelar, reprogramar, SOS, llamar), calificar cliente.
- **C6 Técnico — perfil y finanzas:** disponibilidad, perfil y foto, especialidades/alertas, portafolio, verificación de documentos y cédula, billetera, movimientos, comprobante, retiro, CLABE.
- **C7 Limpieza:** borrar pantallas huérfanas/duplicadas y `components/` antiguos sin uso; `web-stubs` documentado o eliminado.

## Fase D — Verificación y entrega

- [ ] Recorrido completo en web con las dos cuentas (pedir → aceptar → en camino → llegué → cotizar → aprobar → evidencias → finalizar → confirmar y pagar → calificaciones → billetera → retiro), más cancelaciones, incidencia, reprogramación, soporte.
- [ ] Revisión de seguridad (securitymaxxing) y de calidad (code-review) sobre ambos repos; corregir hallazgos.
- [ ] `docs/REPORTE-CAMBIOS.md` con matriz RF/RNF/RD → estado final; `git format-patch` del backend en `parches/`; push de la app solo con permiso de Diego.
