// Bryluno System Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAoYDclGhL75b14C1fT_5SRsrrEt8B6iyU",
    databaseURL: "https://bryluno-system-default-rtdb.firebaseio.com",
    projectId: "bryluno-system"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// 1. ADMIN: ADD NEW GIFT PACK (WITH CUSTOM COMMISSION & DELIVERY)
async function addGiftPack() {
    const name = document.getElementById('p-name').value;
    const price = document.getElementById('p-price').value;
    const commission = document.getElementById('p-comm').value;
    const delivery = document.getElementById('p-del').value;
    const file = document.getElementById('p-img').files[0];

    // Image Upload to Cloudinary Logic
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'bryluno-products');

    const res = await fetch("https://api.cloudinary.com/v1_1/djsrfrxcu/image/upload", { method: 'POST', body: formData });
    const imgData = await res.json();

    await db.ref('gift_packs').push({
        name, price, commission, delivery, img: imgData.secure_url, status: 'active'
    });
    alert("System Updated Successfully!");
    location.reload();
}

// 2. RESELLER: SUBMIT ORDER
function submitOrder(packId, resellerId) {
    const customer = {
        name: document.getElementById('c-name').value,
        phone: document.getElementById('c-phone').value,
        address: document.getElementById('c-address').value
    };

    db.ref('orders').push({
        packId, resellerId, customer, status: 'Pending', timestamp: Date.now()
    });
    alert("Order Submitted to Admin for Review!");
}

// 3. ADMIN: UPDATE CONTENT (ABOUT US, RULES)
function updateSiteContent(section, value) {
    db.ref('settings/' + section).set(value);
}

// 4. DYNAMIC LOADER (FRONTEND)
function loadStore() {
    db.ref('gift_packs').on('value', snap => {
        const container = document.getElementById('store-grid');
        if(!container) return;
        container.innerHTML = '';
        snap.forEach(child => {
            const p = child.val();
            container.innerHTML += `
                <div class="gift-pack-card">
                    <img src="${p.img}" class="w-full h-48 object-cover">
                    <div class="p-4">
                        <h3 class="font-bold text-lg">${p.name}</h3>
                        <p class="text-purple-700 font-black">Rs. ${p.price}</p>
                        <button onclick="orderViaWA('${p.name}', ${p.price})" class="w-full mt-3 bg-purple-900 text-white py-2 rounded-lg font-bold">ORDER PACK</button>
                    </div>
                </div>
            `;
        });
    });
      }
