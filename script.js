const products = [
  {
    id: 1,
    name: "Everyday Canvas Backpack",
    category: "Fashion",
    price: 64,
    rating: 4.8,
    badge: "Bestseller",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 2,
    name: "Wireless Noise-Cancel Headphones",
    category: "Tech",
    price: 129,
    rating: 4.7,
    badge: "New",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 3,
    name: "Minimal Ceramic Coffee Set",
    category: "Home",
    price: 38,
    rating: 4.6,
    badge: "Gift pick",
    image: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 4,
    name: "Trail Runner Sneakers",
    category: "Fashion",
    price: 92,
    rating: 4.9,
    badge: "Hot",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 5,
    name: "Smart Desk Lamp",
    category: "Home",
    price: 56,
    rating: 4.5,
    badge: "Save 15%",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 6,
    name: "Stainless Steel Water Bottle",
    category: "Fitness",
    price: 28,
    rating: 4.7,
    badge: "Eco",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 7,
    name: "Compact Mechanical Keyboard",
    category: "Tech",
    price: 84,
    rating: 4.8,
    badge: "Popular",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 8,
    name: "Yoga Mat With Carry Strap",
    category: "Fitness",
    price: 42,
    rating: 4.4,
    badge: "Soft grip",
    image: "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&w=900&q=80"
  }
];

const state = {
  activeCategory: "All",
  query: "",
  sort: "featured",
  cart: new Map()
};

const categoryFilters = document.querySelector("#categoryFilters");
const productGrid = document.querySelector("#productGrid");
const searchInput = document.querySelector("#searchInput");
const sortSelect = document.querySelector("#sortSelect");
const cartToggle = document.querySelector("#cartToggle");
const closeCart = document.querySelector("#closeCart");
const cartPanel = document.querySelector("#cartPanel");
const overlay = document.querySelector("#overlay");
const cartItems = document.querySelector("#cartItems");
const cartCount = document.querySelector("#cartCount");
const subtotal = document.querySelector("#subtotal");
const shipping = document.querySelector("#shipping");
const total = document.querySelector("#total");
const checkoutButton = document.querySelector("#checkoutButton");

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

function getCategories() {
  return ["All", ...new Set(products.map((product) => product.category))];
}

function renderCategories() {
  categoryFilters.innerHTML = getCategories()
    .map((category) => {
      const active = category === state.activeCategory ? " active" : "";
      return `<button class="filter-chip${active}" type="button" data-category="${category}">${category}</button>`;
    })
    .join("");
}

function getVisibleProducts() {
  const query = state.query.trim().toLowerCase();
  let visible = products.filter((product) => {
    const categoryMatch = state.activeCategory === "All" || product.category === state.activeCategory;
    const queryMatch = product.name.toLowerCase().includes(query) || product.category.toLowerCase().includes(query);
    return categoryMatch && queryMatch;
  });

  if (state.sort === "low") {
    visible = [...visible].sort((a, b) => a.price - b.price);
  } else if (state.sort === "high") {
    visible = [...visible].sort((a, b) => b.price - a.price);
  } else if (state.sort === "rating") {
    visible = [...visible].sort((a, b) => b.rating - a.rating);
  }

  return visible;
}

function renderProducts() {
  const visibleProducts = getVisibleProducts();

  if (visibleProducts.length === 0) {
    productGrid.innerHTML = `<p class="empty-state">No products match your search.</p>`;
    return;
  }

  productGrid.innerHTML = visibleProducts
    .map((product) => {
      return `
        <article class="product-card">
          <div class="product-image">
            <img src="${product.image}" alt="${product.name}">
            <span class="badge">${product.badge}</span>
          </div>
          <div class="product-info">
            <div class="product-meta">
              <span>${product.category}</span>
              <span>${product.rating} rating</span>
            </div>
            <h3>${product.name}</h3>
            <div class="price-row">
              <span class="price">${currency.format(product.price)}</span>
              <button class="add-button" type="button" data-add="${product.id}">Add</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function getCartLines() {
  return [...state.cart.entries()].map(([id, quantity]) => {
    const product = products.find((item) => item.id === id);
    return { ...product, quantity };
  });
}

function renderCart() {
  const lines = getCartLines();
  const itemCount = lines.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalValue = lines.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingValue = subtotalValue > 0 && subtotalValue < 100 ? 8 : 0;
  const totalValue = subtotalValue + shippingValue;

  cartCount.textContent = itemCount;
  subtotal.textContent = currency.format(subtotalValue);
  shipping.textContent = shippingValue === 0 ? "Free" : currency.format(shippingValue);
  total.textContent = currency.format(totalValue);
  checkoutButton.disabled = itemCount === 0;

  if (lines.length === 0) {
    cartItems.innerHTML = `<p class="empty-state">Your cart is empty.</p>`;
    return;
  }

  cartItems.innerHTML = lines
    .map((item) => {
      return `
        <article class="cart-item">
          <img src="${item.image}" alt="${item.name}">
          <div>
            <h3>${item.name}</h3>
            <div class="cart-line">
              <span>${currency.format(item.price)}</span>
              <div class="quantity" aria-label="Quantity for ${item.name}">
                <button type="button" data-decrease="${item.id}" aria-label="Decrease quantity">-</button>
                <span>${item.quantity}</span>
                <button type="button" data-increase="${item.id}" aria-label="Increase quantity">+</button>
              </div>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function addToCart(id) {
  const current = state.cart.get(id) || 0;
  state.cart.set(id, current + 1);
  renderCart();
  openCart();
}

function updateQuantity(id, change) {
  const next = (state.cart.get(id) || 0) + change;
  if (next <= 0) {
    state.cart.delete(id);
  } else {
    state.cart.set(id, next);
  }
  renderCart();
}

function openCart() {
  cartPanel.classList.add("open");
  overlay.classList.add("show");
  cartToggle.setAttribute("aria-expanded", "true");
}

function closeCartPanel() {
  cartPanel.classList.remove("open");
  overlay.classList.remove("show");
  cartToggle.setAttribute("aria-expanded", "false");
}

categoryFilters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  state.activeCategory = button.dataset.category;
  renderCategories();
  renderProducts();
});

productGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add]");
  if (!button) return;
  addToCart(Number(button.dataset.add));
});

cartItems.addEventListener("click", (event) => {
  const increase = event.target.closest("[data-increase]");
  const decrease = event.target.closest("[data-decrease]");

  if (increase) updateQuantity(Number(increase.dataset.increase), 1);
  if (decrease) updateQuantity(Number(decrease.dataset.decrease), -1);
});

searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  renderProducts();
});

sortSelect.addEventListener("change", (event) => {
  state.sort = event.target.value;
  renderProducts();
});

cartToggle.addEventListener("click", openCart);
closeCart.addEventListener("click", closeCartPanel);
overlay.addEventListener("click", closeCartPanel);

checkoutButton.addEventListener("click", () => {
  if (state.cart.size === 0) return;
  alert("Demo checkout complete. Thanks for shopping with UrbanCart!");
  state.cart.clear();
  renderCart();
  closeCartPanel();
});

renderCategories();
renderProducts();
renderCart();
