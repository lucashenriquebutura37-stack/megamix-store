#!/usr/bin/env bash
set -euo pipefail
: "${DATABASE_URL:?Configure DATABASE_URL de produção para comparação}"
: "${RESTORE_DATABASE_URL:?Configure um banco isolado e vazio}"
if [ "$DATABASE_URL" = "$RESTORE_DATABASE_URL" ]; then echo 'Destino deve ser diferente de produção.' >&2; exit 2; fi
if [ "$#" -ne 1 ] || [ ! -f "$1" ]; then echo 'Informe um backup existente.' >&2; exit 2; fi
# Compare the database address independently of credentials and URL options.
node - <<'NODE'
function target(value){
  const url=new URL(value);
  if(!['postgres:','postgresql:'].includes(url.protocol)||!url.hostname||!url.pathname.slice(1))throw new Error();
  if(['host','hostaddr','port','dbname','service','servicefile'].some(key=>url.searchParams.has(key)))throw new Error();
  return JSON.stringify([url.hostname.toLowerCase(),url.port||'5432',decodeURIComponent(url.pathname)]);
}
try{
  if(target(process.env.DATABASE_URL)===target(process.env.RESTORE_DATABASE_URL)){
    console.error('Destino aponta para o mesmo banco de produção.');process.exit(2);
  }
}catch{console.error('URLs de banco inválidas; restauração cancelada.');process.exit(2);}
NODE
unset DATABASE_URL
export PGDATABASE="$RESTORE_DATABASE_URL"
export PGCONNECT_TIMEOUT=15
client="$(dirname "$0")/pg-client.js"
# Fail closed before any restore if the destination is not an empty database.
objects=$(node "$client" psql -X -A -t -v ON_ERROR_STOP=1 -c "SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname NOT LIKE 'pg_%' AND n.nspname <> 'information_schema';")
if [ "$objects" != '0' ]; then echo 'Destino não está vazio; restauração cancelada.' >&2; exit 2; fi
node "$client" pg_restore --list "$1" >/dev/null
node "$client" pg_restore --single-transaction --exit-on-error --no-owner --no-acl --dbname="" "$1"
printf 'Restauração de ensaio concluída. Compare contagens e valide os fluxos em homologação.\n'
