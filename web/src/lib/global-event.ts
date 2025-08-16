export const subscribeGlobal = (event: string, listener: (event: any) => void) => {
  window.addEventListener(event, listener)
  return () => {
    window.removeEventListener(event, listener)
  }
}
