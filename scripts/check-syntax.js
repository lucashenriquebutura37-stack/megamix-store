const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
for(const directory of ['.','lib','scripts']){
  for(const name of fs.readdirSync(directory).filter(x=>x.endsWith('.js'))){
    const filename=path.join(directory,name);new vm.Script(fs.readFileSync(filename,'utf8'),{filename});
  }
}
console.log('Sintaxe dos scripts do servidor, páginas e ferramentas: OK');
