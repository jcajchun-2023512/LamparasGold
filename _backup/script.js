/* ==========================================================
   Iluminame · script.js
   Para agregar un producto: añade un objeto al array PRODUCTS.
   grid:true → aparece en la sección "Productos" por defecto.
   ========================================================== */

/* ---------- Datos (precios de ejemplo en quetzales) ---------- */
const CATEGORIES = {
  decorativa:    "Decorativa",
  exterior:      "Exterior",
  arquitectonica: "Arquitectónica y ventilación",
  industrial:    "Industrial"
};

const PRODUCTS = [
  { name: "Chandelier Ámbar 8 Luces",       price: 2950, cat: "decorativa", img: "chandelier-ambar",   grid: true },
  { name: "Chandelier Cristal 28 Luces",    price: 5400, cat: "decorativa", img: "chandelier-cristal", grid: true },
  { name: "Plafón de Cristal 26955A",       price: 1850, cat: "decorativa", img: "plafon-cristal" },
  { name: "Aplique de Cristal 26961A",      price: 520,  cat: "decorativa", img: "aplique-cristal" },
  { name: "Colgante Espiral Cristal",       price: 1650, cat: "decorativa", img: "colgante-espiral" },
  { name: "Colgante 3 Aros LED",            price: 1480, cat: "decorativa", img: "tres-aros" },
  { name: "Plafón Metálico 2 Luces",        price: 690,  cat: "decorativa", img: "plafon-metalico", grid: true },
  { name: "Colgante Esfera Rústica",        price: 780,  cat: "decorativa", img: "esfera-rustica" },
  { name: "Colgante Soga Tambor",           price: 560,  cat: "decorativa", img: "colgante-soga" },
  { name: "Colgante Geométrico Soga",       price: 430,  cat: "decorativa", img: "colgante-geometrico", grid: true },
  { name: "Colgante Esfera 3D",             price: 395,  cat: "decorativa", img: "esfera-3d", grid: true },
  { name: "Lámpara Sputnik 6 Luces",        price: 940,  cat: "decorativa", img: "sputnik", grid: true },
  { name: "Plafón Clásico 2 Luces",         price: 240,  cat: "decorativa", img: "plafon-clasico" },
  { name: "Reflector LED 20W",              price: 185,  cat: "industrial", img: "reflector-led", grid: true },
  { name: "Campana UFO High Bay 100W",      price: 640,  cat: "industrial", img: "campana-ufo" },
  { name: "Panel LED 1x2",                  price: 295,  cat: "industrial", img: "panel-led" },
  { name: "Lámpara LED Lineal 40W",         price: 210,  cat: "industrial", img: "lineal-led" },
  { name: "Lámpara de Emergencia LED",      price: 175,  cat: "industrial", img: "emergencia" },
  { name: "Luminaria Cobra 100W",           price: 380,  cat: "exterior",   img: "cobra-100w" },
  { name: "Cobra Solar 90W",                price: 720,  cat: "exterior",   img: "cobra-solar" },
  { name: "Wall Pack LED 40W",              price: 260,  cat: "exterior",   img: "wall-pack" },
  { name: "Aplique Exterior LED",           price: 310,  cat: "exterior",   img: "aplique-exterior", grid: true },
  { name: "Farol de Pared Exterior",        price: 480,  cat: "exterior",   img: "p07_img19", grid: true },
  { name: "Poste Decorativo Exterior",      price: 560,  cat: "exterior",   img: "poste-exterior" },
  { name: "Ventilador de Techo 52\" con Luz", price: 1290, cat: "arquitectonica", img: "p11_img05", grid: true },
  { name: "Foco de Riel PAR30",             price: 150,  cat: "arquitectonica", img: "foco-riel" }
];

/* ---------- Utilidades ---------- */
const $ = (id) => document.getElementById(id);
const money = (n) => "Q " + n.toLocaleString("es-GT", { minimumFractionDigits: 2 });
const norm = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/** Crea una tarjeta de producto (sin botón "+"). */
function createCard(p, modifier = "") {
  const el = document.createElement("article");
  el.className = "card " + modifier;
  el.innerHTML = `
    <div class="card__info">
      <span class="card__tag"></span>
      <h3 class="card__name"></h3>
      <p class="card__price"></p>
    </div>
    <img class="card__img" src="img/${p.img}.png" alt="" loading="lazy">`;
  el.querySelector(".card__tag").textContent = CATEGORIES[p.cat];
  el.querySelector(".card__name").textContent = p.name;
  el.querySelector(".card__price").textContent = money(p.price);
  el.querySelector(".card__img").alt = p.name;
  return el;
}

/* ---------- Carrusel automático (infinito, hacia la derecha) ---------- */
function initCarousel() {
  const viewport = $("carouselViewport");
  const track = $("carouselTrack");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const wrap = (card) => {
    const li = document.createElement("div");
    li.className = "carousel__item";
    li.appendChild(card);
    return li;
  };
  const items = PRODUCTS.map((p) => wrap(createCard(p)));
  items.forEach((i) => track.appendChild(i));

  // Con movimiento reducido: sin animación, solo desplazamiento manual.
  if (reduced) { $("carousel").classList.add("carousel--static"); return; }

  // Segunda copia (decorativa) para que el bucle no tenga saltos.
  const clones = items.map((i) => {
    const c = i.cloneNode(true);
    c.setAttribute("aria-hidden", "true");
    c.querySelector("img").alt = "";
    return c;
  });
  clones.forEach((c) => track.appendChild(c));

  const SPEED = 45;           // píxeles por segundo
  let setWidth = 0, offset = 0, paused = false, last = performance.now();

  const measure = () => {
    const ratio = setWidth ? offset / setWidth : -1;
    setWidth = clones[0].offsetLeft - items[0].offsetLeft;
    offset = ratio * setWidth;
  };

  const tick = (now) => {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    if (!paused && setWidth) {
      offset += SPEED * dt;                 // mueve hacia la derecha
      if (offset >= 0) offset -= setWidth;  // reinicia sin salto visible
    }
    track.style.transform = `translate3d(${offset}px,0,0)`;
    requestAnimationFrame(tick);
  };

  // Pausa al pasar el mouse / tocar / enfocar; continúa al soltar.
  viewport.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") paused = true; });
  viewport.addEventListener("pointerdown", () => { paused = true; });
  ["pointerup", "pointercancel", "pointerleave"].forEach((ev) =>
    viewport.addEventListener(ev, () => { paused = false; }));
  viewport.addEventListener("focusin", () => { paused = true; });
  viewport.addEventListener("focusout", () => { paused = false; });

  addEventListener("resize", measure);
  addEventListener("load", measure);
  measure();
  requestAnimationFrame(tick);
}

/* ---------- Categorías, filtros y productos ---------- */
let activeCat = "todas";
let query = "";

function renderCategories() {
  const grid = $("categoriesGrid");
  Object.entries(CATEGORIES).forEach(([key, label]) => {
    const list = PRODUCTS.filter((p) => p.cat === key);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "category";
    btn.setAttribute("aria-label", `Ver productos de ${label}`);
    btn.innerHTML = `<span class="category__name"></span><span class="category__count"></span>
      <img class="category__img" src="img/${list[0].img}.png" alt="" loading="lazy">`;
    btn.querySelector(".category__name").textContent = label;
    btn.querySelector(".category__count").textContent = `${list.length} productos`;
    btn.addEventListener("click", () => {
      activeCat = key; query = ""; $("searchInput").value = "";
      renderProducts();
      $("productos").scrollIntoView();
    });
    grid.appendChild(btn);
  });
}

function renderFilters() {
  const box = $("filters");
  box.innerHTML = "";
  [["todas", "Todas"], ...Object.entries(CATEGORIES)].forEach(([key, label]) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.textContent = label;
    b.setAttribute("aria-pressed", String(key === activeCat));
    b.addEventListener("click", () => { activeCat = key; renderProducts(); });
    box.appendChild(b);
  });
}

function renderProducts() {
  renderFilters();
  const grid = $("productsGrid");
  const filtering = activeCat !== "todas" || query !== "";
  // Sin filtro: solo los destacados (grid:true). Con filtro o búsqueda: todos los que coincidan.
  const list = PRODUCTS.filter((p) =>
    (filtering || p.grid) &&
    (activeCat === "todas" || p.cat === activeCat) &&
    norm(p.name + " " + CATEGORIES[p.cat]).includes(norm(query)));
  grid.replaceChildren(...list.map((p) => createCard(p, "card--grid")));
  $("status").textContent = list.length
    ? (query ? `${list.length} resultado(s) para "${query}"` : "")
    : "No encontramos productos con esa búsqueda.";
}

/* ---------- Header: menú móvil y buscador ---------- */
function initHeader() {
  const nav = $("nav"), menuBtn = $("menuToggle");
  const bar = $("searchBar"), searchBtn = $("searchToggle"), input = $("searchInput");

  menuBtn.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  });
  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) { nav.classList.remove("is-open"); menuBtn.setAttribute("aria-expanded", "false"); }
  });

  searchBtn.addEventListener("click", () => {
    bar.hidden = !bar.hidden;
    searchBtn.setAttribute("aria-expanded", String(!bar.hidden));
    if (!bar.hidden) input.focus();
  });
  bar.addEventListener("submit", (e) => e.preventDefault());
  input.addEventListener("input", () => {
    query = input.value.trim();
    activeCat = "todas";
    renderProducts();
    if (query) $("productos").scrollIntoView();
  });
}

/* ---------- Formulario de contacto (abre el correo del usuario) ---------- */
$("contactForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  location.href = `mailto:gerencia@grupoiluminame.com?subject=${encodeURIComponent("Consulta de " + f.get("nombre"))}&body=${encodeURIComponent(f.get("mensaje"))}`;
});

/* ---------- Inicio ---------- */
initCarousel();
renderCategories();
renderProducts();
initHeader();