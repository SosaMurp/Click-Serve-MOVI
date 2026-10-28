# Rediseño, cliente sencillo e INE — plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplicar el lenguaje visual de las referencias de Diego, simplificar las pantallas del cliente con los principios de CILIM y verificar de verdad la credencial INE al tomar la foto.

**Architecture:** El estilo vive en `src/design` (tokens y componentes), así que la parte 1 cambia ahí y luego rehace las seis pantallas de la referencia. La parte 2 reorganiza solo `app/(cliente)/**` con una variante de tamaño cómodo. La parte 3 agrega una captura guiada en la app (web: análisis de cuadros; celular: expo-camera) y un endpoint del backend que hace OCR, valida CURP y MRZ y emite un ticket firmado que el registro exige.

**Tech Stack:** Expo SDK 57 / React Native 0.86 / expo-router; Node 24 + Express 5 + PostgreSQL; nuevas dependencias: `expo-camera`, `expo-auth-session`, `expo-apple-authentication` (app); `tesseract.js`, `sharp`, `jose` (backend).

**Spec:** `docs/superpowers/specs/2026-10-27-rediseno-cliente-simple-ine-design.md`

## Global Constraints

- Docs de Expo v57 (`https://docs.expo.dev/versions/v57.0.0/`) antes de usar cualquier API de Expo (AGENTS.md).
- Marino `#0C1C40`, naranja `#FF6B00` (logo `#F1630F`), fondo `#FFFFFF`, paneles `#F7F8F9`, radio de campo y botón 12, de tarjeta 16, tipografía Inter.
- Texto blanco sobre naranja solo en negrita de 16 px o más.
- Cliente: cuerpo 18 px, botones 56 dp, una acción principal por pantalla, botón Regresar siempre visible.
- No se pierde ningún RF/RNF de `docs/REPORTE-CAMBIOS.md`; lo que sale de la vista principal queda en un segundo nivel.
- El código de verificación tiene los dígitos del backend (6) y se verifica al teclear el último (RNF-18).
- Google/Apple: el botón solo aparece con su variable configurada; sin variables el backend responde 404 `PROVIDER_DISABLED`.
- INE: sin galería; la verificación del servidor es la única que cuenta; el ticket vence en 30 min y está ligado al SHA-256 de la imagen.
- Commits por etapa en `claude/rediseno-simple` (app) y `claude/requisitos-moviles` (backend), sin push.
- Al cerrar cada parte: `npx tsc --noEmit`, `npm test` en la app y en el backend, `demo-web` recompilado y avance a Diego.

## Review Focus

- Una persona sube la foto de otra credencial (licencia, pasaporte) o de una pantalla: el frente debe fallar por textos clave y CURP, y decir "No reconocimos una credencial del INE".
- La foto de la INE es legible pero de otra persona: debe fallar por fecha de nacimiento o nombre, sin revelar los datos de la credencial.
- El cliente salta la verificación llamando a `/api/register` directo o con el ticket de otra imagen: 400 con mensaje claro.
- La cámara no tiene permiso o el navegador no tiene `getUserMedia` (HTTP sin TLS): mensaje con qué hacer, sin pantalla negra.
- Letra grande del sistema (escala 1.6) en las pantallas del cliente: nada se corta ni se encima a 320 px de ancho.

---

## Parte 1 · Lenguaje visual

### Task 1: Tokens y componentes base

**Files:**
- Modify: `src/design/tokens.ts`, `Text.tsx`, `Button.tsx`, `TextField.tsx`, `Controls.tsx`, `Surface.tsx`, `Plate.tsx`, `OtpField.tsx`, `NavigationBar.tsx`, `AppBar.tsx`, `Screen.tsx`, `Brand.tsx`, `index.ts`
- Modify: `app/_layout.tsx` (fuentes: quitar Outfit si ya no se usa)

**Interfaces:**
- Produces: `color.brand = '#0C1C40'`, `color.accent = '#FF6B00'`, `color.ground = '#FFFFFF'`, `color.panel = '#F7F8F9'`; `radius.field = 12`, `radius.card = 16`; `Button` variantes `'primary' | 'accent' | 'outlined' | 'text' | 'danger' | 'success' | 'white'` (antes `primary` era naranja: los usos de naranja pasan a `accent`); `Tabs<T>({ options, value, onChange })` (pestañas de texto con subrayado naranja); `Segmented` con segmentos rellenos marino; `OtpField` con `onChange?: (code: string) => void`; `Pill` acepta `tone="success"` para ONLINE; `LogoMark({ size })` nuevo (flecha con llave); `Field label` en mayúsculas.

- [ ] **Step 1:** Cambiar tokens según la tabla de la spec; `type.overline` = Inter Bold 12/16, mayúsculas, `letterSpacing: 0.6`; títulos Inter Bold.
- [ ] **Step 2:** Rehacer `Button` (radio 12, alto 52 `md` / 56 `lg`, texto MAYÚSCULAS negrita) y migrar usos: `grep -rn 'variant="filled"\|<Button' app src` → los botones que eran naranja usan `variant="accent"`, los azules `primary`.
- [ ] **Step 3:** `TextField` (etiqueta overline marino, borde `#D9DDE3`, foco marino, fondo blanco), `Surface` (radio 16, borde y sombra suave, sin tintas pastel), `NavigationBar` (activo naranja), `AppBar`/`HomeHeader` sobre blanco, `Screen` fondo blanco, `Banner` y `EmptyState` sin pastel fuerte.
- [ ] **Step 4:** `LogoMark` SVG nuevo y `Wordmark` "Click & Serve" Inter Bold marino; generar `assets/icon.png` (1024), `android-icon-foreground.png`, `splash-icon.png`, `favicon.png` desde el mismo SVG.
- [ ] **Step 5:** Verificar: `npx tsc --noEmit` sin errores; `npm test` verde; en el navegador (375 px) login y una pantalla de cada rol se ven con el estilo nuevo.
- [ ] **Step 6:** Commit `feat(diseño): tokens, componentes y logo según las referencias`.

### Task 2: Bienvenida, login, crear cuenta y verificar correo

**Files:**
- Create: `app/(auth)/bienvenida.tsx`, `src/features/auth/SocialButtons.tsx`, `src/features/auth/social.ts`
- Modify: `app/index.tsx` (sin sesión → `/bienvenida`), `app/(auth)/login.tsx`, `app/(auth)/registro.tsx`, `src/features/auth/CodeScreen.tsx`, `app/(auth)/verificar.tsx`, `src/features/auth/AuthHeader.tsx`, `src/api/endpoints.ts`
- Backend: Create `src/routes/social.js`, `src/lib/oidc.js`, `test/social.test.js`; Modify `src/app.js`, `.env.example`, `package.json` (`jose`)

**Interfaces:**
- Produces (app): `socialConfig(): { google: boolean; apple: boolean }` en `social.ts`; `authApi.google(idToken)` y `authApi.apple(identityToken, nombre?)` → `{ token, usuario } | { requiere_registro: true, nombre, apellidos, email }`.
- Produces (backend): `verifyGoogleIdToken(token): Promise<{ email, email_verified, given_name, family_name }>` y `verifyAppleIdToken(token)`; rutas `POST /api/auth/google`, `POST /api/auth/apple`.

- [ ] **Step 1 (backend, test):** `test/social.test.js`: sin `GOOGLE_CLIENT_IDS` → `POST /api/auth/google` responde 404 `PROVIDER_DISABLED`; con la variable y un token firmado por una llave de prueba (JWKS servido localmente, `GOOGLE_JWKS_URL` apuntando a él), correo existente → 200 con `token`; correo nuevo → 200 `{ requiere_registro: true }`; audiencia distinta → 401 `INVALID_TOKEN`.
- [ ] **Step 2:** Correr `node --test test/social.test.js` → falla.
- [ ] **Step 3:** Implementar `oidc.js` con `jose.createRemoteJWKSet` + `jwtVerify` (issuer `https://accounts.google.com` / `https://appleid.apple.com`, audience de la variable) y las rutas; el inicio de sesión reutiliza `createSession` como `/api/login` (respeta 2FA: si la cuenta la tiene, responde el mismo reto).
- [ ] **Step 4:** Correr la prueba → pasa. Commit backend `feat(auth): inicio con Google y Apple verificado en el servidor, apagado sin credenciales`.
- [ ] **Step 5 (app):** Bienvenida, login, registro en tres pasos (paso 1 = referencia; paso 2 teléfono y confirmación; paso 3 identidad) y verificar correo según la spec; `SocialButtons` usa `expo-auth-session/providers/google` y `expo-apple-authentication` solo si `socialConfig()` lo permite; con `requiere_registro` abre el registro prellenado.
- [ ] **Step 6:** Verificar en el navegador (375 y 320 px): bienvenida → login → entrar con la cuenta de cliente; registro paso 1 muestra errores en los campos; verificar correo con 6 cajas y botón. `npx tsc --noEmit` y `npm test`.
- [ ] **Step 7:** Commit `feat(auth): bienvenida, login, registro y verificación con el diseño nuevo`.

### Task 3: Panel de Trabajo del técnico

**Files:**
- Create: `src/features/tech/RequestCard.tsx` (tarjeta de "Nuevas"), `src/features/tech/NextStopCard.tsx` (tarjeta de "En curso"), `src/features/tech/ScheduledRow.tsx`, `src/features/tech/PanelHeader.tsx`
- Modify: `app/(tecnico)/(tabs)/trabajos.tsx`, `src/features/tech/OnlineCard.tsx` (se reemplaza por `PanelHeader` + fila de métricas), `app/(tecnico)/(tabs)/_layout.tsx`

**Interfaces:**
- Consumes: `Solicitud` (`propuesta_a_mi`, `zona`, `cliente_nombre`, `categoria_nombre`, `descripcion`, `fecha_preferida`, `hora_preferida`, `folio`, `estado`, `tecnico_ubicacion?.eta_min`), `useAvailability()`, `useResumenTecnico()`.
- Produces: `RequestCard({ s, onAccept, onReject, onOpen, busy, canAccept })`, `NextStopCard({ s, onChat, onMap, onOpen })`, `ScheduledRow({ s, onPress })`, `PanelHeader({ nombre, apellido })` (incluye la píldora ONLINE/OFFLINE que cambia la disponibilidad).

- [ ] **Step 1:** Componentes con el contenido de la referencia (franja "ASIGNACIÓN DIRECTA" si `propuesta_a_mi`, si no "SOLICITUD CERCANA"; ETA en verde si existe; si no hay ETA no se muestra).
- [ ] **Step 2:** `trabajos.tsx`: encabezado, métricas compactas (ganado semana, servicios, calificación, saldo), `Tabs` NUEVAS (n) / EN CURSO (n) / HISTORIAL; Nuevas → "SOLICITUD RECIBIDA" + `RequestCard`; En curso → el primero en `NextStopCard` y el resto en "PROGRAMADO"; Historial → `OrderCard`.
- [ ] **Step 3:** Verificar en el navegador con el técnico de prueba: crear una solicitud con la cuenta de cliente (como en la prueba de punta a punta) y ver la tarjeta en Nuevas, aceptarla y verla en En curso; apagar y prender la píldora.
- [ ] **Step 4:** `tsc`, `npm test` (app y backend), recompilar `demo-web`, commit `feat(técnico): panel de trabajo según la referencia`, avance a Diego.

## Parte 2 · Cliente sencillo

### Task 4: Variante cómoda y inicio del cliente

**Files:**
- Modify: `src/design/tokens.ts` (`type.bodyLg` 18/27, `touch.comfortable = 56`), `Button.tsx` (`size="xl"` = 56 + 18 px), `app/(cliente)/(tabs)/inicio.tsx`, `app/(cliente)/(tabs)/_layout.tsx`
- Create: `src/features/orders/BigAction.tsx`, `src/features/orders/TodayCard.tsx`

**Interfaces:**
- Produces: `BigAction({ icon, title, subtitle?, badge?, onPress })` (tarjeta de 88 dp con ícono, texto de 20/18 px y flecha); `TodayCard({ s, onOpen })` (estado en palabras con `clientStatusText(s)` y "Ver mi servicio").
- Produces: `clientStatusText(s: Solicitud): { titulo: string; detalle: string; accion?: string }` en `src/lib/estado.ts` (prueba en `src/lib/__tests__/estado.test.mjs`).

- [ ] **Step 1 (test):** `clientStatusText` para PENDIENTE ("Buscando técnico"), ASIGNADA, EN_CAMINO ("Tu técnico va en camino"), ESPERANDO_APROBACION (accion "Revisar el precio"), POR_CONFIRMAR (accion "Confirmar y pagar"), FINALIZADA.
- [ ] **Step 2:** Correr `npm test` → falla; implementar; correr → pasa.
- [ ] **Step 3:** Inicio: saludo, `TodayCard` si hay un servicio activo, y tres `BigAction` (Pedir un servicio, Mis servicios con número y aviso si requiere respuesta, Ayuda). Sin buscador, cuadrícula ni métricas.
- [ ] **Step 4:** Verificar a 375 y 320 px y con letra grande (zoom del navegador 160 %); commit `feat(cliente): inicio sencillo con acciones grandes`.

### Task 5: Pedir un servicio en tres pasos

**Files:**
- Modify: `app/(cliente)/nueva-solicitud.tsx` (y, si crece, dividir en `src/features/orders/request/StepWhat.tsx`, `StepWhere.tsx`, `StepWhen.tsx`)

**Interfaces:**
- Consumes: `solicitudesApi.crear`, `useCategorias()`, direcciones guardadas, `elegir-tecnico/[id]`.

- [ ] **Step 1:** Asistente "Paso N de 3" con Regresar visible: 1) categorías grandes con texto + descripción + fotos opcionales; 2) dirección guardada o nueva, "Ajustar en el mapa" como opción; 3) "Lo antes posible con el más cercano" (principal), "Quiero elegir al técnico", fecha y hora opcionales; confirmación con folio.
- [ ] **Step 2:** Verificar creando una solicitud real con la cuenta de cliente y cancelándola; `tsc`; commit `feat(cliente): pedir un servicio en tres pasos`.

### Task 6: Mis servicios, detalle y cuenta

**Files:**
- Modify: `app/(cliente)/(tabs)/servicios.tsx`, `app/(cliente)/orden/[id]/index.tsx`, `app/(cliente)/(tabs)/cuenta.tsx`
- Create: `src/features/orders/MoreOptions.tsx`

**Interfaces:**
- Produces: `MoreOptions({ s })`: hoja con mapa, chat, SOS, reprogramar, incidencia, garantía, comprobante (cada uno según el estado, como hoy).

- [ ] **Step 1:** Lista con estado en palabras y botón de la siguiente acción; detalle con estado arriba, una acción principal y "Más opciones"; cuenta con lista corta y letra grande.
- [ ] **Step 2:** Revisar contra la tabla de RF del reporte que cada RF del cliente sigue accesible (anotar la ruta nueva).
- [ ] **Step 3:** `tsc`, `npm test`, recompilar `demo-web`, commit `feat(cliente): mis servicios y detalle con una acción principal`, avance a Diego.

## Parte 3 · INE

### Task 7: CURP, MRZ y comparación de nombres (backend, puro)

**Files:**
- Create: `src/lib/ine/curp.js`, `src/lib/ine/mrz.js`, `src/lib/ine/nombres.js`, `test/ine.test.js`

**Interfaces:**
- Produces: `parseCurp(text): { curp, fechaNacimiento: 'YYYY-MM-DD', sexo: 'H'|'M', estado } | null` (valida estructura, fecha real y dígito verificador); `findCurp(ocrText): string | null`; `curpMatchesName(curp, { nombre, apellidos }): boolean` (primeras 4 letras con las reglas de CURP: primera letra y primera vocal interna del paterno, inicial del materno o X, inicial del nombre saltando MARÍA/JOSÉ en compuestos); `parseMrzTd1(lines: string[]): { documento, fechaNacimiento, sexo, vigencia, apellidos, nombres, valido: boolean, errores: string[] } | null`; `findMrz(ocrText): string[] | null`; `mrzCheckDigit(s): number`; `normalizeName(s): string`; `namesMatch(a, b): boolean` (sin acentos, Levenshtein ≤ 2 por palabra, todas las palabras registradas presentes).

- [ ] **Step 1 (tests):** CURP válida de ejemplo con su dígito correcto → `parseCurp` devuelve fecha y sexo; mismo CURP con el último dígito cambiado → `null`; fecha 31 de febrero → `null`; `curpMatchesName` con `{ nombre: 'José Luis', apellidos: 'Pérez García' }` y CURP `PEGL…` → true; MRZ TD1 de prueba (construida en la prueba con `mrzCheckDigit`) → `valido: true`; MRZ con un dígito de nacimiento alterado → `valido: false` y `errores` contiene `'fecha_nacimiento'`; `namesMatch('PEREZ GARCIA JOSE LUIS', 'José Luis Pérez García')` → true; con 'JUAN LOPEZ' → false.
- [ ] **Step 2:** `node --test test/ine.test.js` → falla; implementar; → pasa.
- [ ] **Step 3:** Commit `feat(ine): validación de CURP, MRZ y nombres`.

### Task 8: Endpoint de verificación y ticket

**Files:**
- Create: `src/services/ineVerifier.js`, `src/services/ineProvider.js`, `src/routes/ine.js`, `migrations/004_verificaciones_ine.sql`, `test/ine-endpoint.test.js`, `test/fixtures/ine.js` (genera imágenes sintéticas con `sharp` + SVG)
- Modify: `src/app.js`, `src/db/migrate.js`, `src/routes/auth.js` (register exige tickets), `package.json` (`tesseract.js`, `sharp`), `.env.example` (`INE_PROVIDER`, `INE_PROVIDER_KEY`)

**Interfaces:**
- Produces: `analyzeQuality(buffer): Promise<{ ok, motivo?, brillo, reflejo, nitidez }>`; `verifyIne({ buffer, lado, registro: { nombre, apellidos, fecha_nacimiento }, frente? }): Promise<{ ok, comprobaciones: {id, ok, detalle}[], datos, motivo? }>`; `signTicket(payload)` / `readTicket(token)`; `POST /api/ine/verificar` → `{ ok, lado, comprobaciones, datos, ticket?, motivo? }`; tabla `verificaciones_ine(id, id_usuario, lado, curp, comprobaciones jsonb, hash_imagen, fecha)`.

- [ ] **Step 1 (tests):** con imágenes sintéticas: frente válido → 200 `ok: true` y `ticket`; imagen sin credencial → `ok: false`, `motivo` "No reconocimos una credencial del INE…"; imagen muy borrosa → `motivo` de nitidez; frente con CURP alterada → `ok: false` (comprobación `curp`); fecha de registro distinta → `ok: false` (comprobación `fecha_nacimiento`) sin devolver la CURP; reverso válido con el ticket del frente → `ok: true`; reverso con MRZ alterada → `ok: false`; `/api/register` sin tickets → 400 `INE_NOT_VERIFIED`; con tickets de otra imagen → 400; con tickets correctos → 201 y filas en `verificaciones_ine`.
- [ ] **Step 2:** Correr → falla. Implementar (OCR con un `createWorker('spa')` reutilizado; MRZ con un segundo paso sobre la franja inferior y `tessedit_char_whitelist`). Correr → pasa. Ajustar las pruebas viejas de registro para que obtengan tickets.
- [ ] **Step 3:** `ineProvider.js`: `isEnabled()` falso sin `INE_PROVIDER`; `validarEnListaNominal()` lanza `PROVIDER_DISABLED`; prueba de que el endpoint no lo llama sin variable.
- [ ] **Step 4:** `npm test` completo del backend verde. Commit `feat(ine): verificación de la credencial con OCR, CURP y MRZ antes del registro`.

### Task 9: Captura guiada en la app

**Files:**
- Create: `src/features/ine/frameAnalysis.ts` (+ `src/lib/__tests__/frameAnalysis.test.mjs`), `src/features/ine/IneCamera.web.tsx`, `src/features/ine/IneCamera.tsx`, `src/features/ine/IneCapture.tsx`
- Modify: `app/(auth)/registro.tsx`, `src/api/endpoints.ts` (`ineApi.verificar`), `src/api/types.ts`, `package.json` (`expo-camera`), `app.json` (plugin de cámara)

**Interfaces:**
- Produces: `analyzeFrame(gray: Uint8ClampedArray, width: number, height: number, frame: Rect): { brillo: number; reflejo: number; nitidez: number; documento: number; consejo: Consejo | null }` con `Consejo = 'acercar' | 'reflejo' | 'borrosa' | 'oscuro' | 'claro'`; `IneCapture({ lado, registro, frenteTicket?, onVerified(file, ticket, datos) })`; `ineApi.verificar(lado, file, registro, ticketFrente?)`.

- [ ] **Step 1 (test):** `analyzeFrame` con una imagen sintética uniforme → `consejo: 'acercar'`; con un rectángulo de bordes nítidos que llena el marco → `consejo: null`; con 30 % de píxeles saturados → `'reflejo'`; con la misma imagen desenfocada (promedio 9×9) → `'borrosa'`; muy oscura → `'oscuro'`.
- [ ] **Step 2:** `npm test` → falla; implementar; → pasa.
- [ ] **Step 3:** `IneCamera.web.tsx` (getUserMedia, `<video>`, canvas, disparo automático tras ~1 s estable, recorte al marco, mensajes en vivo, errores de permiso y de navegador sin HTTPS); `IneCamera.tsx` con `CameraView` de expo-camera y disparo manual; `IneCapture` llama a `ineApi.verificar` y muestra el resultado; el registro guarda los tickets y los envía.
- [ ] **Step 4:** Verificar en el navegador con una imagen de credencial sintética mostrada en otra pantalla o cargada como cámara falsa; `tsc`, `npm test` app y backend.
- [ ] **Step 5:** Commit `feat(ine): captura guiada con detección en vivo y verificación al tomar la foto`.

### Task 10: Cierre

- [ ] **Step 1:** Investigar Verificamex, Nubarium, Truora y MetaMap (API, sandbox, precio público) y resumirlos.
- [ ] **Step 2:** Sección nueva en `docs/REPORTE-CAMBIOS.md`: qué cambió por parte, RF tocados y su ruta nueva, cómo activar Google/Apple, el proveedor, qué prueba la verificación de la INE y qué no.
- [ ] **Step 3:** Regenerar los parches del backend (`git format-patch` desde `main` a `parches/` y `entregables/parches/`).
- [ ] **Step 4:** `tsc`, pruebas de app y backend, recompilar `demo-web`, revisar el link público; avance final a Diego con commits y pendientes.
