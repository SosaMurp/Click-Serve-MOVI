import React, { useState } from 'react';
import { Platform, Share, StyleSheet } from 'react-native';
import { AppBar, Banner, Button, ListItem, Screen, SectionHeader, space, Surface, Text } from '@/src/design';
import { ApiError, errorMessage } from '@/src/api/client';
import { cuentaApi } from '@/src/api/endpoints';
import { useSession } from '@/src/state/session';
import { dialog } from '@/src/ui/dialog';
import { toast } from '@/src/ui/toast';

// Derechos ARCO (LFPDPPP): descargar la información y eliminar la cuenta (RF-16).
export default function MisDatos() {
  const { signOut } = useSession();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function exportData() {
    setExporting(true);
    try {
      const data = await cuentaApi.exportData();
      const json = JSON.stringify(data, null, 2);
      if (Platform.OS === 'web') {
        const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = `click-serve-mis-datos-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else {
        await Share.share({ title: 'Mis datos de Click & Serve', message: json });
      }
      toast.success('Tu información está lista.');
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setExporting(false);
    }
  }

  async function deleteAccount() {
    const sure = await dialog.confirm({
      title: '¿Eliminar tu cuenta?',
      message: 'Borraremos tus datos personales, fotos y documentos. Los registros de pagos se conservan de forma anónima el tiempo que exige la ley. Esta acción no se puede deshacer.',
      confirmText: 'Continuar',
      destructive: true,
    });
    if (!sure) return;
    const password = await dialog.prompt({ title: 'Confirma con tu contraseña', placeholder: 'Contraseña', secure: true, confirmText: 'Eliminar cuenta' });
    if (!password) return;
    setDeleting(true);
    try {
      const r = await cuentaApi.deleteAccount(password);
      await signOut({ remote: false, message: r.mensaje || 'Tu cuenta fue eliminada.' });
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : errorMessage(e));
      setDeleting(false);
    }
  }

  return (
    <Screen header={<AppBar title="Mis datos" />}>
      <Text variant="body" tone="soft">Tus datos personales te pertenecen. Puedes consultarlos, descargarlos o pedir que los eliminemos.</Text>
      <SectionHeader title="Descargar" />
      <Surface padded={false}>
        <ListItem icon="download" iconTone="brand" title="Descargar mi información" subtitle="Perfil, direcciones, servicios, pagos y mensajes en un archivo JSON" onPress={exportData} disabled={exporting} />
      </Surface>
      <SectionHeader title="Eliminar cuenta" />
      <Banner tone="warning" title="Antes de eliminar" body="No debes tener servicios en curso ni saldo pendiente de retirar. Si tienes dudas, escríbenos a soporte." />
      <Button title="Eliminar mi cuenta" variant="danger" icon="trash-2" onPress={deleteAccount} loading={deleting} full style={styles.mt} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  mt: { marginTop: space.lg },
});
