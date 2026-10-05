# Auditoria de maturidade VORZELI — 5 de outubro de 2026

O placar histórico 85/100 foi recebido como referência, não como prova de uma nova auditoria integral. Desde então, os filtros (13), o lockfile (98), a CSP estrita (88) e o CI no commit fced506 (96) foram implementados e verificados: avanço de referência para 89/100. A lista original identificava menos pendências do que o total anunciado; não foram inventados itens para completar a contagem.

## Evidência obtida
- CI de validação e GitHub Pages verdes no commit de código `fced506e88f9ca41ae869c0e8c77bd0ddc2f1da5`.
- Instalação por `npm ci`, lockfile atualizado e auditoria sem vulnerabilidades.
- 77 testes locais, incluindo TOTP, repetição de códigos, filtros, ações da interface, compressão, logs, descontos, assinatura de webhook, transições de pagamento, estoque/cupom, indisponibilidade do banco, sitemap, monitoramento, proteções da restauração e carregamento de imagens sem credenciais no CDN verificado.
- Política de produção sem `unsafe-inline` ou `unsafe-eval`, com scripts e estilos externos.
- Categoria, detalhes e carrinho verificados no navegador publicado; limite de estoque e subtotal zero após remoção.
- `/healthz` e `/api/status` respondendo 200; arquivos públicos recebendo gzip; `/server.js` e `/lib/totp.js` retornando 404.
- Ferramentas de backup e restauração e monitoramento por GitHub Actions adicionados.
- Restauração recusa destino não vazio ou inacessível, URLs inválidas, parâmetros que alteram o destino e endereço de produção com credenciais diferentes. Valida o catálogo antes de restaurar em transação única. Testes usam clientes PostgreSQL simulados; não comprovam recuperação real de dados. Use um banco isolado e mantenha-o sem outros escritores durante o ensaio; aliases de host não são identificados pela comparação de URLs.
- CI real aprovado no commit `75417c7`: PostgreSQL 16, migração aplicada duas vezes, unicidade de pagamento, concorrência de estoque e contador 2FA, rollback transacional. Cinco testes de integração aprovados (incluindo o teste principal).
- Backup/restauração executados com dados fictícios em dois bancos descartáveis no CI, comparando todas as tabelas públicas e a sequência de produtos. Isso valida as ferramentas, mas não substitui um backup de produção. Evidência: https://github.com/lucashenriquebutura37-stack/megamix-store/actions/runs/37380225093
- Monitoramento agendado confirmado com sucesso em https://github.com/lucashenriquebutura37-stack/megamix-store/actions/runs/37379617423 ; entrega de notificação em falha permanece sem comprovação.
- SEO público verificado: robots e sitemap 200, produto `/produto/1` com canonical correto e dados estruturados, página de pedido com noindex.
- Lighthouse móvel na revisão `7447750`: desempenho 91, acessibilidade 100, SEO 100, LCP 1,3 s, CLS 0 e TBT 380 ms; sem erros de console. Dados de laboratório não substituem dados de campo. Evidência: https://github.com/lucashenriquebutura37-stack/megamix-store/actions/runs/37380895249
- Verificação final da revisão `58cc8bb`: mediana de três amostras móveis com desempenho 97, LCP 2,48 s, CLS 0 e TBT 45 ms. Acessibilidade, boas práticas e SEO 100 nas três amostras; a primeira teve TBT elevado e consta integralmente no relatório. Logo responsivo entregue em produção e carregamento do CDN sem cookies verificados. Evidência: https://github.com/lucashenriquebutura37-stack/megamix-store/actions/runs/37381896166
- CI aprovado com 77 testes locais e cinco testes de integração PostgreSQL (contando o teste principal), auditoria sem vulnerabilidades e ensaio de backup/restauração de dados fictícios. Verificação final: https://github.com/lucashenriquebutura37-stack/megamix-store/actions/runs/37381896164
- Monitoramento da página da loja e dos dois endpoints, com timestamps de até 120 segundos, ausência de cache e três tentativas antes de falhar. Consulta direta dos três endereços aprovada nesta retomada. O aviso isolado de 2FA não falha a verificação.

## Pendências que não podem ser marcadas como concluídas
| Item | Situação |
| --- | --- |
| 79 — Indexação completa | Depende de evidência no Search Console e do processamento pelo Google. |
| 80 — Core Web Vitals | LCP e CLS medidos em laboratório; faltam dados de campo, incluindo INP. |
| 90 — 2FA | Código testado; `ADMIN_TOTP_SECRET` ainda precisa de configuração segura no Render e login real de validação. |
| 95 — Backup | Ensaio com dados fictícios aprovado; falta backup de produção, retenção e restauração isolada desses dados. |
| 97 — Testes completos | PostgreSQL real e concorrência validados; faltam integrações externas de homologação. |
| 99 — Alertas | Execução agendada comprovada; falta confirmar entrega de notificação ao responsável. |
| 100 — E2E final | Navegação e carrinho verificados; pagamento, webhook, envio e e-mails em sandbox ainda pendentes. |

## Acesso necessário
O Render abriu na página de login no navegador desta sessão. Para concluir 2FA, backup e homologação é necessário autenticar pelo fluxo seguro; senhas e códigos não devem ser enviados pelo chat. A ativação de um novo segredo de autenticação exige configuração segura pelo responsável. Indexação e métricas de campo requerem acesso ao Search Console.

As ações que dependem de acesso, dados privados e contas de teste estão detalhadas em `MANUAL_CHECKLIST.md`. O login foi deixado para execução manual por solicitação do responsável.
