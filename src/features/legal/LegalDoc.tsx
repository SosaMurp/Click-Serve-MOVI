import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppBar, Banner, Screen, space, Text } from '../../design';

export type LegalSection = { title: string; paragraphs: string[] };

// Documento de lectura (aviso de privacidad, términos, artículos de ayuda).
export function LegalDoc({ title, updated, intro, sections, draft = true }: { title: string; updated: string; intro?: string; sections: LegalSection[]; draft?: boolean }) {
  return (
    <Screen header={<AppBar title={title} />}>
      {draft ? <Banner tone="warning" title="Borrador para revisión legal" body="El texto definitivo debe validarlo un abogado antes del lanzamiento." style={styles.banner} /> : null}
      <Text variant="caption" tone="muted">Actualizado: {updated}</Text>
      {intro ? <Text variant="body" tone="soft" style={styles.intro}>{intro}</Text> : null}
      {sections.map((s) => (
        <View key={s.title} style={styles.section}>
          <Text variant="title" accessibilityRole="header" style={styles.title}>{s.title}</Text>
          {s.paragraphs.map((p, i) => <Text key={i} variant="body" tone="soft" style={styles.p}>{p}</Text>)}
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: { marginBottom: space.lg },
  intro: { marginTop: space.md },
  section: { marginTop: space.xl, maxWidth: 680 },
  title: { marginBottom: space.sm },
  p: { marginBottom: space.md },
});
