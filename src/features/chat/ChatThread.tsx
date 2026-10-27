import React, { useEffect, useRef, useState } from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, Icon, IconButton, radius, space, Text } from '../../design';
import { fileUrl } from '../../api/client';
import type { LocalFile } from '../../api/types';
import { formatTime12 } from '../../lib/format';
import { pickDocument } from '../../lib/media';
import { toast } from '../../ui/toast';

export type ChatItem = {
  id: string | number;
  mine: boolean;
  author?: string;
  text: string | null;
  attachmentUrl?: string | null;
  attachmentType?: string | null;
  attachmentName?: string | null;
  time: string;
};

const hhmm = (iso: string) => {
  const d = new Date(iso);
  return formatTime12(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
};

// RF-108/112: conversación con burbujas, adjuntos (foto o PDF) y caja de texto fija abajo.
export function ChatThread({ items, onSend, disabled, disabledText, emptyText }: {
  items: ChatItem[];
  onSend: (text: string, file: LocalFile | null) => Promise<boolean>;
  disabled?: boolean;
  disabledText?: string;
  emptyText?: string;
}) {
  const insets = useSafeAreaInsets();
  const scroll = useRef<ScrollView>(null);
  const [text, setText] = useState('');
  const [file, setFile] = useState<LocalFile | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);
    return () => clearTimeout(t);
  }, [items.length]);

  async function attach() {
    try {
      const doc = await pickDocument();
      if (doc) setFile(doc);
    } catch {
      toast.error('No se pudo adjuntar el archivo.');
    }
  }

  async function send() {
    if ((!text.trim() && !file) || sending) return;
    setSending(true);
    const ok = await onSend(text.trim(), file);
    setSending(false);
    if (ok) {
      setText('');
      setFile(null);
    }
  }

  return (
    <View style={styles.flex}>
      <ScrollView ref={scroll} style={styles.flex} contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
        {!items.length ? <Text variant="bodySm" tone="muted" align="center" style={styles.empty}>{emptyText || 'Aún no hay mensajes.'}</Text> : null}
        {items.map((m, i) => {
          const showAuthor = !m.mine && m.author && items[i - 1]?.author !== m.author;
          const isImage = m.attachmentType?.startsWith('image/');
          const url = fileUrl(m.attachmentUrl);
          return (
            <View key={m.id} style={[styles.row, m.mine ? styles.rowMine : null]}>
              <View style={[styles.bubble, m.mine ? styles.mine : styles.theirs]}>
                {showAuthor ? <Text variant="caption" tone="brand" style={styles.author}>{m.author}</Text> : null}
                {url && isImage ? (
                  <Pressable accessibilityRole="imagebutton" accessibilityLabel="Abrir imagen" onPress={() => Linking.openURL(url)}>
                    <Image source={{ uri: url }} style={styles.image} resizeMode="cover" />
                  </Pressable>
                ) : null}
                {url && !isImage ? (
                  <Pressable accessibilityRole="link" onPress={() => Linking.openURL(url)} style={styles.file}>
                    <Icon name="file-text" size={18} color={color.brandInk} />
                    <Text variant="label" tone="brand" numberOfLines={1} style={styles.flex}>{m.attachmentName || 'Documento'}</Text>
                  </Pressable>
                ) : null}
                {m.text ? <Text variant="body" selectable>{m.text}</Text> : null}
                <Text variant="caption" tone="muted" style={styles.time}>{hhmm(m.time)}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {disabled ? (
        <View style={[styles.closed, { paddingBottom: insets.bottom + space.md }]}>
          <Text variant="bodySm" tone="muted" align="center">{disabledText || 'Esta conversación está cerrada.'}</Text>
        </View>
      ) : (
        <View style={[styles.composer, { paddingBottom: insets.bottom + space.sm }]}>
          {file ? (
            <View style={styles.attached}>
              <Icon name={file.type.startsWith('image/') ? 'image' : 'file-text'} size={16} color={color.brandInk} />
              <Text variant="caption" numberOfLines={1} style={styles.flex}>{file.name}</Text>
              <IconButton icon="x" label="Quitar adjunto" size={16} onPress={() => setFile(null)} />
            </View>
          ) : null}
          <View style={styles.inputRow}>
            <IconButton icon="paperclip" label="Adjuntar foto o PDF" onPress={attach} />
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Escribe un mensaje"
              placeholderTextColor={color.inkMuted}
              style={styles.input}
              multiline
              maxLength={2000}
              accessibilityLabel="Mensaje"
              onSubmitEditing={send}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Enviar mensaje"
              onPress={send}
              disabled={sending || (!text.trim() && !file)}
              style={[styles.send, (sending || (!text.trim() && !file)) && { opacity: 0.45 }]}
            >
              <Icon name="send" size={20} color={color.ink} />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: space.lg, gap: space.sm, width: '100%', maxWidth: 640, alignSelf: 'center' },
  empty: { marginTop: space.xxl },
  row: { flexDirection: 'row' },
  rowMine: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '82%', borderRadius: radius.md, paddingHorizontal: space.md, paddingVertical: space.sm, gap: 4 },
  mine: { backgroundColor: color.brandSoft, borderBottomRightRadius: 6 },
  theirs: { backgroundColor: color.surface, borderBottomLeftRadius: 6 },
  author: { marginBottom: 2 },
  image: { width: 200, height: 150, borderRadius: radius.sm, backgroundColor: color.groundAlt },
  file: { flexDirection: 'row', alignItems: 'center', gap: space.sm, backgroundColor: color.surface, borderRadius: radius.sm, padding: space.sm, minWidth: 180 },
  time: { alignSelf: 'flex-end', fontSize: 11 },
  closed: { padding: space.md, backgroundColor: color.surface, borderTopWidth: 1, borderTopColor: color.line },
  composer: { backgroundColor: color.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, paddingHorizontal: space.sm, paddingTop: space.sm },
  attached: { flexDirection: 'row', alignItems: 'center', gap: space.sm, backgroundColor: color.brandSoft, borderRadius: radius.sm, paddingLeft: space.md, marginHorizontal: space.sm, marginBottom: space.xs },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: space.xs, width: '100%', maxWidth: 640, alignSelf: 'center' },
  input: { flex: 1, minHeight: 48, maxHeight: 120, borderRadius: 24, backgroundColor: color.surfaceSunk, paddingHorizontal: space.lg, paddingTop: 13, paddingBottom: 13, fontSize: 16, fontFamily: font.body, color: color.ink, outlineStyle: 'none' } as object,
  send: { width: 48, height: 48, borderRadius: 24, backgroundColor: color.accent, alignItems: 'center', justifyContent: 'center' },
});
