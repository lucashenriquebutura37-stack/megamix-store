# Segurança da VORZELI

- Nunca versionar tokens, senhas ou chaves.
- Administração usa cookie Secure, HttpOnly e SameSite=Strict.
- Webhooks devem validar assinatura em produção.
- Dados públicos devem ser mínimos e respostas administrativas exigem autenticação.
- Rate limiting deve permanecer habilitado.
- Alterações em CSP devem ser testadas antes de remover compatibilidade com scripts existentes.

## Incidente
Rotacione credenciais afetadas, encerre sessões administrativas, preserve logs necessários e valide pedidos/pagamentos antes de reabrir operações.
