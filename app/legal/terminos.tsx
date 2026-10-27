import React from 'react';
import { LegalDoc } from '@/src/features/legal/LegalDoc';

// Términos de uso: garantía mínima de 90 días (PROFECO, RD-012), retenciones (RD-013), cancelaciones y seguridad.
export default function Terminos() {
  return (
    <LegalDoc
      title="Términos de uso"
      updated="27 de octubre de 2026"
      intro="Al crear una cuenta aceptas estas condiciones para usar Click & Serve como cliente o como técnico."
      sections={[
        {
          title: 'Cuentas verificadas',
          paragraphs: [
            'Debes ser mayor de edad y registrarte con datos reales e identificación oficial vigente. Los técnicos solo pueden aceptar trabajos cuando su identidad fue verificada.',
            'Eres responsable de lo que pase con tu cuenta. Activa la verificación en dos pasos en Cuenta › Seguridad.',
          ],
        },
        {
          title: 'Cotización y pago',
          paragraphs: [
            'El técnico envía una cotización con sus conceptos (mano de obra y materiales) antes de empezar. El trabajo solo inicia cuando el cliente la aprueba.',
            'Si surge un imprevisto, el técnico puede agregar conceptos adicionales; el cliente los ve antes de confirmar.',
            'El cobro se hace únicamente cuando el cliente pulsa "Enviar y finalizar" después de revisar la evidencia del trabajo. El monto lo calcula el servidor con los conceptos aprobados.',
          ],
        },
        {
          title: 'Cancelaciones',
          paragraphs: [
            'El cliente puede cancelar sin cargo mientras el trabajo no haya iniciado.',
            'Si el técnico no se presenta, el cliente puede reportarlo; la orden se suspende y puede pedir otro técnico o cancelar sin cargo.',
            'El técnico puede cancelar un servicio asignado indicando el motivo; la solicitud se reasigna a otro técnico.',
          ],
        },
        {
          title: 'Garantía',
          paragraphs: ['Los trabajos tienen una garantía mínima de 90 días naturales desde su confirmación, conforme a la Ley Federal de Protección al Consumidor. Se reclama desde el detalle del servicio.'],
        },
        {
          title: 'Comisión y retenciones para técnicos',
          paragraphs: [
            'Click & Serve cobra una comisión del 10 % sobre el total de cada servicio pagado.',
            'Como plataforma digital, retenemos el impuesto sobre la renta (2.1 %) y el IVA (8 %) sobre la base del servicio, según la legislación fiscal vigente. Cada movimiento de tu billetera muestra el desglose.',
            'Los retiros se depositan por SPEI a la CLABE registrada; el mínimo es de $100.00 MXN.',
          ],
        },
        {
          title: 'Seguridad y normas',
          paragraphs: [
            'Los técnicos se comprometen a seguir los protocolos de seguridad de la STPS y, en servicios eléctricos, la NOM-001-SEDE.',
            'Usa el botón SOS ante cualquier riesgo. Las agresiones, el acoso o los cobros fuera de la app causan la baja de la cuenta.',
          ],
        },
        {
          title: 'Jurisdicción',
          paragraphs: ['Estos términos se rigen por las leyes de México. Cualquier controversia se resolverá ante los tribunales competentes de Lázaro Cárdenas, Michoacán, sin perjuicio de tus derechos ante la PROFECO.'],
        },
      ]}
    />
  );
}
