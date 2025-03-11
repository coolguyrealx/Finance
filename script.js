// Finance Tracker Application

// Initialize data structure
let financeData = {
    transactions: [],
    balance: 0,
    income: 0,
    expenses: 0
};

// Load data from localStorage if available
function loadData() {
    const savedData = localStorage.getItem('financeData');
    if (savedData) {
        financeData = JSON.parse(savedData);
        updateDashboard();
        renderTransactions();
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('financeData', JSON.stringify(financeData));
}

// Update dashboard numbers
function updateDashboard() {
    document.getElementById('balance-amount').textContent = financeData.balance.toFixed(2);
    document.getElementById('income-amount').textContent = financeData.income.toFixed(2);
    document.getElementById('expenses-amount').textContent = financeData.expenses.toFixed(2);
}

// Add a new transaction
function addTransaction(type, name, amount, date, category) {
    // Create transaction object
    const transaction = {
        id: Date.now(),
        type: type,
        name: name,
        amount: parseFloat(amount),
        date: date,
        category: category
    };
    
    // Add to transactions array
    financeData.transactions.unshift(transaction);
    
    // Update totals
    if (type === 'income') {
        financeData.income += transaction.amount;
        financeData.balance += transaction.amount;
    } else {
        financeData.expenses += transaction.amount;
        financeData.balance -= transaction.amount;
    }
    
    // Update UI
    updateDashboard();
    renderTransactions();
    saveData();
}

// Render transactions in the table
function renderTransactions() {
    const tbody = document.getElementById('transactions-body');
    tbody.innerHTML = '';
    
    // Show only the 10 most recent transactions
    const recentTransactions = financeData.transactions.slice(0, 10);
    
    recentTransactions.forEach(transaction => {
        const row = document.createElement('tr');
        
        // Format date
        const dateObj = new Date(transaction.date);
        const formattedDate = dateObj.toLocaleDateString();
        
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${transaction.name}</td>
            <td>${transaction.category}</td>
            <td>${transaction.type}</td>
            <td class="${transaction.type === 'income' ? 'income' : 'expense'}">
                ${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toFixed(2)}
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Event listeners
window.onload = function() {
    // Load saved data
    loadData();
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('transaction-date').value = today;
    
    // Add transaction button
    document.getElementById('add-transaction-btn').addEventListener('click', function() {
        const type = document.getElementById('transaction-type').value;
        const name = document.getElementById('transaction-name').value;
        const amount = document.getElementById('transaction-amount').value;
        const date = document.getElementById('transaction-date').value;
        const category = document.getElementById('transaction-category').value;
        
        // Validate inputs
        if (!name || !amount || amount <= 0 || !date) {
            alert('Please fill in all fields with valid values');
            return;
        }
        
        // Add the transaction
        addTransaction(type, name, amount, date, category);
        
        // Clear form
        document.getElementById('transaction-name').value = '';
        document.getElementById('transaction-amount').value = '';
    });
};
