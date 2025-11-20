"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Seed de Templates de Treino Pré-Estruturados
 * Baseado em objetivos, nível de experiência e frequência semanal
 */
async function main() {
    console.log('🌱 Iniciando seed de templates de treino...');
    // ============================================
    // HIPERTROFIA - INICIANTE
    // ============================================
    // Template 1: Hipertrofia Iniciante 2x/semana - Full Body
    const template1 = await prisma.treinoTemplate.upsert({
        where: { id: 'hipertrofia-iniciante-2x-fullbody' },
        update: {},
        create: {
            id: 'hipertrofia-iniciante-2x-fullbody',
            nome: 'Hipertrofia Iniciante - Full Body 2x/semana',
            descricao: 'Treino completo para iniciantes focado em hipertrofia. Trabalha todos os grupos musculares em cada sessão.',
            objetivo: 'Hipertrofia',
            nivelExperiencia: 'Iniciante',
            frequenciaSemanal: 2,
            divisaoTreino: 'Full Body',
            gruposMusculares: ['Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 'Quadríceps', 'Posteriores', 'Panturrilhas'],
            tempoEstimado: 60,
            volumeTotal: 16,
            ativo: true
        }
    });
    // Exercícios do Template 1 - Usando IDs reais do banco
    const exerciciosTemplate1 = [
        { exercicioId: 'supino-reto', ordem: 1, series: 3, repeticoes: '10-12', rpeSugerido: 7, descanso: 90 },
        { exercicioId: 'remada-curvada', ordem: 2, series: 3, repeticoes: '10-12', rpeSugerido: 7, descanso: 90 },
        { exercicioId: 'desenvolvimento', ordem: 3, series: 3, repeticoes: '10-12', rpeSugerido: 7, descanso: 60 },
        { exercicioId: 'rosca-direta', ordem: 4, series: 2, repeticoes: '10-12', rpeSugerido: 7, descanso: 60 },
        { exercicioId: 'triceps-puxada', ordem: 5, series: 2, repeticoes: '10-12', rpeSugerido: 7, descanso: 60 },
        { exercicioId: 'agachamento', ordem: 6, series: 3, repeticoes: '10-12', rpeSugerido: 7, descanso: 90 },
        { exercicioId: 'mesa-flexora', ordem: 7, series: 2, repeticoes: '10-12', rpeSugerido: 7, descanso: 60 },
        { exercicioId: 'panturrilha-em-pe', ordem: 8, series: 3, repeticoes: '12-15', rpeSugerido: 7, descanso: 45 }
    ];
    for (const ex of exerciciosTemplate1) {
        await prisma.treinoTemplateExercicio.upsert({
            where: {
                templateId_exercicioId_ordem: {
                    templateId: template1.id,
                    exercicioId: ex.exercicioId,
                    ordem: ex.ordem
                }
            },
            update: {},
            create: {
                templateId: template1.id,
                exercicioId: ex.exercicioId,
                ordem: ex.ordem,
                series: ex.series,
                repeticoes: ex.repeticoes,
                rpeSugerido: ex.rpeSugerido,
                descanso: ex.descanso,
                obrigatorio: true
            }
        });
    }
    // Template 2: Hipertrofia Iniciante 3x/semana - A-B
    const template2 = await prisma.treinoTemplate.upsert({
        where: { id: 'hipertrofia-iniciante-3x-ab' },
        update: {},
        create: {
            id: 'hipertrofia-iniciante-3x-ab',
            nome: 'Hipertrofia Iniciante - A-B 3x/semana',
            descricao: 'Divisão A-B para iniciantes. Dia A: Membros superiores. Dia B: Membros inferiores.',
            objetivo: 'Hipertrofia',
            nivelExperiencia: 'Iniciante',
            frequenciaSemanal: 3,
            divisaoTreino: 'A-B',
            gruposMusculares: ['Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps'],
            tempoEstimado: 50,
            volumeTotal: 18,
            ativo: true
        }
    });
    // Dia A - Superiores
    const exerciciosTemplate2A = [
        { exercicioId: 'supino-reto', ordem: 1, series: 3, repeticoes: '10-12', rpeSugerido: 7, descanso: 90 },
        { exercicioId: 'remada-curvada', ordem: 2, series: 3, repeticoes: '10-12', rpeSugerido: 7, descanso: 90 },
        { exercicioId: 'desenvolvimento', ordem: 3, series: 3, repeticoes: '10-12', rpeSugerido: 7, descanso: 60 },
        { exercicioId: 'rosca-direta', ordem: 4, series: 3, repeticoes: '10-12', rpeSugerido: 7, descanso: 60 },
        { exercicioId: 'triceps-puxada', ordem: 5, series: 3, repeticoes: '10-12', rpeSugerido: 7, descanso: 60 }
    ];
    for (const ex of exerciciosTemplate2A) {
        await prisma.treinoTemplateExercicio.upsert({
            where: {
                templateId_exercicioId_ordem: {
                    templateId: template2.id,
                    exercicioId: ex.exercicioId,
                    ordem: ex.ordem
                }
            },
            update: {},
            create: {
                templateId: template2.id,
                exercicioId: ex.exercicioId,
                ordem: ex.ordem,
                series: ex.series,
                repeticoes: ex.repeticoes,
                rpeSugerido: ex.rpeSugerido,
                descanso: ex.descanso,
                obrigatorio: true
            }
        });
    }
    // Template 3: Hipertrofia Iniciante 3x/semana - B (Inferiores)
    const template3 = await prisma.treinoTemplate.upsert({
        where: { id: 'hipertrofia-iniciante-3x-ab-inferiores' },
        update: {},
        create: {
            id: 'hipertrofia-iniciante-3x-ab-inferiores',
            nome: 'Hipertrofia Iniciante - A-B Inferiores 3x/semana',
            descricao: 'Dia B da divisão A-B: Membros inferiores completos.',
            objetivo: 'Hipertrofia',
            nivelExperiencia: 'Iniciante',
            frequenciaSemanal: 3,
            divisaoTreino: 'A-B',
            gruposMusculares: ['Quadríceps', 'Posteriores', 'Panturrilhas', 'Glúteos'],
            tempoEstimado: 50,
            volumeTotal: 15,
            ativo: true
        }
    });
    const exerciciosTemplate3 = [
        { exercicioId: 'agachamento', ordem: 1, series: 4, repeticoes: '10-12', rpeSugerido: 7, descanso: 90 },
        { exercicioId: 'leg-press', ordem: 2, series: 3, repeticoes: '12-15', rpeSugerido: 7, descanso: 60 },
        { exercicioId: 'mesa-flexora', ordem: 3, series: 3, repeticoes: '10-12', rpeSugerido: 7, descanso: 60 },
        { exercicioId: 'panturrilha-em-pe', ordem: 4, series: 4, repeticoes: '12-15', rpeSugerido: 7, descanso: 45 },
        { exercicioId: 'abdominal', ordem: 5, series: 3, repeticoes: '15-20', rpeSugerido: 6, descanso: 45 }
    ];
    for (const ex of exerciciosTemplate3) {
        await prisma.treinoTemplateExercicio.upsert({
            where: {
                templateId_exercicioId_ordem: {
                    templateId: template3.id,
                    exercicioId: ex.exercicioId,
                    ordem: ex.ordem
                }
            },
            update: {},
            create: {
                templateId: template3.id,
                exercicioId: ex.exercicioId,
                ordem: ex.ordem,
                series: ex.series,
                repeticoes: ex.repeticoes,
                rpeSugerido: ex.rpeSugerido,
                descanso: ex.descanso,
                obrigatorio: true
            }
        });
    }
    // ============================================
    // HIPERTROFIA - INTERMEDIÁRIO
    // ============================================
    // Template 4: Hipertrofia Intermediário 3x/semana - A-B-C (Pernas)
    const template4 = await prisma.treinoTemplate.upsert({
        where: { id: 'hipertrofia-intermediario-3x-abc-pernas' },
        update: {},
        create: {
            id: 'hipertrofia-intermediario-3x-abc-pernas',
            nome: 'Hipertrofia Intermediário - A-B-C Pernas',
            descricao: 'Dia A da divisão A-B-C: Foco em pernas completas com volume moderado.',
            objetivo: 'Hipertrofia',
            nivelExperiencia: 'Intermediário',
            frequenciaSemanal: 3,
            divisaoTreino: 'A-B-C',
            gruposMusculares: ['Quadríceps', 'Posteriores', 'Panturrilhas', 'Glúteos'],
            tempoEstimado: 70,
            volumeTotal: 20,
            ativo: true
        }
    });
    const exerciciosTemplate4 = [
        { exercicioId: 'agachamento', ordem: 1, series: 4, repeticoes: '8-10', rpeSugerido: 8, descanso: 120 },
        { exercicioId: 'leg-press', ordem: 2, series: 3, repeticoes: '10-12', rpeSugerido: 7, descanso: 90 },
        { exercicioId: 'cadeira-extensora', ordem: 3, series: 3, repeticoes: '12-15', rpeSugerido: 7, descanso: 60 },
        { exercicioId: 'mesa-flexora', ordem: 4, series: 4, repeticoes: '10-12', rpeSugerido: 7, descanso: 90 },
        { exercicioId: 'panturrilha-em-pe', ordem: 5, series: 4, repeticoes: '12-15', rpeSugerido: 7, descanso: 60 },
        { exercicioId: 'panturrilha-em-pe', ordem: 6, series: 3, repeticoes: '15-20', rpeSugerido: 6, descanso: 45 }
    ];
    for (const ex of exerciciosTemplate4) {
        await prisma.treinoTemplateExercicio.upsert({
            where: {
                templateId_exercicioId_ordem: {
                    templateId: template4.id,
                    exercicioId: ex.exercicioId,
                    ordem: ex.ordem
                }
            },
            update: {},
            create: {
                templateId: template4.id,
                exercicioId: ex.exercicioId,
                ordem: ex.ordem,
                series: ex.series,
                repeticoes: ex.repeticoes,
                rpeSugerido: ex.rpeSugerido,
                descanso: ex.descanso,
                obrigatorio: true
            }
        });
    }
    // Template 5: Hipertrofia Intermediário 3x/semana - A-B-C (Push)
    const template5 = await prisma.treinoTemplate.upsert({
        where: { id: 'hipertrofia-intermediario-3x-abc-push' },
        update: {},
        create: {
            id: 'hipertrofia-intermediario-3x-abc-push',
            nome: 'Hipertrofia Intermediário - A-B-C Push',
            descricao: 'Dia B da divisão A-B-C: Peito, Ombros e Tríceps.',
            objetivo: 'Hipertrofia',
            nivelExperiencia: 'Intermediário',
            frequenciaSemanal: 3,
            divisaoTreino: 'A-B-C',
            gruposMusculares: ['Peito', 'Ombros', 'Tríceps'],
            tempoEstimado: 70,
            volumeTotal: 20,
            ativo: true
        }
    });
    const exerciciosTemplate5 = [
        { exercicioId: 'supino-reto', ordem: 1, series: 4, repeticoes: '8-10', rpeSugerido: 8, descanso: 120 },
        { exercicioId: 'supino-inclinado', ordem: 2, series: 3, repeticoes: '10-12', rpeSugerido: 7, descanso: 90 },
        { exercicioId: 'crucifixo', ordem: 3, series: 3, repeticoes: '12-15', rpeSugerido: 7, descanso: 60 },
        { exercicioId: 'desenvolvimento', ordem: 4, series: 4, repeticoes: '8-10', rpeSugerido: 7, descanso: 90 },
        { exercicioId: 'elevacao-lateral', ordem: 5, series: 3, repeticoes: '12-15', rpeSugerido: 7, descanso: 60 },
        { exercicioId: 'triceps-puxada', ordem: 6, series: 3, repeticoes: '10-12', rpeSugerido: 7, descanso: 60 },
        { exercicioId: 'triceps-frances', ordem: 7, series: 3, repeticoes: '12-15', rpeSugerido: 7, descanso: 60 }
    ];
    for (const ex of exerciciosTemplate5) {
        await prisma.treinoTemplateExercicio.upsert({
            where: {
                templateId_exercicioId_ordem: {
                    templateId: template5.id,
                    exercicioId: ex.exercicioId,
                    ordem: ex.ordem
                }
            },
            update: {},
            create: {
                templateId: template5.id,
                exercicioId: ex.exercicioId,
                ordem: ex.ordem,
                series: ex.series,
                repeticoes: ex.repeticoes,
                rpeSugerido: ex.rpeSugerido,
                descanso: ex.descanso,
                obrigatorio: true
            }
        });
    }
    // Template 6: Hipertrofia Intermediário 3x/semana - A-B-C (Pull)
    const template6 = await prisma.treinoTemplate.upsert({
        where: { id: 'hipertrofia-intermediario-3x-abc-pull' },
        update: {},
        create: {
            id: 'hipertrofia-intermediario-3x-abc-pull',
            nome: 'Hipertrofia Intermediário - A-B-C Pull',
            descricao: 'Dia C da divisão A-B-C: Costas, Bíceps e Abdômen.',
            objetivo: 'Hipertrofia',
            nivelExperiencia: 'Intermediário',
            frequenciaSemanal: 3,
            divisaoTreino: 'A-B-C',
            gruposMusculares: ['Costas', 'Bíceps', 'Abdômen'],
            tempoEstimado: 70,
            volumeTotal: 20,
            ativo: true
        }
    });
    const exerciciosTemplate6 = [
        { exercicioId: 'puxada-frontal', ordem: 1, series: 4, repeticoes: '8-10', rpeSugerido: 8, descanso: 120 },
        { exercicioId: 'remada-curvada', ordem: 2, series: 4, repeticoes: '8-10', rpeSugerido: 7, descanso: 90 },
        { exercicioId: 'remada-unilateral', ordem: 3, series: 3, repeticoes: '10-12', rpeSugerido: 7, descanso: 90 },
        { exercicioId: 'rosca-direta', ordem: 4, series: 3, repeticoes: '10-12', rpeSugerido: 7, descanso: 60 },
        { exercicioId: 'rosca-concentrada', ordem: 5, series: 3, repeticoes: '10-12', rpeSugerido: 7, descanso: 60 },
        { exercicioId: 'abdominal', ordem: 6, series: 3, repeticoes: '15-20', rpeSugerido: 6, descanso: 45 },
        { exercicioId: 'abdominal', ordem: 7, series: 3, repeticoes: '12-15', rpeSugerido: 6, descanso: 45 }
    ];
    for (const ex of exerciciosTemplate6) {
        await prisma.treinoTemplateExercicio.upsert({
            where: {
                templateId_exercicioId_ordem: {
                    templateId: template6.id,
                    exercicioId: ex.exercicioId,
                    ordem: ex.ordem
                }
            },
            update: {},
            create: {
                templateId: template6.id,
                exercicioId: ex.exercicioId,
                ordem: ex.ordem,
                series: ex.series,
                repeticoes: ex.repeticoes,
                rpeSugerido: ex.rpeSugerido,
                descanso: ex.descanso,
                obrigatorio: true
            }
        });
    }
    // ============================================
    // FORÇA - INTERMEDIÁRIO
    // ============================================
    // Template 7: Força Intermediário 3x/semana - 5x5
    const template7 = await prisma.treinoTemplate.upsert({
        where: { id: 'forca-intermediario-3x-5x5' },
        update: {},
        create: {
            id: 'forca-intermediario-3x-5x5',
            nome: 'Força Intermediário - Método 5x5',
            descricao: 'Treino focado em força usando método 5x5. Exercícios compostos com cargas altas.',
            objetivo: 'Força',
            nivelExperiencia: 'Intermediário',
            frequenciaSemanal: 3,
            divisaoTreino: 'A-B',
            gruposMusculares: ['Peito', 'Costas', 'Quadríceps', 'Posteriores', 'Ombros'],
            tempoEstimado: 60,
            volumeTotal: 15,
            ativo: true
        }
    });
    const exerciciosTemplate7 = [
        { exercicioId: 'agachamento', ordem: 1, series: 5, repeticoes: '5', rpeSugerido: 9, descanso: 180 },
        { exercicioId: 'supino-reto', ordem: 2, series: 5, repeticoes: '5', rpeSugerido: 9, descanso: 180 },
        { exercicioId: 'remada-curvada', ordem: 3, series: 5, repeticoes: '5', rpeSugerido: 9, descanso: 180 }
    ];
    for (const ex of exerciciosTemplate7) {
        await prisma.treinoTemplateExercicio.upsert({
            where: {
                templateId_exercicioId_ordem: {
                    templateId: template7.id,
                    exercicioId: ex.exercicioId,
                    ordem: ex.ordem
                }
            },
            update: {},
            create: {
                templateId: template7.id,
                exercicioId: ex.exercicioId,
                ordem: ex.ordem,
                series: ex.series,
                repeticoes: ex.repeticoes,
                rpeSugerido: ex.rpeSugerido,
                descanso: ex.descanso,
                obrigatorio: true
            }
        });
    }
    // ============================================
    // EMAGRECIMENTO - INICIANTE
    // ============================================
    // Template 8: Emagrecimento Iniciante 3x/semana - Full Body Circuito
    const template8 = await prisma.treinoTemplate.upsert({
        where: { id: 'emagrecimento-iniciante-3x-fullbody' },
        update: {},
        create: {
            id: 'emagrecimento-iniciante-3x-fullbody',
            nome: 'Emagrecimento Iniciante - Full Body Circuito',
            descricao: 'Treino em circuito para emagrecimento. Exercícios com pouco descanso para manter frequência cardíaca elevada.',
            objetivo: 'Emagrecimento',
            nivelExperiencia: 'Iniciante',
            frequenciaSemanal: 3,
            divisaoTreino: 'Full Body',
            gruposMusculares: ['Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 'Quadríceps', 'Posteriores', 'Abdômen'],
            tempoEstimado: 45,
            volumeTotal: 18,
            ativo: true
        }
    });
    const exerciciosTemplate8 = [
        { exercicioId: 'supino-reto', ordem: 1, series: 3, repeticoes: '12-15', rpeSugerido: 7, descanso: 30 },
        { exercicioId: 'remada-curvada', ordem: 2, series: 3, repeticoes: '12-15', rpeSugerido: 7, descanso: 30 },
        { exercicioId: 'desenvolvimento', ordem: 3, series: 3, repeticoes: '12-15', rpeSugerido: 7, descanso: 30 },
        { exercicioId: 'agachamento', ordem: 4, series: 3, repeticoes: '12-15', rpeSugerido: 7, descanso: 30 },
        { exercicioId: 'mesa-flexora', ordem: 5, series: 3, repeticoes: '12-15', rpeSugerido: 7, descanso: 30 },
        { exercicioId: 'abdominal', ordem: 6, series: 3, repeticoes: '20-25', rpeSugerido: 6, descanso: 30 }
    ];
    for (const ex of exerciciosTemplate8) {
        await prisma.treinoTemplateExercicio.upsert({
            where: {
                templateId_exercicioId_ordem: {
                    templateId: template8.id,
                    exercicioId: ex.exercicioId,
                    ordem: ex.ordem
                }
            },
            update: {},
            create: {
                templateId: template8.id,
                exercicioId: ex.exercicioId,
                ordem: ex.ordem,
                series: ex.series,
                repeticoes: ex.repeticoes,
                rpeSugerido: ex.rpeSugerido,
                descanso: ex.descanso,
                obrigatorio: true
            }
        });
    }
    console.log('✅ Seed de templates de treino concluído!');
    console.log(`✅ Total de templates criados: 8`);
}
main()
    .catch((e) => {
    console.error('❌ Erro no seed de templates:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed-templates.js.map