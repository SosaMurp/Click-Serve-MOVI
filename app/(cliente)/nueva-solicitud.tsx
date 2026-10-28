import React, { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AppBar, Banner, Button, color, DateField, Icon, IconName, radius, Screen, space, Text, TextField, TimeField,
} from '@/src/design';
import { ApiError, errorMessage } from '@/src/api/client';
import { direccionesApi, solicitudesApi } from '@/src/api/endpoints';
import type { Direccion, LocalFile } from '@/src/api/types';
import { useSession } from '@/src/state/session';
import { useCategorias } from '@/src/features/orders/hooks';
import { Choice } from '@/src/features/orders/Choice';
import { MapView } from '@/src/features/map/MapView';
import { addressFromCoords, currentLocation, hapticSuccess, LZC_CENTER, MediaPermissionError, pickImages } from '@/src/lib/media';
import { useOperationKey } from '@/src/lib/useOperationKey';
import { toast } from '@/src/ui/toast';

type Cuando = 'pronto' | 'programar';
type Modo = 'elegir' | 'automatica';
type Field = 'categoria' | 'descripcion' | 'direccion' | 'fecha_preferida' | 'hora_preferida';
type Errors = Partial<Record<Field, string>>;

const MAX_FOTOS = 5;
const STEPS = ['¿Qué necesitas arreglar?', '¿Dónde es el servicio?', '¿Cuándo y quién va?'];
const FIELD_STEP: Record<Field, number> = { categoria: 0, descripcion: 0, direccion: 1, fecha_preferida: 2, hora_preferida: 2 };

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function fullAddress(d: Direccion) {
  return [`${d.calle} ${d.numero}${d.interior ? ` int. ${d.interior}` : ''}`, d.colonia, d.cp, d.ciudad].filter(Boolean).join(', ');
}

// RF-43/45-50: pedir un servicio como asistente de 3 pasos (enfoque CILIM: una pregunta por pantalla,
// "Paso N de 3" y Regresar siempre visible). El mapa queda como opción para ajustar el punto.
export default function NuevaSolicitud() {
  const router = useRouter();
  const params = useLocalSearchParams<{ categoria?: string; descripcion?: string; automatica?: string }>();
  const { user } = useSession();
  const categorias = useCategorias();
  const opKey = useOperationKey();

  const [step, setStep] = useState(0);
  const [categoria, setCategoria] = useState<string | null>(params.categoria || null);
  const [descripcion, setDescripcion] = useState(params.descripcion || '');
  const [fotos, setFotos] = useState<LocalFile[]>([]);
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [idDireccion, setIdDireccion] = useState<number | null>(null);
  const [direccion, setDireccion] = useState('');
  const [referencias, setReferencias] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [verMapa, setVerMapa] = useState(false);
  const [cuando, setCuando] = useState<Cuando>('pronto');
  const [fecha, setFecha] = useState<string | null>(null);
  const [hora, setHora] = useState<string | null>(null);
  const [modo, setModo] = useState<Modo>(params.automatica === '0' ? 'elegir' : 'automatica');
  const [locating, setLocating] = useState(false);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  // Direcciones guardadas (RF-123): la predeterminada se propone sola.
  useEffect(() => {
    direccionesApi.lista().then(({ direcciones: list }) => {
      setDirecciones(list);
      const def = list.find((d) => d.predeterminada) || list[0];
      if (def) applySaved(def);
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dirty = !!(descripcion.trim() || fotos.length || referencias.trim() || (categoria && categoria !== params.categoria));
  const catNombre = useMemo(() => categorias.find((c) => c.codigo === categoria)?.nombre, [categorias, categoria]);
  const clear = (k: Field) => setErrors((e) => ({ ...e, [k]: undefined }));

  function applySaved(d: Direccion) {
    setIdDireccion(d.id_direccion);
    setDireccion(fullAddress(d));
    setReferencias(d.referencias || '');
    setCoords(d.latitud && d.longitud ? { lat: Number(d.latitud), lng: Number(d.longitud) } : null);
    clear('direccion');
  }

  function otherAddress() {
    setIdDireccion(null);
    setDireccion('');
    setReferencias('');
    setCoords(null);
  }

  async function locate() {
    setLocating(true);
    const c = await currentLocation();
    setLocating(false);
    if (!c) {
      toast.warning('No pudimos obtener tu ubicación. Escribe la dirección o márcala en el mapa.');
      return;
    }
    setIdDireccion(null);
    setCoords({ lat: c.latitude, lng: c.longitude });
    const text = await addressFromCoords(c);
    if (text) {
      setDireccion(text);
      clear('direccion');
    }
  }

  async function addPhotos(camera: boolean) {
    try {
      const picked = await pickImages({ camera, multiple: !camera, max: MAX_FOTOS - fotos.length });
      if (picked.length) setFotos((f) => [...f, ...picked].slice(0, MAX_FOTOS));
    } catch (e) {
      toast.error(e instanceof MediaPermissionError ? e.message : 'No se pudo cargar la foto.');
    }
  }

  function validate(s: number): Errors {
    const e: Errors = {};
    if (s === 0) {
      if (!categoria) e.categoria = 'Elige qué tipo de servicio necesitas.';
      if (descripcion.trim().length < 10) e.descripcion = 'Cuéntanos la falla con al menos 10 letras.';
    }
    if (s === 1 && direccion.trim().length < 5) e.direccion = 'Escribe la dirección donde será el servicio.';
    if (s === 2 && cuando === 'programar') {
      if (!fecha) e.fecha_preferida = 'Elige el día.';
      if (!hora) e.hora_preferida = 'Elige la hora.';
    }
    return e;
  }

  function next() {
    const e = validate(step);
    setErrors(e);
    if (!Object.keys(e).length) setStep((s) => s + 1);
  }

  async function submit() {
    const e = { ...validate(0), ...validate(1), ...validate(2) };
    setErrors(e);
    const first = (Object.keys(e) as Field[])[0];
    if (first) {
      setStep(FIELD_STEP[first]);
      return;
    }
    setSending(true);
    try {
      const { solicitud } = await solicitudesApi.crear({
        categoria,
        descripcion: descripcion.trim(),
        direccion: direccion.trim(),
        referencias: referencias.trim() || undefined,
        fecha_preferida: cuando === 'programar' ? fecha : null,
        hora_preferida: cuando === 'programar' ? hora : null,
        latitud: coords?.lat ?? null,
        longitud: coords?.lng ?? null,
      }, fotos, opKey.get());
      opKey.reset();
      hapticSuccess();
      const id = String(solicitud.id_solicitud);
      if (modo === 'automatica') {
        try {
          await solicitudesApi.automatica(id);
          toast.success(`Tu solicitud ${solicitud.folio} quedó registrada. Estamos buscando al técnico más cercano.`);
          router.replace({ pathname: '/orden/[id]', params: { id } });
        } catch (err) {
          // La solicitud ya existe: se manda a elegir técnico, donde puede reintentar la búsqueda automática.
          toast.warning(`Tu solicitud ${solicitud.folio} quedó registrada, pero no pudimos buscar técnico en automático: ${errorMessage(err)}`);
          router.replace({ pathname: '/elegir-tecnico/[id]', params: { id } });
        }
      } else {
        toast.success(`Tu solicitud ${solicitud.folio} quedó registrada. Ahora elige a tu técnico.`);
        router.replace({ pathname: '/elegir-tecnico/[id]', params: { id } });
      }
    } catch (err) {
      if (err instanceof ApiError && err.field && err.field in FIELD_STEP) {
        setErrors({ [err.field]: err.message });
        setStep(FIELD_STEP[err.field as Field]);
      }
      toast.error(errorMessage(err));
    } finally {
      setSending(false);
    }
  }

  const blocked = !!user && !user.aprobado;
  const last = step === STEPS.length - 1;

  return (
    <Screen
      header={<AppBar title={`Paso ${step + 1} de 3`} confirmDiscard={dirty && step === 0} fallbackHref="/inicio" onBack={step > 0 ? () => setStep((s) => s - 1) : undefined} />}
      footer={(
        <View style={styles.footer}>
          {step > 0 ? <Button title="Regresar" variant="outlined" icon="arrow-left" onPress={() => setStep((s) => s - 1)} style={styles.flex} full size="xl" /> : null}
          {last
            ? <Button variant="accent" title="Pedir servicio" icon="check" onPress={submit} loading={sending} disabled={blocked} style={styles.flex} full size="xl" />
            : <Button title="Siguiente" iconRight="arrow-right" onPress={next} style={styles.flex} full size="xl" />}
        </View>
      )}
    >
      <View style={styles.progress} accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: 3, now: step + 1 }}>
        {STEPS.map((_, i) => <View key={i} style={[styles.bar, i <= step && styles.barOn]} />)}
      </View>
      <Text variant="headline" accessibilityRole="header" style={styles.question}>{STEPS[step]}</Text>
      {blocked ? <Banner tone="warning" title="Tu cuenta está en revisión" body="Podrás enviar solicitudes en cuanto aprobemos tus documentos." style={styles.gap} /> : null}

      {step === 0 ? (
        <>
          <View style={styles.cats} accessibilityRole="radiogroup">
            {categorias.map((c) => (
              <Pressable
                key={c.codigo}
                accessibilityRole="radio"
                accessibilityState={{ checked: categoria === c.codigo }}
                accessibilityLabel={c.nombre}
                onPress={() => { setCategoria(c.codigo); clear('categoria'); }}
                style={[styles.cat, categoria === c.codigo && styles.catOn]}
              >
                <Icon name={(c.icono as IconName) || 'tool'} size={26} color={categoria === c.codigo ? color.inkOnColor : color.ink} />
                <Text variant="subtitle" weight="700" style={[styles.catText, categoria === c.codigo && { color: color.inkOnColor }]}>{c.nombre}</Text>
              </Pressable>
            ))}
          </View>
          {errors.categoria ? <Text variant="body" tone="danger" style={styles.gap}>{errors.categoria}</Text> : null}
          <TextField
            label="Cuéntanos qué pasa"
            value={descripcion}
            onChangeText={(t) => { setDescripcion(t); clear('descripcion'); }}
            placeholder="Ej. el contacto de la cocina hace chispa"
            multiline
            maxLength={1000}
            error={errors.descripcion}
            style={styles.bigInput}
          />
          <Text variant="overline" style={styles.label}>Fotos de la falla (si quieres)</Text>
          <View style={styles.photos}>
            {fotos.map((f, i) => (
              <View key={f.uri} style={styles.photo}>
                <Image source={{ uri: f.uri }} style={styles.photoImg} accessibilityLabel={`Foto ${i + 1}`} />
                <Pressable accessibilityRole="button" accessibilityLabel={`Quitar foto ${i + 1}`} onPress={() => setFotos((x) => x.filter((_, j) => j !== i))} style={styles.photoRemove} hitSlop={8}>
                  <Icon name="x" size={14} color={color.inkOnColor} />
                </Pressable>
              </View>
            ))}
            {fotos.length < MAX_FOTOS ? (
              <>
                <Pressable accessibilityRole="button" accessibilityLabel="Tomar foto" onPress={() => addPhotos(true)} style={styles.addPhoto}>
                  <Icon name="camera" size={24} color={color.ink} />
                  <Text variant="label">Cámara</Text>
                </Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel="Elegir de la galería" onPress={() => addPhotos(false)} style={styles.addPhoto}>
                  <Icon name="image" size={24} color={color.ink} />
                  <Text variant="label">Galería</Text>
                </Pressable>
              </>
            ) : null}
          </View>
        </>
      ) : null}

      {step === 1 ? (
        <View style={styles.list}>
          {direcciones.map((d) => (
            <Choice key={d.id_direccion} selected={idDireccion === d.id_direccion} icon={d.etiqueta.toLowerCase().includes('trabajo') ? 'briefcase' : 'home'} title={d.etiqueta} body={fullAddress(d)} onPress={() => applySaved(d)} />
          ))}
          {direcciones.length ? <Choice selected={idDireccion === null} icon="plus" title="Otra dirección" onPress={otherAddress} /> : null}
          {idDireccion === null ? (
            <View style={styles.other}>
              <TextField
                label="Dirección"
                value={direccion}
                onChangeText={(t) => { setDireccion(t); clear('direccion'); }}
                placeholder="Calle, número y colonia"
                icon="home"
                maxLength={300}
                error={errors.direccion}
                autoComplete="street-address"
                style={styles.bigInput}
              />
              <TextField label="Cómo encontrarla (si quieres)" value={referencias} onChangeText={setReferencias} placeholder="Portón negro, entre calles…" maxLength={300} style={styles.bigInput} />
              <Button title={locating ? 'Buscando tu ubicación…' : 'Usar mi ubicación actual'} icon="crosshair" variant="outlined" loading={locating} onPress={locate} full size="xl" />
            </View>
          ) : null}
          <Button title={verMapa ? 'Ocultar el mapa' : 'Ajustar el punto en el mapa'} variant="text" icon="map" onPress={() => setVerMapa((v) => !v)} style={styles.center} />
          {verMapa ? (
            <View>
              <View style={styles.map}>
                <MapView
                  center={coords || { lat: LZC_CENTER.latitude, lng: LZC_CENTER.longitude }}
                  zoom={coords ? 16 : 13}
                  markers={coords ? [{ id: 'punto', lat: coords.lat, lng: coords.lng, kind: 'punto', label: 'Aquí', draggable: true }] : []}
                  pickable
                  height={220}
                  onPick={(lat, lng) => { setCoords({ lat, lng }); setIdDireccion(null); }}
                />
              </View>
              <Text variant="body" tone="muted">Toca el mapa para marcar el punto exacto; ayuda al técnico a llegar.</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {step === 2 ? (
        <View style={styles.list}>
          <Text variant="overline" style={styles.label}>¿Cuándo?</Text>
          <Choice selected={cuando === 'pronto'} icon="zap" title="Lo antes posible" onPress={() => setCuando('pronto')} />
          <Choice selected={cuando === 'programar'} icon="calendar" title="Elegir día y hora" onPress={() => setCuando('programar')} />
          {cuando === 'programar' ? (
            <View style={styles.other}>
              <DateField label="Día" value={fecha} onChange={(v) => { setFecha(v); clear('fecha_preferida'); }} min={todayIso()} error={errors.fecha_preferida} />
              <TimeField label="Hora" value={hora} onChange={(v) => { setHora(v); clear('hora_preferida'); }} error={errors.hora_preferida} />
            </View>
          ) : null}

          <Text variant="overline" style={[styles.label, styles.gapTop]}>¿Quién va?</Text>
          <Choice selected={modo === 'automatica'} icon="navigation" title="El técnico más cercano" body="Nosotros lo elegimos por ti." onPress={() => setModo('automatica')} />
          <Choice selected={modo === 'elegir'} icon="users" title="Quiero elegirlo yo" body="Ves su calificación y qué tan cerca está." onPress={() => setModo('elegir')} />

          <View style={styles.summary} accessibilityRole="summary">
            <Text variant="overline" tone="muted">Tu solicitud</Text>
            <Text variant="bodyLg"><Text variant="bodyLg" weight="700">{catNombre || 'Servicio'}</Text> en {direccion || 'tu dirección'}</Text>
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gap: { marginBottom: space.md },
  gapTop: { marginTop: space.lg },
  footer: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  progress: { flexDirection: 'row', gap: space.xs, marginBottom: space.lg },
  bar: { flex: 1, height: 6, borderRadius: 3, backgroundColor: color.line },
  barOn: { backgroundColor: color.accent },
  question: { marginBottom: space.lg },
  cats: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginBottom: space.lg },
  cat: { flexBasis: '47%', flexGrow: 1, minHeight: 96, borderRadius: radius.lg, borderWidth: 1.5, borderColor: color.lineStrong, padding: space.md, gap: space.sm, justifyContent: 'center', backgroundColor: color.surface },
  catOn: { backgroundColor: color.brand, borderColor: color.brand },
  catText: { fontSize: 17, lineHeight: 22 },
  bigInput: { fontSize: 18 },
  label: { marginBottom: space.sm },
  photos: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  photo: { width: 88, height: 88, borderRadius: radius.md, overflow: 'hidden' },
  photoImg: { width: '100%', height: '100%' },
  photoRemove: { position: 'absolute', top: 4, right: 4, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(12,28,64,0.75)', alignItems: 'center', justifyContent: 'center' },
  addPhoto: { width: 88, height: 88, borderRadius: radius.md, borderWidth: 1.5, borderColor: color.lineStrong, alignItems: 'center', justifyContent: 'center', gap: 4 },
  list: { gap: space.md },
  other: { gap: space.sm, marginTop: space.xs },
  center: { alignSelf: 'center' },
  map: { borderRadius: radius.md, overflow: 'hidden', marginBottom: space.sm },
  summary: { backgroundColor: color.groundAlt, borderRadius: radius.md, padding: space.lg, gap: space.xs, marginTop: space.lg },
});
