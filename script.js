/* ============================================================
   DATA PRODUK
============================================================ */
const products = [
  { id:1, name:"Nike Air Zoom Alphafly Next%", category:"Running", price:3992000, img:"next.jpg" },
  { id:2, name:"Adidas Samba OG White-Black", category:"Sneakers", price:1199200, img:"samba.jpg" },
  { id:3, name:"Dr. Martens 1460 8-Eye", category:"Boots", price:3111200, img:"dr.jpg" },
  { id:4, name:"Sagara Two Tone Brown Derby Shoes", category:"Formal", price:1220000, img:"sagara.png" },
  { id:5, name:"Vans Classic Slip-On Checkerboard", category:"Slip-On", price:199000, img:"vans.jpg" },
  { id:6, name:"Pharrell x Adidas NMD Human Race Trail Holi Festival Pink Glow" , category:"Sneakers", price:5448800, img:"pharell.jpg" },
  { id:7, name:"On Cloudmonster Frost Surf", category:"Running", price:2560000, img:"onn.jpg" },
  { id:8, name:"Marelli Devan Zalora Office Shoes", category:"Formal", price:879000, img:"zl.jpg" }
];

/* ============================================================
   CART SYSTEM (relaible & compatible)
============================================================ */
let cart = JSON.parse(localStorage.getItem("ss_cart") || "[]");

function saveCart(){
  localStorage.setItem("ss_cart", JSON.stringify(cart));
  updateCartCounter();
}

function updateCartCounter(){
  const count = cart.reduce((s,i)=>s+i.qty,0);
  document.getElementById("cart-count").textContent = count;
}

/* ============================================================
   FORMAT RUPIAH
============================================================ */
const formatRupiah = n => 
  n.toLocaleString("id-ID", { style:"currency", currency:"IDR", maximumFractionDigits:0 });

/* ============================================================
   RENDER PRODUK
============================================================ */
function renderProducts(options={search:"", category:"all"}){
  const grid = document.getElementById("products-grid");
  const q = options.search.toLowerCase();

  const filtered = products.filter(p=>{
    const byCat = options.category==="all" || p.category===options.category;
    const bySearch = p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    return byCat && bySearch;
  });

  grid.innerHTML = filtered.map(p=>`
    <article class="product-card" data-id="${p.id}">
      <div class="product-image">
        <img src="${p.img}" alt="${p.name}">
      </div>
      <div class="product-title">${p.name}</div>
      <div class="product-meta"><small>${p.category}</small></div>
      <div class="product-price">${formatRupiah(p.price)}</div>

      <div class="size-section">
        <label>Pilih Ukuran:</label>
        <div class="sizes" data-id="${p.id}">
          ${["38","39","40","41","42","43","44"].map(s =>
            `<button class="size-btn" data-size="${s}" data-id="${p.id}">${s}</button>`
          ).join("")}
        </div>
      </div>

      <button class="btn btn-primary add-to-cart-final" data-id="${p.id}">
        Tambah ke Keranjang
      </button>
    </article>
  `).join("");

  activateSizeButtons();
  activateFinalAddToCart();
}

/* ============================================================
   PILIH UKURAN
============================================================ */
const selectedSize = {}; // per produk

function activateSizeButtons(){
  document.querySelectorAll(".size-btn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.dataset.id;
      selectedSize[id] = btn.dataset.size;

      // visual active
      document.querySelectorAll(`.sizes[data-id="${id}"] .size-btn`)
        .forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
}

/* ============================================================
   ADD TO CART (SETELAH PILIH UKURAN)
============================================================ */
function activateFinalAddToCart(){
  document.querySelectorAll(".add-to-cart-final").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.dataset.id;
      const size = selectedSize[id];

      if(!size){
        showToast("Pilih ukuran dulu ya!");
        return;
      }

      const exist = cart.find(i=>i.id==id && i.size==size);
      if(exist) exist.qty++;
      else cart.push({ id:Number(id), size:size, qty:1 });

      saveCart();
      showToast("Ditambahkan ke keranjang ✓");
      renderCartPanel();
    });
  });
}

/* ============================================================
   CART PANEL
============================================================ */
function renderCartPanel(){
  const wrap = document.getElementById("cart-items");
  if(!wrap) return;

  if(cart.length===0){
    wrap.innerHTML = `<p style="padding:10px;color:var(--muted);">Keranjang kosong</p>`;
    document.getElementById("cart-total").textContent = formatRupiah(0);
    return;
  }

  wrap.innerHTML = cart.map(ci=>{
    const p = products.find(pp=>pp.id===ci.id);
    return `
      <div class="cart-item">
        <img src="${p.img}">
        <div class="details">
          <div class="title">${p.name}</div>
          <div class="text">Ukuran: ${ci.size}</div>
          <div class="text">${formatRupiah(p.price)} × ${ci.qty}</div>

          <div class="cart-actions">
            <button class="minus" data-id="${ci.id}" data-size="${ci.size}">−</button>
            <span>${ci.qty}</span>
            <button class="plus" data-id="${ci.id}" data-size="${ci.size}">+</button>
            <button class="remove" data-id="${ci.id}" data-size="${ci.size}">Hapus</button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  wrap.querySelectorAll(".plus").forEach(b=>{
    b.addEventListener("click",()=>{
      const it = cart.find(i=>i.id==b.dataset.id && i.size==b.dataset.size);
      it.qty++;
      saveCart();
      renderCartPanel();
    });
  });

  wrap.querySelectorAll(".minus").forEach(b=>{
    b.addEventListener("click",()=>{
      const it = cart.find(i=>i.id==b.dataset.id && i.size==b.dataset.size);
      it.qty--;
      if(it.qty<=0) cart = cart.filter(i=>!(i.id==b.dataset.id && i.size==b.dataset.size));
      saveCart();
      renderCartPanel();
    });
  });

  wrap.querySelectorAll(".remove").forEach(b=>{
    b.addEventListener("click",()=>{
      cart = cart.filter(i=>!(i.id==b.dataset.id && i.size==b.dataset.size));
      saveCart();
      renderCartPanel();
    });
  });

  document.getElementById("cart-total").textContent =
    formatRupiah(cart.reduce((s,i)=>s + (products.find(p=>p.id===i.id).price * i.qty),0));
}

/* ============================================================
   TOAST NOTIFICATION (bawah kanan)
============================================================ */
function showToast(text){
  const t = document.createElement("div");
  t.className = "toast-box";
  t.textContent = text;
  document.body.appendChild(t);

  setTimeout(()=> t.classList.add("show"), 10);
  setTimeout(()=>{
    t.classList.remove("show");
    setTimeout(()=>t.remove(),300);
  }, 2500);
}

/* ============================================================
   THEME: DARK / LIGHT
============================================================ */
let theme = localStorage.getItem("ss_theme") || "light";

function applyTheme(mode){
  if(mode==="dark"){
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  localStorage.setItem("ss_theme", mode);
}

document.getElementById("theme-toggle").addEventListener("click",()=>{
  theme = theme==="dark" ? "light" : "dark";
  applyTheme(theme);
});

/* ============================================================
   SEARCH & FILTER
============================================================ */
const searchInput = document.getElementById("search-input");

searchInput.addEventListener("input", ()=>{
  const activeCat = document.querySelector(".filter-btn.active")?.dataset.cat || "all";
  renderProducts({ search: searchInput.value, category: activeCat });
});

document.getElementById("category-filters").addEventListener("click", e=>{
  const btn = e.target.closest(".filter-btn");
  if(!btn) return;

  document.querySelectorAll(".filter-btn").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");

  renderProducts({ search: searchInput.value, category: btn.dataset.cat });
});

/* ============================================================
   CART PANEL OPEN / CLOSE
============================================================ */
document.getElementById("cart-btn").addEventListener("click",()=>{
  document.getElementById("cart-panel").classList.add("open");
  document.getElementById("panel-overlay").classList.add("show");
  renderCartPanel();
});

document.getElementById("cart-close").addEventListener("click",()=>{
  document.getElementById("cart-panel").classList.remove("open");
  document.getElementById("panel-overlay").classList.remove("show");
});

/* ============================================================
   CONTACT FORM
============================================================ */
const contactForm = document.getElementById("contact-form");
if(contactForm){
  contactForm.addEventListener("submit", e=>{
    e.preventDefault();
    if(!contactForm.name.value || !contactForm.email.value || !contactForm.message.value){
      showToast("Lengkapi form dulu!");
      return;
    }
    showToast("Pesan berhasil dikirim ✓");
    contactForm.reset();
  });
}

/* ============================================================
   INIT
============================================================ */
(function init(){
  applyTheme(theme);
  updateCartCounter();
  renderProducts();
  renderCartPanel();
})();

/* ============================================================
   CHECKOUT PANEL OPEN / CLOSE
============================================================ */
const checkoutPanel = document.getElementById("checkout-panel");
const checkoutClose = document.getElementById("checkout-close");
const btnCheckout = document.getElementById("btn-checkout");

btnCheckout.addEventListener("click", () => {
  if (cart.length === 0) {
    showToast("Keranjang masih kosong!");
    return;
  }

  // Hitung subtotal
  const subtotal = cart.reduce((s, i) => {
    const p = products.find(pp => pp.id === i.id);
    return s + (p.price * i.qty);
  }, 0);

  document.getElementById("checkout-subtotal").textContent = formatRupiah(subtotal);

  // Ongkir tetap (bisa kamu ganti)
  const shippingCost = 20000;
  document.getElementById("checkout-shipping").textContent = formatRupiah(shippingCost);

  document.getElementById("checkout-total").textContent = formatRupiah(subtotal + shippingCost);

  checkoutPanel.classList.add("open");
  document.getElementById("panel-overlay").classList.add("show");
});

checkoutClose.addEventListener("click", () => {
  checkoutPanel.classList.remove("open");
  document.getElementById("panel-overlay").classList.remove("show");
});

/* ============================================================
   CHECKOUT SUBMIT
============================================================ */
const checkoutForm = document.getElementById("checkout-form");

checkoutForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Validasi form sederhana
  const data = new FormData(checkoutForm);
  for (const v of data.values()) {
    if (!v) {
      showToast("Lengkapi semua data checkout!");
      return;
    }
  }

  // Reset keranjang setelah pembayaran
  cart = [];
  saveCart();
  renderCartPanel();

  // Tutup panel checkout
  checkoutPanel.classList.remove("open");
  document.getElementById("panel-overlay").classList.remove("show");

  // Tampilkan popup sukses
  document.getElementById("success-modal").setAttribute("aria-hidden", false);

});

/* ============================================================
   SUCCESS POPUP CLOSE
============================================================ */
document.getElementById("success-ok").addEventListener("click", () => {
  document.getElementById("success-modal").setAttribute("aria-hidden", true);
});

/* ============================================================
   POPUP PEMBAYARAN BERHASIL
============================================================ */
const successModal = document.getElementById("success-modal");
const successOk = document.getElementById("success-ok");

// Tampilkan popup
function showSuccessPopup() {
  successModal.classList.add("show");
}

// Tombol OK menutup popup
successOk.addEventListener("click", () => {
  successModal.classList.remove("show");
});

/* Integrasi dengan checkout */
document.getElementById("checkout-form").addEventListener("submit", function (e) {
  e.preventDefault();

  // Tutup panel checkout
  document.getElementById("checkout-panel").classList.remove("open");
  document.getElementById("panel-overlay").classList.remove("show");

  // Tampilkan popup berhasil
  showSuccessPopup();

  // Reset keranjang agar 0 setelah transaksi
  cart = [];
  updateCartUI();
});