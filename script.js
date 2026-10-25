let cardDataGlobal = [];

async function loadCardData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        cardDataGlobal = data.cards;
        renderDashboard(cardDataGlobal);
    } catch (error) {
        console.error('Error loading card data:', error);
        // Fallback sample state if data.json isn't hosted locally yet
        cardDataGlobal = [
            { bank: "HDFC", cardName: "Regalia", totalLimit: 250000, usedLimit: 45000 },
            { bank: "SBI", cardName: "Cashback", totalLimit: 150000, usedLimit: 12000 },
            { bank: "ICICI", cardName: "Amazon Pay", totalLimit: 200000, usedLimit: 30000 },
            { bank: "Axis", cardName: "Flipkart Axis", totalLimit: 100000, usedLimit: 5000 }
        ];
        renderDashboard(cardDataGlobal);
    }
}

function formatCurrency(amount) {
    return '₹' + amount.toLocaleString('en-IN');
}

function renderDashboard(cards) {
    let totalLimit = 0;
    let totalUsed = 0;

    const container = document.getElementById('card-container');
    container.innerHTML = '';

    cards.forEach((card, index) => {
        const available = card.totalLimit - card.usedLimit;
        const utilization = card.totalLimit > 0 ? ((card.usedLimit / card.totalLimit) * 100).toFixed(1) : 0;

        totalLimit += card.totalLimit;
        totalUsed += card.usedLimit;

        const cardEl = document.createElement('div');
        cardEl.className = 'bank-card';
        cardEl.innerHTML = `
            <h3>${card.bank}</h3>
            <div class="card-name">${card.cardName}</div>
            <div class="metric-row"><span>Total Limit:</span> <span>${formatCurrency(card.totalLimit)}</span></div>
            <div class="metric-row"><span>Used Limit:</span> <span>${formatCurrency(card.usedLimit)}</span></div>
            <div class="metric-row"><span>Available:</span> <span style="color: #2e7d32;">${formatCurrency(available)}</span></div>
            <div class="metric-row"><span>Utilization:</span> <span>${utilization}%</span></div>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${utilization}%; background: ${utilization > 50 ? '#d32f2f' : '#0066cc'};"></div>
            </div>
        `;
        container.appendChild(cardEl);
    });

    const totalAvailable = totalLimit - totalUsed;
    const overallUtilization = totalLimit > 0 ? ((totalUsed / totalLimit) * 100).toFixed(1) : 0;

    document.getElementById('total-limit').innerText = formatCurrency(totalLimit);
    document.getElementById('total-used').innerText = formatCurrency(totalUsed);
    document.getElementById('total-available').innerText = formatCurrency(totalAvailable);
    document.getElementById('overall-utilization').innerText = overallUtilization + '%';
}

// Handle Update Expense Button Click
document.getElementById('update-expense-btn').addEventListener('click', () => {
    if (cardDataGlobal.length === 0) return;

    // 1. Build selection menu prompt
    let promptText = "Select a card number to update:\n";
    cardDataGlobal.forEach((card, index) => {
        promptText += `${index + 1}. ${card.bank} (${card.cardName}) - Current Used: ₹${card.usedLimit}\n`;
    });

    const cardSelection = prompt(promptText);
    if (!cardSelection) return; // Cancelled

    const selectedIndex = parseInt(cardSelection) - 1;
    if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= cardDataGlobal.length) {
        alert("Invalid selection. Please try again.");
        return;
    }

    const selectedCard = cardDataGlobal[selectedIndex];

    // 2. Ask for expense amount update type
    const updateChoice = prompt(
        `Selected: ${selectedCard.bank} - ${selectedCard.cardName}\n` +
        `Current Used Limit: ₹${selectedCard.usedLimit}\n\n` +
        `Choose update method:\n` +
        `1. Add new expense amount to current usage\n` +
        `2. Set absolute new total used limit amount`
    );

    if (updateChoice === "1") {
        const addAmount = prompt("Enter expense amount to add (₹):");
        const parsedAdd = parseFloat(addAmount);
        if (!isNaN(parsedAdd)) {
            selectedCard.usedLimit += parsedAdd;
        } else {
            alert("Invalid amount entered.");
            return;
        }
    } else if (updateChoice === "2") {
        const newAmount = prompt("Enter new total used limit (₹):");
        const parsedNew = parseFloat(newAmount);
        if (!isNaN(parsedNew)) {
            if (parsedNew > selectedCard.totalLimit) {
                alert("Used limit cannot exceed total card limit!");
                return;
            }
            selectedCard.usedLimit = parsedNew;
        } else {
            alert("Invalid amount entered.");
            return;
        }
    } else {
        return;
    }

    // 3. Re-render the dashboard automatically with updated values
    renderDashboard(cardDataGlobal);
});

loadCardData();
