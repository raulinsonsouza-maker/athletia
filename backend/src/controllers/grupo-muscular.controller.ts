import { Response } from 'express'
import path from 'path'
import { AuthRequest } from '../middleware/auth.middleware'
import {
  listarGruposVisuaisAdmin,
  obterGrupoVisualPorId,
  criarGrupoVisual,
  atualizarGrupoVisual,
  removerGrupoVisual
} from '../services/grupo-muscular-visual.service'
import { prisma } from '../lib/prisma'

export const listarGruposAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const grupos = await listarGruposVisuaisAdmin()
    res.json(grupos)
  } catch (error: any) {
    console.error('Erro ao listar grupos musculares visuais:', error)
    res.status(500).json({ error: 'Erro ao listar grupos musculares', message: error.message })
  }
}

export const obterGrupoAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const grupo = await obterGrupoVisualPorId(id)
    res.json(grupo)
  } catch (error: any) {
    console.error('Erro ao obter grupo muscular visual:', error)
    if (error.message === 'Grupo muscular não encontrado') {
      res.status(404).json({ error: error.message })
    } else {
      res.status(500).json({ error: 'Erro ao obter grupo muscular', message: error.message })
    }
  }
}

export const criarGrupoAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { nome, descricao, imagemUrl, ativo, ordem } = req.body
    if (!nome) {
      return res.status(400).json({ error: 'Nome é obrigatório' })
    }
    const grupo = await criarGrupoVisual({ nome, descricao, imagemUrl, ativo, ordem })
    res.status(201).json(grupo)
  } catch (error: any) {
    console.error('Erro ao criar grupo muscular visual:', error)
    res.status(500).json({ error: 'Erro ao criar grupo muscular', message: error.message })
  }
}

export const atualizarGrupoAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { nome, descricao, imagemUrl, ativo, ordem } = req.body
    const grupo = await atualizarGrupoVisual(id, { nome, descricao, imagemUrl, ativo, ordem })
    res.json(grupo)
  } catch (error: any) {
    console.error('Erro ao atualizar grupo muscular visual:', error)
    res.status(500).json({ error: 'Erro ao atualizar grupo muscular', message: error.message })
  }
}

export const removerGrupoAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    await removerGrupoVisual(id)
    res.json({ success: true })
  } catch (error: any) {
    console.error('Erro ao remover grupo muscular visual:', error)
    res.status(500).json({ error: 'Erro ao remover grupo muscular', message: error.message })
  }
}

export const uploadImagemGrupoAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    console.log('[Upload] Recebendo upload de imagem para grupo:', id)
    console.log('[Upload] req.file:', req.file ? {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    } : 'Nenhum arquivo recebido')

    if (!id) {
      console.error('[Upload] ID do grupo não fornecido')
      return res.status(400).json({ error: 'ID do grupo é obrigatório' })
    }

    if (!req.file) {
      console.error('[Upload] Nenhum arquivo recebido no req.file')
      return res.status(400).json({ error: 'Nenhum arquivo enviado' })
    }

    // Verificar se grupo existe
    const grupo = await prisma.grupoMuscularVisual.findUnique({
      where: { id },
      select: { id: true, nome: true }
    })

    if (!grupo) {
      console.error('[Upload] Grupo não encontrado:', id)
      return res.status(404).json({ error: 'Grupo muscular não encontrado' })
    }

    const ext = path.extname(req.file.filename).toLowerCase() || '.jpg'
    const imagemUrl = `/api/uploads/grupos-musculares/${id}/capa${ext}`

    console.log('[Upload] Atualizando grupo com imagemUrl:', imagemUrl)

    const grupoAtualizado = await prisma.grupoMuscularVisual.update({
      where: { id },
      data: { imagemUrl },
      select: {
        id: true,
        nome: true,
        slug: true,
        descricao: true,
        imagemUrl: true,
        ativo: true,
        ordem: true
      }
    })

    console.log('[Upload] Grupo atualizado com sucesso:', grupoAtualizado.id)

    res.json({
      message: 'Imagem atualizada com sucesso',
      grupo: grupoAtualizado
    })
  } catch (error: any) {
    console.error('[Upload] Erro ao fazer upload da imagem do grupo muscular:', error)
    console.error('[Upload] Stack trace:', error.stack)
    res.status(500).json({
      error: 'Erro ao fazer upload da imagem',
      message: error.message
    })
  }
}


