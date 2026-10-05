#!/usr/bin/env bash
set -euo pipefail
umask 077
: "${DATABASE_URL:?Configure DATABASE_URL no ambiente protegido}"
if [ "$#" -ne 1 ]; then echo 'Uso: scripts/backup.sh /caminho/backup.dump' >&2; exit 2; fi
if [ -e "$1" ]; then echo 'Arquivo já existe; escolha outro destino.' >&2; exit 2; fi
export PGDATABASE="$DATABASE_URL"
pg_dump --format=custom --no-owner --no-acl --file="$1"
pg_restore --list "$1" >/dev/null
printf 'Backup gerado e catálogo validado. Faça a restauração de ensaio antes de considerar recuperável.\n'
