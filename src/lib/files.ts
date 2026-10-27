import { Platform } from 'react-native';
import type { LocalFile } from '../api/types';

// Agrega un archivo local a un FormData: en web se convierte en Blob; en nativo se pasa la URI.
export async function appendFile(form: FormData, field: string, file: LocalFile): Promise<void> {
  if (Platform.OS === 'web') {
    const blob = await (await fetch(file.uri)).blob();
    form.append(field, blob, file.name);
    return;
  }
  form.append(field, { uri: file.uri, name: file.name, type: file.type } as unknown as Blob);
}

export async function buildForm(fields: Record<string, unknown>, files: Record<string, LocalFile | LocalFile[] | null | undefined> = {}): Promise<FormData> {
  const form = new FormData();
  for (const [k, v] of Object.entries(fields)) {
    if (v !== undefined && v !== null && v !== '') form.append(k, String(v));
  }
  for (const [k, v] of Object.entries(files)) {
    if (!v) continue;
    for (const f of Array.isArray(v) ? v : [v]) await appendFile(form, k, f);
  }
  return form;
}
