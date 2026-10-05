function imagePrivacyAttributes(value){
  try{
    const url=new URL(value);
    return url.protocol==='https:'&&url.hostname==='acdn-us.mitiendanube.com'?' crossorigin="anonymous"':'';
  }catch{return '';}
}
module.exports={imagePrivacyAttributes};
