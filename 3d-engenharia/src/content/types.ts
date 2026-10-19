/** Referência a uma imagem responsiva. `src` = versão grande; `srcSmall` = versão leve (opcional). */
export interface ImageRef {
  src: string
  srcSmall?: string
  alt: string
}

/** Atalho para as imagens demonstrativas em /public/images/demo (geradas em 1600 e 800 px). */
export function demoImage(name: string, alt: string): ImageRef {
  return {
    src: `/images/demo/${name}-1600.webp`,
    srcSmall: `/images/demo/${name}-800.webp`,
    alt,
  }
}
