#!/usr/bin/env bash
set -euo pipefail
: "${DATABASE_URL:?Configure DATABASE_URL de produção para comparação}"
: "${RESTORE_DATABASE_URL:?Configure um banco isolado e vazio}"
if [ "$DATABASE_URL" = "$RESTORE_DATABASE_URL" ]; then echo 'Destino deve ser diferente de produção.' >&2; exit 2; fi
if [ "$#" -ne 1 ] || [ ! -f "$1" ]; then echo 'Informe um backup existente.' >&2; exit 2; fi
unset DATABASE_URL
export PGDATABASE="$RESTORE_DATABASE_URL"
pg_restore --single-transaction --exit-on-error --no-owner --no-acl --dbname="" "$1"
printf 'Restauração de ensaio concluída. Compare contagens e valide os fluxos em homologação.\n'
