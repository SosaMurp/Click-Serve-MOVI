import React from 'react';
import { LegalDoc } from '@/src/features/legal/LegalDoc';

// RD-011: aviso de privacidad integral conforme a la LFPDPPP, con derechos ARCO.
export default function AvisoPrivacidad() {
  return (
    <LegalDoc
      title="Aviso de privacidad"
      updated="27 de octubre de 2026"
      intro="Click & Serve conecta a personas que necesitan un servicio técnico con técnicos verificados en Lázaro Cárdenas, Michoacán. Este aviso explica qué datos personales tratamos, para qué y cómo puedes ejercer tus derechos, conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)."
      sections={[
        {
          title: 'Responsable',
          paragraphs: ['Click & Serve es responsable del tratamiento de tus datos. La razón social y el domicilio fiscal se publicarán en este aviso antes del lanzamiento. Puedes contactarnos desde Cuenta › Soporte en la app.'],
        },
        {
          title: 'Datos que tratamos',
          paragraphs: [
            'Identificación y contacto: nombre, apellidos, fecha de nacimiento, correo y teléfono.',
            'Identidad: fotografías de tu INE (frente y reverso) y de tu rostro, y el resultado de la verificación facial. Son datos sensibles; solo los tratamos con tu consentimiento expreso al registrarte.',
            'Ubicación: la dirección del servicio y, si eres técnico, tu ubicación mientras estás en línea o en camino a un servicio.',
            'Financieros: de tus tarjetas solo guardamos la marca, los últimos 4 dígitos, la vigencia y un token emitido por la pasarela de pago; nunca el número completo ni el código de seguridad. Si eres técnico, tu CLABE para depositarte.',
            'Del servicio: solicitudes, fotos, cotizaciones, evidencias, mensajes, calificaciones y reportes.',
          ],
        },
        {
          title: 'Para qué los usamos',
          paragraphs: [
            'Finalidades necesarias: crear y proteger tu cuenta, verificar tu identidad, asignar técnicos por cercanía y especialidad, compartir con la otra parte solo lo necesario para el servicio, procesar pagos y retiros, emitir comprobantes, atender reportes, garantías y soporte, y cumplir obligaciones fiscales y legales.',
            'Finalidades secundarias: enviarte avisos sobre nuevas funciones o promociones. Puedes negarte en Cuenta › Notificaciones sin afectar el servicio.',
          ],
        },
        {
          title: 'Con quién los compartimos',
          paragraphs: [
            'Con el técnico o el cliente de tu servicio: nombre, teléfono y dirección solo cuando el servicio ya fue asignado.',
            'Con la pasarela de pago (Conekta) para cobrar con tu tarjeta, y con autoridades cuando una ley o un juez lo ordene. No vendemos tus datos.',
          ],
        },
        {
          title: 'Tus derechos ARCO',
          paragraphs: [
            'Puedes Acceder a tus datos, Rectificarlos, Cancelarlos u Oponerte a su uso, y revocar tu consentimiento.',
            'Desde la app: Cuenta › Privacidad y datos te deja descargar una copia de tus datos (acceso) y eliminar tu cuenta (cancelación). Tus datos personales se anonimizan; los registros de pagos se conservan sin identificarte el tiempo que exige la ley fiscal.',
            'Para rectificar u oponerte, abre un caso en Soporte con el asunto "Derechos ARCO". Respondemos en un máximo de 20 días hábiles.',
          ],
        },
        {
          title: 'Seguridad',
          paragraphs: ['Usamos conexiones cifradas, contraseñas protegidas con hash, enlaces a documentos que vencen en minutos y registro de accesos. Si detectamos un incidente que afecte tus datos, te avisaremos.'],
        },
        {
          title: 'Cambios a este aviso',
          paragraphs: ['Cualquier cambio se publicará en la app con su fecha de actualización.'],
        },
      ]}
    />
  );
}
