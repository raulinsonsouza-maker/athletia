import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../lib/prisma';

export const listarImagensPadrao = async (req: AuthRequest, res: Response) => {
    try {
        const imagens = await (prisma as any).treinoImagemPadrao.findMany({
            orderBy: { letra: 'asc' }
        });

        // Sanitizar URLs para evitar Mixed Content (http://localhost em https://site)
        // Converte URLs absolutas locais em relativas
        const imagensSanitized = imagens.map((img: any) => {
            if (img.imagemUrl && img.imagemUrl.includes('http://localhost:3001')) {
                return {
                    ...img,
                    imagemUrl: img.imagemUrl.replace('http://localhost:3001', '')
                };
            }
            return img;
        });

        return res.json(imagensSanitized);
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

export const uploadImagemTreinoPadrao = async (req: AuthRequest, res: Response) => {
    try {
        const { letra } = req.params;
        const file = req.file;

        if (!letra) {
            return res.status(400).json({
                error: 'Letra do treino é obrigatória'
            });
        }

        if (!file) {
            return res.status(400).json({
                error: 'Arquivo de imagem é obrigatório'
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

        // Construir URL relativa para evitar problemas de Mixed Content e CORS
        // O frontend irá resolver isso contra o domínio atual
        const imagemUrl = `/api/uploads/treino-imagens/${file.filename}`;

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
        console.error('Erro ao fazer upload da imagem padrão:', error);
        return res.status(500).json({
            error: 'Erro ao fazer upload da imagem padrão',
            message: error.message
        });
    }
};
