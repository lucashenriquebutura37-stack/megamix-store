# Próximas etapas manuais — VORZELI

As alterações de código e CI já foram publicadas. Os itens abaixo exigem acesso à conta, configuração de credenciais ou serviços externos. Não enviar senhas, códigos ou URLs privadas pelo chat.

## Retomada em 6 de outubro de 2026

- Login no Render concluído e verificado no painel autenticado.
- Build do serviço alterado de `npm install` para `npm ci`; o build passou com zero vulnerabilidades.
- Health Check Path configurado como `/healthz`; deploy de configuração confirmado como ativo.
- Loja, `/healthz` e `/api/status` responderam HTTP 200 às 06:05:54 (São Paulo), com timestamps atuais. O único aviso foi `admin_2fa_not_configured`.
- O banco `vorzeli-db` está disponível no plano gratuito. O painel informa expiração em **3 de novembro de 2026**, com exclusão caso não seja atualizado para um plano pago. Resolver a continuidade e preservar os dados antes dessa data.
- No plano atual, o painel bloqueia exportação, recuperação e shell do serviço. Nenhuma contratação ou cobrança foi realizada. Backup de produção e ensaio de restauração continuam pendentes.

| Etapa | Ação e comprovação necessárias |
| --- | --- |
| 2FA administrativo | Login no Render concluído. Configurar `ADMIN_TOTP_SECRET` no ambiente protegido e o mesmo segredo no autenticador, mantendo acesso à senha administrativa. A criação e entrada da nova credencial exigem participação do titular. Validar login com senha e código e a recusa de reutilização. `/api/status` deve mostrar `admin_2fa: true`. |
| Backup de produção | Usar `scripts/backup.sh` com `DATABASE_URL` no ambiente protegido. Guardar o dump em armazenamento privado com retenção e acesso controlado. |
| Recuperação de produção | Disponibilizar um banco separado, vazio e sem outros escritores. Executar `scripts/restore-rehearsal.sh` com `RESTORE_DATABASE_URL` e comparar dados e fluxos. Conferir manualmente que o destino não é um alias de produção. O ensaio do CI usa dados fictícios. |
| Indexação | Acessar Search Console, verificar a propriedade e o sitemap e consultar a indexação das páginas públicas de produto. O processamento depende do Google. |
| Core Web Vitals | Consultar dados de campo no Search Console/PageSpeed. O Lighthouse mede laboratório; TBT não substitui INP. |
| Alertas | Conferir destinatário e preferências de notificações do GitHub e verificar a entrega de um alerta de teste sem provocar indisponibilidade na loja. |
| Compra em sandbox | Disponibilizar contas e credenciais de teste do pagamento e frete, produto fictício e endereço de e-mail de teste autorizado. Validar pagamento aprovado/rejeitado, webhook duplicado, estoque, cupom, e-mail, rastreio e entrega. Não efetuar cobrança real. |

## Comandos disponíveis

Configurar as variáveis no ambiente protegido, sem inserir valores reais em comandos compartilhados:

```bash
bash scripts/backup.sh /caminho/privado/vorzeli.dump
bash scripts/restore-rehearsal.sh /caminho/privado/vorzeli.dump
```

Os scripts exigem Node e os clientes `pg_dump`, `pg_restore` e `psql`. As credenciais de conexão são passadas por variáveis libpq, sem colocá-las nos argumentos dos clientes. A restauração recusa bancos não vazios ou inacessíveis e é transacional. O catálogo validado não comprova recuperação integral: comparar os dados restaurados continua necessário.
