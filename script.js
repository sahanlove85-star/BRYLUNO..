const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRukBm2FbNlYSrOopGqy0oh2PrXiIfuL3vNey5L4QC8MMqSCBNFvh6pJQFFFAIF3USo5bu_UtPefR7_/pub?output=csv';

async function loadSystem() {
    try {
        const response = await fetch(CSV_URL);
        const data = await response.text();
        const rows = data.split('\n').slice(1).map(r => r.split(','));

        renderProducts(rows);
        updateRealStats(rows);
    } catch (e) {
        console.error("Critical Sync Error:", e);
    }
}

function renderProducts(items) {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';
    items.forEach(item => {
        if(item.length < 2) return;
        grid.innerHTML += `
            <div class="glass-card p-6 rounded-[35px] hover:border-amber-500 transition-all duration-500 group">
                <img src="${item[4]}" class="product-img w-full mb-6 group-hover:scale-105 transition">
                <h3 class="brand-font text-xl mb-2">${item[1]}</h3>
                <div class="flex justify-between items-center">
                    <span class="text-2xl font-black gold-text italic">LKR ${item[2]}</span>
                    <a href="https://wa.me/94752351754?text=ORDER:${item[1]}" class="bg-amber-600 text-black px-6 py-3 rounded-2xl font-bold text-xs">RESERVE</a>
                </div>
            </div>
        `;
    });
}

function updateRealStats(items) {
    let total = items.reduce((sum, row) => sum + (Number(row[2]) || 0), 0);
    document.getElementById('real-revenue').innerText = `LKR ${total.toLocaleString()}`;
}

function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active', 'hidden'));
    document.querySelectorAll('.page').forEach(p => {
        if(p.id === 'page-' + id) p.classList.add('active');
        else p.classList.add('hidden');
    });
    if(id === 'admin') initAdminChart();
}

function authAdmin() {
    if(prompt("Enter Executive Key:") === "1234") showPage('admin');
}

function initAdminChart() {
    const ctx = document.getElementById('liveChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
                data: [12000, 45000, 32000, 70000],
                borderColor: '#c5a059',
                backgroundColor: 'rgba(197, 160, 89, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: { plugins: { legend: { display: false } }, scales: { y: { display: false }, x: { grid: { display: false } } } }
    });
}

window.onload = loadSystem;
