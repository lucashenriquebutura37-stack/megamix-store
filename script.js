/* =========================================================
   VORZELI - SCRIPT PRINCIPAL
========================================================= */

let products = [];


/* =========================
   ÁREAS DA VORZELI
========================= */

const areas = [

  {
    name: "Acessórios para Celular",
    icon: "📱",
    desc: "Capinhas, películas, cabos e mais",
    subs: [
      ["Capinhas", "📱"],
      ["Películas", "🛡️"],
      ["Cabos", "🔌"],
      ["Carregadores", "⚡"],
      ["Fones", "🎧"],
      ["Power Banks", "🔋"],
      ["Suportes", "📱"],
      ["Adaptadores", "🔄"]
    ]
  },

  {
    name: "Smartwatches e Acessórios",
    icon: "⌚",
    desc: "Relógios inteligentes e acessórios",
    subs: [
      ["Smartwatches", "⌚"],
      ["Smartbands", "⌚"],
      ["Pulseiras", "🎨"],
      ["Películas", "🛡️"],
      ["Protetores", "🛡️"],
      ["Cabos", "🔌"],
      ["Carregadores", "⚡"],
      ["Bases", "🔋"]
    ]
  },

  {
    name: "Copos e Térmicos",
    icon: "🥤",
    desc: "Copos, canecas e térmicos",
    subs: [
      ["Copo térmico inox", "🥤"],
      ["Copo térmico com tampa", "🥤"],
      ["Copo com canudo", "🥤"],
      ["Personalizados", "✨"],
      ["Canecas", "☕"],
      ["Garrafas térmicas", "🧴"],
      ["Copo térmico com mix", "🥤"],
["Caixa térmica", "🧊"],
["Garrafas e Squeezes", "💧"],
      ["Acessórios", "➕"]
    ]
  },

  {
    name: "Informática e Acessórios",
    icon: "💻",
    desc: "Periféricos, cabos e acessórios",
    subs: [
      ["Mouse", "🖱️"],
      ["Teclados", "⌨️"],
      ["Mouse Pads", "🖱️"],
      ["Hub USB", "🔌"],
      ["Cabos HDMI", "📺"],
      ["Adaptadores", "🔄"],
      ["Leitores de cartão", "💾"],
      ["Suportes", "💻"]
    ]
  },

  {
    name: "Componentes Eletrônicos",
    icon: "⚡",
    desc: "Peças e componentes",
    subs: [
      ["Capacitores", "🔋"],
      ["Resistores", "〰️"],
      ["LEDs", "💡"],
      ["Fusíveis", "⚡"],
      ["Conectores", "🔌"],
      ["Fontes", "🔋"],
      ["Módulos", "🧩"],
      ["Cabos", "🔗"]
    ]
  },

  {
    name: "Ferramentas",
    icon: "🔧",
    desc: "Ferramentas e bancada",
    subs: [
      ["Chaves", "🪛"],
      ["Alicates", "🔧"],
      ["Bits", "⚙️"],
      ["Trenas", "📏"],
      ["Estiletes", "✂️"],
      ["Pinças", "🛠️"],
      ["Ferro de solda", "🔥"],
      ["Sugador", "🧰"],
      ["Multímetros", "📟"]
    ]
  },

  {
    name: "Casa e Utilidades",
    icon: "🏠",
    desc: "Utilidades para o dia a dia",
    subs: [
      ["Organizadores", "🗃️"],
      ["Cozinha", "🍳"],
      ["Banheiro", "🚿"],
      ["Ganchos", "🪝"],
      ["Acessórios para Air Fryer", "🍟"],
      ["Utilidades domésticas", "🏠"]
    ]
  },

  {
    name: "Brinquedos",
    icon: "🧸",
    desc: "Diversão e educativos",
    subs: [
      ["Educativos", "🎓"],
      ["Blocos de montar", "🧱"],
      ["Carrinhos", "🚗"],
      ["Quebra-cabeças", "🧩"],
      ["Jogos de memória", "🎴"],
      ["Kits de desenho", "🎨"],
      ["Sensoriais", "🌈"],
      ["Interativos", "🎮"]
    ]
  },

  {
    name: "Acessórios Automotivos",
    icon: "🚗",
    desc: "Acessórios para carros e motos",
    subs: [
      ["Suportes", "📱"],
      ["Carregadores veiculares", "⚡"],
      ["Cabos", "🔌"],
      ["Adaptadores", "🔄"],
      ["Organizadores", "🗃️"],
      ["Microfibra", "🧽"],
      ["Limpeza", "✨"],
      ["Acessórios", "🚗"]
    ]
  },

  {
    name: "Games e Acessórios",
    icon: "🎮",
    desc: "Acessórios gamer e mobile",
    subs: [
      ["Mouse gamer", "🖱️"],
      ["Mouse Pads", "🖥️"],
      ["Suportes para headset", "🎧"],
      ["Cabos para controles", "🔌"],
      ["Capas para controles", "🎮"],
      ["Grips", "🕹️"],
      ["Suportes para controles", "🎮"],
      ["Jogos mobile", "📱"]
    ]
  },

  {
    name: "Áudio e Acessórios",
    icon: "🎧",
    desc: "Fones, cabos e microfones",
    subs: [
      ["Fones Bluetooth", "🎧"],
      ["Fones com fio", "🎵"],
      ["Cabos P2", "🔌"],
      ["Adaptadores de áudio", "🔄"],
      ["Cabos auxiliares", "🔗"],
      ["Microfones", "🎙️"],
      ["Suportes para fones", "🎧"]
    ]
  },

  {
    name: "Iluminação",
    icon: "💡",
    desc: "LED e iluminação",
    subs: [
      ["Fitas LED", "🌈"],
      ["Lâmpadas LED", "💡"],
      ["Luminárias USB", "🔦"],
      ["Luzes noturnas", "🌙"],
      ["Luminárias de mesa", "💡"],
      ["Sensores", "📡"],
      ["Soquetes", "🔌"],
      ["Adaptadores", "🔄"]
    ]
  },

  {
    name: "Pet e Acessórios",
    icon: "🐶",
    desc: "Produtos e acessórios para pets",
    subs: [
      ["Brinquedos", "🦴"],
      ["Comedouros", "🥣"],
      ["Bebedouros", "💧"],
      ["Escovas", "🪮"],
      ["Coleiras", "🐕"],
      ["Guias", "🦮"],
      ["Higiene", "🧼"],
      ["Acessórios", "🐾"]
    ]
  },

  {
    name: "Audiologia — Acessórios e Componentes",
    icon: "🦻",
    desc: "Acessórios e componentes",
    special: true,
    subs: [
      ["Audiômetro", "🎧"],
      ["Imitanciômetro", "🦻"],
      ["BERA / PEATE", "📈"],
      ["Vecto / VENG", "👁️"]
    ]
  },

  {
    name: "Medicina — Acessórios e Componentes",
    icon: "🩺",
    desc: "Acessórios e componentes",
    special: true,
    subs: [
      ["ECG", "❤️"],
      ["EEG", "🧠"],
      ["Espirometria", "🫁"]
    ]
  }

];


/* =========================
   AUDIOLOGIA / MEDICINA
========================= */

const specializedSubs = {

  "Audiômetro": [
    ["Fones", "🎧"],
    ["Cabos", "🔌"],
    ["Vibrador ósseo", "🦴"],
    ["Botão de resposta", "🔘"],
    ["Conectores", "🔗"]
  ],

  "Imitanciômetro": [
    ["Sondas", "🔎"],
    ["Olivas", "🦻"],
    ["Tubos", "〰️"],
    ["Cabos", "🔌"],
    ["Conectores", "🔗"]
  ],

  "BERA / PEATE": [
    ["Eletrodos", "⚪"],
    ["Cabos", "🔌"],
    ["Conectores", "🔗"],
    ["Consumíveis", "📦"]
  ],

  "Vecto / VENG": [
    ["Cabos", "🔌"],
    ["Eletrodos", "⚪"],
    ["Acessórios", "➕"],
    ["Componentes", "🧩"]
  ],

  "ECG": [
    ["Cabo de paciente", "🔌"],
    ["Cabos de comunicação/dados", "🔗"],
    ["Eletrodos", "⚪"],
    ["Peras", "🩺"],
    ["Pinças", "🛠️"],
    ["Conectores/adaptadores", "🔄"]
  ],

  "EEG": [
    ["Eletrodos", "⚪"],
    ["Cabos", "🔌"],
    ["Toucas compatíveis", "🧢"],
    ["Conectores", "🔗"],
    ["Acessórios", "➕"]
  ],

  "Espirometria": [
    ["Bocais", "🫁"],
    ["Filtros", "🔘"],
    ["Mangueiras", "〰️"],
    ["Clips nasais", "👃"],
    ["Adaptadores", "🔄"],
    ["Acessórios compatíveis", "➕"]
  ]

};


/* =========================
   VARIÁVEIS
========================= */

let selected = "";
let selectedSub = "";
let selectedDetail = "";


/* =========================
   CARRINHO
========================= */

let cart = [];
let favorites = new Set();
let appliedCoupon=null;
try { favorites = new Set(JSON.parse(localStorage.getItem("vorzeli_favorites") || "[]").map(Number)); } catch { favorites = new Set(); }
try {
  const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
  cart = Array.isArray(savedCart) ? savedCart : [];
} catch {
  cart = [];
}


/* =========================
   DINHEIRO
========================= */

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}

function safeImageUrl(value) {
  const url = String(value || "").trim();
  if (!url) return "";
  if (url.startsWith("/") || /^https:\/\//i.test(url) || /^[\w./-]+\.(png|jpe?g|webp|svg)$/i.test(url)) return url;
  return "";
}

const money = value =>
  Number(value).toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL"
    }
  );


/* =========================
   MOSTRAR / ESCONDER PRODUTOS
========================= */

function hideProductArea() {

  const productArea =
    document.getElementById("productArea");

  if (productArea) {
    productArea.style.display = "none";
  }
}


function showProductArea() {

  const productArea =
    document.getElementById("productArea");

  if (productArea) {
    productArea.style.display = "block";
  }
}


/* =========================
   ÁREAS DA PÁGINA INICIAL
========================= */

function renderAreas() {

  const areaGrid =
    document.getElementById("areaGrid");

  if (!areaGrid) return;

  areaGrid.innerHTML =
    areas
      .filter(area => !area.special)
      .map(area => `

        <button
          class="areaCard"
          data-onclick='openArea(${JSON.stringify(area.name)})'>

          <div class="areaIcon">
            ${vorzeliAreaIconHTML(area)}
          </div>

          <h3>${area.name}</h3>

          <p>${area.desc}</p>

        </button>

      `)
      .join("");
}


/* =========================
   MENU LATERAL
========================= */

function renderMenu() {

  const container =
    document.getElementById("menuCategories");

  if (!container) return;

  const q =
    (
      document.getElementById("menuSearch")
        ?.value || ""
    ).toLowerCase();

  const normal =
    areas.filter(area =>
      !area.special &&
      area.name.toLowerCase().includes(q)
    );

  const special =
    areas.filter(area =>
      area.special &&
      area.name.toLowerCase().includes(q)
    );

  container.innerHTML =

    normal
      .map(menuButton)
      .join("")

    +

    (
      special.length
        ? `
          <div class="menuDivider">
            ÁREAS ESPECIALIZADAS
          </div>
        `
        : ""
    )

    +

    special
      .map(menuButton)
      .join("");
}


function menuButton(area) {

  return `

    <button
      class="menuItem"
      data-onclick='openArea(${JSON.stringify(area.name)})'>

      <span class="menuGraphic">${vorzeliAreaIconHTML(area)}</span>

      <b>${area.name}</b>

      <span>›</span>

    </button>

  `;
}


/* =========================
   ABRIR / FECHAR MENU
========================= */

function toggleMenu() {

  document
    .getElementById("sideMenu")
    ?.classList
    .toggle("open");

  document
    .getElementById("menuOverlay")
    ?.classList
    .toggle("show");
}


/* =========================
   ÍCONES GRÁFICOS VORZELI
========================= */

function vorzeliIconPath(group, name) {
  const map = window.VORZELI_ICON_MAP || {};

  // Formato principal: MAP[grupo][item] = "icons/arquivo.svg"
  if (group && map[group] && typeof map[group] === "object" && map[group][name]) {
    return map[group][name];
  }

  // Compatibilidade com os grupos especializados (Audiômetro, ECG etc.).
  if (selectedSub && map[selectedSub] && typeof map[selectedSub] === "object" && map[selectedSub][name]) {
    return map[selectedSub][name];
  }

  // Procura segura pelo mesmo nome em qualquer grupo do mapa.
  for (const value of Object.values(map)) {
    if (value && typeof value === "object" && value[name]) {
      return value[name];
    }
  }

  return "";
}

function vorzeliIconHTML(group, name, fallback = "") {
  const src = vorzeliIconPath(group, name);

  if (src) {
    return `<img class="vorzeliIcon" src="${src}" alt="" loading="lazy" decoding="async">`;
  }

  return fallback;
}

function vorzeliAreaIconHTML(area) {
  const map = window.VORZELI_ICON_MAP || {};
  const group = map[area.name];

  if (group && typeof group === "object") {
    const first = Object.values(group).find(value => typeof value === "string");
    if (first) {
      return `<img class="vorzeliGraphicIcon" src="${first}" alt="" loading="lazy" decoding="async">`;
    }
  }

  return area.icon;
}

/* =========================
   CARD DE SUBCATEGORIA
========================= */

function subButton(
  name,
  icon
) {

  return `

    <button
      class="subcat"
      data-onclick='selectSub(${JSON.stringify(name)},this)'>

      <span class="subcatIcon">
        ${vorzeliIconHTML(selected, name, icon)}
      </span>

      <span>
        ${name}
      </span>

    </button>

  `;
}


/* =========================
   CARD DO TERCEIRO NÍVEL
========================= */

function detailButton(
  name,
  icon
) {

  return `

    <button
      class="subcat"
      data-onclick='selectDetail(${JSON.stringify(name)},this)'>

      <span class="subcatIcon">
        ${vorzeliIconHTML(selectedSub || selected, name, icon)}
      </span>

      <span>
        ${name}
      </span>

    </button>

  `;
}


/* =========================
   ABRIR ÁREA
========================= */

function openArea(name) {

  const area =
    areas.find(
      item => item.name === name
    );

  if (!area) return;

  selected = name;
  selectedSub = "";
  selectedDetail = "";

  hideProductArea();

  const sort =
    document.getElementById("sort");

  if (sort) {
    sort.value = "";
  }

  const areaTitle =
    document.getElementById("areaTitle");

  if (areaTitle) {
    areaTitle.textContent = area.name;
  }

  const productTitle =
    document.getElementById("productTitle");

  if (productTitle) {
    productTitle.textContent = "Produtos";
  }

  const subcategories =
    document.getElementById("subcategories");

  if (subcategories) {

    subcategories.innerHTML =
      area.subs
        .map(([name, icon]) =>
          subButton(name, icon)
        )
        .join("");
  }

  const grid =
    document.getElementById("grid");

  if (grid) {
    grid.innerHTML = "";
  }

  document
    .getElementById("areaModal")
    ?.classList
    .add("open");

  document.body.style.overflow =
    "hidden";

  document
    .getElementById("sideMenu")
    ?.classList
    .remove("open");

  document
    .getElementById("menuOverlay")
    ?.classList
    .remove("show");
}


/* =========================
   FECHAR ÁREA
========================= */

function closeArea() {

  document
    .getElementById("areaModal")
    ?.classList
    .remove("open");

  document.body.style.overflow = "";

  selected = "";
  selectedSub = "";
  selectedDetail = "";

  hideProductArea();
}


/* =========================
   SELECIONAR SUBCATEGORIA
========================= */

function selectSub(
  sub,
  button
) {

  selectedSub = sub;
  selectedDetail = "";

  document
    .querySelectorAll(".subcat")
    .forEach(item =>
      item.classList.remove("active")
    );

  button
    ?.classList
    .add("active");


  /* AUDIOLOGIA E MEDICINA */

  if (specializedSubs[sub]) {

    hideProductArea();

    const subcategories =
      document.getElementById(
        "subcategories"
      );

    if (subcategories) {

      subcategories.innerHTML =

        `

        <button
          class="subcat"
          data-onclick='openArea(${JSON.stringify(selected)})'>

          <span class="subcatIcon">
            ←
          </span>

          <span>
            Voltar
          </span>

        </button>

        `

        +

        specializedSubs[sub]
          .map(([name, icon]) =>
            detailButton(name, icon)
          )
          .join("");
    }

    return;
  }


  const productTitle =
    document.getElementById(
      "productTitle"
    );

  if (productTitle) {
    productTitle.textContent = sub;
  }

  showProductArea();

  render();
}


/* =========================
   SELECIONAR DETALHE
========================= */

function selectDetail(
  detail,
  button
) {

  selectedDetail = detail;

  document
    .querySelectorAll(".subcat")
    .forEach(item =>
      item.classList.remove("active")
    );

  button
    ?.classList
    .add("active");

  const productTitle =
    document.getElementById(
      "productTitle"
    );

  if (productTitle) {
    productTitle.textContent = detail;
  }

  showProductArea();

  render();
}


/* =========================
   MOSTRAR PRODUTOS
========================= */

function clearCatalogFilters(){
  for(const id of ["filterMin","filterMax","filterBrand"]){const el=document.getElementById(id);if(el)el.value="";}
  for(const id of ["filterStock","filterOffers"]){const el=document.getElementById(id);if(el)el.checked=false;}
  render();
}
function matchesCatalogFilters(product,filters){
  const price=Number(product.p);
  return (filters.min===""||price>=Number(filters.min))&&
    (filters.max===""||price<=Number(filters.max))&&
    (!filters.brand||String(product.brand||"").toLowerCase().includes(filters.brand.toLowerCase()))&&
    (!filters.stock||Number(product.stock)>0)&&
    (!filters.offers||Number(product.oldPrice)>price);
}
function render() {

  const grid =
    document.getElementById("grid");

  if (!grid) return;

  /*
    Dentro de uma categoria, não mostramos
    produtos até o cliente escolher uma opção.
  */

  if (selected && !selectedSub) {
    hideProductArea();
    return;
  }

  /*
    Audiologia e Medicina possuem
    um terceiro nível.
  */

  if (
    selectedSub &&
    specializedSubs[selectedSub] &&
    !selectedDetail
  ) {
    hideProductArea();
    return;
  }

  const q =
    (
      document
        .getElementById("search")
        ?.value || ""
    ).toLowerCase();

  const sort =
    document
      .getElementById("sort")
      ?.value || "";

  let filtered =
    products.filter(product => {

      const categoryOK =
        !selected ||
        product.c === selected;

      const subcategoryOK =
        !selectedSub ||
        product.sub === selectedSub;

      const detailOK =
        !selectedDetail ||
        product.detail === selectedDetail;

      const searchOK =
        !q ||
        [product.n,product.sku,product.brand,...(product.tags||[])]
          .join(" ").toLowerCase()
          .includes(q);

      return (
        categoryOK &&
        subcategoryOK &&
        detailOK &&
        searchOK && matchesCatalogFilters(product,{
          min:document.getElementById("filterMin")?.value||"",
          max:document.getElementById("filterMax")?.value||"",
          brand:document.getElementById("filterBrand")?.value.trim()||"",
          stock:document.getElementById("filterStock")?.checked,
          offers:document.getElementById("filterOffers")?.checked
        })
      );
    });


  if (sort === "low") {

    filtered.sort(
      (a, b) => a.p - b.p
    );
  }


  if (sort === "high") filtered.sort((a,b)=>b.p-a.p);
  if (sort === "rating") filtered.sort((a,b)=>Number(b.rating||0)-Number(a.rating||0));
  if (sort === "new") filtered.sort((a,b)=>Number(b.id||0)-Number(a.id||0));


  if (!filtered.length) {

    const label =
      selectedDetail ||
      selectedSub ||
      selected ||
      "VORZELI";

    grid.innerHTML = `

      <div class="noProducts">

        <div class="icon">
          🛍️
        </div>

        <h2>
          Produtos em breve
        </h2>

        <p>
          Estamos preparando produtos para
          <b>${escapeHTML(label)}</b>.
          <br>
          Em breve você encontrará novidades aqui.
        </p>

      </div>

    `;

    return;
  }


  grid.innerHTML =
    filtered
      .map(product => {

        const oldPrice = Number(product.oldPrice || product.old || 0);
        const discount =
          oldPrice > Number(product.p)
            ? Math.round((1 - Number(product.p) / oldPrice) * 100)
            : Number(product.discount || 0);

        const rating = Number(product.rating || 0);
        const reviews = Number(product.reviews || 0);
        const installments = Number(product.installments || 10);
        const installmentValue = Number(product.p) / installments;
        const shipping = product.shipping || product.frete || "";
        const safeImg = safeImageUrl(product.i);
        const imageContent = safeImg
          ? `<img src="${escapeHTML(safeImg)}" alt="${escapeHTML(product.n)}" loading="lazy" decoding="async">`
          : '<span class="productFallback">V</span>';

        return `

        <article class="card">

          <div class="pic">
            ${discount > 0 ? `<span class="discountPill">-${discount}%</span>` : ""}
            ${imageContent}
          </div>

          <div class="info">

            <span class="badge">
              ${escapeHTML(product.c).toUpperCase()}
            </span>

            <h3>${escapeHTML(product.n)}</h3><button type="button" class="productDetailsButton" data-onclick="openProductDetails(${Number(product.id)})">Ver detalhes</button>

            ${rating > 0 ? `
              <div class="ratingRow" aria-label="Avaliação ${rating} de 5">
                <span class="ratingStar">★</span>
                <b>${rating.toFixed(1)}</b>
                ${reviews ? `<small>(${reviews})</small>` : ""}
              </div>
            ` : ""}

            <div class="priceBlock">
              ${oldPrice > Number(product.p) ? `
                <div class="oldPrice">${money(oldPrice)}</div>
              ` : ""}

              <div class="price">${money(product.p)}</div>

              <div class="install">
                ${installments}x de ${money(installmentValue)}
              </div>
            </div>

            ${shipping ? `
              <div class="shippingInfo">
                <span>✓</span> ${escapeHTML(shipping)}
              </div>
            ` : ""}

            <button
              class="add"
              data-onclick="add(${product.id})">

              <span>Adicionar ao carrinho</span>
              <span class="addArrow">→</span>

            </button>

          </div>

        </article>

      `;
      })
      .join("");
}


/* =========================
   PÁGINA INICIAL
========================= */

function railCard(product) {
  const safeImg = safeImageUrl(product.i);
  const image = safeImg
    ? '<img src="'+escapeHTML(safeImg)+'" alt="'+escapeHTML(product.n)+'" loading="lazy" decoding="async">'
    : '<span class="productFallback">V</span>';
  const stock = Number(product.stock || 0);
  return '<article class="card"><div class="pic">'+image+'</div><div class="info"><span class="badge">'+escapeHTML(product.c).toUpperCase()+'</span><h3>'+escapeHTML(product.n)+'</h3><button type="button" class="productDetailsButton" data-onclick="openProductDetails('+Number(product.id)+')">Ver detalhes</button><div class="priceBlock"><div class="price">'+money(product.p)+'</div></div><div class="shippingInfo"><span>✓</span> '+(stock>0?escapeHTML(product.shipping||"Disponível"):"Sem estoque")+'</div><button class="add" '+(stock<=0?'disabled':'data-onclick="add('+product.id+')"')+'><span>'+(stock>0?"Adicionar ao carrinho":"Indisponível")+'</span><span class="addArrow">→</span></button></div></article>';
}

function fillRails() {
  const ids=["offerGrid","bestGrid","newGrid"];
  if (!products.length) {
    const empty='<div class="marketPlaceholder"><span class="marketPlaceholderText"><small>VORZELI</small><strong>Produtos em breve</strong><em>A estrutura da loja está pronta. Novos itens aparecerão aqui automaticamente quando forem cadastrados.</em></span></div>';
    ids.forEach(id=>{const el=document.getElementById(id);if(el)el.innerHTML=empty;});
    return;
  }
  const offers=[...products].filter(p=>Number(p.oldPrice)>Number(p.p)).slice(0,8);
  const best=[...products].sort((a,b)=>Number(b.reviews||0)-Number(a.reviews||0)).slice(0,8);
  const newest=[...products].slice(0,8);
  [[ids[0],offers.length?offers:newest],[ids[1],best],[ids[2],newest]].forEach(([id,list])=>{const el=document.getElementById(id);if(el)el.innerHTML=list.map(railCard).join("");});
}


/* =========================
   VER MAIS
========================= */

function showAll() {

  document
    .getElementById("areas")
    ?.scrollIntoView({
      behavior: "smooth"
    });
}


/* =========================
   ADICIONAR AO CARRINHO
========================= */

function add(id) {
  const product = products.find(product => product.id === id);
  if (!product || Number(product.stock) <= 0) return alert("Produto sem estoque no momento.");
  let item = cart.find(product => product.id === id);
  if (item) {
    if (item.q >= Number(product.stock)) return alert("Você já adicionou todo o estoque disponível.");
    item.q++;
  } else {
    cart.push({ id, q: 1 });
  }
  save();
  openCart();
}


/* =========================
   SALVAR CARRINHO
========================= */

function save() {
  selectedShipping=null;
  window.shippingQuotes=[];
  appliedCoupon=null;
  const shippingOptions=document.getElementById("shippingOptions");
  if(shippingOptions)shippingOptions.innerHTML='<p class="shippingHint">Carrinho alterado. Calcule o frete novamente.</p>';
  const couponStatus=document.getElementById("couponStatus");
  if(couponStatus)couponStatus.textContent="Carrinho alterado. Aplique o cupom novamente.";
  const discountRow=document.getElementById("discountRow");
  if(discountRow)discountRow.hidden=true;

  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );

  updateCart();
}


/* =========================
   ATUALIZAR CARRINHO
========================= */

function checkoutMessage(message,type="info"){
  const box=document.getElementById("checkoutNotice");
  if(!box)return;
  box.textContent=message||"";
  box.className="checkoutNotice"+(message?" show "+type:"");
}
function focusCheckoutField(id){
  const el=document.getElementById(id);if(el){el.focus({preventScroll:true});el.scrollIntoView({behavior:"smooth",block:"center"});}
}
function updateCheckoutSteps(){
  const steps=document.querySelectorAll(".checkoutSteps span");
  if(!steps.length)return;
  steps.forEach(x=>x.classList.remove("active","done"));
  if(cart.length)steps[0].classList.add("done");else steps[0].classList.add("active");
  if(cart.length&&!selectedShipping)steps[1].classList.add("active");
  if(selectedShipping){steps[1].classList.add("done");steps[2].classList.add("active");}
}

async function applyCoupon(){
 const input=document.getElementById("couponCode"),status=document.getElementById("couponStatus"),code=(input?.value||"").trim().toUpperCase();
 const subtotal=cart.reduce((v,item)=>{const p=products.find(x=>x.id===item.id);return v+(p?Number(p.p)*item.q:0)},0);
 if(!code){appliedCoupon=null;if(status)status.textContent="";updateCart();return;}
 if(status)status.textContent="Validando cupom...";
 try{const r=await fetch("/api/cupom/validar",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code,subtotal})}),d=await r.json();if(!r.ok)throw new Error(d.error||"Cupom inválido.");appliedCoupon={code:d.code,discount:Number(d.discount)||0};if(input)input.value=d.code;if(status)status.textContent="✓ Cupom aplicado: "+money(appliedCoupon.discount)+" de desconto.";updateCart();}catch(e){appliedCoupon=null;if(status)status.textContent=e.message;updateCart();}
}

function updateCart() {

  cart =
    cart.filter(item =>
      products.some(
        product =>
          product.id === item.id
      )
    );

  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );

  const count =
    document.getElementById("count");

  if (count) {

    count.textContent =
      cart.reduce(
        (total, item) =>
          total + item.q,
        0
      );
    count.closest('.cartBtn')?.setAttribute('aria-label',`Abrir carrinho, ${count.textContent} itens`);
  }

  const items =
    document.getElementById("items");

  if (items) {

    items.innerHTML =

      cart
        .map(item => {

          const product =
            products.find(
              product =>
                product.id === item.id
            );

          if (!product) {
            return "";
          }

          return `

            <div class="cartItem">

              <div class="ciIcon">
                ${safeImageUrl(product.i) ? '<img src="'+escapeHTML(safeImageUrl(product.i))+'" alt="" data-style="width:44px;height:44px;object-fit:contain">' : "📦"}
              </div>

              <div data-style="flex:1">

                <b>
                  ${escapeHTML(product.n)}
                </b>

                <div>
                  ${money(product.p)}
                </div>

                <div class="qty">

                  <button
                    data-onclick="change(${item.id},-1)">
                    −
                  </button>

                  ${item.q}

                  <button
                    data-onclick="change(${item.id},1)">
                    +
                  </button>

                </div>

              </div>

            </div>

          `;

        })
        .join("")

      ||

      "<p>Seu carrinho está vazio.</p>";
  }


  const total =
    cart.reduce(
      (value, item) => {

        const product =
          products.find(
            product =>
              product.id === item.id
          );

        return (
          value +
          (
            product
              ? product.p * item.q
              : 0
          )
        );

      },
      0
    );


  const shippingValue=Number(selectedShipping?.price||0);
  const discount=Math.min(Number(appliedCoupon?.discount||0),total);
  const discountRow=document.getElementById("discountRow"),discountTotal=document.getElementById("discountTotal");
  if(discountRow)discountRow.style.display=discount>0?"flex":"none";if(discountTotal)discountTotal.textContent="- "+money(discount);
  const subtotalElement=document.getElementById("subtotal");
  const shippingElement=document.getElementById("shippingTotal");
  const totalElement=document.getElementById("total");
  if(subtotalElement)subtotalElement.textContent=money(total);
  if(shippingElement)shippingElement.textContent=selectedShipping?money(shippingValue):"A calcular";
  if(totalElement)totalElement.textContent=money(Math.max(0,total-discount)+shippingValue);
  updateCheckoutSteps();
}


/* =========================
   QUANTIDADE
========================= */

function change(id, amount) {
  const item = cart.find(product => product.id === id);
  const product = products.find(product => product.id === id);
  if (!item || !product) return;
  if (amount > 0 && item.q >= Number(product.stock)){checkoutMessage("Você atingiu a quantidade disponível deste produto.","warning");return;}
  item.q += amount;
  if (item.q <= 0) cart = cart.filter(product => product.id !== id);
  save();
}


/* =========================
   CARRINHO LATERAL
========================= */

function toggleCart() {

  document
    .getElementById("cart")
    ?.classList
    .toggle("open");

  document
    .getElementById("overlay")
    ?.classList
    .toggle("show");
}


function openCart() {

  document
    .getElementById("cart")
    ?.classList
    .add("open");

  document
    .getElementById("overlay")
    ?.classList
    .add("show");
}


/* =========================
   FRETE
========================= */
let selectedShipping=null;

async function calculateShipping(){
  if(!cart.length){checkoutMessage("Adicione pelo menos um produto ao carrinho.","warning");return;}
  const cep=(document.getElementById("postalCode")?.value||"").replace(/\D/g,"");
  if(cep.length!==8){checkoutMessage("Digite um CEP válido com 8 números.","warning");focusCheckoutField("postalCode");return;}
  const box=document.getElementById("shippingOptions");
  checkoutMessage("Consultando as melhores opções de entrega...");if(box)box.innerHTML='<p data-style="font-size:13px">Calculando opções de entrega...</p>';
  selectedShipping=null;
  try{
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
    let r;
    try{r=await fetch("/api/frete/cotar",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({postal_code:cep,items:cart.map(i=>({id:i.id,q:i.q}))}),signal:controller.signal});}
    finally{clearTimeout(timer);}
    const d=await r.json();if(!r.ok)throw new Error(d.error||"Não foi possível calcular o frete.");
    if(!d.quotes?.length)throw new Error("Nenhuma opção de entrega disponível para este CEP.");
    if(box)box.innerHTML='<div class="shippingTitle">Escolha a entrega</div>'+d.quotes.map((q,i)=>'<label class="shippingOption"><input type="radio" name="shippingOption" value="'+q.id+'" data-onchange="chooseShipping('+i+')"><span><b>'+(q.company?q.company+" • ":"")+q.name+'</b><small>'+money(Number(q.price))+(q.delivery_time?" • até "+q.delivery_time+" dias úteis":"")+'</small></span></label>').join("");
    window.shippingQuotes=d.quotes;checkoutMessage("Fretes encontrados. Escolha a opção que preferir.","success");
  }catch(e){const msg=e?.name==="AbortError"?"A cotação demorou para responder. Tente novamente.":(e.message||"Não foi possível calcular o frete.");checkoutMessage(msg,"error");if(box)box.innerHTML='<p class="shippingError">'+escapeHTML(msg)+'</p><button type="button" class="shippingRetry" data-onclick="calculateShipping()">Tentar novamente</button>';}
}
function chooseShipping(index){
  selectedShipping=window.shippingQuotes?.[index]||null;
  document.querySelectorAll(".shippingOption").forEach((el,i)=>el.classList.toggle("selected",i===index));
  checkoutMessage("Frete selecionado. Confira o total e siga para o pagamento.","success");
  updateCart();
}

/* =========================
   MERCADO PAGO
========================= */

let checkoutInProgress=false;
async function checkout() {
  if(checkoutInProgress)return;
  if (!cart.length){checkoutMessage("Adicione pelo menos um produto ao carrinho.","warning");return;}
  const val=id=>(document.getElementById(id)?.value||"").trim();
  const customer={
    name:val("customerName"), phone:val("customerPhone"), postalCode:val("postalCode"),
    address:val("addressLine"), number:val("addressNumber"), extra:val("addressExtra"),
    neighborhood:val("neighborhood"), city:val("city"), state:val("state").toUpperCase()
  };
  const cep=customer.postalCode.replace(/\D/g,"");
  if(!customer.name){checkoutMessage("Informe seu nome completo.","warning");focusCheckoutField("customerName");return;}
  if(!customer.phone){checkoutMessage("Informe um telefone ou WhatsApp para contato.","warning");focusCheckoutField("customerPhone");return;}
  if(cep.length!==8){checkoutMessage("Informe um CEP válido.","warning");focusCheckoutField("postalCode");return;}
  if(!customer.address){checkoutMessage("Informe a rua ou avenida.","warning");focusCheckoutField("addressLine");return;}
  if(!customer.number){checkoutMessage("Informe o número do endereço.","warning");focusCheckoutField("addressNumber");return;}
  if(!customer.neighborhood){checkoutMessage("Informe o bairro.","warning");focusCheckoutField("neighborhood");return;}
  if(!customer.city){checkoutMessage("Informe a cidade.","warning");focusCheckoutField("city");return;}
  if(customer.state.length!==2){checkoutMessage("Informe a UF com 2 letras.","warning");focusCheckoutField("state");return;}
  customer.postalCode=cep;
  if(!selectedShipping){checkoutMessage("Calcule e escolha uma opção de frete antes de continuar.","warning");focusCheckoutField("postalCode");return;}
  localStorage.setItem("deliveryData",JSON.stringify(customer));
  const button = document.querySelector(".checkout");
  checkoutInProgress=true;
  checkoutMessage("Preparando seu pagamento seguro...");if (button) { button.disabled = true; button.setAttribute("aria-busy","true"); button.textContent = "Preparando pagamento..."; }
  try {
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),20000);
    let response;
    try{response=await fetch("/api/criar-preferencia", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ items: cart.map(item => ({ id:item.id, q:item.q })), customer, shipping_service_id:selectedShipping?.id||"", coupon_code:appliedCoupon?.code||"" }),
      signal:controller.signal
    });}finally{clearTimeout(timer);}
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Não foi possível iniciar o pagamento.");
    if (data.order_id) localStorage.setItem("lastOrderId", data.order_id);
    const url = data.checkout_url || data.sandbox_url;
    if (!url) throw new Error("Link de pagamento não recebido.");
    window.location.href = url;
  } catch (error) {
    const message=error?.name==="AbortError"?"O pagamento demorou para responder. Verifique sua conexão e tente novamente.":(error.message || "Erro ao conectar com o Mercado Pago.");
    checkoutMessage(message,"error");
    await loadCatalog();
  } finally {
    checkoutInProgress=false;
    if (button) { button.disabled = false; button.removeAttribute("aria-busy"); button.textContent = "Ir para pagamento seguro"; }
  }
}


/* =========================
   PESQUISA
========================= */

const searchInput =
  document.getElementById("search");


if (searchInput) {

  searchInput.addEventListener(
    "input",
    () => {

      if (
        selectedSub &&
        (
          !specializedSubs[selectedSub] ||
          selectedDetail
        )
      ) {
        render();
      }
    }
  );
}


/* =========================
   INICIAR SITE
========================= */

async function loadCatalog() {
  try {
    const response = await fetch("/api/produtos", { cache: "no-store" });
    if (!response.ok) throw new Error("Falha ao carregar catálogo");
    products = await response.json();
    const suggestions=document.getElementById("searchSuggestions"); if(suggestions)suggestions.innerHTML=products.slice(0,100).map(p=>`<option value="${escapeHTML(p.n)}"></option>`).join("");

    cart = cart.filter(item =>
      products.some(product => product.id === item.id)
    );

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCart();
    fillRails();
    if (selectedSub && (!specializedSubs[selectedSub] || selectedDetail)) render();
  } catch (error) {
    console.error("Catálogo:", error);
  }
}

renderAreas();

renderMenu();

fillRails();

hideProductArea();

loadCatalog().then(()=>{
  const q=new URLSearchParams(location.search),reviewId=Number(q.get("avaliar")),orderId=(q.get("pedido")||"").trim();
  if(reviewId){
    openProductDetails(reviewId);
    setTimeout(()=>{const input=document.getElementById("reviewOrder");if(input)input.value=orderId;document.querySelector(".productReviews")?.scrollIntoView({behavior:"smooth",block:"center"});},180);
  }
});


/* =========================
   DADOS DE ENTREGA
========================= */
(function restoreDelivery(){
  try{
    const d=JSON.parse(localStorage.getItem("deliveryData")||"null"); if(!d)return;
    const map={customerName:"name",customerPhone:"phone",postalCode:"postalCode",addressLine:"address",addressNumber:"number",addressExtra:"extra",neighborhood:"neighborhood",city:"city",state:"state"};
    Object.entries(map).forEach(([id,key])=>{const el=document.getElementById(id);if(el)el.value=d[key]||""});
  }catch{}
})();


/* =========================
   CEP AUTOMÁTICO
========================= */
(function setupCepLookup(){
  const cepInput=document.getElementById("postalCode");
  if(!cepInput)return;

  let lastCep="";
  const setValue=(id,value)=>{
    const el=document.getElementById(id);
    if(el && value) el.value=value;
  };

  async function lookupCep(){
    const cep=cepInput.value.replace(/\D/g,"").slice(0,8);
    cepInput.value=cep.length>5?cep.slice(0,5)+"-"+cep.slice(5):cep;
    if(cep.length!==8 || cep===lastCep)return;
    lastCep=cep;

    const oldPlaceholder=cepInput.placeholder;
    cepInput.disabled=true;
    cepInput.placeholder="Buscando CEP...";
    try{
      const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);
      let response;
      try{response=await fetch("https://viacep.com.br/ws/"+cep+"/json/",{signal:controller.signal});}
      finally{clearTimeout(timer);}
      if(!response.ok)throw new Error("CEP não encontrado.");
      const data=await response.json();
      if(data.erro)throw new Error("CEP não encontrado.");
      setValue("addressLine",data.logradouro);
      setValue("neighborhood",data.bairro);
      setValue("city",data.localidade);
      setValue("state",data.uf);
      const number=document.getElementById("addressNumber");
      if(number)number.focus();
    }catch(error){
      lastCep="";
      cepInput.setCustomValidity(error?.name==="AbortError"?"A consulta do CEP demorou. Você pode preencher o endereço manualmente.":"Não foi possível localizar esse CEP. Confira o número ou preencha o endereço manualmente.");
      cepInput.reportValidity();
      setTimeout(()=>cepInput.setCustomValidity(""),3500);
    }finally{
      cepInput.disabled=false;
      cepInput.placeholder=oldPlaceholder;
    }
  }

  cepInput.addEventListener("input",()=>{
    const digits=cepInput.value.replace(/\D/g,"").slice(0,8);
    cepInput.value=digits.length>5?digits.slice(0,5)+"-"+digits.slice(5):digits;
    if(digits.length===8)lookupCep();
    else lastCep="";
    selectedShipping=null;
    const shippingOptions=document.getElementById("shippingOptions");if(shippingOptions)shippingOptions.innerHTML="";
  });
  cepInput.addEventListener("blur",lookupCep);
})();


function isFavorite(id){return favorites.has(Number(id));}
function toggleFavorite(id){
  id=Number(id);
  if(favorites.has(id))favorites.delete(id);else favorites.add(id);
  localStorage.setItem("vorzeli_favorites",JSON.stringify([...favorites]));
  const b=document.getElementById("favoriteProductButton");
  if(b)b.textContent=isFavorite(id)?"♥ Salvo nos favoritos":"♡ Adicionar aos favoritos";
}
async function shareProduct(id){
  const p=products.find(x=>String(x.id)===String(id)); if(!p)return;
  const url=location.origin+"/produto/"+p.id;
  try{
    if(navigator.share)await navigator.share({title:p.n,text:"Confira este produto na VORZELI",url});
    else{await navigator.clipboard.writeText(url);alert("Link do produto copiado.");}
  }catch(e){if(e?.name!=="AbortError")alert("Não foi possível compartilhar agora.");}
}
function buyNow(id){
  const p=products.find(x=>String(x.id)===String(id));
  if(!p||Number(p.stock)<=0)return;
  cart=[{id:p.id,q:1}]; save();
  const d=document.getElementById("productDetailsDialog");if(d?.open)d.close();
  openCart();
}
function openRelatedProduct(id){
  const d=document.getElementById("productDetailsDialog");if(d?.open)d.close();
  setTimeout(()=>openProductDetails(id),80);
}
async function loadProductReviews(id){
 const box=document.getElementById("productReviewsList");if(!box)return;
 try{const r=await fetch("/api/produtos/"+encodeURIComponent(id)+"/avaliacoes"),d=await r.json();if(!r.ok)throw new Error();box.innerHTML=d.items?.length?d.items.map(x=>'<article class="productReview"><b>'+"★".repeat(Number(x.rating))+"☆".repeat(5-Number(x.rating))+'</b> '+(x.verified_purchase?'<span>Compra verificada</span>':'')+'<p>'+escapeHTML(x.comment||"")+'</p><small>'+escapeHTML(x.customer_name||"Cliente VORZELI")+'</small></article>').join(""):'<p>Este produto ainda não recebeu avaliações publicadas.</p>';}catch{box.innerHTML='<p>Não foi possível carregar avaliações agora.</p>';}
}
async function sendProductReview(id){
 const order=(document.getElementById("reviewOrder")?.value||"").trim(),rating=Number(document.getElementById("reviewRating")?.value),comment=(document.getElementById("reviewComment")?.value||"").trim(),status=document.getElementById("reviewStatus");
 try{const r=await fetch("/api/produtos/"+encodeURIComponent(id)+"/avaliacoes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({order_id:order,rating,comment})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Não foi possível avaliar.");if(status)status.textContent=d.message;}catch(e){if(status)status.textContent=e.message;}
}
async function loadProductQuestions(id){
  const box=document.getElementById("productQuestionsList");if(!box)return;
  try{const r=await fetch("/api/produtos/"+encodeURIComponent(id)+"/perguntas");const rows=await r.json();if(!r.ok)throw new Error();box.innerHTML=rows.length?rows.map(q=>'<article class="productQuestion"><b>'+(q.customer_name?escapeHTML(q.customer_name):"Cliente")+'</b><p>'+escapeHTML(q.question)+'</p>'+(q.answer?'<div><strong>VORZELI respondeu:</strong> '+escapeHTML(q.answer)+'</div>':'')+'</article>').join(""):'<p>Ainda não há perguntas publicadas para este produto.</p>';}catch{box.innerHTML='<p>Não foi possível carregar as perguntas agora.</p>';}
}
async function sendProductQuestion(id){
  const name=(document.getElementById("questionName")?.value||"").trim(),question=(document.getElementById("questionText")?.value||"").trim(),status=document.getElementById("questionStatus");
  if(question.length<5){if(status)status.textContent="Escreva uma pergunta um pouco mais completa.";return;}
  try{const r=await fetch("/api/produtos/"+encodeURIComponent(id)+"/perguntas",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,question})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Não foi possível enviar.");if(status)status.textContent=d.message;const t=document.getElementById("questionText");if(t)t.value="";}catch(e){if(status)status.textContent=e.message;}
}
function openProductDetails(id) {
  const product=products.find(p=>String(p.id)===String(id));
  if(!product)return;
  const dialog=document.getElementById("productDetailsDialog");
  if(!dialog)return;
  const images=[...new Set([product.i,...(product.images||[])].map(safeImageUrl).filter(Boolean))];
  const stock=Number(product.stock)||0;
  const oldPrice=Number(product.oldPrice||0),discount=oldPrice>Number(product.p)?Math.round((1-Number(product.p)/oldPrice)*100):0;
  const installments=Math.max(1,Number(product.installments||10));
  const related=products.filter(p=>p.id!==product.id&&(p.c===product.c||p.sub===product.sub)).slice(0,4);
  document.getElementById("productDetailsContent").innerHTML=`
    <nav class="productBreadcrumb" aria-label="Navegação"><button type="button" data-onclick="closeProductDialog()">Início</button><span>›</span><span>${escapeHTML(product.c||"Produto")}</span></nav>
    <h2 id="productDetailsTitle">${escapeHTML(product.n)}</h2>
    ${images.length?`<div class="productGallery">${images.map((src,i)=>`<img src="${escapeHTML(src)}" alt="${escapeHTML(product.n)} - foto ${i+1}" loading="${i?"lazy":"eager"}" decoding="async">`).join("")}</div>`:""}
    <div class="productBuyPanel">
      ${oldPrice>Number(product.p)?`<div class="oldPrice">${money(oldPrice)} <b class="discountPillInline">-${discount}%</b></div>`:""}
      <div class="price">${money(product.p)}</div>
      <div class="install">ou em até ${installments}x de ${money(Number(product.p)/installments)}</div>
      ${Number(product.rating)>0?`<div class="ratingRow"><span class="ratingStar">★</span><b>${Number(product.rating).toFixed(1)}</b><small> (${Number(product.reviews||0)} avaliações)</small></div>`:""}
      <p class="stockState">${stock>0?"✓ Disponível em estoque":"Sem estoque"}</p>
      <div class="productPrimaryActions"><button type="button" class="buyNow" data-onclick="buyNow(${Number(product.id)})" ${stock<=0?"disabled":""}>Comprar agora</button><button type="button" class="add" id="productDetailsAdd" ${stock<=0?"disabled":""}>${stock>0?"Adicionar ao carrinho":"Indisponível"}</button></div>
      <div class="productSecondaryActions"><button type="button" id="favoriteProductButton" data-onclick="toggleFavorite(${Number(product.id)})">${isFavorite(product.id)?"♥ Salvo nos favoritos":"♡ Adicionar aos favoritos"}</button><button type="button" data-onclick="shareProduct(${Number(product.id)})">Compartilhar</button></div>
      <div class="productTrustMini"><span>✓ Pagamento seguro</span><span>↗ Frete calculado pelo CEP no carrinho</span><span>↺ Consulte trocas e devoluções</span></div>
    </div>
    ${product.brand?`<p><b>Marca:</b> ${escapeHTML(product.brand)}</p>`:""}
    ${product.sku?`<p><b>Código:</b> ${escapeHTML(product.sku)}</p>`:""}
    ${product.description?`<section class="productDescription"><h3>Descrição do produto</h3><p>${escapeHTML(product.description)}</p></section>`:""}
    ${(product.variants||[]).length?`<section><h3>Características</h3><dl class="productCharacteristics">${product.variants.map(v=>`<div><dt>${escapeHTML(v.name)}</dt><dd>${escapeHTML(v.value)}</dd></div>`).join("")}</dl></section>`:""}
    <section class="productReviews"><h3>Avaliações de compradores</h3><div id="productReviewsList"><p>Carregando avaliações...</p></div><div class="askProduct"><h4>Avalie uma compra entregue</h4><input id="reviewOrder" maxlength="80" placeholder="Número do pedido VZ-..."><select id="reviewRating"><option value="5">★★★★★ — 5</option><option value="4">★★★★☆ — 4</option><option value="3">★★★☆☆ — 3</option><option value="2">★★☆☆☆ — 2</option><option value="1">★☆☆☆☆ — 1</option></select><textarea id="reviewComment" maxlength="1200" placeholder="Conte como foi sua experiência com o produto"></textarea><button type="button" data-onclick="sendProductReview(${Number(product.id)})">Enviar avaliação</button><small id="reviewStatus" aria-live="polite">Somente pedidos pagos e entregues podem avaliar.</small></div></section>\n    <section class="productQuestions"><h3>Perguntas sobre o produto</h3><div id="productQuestionsList"><p>Carregando perguntas...</p></div><div class="askProduct"><input id="questionName" maxlength="80" placeholder="Seu nome (opcional)"><textarea id="questionText" maxlength="600" placeholder="Tire sua dúvida sobre este produto"></textarea><button type="button" data-onclick="sendProductQuestion(${Number(product.id)})">Enviar pergunta</button><small id="questionStatus" aria-live="polite">As perguntas são analisadas antes da publicação.</small></div></section>\n    ${related.length?`<section class="relatedProducts"><h3>Você também pode gostar</h3><div>${related.map(p=>`<button type="button" data-onclick="openRelatedProduct(${Number(p.id)})">${safeImageUrl(p.i)?`<img src="${escapeHTML(safeImageUrl(p.i))}" alt="">`:""}<span>${escapeHTML(p.n)}</span><b>${money(p.p)}</b></button>`).join("")}</div></section>`:""}
    <p class="productPolicyLink"><a href="/politicas.html#trocas">Trocas e devoluções</a> • <a href="/politicas.html#atendimento">Precisa de ajuda?</a></p>`;
  const addBtn=document.getElementById("productDetailsAdd");
  if(addBtn)addBtn.addEventListener("click",()=>{dialog.close();add(product.id)});
  if(!dialog.open)dialog.showModal();
  loadProductQuestions(product.id);
  loadProductReviews(product.id);
}
