# Performance

## Orçamento recomendado
- Evitar novas bibliotecas grandes no cliente.
- Imagens de produto devem ser comprimidas e dimensionadas para uso web.
- Recursos estáticos versionados podem usar cache longo; HTML/API não devem receber cache agressivo quando contêm estado dinâmico.
- Revalidar a experiência em rede móvel após mudanças visuais.

## Verificação
Testar homepage, busca, produto, carrinho e checkout em largura de iPhone e confirmar ausência de overflow horizontal.

## Compressão HTTP
Respostas públicas maiores que 1 KiB são comprimidas quando o cliente anuncia suporte. Respostas administrativas são excluídas. O comportamento é validado por um teste HTTP com gzip e conferência do conteúdo descomprimido.
Isso reduz a transferência dos arquivos de texto, mas não prova os limites de LCP, INP e CLS em dados de campo. Os Core Web Vitals continuam pendentes de medição em PageSpeed/Search Console e validação em rede móvel.
