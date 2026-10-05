const base='https://vorzeli.com.br';
async function check(path){
  const url=base+path;let last;
  for(let attempt=0;attempt<3;attempt++){
    try{
      const response=await fetch(url,{signal:AbortSignal.timeout(20000),redirect:'error'});
      if(!response.ok)throw new Error('HTTP '+response.status);
      const body=await response.json();
      if(path==='/healthz'&&body.status!=='ok')throw new Error('Unexpected health status');
      if(path==='/api/status'&&!['ok','warning'].includes(body.status))throw new Error('Readiness degraded');
      console.log(path+': OK');return;
    }catch(error){last=error;if(attempt<2)await new Promise(resolve=>setTimeout(resolve,5000));}
  }
  throw new Error(path+': '+last.message);
}
if(require.main===module)Promise.all(['/healthz','/api/status'].map(check)).catch(error=>{console.error(error.message);process.exitCode=1});
module.exports={check};
