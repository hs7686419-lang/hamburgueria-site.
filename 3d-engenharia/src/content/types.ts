/** Referência a uma imagem responsiva. `src` = versão grande; `srcSmall` = versão leve (opcional). */
export interface ImageRef {
  src: string
  srcSmall?: string
  alt: string
}

/** Imagens de obras reais em /public/images/projetos/<pasta>/<nome>-1600|800.webp */
export function projectImage(folder: string, name: string, alt: string): ImageRef {
  return {
    src: `/images/projetos/${folder}/${name}-1600.webp`,
    srcSmall: `/images/projetos/${folder}/${name}-800.webp`,
    alt,
  }
}

/** Atalho para as imagens demonstrativas em /public/images/demo (geradas em 1600 e 800 px). */
export function demoImage(name: string, alt: string): ImageRef {
  return {
    src: `/images/demo/${name}-1600.webp`,
    srcSmall: `/images/demo/${name}-800.webp`,
    alt,
  }
}
