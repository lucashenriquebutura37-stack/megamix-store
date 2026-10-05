const names=new Set(['Error','TypeError','RangeError','SyntaxError','AbortError','TimeoutError']);
const codes=new Set(['23505','23503','23514','22P02','28P01','42P01','53300','57P01','ECONNREFUSED','ETIMEDOUT','ECONNRESET','ENOTFOUND','EAUTH','ESOCKET','ECONNECTION','ETLS','EDNS','EREQUEST','EENVELOPE','EMESSAGE']);
function sanitizeError(error){
  const name=names.has(error?.name)?error.name:'Error';
  const code=codes.has(error?.code)?error.code:'UNKNOWN';
  const status=Number(error?.status||error?.statusCode);
  return `${name} code=${code}${Number.isInteger(status)&&status>=400&&status<=599?' status='+status:''}`;
}
module.exports={sanitizeError};
