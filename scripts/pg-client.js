// Pass connection credentials through libpq environment variables, never argv.
const {spawnSync}=require('node:child_process');
function connectionEnv(value,base=process.env){
  const url=new URL(value);
  if(!['postgres:','postgresql:'].includes(url.protocol)||!url.hostname||!url.pathname.slice(1))throw new Error();
  const env={...base,PGHOST:url.hostname.replace(/^\[|\]$/g,''),PGPORT:url.port||'5432',PGDATABASE:decodeURIComponent(url.pathname.slice(1)),PGUSER:decodeURIComponent(url.username),PGPASSWORD:decodeURIComponent(url.password)};
  const options={sslmode:'PGSSLMODE',sslrootcert:'PGSSLROOTCERT',sslcert:'PGSSLCERT',sslkey:'PGSSLKEY',sslpassword:'PGSSLPASSWORD',connect_timeout:'PGCONNECT_TIMEOUT',application_name:'PGAPPNAME',channel_binding:'PGCHANNELBINDING',gssencmode:'PGGSSENCMODE',target_session_attrs:'PGTARGETSESSIONATTRS',options:'PGOPTIONS'};
  for(const [key,value] of url.searchParams){if(!options[key])throw new Error();env[options[key]]=value;}
  delete env.DATABASE_URL;delete env.RESTORE_DATABASE_URL;delete env.TEST_DATABASE_URL;
  delete env.PGHOSTADDR;delete env.PGSERVICE;delete env.PGSERVICEFILE;
  return env;
}
if(require.main===module){
  try{
    const [command,...args]=process.argv.slice(2);
    if(!['psql','pg_dump','pg_restore'].includes(command))throw new Error();
    const result=spawnSync(command,args,{env:connectionEnv(process.env.PGDATABASE),stdio:'inherit'});
    if(result.error){console.error('Cliente PostgreSQL indisponível.');process.exitCode=1;}
    else process.exitCode=result.status??1;
  }catch{console.error('Configuração PostgreSQL inválida; operação cancelada.');process.exitCode=2;}
}
module.exports={connectionEnv};
