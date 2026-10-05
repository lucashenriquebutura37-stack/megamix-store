const compression=require('compression');
module.exports=compression({
  threshold:1024,
  filter:(req,res)=>!req.path.startsWith('/api/admin')&&compression.filter(req,res)
});
