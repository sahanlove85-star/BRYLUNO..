/* BRYLUNO MASTER OS v2.0 - CORE BUSINESS LOGIC
   OWNER: SAHAN (100% CONTROL SYSTEM)
*/

// 1. FIREBASE CONFIGURATION (The Heart of the System)
const firebaseConfig = {
    apiKey: "AIzaSyAoYDclGhL75b14C1fT_5SRsrrEt8B6iyU",
    authDomain: "bryluno-system.firebaseapp.com",
    databaseURL: "https://bryluno-system-default-rtdb.firebaseio.com",
    projectId: "bryluno-system",
    storageBucket: "bryluno-system.firebasestorage.app",
    messagingSenderId: "666741527124",
    appId: "1:666741527124:web:bebf8a61c085eba11cd3c1"
};

// Initialize Database Connection
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// 2. LIVE STORE ENGINE: LOAD GIFT PACKS
function loadLiveStore() {
    const productGrid = document.getElementById('product-grid');
    if (!productGrid) return;

    db.ref('gift_packs').on('value', (snapshot) => {
        productGrid.innerHTML = ''; // Clear current display
        
        if (!snapshot.exists()) {
            productGrid.innerHTML = `
                <div class="col-span-full text-center py-20">
                    <p class="text-gray-400 font-bold">New Luxury Packs are being prepared by Admin...</p>
                </div>`;
            return;
        }

        snapshot.forEach((child) => {
            const pack = child.val();
            const packId = child.key;

            // Logic: Auto-calculate 15% Higher Price for "Old Price" Display (Daraz Style)
            const oldPrice = Math.floor(pack.price * 1.15);
            const discount = 15;

            productGrid.innerHTML += `
                <div class="p-card animate-up">
                    <div class="p-badge">PREMIUM</div>
                    <div class="p-img-container">
                        <img src="${pack.img}" class="p-img" alt="${pack.name}" loading="lazy">
                    </div>
                    <div class="p-details">
                        <h3 class="p-title">${pack.name}</h3>
                        <div class="p-price-row">
                            <span class="p-old-price">Rs. ${oldPrice.toLocaleString()}</span>
                            <span class="p-discount">-${discount}%</span><br>
                            <span class="p-price">Rs. ${Number(pack.price).toLocaleString()}</span>
                        </div>
                        <button class="btn-reserve" onclick="placeDirectOrder('${packId}', '${pack.name}', '${pack.price}')">
                            <i class="fa-solid fa-cart-shopping mr-2"></i> Order Now
                        </button>
                    </div>
                </div>
            `;
        });
    });
}

// 3. ADMIN: DEPLOY NEW GIFT PACK (CMS Logic)
async function deployNewPack() {
    const name = document.getElementById('admin-p-name').value;
    const price = document.getElementById('admin-p-price').value;
    const commission = document.getElementById('admin-p-comm').value;
    const delivery = document.getElementById('admin-p-del').value;
    const imageFile = document.getElementById('admin-p-file').files[0];
    const deployBtn = document.getElementById('deploy-btn');

    if (!name || !price || !imageFile) {
        alert("Boss! Please fill all fields and select a pack photo.");
        return;
    }

    deployBtn.disabled = true;
    deployBtn.innerHTML = "<i class='fa-solid fa-spinner fa-spin'></i> DEPLOYING TO CLOUD...";

    // Asset Management: Upload to Cloudinary
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('upload_preset', 'bryluno-products');

    try {
        const response = await fetch("https://api.cloudinary.com/v1_1/djsrfrxcu/image/upload", {
            method: 'POST',
            body: formData
        });
        const imgData = await response.json();

        // Push to Database
        await db.ref('gift_packs').push({
            name: name,
            price: price,
            commission: commission,
            delivery: delivery,
            img: imgData.secure_url,
            status: 'active',
            timestamp: Date.now()
        });

        alert("Pack Deployed Successfully to BRYLUNO Network!");
        location.reload();

    } catch (error) {
        console.error(error);
        alert("System Error! Check Connection.");
        deployBtn.disabled = false;
        deployBtn.innerHTML = "Publish to All Platforms";
    }
}

// 4. WHATSAPP ORDER ENGINE (The Money Flow)
function placeDirectOrder(id, name, price) {
    const ownerWA = "94752351754";
    const message = `*BRYLUNO NEW ORDER*%0A--------------------------%0A*Pack Name:* ${name}%0A*Price:* Rs. ${price}%0A*Status:* Waiting for Payment%0A--------------------------%0A_Sent via Bryluno Luxury Network_`;
    
    window.open(`https://wa.me/${ownerWA}?text=${message}`, '_blank');
}

// 5. SEARCH LOGIC (Dynamic Filtering)
function dynamicSearch() {
    const input = document.getElementById('globalSearch').value.toUpperCase();
    const cards = document.getElementsByClassName('p-card');

    for (let i = 0; i < cards.length; i++) {
        const title = cards[i].getElementsByClassName('p-title')[0].innerText;
        if (title.toUpperCase().indexOf(input) > -1) {
            cards[i].style.display = "";
        } else {
            cards[i].style.display = "none";
        }
    }
}

// 6. INITIALIZE SYSTEM
window.onload = () => {
    loadLiveStore();
    
    // Sync Site Content from Admin Settings
    db.ref('site_settings').on('value', (snap) => {
        const settings = snap.val();
        if(settings) {
            if(document.getElementById('top-announcement')) 
                document.getElementById('top-announcement').innerText = settings.announcement;
            if(document.getElementById('about-content')) 
                document.getElementById('about-content').innerText = settings.aboutText;
        }
    });
};
