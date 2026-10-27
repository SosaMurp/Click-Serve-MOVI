# Click & Serve móvil — diseño para cumplir la matriz de requisitos

Fecha: 2026-10-26 · Fuente de requisitos: `MATRIZFINALFINALFINALFINALPROMAXULTRAPRO1TB (1).csv` (RF-01…RF-125, RNF-01…RNF-43, RD-001…RD-016).

## 1. Objetivo y alcance

Dejar la app móvil (Expo, `Click-Serve-MOVI`) terminada, conectada a un backend real (`Click-Serve-Back`) y rediseñada, de forma que cumpla los requisitos que le corresponden:

- **RF móviles (84):** 1-10, 12, 13, 15, 16, 18-25, 43, 45-76, 79, 84-92, 94, 100-113, 122-125. El resto (11, 14, 17, 26-42, 44, 77, 78, 80-83, 93, 95-99, 114-121) es del panel de administrador y queda fuera.
- **RNF:** transversales; se cumplen en app y backend hasta donde lo permite un entorno local sin infraestructura en la nube (TLS, WAF, Redis, ELK, PostGIS quedan documentados como dependencia de despliegue).
- **RD:** se reflejan en reglas de negocio y contenido (CLABE, garantía PROFECO, LFPDPPP, retenciones, certificaciones por especialidad, NOM-001-SEDE, STPS).

Decisiones del dueño (Diego, vía coordinador): se puede cambiar app **y** backend; rediseño libre conservando el nombre "Click & Serve"; no hace falta aprobación previa del diseño; reportes solo en hitos; reporte final en `docs/REPORTE-CAMBIOS.md`.

## 2. Arquitectura

### 2.1 Backend (`Click-Serve-Back`, rama `claude/requisitos-moviles`)

`index.js` (2,300 líneas, un solo archivo) se divide en módulos sin romper ninguna ruta existente (el panel web de administrador usa `/api/login-admin`, `/api/verify-login-admin`, etc.):

```
index.js                 arranque: app + WebSocket + listen
src/app.js               express, middlewares globales, monta routers (exporta app para pruebas)
src/db/migrate.js        aplica migrations/*.sql idempotentes al arrancar
migrations/002_requisitos_moviles.sql
src/lib/*                validators (CLABE, Luhn, email), money (NUMERIC en SQL), totp, sanitize,
                         idempotency, audit, files (URLs firmadas), mailer, realtime, geo
src/middleware/*         auth (códigos AUTH_*), requireRole, requireApproved, rateLimit, maintenance
src/routes/*             auth, cuenta, solicitudes, cotizaciones, pagos, billetera, tecnicos,
                         soporte, incidencias, reprogramaciones, archivos, direcciones
test/*.test.js           node:test contra la base clickyserve_test
```

Reglas transversales:
- **Aprobación de cuenta en el servidor** (`requireApproved`): sin listas de correos maestros.
- **Dinero solo en SQL `NUMERIC(19,4)`** (RNF-37/39); la app nunca suma importes, solo muestra lo que devuelve el servidor.
- **Idempotencia** (RNF-32/33/35): cabecera `Idempotency-Key` (UUID v4) obligatoria en crear solicitud, pagar, SOS, retiro y finalizar; respuesta guardada 24 h en `idempotencia`.
- **Transacciones con bloqueo de filas** (RNF-20/22/23/24) en aceptar, pagar, finalizar, cancelar y retirar (`SELECT … FOR UPDATE`).
- **Errores de autenticación con código** (`AUTH_REQUIRED`, `AUTH_INVALID`, `AUTH_REVOKED`): la app solo cierra la sesión con esos códigos; una contraseña actual incorrecta responde 400 `PASSWORD_INCORRECT`.
- **Rate limiting** en login, 2FA, recuperación y reenvío de código (RNF-01/06); **saneamiento** de texto libre (RNF-15/06).
- **Auditoría** (`auditoria`: usuario, acción, entidad, IP, user-agent, UTC) para acciones críticas (RNF-25/27).
- **Archivos** (evidencias, adjuntos, documentos, portafolio, avatar) en tabla `archivos` (bytea) y servidos con **URL firmada HMAC de 5 min** (RNF-26).
- **Modo mantenimiento** `MAINTENANCE=1` → 503 (RNF-42).
- **Tiempo real** con WebSocket (`ws`, ruta `/ws?token=`): eventos `solicitud.actualizada`, `chat.mensaje`, `soporte.mensaje`, `tecnico.ubicacion`, `reprogramacion.*` (RNF-12/16/17). La app cae a sondeo si el socket no conecta.
- **Secretos fuera del código**: SMTP, JWT, Conekta, Twilio por variables de entorno. Sin SMTP/Twilio configurados, los códigos se imprimen en la consola del servidor (solo desarrollo).

### 2.2 Ciclo de vida de una solicitud

```
PENDIENTE ──(técnico acepta)──► ASIGNADA ──► EN_CAMINO ──(llegué)──► EN_SITIO
   ▲  │                            │             │                     │
   │  └─(cliente cancela)─► CANCELADA ◄─(cliente/técnico cancela)──────┤
   │                                                                   ▼
   └──(técnico abandona / reasignación)◄── SUSPENDIDA ◄─(incidencia)── COTIZADA ⇄ EN_PROCESO
                                                                        │  (cliente aprueba)
                                                                        ▼
                                              POR_CONFIRMAR (técnico finaliza con evidencia)
                                                                        │ cliente: "ENVIAR Y FINALIZAR"
                                                                        ▼
                                                     FINALIZADA (pago capturado, billetera acreditada)
```

Estados nuevos: `EN_SITIO` (RF-60), `COTIZADA` (sustituye a `ESPERANDO_APROBACION`, que se conserva como alias de lectura), `POR_CONFIRMAR` (RF-53/54/69/70), `SUSPENDIDA` (RF-110). El catálogo `estados_solicitud` y el CHECK se actualizan en la migración.

- **Descartar** (RF-58): `solicitudes_descartadas(id_solicitud, id_tecnico)`; la solicitud sigue PENDIENTE para los demás.
- **Técnico preferido** (RF-48/49): `solicitudes_servicio.id_tecnico_propuesto`; solo ese técnico la ve durante 10 min, después pasa a la bolsa general. "Búsqueda automática" (RF-47) deja la solicitud en la bolsa ordenada por cercanía, especialidad y disponibilidad (RD-010).
- **Cancelación** del cliente (RF-51/57) sin cargo antes de `EN_PROCESO`; del técnico en ruta (RF-61) → vuelve a PENDIENTE para reasignación y se avisa al cliente.
- **Incidencia** (RF-56/109/110): crea `incidencias` (folio `INC-…`), pone la orden en SUSPENDIDA; el cliente resuelve con **reasignar** (RF-55, vuelve a PENDIENTE sin técnico) o **cancelar sin cargo** (RF-57).
- **Reprogramación** (RF-63/64/124/125): `reprogramaciones` (propuesta → aceptada/rechazada/contrapropuesta).
- **Cotización con conceptos** (RF-72/62): `cotizaciones_servicio` + `conceptos_cotizacion` (MANO_OBRA, MATERIAL, EXTRA); los extras añadidos durante el trabajo se muestran al cliente en "Confirmar servicio".
- **Tareas** (RF-62): `tareas_servicio`; plantillas por categoría con puntos NOM-001-SEDE (RD-015) y protocolo STPS (RD-016).
- **Evidencias** (RF-65): multipart, mínimo 1 foto para finalizar.
- **Pago** (RF-69/70, RNF-02): solo al pulsar "ENVIAR Y FINALIZAR"; el servidor calcula el total desde la cotización aprobada y cobra con el token de la tarjeta guardada.
- **Liquidación al técnico** (RD-013): total − comisión Click & Serve (10 %) − retención ISR (2.1 % de la base sin IVA) − retención IVA (8 % de la base). Desglose visible en el resumen de cobro.
- **Garantía** (RD-012): 90 días desde `fecha_finalizacion`; reclamarla abre una incidencia tipo GARANTIA.

### 2.3 Pagos y tarjetas (RNF-02, RF-66/67/68)

La app nunca envía PAN ni CVV al backend. Con `EXPO_PUBLIC_CONEKTA_PUBLIC_KEY` la app tokeniza directo contra Conekta; sin llave (desarrollo) usa los **tokens de prueba oficiales de Conekta** (`tok_test_visa_4242`, `tok_test_mastercard_4444`, `tok_test_card_declined`…), según el número de prueba capturado. El backend guarda `token`, `marca`, `ultimos_4`, `expiracion`, `predeterminada`. Con `CONEKTA_PRIVATE_KEY` cobra de verdad; sin ella registra un cargo de sandbox marcado `modo='SANDBOX'`. Luhn y fecha se validan en la interfaz (RNF-29).

### 2.4 App (`Click-Serve-MOVI`, rama `claude/project-thread-9in69s`)

```
app/_layout.tsx                proveedores + Stack con rutas protegidas por rol (Stack.Protected)
app/(auth)/…                   login, registro, verificación, 2FA, recuperación, legales
app/(cliente)/…                pantallas del cliente
app/(tecnico)/…                pantallas del técnico
app/(comun)/…                  cuenta, seguridad, sesiones, soporte, ayuda, chat, comprobantes
src/design/…                   tokens, tipografía, componentes base
src/api/…                      cliente HTTP, endpoints por dominio, tipos
src/state/…                    sesión, tiempo real, conectividad, disponibilidad
src/lib/…                      validadores, formato, idempotencia, permisos
src/features/<dominio>/…       componentes propios de cada flujo
```

- **Diálogos y avisos** propios (`dialog.alert/confirm/prompt`, `toast`) que funcionan igual en web y nativo; se elimina todo `Alert.alert`.
- **Sesión**: token en `expo-secure-store` (nativo) y `localStorage` (web, documentado); al cerrar sesión se borra todo dato local (RNF-09/10).
- **Rutas protegidas** (RF-02): sin sesión → acceso; cliente → `(cliente)`; técnico → `(tecnico)`; la app abre en el panel si hay sesión válida.
- **Conectividad** (RNF-19/28): banner cuando el servidor no responde y bloqueo de acciones de red; indicador de carga en toda acción.
- **Mapa** multiplataforma: Leaflet + OpenStreetMap en `WebView` (nativo) y en `iframe` (web), con datos enviados como JSON por `postMessage` (sin interpolar texto: corrige el XSS de `SafeMapWrapper`).
- **Imágenes** comprimidas antes de subir (RNF-13); objetivos táctiles ≥ 48 dp y háptica tras confirmación del servidor (RNF-30).

## 3. Diseño visual

Lo define la skill de diseño de interfaces (impeccable) en la fase de sistema de diseño: tokens de color, tipografía, espaciado, radios, elevación y estados; componentes `Screen`, `AppBar`, `Button`, `IconButton`, `TextField`, `OtpField`, `Card`, `ListItem`, `StatusPill`, `Badge`, `Avatar`, `EmptyState`, `Skeleton`, `BottomTabs`, `Sheet`, `Segmented`, `Stepper`, `MoneyText`, `RatingStars`, `DateField` (calendario propio, RF-19), `MapView`. Código cromático por estado de solicitud (RNF-31); SOS siempre en la capa superior.

## 4. Trazabilidad requisito → implementación

| Requisito | Dónde se cumple |
|---|---|
| RF-01 cerrar sesión global | `AccountMenu` en cliente y técnico → `POST /api/logout`, limpieza local |
| RF-02 sesión y redirección por rol | `app/_layout.tsx` rutas protegidas, arranque con sesión |
| RF-03, RF-05 registro / ya tengo cuenta | Login ↔ Registro |
| RF-04, RF-10 recuperación con canal SMS/Email | `request-recovery` con selector de canal → `POST /api/request-recovery {canal}` |
| RF-06, RF-07, RF-08 confirmación, validación y reenvío | Registro → Verificación (`OtpField` autoverifica, RNF-18) |
| RF-09, RF-15 cambio de contraseña | `change-password` → revoca otras sesiones |
| RF-12 sesiones activas / desvincular | `security/sessions` |
| RF-13 seguridad de cuenta | `security`: 2FA TOTP (RNF-04), biometría, sesiones |
| RF-16 eliminación con contraseña | `delete-account` → `DELETE /api/cuenta {password}` (anonimiza) |
| RF-18 rol CLIENTE/TÉCNICO | Registro `Segmented` |
| RF-19 calendario fecha de nacimiento | `DateField` |
| RF-20 perfil del técnico con métricas | `TechProfileSheet` (cliente) → `GET /api/tecnicos/:id/perfil` |
| RF-21 disponibilidad + heartbeat | Interruptor ONLINE → `PUT /api/tecnico/disponibilidad`, heartbeat (RNF-34) |
| RF-22 foto profesional | `tech/profile` → `PUT /api/usuarios/avatar` (multipart) |
| RF-23 alertas por categoría | `tech/specialties` interruptores |
| RF-24 habilidades y portafolio | `tech/specialties` + `tech/portfolio` |
| RF-25 carga secuencial de documentos | `tech/verification` (INE, cédula SEP, certificaciones RD-001/003/005/007) |
| RF-43 calificación bidireccional | Cliente califica técnico; técnico califica cliente |
| RF-45, RF-46 iniciar solicitud y detalles | Home → `request/new` (categoría, descripción, fotos, dirección, fecha) |
| RF-47, RF-48, RF-49 búsqueda automática / recomendados / confirmar | `request/choose-tech` |
| RF-50, RF-92 base de conocimientos | `help` artículos (pagos, validaciones, penalizaciones, garantía) |
| RF-51 abortar búsqueda | `request/searching` → cancelar |
| RF-52 seguimiento en vivo | `order/[id]` mapa con ubicación del técnico (WebSocket) y ETA aproximada |
| RF-53, RF-54, RF-69, RF-70 confirmar servicio y pago | `order/[id]/confirm` → "ENVIAR Y FINALIZAR" |
| RF-55, RF-56, RF-57 reasignar / no se presentó / cancelar sin cargo | `order/[id]/incident` → `resolution` |
| RF-58 aceptar / descartar | Panel técnico NUEVAS |
| RF-59 resumen de servicio | `job/[id]` |
| RF-60 llegada | `job/[id]` "LLEGUÉ" → EN_SITIO |
| RF-61 abortar en ruta | `job/[id]` cancelar con motivo |
| RF-62 tareas e imprevistos | `job/[id]` checklist + conceptos extra |
| RF-63, RF-64, RF-124, RF-125 reprogramación | `reschedule` (técnico propone, cliente acepta/rechaza/contrapropone) |
| RF-65 evidencias (AGREGAR, lupa) | `job/[id]/evidence` + visor |
| RF-66, RF-67, RF-68 tarjetas | `payment-methods`, `add-card` (token), predeterminada |
| RF-71, RF-74 CLABE | `tech/bank-account` "GUARDAR NUEVA CUENTA", banco por prefijo, dígito verificador (RD-014) |
| RF-72 conceptos adicionales | Cotización "+ AGREGAR OTRO CONCEPTO" |
| RF-73, RF-75, RF-76, RF-79 billetera, movimientos, retiro, comprobante | `tech/wallet`, `tech/movements`, `tech/withdraw`, `receipt/[id]` |
| RF-84 cancelar sin guardar | `AppBar` atrás con confirmación de descarte |
| RF-85, RF-89 guardar perfil y preferencias | `account` → `PUT /api/usuarios/perfil`, `PUT /api/usuarios/preferencias` |
| RF-86, RF-87, RF-91 avatar → cuenta, módulos, ajustes | Avatar de la cabecera → `account` |
| RF-88, RF-90 correo, llamada | `support` (mailto/tel), tarjeta del cliente (tel:) |
| RF-94 ticket / imprimir folio | `support/new-ticket`, `order/[id]/receipt` (compartir/imprimir) |
| RF-100 SOS | Botón SOS en servicio activo (idempotente, comparte GPS) |
| RF-101, RF-102, RF-103, RF-105 direcciones | `addresses`, `address/[id]` con mapa, recentrar, predeterminada, borrar |
| RF-104 guía satelital | "NAVEGAR" → Google Maps |
| RF-106 mapa de solicitudes | Panel técnico vista mapa |
| RF-107, RF-108 soporte en tiempo real con adjuntos | `support/chat/[id]` |
| RF-109, RF-110 reportar incidencia y suspender | `order/[id]/incident` |
| RF-111 panel abre en NUEVAS | Panel técnico |
| RF-112 chat con el solicitante | `chat/[id]` (adjuntos, RF-108) |
| RF-113 escalación crítica | Botón "Escalar" en chats → incidencia ALTA + SOS |
| RF-122, RF-123 agenda e historial | `agenda` (pendientes / finalizados / cancelados) con detalle |
| RNF-01/06 | bcrypt, mensajes genéricos, rate limit, saneamiento |
| RNF-02 | Tokenización, sin PAN/CVV en backend |
| RNF-04/18 | TOTP RFC 6238 ±30 s, 3 intentos, reto de 3 min, autoverificación |
| RNF-09/10 | CLABE enmascarada en servidor, limpieza local al salir, revocación de sesión |
| RNF-12/16/17 | WebSocket |
| RNF-13 | Compresión de imágenes |
| RNF-19/28 | Banner de conexión, bloqueo de acciones |
| RNF-20/22/23/24 | Transacciones y bloqueos |
| RNF-25/27/41 | Tabla de auditoría |
| RNF-26 | URLs firmadas 5 min |
| RNF-29 | Validación en tiempo real (Luhn, CLABE, correo, contraseña) |
| RNF-30/31 | Táctiles 48 dp, háptica, color por estado, SOS prioritario |
| RNF-32/33/35 | Idempotencia |
| RNF-34 | Heartbeat |
| RNF-36 | Timeout 5 s en SEP, biometría y Conekta |
| RNF-37/39 | Cálculo monetario en SQL |
| RNF-42 | Modo mantenimiento |
| RNF-43 | GPS cada 3 s en ruta, ETA aproximada |
| RD-010 | Orden por cercanía, especialidad, disponibilidad |
| RD-011 | Aviso de privacidad, consentimiento, derechos ARCO |
| RD-012 | Garantía 90 días |
| RD-013 | Retenciones en la liquidación |
| RD-014 | CLABE 18 dígitos + dígito verificador |
| RD-015/016 | Plantillas de tareas NOM-001-SEDE y STPS |

## 5. Fuera de alcance / dependencias de despliegue

TLS 1.3, WAF, Redis, ELK/WORM, PostGIS y uptime 99.9 % (RNF-03/05/07/09/14/15/19/25/38/41) requieren infraestructura; el código queda preparado (HTTPS por defecto en producción, auditoría en tabla, cálculo geográfico en SQL) y se documenta en el reporte. Notificaciones push reales requieren build nativo con EAS. El servicio biométrico Python debe estar levantado para que la comparación facial funcione; si no responde en 5 s, la app informa "Servicio no disponible" en lugar de aprobar.
