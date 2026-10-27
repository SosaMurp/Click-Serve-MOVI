import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Button } from '../design/Button';
import { Text } from '../design/Text';
import { color, elevation, radius, space } from '../design/tokens';

// Diálogos propios: Alert.alert no hace nada en react-native-web, así que en la versión web
// ningún aviso, error ni confirmación llegaba a la persona. Esto funciona igual en web y nativo.
type DialogButton = { text: string; value: string; variant?: 'filled' | 'text' | 'danger' | 'tonal' };

type DialogRequest = {
  title: string;
  message?: string;
  buttons: DialogButton[];
  input?: { placeholder?: string; secure?: boolean; initial?: string; keyboardType?: 'default' | 'number-pad' };
  dismissValue: string;
  resolve: (result: { value: string; input?: string }) => void;
};

let enqueue: ((req: DialogRequest) => void) | null = null;

function open(req: Omit<DialogRequest, 'resolve'>): Promise<{ value: string; input?: string }> {
  return new Promise((resolve) => {
    if (!enqueue) {
      // Proveedor aún no montado: no bloquear el flujo.
      resolve({ value: req.dismissValue });
      return;
    }
    enqueue({ ...req, resolve });
  });
}

export const dialog = {
  alert(title: string, message?: string, okText = 'Entendido') {
    return open({ title, message, buttons: [{ text: okText, value: 'ok', variant: 'filled' }], dismissValue: 'ok' }).then(() => undefined);
  },
  async confirm(opts: { title: string; message?: string; confirmText?: string; cancelText?: string; destructive?: boolean }) {
    const res = await open({
      title: opts.title,
      message: opts.message,
      buttons: [
        { text: opts.cancelText || 'Cancelar', value: 'cancel', variant: 'text' },
        { text: opts.confirmText || 'Aceptar', value: 'ok', variant: opts.destructive ? 'danger' : 'filled' },
      ],
      dismissValue: 'cancel',
    });
    return res.value === 'ok';
  },
  async prompt(opts: { title: string; message?: string; placeholder?: string; secure?: boolean; confirmText?: string; keyboardType?: 'default' | 'number-pad' }) {
    const res = await open({
      title: opts.title,
      message: opts.message,
      input: { placeholder: opts.placeholder, secure: opts.secure, keyboardType: opts.keyboardType },
      buttons: [
        { text: 'Cancelar', value: 'cancel', variant: 'text' },
        { text: opts.confirmText || 'Continuar', value: 'ok', variant: 'filled' },
      ],
      dismissValue: 'cancel',
    });
    return res.value === 'ok' ? res.input ?? '' : null;
  },
};

export function DialogHost() {
  const queue = useRef<DialogRequest[]>([]);
  const currentRef = useRef<DialogRequest | null>(null);
  const [current, setCurrent] = useState<DialogRequest | null>(null);
  const [input, setInput] = useState('');

  const next = useCallback(() => {
    const req = queue.current.shift() || null;
    currentRef.current = req;
    setInput(req?.input?.initial || '');
    setCurrent(req);
  }, []);

  useEffect(() => {
    enqueue = (req) => {
      queue.current.push(req);
      if (!currentRef.current) next();
    };
    return () => {
      enqueue = null;
    };
  }, [next]);

  // Un segundo toque antes de que React vuelva a pintar trae el diálogo anterior en `current`;
  // si ya no es el vigente se ignora, para no cerrar ni saltar el siguiente de la cola.
  const finish = (value: string) => {
    if (!current || currentRef.current !== current) return;
    current.resolve({ value, input });
    next();
  };

  return (
    <Modal visible={!!current} transparent animationType="fade" onRequestClose={() => finish(current?.dismissValue || 'cancel')} statusBarTranslucent>
      <Pressable style={styles.scrim} onPress={() => finish(current?.dismissValue || 'cancel')} accessibilityLabel="Cerrar diálogo">
        <Pressable style={styles.panel} onPress={() => {}} accessibilityRole={Platform.OS === 'web' ? undefined : 'alert'} accessibilityViewIsModal>
          {current ? (
            <>
              <Text variant="title" style={styles.title}>{current.title}</Text>
              {current.message ? <Text variant="body" tone="soft" style={styles.message}>{current.message}</Text> : null}
              {current.input ? (
                <TextInput
                  autoFocus
                  value={input}
                  onChangeText={setInput}
                  placeholder={current.input.placeholder}
                  placeholderTextColor={color.inkMuted}
                  secureTextEntry={current.input.secure}
                  keyboardType={current.input.keyboardType || 'default'}
                  style={styles.input}
                  onSubmitEditing={() => finish('ok')}
                />
              ) : null}
              <View style={styles.actions}>
                {current.buttons.map((b) => (
                  <Button key={b.value} title={b.text} variant={b.variant || 'text'} onPress={() => finish(b.value)} />
                ))}
              </View>
            </>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: color.scrim, alignItems: 'center', justifyContent: 'center', padding: space.xl },
  panel: { width: '100%', maxWidth: 420, backgroundColor: color.surface, borderRadius: radius.xl, padding: space.xl, ...elevation[2] },
  title: { marginBottom: space.sm },
  message: { marginBottom: space.lg },
  input: {
    borderWidth: 1.5, borderColor: color.line, borderRadius: radius.md, height: 54, paddingHorizontal: space.lg, backgroundColor: color.surfaceSunk,
    fontSize: 16, color: color.ink, marginBottom: space.lg,
  },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', flexWrap: 'wrap', gap: space.sm },
});
