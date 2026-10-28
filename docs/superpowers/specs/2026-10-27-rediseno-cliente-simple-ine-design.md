# Rediseño, cliente sencillo y verificación real de la INE — diseño

Fecha: 2026-10-27 · Rama de la app: `claude/rediseno-simple` (desde `main` b9f838b) · Backend: `claude/requisitos-moviles`

## Qué pidió Diego

1. Que el detector de credenciales "lea de manera real": al tomar la foto con la cámara, detectar que de verdad es una credencial INE, registrarlo y estar seguro de que lo es. Buscar una API si hace falta.
2. Cambios de diseño según seis pantallas de referencia (bienvenida, login, crear cuenta, verificar correo y panel de trabajo del técnico en "Nuevas" y "En curso").
3. Pantallas del **cliente** más sencillas, con el enfoque del portal ciudadano de CILIM ("Silim"), hecho para adultos mayores, pero no tan simple.

Decisiones ya tomadas (respuestas del coordinador a mis preguntas, sin cambios de Diego hasta ahora): orden diseño → cliente sencillo → INE; el logo se redibuja en SVG; Google y Apple quedan listos pero ocultos sin credenciales; la INE se valida con un sistema propio y gratuito y el proveedor de pago queda como adaptador apagado; la app instalada valida al tomar la foto (el análisis cuadro por cuadro es solo en web).

Restricción que se mantiene: no se pierde ningún RF/RNF de `docs/REPORTE-CAMBIOS.md`. Lo que salga de la vista principal queda en un segundo nivel.

## Parte 1 · Lenguaje visual nuevo

### Tokens (`src/design/tokens.ts`)

| Token | Antes | Ahora |
|---|---|---|
| Marca (títulos, botón principal, encabezados de tarjeta) | azul `#0B4F85` | marino `#0C1C40` (presionado `#081430`) |
| Acento (acción destacada) | naranja `#E8801F` | naranja `#FF6B00` (presionado `#E05E00`); logo `#F1630F` |
| Fondo de pantalla | `#F7F8FA` | blanco `#FFFFFF`; paneles `#F7F8F9` |
| Campo | relleno gris sin borde | blanco con borde `#D9DDE3`, radio 12 |
| Botón | píldora, minúsculas | radio 12, alto 52/56, texto en MAYÚSCULAS con espaciado |
| Tarjeta | radio 28, sombra | radio 16, sombra muy suave, borde `#ECEFF3` |
| Tipografía | Outfit + Inter | solo Inter (títulos Inter Bold) |

- El texto blanco sobre naranja `#FF6B00` da 3.0:1: se usa en negrita de 16 px o más (texto grande en WCAG). Por eso los botones naranjas van en negrita, MAYÚSCULAS y 16 px.
- Se eliminan los degradados (`HeroCard`, `OnlineCard`) y los bloques pastel decorativos; quedan los colores de estado (verde, ámbar, rojo) con texto.
- Etiquetas de campo: `overline` en MAYÚSCULAS, 12 px, negrita, marino.

### Componentes (`src/design/`)

- `Button`: variantes `primary` (marino), `accent` (naranja), `outlined` (blanco con borde), `text`, `danger`, `success`. Texto en mayúsculas.
- `TextField`: etiqueta arriba en mayúsculas, ícono de contorno a la izquierda, ojo para contraseña.
- `Segmented`: dos estilos, segmentos rellenos marino (tipo de perfil) y pestañas de texto con subrayado naranja (`Tabs`, nuevo).
- `OtpField`: cajas cuadradas grandes, expone el código para el botón VERIFICAR CÓDIGO.
- `NavigationBar`: barra blanca, íconos de contorno, pestaña activa en naranja.
- `Pill` "● ONLINE / OFFLINE" para la disponibilidad.
- `LogoMark` nuevo: flecha de cursor naranja con una llave inglesa cruzada en diagonal. Mismo dibujo en `assets/` (ícono, ícono adaptativo, splash y favicon).

### Pantallas de la referencia

- **Bienvenida** (`app/(auth)/bienvenida.tsx`, nueva; la app sin sesión abre aquí): logo grande, "Click & Serve", texto de bienvenida, INICIAR SESIÓN (marino) y CREAR CUENTA (naranja).
- **Login**: logo, "Click & Serve", "Expertos técnicos a un clic de distancia en Lázaro Cárdenas", CORREO ELECTRÓNICO, CONTRASEÑA, "¿Olvidaste tu contraseña?" naranja a la derecha, INICIAR SESIÓN marino, separador "o", Google/Apple (solo si hay credenciales, ver abajo), "¿No tienes cuenta? Regístrate aquí", y abajo aviso de privacidad y términos.
- **Crear cuenta** en tres pasos: el paso 1 es la pantalla de la referencia (NOMBRE | APELLIDOS, EMAIL, FECHA DE NACIMIENTO, CONTRASEÑA con ojo y lista de requisitos, TIPO DE PERFIL CLIENTE/TÉCNICO, botón naranja "REGISTRARME →"). Paso 2: teléfono y confirmación de contraseña. Paso 3: INE (frente y reverso con la captura verificada de la parte 3), rostro y aceptación del aviso.
- **Verifica tu correo**: círculo durazno con sobre naranja, el correo en negrita, una caja por dígito (6, los del backend), VERIFICAR CÓDIGO, "¿No recibiste nada? Reenviar código", "← Volver al registro". Sigue verificando solo al teclear el último dígito (RNF-18).
- **Panel de Trabajo** (técnico, `trabajos.tsx`): "Panel de Trabajo" con píldora ONLINE/OFFLINE que enciende y apaga la disponibilidad, "TÉC. NOMBRE · LÁZARO CÁRDENAS", pestañas NUEVAS (n) / EN CURSO (n) / HISTORIAL.
  - Nuevas: "SOLICITUD RECIBIDA", tarjeta con franja marino "ASIGNACIÓN DIRECTA" (si lo eligieron) o "SOLICITUD CERCANA", folio, CLIENTE, nombre, chip de categoría, zona, DESCRIPCIÓN DE LA FALLA en cursiva, FECHA y HORA, RECHAZAR y ACEPTAR TRABAJO, y la nota de chat y ubicación.
  - En curso: "SIGUIENTE DESTINO" con ETA en verde, tarjeta con cliente, avatar, zona y categoría, CITA y ESTATUS, CHAT y VER EN MAPA; luego "PROGRAMADO" con filas y hora.
  - Las métricas de la tarjeta anterior (ganado en la semana, servicios, calificación, saldo; RF-111/122) pasan a una fila compacta bajo el encabezado.
- **Barra inferior del técnico**: Trabajos, Mapa, Billetera, Perfil (no se inventa "Comunidad").

### Google y Apple (RF no lo exige; es de la referencia)

- App: `expo-auth-session` (Google, id_token) y `expo-apple-authentication` (solo iOS). El botón aparece solo si existe `EXPO_PUBLIC_GOOGLE_*_CLIENT_ID` / en iOS con `EXPO_PUBLIC_APPLE_SIGNIN=1`.
- Backend: `POST /api/auth/google` y `POST /api/auth/apple` verifican la firma del id_token contra las llaves públicas del proveedor (JWKS) y la audiencia configurada (`GOOGLE_CLIENT_IDS`, `APPLE_BUNDLE_ID`). Si el correo existe, inicia sesión; si no, responde `NEEDS_REGISTRATION` con nombre y correo para prellenar el registro (la verificación de INE sigue siendo obligatoria). Sin variables, responden 404 `PROVIDER_DISABLED`.

## Parte 2 · Cliente más sencillo (principios de CILIM)

De CILIM (`C:\Proyectos\CILIM\src\views\ciudadano\ciudadano.css`) se toma: letra de cuerpo de 18 px, contraste alto, botones de 56 px, una pregunta por pantalla, el color de marca para lo que se toca, bordes visibles en campos y tarjetas, lenguaje llano.

Aplicado solo a las rutas del cliente (`app/(cliente)/**`), con una variante de tamaño `comfortable` en los componentes (cuerpo 18, botones 56) que el cliente usa por defecto:

- **Inicio**: saludo corto y tres tarjetas grandes con texto e ícono: "Pedir un servicio", "Mis servicios" (con el número en curso y si alguno necesita su respuesta) y "Ayuda". Si hay un servicio en curso, una sola tarjeta "Tu servicio de hoy" con el estado en palabras y un botón "Ver mi servicio". Se quitan el buscador, la cuadrícula de categorías y los bloques de métricas; las categorías viven en el paso 1 de pedir servicio.
- **Pedir un servicio** (`nueva-solicitud.tsx`) como asistente de tres pasos con "Paso N de 3" y botón Regresar siempre visible: 1) ¿Qué necesitas arreglar? (categorías grandes con texto + descripción + fotos opcionales); 2) ¿Dónde? (dirección guardada o nueva; el mapa queda como opción "Ajustar en el mapa"); 3) ¿Cuándo y quién? ("Lo antes posible con el más cercano" como opción principal, "Elegir técnico" y fecha y hora como opciones). Termina en una confirmación clara con el folio.
- **Mis servicios**: lista con estado en palabras y la siguiente acción en un botón ("Aprobar precio", "Confirmar y pagar"); el detalle de la orden pone primero el estado y una sola acción principal; mapa, chat, SOS, reprogramar, incidencia, garantía y comprobante quedan en "Más opciones".
- **Cuenta**: lista corta (Mis datos, Mis direcciones, Mis tarjetas, Seguridad, Ayuda, Cerrar sesión) con letra grande.
- Confirmaciones con texto completo ("Tu solicitud SRV-… quedó registrada") y errores que dicen qué hacer.

## Parte 3 · Verificación real de la INE

### Qué prueba y qué no

Prueba que la foto es de una credencial para votar del INE con datos legibles y coherentes entre sí y con lo que la persona registró. No prueba que el INE la haya emitido ni que esté vigente en la lista nominal: eso solo lo puede confirmar un proveedor con convenio (adaptador apagado, abajo).

### Captura guiada (app)

Componente `IneCapture` (reemplaza a `DocCapture` para frente y reverso; el rostro sigue con `DocCapture`):

- **Web** (`IneCamera.web.tsx`): `getUserMedia` con la cámara trasera, `<video>` a pantalla completa y un marco de 85.6 × 54 mm (proporción 1.585). Cada ~250 ms se analiza el cuadro en un `<canvas>` reducido: brillo medio (muy oscuro / muy claro), reflejo (porcentaje de píxeles saturados dentro del marco), nitidez (varianza del laplaciano) y presencia del documento (densidad de bordes en el contorno del marco frente al centro, más contraste entre el interior y el exterior). Mensajes en vivo: "Acerca la credencial al marco", "Hay mucho reflejo, inclínala un poco", "Está borrosa, mantenla quieta", "Busca más luz". Cuando todo pasa durante ~1 s seguido, dispara solo y recorta al marco.
- **Celular** (`IneCamera.tsx`, `expo-camera`): vista de cámara con el mismo marco y textos de guía; disparo manual. La revisión ocurre en el servidor al instante.
- Sin galería para la INE. Después de cada toma se llama a la verificación; mientras tanto se muestra "Revisando tu credencial…". Si falla, el motivo en palabras y "Tomar otra vez".

### Verificación en el backend

`POST /api/ine/verificar` (pública, porque ocurre antes de crear la cuenta; límite de 12 intentos por IP cada 15 min). Recibe `foto` (multipart), `lado` (`frente` | `reverso`) y los datos del registro (`nombre`, `apellidos`, `fecha_nacimiento`); para el reverso, el `ticket` del frente.

1. **Calidad** (`sharp`): tamaño mínimo, brillo, reflejo y nitidez; si falla, motivo concreto.
2. **OCR** (`tesseract.js`, español; MRZ con lista blanca `A-Z0-9<`): sobre la imagen en escala de grises y normalizada.
3. **Frente**: textos clave (al menos 2 de INSTITUTO NACIONAL ELECTORAL, CREDENCIAL PARA VOTAR, MÉXICO, NOMBRE, DOMICILIO, CLAVE DE ELECTOR, CURP); CURP con estructura y dígito verificador válidos; fecha de nacimiento de la CURP = la del registro; sexo de la CURP = el que aparece en la credencial (si se lee); iniciales de la CURP coherentes con nombre y apellidos registrados; nombre leído parecido al registrado (sin acentos, distancia de edición tolerante); clave de elector con su estructura (18 caracteres) si se lee.
4. **Reverso**: MRZ TD1 que empieza con `IDMEX`, con sus dígitos verificadores (documento, nacimiento, vigencia y compuesto); fecha de nacimiento y sexo de la MRZ = los de la CURP del frente; apellidos y nombre de la MRZ = los registrados; vigencia no vencida.
5. Respuesta: `{ ok, lado, comprobaciones: [{ id, ok, detalle }], datos: { curp, sexo, fecha_nacimiento, vigencia }, ticket, motivo }`. El `ticket` es un token firmado (HMAC con `FILES_SECRET`/`JWT_SECRET`) que incluye el SHA-256 de la imagen, el lado, la CURP y el resultado; vence en 30 min.

`POST /api/register` exige `ticket_ine_frente` y `ticket_ine_reverso` válidos, que el hash de cada imagen subida coincida con el de su ticket y que ambos tengan la misma CURP. Guarda el resultado en `verificaciones_ine` (nueva tabla: usuario, lado, comprobaciones JSON, CURP, fecha). Sin tickets válidos responde 400 con un mensaje claro. El administrador sigue aprobando la cuenta (RF-25 no cambia).

### Proveedor externo (apagado)

`src/services/ineProvider.js` con la interfaz `validarEnListaNominal({ frente, reverso, selfie, datos })`. Con `INE_PROVIDER` vacío no hace nada y la verificación sigue siendo la propia. Se documentan Verificamex, Nubarium, Truora y MetaMap (API, sandbox, precio público si existe) en el reporte. No se crean cuentas.

### Pruebas

- Unitarias: CURP (dígito verificador, fechas, sexo, iniciales), MRZ TD1 (dígitos verificadores, parseo, coincidencias), comparación de nombres.
- Endpoint: imágenes sintéticas generadas en la prueba (frente con textos y CURP, reverso con MRZ), una foto sin credencial, una borrosa, un CURP con dígito alterado, una MRZ con dígito alterado y un ticket de otra imagen.
- App: pruebas de las funciones de análisis de cuadro (brillo, reflejo, nitidez) con imágenes sintéticas.
- Manual: Diego con su INE real en el link web y en el teléfono.

## Entregables por parte

Commits por etapa en la rama, `tsc` y pruebas de app y backend en verde, `demo-web` recompilado para el link público y un avance corto a Diego. Al final: sección nueva en `docs/REPORTE-CAMBIOS.md`, parches del backend regenerados y lista de pendientes (credenciales de Google/Apple, proveedor de lista nominal).
