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
