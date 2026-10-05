# Backup e recuperação

O PostgreSQL é a fonte principal de produtos, pedidos, estoque, cupons, avaliações e perguntas.

## Rotina
- Manter backups automáticos no provedor do banco quando o plano oferecer o recurso.
- Antes de migrações relevantes, gerar snapshot/exportação.
- Não armazenar dumps com dados de clientes no repositório.

## Recuperação
1. Restaurar o banco em ambiente isolado.
2. Validar contagens de pedidos, produtos e estoque.
3. Validar `/api/status`.
4. Só então apontar a aplicação para o banco recuperado.

A existência de uma política neste arquivo não significa que um backup externo esteja habilitado; isso deve ser confirmado no provedor.

## Ferramentas executáveis
Use `scripts/backup.sh /caminho/protegido/backup.dump` com `DATABASE_URL` no ambiente, PostgreSQL CLI instalado e disco protegido. O script recusa sobrescritas e valida o catálogo do arquivo; isso não equivale a provar restauração.
Use `scripts/restore-rehearsal.sh /caminho/protegido/backup.dump` com `RESTORE_DATABASE_URL` apontando para um banco isolado e vazio. Confirme manualmente o host e o banco de destino: aliases diferentes da mesma base não são detectados pela comparação das URLs. A restauração é transacional e falha em erros; nunca use a URL de produção como destino.
Compare contagens de `products`, `orders`, `coupons`, `product_reviews` e `product_questions`, além de estoque e totais de pedidos. Registre data, arquivo, retenção, ambiente e resultado do ensaio. Não grave dados pessoais ou URLs de banco nos logs ou no repositório.
