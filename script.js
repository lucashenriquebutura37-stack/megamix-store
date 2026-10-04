const products=[
{id:1,n:"Smartphone Pro Max 256GB",c:"Celulares",p:2899.90,i:"📱"},
{id:2,n:"Fone Bluetooth Premium",c:"Eletrônicos",p:149.90,i:"🎧"},
{id:3,n:"Notebook Ultra 15\"",c:"Informática",p:3499.90,i:"💻"},
{id:4,n:"Teclado Mecânico RGB",c:"Informática",p:219.90,i:"⌨️"},
{id:5,n:"Smart TV 50\" 4K",c:"TV e Áudio",p:2199.90,i:"📺"},
{id:6,n:"Controle sem fio para Games",c:"Games",p:179.90,i:"🎮"},
{id:7,n:"Kit Ferramentas 129 peças",c:"Ferramentas",p:299.90,i:"🧰"},
{id:8,n:"Aspirador Robô Smart",c:"Casa",p:899.90,i:"🤖"},
{id:9,n:"Caixa de Som Bluetooth",c:"Eletrônicos",p:249.90,i:"🔊"},
{id:10,n:"Câmera de Segurança Wi-Fi",c:"Casa",p:189.90,i:"📷"},
{id:11,n:"Mouse Gamer RGB",c:"Informática",p:119.90,i:"🖱️"},
{id:12,n:"Mochila para Notebook",c:"Acessórios",p:139.90,i:"🎒"}
];
let cart=JSON.parse(localStorage.getItem("cart")||"[]"), selected="";
const money=v=>v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
function categories(){let cs=["Todos",...new Set(products.map(x=>x.c))];document.getElementById("categories").innerHTML=cs.map(c=>`<button class="cat" onclick="selected='${c==='Todos'?'':c}';render()">${c}</button>`).join("")}
function render(){let q=document.getElementById("search").value.toLowerCase(), s=document.getElementById("sort").value;let a=products.filter(x=>(!selected||x.c===selected)&&x.n.toLowerCase().includes(q));if(s==="low")a.sort((x,y)=>x.p-y.p);if(s==="high")a.sort((x,y)=>y.p-x.p);document.getElementById("grid").innerHTML=a.map(x=>`<article class="card"><div class="pic">${x.i}</div><div class="info"><span class="badge">${x.c.toUpperCase()}</span><h3>${x.n}</h3><div class="price">${money(x.p)}</div><div class="install">em até 10x no cartão</div><button class="add" onclick="add(${x.id})">Adicionar ao carrinho</button></div></article>`).join("")||"<p>Nenhum produto encontrado.</p>"}
function add(id){let x=cart.find(i=>i.id===id);x?x.q++:cart.push({id,q:1});save();openCart()}
function save(){localStorage.setItem("cart",JSON.stringify(cart));updateCart()}
function updateCart(){document.getElementById("count").textContent=cart.reduce((a,x)=>a+x.q,0);document.getElementById("items").innerHTML=cart.map(x=>{let p=products.find(p=>p.id===x.id);return `<div class="cartItem"><div class="ciIcon">${p.i}</div><div style="flex:1"><b>${p.n}</b><div>${money(p.p)}</div><div class="qty"><button onclick="change(${x.id},-1)">−</button> ${x.q} <button onclick="change(${x.id},1)">+</button></div></div></div>`}).join("")||"<p>Seu carrinho está vazio.</p>";document.getElementById("total").textContent=money(cart.reduce((a,x)=>a+products.find(p=>p.id===x.id).p*x.q,0))}
function change(id,d){let x=cart.find(i=>i.id===id);x.q+=d;if(x.q<=0)cart=cart.filter(i=>i.id!==id);save()}
function toggleCart(){document.getElementById("cart").classList.toggle("open");document.getElementById("overlay").classList.toggle("show")}
function openCart(){document.getElementById("cart").classList.add("open");document.getElementById("overlay").classList.add("show")}
function checkout(){if(!cart.length)return alert("Adicione produtos ao carrinho.");let msg="Olá! Quero fazer um pedido na MegaMix Store:%0A%0A"+cart.map(x=>{let p=products.find(p=>p.id===x.id);return `${x.q}x ${p.n} - ${money(p.p*x.q)}`}).join("%0A");msg+="%0A%0ATotal: "+money(cart.reduce((a,x)=>a+products.find(p=>p.id===x.id).p*x.q,0));window.open("https://wa.me/?text="+encodeURIComponent(decodeURIComponent(msg)),"_blank")}
document.getElementById("search").addEventListener("input",render);categories();render();updateCart();