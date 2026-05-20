
const products = [
    { id: 1, name: "NeuraCore AI DevKit", price: 18999, icon: "fa-microchip", desc: "Edge AI module with NPU" },
    { id: 2, name: "QuantumSync Keyboard", price: 4999, icon: "fa-keyboard", desc: "Wireless mechanical RGB" },
    { id: 3, name: "OmniView AR Glasses", price: 24999, icon: "fa-vr-cardboard", desc: "Smart AR specs 4K" },
    { id: 4, name: "CyberNode Router", price: 7999, icon: "fa-wifi", desc: "AI secured mesh router" },
    { id: 5, name: "Aethra AI Laptop", price: 84999, icon: "fa-laptop-code", desc: "Neural processing unit" },
    { id: 6, name: "Nexus Smart Dock", price: 3499, icon: "fa-plug", desc: "8-in-1 Thunderbolt Dock" },
    { id: 7, name: "Orion Wireless Earbuds", price: 5999, icon: "fa-headphones", desc: "ANC + AI noise cancellation" },
    { id: 8, name: "NovaStream Camera", price: 12999, icon: "fa-camera", desc: "4K AI webcam for creators" }
];

let cart = [];
let currentUser = null;
let orders = [];
let userAddresses = [];

// Helper functions
function getAddressKey() { return currentUser ? `mahiranext_addresses_${currentUser.email}` : null; }
function loadAddressesForUser() { if (!currentUser) { userAddresses = []; return; } const stored = localStorage.getItem(getAddressKey()); userAddresses = stored ? JSON.parse(stored) : []; }
function saveAddressesForUser() { if (currentUser) localStorage.setItem(getAddressKey(), JSON.stringify(userAddresses)); }
function saveData() { if (currentUser) localStorage.setItem('mahiranext_user', JSON.stringify(currentUser)); else localStorage.removeItem('mahiranext_user'); localStorage.setItem('mahiranext_orders', JSON.stringify(orders)); }
function loadData() { const savedUser = localStorage.getItem('mahiranext_user'); if (savedUser) { try { currentUser = JSON.parse(savedUser); } catch (e) { } } const savedOrders = localStorage.getItem('mahiranext_orders'); if (savedOrders) orders = JSON.parse(savedOrders); loadAddressesForUser(); updateAuthUI(); }

function showToast(msg) {
    const toast = document.createElement('div');
    toast.innerText = msg;
    toast.style.position = 'fixed';
    toast.style.bottom = '100px';
    toast.style.left = '20px';
    toast.style.backgroundColor = '#10b981';
    toast.style.color = 'white';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '44px';
    toast.style.zIndex = '1300';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

function updateAuthUI() {
    const headerDiv = document.getElementById('dropdownHeader');
    if (currentUser) {
        headerDiv.innerHTML = `<h4><i class="fas fa-user-circle"></i> ${currentUser.name}</h4><p>${currentUser.email}</p>`;
    } else {
        headerDiv.innerHTML = `<h4>Guest User</h4><p>Sign in for better experience</p>`;
    }
}

// MODAL: Authentication
function showAuthModal() {
    const modal = document.getElementById('genericModal');
    const content = document.getElementById('genericModalContent');
    content.innerHTML = `
        <h3><i class="fas fa-lock"></i> Welcome</h3>
        <div class="modal-sub">Login or Sign Up</div>
        <div class="form-group"><label>Email</label><input type="email" id="authEmail" placeholder="email@example.com"></div>
        <div class="form-group"><label>Password</label><input type="password" id="authPassword" placeholder="password"></div>
        <button class="btn-primary" id="authLoginBtn" style="width:100%;">Login</button>
        <div class="auth-switch" id="switchToSignup" style="text-align:center; margin-top:16px; color:#2563eb; cursor:pointer;">New user? Create account →</div>
    `;
    document.getElementById('authLoginBtn').onclick = () => {
        const email = document.getElementById('authEmail').value.trim();
        const pwd = document.getElementById('authPassword').value.trim();
        const users = JSON.parse(localStorage.getItem('mahiranext_users') || '[]');
        const user = users.find(u => u.email === email && u.password === pwd);
        if (user) {
            currentUser = user;
            loadAddressesForUser();
            saveData();
            updateAuthUI();
            modal.classList.remove('open');
            showToast(`Welcome ${user.name}`);
        } else alert("Invalid credentials");
    };
    document.getElementById('switchToSignup').onclick = () => {
        content.innerHTML = `
            <h3><i class="fas fa-user-plus"></i> Sign Up</h3>
            <div class="form-group"><label>Full Name</label><input type="text" id="signupName"></div>
            <div class="form-group"><label>Email</label><input type="email" id="signupEmail"></div>
            <div class="form-group"><label>Password</label><input type="password" id="signupPassword"></div>
            <button class="btn-primary" id="signupBtn">Sign Up</button>
            <div class="auth-switch" id="switchToLogin" style="text-align:center; margin-top:16px; color:#2563eb; cursor:pointer;">Already have an account? Login →</div>
        `;
        document.getElementById('signupBtn').onclick = () => {
            const name = document.getElementById('signupName').value.trim();
            const email = document.getElementById('signupEmail').value.trim();
            const pwd = document.getElementById('signupPassword').value.trim();
            if (!name || !email || !pwd) { alert("All fields required"); return; }
            const users = JSON.parse(localStorage.getItem('mahiranext_users') || '[]');
            if (users.find(u => u.email === email)) { alert("User exists"); return; }
            const newUser = { name, email, password: pwd };
            users.push(newUser);
            localStorage.setItem('mahiranext_users', JSON.stringify(users));
            currentUser = newUser;
            loadAddressesForUser();
            saveData();
            updateAuthUI();
            modal.classList.remove('open');
            showToast(`Welcome ${name}`);
        };
        document.getElementById('switchToLogin').onclick = () => showAuthModal();
    };
    modal.classList.add('open');
    modal.onclick = (e) => { if (e.target === modal) modal.classList.remove('open'); };
}

// ORDERS
function showOrders() {
    if (!currentUser) { showToast("Please login first"); showAuthModal(); return; }
    const userOrders = orders.filter(o => o.userEmail === currentUser.email);
    const content = `
        <h3><i class="fas fa-box"></i> My Orders</h3>
        ${userOrders.length === 0 ? '<div class="modal-sub">No orders yet. Start shopping!</div>' : userOrders.map(o => `
            <div class="order-item">
                <div><strong>Order #${o.id}</strong><br>Date: ${o.date}<br>Total: ₹${o.total.toLocaleString('en-IN')}<br>Status: ✅ Delivered<br>Items: ${o.items.map(i => i.name).join(', ')}</div>
            </div>
        `).join('')}
        <button class="btn-primary" id="closeOrderModal">Close</button>
    `;
    const modal = document.getElementById('genericModal');
    document.getElementById('genericModalContent').innerHTML = content;
    modal.classList.add('open');
    document.getElementById('closeOrderModal').onclick = () => modal.classList.remove('open');
    modal.onclick = (e) => { if (e.target === modal) modal.classList.remove('open'); };
}

// ADDRESSES
function showAddressesModal() {
    if (!currentUser) { showToast("Login first"); showAuthModal(); return; }
    const render = () => {
        const container = document.getElementById('genericModalContent');
        container.innerHTML = `
            <h3><i class="fas fa-map-marker-alt"></i> Saved Addresses</h3>
            ${userAddresses.length === 0 ? '<div class="modal-sub">No saved addresses.</div>' : userAddresses.map((a, i) => `
                <div class="address-item">
                    <div><strong>${a.fullName}</strong><br>${a.addressLine}, ${a.city}, ${a.state} - ${a.pincode}<br>📞 ${a.phone}</div>
                    <button class="remove-addr-btn" data-idx="${i}" style="background:#fee2e2; border:none; border-radius:30px; padding:5px 12px;">Remove</button>
                </div>
            `).join('')}
            <button class="btn-primary" id="addNewAddressBtn" style="width:100%; margin-top:12px;">+ Add New Address</button>
            <button class="btn-primary" id="closeAddrModal" style="background:#64748b; margin-top:12px;">Close</button>
        `;
        document.querySelectorAll('.remove-addr-btn').forEach(btn => {
            btn.onclick = () => {
                const idx = parseInt(btn.dataset.idx);
                userAddresses.splice(idx, 1);
                saveAddressesForUser();
                render();
                showToast("Address removed");
            };
        });
        document.getElementById('addNewAddressBtn').onclick = () => showAddressForm();
        document.getElementById('closeAddrModal').onclick = () => document.getElementById('genericModal').classList.remove('open');
    };
    const modal = document.getElementById('genericModal');
    render();
    modal.classList.add('open');
    modal.onclick = (e) => { if (e.target === modal) modal.classList.remove('open'); };
}

function showAddressForm() {
    const modal = document.getElementById('genericModal');
    const cont = document.getElementById('genericModalContent');
    cont.innerHTML = `
        <h3>Add New Address</h3>
        <div class="form-group"><label>Full Name</label><input id="addrName" value="${currentUser?.name || ''}"></div>
        <div class="form-group"><label>Phone</label><input id="addrPhone"></div>
        <div class="form-group"><label>Address</label><textarea id="addrLine" rows="2"></textarea></div>
        <div class="form-row"><div class="form-group"><label>City</label><input id="addrCity"></div><div class="form-group"><label>State</label><input id="addrState"></div></div>
        <div class="form-row"><div class="form-group"><label>Pincode</label><input id="addrPincode"></div></div>
        <button class="btn-primary" id="saveAddrModalBtn">Save Address</button>
        <button class="btn-primary" id="cancelAddrBtn" style="background:#64748b; margin-top:12px;">Cancel</button>
    `;
    modal.classList.add('open');
    document.getElementById('saveAddrModalBtn').onclick = () => {
        const fullName = document.getElementById('addrName').value.trim();
        const phone = document.getElementById('addrPhone').value.trim();
        const addressLine = document.getElementById('addrLine').value.trim();
        const city = document.getElementById('addrCity').value.trim();
        const state = document.getElementById('addrState').value.trim();
        const pincode = document.getElementById('addrPincode').value.trim();
        if (!fullName || !phone || !addressLine || !city || !state || !pincode) { alert("Fill all fields"); return; }
        userAddresses.push({ fullName, phone, addressLine, city, state, pincode, country: "India" });
        saveAddressesForUser();
        modal.classList.remove('open');
        showAddressesModal();
        showToast("Address saved");
    };
    document.getElementById('cancelAddrBtn').onclick = () => { modal.classList.remove('open'); showAddressesModal(); };
}

// SETTINGS
function showSettingsModal() {
    if (!currentUser) { showToast("Login required"); showAuthModal(); return; }
    const modal = document.getElementById('genericModal');
    const cont = document.getElementById('genericModalContent');
    cont.innerHTML = `
        <h3>Account Settings</h3>
        <div class="form-group"><label>Full Name</label><input id="settingsName" value="${currentUser.name}"></div>
        <div class="form-group"><label>Email</label><input id="settingsEmail" value="${currentUser.email}" readonly style="background:#f1f5f9;"></div>
        <div class="form-group"><label>New Password</label><input type="password" id="settingsPwd" placeholder="Leave blank to keep"></div>
        <button class="btn-primary" id="updateSettingsBtn">Update Profile</button>
        <button id="closeSettingsBtn" class="btn-primary" style="background:#64748b; margin-top:12px;">Close</button>
    `;
    modal.classList.add('open');
    document.getElementById('updateSettingsBtn').onclick = () => {
        const newName = document.getElementById('settingsName').value.trim();
        const newPwd = document.getElementById('settingsPwd').value.trim();
        if (newName) currentUser.name = newName;
        if (newPwd) currentUser.password = newPwd;
        const users = JSON.parse(localStorage.getItem('mahiranext_users') || '[]');
        const idx = users.findIndex(u => u.email === currentUser.email);
        if (idx !== -1) users[idx] = currentUser;
        localStorage.setItem('mahiranext_users', JSON.stringify(users));
        saveData();
        updateAuthUI();
        showToast("Profile updated");
        modal.classList.remove('open');
    };
    document.getElementById('closeSettingsBtn').onclick = () => modal.classList.remove('open');
}

function showLanguageModal() {
    const modal = document.getElementById('genericModal');
    document.getElementById('genericModalContent').innerHTML = `
        <h3>Select Language</h3>
        <div class="lang-option active" data-lang="en"><span>English</span><i class="fas fa-check-circle" style="color:#2563eb;"></i></div>
        <div class="lang-option" data-lang="hi"><span>हिन्दी (Hindi)</span><span class="badge">Coming Soon</span></div>
        <button class="btn-primary" id="closeLangBtn">Close</button>
    `;
    modal.classList.add('open');
    document.getElementById('closeLangBtn').onclick = () => modal.classList.remove('open');
}

// CART
function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').innerText = totalItems;
    renderCartSidebar();
}
function renderCartSidebar() {
    const container = document.getElementById('cartItemsList');
    if (!cart.length) {
        container.innerHTML = '<div style="text-align:center; padding:20px;"><i class="fas fa-bag-shopping"></i> Cart is empty</div>';
        document.getElementById('cartTotalDisplay').innerHTML = 'Total: ₹0';
        return;
    }
    let html = '', total = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        html += `<div class="cart-item"><div><strong>${item.name}</strong> x${item.quantity}</div><div>₹${itemTotal.toLocaleString('en-IN')} <button class="remove-item-btn" data-id="${item.id}" style="background:#fee2e2; border:none; border-radius:30px; margin-left:12px; padding:5px 12px;"><i class="fas fa-trash-alt"></i></button></div></div>`;
    });
    container.innerHTML = html;
    document.getElementById('cartTotalDisplay').innerHTML = `Total: ₹${total.toLocaleString('en-IN')}`;
    document.querySelectorAll('.remove-item-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const idx = cart.findIndex(i => i.id === id);
            if (idx !== -1) {
                if (cart[idx].quantity > 1) cart[idx].quantity--;
                else cart.splice(idx, 1);
                updateCartUI();
                saveCart();
                showToast("Cart updated");
            }
        });
    });
}
function addToCart(product) {
    const existing = cart.find(item => item.id === product.id);
    if (existing) existing.quantity++;
    else cart.push({ ...product, quantity: 1 });
    updateCartUI();
    saveCart();
    showToast(`✓ ${product.name} added`);
}
function saveCart() { localStorage.setItem('mahiranext_cart', JSON.stringify(cart)); }
function loadCart() { const saved = localStorage.getItem('mahiranext_cart'); if (saved) cart = JSON.parse(saved); updateCartUI(); }
function getCartTotal() { return cart.reduce((sum, i) => sum + (i.price * i.quantity), 0); }

// CHECKOUT
function showCheckoutAddressSelection() {
    if (!currentUser) { showToast("Please login to checkout"); showAuthModal(); return; }
    const modal = document.getElementById('checkoutModal');
    const content = document.getElementById('modalContent');
    let addressHtml = userAddresses.map((addr, i) => `<label style="display:flex; align-items:center; gap:12px; margin-bottom:12px; background:#f8fafc; padding:12px; border-radius:20px;"><input type="radio" name="selAddr" value="${i}"><div><strong>${addr.fullName}</strong><br>${addr.addressLine}, ${addr.city} - ${addr.pincode}<br>📞 ${addr.phone}</div></label>`).join('');
    content.innerHTML = `
        <h3>Delivery Address</h3>
        ${userAddresses.length > 0 ? `<div>${addressHtml}</div><button class="btn-primary" id="useSelectedAddrBtn">Use Selected Address</button><hr style="margin:16px 0">` : ''}
        <button id="enterNewAddrCheckoutBtn" class="btn-primary" style="background:#334155;">+ Enter New Address</button>
        <button class="close-modal-btn" id="closeCheckoutModalBtn" style="margin-top:12px; background:#64748b;">Cancel</button>
    `;
    modal.classList.add('open');
    if (userAddresses.length) document.getElementById('useSelectedAddrBtn').addEventListener('click', () => {
        const selected = document.querySelector('input[name="selAddr"]:checked');
        if (!selected) { alert("Select an address"); return; }
        const addr = userAddresses[parseInt(selected.value)];
        proceedToPayment(addr);
    });
    document.getElementById('enterNewAddrCheckoutBtn').addEventListener('click', showNewAddressFormForCheckout);
    document.getElementById('closeCheckoutModalBtn').addEventListener('click', () => modal.classList.remove('open'));
}
function showNewAddressFormForCheckout() {
    const modal = document.getElementById('checkoutModal');
    const content = document.getElementById('modalContent');
    content.innerHTML = `
        <h3>Enter Address</h3>
        <div class="form-group"><label>Full Name</label><input id="newAddrName" value="${currentUser.name}"></div>
        <div class="form-group"><label>Phone</label><input id="newAddrPhone"></div>
        <div class="form-group"><label>Address</label><textarea id="newAddrLine" rows="2"></textarea></div>
        <div class="form-row"><div class="form-group"><label>City</label><input id="newAddrCity"></div><div class="form-group"><label>State</label><input id="newAddrState"></div></div>
        <div class="form-row"><div class="form-group"><label>Pincode</label><input id="newAddrPincode"></div></div>
        <button class="btn-primary" id="saveNewAddrAndPayBtn">Save & Continue</button>
        <button class="btn-primary" id="backToAddrSelectionBtn" style="background:#64748b;">Back</button>
    `;
    document.getElementById('saveNewAddrAndPayBtn').onclick = () => {
        const fullName = document.getElementById('newAddrName').value.trim();
        const phone = document.getElementById('newAddrPhone').value.trim();
        const addressLine = document.getElementById('newAddrLine').value.trim();
        const city = document.getElementById('newAddrCity').value.trim();
        const state = document.getElementById('newAddrState').value.trim();
        const pincode = document.getElementById('newAddrPincode').value.trim();
        if (!fullName || !phone || !addressLine || !city || !state || !pincode) { alert("All fields required"); return; }
        const newAddr = { fullName, phone, addressLine, city, state, pincode, country: "India" };
        userAddresses.push(newAddr);
        saveAddressesForUser();
        proceedToPayment(newAddr);
    };
    document.getElementById('backToAddrSelectionBtn').onclick = () => showCheckoutAddressSelection();
}
function proceedToPayment(address) {
    window.tempCheckoutAddress = address;
    const modal = document.getElementById('checkoutModal');
    const total = getCartTotal();
    document.getElementById('modalContent').innerHTML = `
        <h3>Payment | Total: ₹${total.toLocaleString('en-IN')}</h3>
        <div class="payment-options">
            <button class="payment-btn cod" id="codPayment"><i class="fas fa-truck"></i> Cash on Delivery</button>
            <button class="payment-btn" id="upiPayment">UPI (Coming Soon)</button>
        </div>
        <button id="backToAddrFromPay" class="btn-primary" style="background:#64748b;">Back</button>
    `;
    document.getElementById('codPayment').onclick = processOrderFinal;
    document.getElementById('upiPayment').onclick = () => alert("Coming soon");
    document.getElementById('backToAddrFromPay').onclick = () => showCheckoutAddressSelection();
}
function processOrderFinal() {
    const total = getCartTotal();
    const orderId = 'MAHI-' + Date.now();
    const address = window.tempCheckoutAddress;
    const addressStr = `${address.fullName}, ${address.addressLine}, ${address.city} - ${address.pincode} | Ph: ${address.phone}`;
    orders.push({ id: orderId, date: new Date().toLocaleString(), total, items: [...cart], userEmail: currentUser.email, address: addressStr });
    localStorage.setItem('mahiranext_orders', JSON.stringify(orders));
    const modal = document.getElementById('checkoutModal');
    const content = document.getElementById('modalContent');
    content.innerHTML = `
        <div class="order-success">
            <i class="fas fa-check-circle" style="font-size:4rem; color:#10b981;"></i>
            <h2>Order Accepted!</h2>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <div style="background:#f8fafc; padding:16px; border-radius:20px;"><strong>Delivery:</strong><br>${addressStr}<br><strong>Total:</strong> ₹${total.toLocaleString('en-IN')}<br>Payment: Cash on Delivery</div>
            <button class="download-btn" id="downloadInvoiceBtn"><i class="fas fa-download"></i> Download Invoice</button>
            <button class="btn-primary" id="closeSuccessBtn">Continue Shopping</button>
        </div>
    `;
    document.getElementById('downloadInvoiceBtn').onclick = () => {
        const itemsText = cart.map(i => `${i.name} x${i.quantity} = ₹${(i.price * i.quantity).toLocaleString('en-IN')}`).join('\n');
        const invoice = `MAHIRANEXT TECHNOLOGIES\nGST: 36AAUCM4940Q1ZH\nOrder: ${orderId}\nDate: ${new Date().toLocaleString()}\nItems:\n${itemsText}\nTotal: ₹${total.toLocaleString('en-IN')}\nAddress: ${addressStr}\nThank you!`;
        const blob = new Blob([invoice], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Invoice_${orderId}.txt`;
        link.click();
        showToast("Invoice downloaded");
    };
    document.getElementById('closeSuccessBtn').onclick = () => {
        modal.classList.remove('open');
        cart = [];
        updateCartUI();
        saveCart();
        document.getElementById('cartSidebar').classList.remove('open');
        showToast("Order placed!");
    };
}

// PRODUCT RENDER
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';
    products.forEach(prod => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-img"><i class="fas ${prod.icon} fa-3x"></i></div>
            <div class="product-title">${prod.name}</div>
            <div class="product-desc">${prod.desc}</div>
            <div class="product-price">₹${prod.price.toLocaleString('en-IN')}</div>
            <button class="add-to-cart" data-id="${prod.id}"><i class="fas fa-cart-plus"></i> Add to Cart</button>
        `;
        grid.appendChild(card);
    });
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            const product = products.find(p => p.id === id);
            if (product) addToCart(product);
        });
    });
}

// Navigation
function scrollToSection(elementId, offset = 80) {
    const element = document.getElementById(elementId);
    if (element) {
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - offset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
}

function setActiveLink() {
    const sections = ['homeSection', 'platformSection', 'productsSection', 'contactSection'];
    const scrollPos = window.scrollY + 100;
    let activeId = 'homeLink';
    for (let section of sections) {
        const el = document.getElementById(section);
        if (el && el.offsetTop <= scrollPos) {
            activeId = section === 'homeSection' ? 'homeLink' :
                section === 'platformSection' ? 'solutionsLink' :
                    section === 'productsSection' ? 'shopLink' : 'contactLink';
        }
    }
    document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));
    const activeLink = document.getElementById(activeId);
    if (activeLink) activeLink.classList.add('active');
}

document.getElementById('homeLink').addEventListener('click', (e) => {
    e.preventDefault();
    scrollToSection('homeSection', 70);
});
document.getElementById('shopLink').addEventListener('click', (e) => {
    e.preventDefault();
    scrollToSection('productsSection', 70);
});
document.getElementById('solutionsLink').addEventListener('click', (e) => {
    e.preventDefault();
    scrollToSection('platformSection', 70);
});
document.getElementById('contactLink').addEventListener('click', (e) => {
    e.preventDefault();
    scrollToSection('contactSection', 70);
});

window.addEventListener('scroll', setActiveLink);

// Event listeners
document.getElementById('cartIconBtn').addEventListener('click', () => document.getElementById('cartSidebar').classList.add('open'));
document.getElementById('closeCartBtn').addEventListener('click', () => document.getElementById('cartSidebar').classList.remove('open'));
document.getElementById('cartOverlay').addEventListener('click', () => document.getElementById('cartSidebar').classList.remove('open'));
document.getElementById('checkoutBtn').addEventListener('click', () => { if (cart.length === 0) showToast("Cart empty"); else showCheckoutAddressSelection(); });
document.getElementById('profileBtn').addEventListener('click', (e) => { e.stopPropagation(); document.getElementById('profileDropdown').classList.toggle('open'); });
document.addEventListener('click', (e) => { if (!e.target.closest('.profile-container')) document.getElementById('profileDropdown').classList.remove('open'); });
document.getElementById('myOrdersBtn').onclick = () => { showOrders(); document.getElementById('profileDropdown').classList.remove('open'); };
document.getElementById('myAddressesBtn').onclick = () => { showAddressesModal(); document.getElementById('profileDropdown').classList.remove('open'); };
document.getElementById('languageBtn').onclick = () => { showLanguageModal(); document.getElementById('profileDropdown').classList.remove('open'); };
document.getElementById('settingsBtn').onclick = () => { showSettingsModal(); document.getElementById('profileDropdown').classList.remove('open'); };
document.getElementById('helpBtn').onclick = () => { showToast("📞 Support: +91 8977604602 | mahiranextt@gmail.com"); document.getElementById('profileDropdown').classList.remove('open'); };
document.getElementById('logoutBtn').onclick = () => { currentUser = null; userAddresses = []; localStorage.removeItem('mahiranext_user'); updateAuthUI(); showToast("Logged out"); document.getElementById('profileDropdown').classList.remove('open'); };
document.getElementById('exploreBtn').addEventListener('click', () => { scrollToSection('productsSection', 70); });

// ====================
// ENHANCED CHATBOT
// ====================
const chatToggle = document.getElementById('chatToggleBtn');
const chatWindow = document.getElementById('chatWindow');
const closeChatBtn = document.getElementById('closeChatBtn');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendChatBtn');
const chatOptionsDiv = document.getElementById('chatOptions');

const quickOptions = [
    { text: "📦 Products", value: "products", icon: "fa-box" },
    { text: "📋 My Orders", value: "orders", icon: "fa-truck" },
    { text: "📍 Address", value: "address", icon: "fa-map-marker-alt" },
    { text: "💳 Payment", value: "payment", icon: "fa-credit-card" },
    { text: "⚙️ Platform Services", value: "platform", icon: "fa-cogs" }
];

let isTyping = false;

function addBotMessage(text, showOptions = false) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'bot-msg';
    msgDiv.innerHTML = `<i class="fas fa-robot"></i> ${text}`;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    if (showOptions) setTimeout(() => showQuickOptions(), 300);
}

function addUserMessage(text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'user-msg';
    msgDiv.innerText = text;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
    if (isTyping) return;
    isTyping = true;
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.id = 'typingIndicator';
    indicator.innerHTML = '<span></span><span></span><span></span>';
    chatMessages.appendChild(indicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();
    isTyping = false;
}

function showQuickOptions() {
    chatOptionsDiv.innerHTML = '';
    quickOptions.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerHTML = `<i class="fas ${opt.icon}"></i> ${opt.text}`;
        btn.onclick = () => {
            addUserMessage(opt.text);
            chatOptionsDiv.style.display = 'none';
            handleChatResponse(opt.value);
        };
        chatOptionsDiv.appendChild(btn);
    });
    chatOptionsDiv.style.display = 'flex';
}

function handleChatResponse(topic) {
    showTypingIndicator();
    setTimeout(() => {
        hideTypingIndicator();
        let reply = "";
        switch (topic) {
            case "products":
                reply = `We offer ${products.length} premium AI & tech products: ${products.map(p => p.name).join(", ")}. Would you like me to show prices?`;
                addBotMessage(reply);
                setTimeout(() => {
                    chatOptionsDiv.innerHTML = '';
                    const priceBtn = document.createElement('button');
                    priceBtn.className = 'option-btn';
                    priceBtn.innerHTML = '<i class="fas fa-tag"></i> Show Prices';
                    priceBtn.onclick = () => {
                        addUserMessage("Show Prices");
                        showTypingIndicator();
                        setTimeout(() => {
                            hideTypingIndicator();
                            const priceList = products.map(p => `${p.name}: ₹${p.price.toLocaleString('en-IN')}`).join('\n');
                            addBotMessage(priceList);
                        }, 500);
                    };
                    chatOptionsDiv.appendChild(priceBtn);
                    chatOptionsDiv.style.display = 'flex';
                }, 300);
                break;
            case "orders":
                if (currentUser) reply = "You can view your past orders by clicking 'My Orders' in the profile menu. Would you like me to open it?";
                else reply = "Please login to view your orders. I can help you with the login process.";
                addBotMessage(reply);
                if (currentUser) {
                    setTimeout(() => {
                        chatOptionsDiv.innerHTML = '';
                        const openOrders = document.createElement('button');
                        openOrders.className = 'option-btn';
                        openOrders.innerHTML = '<i class="fas fa-box"></i> Open My Orders';
                        openOrders.onclick = () => { showOrders(); chatOptionsDiv.style.display = 'none'; };
                        chatOptionsDiv.appendChild(openOrders);
                        chatOptionsDiv.style.display = 'flex';
                    }, 500);
                } else {
                    setTimeout(() => {
                        chatOptionsDiv.innerHTML = '';
                        const loginBtn = document.createElement('button');
                        loginBtn.className = 'option-btn';
                        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login Now';
                        loginBtn.onclick = () => { showAuthModal(); chatOptionsDiv.style.display = 'none'; };
                        chatOptionsDiv.appendChild(loginBtn);
                        chatOptionsDiv.style.display = 'flex';
                    }, 500);
                }
                break;
            case "address":
                if (currentUser) reply = "You can manage your saved addresses in the profile → Saved Addresses. Need to add a new one?";
                else reply = "Please login first to manage your addresses.";
                addBotMessage(reply);
                if (currentUser) {
                    setTimeout(() => {
                        chatOptionsDiv.innerHTML = '';
                        const addrBtn = document.createElement('button');
                        addrBtn.className = 'option-btn';
                        addrBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i> Manage Addresses';
                        addrBtn.onclick = () => { showAddressesModal(); chatOptionsDiv.style.display = 'none'; };
                        chatOptionsDiv.appendChild(addrBtn);
                        chatOptionsDiv.style.display = 'flex';
                    }, 500);
                }
                break;
            case "payment":
                reply = "We support Cash on Delivery (COD) for all orders. UPI and card payments coming soon!";
                addBotMessage(reply);
                break;
            case "platform":
                reply = "MAHIRANEXT offers: Develop (custom software), Manage (24/7 governance), Operate (DevOps), Mobile/Web Apps, and AI services. Click on any card above to learn more!";
                addBotMessage(reply);
                break;
            default:
                reply = "I can help with products, orders, addresses, payments, or platform services. Select an option below or type your question!";
                addBotMessage(reply, true);
        }
    }, 800);
}

function processUserMessage(msg) {
    const lower = msg.toLowerCase().trim();
    if (lower === "hi" || lower === "hello" || lower === "hey") {
        addBotMessage("Hello! 👋 How can I assist you today?", true);
    }
    else if (lower.includes("product") || lower.includes("price") || lower.includes("device")) {
        handleChatResponse("products");
    }
    else if (lower.includes("order")) {
        handleChatResponse("orders");
    }
    else if (lower.includes("address")) {
        handleChatResponse("address");
    }
    else if (lower.includes("payment") || lower.includes("cod")) {
        handleChatResponse("payment");
    }
    else if (lower.includes("platform") || lower.includes("develop") || lower.includes("manage") || lower.includes("operate") || lower.includes("ai service")) {
        handleChatResponse("platform");
    }
    else {
        addBotMessage("I'm not sure about that. Please select one of the options below or ask about products, orders, addresses, payment, or platform services.", true);
    }
}

function sendChatMessage() {
    const msg = chatInput.value.trim();
    if (!msg) return;
    addUserMessage(msg);
    chatInput.value = '';
    chatOptionsDiv.style.display = 'none';
    processUserMessage(msg);
}

function openChat() {
    chatWindow.classList.add('open-chat');
    const lastMsg = chatMessages.lastElementChild;
    if (lastMsg && lastMsg.classList.contains('bot-msg') && lastMsg.innerText.includes("Hello! I'm MAHIRANEXT assistant")) {
        showQuickOptions();
    } else {
        if (chatOptionsDiv.style.display !== 'flex') showQuickOptions();
    }
}

chatToggle.addEventListener('click', openChat);
closeChatBtn.addEventListener('click', () => {
    chatWindow.classList.remove('open-chat');
    chatOptionsDiv.style.display = 'none';
});
sendBtn.addEventListener('click', sendChatMessage);
chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendChatMessage(); });

// ====================
// DIGITAL PLATFORM ECOSYSTEM - INTERACTIVE DETAILS
// ====================
const platformGridElem = document.getElementById('platformGrid');
const platformDetailsDiv = document.getElementById('platformDetails');
const detailsContent = document.getElementById('detailsContent');
const backBtn = document.getElementById('backToPlatformBtn');

const serviceDetails = {
    develop: {
        title: "Develop – Custom Software & AI Apps",
        badge: "End-to-End Development",
        description: "We build scalable, future-ready digital platforms tailored to your business needs. Our development process combines agile methodologies with cutting-edge technologies to deliver high-performance solutions.",
        uses: [
            "Custom enterprise software (ERP, CRM, SCM)",
            "AI-powered web & mobile applications",
            "Scalable e‑commerce platforms",
            "API-first microservices architecture",
            "Real-time data processing systems"
        ],
        process: "1. Discovery & Requirement Analysis → 2. UI/UX Design → 3. Agile Development (sprints) → 4. QA & Security Testing → 5. Deployment & CI/CD → 6. Post-launch Support"
    },
    manage: {
        title: "Manage – 24/7 Platform Governance",
        badge: "Operational Excellence",
        description: "We ensure your digital assets run smoothly with proactive monitoring, governance frameworks, and performance optimization. Our management services reduce downtime and improve user satisfaction.",
        uses: [
            "Platform health monitoring & alerting",
            "Security & compliance management",
            "User access control & role governance",
            "Database & server optimization",
            "SLA-driven incident response"
        ],
        process: "1. Infrastructure Audit → 2. Implement Monitoring Stack → 3. Define Governance Policies → 4. Automated Backups & DR → 5. Continuous Performance Tuning → 6. Monthly Reporting"
    },
    operate: {
        title: "Operate – DevOps & Cloud Orchestration",
        badge: "Reliability at Scale",
        description: "We operate your infrastructure with industry‑best DevOps practices, ensuring high availability, auto‑scaling, and cost efficiency across AWS, Azure, or GCP.",
        uses: [
            "Kubernetes & container orchestration",
            "Infrastructure as Code (Terraform)",
            "Automated CI/CD pipelines",
            "Cloud cost optimization",
            "Disaster recovery automation"
        ],
        process: "1. Cloud Assessment → 2. Architecture Design → 3. Setup CI/CD & IaC → 4. Security Hardening → 5. 24/7 SRE Support → 6. Regular Load Testing"
    },
    mobile: {
        title: "Mobile & Web Apps – Cross-Platform Experiences",
        badge: "Native & Hybrid Excellence",
        description: "We develop high‑performance mobile and web applications that work seamlessly across iOS, Android, and modern browsers, using React Native, Flutter, or PWA technologies.",
        uses: [
            "Consumer apps (iOS/Android)",
            "Progressive Web Apps (PWA)",
            "Cross‑platform business dashboards",
            "Offline‑first mobile experiences",
            "App store deployment & maintenance"
        ],
        process: "1. User Journey Mapping → 2. Prototyping → 3. Native/Hybrid Development → 4. Beta Testing (TestFlight/Internal) → 5. App Store Submission → 6. Post‑Launch Analytics"
    },
    ai: {
        title: "AI Technology Services – ML Integration & Automation",
        badge: "Intelligent Solutions",
        description: "We embed artificial intelligence into your workflows, from predictive analytics to natural language processing, helping you make data‑driven decisions and automate complex tasks.",
        uses: [
            "Custom LLM integration (chatbots, search)",
            "Computer vision for quality inspection",
            "Recommendation engines (e‑commerce)",
            "Predictive maintenance & forecasting",
            "Sentiment analysis & customer insight"
        ],
        process: "1. Data Collection & Cleaning → 2. Model Selection & Training → 3. Validation & Testing → 4. Deployment (Edge/Cloud) → 5. Continuous Learning (MLOps) → 6. Business Impact Analysis"
    }
};

function showServiceDetails(serviceKey) {
    const data = serviceDetails[serviceKey];
    if (!data) return;
    detailsContent.innerHTML = `
        <div class="details-badge"><i class="fas fa-info-circle"></i> ${data.badge}</div>
        <h2>${data.title}</h2>
        <p>${data.description}</p>
        <h3><i class="fas fa-check-circle"></i> Key Uses</h3>
        <ul>${data.uses.map(use => `<li><i class="fas fa-angle-right"></i> ${use}</li>`).join('')}</ul>
        <h3><i class="fas fa-cogs"></i> Our Making Process</h3>
        <p>${data.process}</p>
        <div style="background:#f8fafc; padding:20px; border-radius:24px; margin-top:20px;">
            <i class="fas fa-clock"></i> <strong>Typical timeline:</strong> 4–8 weeks (depends on complexity)<br>
            <i class="fas fa-users"></i> <strong>Team involved:</strong> Product Manager, Developers, QA, DevOps
        </div>
    `;
    platformGridElem.style.display = 'none';
    platformDetailsDiv.style.display = 'block';
    document.getElementById('platformSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function backToPlatformGrid() {
    platformGridElem.style.display = 'flex';
    platformDetailsDiv.style.display = 'none';
}

document.querySelectorAll('.platform-card').forEach(card => {
    card.addEventListener('click', (e) => {
        const service = card.getAttribute('data-service');
        if (service) showServiceDetails(service);
    });
});

backBtn.addEventListener('click', backToPlatformGrid);

// INITIALIZATION
window.addEventListener('load', () => {
    platformGridElem.style.display = 'flex';
    platformDetailsDiv.style.display = 'none';
    renderProducts();
    loadCart();
    loadData();
    setActiveLink();
});
