const TRANSPARENT_GIF_BASE64 = 'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

interface PlaceholderMedia {
  buffer: Buffer;
  contentType: string;
}

const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'webp']);

/**
 * Retorna uma mídia placeholder para evitar erros de layout quando
 * um arquivo não é encontrado. Utiliza um GIF transparente de 1x1.
 */
export function getPlaceholderMedia(ext?: string | null): PlaceholderMedia | null {
  const normalizedExt = (ext || '').toLowerCase();

  if (IMAGE_EXTENSIONS.has(normalizedExt)) {
    return {
      buffer: Buffer.from(TRANSPARENT_GIF_BASE64, 'base64'),
      contentType: 'image/gif'
    };
  }

  return null;
}

