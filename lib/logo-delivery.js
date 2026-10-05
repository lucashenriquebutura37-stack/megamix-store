function createLogoHandler(imagePath){
  const cache=new Map();
  return async(req,res,next)=>{
    const width=Number(req.query.w);
    if(![360,720].includes(width))return next();
    const webp=String(req.headers.accept||'').includes('image/webp');
    const key=width+':'+webp;
    try{
      const sharp=require('sharp');
      if(!cache.has(key)){
        const image=sharp(imagePath).resize({width,withoutEnlargement:true});
        cache.set(key,(webp?image.webp({lossless:true}):image.png({compressionLevel:9})).toBuffer());
      }
      const body=await cache.get(key);
      res.vary('Accept');
      res.set('Cache-Control','public, max-age=604800');
      res.type(webp?'image/webp':'image/png').send(body);
    }catch{
      cache.delete(key);
      // Keep the original asset available if the optimization fails.
      next();
    }
  };
}
module.exports={createLogoHandler};
