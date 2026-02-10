# Workflow .design (v5)

## Entrada única
`node .design/run.mjs <alvo>`

## Etapas (flows)
1) `init-flow` — indexa repo e gera `.design/init/*`
2) `baseline-flow` — cria baseline skeleton em `.design/baselines/`
3) `iterate-flow` — cria templates de candidatos + scorecard em `.design/candidates/<alvo>/`
4) `spec-flow` — cria spec skeleton em `.design/specs/pages/`
5) `plan-flow` — cria plano skeleton em `.design/plans/`

## Depois do runner (função do agente)
- Preencher baseline com HTML/JSON real (quando necessário)
- Preencher os 3 candidatos com propostas reais e diffs de tokens
- Preencher scorecard e conversar com o usuário
- Consolidar spec final e detalhar o plano
- Implementar no código e preencher QA
