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

## Laboratório móvel — 5 de outubro de 2026

Lighthouse 13 executado no GitHub Actions, com relatórios JSON e HTML. A medição aguarda a publicação da revisão esperada no Render antes de começar. Os relatórios são mantidos por 14 dias nos artefatos do workflow.

| Medição | Desempenho | Acessibilidade | SEO | LCP | CLS | TBT |
| --- | --- | --- | --- | --- | --- | --- |
| 22:07 UTC — primeira execução | 65 | 94 | 100 | 6,7 s | 0 | 460 ms |
| 22:12 UTC — revisão 7447750 | 91 | 100 | 100 | 1,3 s | 0 | 380 ms |
| 22:16 UTC — revisão 574bf89 | 68 | 100 | 100 | 6,1 s | 0 | 400 ms |
| 22:22 UTC — amostra 1 da revisão 58cc8bb | 70 | 100 | 100 | 1,62 s | 0 | 2444 ms |
| 22:22 UTC — amostra 2 da revisão 58cc8bb | 97 | 100 | 100 | 2,56 s | 0 | 45 ms |
| 22:22 UTC — amostra 3 da revisão 58cc8bb | 97 | 100 | 100 | 2,48 s | 0 | 1 ms |

Mediana das três amostras finais: desempenho **97**, LCP **2,48 s**, CLS **0**, TBT **45 ms**. Acessibilidade, boas práticas e SEO: **100** em todas as três. A primeira amostra apresentou bloqueio elevado; não foi omitida. O resultado é uma amostra de laboratório, não uma garantia de campo.

Evidência final e relatórios das três execuções: https://github.com/lucashenriquebutura37-stack/megamix-store/actions/runs/37381896166

O logo original permanece intacto. A entrega pelo servidor gera versões de 360 e 720 pixels, mantém cache por variante e formato e retorna o original se falhar. WebP de 360 pixels: 34.060 bytes; de 720 pixels: 106.838 bytes, contra 982.420 bytes do PNG original. A captura móvel confirmou a transferência da variante de 720 pixels. Os clientes sem WebP recebem PNG redimensionado. A hospedagem estática continua podendo servir o PNG original com os mesmos parâmetros de URL.

Evidência da segunda execução: https://github.com/lucashenriquebutura37-stack/megamix-store/actions/runs/37380895249

Correções verificadas: contraste dos textos, nome acessível do carrinho, área principal, dimensões das imagens e ausência de erros de console. A diferença entre execuções também pode refletir variação de rede, servidor e ambiente de teste; não é uma garantia de desempenho para todos os usuários. TBT não equivale a INP. A medição de campo continua pendente.
