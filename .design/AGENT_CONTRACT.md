# Contrato do Agente (.design)

## Trigger
Quando o usuário disser:
> "Execute o workflow .design para redesign do alvo <alvo>."

O agente deve:
1) Executar: `node .design/run.mjs <alvo>`
2) Ler os artefatos gerados e conduzir o diálogo:
   - apresentar scorecard e recomendação
   - no máximo 3 perguntas objetivas
   - consolidar decisão em `specs/pages/<alvo>.redesign.md`
3) Produzir/atualizar o plano em `plans/<alvo>-implementation-plan.md`
4) Implementar no código com gates de QA

## Regras inegociáveis
- Sem rede / sem login / sem API externa
- Baseline obrigatório antes de redesign
- 3 candidatos + scorecard obrigatórios
- Sem mudar lógica de negócio na fase de design
- QA checklist como gate final
