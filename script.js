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
try {
  const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
  cart = Array.isArray(savedCart) ? savedCart : [];
} catch {
  cart = [];
}


/* =========================
   DINHEIRO
========================= */

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
          onclick='openArea(${JSON.stringify(area.name)})'>

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
      onclick='openArea(${JSON.stringify(area.name)})'>

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
    return `<img class="vorzeliIcon" src="${src}" alt="" loading="lazy">`;
  }

  return fallback;
}

function vorzeliAreaIconHTML(area) {
  const map = window.VORZELI_ICON_MAP || {};
  const group = map[area.name];

  if (group && typeof group === "object") {
    const first = Object.values(group).find(value => typeof value === "string");
    if (first) {
      return `<img class="vorzeliGraphicIcon" src="${first}" alt="" loading="lazy">`;
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
      onclick='selectSub(${JSON.stringify(name)},this)'>

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
      onclick='selectDetail(${JSON.stringify(name)},this)'>

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
          onclick='openArea(${JSON.stringify(selected)})'>

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
        product.n
          .toLowerCase()
          .includes(q);

      return (
        categoryOK &&
        subcategoryOK &&
        detailOK &&
        searchOK
      );
    });


  if (sort === "low") {

    filtered.sort(
      (a, b) => a.p - b.p
    );
  }


  if (sort === "high") {

    filtered.sort(
      (a, b) => b.p - a.p
    );
  }


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
          <b>${label}</b>.
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
        const imageContent =
          product.i
            ? (/^(https?:|\/|data:|[^<>]+\.(png|jpe?g|webp|svg))/i.test(String(product.i))
                ? `<img src="${product.i}" alt="${product.n}" loading="lazy">`
                : product.i)
            : '<span class="productFallback">V</span>';

        return `

        <article class="card">

          <div class="pic">
            ${discount > 0 ? `<span class="discountPill">-${discount}%</span>` : ""}
            ${imageContent}
          </div>

          <div class="info">

            <span class="badge">
              ${product.c.toUpperCase()}
            </span>

            <h3>${product.n}</h3>

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
                <span>✓</span> ${shipping}
              </div>
            ` : ""}

            <button
              class="add"
              onclick="add(${product.id})">

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
  const image = product.i && /^(https?:|\/)/i.test(String(product.i))
    ? '<img src="'+product.i+'" alt="'+product.n+'" loading="lazy">'
    : '<span class="productFallback">V</span>';
  const stock = Number(product.stock || 0);
  return '<article class="card"><div class="pic">'+image+'</div><div class="info"><span class="badge">'+product.c.toUpperCase()+'</span><h3>'+product.n+'</h3><div class="priceBlock"><div class="price">'+money(product.p)+'</div></div><div class="shippingInfo"><span>✓</span> '+(stock>0?(product.shipping||"Disponível"):"Sem estoque")+'</div><button class="add" '+(stock<=0?'disabled':'onclick="add('+product.id+')"')+'><span>'+(stock>0?"Adicionar ao carrinho":"Indisponível")+'</span><span class="addArrow">→</span></button></div></article>';
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

  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );

  updateCart();
}


/* =========================
   ATUALIZAR CARRINHO
========================= */

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
                ${product.i && /^https?:/i.test(product.i) ? '<img src="'+product.i+'" alt="" style="width:44px;height:44px;object-fit:contain">' : "📦"}
              </div>

              <div style="flex:1">

                <b>
                  ${product.n}
                </b>

                <div>
                  ${money(product.p)}
                </div>

                <div class="qty">

                  <button
                    onclick="change(${item.id},-1)">
                    −
                  </button>

                  ${item.q}

                  <button
                    onclick="change(${item.id},1)">
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


  const totalElement =
    document.getElementById("total");

  if (totalElement) {

    totalElement.textContent =
      money(total);
  }
}


/* =========================
   QUANTIDADE
========================= */

function change(id, amount) {
  const item = cart.find(product => product.id === id);
  const product = products.find(product => product.id === id);
  if (!item || !product) return;
  if (amount > 0 && item.q >= Number(product.stock)) return alert("Limite do estoque atingido.");
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
   MERCADO PAGO
========================= */

async function checkout() {
  if (!cart.length) return alert("Adicione produtos ao carrinho.");
  const button = document.querySelector(".checkout");
  if (button) { button.disabled = true; button.textContent = "Preparando pagamento..."; }
  try {
    const response = await fetch("/api/criar-preferencia", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ items: cart.map(item => ({ id:item.id, q:item.q })) })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Não foi possível iniciar o pagamento.");
    if (data.order_id) localStorage.setItem("lastOrderId", data.order_id);
    const url = data.checkout_url || data.sandbox_url;
    if (!url) throw new Error("Link de pagamento não recebido.");
    window.location.href = url;
  } catch (error) {
    alert(error.message || "Erro ao conectar com o Mercado Pago.");
    await loadCatalog();
  } finally {
    if (button) { button.disabled = false; button.textContent = "Finalizar pagamento"; }
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

loadCatalog();
