// 1. Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAoYDclGhL75b14C1fT_5SRsrrEt8B6iyU",
  authDomain: "bryluno-system.firebaseapp.com",
  databaseURL: "https://bryluno-system-default-rtdb.firebaseio.com",
  projectId: "bryluno-system",
  storageBucket: "bryluno-system.firebasestorage.app",
  messagingSenderId: "666741527124",
  appId: "1:666741527124:web:bebf8a61c085eba11cd3c1"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

// 2. Load Real Inventory from Google Sheets
async function loadInventory() {
    const sheetID = "1BQ819L1qmuatSTgwjXMAR0K-tNQcIIanow7EdthO6Sg";
    const url = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:json`;

    try {
        const response = await fetch(url);
        const text = await response.text();
        const json = JSON.parse(text.substr(47).slice(0, -2));
        const rows = json.table.rows;
        
        const display = document.getElementById('product-display');
        display.innerHTML = '';

        rows.forEach(row => {
            const name = row.c[0] ? row.c[0].v : "Luxury Piece";
            const price = row.c[1] ? row.c[1].v : "Contact";
            const img = row.c[2] ? row.c[2].v : "";

            display.innerHTML += `
                <div class="glass-card p-5 rounded-[25px] border border-white/5 relative overflow-hidden group">
                    <img src="${img}" class="w-full h-72 object-cover rounded-2xl mb-4 group-hover:scale-105 transition-transform duration-500" onerror="this.src='https://via.placeholder.com/400x500/111/fff?text=BRYLUNO'">
                    <h3 class="text-xl font-bold text-amber-500">${name}</h3>
                    <p class="text-white/40 text-xs mb-4">LKR ${price}</p>
                    <button onclick="reserveViaWA('${name}')" class="w-full py-3 bg-white text-black font-black rounded-xl uppercase text-[10px] tracking-widest hover:bg-amber-500 transition-all">Reserve Piece</button>
                </div>
            `;
        });
    } catch (e) {
        console.error("Sheet Sync Failed");
    }
}

// 3. Reserve via WhatsApp
function reserveViaWA(itemName) {
    const phone = "+94752351754"; // உங்கள் வாட்ஸ்அப் நம்பரை இங்கே போடவும் (947 ஆரம்பிக்க வேண்டும்)
    const msg = `Hello Bryluno, I would like to reserve: ${itemName}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
}

// 4. Navigation
function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById('page-' + id).classList.remove('hidden');
}

// 5. Admin Auth
async function authAdminCheck() {
    const email = prompt("Enter Email:");
    const pass = prompt("Enter Password:");
    if(!email || !pass) return;

    try {
        await auth.signInWithEmailAndPassword(email, pass);
        if(email === 'bryluno.pvt.ltd@gmail.com') {
            showPage('admin');
            loadAdminData();
        } else {
            alert("Welcome Back!");
        }
    } catch (e) {
        alert("Login Error: " + e.message);
    }
}

// 6. Registration
async function registerReseller(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-pass').value;

    try {
        const user = await auth.createUserWithEmailAndPassword(email, pass);
        await db.ref('users/' + user.user.uid).set({
            name: name, email: email, status: 'Pending'
        });
        alert("Application Sent!");
        showPage('home');
    } catch (e) { alert(e.message); }
}

// 7. Load Admin Data
function loadAdminData() {
    db.ref('users').on('value', snap => {
        const list = document.getElementById('pending-users-list');
        list.innerHTML = '';
        let count = 0;
        snap.forEach(child => {
            const user = child.val();
            if(user.status === 'Pending') {
                count++;
                list.innerHTML += `
                    <div class="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div><p class="text-xs font-bold">${user.name}</p><p class="text-[9px] text-white/30">${user.email}</p></div>
                        <button onclick="approve('${child.key}')" class="bg-amber-500 text-black px-4 py-1 rounded-lg text-[10px] font-bold">APPROVE</button>
                    </div>`;
            }
        });
        document.getElementById('notif-count').innerText = count;
        document.getElementById('notif-count').classList.remove('hidden');
    });
}

function approve(uid) {
    db.ref('users/' + uid).update({status: 'Approved'}).then(() => alert("Approved!"));
}

window.onload = loadInventory;
