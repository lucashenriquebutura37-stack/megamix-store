/* =========================================================
   VORZELI - SCRIPT PRINCIPAL
========================================================= */


/* =========================================================
   PRODUTOS

   Por enquanto a loja está sem produtos cadastrados.
   Depois adicionaremos os produtos reais aqui.
========================================================= */

const products = [];


/* =========================================================
   CATEGORIAS / ÁREAS DA LOJA
========================================================= */

const areas = [

  {
    name: "Celulares",
    icon: "📱",
    desc: "Celulares e acessórios",
    subs: [
      "Capinhas",
      "Películas",
      "Cabos",
      "Carregadores",
      "Fones",
      "Power Banks",
      "Suportes",
      "Adaptadores"
    ]
  },

  {
    name: "Smartwatches",
    icon: "⌚",
    desc: "Relógios e acessórios",
    subs: [
      "Smartwatches",
      "Smartbands",
      "Pulseiras",
      "Películas",
      "Protetores",
      "Cabos",
      "Carregadores",
      "Bases"
    ]
  },

  {
    name: "Informática",
    icon: "💻",
    desc: "Periféricos e acessórios",
    subs: [
      "Mouse sem fio",
      "Teclados",
      "Mouse Pads",
      "Hub USB / USB-C",
      "Cabos HDMI",
      "Adaptadores",
      "Leitores de cartão",
      "Suportes para notebook",
      "Organizadores de cabos"
    ]
  },

  {
    name: "Componentes Eletrônicos",
    icon: "⚡",
    desc: "Peças e componentes",
    subs: [
      "Capacitores",
      "Resistores",
      "LEDs",
      "Fusíveis",
      "Conectores",
      "Plugues",
      "Interruptores",
      "Fontes de alimentação",
      "Módulos eletrônicos",
      "Terminais",
      "Cabos",
      "Adaptadores"
    ]
  },

  {
    name: "Ferramentas",
    icon: "🔧",
    desc: "Ferramentas e bancada",
    subs: [
      "Chaves de precisão",
      "Chaves de fenda e Phillips",
      "Bits",
      "Alicates",
      "Trenas",
      "Estiletes",
      "Pinças",
      "Ferro de solda",
      "Sugador de solda",
      "Multímetros"
    ]
  },

  {
    name: "Casa e Utilidades",
    icon: "🏠",
    desc: "Utilidades para o dia a dia",
    subs: [
      "Organizadores",
      "Utensílios de cozinha",
      "Ganchos adesivos",
      "Acessórios para Air Fryer",
      "Organizadores para banheiro",
      "Utilidades domésticas"
    ]
  },

  {
    name: "Copos e Térmicos",
    icon: "🥤",
    desc: "Copos, canecas e térmicos",
    subs: [
      "Copo térmico inox",
      "Copo térmico com tampa",
      "Copo térmico com canudo",
      "Copos personalizados",
      "Canecas personalizadas",
      "Canecas térmicas",
      "Garrafas térmicas",
      "Squeezes",
      "Copos infantis",
      "Copos para viagem",
      "Kits de copos",
      "Canudos reutilizáveis",
      "Tampas de reposição",
      "Alças e acessórios"
    ]
  },

  {
    name: "Brinquedos",
    icon: "🧸",
    desc: "Diversão e educativos",
    subs: [
      "Brinquedos educativos",
      "Blocos de montar",
      "Carrinhos",
      "Quebra-cabeças",
      "Jogos de memória",
      "Kits de desenho",
      "Brinquedos sensoriais",
      "Brinquedos interativos"
    ]
  },

  {
    name: "Automotivo",
    icon: "🚗",
    desc: "Acessórios para carro e moto",
    subs: [
      "Suportes para celular",
      "Carregadores veiculares",
      "Cabos",
      "Adaptadores",
      "Organizadores",
      "Panos de microfibra",
      "Acessórios para limpeza",
      "Acessórios para carros e motos"
    ]
  },

  {
    name: "Games",
    icon: "🎮",
    desc: "Acessórios gamer",
    subs: [
      "Mouse gamer",
      "Mouse Pads",
      "Suportes para headset",
      "Cabos para controles",
      "Capas para controles",
      "Grips para analógicos",
      "Suportes para controles",
      "Acessórios para jogos mobile"
    ]
  },

  {
    name: "Áudio",
    icon: "🎧",
    desc: "Fones, cabos e microfones",
    subs: [
      "Fones Bluetooth",
      "Fones com fio",
      "Cabos P2",
      "Adaptadores de áudio",
      "Cabos auxiliares",
      "Microfones de lapela",
      "Suportes para fones"
    ]
  },

  {
    name: "Iluminação",
    icon: "💡",
    desc: "LED e iluminação",
    subs: [
      "Fitas LED",
      "Lâmpadas LED",
      "Luminárias USB",
      "Luzes noturnas",
      "Luminárias de mesa",
      "Sensores de presença",
      "Soquetes",
      "Adaptadores"
    ]
  },

  {
    name: "Pet",
    icon: "🐶",
    desc: "Acessórios para cães e gatos",
    subs: [
      "Brinquedos para pets",
      "Comedouros",
      "Bebedouros",
      "Escovas removedoras de pelos",
      "Coleiras",
      "Guias",
      "Higiene",
      "Acessórios"
    ]
  },


  /* =====================================================
     AUDIOLOGIA
  ===================================================== */

  {
    name: "Audiologia",
    icon: "🦻",
    desc: "Acessórios e componentes",
    special: true,

    subs: [
      "Audiômetro",
      "Imitanciômetro",
      "BERA / PEATE",
      "Vecto / VENG"
    ]
  },


  /* =====================================================
     MEDICINA
  ===================================================== */

  {
    name: "Medicina",
    icon: "🩺",
    desc: "Acessórios e componentes",
    special: true,

    subs: [
      "ECG",
      "EEG",
      "Espirometria"
    ]
  }

];


/* =========================================================
   SUBCATEGORIAS ESPECIALIZADAS
========================================================= */

const specializedSubs = {

  "Audiômetro": [
    "Fones",
    "Cabos",
    "Vibrador ósseo",
    "Botão de resposta",
    "Conectores"
  ],

  "Imitanciômetro": [
    "Sondas",
    "Olivas",
    "Tubos",
    "Cabos",
    "Conectores"
  ],

  "BERA / PEATE": [
    "Eletrodos",
    "Cabos",
    "Conectores",
    "Consumíveis"
  ],

  "Vecto / VENG": [
    "Cabos",
    "Eletrodos",
    "Acessórios",
    "Componentes"
  ],

  "ECG": [
    "Cabo de paciente",
    "Cabos de comunicação e dados",
    "Eletrodos",
    "Peras",
    "Pinças",
    "Conectores e adaptadores"
  ],

  "EEG": [
    "Eletrodos",
    "Cabos",
    "Toucas compatíveis",
    "Conectores",
    "Acessórios"
  ],

  "Espirometria": [
    "Bocais",
    "Filtros",
    "Mangueiras",
    "Clips nasais",
    "Adaptadores",
    "Acessórios compatíveis"
  ]

};


/* =========================================================
   VARIÁVEIS
========================================================= */

let selected = "";
let selectedSub = "";


/* =========================================================
   CARRINHO

   Mantém somente produtos que ainda existem no catálogo.
========================================================= */

let cart = JSON.parse(
  localStorage.getItem("cart") || "[]"
);

cart = cart.filter(item =>
  products.some(product => product.id === item.id)
);

localStorage.setItem(
  "cart",
  JSON.stringify(cart)
);


/* =========================================================
   FORMATAÇÃO DE PREÇO
========================================================= */

const money = value =>
  Number(value).toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL"
    }
  );


/* =========================================================
   CRIAR CARDS DAS ÁREAS
========================================================= */

function renderAreas() {

  const areaGrid =
    document.getElementById("areaGrid");

  if (!areaGrid) return;


  areaGrid.innerHTML = areas
    .filter(area => !area.special)
    .map(area => {

      return `

        <button
          class="areaCard"
          onclick='openArea(${JSON.stringify(area.name)})'
        >

          <div class="areaIcon">
            ${area.icon}
          </div>

          <h3>
            ${area.name}
          </h3>

          <p>
            ${area.desc}
          </p>

        </button>

      `;

    })
    .join("");

}


/* =========================================================
   MENU LATERAL
========================================================= */

function renderMenu() {

  const container =
    document.getElementById("menuCategories");

  if (!container) return;


  const searchInput =
    document.getElementById("menuSearch");


  const query =
    (
      searchInput
        ? searchInput.value
        : ""
    )
    .trim()
    .toLowerCase();


  const normalAreas =
    areas.filter(area =>

      !area.special &&

      (
        area.name
          .toLowerCase()
          .includes(query)

        ||

        area.desc
          .toLowerCase()
          .includes(query)

      )

    );


  const specialAreas =
    areas.filter(area =>

      area.special &&

      (
        area.name
          .toLowerCase()
          .includes(query)

        ||

        area.desc
          .toLowerCase()
          .includes(query)

      )

    );


  let html = "";


  html += normalAreas
    .map(menuButton)
    .join("");


  if (specialAreas.length) {

    html += `

      <div class="menuDivider">
        ÁREAS ESPECIALIZADAS
      </div>

    `;

  }


  html += specialAreas
    .map(menuButton)
    .join("");


  if (!html.trim()) {

    html = `

      <p style="
        text-align:center;
        color:#777;
        padding:20px 5px;
      ">

        Nenhuma categoria encontrada.

      </p>

    `;

  }


  container.innerHTML = html;

}


/* =========================================================
   BOTÃO DO MENU
========================================================= */

function menuButton(area) {

  return `

    <button
      class="menuItem"
      onclick='openArea(${JSON.stringify(area.name)})'
    >

      <span>
        ${area.icon}
      </span>

      <b>
        ${area.name}
      </b>

      <span>
        ›
      </span>

    </button>

  `;

}


/* =========================================================
   ABRIR / FECHAR MENU
========================================================= */

function toggleMenu() {

  const menu =
    document.getElementById("sideMenu");

  const overlay =
    document.getElementById("menuOverlay");


  if (!menu || !overlay) return;


  menu.classList.toggle("open");

  overlay.classList.toggle("show");

}


/* =========================================================
   ABRIR CATEGORIA
========================================================= */

function openArea(name) {

  const area =
    areas.find(item =>
      item.name === name
    );


  if (!area) return;


  selected = area.name;

  selectedSub = "";


  const areaTitle =
    document.getElementById("areaTitle");

  const productTitle =
    document.getElementById("productTitle");

  const subcategories =
    document.getElementById("subcategories");

  const modal =
    document.getElementById("areaModal");


  if (areaTitle) {

    areaTitle.textContent =
      area.name;

  }


  if (productTitle) {

    productTitle.textContent =
      area.name;

  }


  if (subcategories) {

    let html = `

      <button
        class="subcat active"
        onclick="selectSub('', this)"
      >

        Todos

      </button>

    `;


    html += area.subs
      .map(sub => `

        <button
          class="subcat"
          onclick='selectSub(${JSON.stringify(sub)}, this)'
        >

          ${sub}

        </button>

      `)
      .join("");


    subcategories.innerHTML = html;

  }


  if (modal) {

    modal.classList.add("open");

  }


  document.body.style.overflow =
    "hidden";


  const sideMenu =
    document.getElementById("sideMenu");

  const menuOverlay =
    document.getElementById("menuOverlay");


  if (sideMenu) {

    sideMenu.classList.remove("open");

  }


  if (menuOverlay) {

    menuOverlay.classList.remove("show");

  }


  render();

}


/* =========================================================
   FECHAR CATEGORIA
========================================================= */

function closeArea() {

  const modal =
    document.getElementById("areaModal");


  if (modal) {

    modal.classList.remove("open");

  }


  document.body.style.overflow = "";


  selected = "";

  selectedSub = "";

}


/* =========================================================
   SELECIONAR SUBCATEGORIA
========================================================= */

function selectSub(
  subcategory,
  button
) {

  selectedSub =
    subcategory;


  document
    .querySelectorAll(".subcat")
    .forEach(item => {

      item.classList.remove(
        "active"
      );

    });


  if (button) {

    button.classList.add(
      "active"
    );

  }


  const productTitle =
    document.getElementById(
      "productTitle"
    );


  if (productTitle) {

    productTitle.textContent =
      subcategory ||
      selected ||
      "Produtos";

  }


  render();

}


/* =========================================================
   MOSTRAR PRODUTOS
========================================================= */

function render() {

  const grid =
    document.getElementById("grid");


  if (!grid) return;


  const search =
    document.getElementById("search");


  const sort =
    document.getElementById("sort");


  const query =
    (
      search
        ? search.value
        : ""
    )
    .trim()
    .toLowerCase();


  const sortValue =
    sort
      ? sort.value
      : "";


  let filtered =
    products.filter(product => {

      const categoryOK =
        !selected ||
        product.c === selected;


      const subcategoryOK =
        !selectedSub ||
        product.sub === selectedSub;


      const searchOK =

        !query ||

        product.n
          .toLowerCase()
          .includes(query)

        ||

        product.c
          .toLowerCase()
          .includes(query)

        ||

        (
          product.sub &&
          product.sub
            .toLowerCase()
            .includes(query)
        );


      return (

        categoryOK &&
        subcategoryOK &&
        searchOK

      );

    });


  if (sortValue === "low") {

    filtered.sort(
      (a, b) =>
        a.p - b.p
    );

  }


  if (sortValue === "high") {

    filtered.sort(
      (a, b) =>
        b.p - a.p
    );

  }


  /* -------------------------------------------------------
     SEM PRODUTOS
  ------------------------------------------------------- */

  if (!filtered.length) {

    let message =
      selected
        ? selected
        : "VORZELI";


    if (selectedSub) {

      message =
        `${selected} • ${selectedSub}`;

    }


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

          <b>
            ${message}
          </b>.

          <br>

          Em breve você encontrará
          novidades aqui.

        </p>

      </div>

    `;


    return;

  }


  /* -------------------------------------------------------
     CARDS DOS PRODUTOS
  ------------------------------------------------------- */

  grid.innerHTML =
    filtered
      .map(product => `

        <article class="card">

          <div class="pic">

            ${product.i || "📦"}

          </div>


          <div class="info">

            <span class="badge">

              ${product.c.toUpperCase()}

            </span>


            <h3>

              ${product.n}

            </h3>


            <div class="price">

              ${money(product.p)}

            </div>


            <div class="install">

              em até 10x no cartão

            </div>


            <button
              class="add"
              onclick="add(${product.id})"
            >

              Adicionar ao carrinho

            </button>

          </div>

        </article>

      `)
      .join("");

}


/* =========================================================
   OFERTAS / MAIS VENDIDOS / NOVIDADES
========================================================= */

function fillRails() {

  const content = `

    <div class="emptyCard">

      🛍️

      <strong>
        Produtos em breve
      </strong>

      Estamos selecionando
      novidades para a VORZELI.

    </div>


    <div class="emptyCard">

      ✨

      <strong>
        Novidades chegando
      </strong>

      Novos produtos aparecerão
      aqui em breve.

    </div>

  `;


  [
    "offerGrid",
    "bestGrid",
    "newGrid"
  ]
  .forEach(id => {

    const element =
      document.getElementById(id);


    if (element) {

      element.innerHTML =
        content;

    }

  });

}


/* =========================================================
   BOTÃO VER MAIS
========================================================= */

function showAll() {

  const areasSection =
    document.getElementById("areas");


  if (areasSection) {

    areasSection.scrollIntoView({

      behavior: "smooth"

    });

  }

}


/* =========================================================
   ADICIONAR PRODUTO AO CARRINHO
========================================================= */

function add(id) {

  const product =
    products.find(item =>
      item.id === id
    );


  if (!product) return;


  let cartItem =
    cart.find(item =>
      item.id === id
    );


  if (cartItem) {

    cartItem.q++;

  } else {

    cart.push({

      id: id,

      q: 1

    });

  }


  save();

  openCart();

}


/* =========================================================
   SALVAR CARRINHO
========================================================= */

function save() {

  localStorage.setItem(

    "cart",

    JSON.stringify(cart)

  );


  updateCart();

}


/* =========================================================
   ATUALIZAR CARRINHO
========================================================= */

function updateCart() {

  cart =
    cart.filter(item =>

      products.some(product =>
        product.id === item.id
      )

    );


  localStorage.setItem(

    "cart",

    JSON.stringify(cart)

  );


  const count =
    document.getElementById("count");

  const items =
    document.getElementById("items");

  const totalElement =
    document.getElementById("total");


  const quantity =
    cart.reduce(

      (total, item) =>
        total + item.q,

      0

    );


  if (count) {

    count.textContent =
      quantity;

  }


  if (items) {

    const cartHTML =
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

                ${product.i || "📦"}

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
                    onclick="change(${item.id}, -1)"
                  >

                    −

                  </button>


                  ${item.q}


                  <button
                    onclick="change(${item.id}, 1)"
                  >

                    +

                  </button>

                </div>

              </div>

            </div>

          `;

        })
        .join("");


    items.innerHTML =

      cartHTML ||

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


        if (!product) {

          return value;

        }


        return (

          value +
          product.p * item.q

        );

      },

      0

    );


  if (totalElement) {

    totalElement.textContent =
      money(total);

  }

}


/* =========================================================
   ALTERAR QUANTIDADE
========================================================= */

function change(
  id,
  amount
) {

  const item =
    cart.find(
      product =>
        product.id === id
    );


  if (!item) return;


  item.q += amount;


  if (item.q <= 0) {

    cart =
      cart.filter(
        product =>
          product.id !== id
      );

  }


  save();

}


/* =========================================================
   ABRIR / FECHAR CARRINHO
========================================================= */

function toggleCart() {

  const cartElement =
    document.getElementById("cart");

  const overlay =
    document.getElementById("overlay");


  if (!cartElement || !overlay) {

    return;

  }


  cartElement
    .classList
    .toggle("open");


  overlay
    .classList
    .toggle("show");

}


function openCart() {

  const cartElement =
    document.getElementById("cart");

  const overlay =
    document.getElementById("overlay");


  if (!cartElement || !overlay) {

    return;

  }


  cartElement
    .classList
    .add("open");


  overlay
    .classList
    .add("show");

}


/* =========================================================
   CHECKOUT MERCADO PAGO
========================================================= */

async function checkout() {

  if (!cart.length) {

    return alert(
      "Adicione produtos ao carrinho."
    );

  }


  const total =
    cart.reduce(

      (value, item) => {

        const product =
          products.find(
            product =>
              product.id === item.id
          );


        if (!product) {

          return value;

        }


        return (

          value +
          product.p * item.q

        );

      },

      0

    );


  if (total <= 0) {

    return alert(
      "Não foi possível calcular o valor do pedido."
    );

  }


  try {

    const response =
      await fetch(

        "/api/criar-preferencia",

        {

          method: "POST",

          headers: {

            "Content-Type":
              "application/json"

          },

          body:
            JSON.stringify({

              titulo:
                "Pedido VORZELI",

              preco:
                Number(
                  total.toFixed(2)
                ),

              quantidade: 1

            })

        }

      );


    const data =
      await response.json();


    if (!response.ok) {

      console.error(data);

      return alert(
        "Não foi possível iniciar o pagamento."
      );

    }


    const url =

      data.sandbox_url ||

      data.checkout_url;


    if (!url) {

      return alert(
        "Link de pagamento não recebido."
      );

    }


    window.location.href =
      url;


  } catch (error) {

    console.error(error);


    alert(
      "Erro ao conectar com o Mercado Pago."
    );

  }

}


/* =========================================================
   PESQUISA
========================================================= */

const searchInput =
  document.getElementById("search");


if (searchInput) {

  searchInput.addEventListener(

    "input",

    () => {

      if (selected) {

        render();

      }

    }

  );

}


/* =========================================================
   INICIALIZAÇÃO DA LOJA
========================================================= */

renderAreas();

renderMenu();

fillRails();

updateCart();
