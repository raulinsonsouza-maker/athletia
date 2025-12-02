import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { PrismaClient } from '@prisma/client';
import { getMediaFilePath, saveMediaFile, deleteMediaFile, getContentType } from '../services/exercicio-media-v2.service';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

/**
 * Controller de mídia de exercícios - Versão 2 (Nova implementação limpa)
 */

/**
 * Servir arquivo de mídia de um exercício
 */
export const serveMedia = async (req: AuthRequest, res: Response) => {
  try {
    const { exercicioId } = req.params;
    const extension = req.path.split('.').pop() || undefined;

    console.log(`[MediaController] Requisição: exercicioId=${exercicioId}, ext=${extension}`);

    if (!extension) {
      return res.status(400).json({
        error: 'Extensão do arquivo não especificada',
        exercicioId
      });
    }

    const filePath = await getMediaFilePath(exercicioId, extension);

    if (!filePath) {
      return res.status(404).json({
        error: 'Mídia não encontrada',
        exercicioId
      });
    }

    // Verificar se arquivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: 'Arquivo não encontrado',
        exercicioId
      });
    }

    const stats = fs.statSync(filePath);
    if (!stats.isFile() || stats.size === 0) {
      return res.status(404).json({
        error: 'Arquivo inválido',
        exercicioId
      });
    }

    // Determinar Content-Type
    const ext = path.extname(filePath);
    const contentType = getContentType(ext);

    // Headers
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    res.setHeader('Content-Type', contentType);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Length', stats.size);

    // Enviar arquivo
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    console.log(`[MediaController] Arquivo servido: ${filePath}`);
  } catch (error: any) {
    console.error('[MediaController] Erro ao servir mídia:', error);
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

    console.log(`[MediaController] Upload: exercicioId=${exercicioId}, file=${file.originalname}`);

    // Verificar se exercício existe
    const exercicio = await prisma.exercicio.findUnique({
      where: { id: exercicioId },
      select: { id: true, nome: true }
    });

    if (!exercicio) {
      // Limpar arquivo temporário
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return res.status(404).json({
        error: 'Exercício não encontrado'
      });
    }

    // Salvar arquivo
    const ext = path.extname(file.originalname) || path.extname(file.path);
    const mediaUrl = await saveMediaFile(exercicioId, file.path, ext);

    // Atualizar banco
    const exercicioAtualizado = await prisma.exercicio.update({
      where: { id: exercicioId },
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

    console.log(`[MediaController] Upload concluído: ${mediaUrl}`);

    res.json({
      message: 'Mídia enviada com sucesso',
      exercicio: exercicioAtualizado,
      mediaUrl
    });
  } catch (error: any) {
    console.error('[MediaController] Erro ao fazer upload:', error);
    
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

    console.log(`[MediaController] Remover: exercicioId=${exercicioId}`);

    // Verificar se exercício existe
    const exercicio = await prisma.exercicio.findUnique({
      where: { id: exercicioId },
      select: { id: true }
    });

    if (!exercicio) {
      return res.status(404).json({
        error: 'Exercício não encontrado'
      });
    }

    // Remover arquivo
    await deleteMediaFile(exercicioId);

    // Atualizar banco
    const exercicioAtualizado = await prisma.exercicio.update({
      where: { id: exercicioId },
      data: {
        imagemUrl: null
      },
      select: {
        id: true,
        nome: true,
        imagemUrl: true
      }
    });

    console.log(`[MediaController] Mídia removida: exercicioId=${exercicioId}`);

    res.json({
      message: 'Mídia removida com sucesso',
      exercicio: exercicioAtualizado
    });
  } catch (error: any) {
    console.error('[MediaController] Erro ao remover mídia:', error);
    res.status(500).json({
      error: 'Erro ao remover mídia',
      message: error.message
    });
  }
};

