import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../lib/prisma';

export const listarImagensPadrao = async (req: AuthRequest, res: Response) => {
    try {
        const imagens = await (prisma as any).treinoImagemPadrao.findMany({
            orderBy: { letra: 'asc' }
        });
        return res.json(imagens);
    } catch (error: any) {
        console.error('Erro ao listar imagens padrão:', error);
        return res.status(500).json({
            error: 'Erro ao listar imagens padrão',
            message: error.message
        });
    }
};

export const salvarImagemPadrao = async (req: AuthRequest, res: Response) => {
    try {
        const { letra, imagemUrl } = req.body;

        if (!letra || !imagemUrl) {
            return res.status(400).json({
                error: 'Dados incompletos',
                message: 'Letra e URL da imagem são obrigatórios'
            });
        }

        const letraNormalizada = letra.toUpperCase();
        const letrasValidas = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

        if (!letrasValidas.includes(letraNormalizada)) {
            return res.status(400).json({
                error: 'Letra inválida',
                message: 'A letra deve ser entre A e G'
            });
        }

        const imagem = await (prisma as any).treinoImagemPadrao.upsert({
            where: { letra: letraNormalizada },
            update: { imagemUrl },
            create: {
                letra: letraNormalizada,
                imagemUrl
            }
        });

        return res.json(imagem);
    } catch (error: any) {
        console.error('Erro ao salvar imagem padrão:', error);
        return res.status(500).json({
            error: 'Erro ao salvar imagem padrão',
            message: error.message
        });
    }
};
