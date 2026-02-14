/* BRYLUNO MASTER OS v2.0 - CORE LOGIC */

// 1. DATABASE CONFIGURATION
const firebaseConfig = {
    apiKey: "AIzaSyAoYDclGhL75b14C1fT_5SRsrrEt8B6iyU",
    authDomain: "bryluno-system.firebaseapp.com",
    databaseURL: "https://bryluno-system-default-rtdb.firebaseio.com",
    projectId: "bryluno-system",
    storageBucket: "bryluno-system.firebasestorage.app",
    messagingSenderId: "666741527124",
    appId: "1:666741527124:web:bebf8a61c085eba11cd3c1"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// 2. GLOBAL UI CONTROLS
function toggleMenu() {
    document.getElementById('sidebar').classList.toggle('active');
}

// 3. LIVE STORE ENGINE (100% Dynamic)
function initStore() {
    const productGrid = document.getElementById('main-product-grid');
    if(!productGrid) return; // index.html-ல் இல்லையென்றால் இயங்காது

    // Fetching Data from Bryluno Cloud
    db.ref('gift_packs').on('value', (snapshot) => {
        productGrid.innerHTML = ''; // Clear current display
        
        if(!snapshot.exists()) {
            productGrid.innerHTML = '<p class="loading-text">New Packs Coming Soon...</p>';
            return;
        }

        snapshot.forEach((child) => {
            const pack = child.val();
            const key = child.key;

            // Business Logic: Generate fake discount (15% higher old price)
            const oldPrice = Math.floor(pack.price * 1.15);

            productGrid.innerHTML += `
                <div class="p-card animate-up">
                    <div class="p-badge">TOP CHOICE</div>
                    <img src="${pack.img}" class="p-img" alt="${pack.name}">
                    <div class="p-details">
                        <h3 class="p-title">${pack.name}</h3>
                        <div class="p-price-row">
                            <span class="p-old-price">Rs. ${oldPrice.toLocaleString()}</span><br>
                            <span class="p-price">Rs. ${Number(pack.price).toLocaleString()}</span>
                        </div>
                        <button class="order-btn" onclick="openOrderModal('${key}', '${pack.name}', '${pack.price}')">
                            <i class="fa-solid fa-cart-plus"></i> RESERVE NOW
                        </button>
                    </div>
                </div>
            `;
        });
    });
}

// 4. SMART ORDERING SYSTEM (WhatsApp Integration)
function openOrderModal(id, name, price) {
    // This is the BRYLUNO Business Flow
    const message = `*BRYLUNO LUXURY ORDER*%0A--------------------------%0A*Pack Name:* ${name}%0A*Price:* Rs. ${price}%0A*Status:* Pending Verification%0A--------------------------%0A_Sent via Bryluno Network_`;
    
    const whatsappLink = `https://wa.me/94752351754?text=${message}`;
    window.open(whatsappLink, '_blank');
}

// 5. ADMIN CONTROL: DEPLOY NEW PACKS
async function deployNewPack() {
    const name = document.getElementById('admin-p-name').value;
    const price = document.getElementById('admin-p-price').value;
    const comm = document.getElementById('admin-p-comm').value;
    const del = document.getElementById('admin-p-del').value;
    const file = document.getElementById('admin-p-file').files[0];
    const btn = document.getElementById('deploy-btn');

    if(!name || !price || !file) {
        alert("Owner, Please fill all the fields!");
        return;
    }

    btn.disabled = true;
    btn.innerHTML = "SYNCING WITH CLOUD...";

    // Upload to Cloudinary (Owner Asset Storage)
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'bryluno-products');

    try {
        const response = await fetch("https://api.cloudinary.com/v1_1/djsrfrxcu/image/upload", {
            method: 'POST',
            body: formData
        });
        const imgData = await response.json();

        // Save to Database
        await db.ref('gift_packs').push({
            name: name,
            price: price,
            commission: comm,
            delivery: del,
            img: imgData.secure_url,
            createdAt: Date.now()
        });

        alert("Pack Deployed Successfully!");
        location.reload();
    } catch (error) {
        console.error(error);
        alert("System Error! Check Connection.");
        btn.disabled = false;
    }
}

// 6. SEARCH SYSTEM (Real-time Filter)
function brylunoSearch() {
    let input = document.getElementById('mainSearch').value.toUpperCase();
    let cards = document.getElementsByClassName('p-card');
    
    for (let i = 0; i < cards.length; i++) {
        let title = cards[i].getElementsByClassName('p-title')[0].innerText;
        if (title.toUpperCase().indexOf(input) > -1) {
            cards[i].style.display = "";
        } else {
            cards[i].style.display = "none";
        }
    }
}

// Start the System
window.onload = () => {
    initStore();
};
