import React, { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AppBar, Banner, Button, Chip, color, DateField, Icon, IconName, radius, Screen, Segmented, space, Surface, Text, TextField, TimeField,
} from '@/src/design';
import { ApiError, errorMessage } from '@/src/api/client';
import { direccionesApi, solicitudesApi } from '@/src/api/endpoints';
import type { Direccion, LocalFile } from '@/src/api/types';
import { useSession } from '@/src/state/session';
import { useCategorias } from '@/src/features/orders/hooks';
import { MapView } from '@/src/features/map/MapView';
import { addressFromCoords, currentLocation, hapticSuccess, LZC_CENTER, MediaPermissionError, pickImages } from '@/src/lib/media';
import { useOperationKey } from '@/src/lib/useOperationKey';
import { toast } from '@/src/ui/toast';

type Cuando = 'pronto' | 'programar';
type Modo = 'elegir' | 'automatica';
type Errors = Partial<Record<'categoria' | 'descripcion' | 'direccion' | 'fecha_preferida' | 'hora_preferida', string>>;

const MAX_FOTOS = 5;

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function fullAddress(d: Direccion) {
  return [`${d.calle} ${d.numero}${d.interior ? ` int. ${d.interior}` : ''}`, d.colonia, d.cp, d.ciudad].filter(Boolean).join(', ');
}

// RF-43/45-50: crear una solicitud. Se arma como un panel de búsqueda: qué, dónde, cuándo y cómo elegir técnico.
export default function NuevaSolicitud() {
  const router = useRouter();
  const params = useLocalSearchParams<{ categoria?: string; descripcion?: string; automatica?: string }>();
  const { user } = useSession();
  const categorias = useCategorias();
  const opKey = useOperationKey();

  const [categoria, setCategoria] = useState<string | null>(params.categoria || null);
  const [descripcion, setDescripcion] = useState(params.descripcion || '');
  const [fotos, setFotos] = useState<LocalFile[]>([]);
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [idDireccion, setIdDireccion] = useState<number | null>(null);
  const [direccion, setDireccion] = useState('');
  const [referencias, setReferencias] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [cuando, setCuando] = useState<Cuando>('pronto');
  const [fecha, setFecha] = useState<string | null>(null);
  const [hora, setHora] = useState<string | null>(null);
  const [modo, setModo] = useState<Modo>(params.automatica === '1' ? 'automatica' : 'elegir');
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

  function applySaved(d: Direccion) {
    setIdDireccion(d.id_direccion);
    setDireccion(fullAddress(d));
    setReferencias(d.referencias || '');
    setCoords(d.latitud && d.longitud ? { lat: Number(d.latitud), lng: Number(d.longitud) } : null);
    setErrors((e) => ({ ...e, direccion: undefined }));
  }

  async function locate() {
    setLocating(true);
    const c = await currentLocation();
    setLocating(false);
    if (!c) {
      toast.warning('No pudimos obtener tu ubicación. Escribe la dirección o marca el punto en el mapa.');
      return;
    }
    setIdDireccion(null);
    setCoords({ lat: c.latitude, lng: c.longitude });
    const text = await addressFromCoords(c);
    if (text) setDireccion(text);
  }

  async function addPhotos(camera: boolean) {
    try {
      const picked = await pickImages({ camera, multiple: !camera, max: MAX_FOTOS - fotos.length });
      if (picked.length) setFotos((f) => [...f, ...picked].slice(0, MAX_FOTOS));
    } catch (e) {
      toast.error(e instanceof MediaPermissionError ? e.message : 'No se pudo cargar la foto.');
    }
  }

  function clearAll() {
    setCategoria(null);
    setDescripcion('');
    setFotos([]);
    setCuando('pronto');
    setFecha(null);
    setHora(null);
    setModo('elegir');
    setErrors({});
  }

  function validate(): Errors {
    const e: Errors = {};
    if (!categoria) e.categoria = 'Elige qué tipo de servicio necesitas.';
    if (descripcion.trim().length < 10) e.descripcion = 'Cuéntanos la falla con al menos 10 caracteres.';
    if (direccion.trim().length < 5) e.direccion = 'Indica la dirección donde será el servicio.';
    if (cuando === 'programar') {
      if (!fecha) e.fecha_preferida = 'Elige el día.';
      if (!hora) e.hora_preferida = 'Elige la hora.';
    }
    return e;
  }

  async function submit() {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      toast.warning('Revisa los campos marcados.');
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
          toast.success(`Solicitud ${solicitud.folio} enviada. Buscamos al técnico más cercano.`);
          router.replace({ pathname: '/orden/[id]', params: { id } });
        } catch (err) {
          // La solicitud ya existe: se manda a elegir técnico, donde puede reintentar la búsqueda automática.
          toast.warning(`Solicitud ${solicitud.folio} creada, pero no pudimos iniciar la búsqueda automática: ${errorMessage(err)}`);
          router.replace({ pathname: '/elegir-tecnico/[id]', params: { id } });
        }
      } else {
        router.replace({ pathname: '/elegir-tecnico/[id]', params: { id } });
      }
    } catch (err) {
      if (err instanceof ApiError && err.field) setErrors({ [err.field]: err.message });
      toast.error(errorMessage(err));
    } finally {
      setSending(false);
    }
  }

  const blocked = !!user && !user.aprobado;

  return (
    <Screen
      header={<AppBar title="Nueva solicitud" confirmDiscard={dirty} fallbackHref="/inicio" />}
      footer={(
        <View style={styles.footer}>
          <Button title="Limpiar todo" variant="text" onPress={clearAll} disabled={sending} />
          <Button
            title={modo === 'automatica' ? 'Pedir al más cercano' : 'Buscar técnico'}
            icon={modo === 'automatica' ? 'zap' : 'search'}
            onPress={submit}
            loading={sending}
            disabled={blocked}
            size="lg"
            style={styles.flex}
          />
        </View>
      )}
    >
      {blocked ? <Banner tone="warning" title="Tu cuenta está en revisión" body="Podrás enviar solicitudes en cuanto aprobemos tus documentos." style={styles.gap} /> : null}

      <Block icon="grid" title="¿Qué necesitas?" value={catNombre} error={errors.categoria}>
        <View style={styles.chips}>
          {categorias.map((c) => (
            <Chip key={c.codigo} label={c.nombre} icon={(c.icono as IconName) || 'tool'} selected={categoria === c.codigo} onPress={() => { setCategoria(c.codigo); setErrors((x) => ({ ...x, categoria: undefined })); }} />
          ))}
        </View>
      </Block>

      <Block icon="edit-3" title="Describe la falla">
        <TextField
          label="Descripción"
          hideLabel
          value={descripcion}
          onChangeText={(t) => { setDescripcion(t); if (errors.descripcion) setErrors((x) => ({ ...x, descripcion: undefined })); }}
          placeholder="Qué pasa, desde cuándo y qué ya intentaste"
          multiline
          maxLength={1000}
          counter
          error={errors.descripcion}
        />
        <Text variant="label" tone="soft" style={styles.subLabel}>Fotos de la falla (opcional, hasta {MAX_FOTOS})</Text>
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
                <Icon name="camera" size={22} color={color.brandInk} />
                <Text variant="caption" tone="brand">Cámara</Text>
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="Elegir de la galería" onPress={() => addPhotos(false)} style={styles.addPhoto}>
                <Icon name="image" size={22} color={color.brandInk} />
                <Text variant="caption" tone="brand">Galería</Text>
              </Pressable>
            </>
          ) : null}
        </View>
      </Block>

      <Block icon="map-pin" title="¿Dónde?">
        {direcciones.length ? (
          <View style={styles.chips}>
            {direcciones.map((d) => (
              <Chip key={d.id_direccion} label={d.etiqueta} icon={d.etiqueta.toLowerCase().includes('trabajo') ? 'briefcase' : 'home'} selected={idDireccion === d.id_direccion} onPress={() => applySaved(d)} />
            ))}
            <Chip label="Otra" icon="plus" selected={idDireccion === null} onPress={() => { setIdDireccion(null); setDireccion(''); setReferencias(''); setCoords(null); }} />
          </View>
        ) : null}
        <TextField
          label="Dirección"
          value={direccion}
          onChangeText={(t) => { setDireccion(t); setIdDireccion(null); if (errors.direccion) setErrors((x) => ({ ...x, direccion: undefined })); }}
          placeholder="Calle, número, colonia"
          icon="home"
          maxLength={300}
          error={errors.direccion}
          autoComplete="street-address"
        />
        <TextField label="Referencias (opcional)" value={referencias} onChangeText={setReferencias} placeholder="Portón negro, entre calles…" maxLength={300} />
        <Button title={locating ? 'Buscando tu ubicación…' : 'Usar mi ubicación actual'} icon="crosshair" variant="tonal" loading={locating} onPress={locate} full />
        <View style={styles.map}>
          <MapView
            center={coords || { lat: LZC_CENTER.latitude, lng: LZC_CENTER.longitude }}
            zoom={coords ? 16 : 13}
            markers={coords ? [{ id: 'punto', lat: coords.lat, lng: coords.lng, kind: 'punto', label: 'Aquí', draggable: true }] : []}
            pickable
            height={180}
            onPick={(lat, lng) => { setCoords({ lat, lng }); setIdDireccion(null); }}
          />
        </View>
        <Text variant="caption" tone="muted">{coords ? 'Toca el mapa para mover el punto exacto.' : 'Toca el mapa para marcar el punto exacto (ayuda al técnico a llegar).'}</Text>
      </Block>

      <Block icon="calendar" title="¿Cuándo?" value={cuando === 'pronto' ? 'Lo antes posible' : undefined}>
        <Segmented<Cuando>
          value={cuando}
          onChange={setCuando}
          options={[{ value: 'pronto', label: 'Lo antes posible', icon: 'zap' }, { value: 'programar', label: 'Programar', icon: 'clock' }]}
        />
        {cuando === 'programar' ? (
          <View style={styles.when}>
            <DateField label="Día" value={fecha} onChange={(v) => { setFecha(v); setErrors((x) => ({ ...x, fecha_preferida: undefined })); }} min={todayIso()} error={errors.fecha_preferida} />
            <TimeField label="Hora" value={hora} onChange={(v) => { setHora(v); setErrors((x) => ({ ...x, hora_preferida: undefined })); }} error={errors.hora_preferida} />
          </View>
        ) : null}
      </Block>

      <Block icon="users" title="¿Cómo eliges al técnico?">
        <View style={styles.modes}>
          <ModeCard selected={modo === 'elegir'} icon="list" title="Elegirlo yo" body="Compara calificación, distancia y reseñas." onPress={() => setModo('elegir')} />
          <ModeCard selected={modo === 'automatica'} icon="zap" title="El más cercano" body="Lo asignamos en automático." onPress={() => setModo('automatica')} />
        </View>
      </Block>
    </Screen>
  );
}

function Block({ icon, title, value, error, children }: { icon: IconName; title: string; value?: string; error?: string; children: React.ReactNode }) {
  return (
    <Surface style={styles.block}>
      <View style={styles.blockHead}>
        <View style={[styles.blockIcon, error ? { backgroundColor: color.dangerSoft } : null]}>
          <Icon name={icon} size={18} color={error ? color.dangerInk : color.brandInk} />
        </View>
        <Text variant="title" style={styles.flex} accessibilityRole="header">{title}</Text>
        {value ? <Text variant="label" tone="muted" numberOfLines={1} style={styles.blockValue}>{value}</Text> : null}
      </View>
      {error ? <Text variant="caption" tone="danger" style={styles.blockError}>{error}</Text> : null}
      <View style={styles.blockBody}>{children}</View>
    </Surface>
  );
}

function ModeCard({ selected, icon, title, body, onPress }: { selected: boolean; icon: IconName; title: string; body: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${title}. ${body}`}
      onPress={onPress}
      style={[styles.mode, selected ? styles.modeOn : null]}
    >
      <View style={[styles.modeIcon, { backgroundColor: selected ? color.surface : color.brandSoft }]}>
        <Icon name={icon} size={18} color={color.brandInk} />
      </View>
      <Text variant="subtitle">{title}</Text>
      <Text variant="caption" tone="soft">{body}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gap: { marginBottom: space.md },
  footer: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  block: { marginBottom: space.md },
  blockHead: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  blockIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: color.brandSoft, alignItems: 'center', justifyContent: 'center' },
  blockValue: { maxWidth: '45%' },
  blockBody: { marginTop: space.md, gap: space.sm },
  blockError: { marginTop: space.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  subLabel: { marginTop: space.xs },
  photos: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  photo: { width: 76, height: 76, borderRadius: radius.sm, overflow: 'hidden' },
  photoImg: { width: '100%', height: '100%' },
  photoRemove: { position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(15,30,46,0.7)', alignItems: 'center', justifyContent: 'center' },
  addPhoto: { width: 76, height: 76, borderRadius: radius.sm, backgroundColor: color.brandSoft, alignItems: 'center', justifyContent: 'center', gap: 2 },
  map: { borderRadius: radius.md, overflow: 'hidden', marginTop: space.xs },
  when: { marginTop: space.sm },
  modes: { flexDirection: 'row', gap: space.sm },
  mode: { flex: 1, minHeight: 120, borderRadius: radius.md, padding: space.md, gap: 4, backgroundColor: color.surfaceSunk, borderWidth: 2, borderColor: 'transparent' },
  modeOn: { backgroundColor: color.accentSoft, borderColor: color.accent },
  modeIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
});
