// RF-50/92: base de conocimientos local (funciona sin red). Los datos de contacto vienen del entorno;
// sin teléfono configurado la app no muestra la opción de llamar.
export const SUPPORT_EMAIL = process.env.EXPO_PUBLIC_SUPPORT_EMAIL || 'soporte@clickserve.com';
export const SUPPORT_PHONE = process.env.EXPO_PUBLIC_SUPPORT_PHONE || '';

export type HelpTopic = 'servicios' | 'pagos' | 'validaciones' | 'penalizaciones' | 'seguridad' | 'tecnicos';

export const TOPICS: { key: HelpTopic; label: string; icon: string; tint: 'sky' | 'peach' | 'plain' }[] = [
  { key: 'servicios', label: 'Pedir un servicio', icon: 'tool', tint: 'sky' },
  { key: 'pagos', label: 'Pagos y cobros', icon: 'credit-card', tint: 'peach' },
  { key: 'validaciones', label: 'Validación de cuenta', icon: 'check-circle', tint: 'plain' },
  { key: 'penalizaciones', label: 'Cancelaciones', icon: 'alert-circle', tint: 'sky' },
  { key: 'seguridad', label: 'Seguridad', icon: 'shield', tint: 'peach' },
  { key: 'tecnicos', label: 'Para técnicos', icon: 'briefcase', tint: 'plain' },
];

export type Article = { slug: string; topic: HelpTopic; title: string; summary: string; body: string[] };

export const ARTICLES: Article[] = [
  {
    slug: 'como-pedir-servicio', topic: 'servicios', title: '¿Cómo pido un servicio?',
    summary: 'Describe la falla, elige dirección y horario, y escoge técnico.',
    body: [
      'Desde Inicio toca "Nueva solicitud" o una categoría. Describe la falla con tus palabras y, si puedes, agrega hasta 5 fotos: ayudan al técnico a llegar preparado.',
      'Elige una dirección guardada o marca el punto en el mapa. Puedes pedirlo "lo antes posible" o programar día y hora.',
      'Al final decide si quieres elegir tú al técnico (verás calificación, distancia y reseñas) o dejar que asignemos al más cercano con la especialidad.',
    ],
  },
  {
    slug: 'cotizacion', topic: 'servicios', title: '¿Cómo funciona la cotización?',
    summary: 'El técnico revisa en sitio y te envía conceptos para aprobar.',
    body: [
      'Al llegar, el técnico revisa la falla y te envía una cotización con mano de obra y materiales. Nada se cobra hasta que la apruebes.',
      'Si durante el trabajo se necesita algo extra, el técnico lo agrega como concepto adicional y lo verás en el total antes de pagar.',
      'Si no estás de acuerdo con la cotización, recházala: el técnico puede enviar otra o el servicio se cancela sin cargo.',
    ],
  },
  {
    slug: 'garantia', topic: 'servicios', title: 'Garantía de 90 días',
    summary: 'Todo servicio pagado tiene 90 días de garantía.',
    body: [
      'Desde que confirmas y pagas, el trabajo tiene 90 días de garantía. Si la falla regresa, abre la orden y toca "Reclamar garantía o reportar".',
      'Revisamos el caso con el técnico y, si procede, regresa sin costo a corregirlo.',
    ],
  },
  {
    slug: 'cuando-se-cobra', topic: 'pagos', title: '¿Cuándo se hace el cobro?',
    summary: 'Solo cuando confirmas que el trabajo quedó.',
    body: [
      'El cobro se hace únicamente al tocar "Enviar y finalizar", después de revisar la evidencia del trabajo. Antes de eso no se hace ningún cargo a tu tarjeta.',
      'El total incluye IVA y lo calcula Click & Serve con los conceptos que aprobaste; el técnico no puede cambiarlo por su cuenta.',
      'Recibirás un comprobante con folio que puedes compartir o imprimir.',
    ],
  },
  {
    slug: 'tarjetas', topic: 'pagos', title: '¿Es seguro guardar mi tarjeta?',
    summary: 'La tarjeta se cifra en tu teléfono; nunca vemos el número completo.',
    body: [
      'Al agregar una tarjeta, sus datos se envían cifrados directamente al procesador de pagos (Conekta) y nosotros solo guardamos un token, la marca y los últimos 4 dígitos.',
      'El código de seguridad (CVV) nunca se guarda. Puedes eliminar una tarjeta en cualquier momento desde Perfil › Métodos de pago.',
    ],
  },
  {
    slug: 'comisiones', topic: 'pagos', title: 'Comisiones y retenciones',
    summary: 'Cómo se reparte lo que pagas.',
    body: [
      'Del total que pagas, Click & Serve retiene una comisión del 10% por el uso de la plataforma, y aplica las retenciones de ISR e IVA que marca la ley para plataformas digitales.',
      'El técnico ve el desglose completo de cada servicio en su billetera.',
    ],
  },
  {
    slug: 'verificacion-identidad', topic: 'validaciones', title: '¿Por qué validan mi identidad?',
    summary: 'Para que clientes y técnicos sepan con quién tratan.',
    body: [
      'Al registrarte pedimos tu INE y una foto de tu rostro. Un equipo revisa los documentos antes de aprobar la cuenta; mientras tanto puedes explorar la app pero no pedir ni aceptar servicios.',
      'Los técnicos además pueden validar su cédula profesional ante la SEP, y verás la insignia "Cédula SEP" en su perfil.',
    ],
  },
  {
    slug: 'cuenta-en-revision', topic: 'validaciones', title: 'Mi cuenta sigue en revisión',
    summary: 'Normalmente toma menos de 24 horas.',
    body: [
      'La revisión de documentos suele tardar menos de 24 horas hábiles. Te avisamos por notificación y correo en cuanto se apruebe.',
      'Si pasaron más de 48 horas, abre un caso de soporte con el tema "Mi cuenta".',
    ],
  },
  {
    slug: 'cancelar', topic: 'penalizaciones', title: '¿Puedo cancelar un servicio?',
    summary: 'Sin cargo mientras el trabajo no haya empezado.',
    body: [
      'Como cliente puedes cancelar sin costo mientras el técnico no haya empezado el trabajo (hasta que apruebes la cotización).',
      'Una vez iniciado el trabajo, si hay un problema repórtalo como incidencia: la orden se pausa y puedes pedir otro técnico, continuar o cancelar sin cargo.',
    ],
  },
  {
    slug: 'penalizaciones-tecnico', topic: 'penalizaciones', title: 'Cancelaciones de técnicos',
    summary: 'Las cancelaciones frecuentes afectan la visibilidad.',
    body: [
      'Si un técnico deja un servicio, debe indicar el motivo y la solicitud vuelve a quedar disponible para otros técnicos.',
      'Cancelar con frecuencia o no presentarse reduce la efectividad que ven los clientes y puede llevar a la suspensión de la cuenta.',
    ],
  },
  {
    slug: 'boton-sos', topic: 'seguridad', title: 'Botón SOS',
    summary: 'Alerta inmediata al equipo de seguridad con tu ubicación.',
    body: [
      'Durante un servicio activo verás un botón rojo "SOS". Al tocarlo y confirmar, avisamos al equipo de seguridad de Click & Serve con tu ubicación.',
      'Si tu vida corre peligro, llama también al 911: el SOS no sustituye a los servicios de emergencia.',
    ],
  },
  {
    slug: 'chat-seguro', topic: 'seguridad', title: 'Comunicación dentro de la app',
    summary: 'Mantén pagos y acuerdos dentro de Click & Serve.',
    body: [
      'Usa el chat de la orden para coordinarte con el técnico. Si alguien te pide pagar por fuera, comparte datos sensibles o se comporta de forma inapropiada, usa "Escalar a seguridad" desde el chat.',
      'Los pagos fuera de la app no tienen garantía ni protección.',
    ],
  },
  {
    slug: 'dos-pasos', topic: 'seguridad', title: 'Verificación en dos pasos',
    summary: 'Protege tu cuenta con un código además de la contraseña.',
    body: [
      'En Perfil › Seguridad puedes activar la verificación en dos pasos con una app autenticadora (Google Authenticator, Microsoft Authenticator, 1Password…).',
      'Al iniciar sesión te pediremos el código de 6 dígitos de esa app. Si cambias de teléfono, desactívala antes desde la app.',
    ],
  },
  {
    slug: 'recibir-solicitudes', topic: 'tecnicos', title: 'Cómo recibir solicitudes',
    summary: 'Conéctate y mantén tus especialidades al día.',
    body: [
      'Activa "Disponible" en la pestaña Trabajos. Mientras estés conectado te llegarán las solicitudes de tus especialidades cercanas a tu ubicación.',
      'Puedes pausar categorías desde Perfil › Especialidades sin perder su verificación.',
    ],
  },
  {
    slug: 'retiros', topic: 'tecnicos', title: 'Retiros a tu cuenta',
    summary: 'Retira tu saldo a una CLABE a tu nombre.',
    body: [
      'Registra una CLABE interbancaria de 18 dígitos a tu nombre en Billetera › Cuenta bancaria. La validamos con su dígito verificador.',
      'Desde la billetera solicita el retiro del monto disponible; verás el comprobante con su folio en Movimientos.',
    ],
  },
];

export const articleBySlug = (slug: string) => ARTICLES.find((a) => a.slug === slug);
