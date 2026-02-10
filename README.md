# .design v5 — Workflow automatizado e local com uso do conceito de flows e job runner

Você quer escrever:
> **"Execute o workflow .design para redesign do alvo settings."**

E o agente deve executar:
```bash
node .design/run.mjs settings
```

Este runner cria/atualiza automaticamente:
- `.design/init/*` (contexto do repo, heurístico)
- `.design/baselines/<alvo>.before.*` (baseline skeleton)
- `.design/candidates/<alvo>/*` (3 candidatos + scorecard)
- `.design/specs/pages/<alvo>.redesign.md` (spec skeleton)
- `.design/plans/<alvo>-implementation-plan.md` (plan skeleton)
- `.design/state/<alvo>.job.json` (job state, estilo "job-runner")

> Sem rede, sem login, sem dependências externas.  
> Código auxiliar fica em `.design/scripts/` (não há `scripts/` na raiz).

---

## Instalação
Copie a pasta `.design/` para a raiz do seu projeto.

## Uso
### Rodar o workflow completo (scaffold + init)
```bash
node .design/run.mjs settings
```

### Rodar por fase (opcional)
```bash
node .design/run.mjs settings --phase init
node .design/run.mjs settings --phase baseline
node .design/run.mjs settings --phase iterate
node .design/run.mjs settings --phase spec
node .design/run.mjs settings --phase plan
```

### Retomar a partir do job state
```bash
node .design/run.mjs settings --resume
```

---

## Integração com Codex / Antigravity / Gemini CLI

Crie uma regra/instruction:
- Se a mensagem casar com: `Execute o workflow .design para redesign do alvo <alvo>.`
  1) execute `node .design/run.mjs <alvo>`
  2) abra `.design/candidates/<alvo>/scorecard.md` e apresente recomendações
  3) faça **no máximo 3 perguntas objetivas** se necessário
  4) consolide a decisão em `.design/specs/pages/<alvo>.redesign.md`
  5) detalhe o plano em `.design/plans/<alvo>-implementation-plan.md`

---

## Nota sobre “diálogo automático”
O runner **não pergunta** nada (sem TTY). Ele:
- cria um `decision.md` dentro de `.design/candidates/<alvo>/`
- marca o job como `awaiting_user_decision`

O agente é quem lê o scorecard e conversa com você, e depois atualiza o spec/plan.
