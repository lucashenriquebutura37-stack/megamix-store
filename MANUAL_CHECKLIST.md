# Próximas etapas manuais — VORZELI

As alterações de código e CI já foram publicadas. Os itens abaixo exigem acesso à conta, configuração de credenciais ou serviços externos. Não enviar senhas, códigos ou URLs privadas pelo chat.

| Etapa | Ação e comprovação necessárias |
| --- | --- |
| Render e 2FA | Concluir o login. Configurar `ADMIN_TOTP_SECRET` no ambiente protegido e o mesmo segredo no autenticador, mantendo acesso à senha administrativa. Validar login com senha e código e a recusa de reutilização. `/api/status` deve mostrar `admin_2fa: true`. |
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
