const SHIPPING_FEE = 50;

const PRODUCTS = [
    {
        id: "koj-black",
        name: "Black",
        price: 125,
        image: "images/koj-tee-black.jpg",
        alt: "تيشيرت Koj أسود بقصة  وخياطة منحنية وشعار ذهبي"
    },
    {
        id: "koj-white",
        name: " White",
        price: 125,
        image: "images/koj-tee-white.jpg",
        alt: "تيشيرت Koj أبيض بقصة بوكسي وخياطة منحنية وشعار Koj"
    },
    {
        id: "koj-olive",
        name: "Black",
        price: 125,
        image: "images/koj-tee-olive.jpg",
        alt: "تيشيرت Koj زيتي بقصة أوفرسايز وخياطة منحنية"
    }
];

const SIZES = ["S", "M", "L", "XL"];

const GOVERNORATES = [
    "القاهرة", "الجيزة", "الإسكندرية", "القليوبية", "الشرقية", "الدقهلية",
    "البحيرة", "المنوفية", "الغربية", "كفر الشيخ", "دمياط", "بورسعيد",
    "الإسماعيلية", "السويس", "شمال سيناء", "جنوب سيناء", "الفيوم", "بني سويف",
    "المنيا", "أسيوط", "سوهاج", "قنا", "الأقصر", "أسوان", "البحر الأحمر",
    "الوادي الجديد", "مطروح"
];

const PAYMENT_LABELS = {
    cod: "الدفع عند الاستلام",
    instapay: "Instapay",
    card: "بطاقة ائتمان",
    vodafone: "Vodafone Cash"
};

const cart = [];
let lastOrder = null;

const els = {
    grid: document.getElementById("products-grid"),
    cartCount: document.getElementById("cart-count"),
    cartItems: document.getElementById("cart-items"),
    cartSummary: document.getElementById("cart-summary"),
    drawer: document.getElementById("cart-drawer"),
    overlay: document.getElementById("overlay"),
    checkoutModal: document.getElementById("checkout-modal"),
    confirmModal: document.getElementById("confirm-modal"),
    checkoutTotals: document.getElementById("checkout-totals"),
    orderId: document.getElementById("order-id"),
    orderSummary: document.getElementById("order-summary"),
    form: document.getElementById("checkout-form"),
    navToggle: document.getElementById("nav-toggle"),
    navLinks: document.getElementById("nav-links")
};

function money(value) {
    return `${value} ج.م`;
}

function cartQty() {
    return cart.reduce((sum, item) => sum + item.qty, 0);
}

function subtotal() {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function shipping() {
    return cart.length ? SHIPPING_FEE : 0;
}

function grandTotal() {
    return subtotal() + shipping();
}

function findCartItem(productId, size) {
    return cart.find((item) => item.id === productId && item.size === size);
}

function renderProducts() {
    els.grid.innerHTML = PRODUCTS.map((product) => `
        <article class="product-card" data-id="${product.id}">
            <img src="${product.image}" alt="${product.alt}">
            <div class="product-body">
                <h3>${product.name}</h3>
                <p class="price">${money(product.price)}</p>
                <div class="size-row">
                    <span>المقاس</span>
                    <select class="size-select" aria-label="المقاس">
                        ${SIZES.map((size) => `<option value="${size}">${size}</option>`).join("")}
                    </select>
                </div>
                <div class="qty-row">
                    <span>الكمية</span>
                    <input class="qty-input" type="number" min="1" max="10" value="1">
                </div>
                <button class="btn-primary full add-cart" type="button">Add to Cart</button>
                <button class="btn-ghost order-direct" type="button">Order Now</button>
            </div>
        </article>
    `).join("");
}

function fillGovernorates() {
    const select = els.form.governorate;
    GOVERNORATES.forEach((name) => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    });
}

function addToCart(productId, size, qty) {
    const product = PRODUCTS.find((item) => item.id === productId);
    if (!product) return;

    const existing = findCartItem(productId, size);
    if (existing) {
        existing.qty = Math.min(10, existing.qty + qty);
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            size,
            qty
        });
    }
    renderCart();
}

function updateQty(index, delta) {
    cart[index].qty += delta;
    if (cart[index].qty < 1) cart.splice(index, 1);
    renderCart();
}

function removeItem(index) {
    cart.splice(index, 1);
    renderCart();
}

function renderCart() {
    els.cartCount.textContent = cartQty();

    if (!cart.length) {
        els.cartItems.innerHTML = `<p class="empty-msg">السلة فارغة حالياً</p>`;
        els.cartSummary.innerHTML = "";
        document.getElementById("order-now").disabled = true;
        return;
    }

    document.getElementById("order-now").disabled = false;
    els.cartItems.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div>
                <h4>${item.name}</h4>
                <p>المقاس ${item.size} · ${money(item.price)}</p>
                <div class="qty-controls">
                    <button type="button" data-qty="${index}" data-delta="-1">−</button>
                    <span>${item.qty}</span>
                    <button type="button" data-qty="${index}" data-delta="1">+</button>
                </div>
                <button class="remove-btn" type="button" data-remove="${index}">حذف</button>
            </div>
            <strong>${money(item.price * item.qty)}</strong>
        </div>
    `).join("");

    const summaryHtml = `
        <div class="summary-row"><span>المجموع الفرعي</span><span>${money(subtotal())}</span></div>
        <div class="summary-row"><span>الشحن</span><span>${money(shipping())}</span></div>
        <div class="summary-row total"><span>الإجمالي</span><span>${money(grandTotal())}</span></div>
    `;
    els.cartSummary.innerHTML = summaryHtml;
    els.checkoutTotals.innerHTML = summaryHtml;
}

function openCart() {
    els.drawer.classList.add("open");
    els.drawer.setAttribute("aria-hidden", "false");
    els.overlay.hidden = false;
}

function closeCart() {
    els.drawer.classList.remove("open");
    els.drawer.setAttribute("aria-hidden", "true");
    if (els.checkoutModal.hidden && els.confirmModal.hidden) {
        els.overlay.hidden = true;
    }
}

function openCheckout() {
    if (!cart.length) return;
    closeCart();
    els.overlay.hidden = false;
    els.checkoutModal.hidden = false;
    renderCart();
}

function closeCheckout() {
    els.checkoutModal.hidden = true;
    els.overlay.hidden = true;
}

function isValidEgyptianPhone(value) {
    return /^01[0125][0-9]{8}$/.test(value.trim());
}

function validateForm() {
    const { fullName, phone, address, governorate } = els.form;
    let valid = true;

    [fullName, phone, address, governorate].forEach((field) => {
        field.classList.remove("invalid");
        if (!field.value.trim()) {
            field.classList.add("invalid");
            valid = false;
        }
    });

    const phoneError = document.querySelector('[data-error-for="phone"]');
    if (!isValidEgyptianPhone(phone.value)) {
        phone.classList.add("invalid");
        phoneError.textContent = "أدخل رقم مصري صحيح مثل 01012345678";
        valid = false;
    } else {
        phoneError.textContent = "";
    }

    return valid;
}

function makeOrderId() {
    const stamp = Date.now().toString().slice(-6);
    return `KOJ-${stamp}`;
}

function completeOrder() {
    const data = new FormData(els.form);
    lastOrder = {
        id: makeOrderId(),
        name: data.get("fullName"),
        phone: data.get("phone"),
        governorate: data.get("governorate"),
        address: data.get("address"),
        payment: PAYMENT_LABELS[data.get("payment")],
        items: cart.map((item) => ({ ...item })),
        subtotal: subtotal(),
        shipping: shipping(),
        total: grandTotal()
    };

    els.orderId.textContent = lastOrder.id;
    els.orderSummary.innerHTML = `
        <p><strong>${lastOrder.name}</strong> · ${lastOrder.phone}</p>
        <p>${lastOrder.governorate} — ${lastOrder.address}</p>
        <p>الدفع: ${lastOrder.payment}</p>
        <hr style="margin:10px 0;border:0;border-top:1px solid #e7e1d8">
        ${lastOrder.items.map((item) => `<p>${item.name} / ${item.size} × ${item.qty} — ${money(item.price * item.qty)}</p>`).join("")}
        <p>شحن: ${money(lastOrder.shipping)}</p>
        <p><strong>الإجمالي: ${money(lastOrder.total)}</strong></p>
    `;

    cart.length = 0;
    renderCart();
    els.checkoutModal.hidden = true;
    els.form.reset();
    els.confirmModal.hidden = false;
    els.overlay.hidden = false;
}

function closeConfirm() {
    els.confirmModal.hidden = true;
    els.overlay.hidden = true;
}

function productAction(card) {
    const id = card.dataset.id;
    const size = card.querySelector(".size-select").value;
    const qty = Math.max(1, Number(card.querySelector(".qty-input").value) || 1);
    return { id, size, qty };
}

document.addEventListener("DOMContentLoaded", () => {
    renderProducts();
    fillGovernorates();
    renderCart();

    els.navToggle.addEventListener("click", () => {
        els.navLinks.classList.toggle("open");
    });

    document.getElementById("open-cart").addEventListener("click", openCart);
    document.getElementById("close-cart").addEventListener("click", closeCart);
    document.getElementById("overlay").addEventListener("click", () => {
        closeCart();
        closeCheckout();
        closeConfirm();
    });
    document.getElementById("close-checkout").addEventListener("click", closeCheckout);
    document.getElementById("close-confirm").addEventListener("click", closeConfirm);
    document.getElementById("order-now").addEventListener("click", openCheckout);

    els.grid.addEventListener("click", (event) => {
        const card = event.target.closest(".product-card");
        if (!card) return;
        const { id, size, qty } = productAction(card);

        if (event.target.classList.contains("add-cart")) {
            addToCart(id, size, qty);
            openCart();
        }

        if (event.target.classList.contains("order-direct")) {
            addToCart(id, size, qty);
            openCheckout();
        }
    });

    els.cartItems.addEventListener("click", (event) => {
        if (event.target.dataset.qty !== undefined) {
            updateQty(Number(event.target.dataset.qty), Number(event.target.dataset.delta));
        }
        if (event.target.dataset.remove !== undefined) {
            removeItem(Number(event.target.dataset.remove));
        }
    });

    els.form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!cart.length) {
            closeCheckout();
            openCart();
            return;
        }
        if (validateForm()) completeOrder();
    });
});
