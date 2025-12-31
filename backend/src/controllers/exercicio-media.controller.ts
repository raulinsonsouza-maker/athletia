import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { PrismaClient } from '@prisma/client';
import { getMediaFilePath, saveMediaFile, deleteMediaFile, getContentType } from '../services/exercicio-media.service';
import { resolveExercicioId, resolveExercicio } from '../utils/resolve-exercicio-id';
import { getUploadExerciciosPath } from '../utils/upload-paths';
import { logger } from '../lib/logger';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

/**
 * Controller de mídia de exercícios
 * 
 * Padrão oficial:
 * - Caminho físico: /opt/athletia/backend/uploads/exercicios/{exercicioId}/media.{ext}
 * - URL pública: /api/exercicios/{exercicioId}/media.{ext}
 * - exercicioId: UUID do exercício (sempre)
 */

/**
 * Servir arquivo de mídia de um exercício
 * PASSO 8: Protegido contra path traversal, exercício inexistente, arquivo inexistente
 */
export const serveMedia = async (req: AuthRequest, res: Response) => {
  try {
    const { exercicioId, extension } = req.params;
    
    // Prioridade: parâmetro da rota > extração do path > extração da URL
    let fileExtension: string | undefined = extension;
    
    // Se não veio nos params, tentar extrair do path ou URL
    if (!fileExtension) {
      // Tentar extrair do path primeiro (ex: "/crucifixo-declinado-halteres/media.gif")
      const pathMatch = req.path.match(/media\.([a-z0-9]+)$/i);
      if (pathMatch) {
        fileExtension = pathMatch[1];
      } else {
        // Tentar extrair da URL completa
        const urlMatch = req.url.match(/media\.([a-z0-9]+)(\?|$)/i);
        if (urlMatch) {
          fileExtension = urlMatch[1];
        }
      }
    }

    logger.debug(`Requisição: exercicioId=${exercicioId}, ext=${fileExtension}, path=${req.path}, url=${req.url}`, 'exercicio-media.controller');

    if (!fileExtension) {
      logger.warn(`Extensão não especificada`, 'exercicio-media.controller', {
        exercicioId,
        path: req.path,
        url: req.url,
        params: req.params
      });
      return res.status(400).json({
        error: 'Extensão do arquivo não especificada',
        exercicioId,
        path: req.path
      });
    }

    // SEGURANÇA: Proteção contra path traversal - resolveExercicioId valida entrada
    const realExercicioId = await resolveExercicioId(exercicioId);

    // SEGURANÇA: Remover fallback inseguro - retornar 404 se exercício não for encontrado no banco
    if (!realExercicioId) {
      logger.warn(`Exercício não encontrado no banco: ${exercicioId}`, 'exercicio-media.controller', {
        exercicioId,
        extension: fileExtension,
        path: req.path,
        url: req.url
      });
      return res.status(404).json({
        error: 'Exercício não encontrado',
        exercicioId,
        message: `Não foi possível encontrar o exercício com identificador: ${exercicioId}`
      });
    }

    logger.debug(`Exercício resolvido: ${exercicioId} -> ${realExercicioId}`, 'exercicio-media.controller');

    const filePath = await getMediaFilePath(realExercicioId, `.${fileExtension}`, exercicioId);

    if (!filePath) {
      logger.warn(`Mídia não encontrada: exercicioId=${exercicioId}, realId=${realExercicioId}`, 'exercicio-media.controller', {
        exercicioId,
        realExercicioId,
        extension: fileExtension,
        basePath: getUploadExerciciosPath()
      });
      return res.status(404).json({
        error: 'Mídia não encontrada',
        exercicioId,
        realExercicioId,
        extension: fileExtension
      });
    }

    // Verificar se arquivo existe (segurança adicional)
    if (!fs.existsSync(filePath)) {
      logger.error(`Arquivo não existe no sistema de arquivos: ${filePath}`, 'exercicio-media.controller');
      return res.status(404).json({
        error: 'Arquivo não encontrado',
        filePath
      });
    }

    const stats = fs.statSync(filePath);
    if (!stats.isFile() || stats.size === 0) {
      logger.error(`Arquivo inválido: ${filePath}`, 'exercicio-media.controller', { size: stats.size, isFile: stats.isFile() });
      return res.status(404).json({
        error: 'Arquivo inválido',
        filePath
      });
    }

    // Determinar Content-Type
    const ext = path.extname(filePath);
    const contentType = getContentType(ext);

    // Headers de segurança e cache
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    res.setHeader('Content-Type', contentType);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Length', stats.size);

    // Enviar arquivo
    const fileStream = fs.createReadStream(filePath);
    fileStream.on('error', (streamError) => {
      logger.error(`Erro ao ler arquivo: ${filePath}`, 'exercicio-media.controller', streamError);
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Erro ao ler arquivo',
          message: streamError.message
        });
      }
    });
    fileStream.pipe(res);

    logger.info(`Arquivo servido com sucesso`, 'exercicio-media.controller', { filePath, size: stats.size, exercicioId: realExercicioId });
  } catch (error: any) {
    logger.error('Erro ao servir mídia', 'exercicio-media.controller', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Erro ao servir mídia',
        message: error.message
      });
    }
  }
};

/**
 * Upload de mídia para exercício
 * PASSO 3: Cria diretório automaticamente se não existir
 */
export const uploadMedia = async (req: AuthRequest, res: Response) => {
  try {
    const { exercicioId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        error: 'Arquivo não fornecido'
      });
    }

    logger.info(`Upload iniciado`, 'exercicio-media.controller', { exercicioId, filename: file.originalname });

    // Resolver exercicioId para UUID real
    const exercicio = await resolveExercicio(exercicioId, { id: true, nome: true });

    if (!exercicio) {
      // Limpar arquivo temporário
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      logger.warn(`Exercício não encontrado para upload: ${exercicioId}`, 'exercicio-media.controller');
      return res.status(404).json({
        error: 'Exercício não encontrado',
        exercicioId
      });
    }

    // Salvar arquivo usando o UUID real do exercício
    const ext = path.extname(file.originalname) || path.extname(file.path);

    if (!ext) {
      // Limpar arquivo temporário
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      logger.error(`Extensão não identificada`, 'exercicio-media.controller', { originalname: file.originalname, mimetype: file.mimetype });
      return res.status(400).json({
        error: 'Extensão do arquivo não identificada',
        originalname: file.originalname,
        mimetype: file.mimetype
      });
    }

    let mediaUrl: string;
    try {
      // PASSO 3: saveMediaFile cria o diretório automaticamente
      mediaUrl = await saveMediaFile(exercicio.id, file.path, ext);
      logger.info(`Arquivo salvo com sucesso`, 'exercicio-media.controller', { mediaUrl, exercicioId: exercicio.id });
    } catch (saveError: any) {
      // Limpar arquivo temporário
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      logger.error(`Erro ao salvar arquivo`, 'exercicio-media.controller', saveError);
      return res.status(500).json({
        error: 'Erro ao salvar arquivo',
        message: saveError.message || 'Erro desconhecido ao salvar'
      });
    }

    // Atualizar banco usando o UUID real
    const exercicioAtualizado = await prisma.exercicio.update({
      where: { id: exercicio.id },
      data: {
        imagemUrl: mediaUrl
      },
      select: {
        id: true,
        nome: true,
        imagemUrl: true,
        grupoMuscularPrincipal: true,
        nivelDificuldade: true,
        ativo: true
      }
    });

    logger.info(`Upload concluído`, 'exercicio-media.controller', { exercicioId: exercicio.id, mediaUrl });

    res.json({
      message: 'Mídia enviada com sucesso',
      exercicio: exercicioAtualizado,
      mediaUrl
    });
  } catch (error: any) {
    logger.error('Erro ao fazer upload', 'exercicio-media.controller', error);

    // Limpar arquivo temporário
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        // Ignorar erro ao deletar
      }
    }

    res.status(500).json({
      error: 'Erro ao fazer upload',
      message: error.message
    });
  }
};

/**
 * Remover mídia de exercício
 */
export const removeMedia = async (req: AuthRequest, res: Response) => {
  try {
    const { exercicioId } = req.params;

    logger.info(`Remoção de mídia iniciada`, 'exercicio-media.controller', { exercicioId });

    // Resolver exercicioId para UUID real
    const exercicio = await resolveExercicio(exercicioId, { id: true, nome: true });

    if (!exercicio) {
      logger.warn(`Exercício não encontrado para remoção: ${exercicioId}`, 'exercicio-media.controller');
      return res.status(404).json({
        error: 'Exercício não encontrado',
        exercicioId
      });
    }

    // Remover arquivo
    await deleteMediaFile(exercicio.id);

    // Atualizar banco usando o UUID real
    const exercicioAtualizado = await prisma.exercicio.update({
      where: { id: exercicio.id },
      data: {
        imagemUrl: null
      },
      select: {
        id: true,
        nome: true,
        imagemUrl: true
      }
    });

    logger.info(`Mídia removida com sucesso`, 'exercicio-media.controller', { exercicioId: exercicio.id });

    res.json({
      message: 'Mídia removida com sucesso',
      exercicio: exercicioAtualizado
    });
  } catch (error: any) {
    logger.error('Erro ao remover mídia', 'exercicio-media.controller', error);
    res.status(500).json({
      error: 'Erro ao remover mídia',
      message: error.message
    });
  }
};
