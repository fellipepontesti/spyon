const APP_SCHEME = "myapp"

export const criarLinkConviteSala = (codigo: string) => {
  return `${APP_SCHEME}://buscarSala?codigo=${encodeURIComponent(codigo)}`
}
