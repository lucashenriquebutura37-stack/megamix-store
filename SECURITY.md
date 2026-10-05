# Segurança da VORZELI

- Nunca versionar tokens, senhas ou chaves.
- Administração usa cookie Secure, HttpOnly e SameSite=Strict.
- Webhooks devem validar assinatura em produção.
- Dados públicos devem ser mínimos e respostas administrativas exigem autenticação.
- Rate limiting deve permanecer habilitado.
- Alterações em CSP devem ser testadas antes de remover compatibilidade com scripts existentes.

## Incidente
Rotacione credenciais afetadas, encerre sessões administrativas, preserve logs necessários e valide pedidos/pagamentos antes de reabrir operações.

## Segundo fator administrativo
O login exige senha e código TOTP quando `ADMIN_TOTP_SECRET` está configurado no Render.
Use um segredo Base32 aleatório de 32 caracteres, criado e guardado num gerenciador de senhas. Cadastre o mesmo segredo no autenticador com SHA1, seis dígitos e período de 30 segundos. Não coloque o segredo no GitHub ou em mensagens.
O servidor rejeita códigos reutilizados de forma atômica no PostgreSQL e aplica o limite de tentativas também ao segundo fator. Segredos malformados impedem a inicialização. Sem a variável, o login anterior continua disponível e `/api/status` sinaliza `admin_2fa_not_configured`.
Antes de considerar a ativação concluída: configure a variável, valide um login com código e confirme a rejeição de um código errado e de um código repetido. Guarde o segredo com segurança para recuperação.

## Monitoramento
`Disponibilidade VORZELI` verifica `/healthz` e `/api/status` a cada 15 minutos, com três tentativas e limite de tempo. Uma falha gera uma execução vermelha no Actions. Habilite as notificações de falhas do Actions na conta responsável e valide a entrega antes de considerar os alertas homologados. O agendador do GitHub pode atrasar execuções; isso não representa um SLA de 15 minutos.
