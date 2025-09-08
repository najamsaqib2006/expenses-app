// ====== Expense Tracker App ======

// Select elements
const form = document.getElementById("transaction-form");
const amountInput = document.getElementById("amount");
const descInput = document.getElementById("desc");
const typeInput = document.getElementById("type");
const transactionList = document.getElementById("transactionList");

const monthlyReport = document.getElementById("monthly-report");
const quarterlyReport = document.getElementById("quarterly-report");
const annualReport = document.getElementById("annual-report");
const dateReport = document.getElementById("report");

const startDateInput = document.getElementById("start-date");
const endDateInput = document.getElementById("end-date");

// ====== Local Storage ======
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// ====== Add Transaction ======
form.addEventListener("submit", (e) => {
    e.preventDefault();

    const transaction = {
        id: Date.now(),
        amount: parseFloat(amountInput.value),
        desc: descInput.value,
        type: typeInput.value,
        date: new Date().toISOString().split("T")[0] // store YYYY-MM-DD
    };

    transactions.push(transaction);
    localStorage.setItem("transactions", JSON.stringify(transactions));

    form.reset();
    renderTransactions();
    updateReports();
});

// ====== Render Transactions ======
function renderTransactions() {
    transactionList.innerHTML = "";

    transactions.forEach(tx => {
        const li = document.createElement("li");
        li.textContent = `${tx.date} - ${tx.desc}: ${tx.type === "expense" ? "-" : "+"}${tx.amount} PKR`;
        li.className = tx.type;
        transactionList.appendChild(li);
    });
}

// ====== Reports ======
function updateReports() {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    let monthlyTotal = 0;
    let quarterlyTotal = 0;
    let annualTotal = 0;

    transactions.forEach(tx => {
        const txDate = new Date(tx.date);
        const txMonth = txDate.getMonth();
        const txYear = txDate.getFullYear();

        let sign = tx.type === "expense" ? -1 : 1;

        // Monthly
        if (txMonth === thisMonth && txYear === thisYear) {
            monthlyTotal += sign * tx.amount;
        }

        // Quarterly (0–2, 3–5, 6–8, 9–11)
        const currentQuarter = Math.floor(thisMonth / 3);
        if (Math.floor(txMonth / 3) === currentQuarter && txYear === thisYear) {
            quarterlyTotal += sign * tx.amount;
        }

        // Annual
        if (txYear === thisYear) {
            annualTotal += sign * tx.amount;
        }
    });

    monthlyReport.textContent = `Monthly: ${monthlyTotal} PKR`;
    quarterlyReport.textContent = `Quarterly: ${quarterlyTotal} PKR`;
    annualReport.textContent = `Annually: ${annualTotal} PKR`;
}

// ====== Date Wise Report ======
[startDateInput, endDateInput].forEach(input => {
    input.addEventListener("change", generateDateReport);
});

function generateDateReport() {
    const start = new Date(startDateInput.value);
    const end = new Date(endDateInput.value);

    if (!start || !end) return;

    let total = 0;
    transactions.forEach(tx => {
        const txDate = new Date(tx.date);
        if (txDate >= start && txDate <= end) {
            let sign = tx.type === "expense" ? -1 : 1;
            total += sign * tx.amount;
        }
    });

    dateReport.textContent = `Net Income/Profit: ${total} PKR`;
}

// ====== Daily Reminder at 8 PM ======
function setupDailyReminder() {
    // Ask for notification permission
    if ("Notification" in window) {
        Notification.requestPermission();
    }

    setInterval(() => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();

        // Trigger at exactly 8:00 PM
        if (hours === 20 && minutes === 0) {
            // Browser Notification
            if ("Notification" in window && Notification.permission === "granted") {
                new Notification("💰 Reminder", {
                    body: "Don't forget to add today's expenses!",
                    icon: "pic.jpg"
                });
            }

            // Play sound
            const audio = new Audio("reminder-tone.mp3");
            audio.play().catch(() => {
                console.log("Autoplay blocked — user must interact once.");
            });

            alert("🔔 Reminder: Please add today's expenses/Income!");
        }
    }, 60000); // check every minute
}
// Register Service Worker
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js")
    .then(() => console.log("✅ Service Worker registered"))
    .catch(err => console.error("SW registration failed", err));
}


// ====== Init ======
renderTransactions();
updateReports();
setupDailyReminder();
