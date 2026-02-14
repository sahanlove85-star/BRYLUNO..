// app.js - Bryluno System Core
const firebaseConfig = {
    apiKey: "AIzaSyAoYDclGhL75b14C1fT_5SRsrrEt8B6iyU",
    authDomain: "bryluno-system.firebaseapp.com",
    databaseURL: "https://bryluno-system-default-rtdb.firebaseio.com",
    projectId: "bryluno-system"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

// UI Utilities
function toggleMenu() {
    document.getElementById('sidebar').classList.toggle('active');
}

// 1. SMART INVENTORY SYNC (CUSTOMER VIEW)
function loadProducts() {
    const grid = document.getElementById('product-grid');
    if(!grid) return;

    db.ref('inventory').on('value', snap => {
        grid.innerHTML = '';
        snap.forEach(child => {
            const p = child.val();
            grid.innerHTML += `
                <div class="product-card">
                    <div class="relative overflow-hidden group">
                        <img src="${p.img}" class="w-full h-52 object-cover transition duration-500 group-hover:scale-110">
                        <div class="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm">NEW</div>
                    </div>
                    <div class="p-4">
                        <h3 class="font-bold text-gray-800 text-sm mb-1 h-10 overflow-hidden">${p.name}</h3>
                        <p class="text-purple-900 font-black mb-3">LKR ${Number(p.price).toLocaleString()}</p>
                        <button onclick="orderViaWA('${p.name}', '${p.price}')" class="w-full bg-purple-900 text-white py-2 rounded-xl text-[11px] font-bold hover:bg-black transition">ORDER NOW</button>
                    </div>
                </div>
            `;
        });
    });
}

// 2. SEARCH ENGINE LOGIC
function searchEngine() {
    let input = document.getElementById('searchBar').value.toUpperCase();
    let cards = document.getElementsByClassName('product-card');
    for (let i = 0; i < cards.length; i++) {
        let title = cards[i].getElementsByTagName('h3')[0].innerText;
        cards[i].style.display = title.toUpperCase().includes(input) ? "" : "none";
    }
}

// 3. AUTO-INVOICE WHATSAPP
function orderViaWA(name, price) {
    const msg = `*BRYLUNO OFFICIAL ORDER*%0A--------------------------%0A*Item:* ${name}%0A*Price:* LKR ${price}%0A*Date:* ${new Date().toLocaleDateString()}%0A--------------------------%0A_Please verify this order._`;
    window.open(`https://wa.me/94752351754?text=${msg}`, '_blank');
}

// 4. ADMIN ASSET DEPLOYMENT (CLOUDINARY)
async function deployAsset() {
    const file = document.getElementById('p-file').files[0];
    const name = document.getElementById('p-name').value;
    const price = document.getElementById('p-price').value;
    const btn = document.getElementById('upBtn');

    if(!file || !name || !price) return alert("System Error: Missing Parameters!");

    btn.disabled = true;
    btn.innerHTML = "SYNCING TO CLOUD...";

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'bryluno-products');

    try {
        const res = await fetch("https://api.cloudinary.com/v1_1/djsrfrxcu/image/upload", {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        
        await db.ref('inventory').push({
            name, price, img: data.secure_url, time: Date.now()
        });

        alert("Deployment Successful!");
        location.reload();
    } catch (e) { alert("Cloud Error!"); btn.disabled = false; }
}

window.onload = loadProducts;
