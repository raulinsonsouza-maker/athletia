import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../lib/prisma';
import fs from 'fs';
import path from 'path';
import { getUploadExerciciosPath } from '../utils/upload-paths';

const SYSTEM_SETTINGS_ID = 'system-settings-singleton';

/**
 * Obter ou criar configurações do sistema (singleton)
 */
async function getOrCreateSettings() {
  let settings = await prisma.systemSettings.findUnique({
    where: { id: SYSTEM_SETTINGS_ID }
  });

  if (!settings) {
    settings = await prisma.systemSettings.create({
      data: { id: SYSTEM_SETTINGS_ID }
    });
  }

  return settings;
}

/**
 * Obter configurações atuais do sistema (rota pública)
 */
export const obterConfiguracoes = async (req: any, res: Response) => {
  try {
    const settings = await getOrCreateSettings();
    res.json(settings);
  } catch (error: any) {
    console.error('Erro ao obter configurações:', error);
    res.status(500).json({
      error: 'Erro ao obter configurações',
      message: error.message
    });
  }
};

/**
 * Upload de imagem padrão do perfil
 */
export const uploadImagemPerfil = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Nenhum arquivo enviado'
      });
    }

    const basePath = getUploadExerciciosPath();
    const baseDir = path.dirname(basePath);
    const imagemPath = path.join(baseDir, 'imagens-sistema', req.file.filename);
    const imagemUrl = `/api/uploads/imagens-sistema/${req.file.filename}`;

    // Remover imagem anterior se existir
    const settings = await getOrCreateSettings();
    if (settings.imagemPerfilPadrao) {
      const oldPath = path.join(baseDir, 'imagens-sistema', path.basename(settings.imagemPerfilPadrao));
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch (err) {
          console.warn('Erro ao remover imagem antiga:', err);
        }
      }
    }

    // Atualizar configurações
    const updated = await prisma.systemSettings.update({
      where: { id: SYSTEM_SETTINGS_ID },
      data: { imagemPerfilPadrao: imagemUrl }
    });

    res.json({
      message: 'Imagem do perfil atualizada com sucesso',
      imagemUrl: updated.imagemPerfilPadrao
    });
  } catch (error: any) {
    console.error('Erro ao fazer upload de imagem do perfil:', error);
    
    // Remover arquivo se houve erro
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.warn('Erro ao remover arquivo após erro:', err);
      }
    }

    res.status(500).json({
      error: 'Erro ao fazer upload de imagem do perfil',
      message: error.message
    });
  }
};

/**
 * Upload de imagem padrão do login
 */
export const uploadImagemLogin = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Nenhum arquivo enviado'
      });
    }

    const basePath = getUploadExerciciosPath();
    const baseDir = path.dirname(basePath);
    const imagemPath = path.join(baseDir, 'imagens-sistema', req.file.filename);
    const imagemUrl = `/api/uploads/imagens-sistema/${req.file.filename}`;

    // Remover imagem anterior se existir
    const settings = await getOrCreateSettings();
    if (settings.imagemLoginPadrao) {
      const oldPath = path.join(baseDir, 'imagens-sistema', path.basename(settings.imagemLoginPadrao));
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch (err) {
          console.warn('Erro ao remover imagem antiga:', err);
        }
      }
    }

    // Atualizar configurações
    const updated = await prisma.systemSettings.update({
      where: { id: SYSTEM_SETTINGS_ID },
      data: { imagemLoginPadrao: imagemUrl }
    });

    res.json({
      message: 'Imagem do login atualizada com sucesso',
      imagemUrl: updated.imagemLoginPadrao
    });
  } catch (error: any) {
    console.error('Erro ao fazer upload de imagem do login:', error);
    
    // Remover arquivo se houve erro
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.warn('Erro ao remover arquivo após erro:', err);
      }
    }

    res.status(500).json({
      error: 'Erro ao fazer upload de imagem do login',
      message: error.message
    });
  }
};

/**
 * Remover imagem padrão do perfil
 */
export const removerImagemPerfil = async (req: AuthRequest, res: Response) => {
  try {
    const settings = await getOrCreateSettings();
    
    if (settings.imagemPerfilPadrao) {
      const basePath = getUploadExerciciosPath();
      const baseDir = path.dirname(basePath);
      const oldPath = path.join(baseDir, 'imagens-sistema', path.basename(settings.imagemPerfilPadrao));
      
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch (err) {
          console.warn('Erro ao remover imagem antiga:', err);
        }
      }
    }

    const updated = await prisma.systemSettings.update({
      where: { id: SYSTEM_SETTINGS_ID },
      data: { imagemPerfilPadrao: null }
    });

    res.json({
      message: 'Imagem do perfil removida com sucesso',
      settings: updated
    });
  } catch (error: any) {
    console.error('Erro ao remover imagem do perfil:', error);
    res.status(500).json({
      error: 'Erro ao remover imagem do perfil',
      message: error.message
    });
  }
};

/**
 * Remover imagem padrão do login
 */
export const removerImagemLogin = async (req: AuthRequest, res: Response) => {
  try {
    const settings = await getOrCreateSettings();
    
    if (settings.imagemLoginPadrao) {
      const basePath = getUploadExerciciosPath();
      const baseDir = path.dirname(basePath);
      const oldPath = path.join(baseDir, 'imagens-sistema', path.basename(settings.imagemLoginPadrao));
      
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch (err) {
          console.warn('Erro ao remover imagem antiga:', err);
        }
      }
    }

    const updated = await prisma.systemSettings.update({
      where: { id: SYSTEM_SETTINGS_ID },
      data: { imagemLoginPadrao: null }
    });

    res.json({
      message: 'Imagem do login removida com sucesso',
      settings: updated
    });
  } catch (error: any) {
    console.error('Erro ao remover imagem do login:', error);
    res.status(500).json({
      error: 'Erro ao remover imagem do login',
      message: error.message
    });
  }
};

