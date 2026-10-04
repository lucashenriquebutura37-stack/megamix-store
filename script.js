const products=[];
let cart=[];
localStorage.removeItem("cart");
const money=v=>v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
function categories(){let cs=["Todos",...new Set(products.map(x=>x.c))];document.getElementById("categories").innerHTML=cs.map(c=>`<button class="cat" onclick="selected='${c==='Todos'?'':c}';render()">${c}</button>`).join("")}
function render(){
  const grid=document.getElementById("grid");

  if(products.length===0){
    grid.innerHTML=`
      <div style="text-align:center;padding:50px 20px;width:100%;">
        <div style="font-size:60px;margin-bottom:15px;">🛍️</div>
        <h2 style="margin-bottom:10px;">Produtos em breve</h2>
        <p style="font-size:18px;color:#666;">
          Estamos preparando novidades para a VORZELI.<br>
          Volte em breve!
        </p>
      </div>
    `;
    return;
  }

  let q=document.getElementById("search").value.toLowerCase(),
      s=document.getElementById("sort").value;

  let a=products.filter(x=>
    (!selected||x.c===selected)&&
    x.n.toLowerCase().includes(q)
  );

  if(s==="low") a.sort((x,y)=>x.p-y.p);
  if(s==="high") a.sort((x,y)=>y.p-x.p);

  grid.innerHTML=a.map(x=>`
    <article class="card">
      <div class="pic">${x.i}</div>
      <div class="info">
        <span class="badge">${x.c.toUpperCase()}</span>
        <h3>${x.n}</h3>
        <div class="price">${money(x.p)}</div>
        <div class="install">em até 10x no cartão</div>
        <button class="add" onclick="add(${x.id})">
          Adicionar ao carrinho
        </button>
      </div>
    </article>
  `).join("")||"<p>Nenhum produto encontrado.</p>";
}
function add(id){let x=cart.find(i=>i.id===id);x?x.q++:cart.push({id,q:1});save();openCart()}
function save(){localStorage.setItem("cart",JSON.stringify(cart));updateCart()}
function updateCart(){document.getElementById("count").textContent=cart.reduce((a,x)=>a+x.q,0);document.getElementById("items").innerHTML=cart.map(x=>{let p=products.find(p=>p.id===x.id);return `<div class="cartItem"><div class="ciIcon">${p.i}</div><div style="flex:1"><b>${p.n}</b><div>${money(p.p)}</div><div class="qty"><button onclick="change(${x.id},-1)">−</button> ${x.q} <button onclick="change(${x.id},1)">+</button></div></div></div>`}).join("")||"<p>Seu carrinho está vazio.</p>";document.getElementById("total").textContent=money(cart.reduce((a,x)=>a+products.find(p=>p.id===x.id).p*x.q,0))}
function change(id,d){let x=cart.find(i=>i.id===id);x.q+=d;if(x.q<=0)cart=cart.filter(i=>i.id!==id);save()}
function toggleCart(){document.getElementById("cart").classList.toggle("open");document.getElementById("overlay").classList.toggle("show")}
function openCart(){document.getElementById("cart").classList.add("open");document.getElementById("overlay").classList.add("show")}
async function checkout(){
  if(!cart.length) return alert("Adicione produtos ao carrinho.");

  const total = cart.reduce((a,x)=>{
    const p = products.find(p=>p.id===x.id);
    return a + p.p * x.q;
  },0);

  const quantidade = cart.reduce((a,x)=>a+x.q,0);

  try {
    const response = await fetch("/api/criar-preferencia",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        titulo:"Pedido VORZELI",
        preco:Number(total.toFixed(2)),
        quantidade:1
      })
    });

    const data = await response.json();

    if(!response.ok){
      console.error(data);
      return alert("Não foi possível iniciar o pagamento.");
    }

    const url = data.sandbox_url || data.checkout_url;

    if(!url){
      return alert("Link de pagamento não recebido.");
    }

    window.location.href = url;

  } catch(error) {
    console.error(error);
    alert("Erro ao conectar com o Mercado Pago.");
  }
}
document.getElementById("search").addEventListener("input",render);categories();render();updateCart();
