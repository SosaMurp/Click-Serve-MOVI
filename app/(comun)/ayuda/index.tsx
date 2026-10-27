import React, { useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppBar, color, EmptyState, font, Icon, IconName, ListItem, radius, Screen, SectionHeader, space, Surface, Text } from '@/src/design';
import { ARTICLES, HelpTopic, SUPPORT_EMAIL, SUPPORT_PHONE, TOPICS } from '@/src/features/help/content';

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// RF-50/88/92: centro de ayuda con búsqueda, temas, y contacto por chat, correo o teléfono.
export default function Ayuda() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [topic, setTopic] = useState<HelpTopic | null>(null);

  const results = useMemo(() => {
    const term = norm(q.trim());
    return ARTICLES.filter((a) => (!topic || a.topic === topic) && (!term || norm(`${a.title} ${a.summary} ${a.body.join(' ')}`).includes(term)));
  }, [q, topic]);

  return (
    <Screen header={<AppBar title="Centro de ayuda" />}>
      <Text variant="display" style={styles.title}>¿Cómo te{'\n'}ayudamos?</Text>
      <View style={styles.search}>
        <Icon name="search" size={20} color={color.inkMuted} />
        <TextInput value={q} onChangeText={setQ} placeholder="Busca: pago, cancelar, garantía…" placeholderTextColor={color.inkMuted} style={styles.input} accessibilityLabel="Buscar en la ayuda" />
        {q ? <Pressable accessibilityRole="button" accessibilityLabel="Borrar búsqueda" onPress={() => setQ('')} hitSlop={8}><Icon name="x" size={18} color={color.inkMuted} /></Pressable> : null}
      </View>

      <View style={styles.grid}>
        {TOPICS.map((t) => {
          const on = topic === t.key;
          return (
            <Pressable
              key={t.key}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              onPress={() => setTopic(on ? null : t.key)}
              style={[styles.topic, { backgroundColor: on ? color.accent : t.tint === 'sky' ? color.brandSoft : t.tint === 'peach' ? color.accentSoft : color.surface }]}
            >
              <View style={[styles.topicIcon, t.tint === 'plain' && !on ? { backgroundColor: color.brandSoft } : null]}><Icon name={t.icon as IconName} size={18} color={color.brandInk} /></View>
              <Text variant="subtitle" numberOfLines={2}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <SectionHeader title={topic ? TOPICS.find((t) => t.key === topic)?.label || 'Artículos' : q ? 'Resultados' : 'Artículos populares'} />
      {results.length ? (
        <Surface padded={false}>
          {results.slice(0, q || topic ? undefined : 6).map((a) => (
            <ListItem key={a.slug} icon="book-open" iconTone="brand" title={a.title} subtitle={a.summary} onPress={() => router.push({ pathname: '/ayuda/[slug]', params: { slug: a.slug } })} />
          ))}
        </Surface>
      ) : <EmptyState icon="search" title="Sin resultados" body="Prueba con otras palabras o escríbenos." />}

      <SectionHeader title="¿No encontraste lo que buscabas?" />
      <Surface padded={false}>
        <ListItem icon="message-circle" iconTone="accent" title="Chat con soporte" subtitle="Abre un caso y te responde un asesor" onPress={() => router.push('/soporte/nuevo')} />
        <ListItem icon="mail" iconTone="brand" title="Escríbenos un correo" subtitle={SUPPORT_EMAIL} onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Ayuda Click & Serve')}`)} />
        {SUPPORT_PHONE ? <ListItem icon="phone" iconTone="success" title="Llámanos" subtitle={SUPPORT_PHONE} onPress={() => Linking.openURL(`tel:${SUPPORT_PHONE}`)} /> : null}
      </Surface>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginBottom: space.lg },
  search: { flexDirection: 'row', alignItems: 'center', gap: space.sm, backgroundColor: color.surface, borderRadius: radius.full, paddingHorizontal: space.lg, minHeight: 54 },
  input: { flex: 1, fontSize: 16, fontFamily: font.body, color: color.ink, minHeight: 48, outlineStyle: 'none' } as object,
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md, justifyContent: 'space-between', marginTop: space.lg },
  topic: { width: '48%', minHeight: 96, borderRadius: radius.lg, padding: space.lg, gap: space.sm, justifyContent: 'space-between' },
  topicIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: color.surface, alignItems: 'center', justifyContent: 'center' },
});
