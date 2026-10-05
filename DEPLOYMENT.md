# Deploy da VORZELI

## Pré-deploy
1. Execute `npm install`, `npm run check` e `npm test`.
2. Confirme as variáveis de `.env.example` no ambiente, sem registrar segredos no Git.
3. Confirme PostgreSQL disponível e domínio HTTPS.

## Pós-deploy
- Verifique `/healthz` e `/api/status`.
- Abra homepage, produto, carrinho, checkout e rastreio.
- Faça um pedido de teste antes de uma alteração crítica.
- Confirme webhook, e-mail e cotação de frete.

## Rollback
Reimplante o último commit conhecido como estável e valide novamente os endpoints de saúde.
