import fs from 'fs';

/**
 * Constantes para tamanhos máximos de arquivo
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_BULK_FILES = 50;
export const MAX_BULK_TOTAL_SIZE = 250 * 1024 * 1024; // 250MB total

/**
 * Formatos de mídia aceitos para exercícios
 */
export const ACCEPTED_MEDIA_TYPES = {
  'image/gif': ['.gif'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'video/mp4': ['.mp4'],
  'video/webm': ['.webm'],
} as const;

export const ACCEPTED_EXTENSIONS = Object.values(ACCEPTED_MEDIA_TYPES).flat() as readonly string[];

export type AcceptedExtension = '.gif' | '.jpg' | '.jpeg' | '.png' | '.webp' | '.mp4' | '.webm';

/**
 * Verifica se uma extensão é aceita
 */
export function isAcceptedExtension(ext: string): ext is AcceptedExtension {
  return (ACCEPTED_EXTENSIONS as readonly string[]).includes(ext);
}

/**
 * Valida magic bytes de arquivos de mídia
 * Retorna o tipo MIME detectado ou null se inválido
 */
export function validateMediaFile(buffer: Buffer): string | null {
  if (buffer.length < 12) {
    return null;
  }

  // GIF: GIF87a ou GIF89a
  const gif87a = Buffer.from('GIF87a', 'ascii');
  const gif89a = Buffer.from('GIF89a', 'ascii');
  const gifHeader = buffer.slice(0, 6);
  if (gifHeader.equals(gif87a) || gifHeader.equals(gif89a)) {
    return 'image/gif';
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return 'image/jpeg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  if (buffer.slice(0, 8).equals(pngSignature)) {
    return 'image/png';
  }

  // WebP: RIFF...WEBP
  if (buffer.slice(0, 4).toString('ascii') === 'RIFF' && 
      buffer.slice(8, 12).toString('ascii') === 'WEBP') {
    return 'image/webp';
  }

  // MP4: ftyp box (vários tipos possíveis)
  // MP4 pode começar com alguns bytes nulos antes do ftyp
  // Verifica se contém ftyp box em diferentes posições
  const ftypPos = buffer.indexOf('ftyp');
  if (ftypPos !== -1 && ftypPos < 20) {
    // Verifica se é um dos tipos conhecidos de MP4
    if (ftypPos + 8 <= buffer.length) {
      const brand = buffer.slice(ftypPos + 4, ftypPos + 8).toString('ascii');
      if (['mp41', 'mp42', 'isom', 'iso2', 'avc1', 'iso3', 'mp71'].includes(brand)) {
        return 'video/mp4';
      }
    }
  }
  
  // Também verificar se começa com bytes nulos seguidos de ftyp (formato comum)
  if (buffer.length >= 8) {
    // Verificar padrões comuns de MP4: 00 00 00 XX ftyp ou 00 00 00 20 ftyp
    if ((buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70) ||
        (buffer.length >= 12 && buffer[8] === 0x66 && buffer[9] === 0x74 && buffer[10] === 0x79 && buffer[11] === 0x70)) {
      return 'video/mp4';
    }
  }

  // WebM: 1A 45 DF A3 (EBML header)
  if (buffer[0] === 0x1A && buffer[1] === 0x45 && buffer[2] === 0xDF && buffer[3] === 0xA3) {
    return 'video/webm';
  }

  return null;
}

/**
 * Obtém a extensão do arquivo baseado no tipo MIME
 */
export function getExtensionFromMimeType(mimeType: string): string {
  const extMap: Record<string, string> = {
    'image/gif': '.gif',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'video/mp4': '.mp4',
    'video/webm': '.webm',
  };
  return extMap[mimeType] || '.gif';
}

/**
 * Obtém o Content-Type baseado na extensão do arquivo
 */
export function getContentTypeFromExtension(filename: string): string {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  const mimeMap: Record<string, string> = {
    '.gif': 'image/gif',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
  };
  return mimeMap[ext] || 'application/octet-stream';
}

