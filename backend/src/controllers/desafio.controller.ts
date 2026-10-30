import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { concluirDiaDesafio, desmarcarDiaDesafio, detalharDesafio, listarDesafios } from '../services/desafio.service';

export const listar = async (req: AuthRequest, res: Response) => {
  const desafios = await listarDesafios(req.userId!);
  res.json({ desafios });
};

export const detalhar = async (req: AuthRequest, res: Response) => {
  const detalhe = await detalharDesafio(req.userId!, req.params.slug);
  if (!detalhe) {
    return res.status(404).json({ error: 'Desafio não encontrado' });
  }
  res.json(detalhe);
};

export const concluir = async (req: AuthRequest, res: Response) => {
  const dia = Number(req.params.dia);
  if (!Number.isInteger(dia)) {
    return res.status(400).json({ error: 'Dia inválido' });
  }
  const resultado = await concluirDiaDesafio(req.userId!, req.params.slug, dia);
  if (resultado && 'erro' in resultado) {
    return res.status(resultado.status).json({ error: resultado.erro });
  }
  res.json(resultado);
};

export const desmarcar = async (req: AuthRequest, res: Response) => {
  const dia = Number(req.params.dia);
  if (!Number.isInteger(dia)) {
    return res.status(400).json({ error: 'Dia inválido' });
  }
  const resultado = await desmarcarDiaDesafio(req.userId!, req.params.slug, dia);
  if (resultado && 'erro' in resultado) {
    return res.status(resultado.status).json({ error: resultado.erro });
  }
  res.json(resultado);
};
