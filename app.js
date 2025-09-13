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

const startDateInput = document.getElementById("start-date");
const endDateInput = document.getElementById("end-date");
const reportOutput = document.getElementById("report");

// Transactions array (load from localStorage if available)
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// ====== Functions ======

// Save to localStorage
function saveTransactions() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

// Render all transactions
function renderTransactions() {
  transactionList.innerHTML = "";
  transactions.forEach((txn, index) => {
    // create li and classes
    const li = document.createElement("li");
    li.className = txn.type === "income" ? "income" : "expense";

    // text span (flex child)
    const textSpan = document.createElement("span");
    textSpan.className = "txn-text";
    textSpan.textContent = `${txn.date} - ${txn.desc}: ${txn.type === "income" ? "+" : "-"}${txn.amount} PKR`;

    // button group (flex child, pushed right by margin-left:auto)
    const btnGroup = document.createElement("div");
    btnGroup.className = "btn-group";

    const editBtn = document.createElement("button");
    editBtn.className = "edit-btn";
    editBtn.textContent = "✏️";
    editBtn.onclick = () => {
      // load values into form for editing
      amountInput.value = txn.amount;
      descInput.value = txn.desc;
      typeInput.value = txn.type;

      // remove the old item so save will re-add it (update)
      transactions.splice(index, 1);
      saveTransactions();
      renderTransactions();
      updateReports();
    };

    const delBtn = document.createElement("button");
    delBtn.className = "delete-btn";
    delBtn.textContent = "❌";
    delBtn.onclick = () => {
      transactions.splice(index, 1);
      saveTransactions();
      renderTransactions();
      updateReports();
    };

    btnGroup.appendChild(editBtn);
    btnGroup.appendChild(delBtn);

    // append to li and to list
    li.appendChild(textSpan);
    li.appendChild(btnGroup);
    transactionList.appendChild(li);
  });
}

// Add transaction
form.addEventListener("submit", (e) => {
    e.preventDefault();

    const amount = parseFloat(amountInput.value);
    const desc = descInput.value;
    const type = typeInput.value;

    if (isNaN(amount) || amount <= 0 || desc.trim() === "") {
        alert("Enter valid amount and description.");
        return;
    }

    const transaction = {
        amount,
        desc,
        type,
        date: new Date().toISOString().split("T")[0] // YYYY-MM-DD
    };

    transactions.push(transaction);
    saveTransactions();
    renderTransactions();
    updateReports();

    form.reset();
});

// Calculate Reports
function updateReports() {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    let monthlyTotal = 0, quarterlyTotal = 0, annualTotal = 0;

    transactions.forEach(txn => {
        const txnDate = new Date(txn.date);
        const amt = txn.type === "income" ? txn.amount : -txn.amount;

        if (txnDate.getFullYear() === thisYear) {
            annualTotal += amt;

            if (Math.floor(txnDate.getMonth() / 3) === Math.floor(thisMonth / 3)) {
                quarterlyTotal += amt;
            }
            if (txnDate.getMonth() === thisMonth) {
                monthlyTotal += amt;
            }
        }
    });

    monthlyReport.textContent = `Monthly: ${monthlyTotal} PKR`;
    quarterlyReport.textContent = `Quarterly: ${quarterlyTotal} PKR`;
    annualReport.textContent = `Annually: ${annualTotal} PKR`;
}

// Date wise report
function updateDateWiseReport() {
    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);

    if (!startDateInput.value || !endDateInput.value) return;

    let total = 0;
    transactions.forEach(txn => {
        const txnDate = new Date(txn.date);
        if (txnDate >= startDate && txnDate <= endDate) {
            total += txn.type === "income" ? txn.amount : -txn.amount;
        }
    });

    reportOutput.textContent = `Net Income/Profit: ${total} PKR`;
}

startDateInput.addEventListener("change", updateDateWiseReport);
endDateInput.addEventListener("change", updateDateWiseReport);

// ====== Initialize ======
renderTransactions();
updateReports();
