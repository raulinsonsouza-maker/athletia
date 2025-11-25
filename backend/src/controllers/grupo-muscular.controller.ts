import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.middleware'
import {
  listarGruposVisuaisAdmin,
  criarGrupoVisual,
  atualizarGrupoVisual,
  removerGrupoVisual
} from '../services/grupo-muscular-visual.service'

export const listarGruposAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const grupos = await listarGruposVisuaisAdmin()
    res.json(grupos)
  } catch (error: any) {
    console.error('Erro ao listar grupos musculares visuais:', error)
    res.status(500).json({ error: 'Erro ao listar grupos musculares', message: error.message })
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

