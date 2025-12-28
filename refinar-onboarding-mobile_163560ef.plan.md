---
name: refinar-onboarding-mobile
overview: Diagnosticar e ajustar o layout dos passos do onboarding para reduzir fricÃ§Ã£o no mobile.
todos:
  - id: ajustar-headers
    content: Reduzir tipografia/margens dos headers nas etapas iniciais
    status: pending
  - id: cards-responsivos
    content: Adicionar variaÃ§Ã£o compacta em OnboardingStepCard
    status: pending
  - id: grid-mobile
    content: Rever grid e altura dos cards de idade/sexo/biotipo
    status: pending
    dependencies:
      - cards-responsivos
  - id: fluxo-navegacao
    content: Melhorar barra e CTA para avanÃ§ar sem rolagem
    status: pending
    dependencies:
      - ajustar-headers
---

# Plano â€“ Melhorar Onboarding Mobile

## ObservaÃ§Ãµes principais

- Todas as telas do onboarding (idade, sexo, tipo de corpo, objetivos, experiÃªncia etc.) sÃ£o renderizadas dentro de `frontend/src/pages/Landing.tsx` e recebem textos/imagens especÃ­ficos via `useGenderContent`. Em dispositivos mÃ³veis, cada etapa mantÃ©m headings `text-3xl+`, descriÃ§Ãµes longas e `mb-8`, o que exige mÃºltiplas dobras antes de mostrar as opÃ§Ãµes â€” tanto para o fluxo masculino quanto para o feminino.
- `OnboardingStepCard` aplica `ring-4` + `scale-105` quando selecionado e fixa `aspect-[3/4]`, deixando os cards altos e cortando imagens (masculinas/femininas) de forma inconsistente. Como o componente Ã© compartilhado, o problema se repete em todas as perguntas.
- As grids configuradas com `grid-cols-2/3` e `gap-4/6` nÃ£o se adaptam a telas estreitas: surge overflow lateral, espaÃ§amento exagerado e legendas desalinhadas. AlÃ©m disso, os botÃµes "PrÃ³ximo" sÃ³ aparecem apÃ³s rolagem total, aumentando a fricÃ§Ã£o em cada passo.

## AÃ§Ãµes propostas

1. **Normalizar tipografia/espacÌ§amentos em cada etapa**  
   Arquivos: `frontend/src/components/onboarding/steps/StepIdade.tsx`, `StepSexo.tsx` e blocos condicionais para tipo de corpo, objetivos e experiÃªncia dentro de `frontend/src/pages/Landing.tsx`.  
   - Reduzir headings para `text-2xl` (`text-xl` em `<sm`), condensar descriÃ§Ãµes em uma linha/bullet e usar `mt-4/mb-4` para que tÃ­tulo + subtÃ­tulo ocupem ~1/3 da tela em ambos os gÃªneros.

2. **Atualizar `OnboardingStepCard` com variaÃ§Ã£o responsiva**  
   Arquivo: `frontend/src/components/onboarding/OnboardingStepCard.tsx`.  
   - Adicionar props como `variant="compact"` e `imageFit="top"` para controlar `ring`, `padding`, `aspect-ratio` e limitar altura (`max-hâ‰ˆ240 px` no mobile). Ajustar o check de seleÃ§Ã£o para nÃ£o aumentar o card e aplicar `object-top`/`object-center` conforme a imagem (masculina/feminina).

3. **Reestruturar grids/containers de opÃ§Ãµes em todos os passos**  
   Arquivos: steps citados + seÃ§Ãµes renderizadas diretamente na `Landing.tsx` (tipo de corpo masc./fem., objetivos, frequÃªncia, preferÃªncias).  
   - Usar `grid-cols-1` com `max-w-sm mx-auto` abaixo de 640 px, `gap-3`, e aplicar carrossel horizontal (`scroll-snap-x`) quando houver muitas opÃ§Ãµes, reduzindo a rolagem vertical. Definir `min-h`/`max-h` uniformes e centralizar legendas.

4. **Reduzir fricÃ§Ã£o de navegaÃ§Ã£o e CTA**  
   Arquivo: `frontend/src/components/onboarding/OnboardingLayout.tsx` ou container equivalente em `Landing.tsx`.  
   - Fixar a barra â€œFaltam apenas 3 minutosâ€, exibir indicador de progresso e manter botÃµes â€œVoltar/Continuarâ€ sticky no rodapÃ© para que o usuÃ¡rio avance sem precisar rolar atÃ© o final de cada tela.

## Cobertura completa (masculino e feminino)

- O hook `useGenderContent` alimenta textos e imagens em cada passo; aplicaremos as melhorias acima em todos os componentes que consomem esse conteÃºdo, garantindo consistÃªncia para homens e mulheres.
- Onde houver imagens especÃ­ficas (tipo de corpo, objetivos, preferÃªncias), ajustaremos o posicionamento (`object-top`, `object-center`) e proporÃ§Ãµes dentro do novo `OnboardingStepCard` para reduzir cortes e manter o foco correto em ambos os fluxos.
