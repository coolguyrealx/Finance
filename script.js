// Finance Tracker Application

// Initialize data structure
let financeData = {
    transactions: [],
    balance: 0,
    income: 0,
    expenses: 0
};

// Current filter settings
let currentFilters = {
    searchTerm: '',
    category: '',
    type: '',
    dateFrom: '',
    dateTo: ''
};

// Theme management
function initTheme() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeToggleIcon(savedTheme);
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Set the theme
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update the toggle icon
    updateThemeToggleIcon(newTheme);
}

function updateThemeToggleIcon(theme) {
    const toggleButton = document.getElementById('theme-toggle');
    toggleButton.innerHTML = theme === 'dark' ? '🌙' : '☀️';
}

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

// Delete a transaction
function deleteTransaction(id) {
    // Find transaction
    const transactionIndex = financeData.transactions.findIndex(t => t.id === id);
    if (transactionIndex === -1) return;
    
    const transaction = financeData.transactions[transactionIndex];
    
    // Update totals
    if (transaction.type === 'income') {
        financeData.income -= transaction.amount;
        financeData.balance -= transaction.amount;
    } else {
        financeData.expenses -= transaction.amount;
        financeData.balance += transaction.amount;
    }
    
    // Remove from array
    financeData.transactions.splice(transactionIndex, 1);
    
    // Update UI
    updateDashboard();
    renderTransactions();
    saveData();
}

// Edit a transaction
function editTransaction(id, newType, newName, newAmount, newDate, newCategory) {
    // Find transaction
    const transactionIndex = financeData.transactions.findIndex(t => t.id === id);
    if (transactionIndex === -1) return;
    
    const transaction = financeData.transactions[transactionIndex];
    const oldAmount = transaction.amount;
    const oldType = transaction.type;
    
    // Update transaction
    transaction.type = newType;
    transaction.name = newName;
    transaction.amount = parseFloat(newAmount);
    transaction.date = newDate;
    transaction.category = newCategory;
    
    // Update totals
    if (oldType === 'income') {
        financeData.income -= oldAmount;
        financeData.balance -= oldAmount;
    } else {
        financeData.expenses -= oldAmount;
        financeData.balance += oldAmount;
    }
    
    if (newType === 'income') {
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

// Filter transactions based on current filter settings
function filterTransactions() {
    return financeData.transactions.filter(transaction => {
        // Search term filter
        if (currentFilters.searchTerm && 
            !transaction.name.toLowerCase().includes(currentFilters.searchTerm.toLowerCase())) {
            return false;
        }
        
        // Category filter
        if (currentFilters.category && transaction.category !== currentFilters.category) {
            return false;
        }
        
        // Type filter
        if (currentFilters.type && transaction.type !== currentFilters.type) {
            return false;
        }
        
        // Date range filter
        if (currentFilters.dateFrom) {
            const fromDate = new Date(currentFilters.dateFrom);
            const transactionDate = new Date(transaction.date);
            if (transactionDate < fromDate) return false;
        }
        
        if (currentFilters.dateTo) {
            const toDate = new Date(currentFilters.dateTo);
            toDate.setHours(23, 59, 59, 999); // End of day
            const transactionDate = new Date(transaction.date);
            if (transactionDate > toDate) return false;
        }
        
        return true;
    });
}

// Render transactions in the table
function renderTransactions() {
    const tbody = document.getElementById('transactions-body');
    tbody.innerHTML = '';
    
    // Get filtered transactions
    const filteredTransactions = filterTransactions();
    
    // Show only the 10 most recent transactions if no filters applied
    const transactionsToShow = (currentFilters.searchTerm || currentFilters.category || 
                               currentFilters.type || currentFilters.dateFrom || 
                               currentFilters.dateTo) ? 
                               filteredTransactions : filteredTransactions.slice(0, 10);
    
    if (transactionsToShow.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="6" style="text-align: center;">No transactions found</td>';
        tbody.appendChild(row);
        return;
    }
    
    transactionsToShow.forEach(transaction => {
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
            <td>
                <button class="edit-btn" data-id="${transaction.id}">Edit</button>
                <button class="delete-btn" data-id="${transaction.id}">Delete</button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Add event listeners to the edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            openEditModal(id);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            if (confirm('Are you sure you want to delete this transaction?')) {
                deleteTransaction(id);
            }
        });
    });
}

// Open edit modal
function openEditModal(id) {
    const transaction = financeData.transactions.find(t => t.id === id);
    if (!transaction) return;
    
    document.getElementById('edit-transaction-id').value = transaction.id;
    document.getElementById('edit-transaction-type').value = transaction.type;
    document.getElementById('edit-transaction-name').value = transaction.name;
    document.getElementById('edit-transaction-amount').value = transaction.amount;
    document.getElementById('edit-transaction-date').value = transaction.date;
    document.getElementById('edit-transaction-category').value = transaction.category;
    
    document.getElementById('edit-modal').style.display = 'block';
}

// Close edit modal
function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
}

// Generate a report
function generateReport() {
    const reportType = document.getElementById('report-type').value;
    const fromDate = document.getElementById('report-date-from').value;
    const toDate = document.getElementById('report-date-to').value;
    
    if (!fromDate || !toDate) {
        alert('Please select a date range');
        return;
    }
    
    const from = new Date(fromDate);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999); // End of day
    
    if (from > to) {
        alert('From date cannot be after To date');
        return;
    }
    
    // Filter transactions for the selected date range
    const filteredTransactions = financeData.transactions.filter(t => {
        const date = new Date(t.date);
        return date >= from && date <= to;
    });
    
    if (filteredTransactions.length === 0) {
        alert('No transactions found in the selected date range');
        return;
    }
    
    const reportResults = document.getElementById('report-results');
    const reportTitle = document.getElementById('report-title');
    const reportSummary = document.getElementById('report-summary');
    const reportDetails = document.getElementById('report-details');
    const chartContainer = document.getElementById('chart-container');
    
    reportResults.style.display = 'block';
    chartContainer.innerHTML = '';
    
    let totalIncome = 0;
    let totalExpenses = 0;
    
    filteredTransactions.forEach(t => {
        if (t.type === 'income') {
            totalIncome += t.amount;
        } else {
            totalExpenses += t.amount;
        }
    });
    
    const netChange = totalIncome - totalExpenses;
    
    // Set report title
    reportTitle.textContent = `Financial Report: ${from.toLocaleDateString()} to ${to.toLocaleDateString()}`;
    
    // Create summary section
    reportSummary.innerHTML = `
        <div style="margin-bottom: 20px;">
            <h4>Summary</h4>
            <p>Total Income: $${totalIncome.toFixed(2)}</p>
            <p>Total Expenses: $${totalExpenses.toFixed(2)}</p>
            <p>Net Change: $${netChange.toFixed(2)}</p>
            <p>Number of Transactions: ${filteredTransactions.length}</p>
        </div>
    `;
    
    // Generate different reports based on type
    if (reportType === 'weekly') {
        generateWeeklyReport(filteredTransactions, from, to, chartContainer, reportDetails);
    } else if (reportType === 'monthly') {
        generateMonthlyReport(filteredTransactions, from, to, chartContainer, reportDetails);
    } else if (reportType === 'category') {
        generateCategoryReport(filteredTransactions, chartContainer, reportDetails);
    }
}

// Generate a weekly report
function generateWeeklyReport(transactions, from, to, chartContainer, reportDetails) {
    // Group transactions by week
    const weeks = {};
    
    transactions.forEach(t => {
        const date = new Date(t.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
        const weekKey = weekStart.toISOString().split('T')[0];
        
        if (!weeks[weekKey]) {
            weeks[weekKey] = {
                income: 0,
                expenses: 0,
                transactions: []
            };
        }
        
        if (t.type === 'income') {
            weeks[weekKey].income += t.amount;
        } else {
            weeks[weekKey].expenses += t.amount;
        }
        
        weeks[weekKey].transactions.push(t);
    });
    
    // Sort weeks
    const sortedWeeks = Object.keys(weeks).sort();
    
    // Prepare chart data
    const labels = [];
    const incomeData = [];
    const expenseData = [];
    
    sortedWeeks.forEach(week => {
        const weekStart = new Date(week);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        labels.push(`${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`);
        incomeData.push(weeks[week].income);
        expenseData.push(weeks[week].expenses);
    });
    
    // Create chart
    const canvas = document.createElement('canvas');
    chartContainer.appendChild(canvas);
    try{
        if (typeof Chart !== 'undefined') { 
            new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Income',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1,
                            data: incomeData
                        },
                        {
                            label: 'Expenses',
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 1,
                            data: expenseData
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Amount ($)'
                            }
                        }
                    }
                }
            });
        } else {
            chartContainer.innerHTML = '<p>Chart library not loaded. Please refresh the page.</p>';
        }
    } catch (error) {
        console.error('Error creating chart:', error);
        chartContainer.innerHTML = '<p>Error creating chart. Please try again later.</p>';
    }

    
    // Create details section
    reportDetails.innerHTML = '<h4>Weekly Breakdown</h4>';
    
    sortedWeeks.forEach(week => {
        const weekStart = new Date(week);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        const weekDetails = document.createElement('div');
        weekDetails.className = 'card';
        weekDetails.style.marginBottom = '15px';
        weekDetails.style.padding = '15px';
        
        weekDetails.innerHTML = `
            <h5>${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}</h5>
            <p>Income: $${weeks[week].income.toFixed(2)}</p>
            <p>Expenses: $${weeks[week].expenses.toFixed(2)}</p>
            <p>Net: $${(weeks[week].income - weeks[week].expenses).toFixed(2)}</p>
        `;
        
        reportDetails.appendChild(weekDetails);
    });
}

// Generate a monthly report
function generateMonthlyReport(transactions, from, to, chartContainer, reportDetails) {
    // Group transactions by month
    const months = {};
    
    transactions.forEach(t => {
        const date = new Date(t.date);
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        
        if (!months[monthKey]) {
            months[monthKey] = {
                income: 0,
                expenses: 0,
                transactions: []
            };
        }
        
        if (t.type === 'income') {
            months[monthKey].income += t.amount;
        } else {
            months[monthKey].expenses += t.amount;
        }
        
        months[monthKey].transactions.push(t);
    });
    
    // Sort months
    const sortedMonths = Object.keys(months).sort();
    
    // Prepare chart data
    const labels = [];
    const incomeData = [];
    const expenseData = [];
    
    sortedMonths.forEach(month => {
        const [year, monthNum] = month.split('-');
        const date = new Date(year, monthNum - 1, 1);
        
        labels.push(date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' }));
        incomeData.push(months[month].income);
        expenseData.push(months[month].expenses);
    });
    
    // Create chart
    const canvas = document.createElement('canvas');
    chartContainer.appendChild(canvas);
    
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Income',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    data: incomeData
                },
                {
                    label: 'Expenses',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                    data: expenseData
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Amount ($)'
                    }
                }
            }
        }
    });
    
    // Create details section
    reportDetails.innerHTML = '<h4>Monthly Breakdown</h4>';
    
    sortedMonths.forEach(month => {
        const [year, monthNum] = month.split('-');
        const date = new Date(year, monthNum - 1, 1);
        
        const monthDetails = document.createElement('div');
        monthDetails.className = 'card';
        monthDetails.style.marginBottom = '15px';
        monthDetails.style.padding = '15px';
        
        monthDetails.innerHTML = `
            <h5>${date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</h5>
            <p>Income: $${months[month].income.toFixed(2)}</p>
            <p>Expenses: $${months[month].expenses.toFixed(2)}</p>
            <p>Net: $${(months[month].income - months[month].expenses).toFixed(2)}</p>
        `;
        
        reportDetails.appendChild(monthDetails);
    });
}

// Generate a category report
function generateCategoryReport(transactions, chartContainer, reportDetails) {
    // Group transactions by category
    const categories = {};
    
    transactions.forEach(t => {
        if (t.type !== 'expense') return; // Only show expenses by category
        
        if (!categories[t.category]) {
            categories[t.category] = {
                total: 0,
                transactions: []
            };
        }
        
        categories[t.category].total += t.amount;
        categories[t.category].transactions.push(t);
    });
    
    // Prepare chart data
    const labels = Object.keys(categories);
    const data = labels.map(category => categories[category].total);
    
    // Create chart
    const canvas = document.createElement('canvas');
    chartContainer.appendChild(canvas);
    
    new Chart(canvas, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(199, 199, 199, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(199, 199, 199, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
    
    // Create details section
    reportDetails.innerHTML = '<h4>Expense Categories</h4>';
    
    const totalExpenses = Object.values(categories).reduce((sum, category) => sum + category.total, 0);
    
    labels.forEach(category => {
        const percentage = totalExpenses > 0 ? (categories[category].total / totalExpenses * 100).toFixed(1) : 0;
        
        const categoryDetails = document.createElement('div');
        categoryDetails.className = 'card';
        categoryDetails.style.marginBottom = '15px';
        categoryDetails.style.padding = '15px';
        
        categoryDetails.innerHTML = `
            <h5>${category}</h5>
            <p>Total: $${categories[category].total.toFixed(2)}</p>
            <p>Percentage: ${percentage}%</p>
            <p>Number of Transactions: ${categories[category].transactions.length}</p>
        `;
        
        reportDetails.appendChild(categoryDetails);
    });
}

// Event listeners
window.onload = function() {
    // Add Chart.js library
    const chartScript = document.createElement('script');
    chartScript.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    document.head.appendChild(chartScript);
    
    // Load saved data
    loadData();
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('transaction-date').value = today;
    document.getElementById('filter-date-to').value = today;
    document.getElementById('report-date-to').value = today;
    
    // Set default from dates to 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
    document.getElementById('filter-date-from').value = thirtyDaysAgoStr;
    document.getElementById('report-date-from').value = thirtyDaysAgoStr;
    
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
    
    // Update transaction button
    document.getElementById('update-transaction-btn').addEventListener('click', function() {
        const id = parseInt(document.getElementById('edit-transaction-id').value);
        const type = document.getElementById('edit-transaction-type').value;
        const name = document.getElementById('edit-transaction-name').value;
        const amount = document.getElementById('edit-transaction-amount').value;
        const date = document.getElementById('edit-transaction-date').value;
        const category = document.getElementById('edit-transaction-category').value;
        
        // Validate inputs
        if (!name || !amount || amount <= 0 || !date) {
            alert('Please fill in all fields with valid values');
            return;
        }
        
        // Edit the transaction
        editTransaction(id, type, name, amount, date, category);
        
        // Close modal
        closeEditModal();
    });
    
    // Close modal button
    document.querySelector('.close').addEventListener('click', closeEditModal);
    
    // Apply filters button
    document.getElementById('apply-filters-btn').addEventListener('click', function() {
        currentFilters.searchTerm = document.getElementById('search-term').value;
        currentFilters.category = document.getElementById('filter-category').value;
        currentFilters.type = document.getElementById('filter-type').value;
        currentFilters.dateFrom = document.getElementById('filter-date-from').value;
        currentFilters.dateTo = document.getElementById('filter-date-to').value;
        
        renderTransactions();
    });
    
    // Reset filters button
    document.getElementById('reset-filters-btn').addEventListener('click', function() {
        document.getElementById('search-term').value = '';
        document.getElementById('filter-category').value = '';
        document.getElementById('filter-type').value = '';
        
        const today = new Date().toISOString().split('T')[0];
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
        
        document.getElementById('filter-date-from').value = thirtyDaysAgoStr;
        document.getElementById('filter-date-to').value = today;
        
        currentFilters = {
            searchTerm: '',
            category: '',
            type: '',
            dateFrom: '',
            dateTo: ''
        };
        
        renderTransactions();
    });
    
    // Generate report button
    document.getElementById('generate-report-btn').addEventListener('click', generateReport);
    
    // When clicking outside the modal, close it
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('edit-modal');
        if (event.target === modal) {
            closeEditModal();
        }
    });
};
