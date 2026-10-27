// Regresar sin romper cuando la pantalla se abrió directo por enlace (web o notificación) y no hay historial.
type Nav = { canGoBack: () => boolean; back: () => void; replace: (href: never) => void };

export function goBack(router: Nav, fallback = '/') {
  if (router.canGoBack()) router.back();
  else router.replace(fallback as never);
}
