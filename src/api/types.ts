// Tipos de las respuestas del backend de Click & Serve. Los importes son cadenas decimales del servidor.
export type Rol = 'cliente' | 'tecnico' | 'admin';

export type User = {
  id_usuario: number;
  nombre: string;
  apellido: string;
  telefono: string | null;
  correo: string;
  fecha_nacimiento: string | null;
  id_rol: number;
  rol: Rol;
  estado_cuenta: string;
  aprobado: boolean;
  identidad_verificada: boolean;
  verificado_sep: boolean;
  biometria_estado: string;
  '2FA_Activo': boolean;
  disponible: boolean;
  preferencias: Partial<Record<'notificaciones_push' | 'notificaciones_email' | 'notificaciones_sms' | 'promociones' | 'sonido', boolean>>;
  foto_url: string | null;
  bio: string | null;
  fecha_registro?: string;
};

export type Estado =
  | 'PENDIENTE' | 'ASIGNADA' | 'EN_CAMINO' | 'EN_SITIO' | 'ESPERANDO_APROBACION'
  | 'EN_PROCESO' | 'POR_CONFIRMAR' | 'FINALIZADA' | 'SUSPENDIDA' | 'CANCELADA';

export type Categoria = { codigo: string; nombre: string; descripcion: string; icono: string };

export type TecnicoResumen = {
  id_usuario: number;
  nombre: string;
  apellido: string;
  foto_url: string | null;
  calificacion: string | null;
  trabajos: number;
  verificado_sep: boolean;
  telefono?: string;
};

export type Concepto = { id_concepto: number; tipo: 'MANO_OBRA' | 'MATERIAL' | 'EXTRA'; descripcion: string; monto: string; id_cotizacion: number | null };

export type Cotizacion = {
  id_cotizacion: number;
  monto_mano_obra: string;
  monto_materiales: string;
  monto_total: string;
  detalles: string | null;
  tiempo_estimado_minutos: number | null;
  estado: string;
  fecha_creacion: string;
  conceptos: Concepto[];
};

export type Tarea = { id_tarea: number; descripcion: string; origen: 'PLANTILLA' | 'TECNICO'; norma: string | null; completada: boolean };
export type Evidencia = { id_evidencia: number; tipo_evidencia: string; descripcion: string | null; url: string; fecha_subida: string };
export type Reprogramacion = { id_reprogramacion: number; propuesta_por: number; propuesta_por_mi: boolean; fecha: string; hora: string; motivo: string | null; estado: string };
export type Incidencia = { id_incidencia: number; folio: string; tipo: string; descripcion: string; prioridad: string; estado: string; fecha_creacion: string; resolucion?: string | null; folio_solicitud?: string; propia?: boolean };

export type Solicitud = {
  id_solicitud: number;
  folio: string;
  categoria: string | null;
  categoria_nombre: string;
  descripcion: string;
  fecha_preferida: string | null;
  hora_preferida: string | null;
  estado: Estado;
  estado_previo: Estado | null;
  estado_pago: string;
  fecha_creacion: string;
  fecha_asignacion: string | null;
  fecha_llegada: string | null;
  fecha_finalizacion: string | null;
  garantia_hasta: string | null;
  monto_total: string | null;
  monto_cotizacion: string | null;
  cancelado_por: string | null;
  motivo_cancelacion: string | null;
  alerta_sos: boolean;
  id_tecnico: number | null;
  tecnico_propuesto: number | null;
  es_cliente: boolean;
  es_tecnico_asignado: boolean;
  calificacion_al_tecnico: number | null;
  comentario_al_tecnico: string | null;
  calificacion_al_cliente: number | null;
  comentario_al_cliente: string | null;
  direccion?: string;
  referencias?: string | null;
  latitud?: number | null;
  longitud?: number | null;
  zona?: string;
  latitud_aprox?: number | null;
  longitud_aprox?: number | null;
  distancia_km?: number | null;
  propuesta_a_mi?: boolean;
  cliente_nombre?: string;
  cliente_apellido?: string;
  cliente_telefono?: string;
  tecnico?: TecnicoResumen;
  tecnico_ubicacion?: { latitud: number; longitud: number; actualizado: string; distancia_km: number; eta_min: number | null };
  // Solo en el detalle
  imagenes?: { id: number; url: string }[];
  cotizacion?: Cotizacion | null;
  extras?: Concepto[];
  tareas?: Tarea[];
  evidencias?: Evidencia[];
  reprogramacion?: Reprogramacion | null;
  incidencia?: Incidencia | null;
  pago?: { monto: string; modo: string; referencia: string; estado: string; fecha: string; desglose?: Desglose } | null;
};

export type Desglose = { total: string; comision: string; base: string; retencion_isr: string; retencion_iva: string; neto_tecnico: string };

export type TecnicoRecomendado = {
  id_usuario: number;
  nombre: string;
  apellido: string;
  foto_url: string | null;
  verificado_sep: boolean;
  bio: string | null;
  distancia_km: number | null;
  eta_min: number | null;
  latitud_aprox: number | null;
  longitud_aprox: number | null;
  calificacion: string | null;
  resenas: number;
  trabajos: number;
  especialidades: string[];
};

export type PerfilTecnico = {
  id_usuario: number;
  nombre: string;
  apellido: string;
  foto_url: string | null;
  bio: string | null;
  verificado_sep: boolean;
  identidad_verificada: boolean;
  miembro_desde: string;
  disponible: boolean;
  calificacion: string | null;
  resenas_total: number;
  trabajos: number;
  efectividad: number | null;
  especialidades: { codigo: string; nombre: string; estado: string }[];
  portafolio: { id_item: number; titulo: string; descripcion: string | null; url: string }[];
  certificaciones: { tipo: string; descripcion: string | null; numero: string | null }[];
  resenas: { puntuacion: number; comentario: string | null; fecha: string; cliente: string }[];
};

export type Tarjeta = { id_metodo: number; titular: string; marca: string; ultimos_4: string; expiracion: string; predeterminada: boolean };

export type Direccion = {
  id_direccion: number;
  etiqueta: string;
  calle: string;
  numero: string;
  interior: string | null;
  colonia: string;
  cp: string;
  ciudad: string;
  referencias: string | null;
  latitud: string | null;
  longitud: string | null;
  predeterminada: boolean;
};

export type Billetera = { id_billetera: number; saldo_actual: string; clabe: string | null; banco: string | null; tiene_clabe: boolean; minimo_retiro: string };

export type Movimiento = {
  id_transaccion: number;
  folio: string;
  tipo: 'INGRESO' | 'RETIRO';
  concepto: string;
  monto: string;
  estado: string;
  fecha: string;
  folio_solicitud: string | null;
  categoria_nombre: string | null;
};

export type Comprobante = Movimiento & { beneficiario: string; cuenta_destino: string | null; banco_destino: string | null; desglose: Desglose | null };

export type ResumenTecnico = {
  disponible: boolean;
  aprobado: boolean;
  ganancias_semana: string;
  servicios_semana: number;
  servicios_total: number;
  calificacion: string | null;
  resenas: number;
  saldo: string;
  contadores: Contadores;
};

export type Contadores = { nuevas: number; en_curso: number; historial: number };

export type Especialidad = { id_especialidad: number; categoria: string | null; nombre: string; estado: string; activa: boolean };
export type Documento = { id_documento: number; tipo: string; numero: string | null; descripcion: string | null; estado: string; url: string | null; fecha_creacion: string };
export type ItemPortafolio = { id_item: number; titulo: string; descripcion: string | null; url: string; fecha_creacion: string };

export type ChatMensaje = {
  id: number;
  id_solicitud: number;
  id_emisor: number;
  emisor_nombre: string;
  mensaje: string | null;
  adjunto_url: string | null;
  adjunto_tipo: string | null;
  adjunto_nombre: string | null;
  fecha_envio: string;
};

export type Ticket = {
  id_ticket: number;
  folio: string;
  asunto: string;
  categoria: string;
  prioridad: string;
  estado: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  folio_solicitud?: string | null;
  ultimo_mensaje?: string | null;
};

export type TicketMensaje = { id_mensaje: number; id_ticket: number; id_emisor: number | null; es_asesor: boolean; mensaje: string | null; adjunto_url: string | null; adjunto_tipo: string | null; fecha_envio: string };

export type Sesion = { id_sesion: string; dispositivo: string; fecha_creacion: string; es_sesion_actual: boolean };

export type LocalFile = { uri: string; name: string; type: string };

// Resultado de POST /api/ine/verificar: cada comprobación con su resultado y, si pasa, el ticket
// firmado que pide el registro.
export type IneComprobacion = { id: string; ok: boolean; detalle: string };
export type IneResultado = {
  ok: boolean;
  lado: 'frente' | 'reverso';
  comprobaciones: IneComprobacion[];
  motivo?: string;
  datos?: { curp?: string; sexo?: string; fecha_nacimiento?: string; vigencia?: string };
  ticket?: string;
};
export type IneRegistro = { nombre: string; apellidos: string; fecha_nacimiento: string };
