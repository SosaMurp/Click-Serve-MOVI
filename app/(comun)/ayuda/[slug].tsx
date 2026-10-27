import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppBar, Button, EmptyState, ListItem, Pill, Screen, SectionHeader, space, Surface, Text } from '@/src/design';
import { ARTICLES, articleBySlug, TOPICS } from '@/src/features/help/content';

// RF-50/92: artículo de ayuda con relacionados y salida a soporte.
export default function Articulo() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const a = articleBySlug(slug);

  if (!a) {
    return (
      <Screen header={<AppBar title="Ayuda" fallbackHref="/ayuda" />}>
        <EmptyState icon="book-open" title="Artículo no encontrado" action={<Button title="Ir al centro de ayuda" onPress={() => router.replace('/ayuda')} />} />
      </Screen>
    );
  }

  const related = ARTICLES.filter((x) => x.topic === a.topic && x.slug !== a.slug);
  return (
    <Screen header={<AppBar title="Ayuda" fallbackHref="/ayuda" />}>
      <Pill label={TOPICS.find((t) => t.key === a.topic)?.label || a.topic} tone="brand" size="sm" />
      <Text variant="headline" style={styles.title} accessibilityRole="header">{a.title}</Text>
      <Surface>
        {a.body.map((p, i) => <Text key={i} variant="body" style={i ? styles.p : undefined}>{p}</Text>)}
      </Surface>

      <Surface tint="sky" style={styles.helpful}>
        <Text variant="subtitle">¿Necesitas más ayuda?</Text>
        <View style={styles.row}>
          <Button title="Contactar a soporte" icon="message-circle" variant="filled" onPress={() => router.push('/soporte/nuevo')} />
        </View>
      </Surface>

      {related.length ? (
        <>
          <SectionHeader title="Relacionados" />
          <Surface padded={false}>
            {related.map((r) => <ListItem key={r.slug} icon="book-open" iconTone="brand" title={r.title} subtitle={r.summary} onPress={() => router.replace({ pathname: '/ayuda/[slug]', params: { slug: r.slug } })} />)}
          </Surface>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: space.sm, marginBottom: space.lg },
  p: { marginTop: space.md },
  helpful: { marginTop: space.lg, gap: space.sm },
  row: { flexDirection: 'row', gap: space.sm },
});
