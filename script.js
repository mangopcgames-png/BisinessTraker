
// ==========================================
// PRODUCT DATA
// ==========================================

let products = JSON.parse(localStorage.getItem("products")) || [];


// ==========================================
// SALES DATA
// ==========================================

let sales = JSON.parse(localStorage.getItem("sales")) || [];


// ==========================================
// EXPENSE DATA
// ==========================================

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];


// ==========================================
// PAGE NAVIGATION
// ==========================================

function showSection(sectionName, clickedButton = null) {

    document.querySelectorAll(".section").forEach(section => {
        section.classList.remove("active");
    });

    const selectedSection =
        document.getElementById(sectionName);

    if (selectedSection) {
        selectedSection.classList.add("active");
    }

    document.querySelectorAll(".nav-btn").forEach(button => {
        button.classList.remove("active");
    });

    if (clickedButton) {
        clickedButton.classList.add("active");
    } else {
        document.querySelectorAll(".nav-btn").forEach(button => {

            if (
                button.getAttribute("onclick")?.includes(sectionName)
            ) {
                button.classList.add("active");
            }

        });
    }

    if (sectionName === "dashboard") {
        updateDashboard();
    }

    if (sectionName === "products") {
        displayProducts();
    }

    if (sectionName === "sales") {
        populateSaleProducts();
        displaySales();
        updateSalesDashboard();
    }

    if (sectionName === "expenses") {
        displayExpenses();
        updateExpensesDashboard();
    }
}


// ==========================================
// PRODUCT FORM
// ==========================================

function openProductForm() {
    document
        .getElementById("productForm")
        .classList.remove("hidden");
}

function closeProductForm() {
    document
        .getElementById("productForm")
        .classList.add("hidden");
}


// ==========================================
// ADD PRODUCT
// ==========================================

function addProduct() {

    const name =
        document.getElementById("productName").value.trim();

    const sku =
        document.getElementById("productSKU").value.trim();

    const buyPrice =
        Number(document.getElementById("buyPrice").value);

    const sellPrice =
        Number(document.getElementById("sellPrice").value);

    const stock =
        Number(document.getElementById("stock").value);

    const supplier =
        document.getElementById("supplier").value.trim();

    if (
        !name ||
        !sku ||
        buyPrice <= 0 ||
        sellPrice <= 0 ||
        stock < 0
    ) {
        alert("Please enter valid product information.");
        return;
    }

    const product = {

        id: Date.now(),

        name: name,

        sku: sku,

        buyPrice: buyPrice,

        sellPrice: sellPrice,

        stock: stock,

        supplier: supplier
    };

    products.push(product);

    saveProducts();

    document.getElementById("productName").value = "";
    document.getElementById("productSKU").value = "";
    document.getElementById("buyPrice").value = "";
    document.getElementById("sellPrice").value = "";
    document.getElementById("stock").value = "";
    document.getElementById("supplier").value = "";

    closeProductForm();

    displayProducts();

    updateDashboard();

    alert("Product added successfully!");
}


// ==========================================
// SAVE PRODUCTS
// ==========================================

function saveProducts() {

    localStorage.setItem(
        "products",
        JSON.stringify(products)
    );
}


// ==========================================
// DISPLAY PRODUCTS
// ==========================================

function displayProducts() {

    const table =
        document.getElementById("productTable");

    if (!table) {
        return;
    }

    const searchInput =
        document.getElementById("searchProduct");

    const search =
        searchInput
            ? searchInput.value.toLowerCase()
            : "";

    table.innerHTML = "";

    const filteredProducts =
        products.filter(product =>

            product.name
                .toLowerCase()
                .includes(search) 

            || product.sku 
                .toLowerCase()
                .includes(search)
        );

    if (filteredProducts.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="7" class="empty">
                    No products found.
                </td>
            </tr>
        `;

        return;
    }

    filteredProducts.forEach(product => {

        const stockClass =
            product.stock <= 5
                ? "low-stock"
                : "";

        const row =
            document.createElement("tr");

        row.innerHTML = `

            <td>${product.name}</td>

            <td>${product.sku}</td>

            <td>
                ₹${product.buyPrice.toFixed(2)}
            </td>

            <td>
                ₹${product.sellPrice.toFixed(2)}
            </td>

            <td class="${stockClass}">
                ${product.stock}
            </td>

            <td>
                ${product.supplier || "-"}
            </td>

            <td>

                <button
                    class="delete-btn"
                    onclick="deleteProduct(${product.id})">

                    Delete

                </button>

            </td>
        `;

        table.appendChild(row);
    });
}


// ==========================================
// DELETE PRODUCT
// ==========================================

function deleteProduct(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this product?"
        );

    if (!confirmed) {
        return;
    }

    products =
        products.filter(product =>
            product.id !== id
        );

    saveProducts();

    displayProducts();

    updateDashboard();

    populateSaleProducts();
}


// ==========================================
// DASHBOARD
// ==========================================

function updateDashboard() {

    // ======================================
    // INVENTORY
    // ======================================

    const totalProducts =
        products.length;

    const totalStock =
        products.reduce(
            (total, product) =>
                total + product.stock,
            0
        );

    const inventoryValue =
        products.reduce(
            (total, product) =>
                total +
                (product.buyPrice * product.stock),
            0
        );

    const lowStock =
        products.filter(product =>
            product.stock > 0 &&
            product.stock <= 5
        ).length;

    const outOfStock =
        products.filter(product =>
            product.stock === 0
        ).length;

    const healthyStock =
        products.filter(product =>
            product.stock > 5
        ).length;


    // ======================================
    // FINANCIALS
    // ======================================

    // Money received from sales
    const revenue =
        sales.reduce(
            (total, sale) =>
                total + sale.total,
            0
        );


    // Actual purchase cost of items sold
    const costOfGoods = sales.reduce(
    (total, sale) => {
        const buyPrice = Number(
            sale.buyPrice ??
            products.find(
                product => product.id === sale.productId
            )?.buyPrice ??
            0
        );

        return total + (buyPrice * sale.quantity);
    },
    0
);


    // Total business expenses
    const totalExpenses =
        expenses.reduce(
            (total, expense) =>
                total + expense.amount,
            0
        );


    // Final profit
    const netProfit =
        revenue -
        costOfGoods -
        totalExpenses;


    // ======================================
    // UPDATE INVENTORY CARDS
    // ======================================

    document.getElementById("totalProducts").textContent =
        totalProducts;

    document.getElementById("totalStock").textContent =
        totalStock;

    document.getElementById("inventoryValue").textContent =
        "₹" + inventoryValue.toFixed(2);

    document.getElementById("lowStock").textContent =
        lowStock;


    // ======================================
    // UPDATE FINANCIAL CARDS
    // ======================================

    const revenueElement =
        document.getElementById("dashboardRevenue");

    const expenseElement =
        document.getElementById("dashboardExpenses");

    const profitElement =
        document.getElementById("dashboardProfit");


    if (revenueElement) {

        revenueElement.textContent =
            "₹" + revenue.toFixed(2);
    }


    if (expenseElement) {

        expenseElement.textContent =
            "₹" + totalExpenses.toFixed(2);
    }


    if (profitElement) {

        profitElement.textContent =
            "₹" + netProfit.toFixed(2);
    }


    // ======================================
    // INVENTORY STATUS
    // ======================================

    const healthyElement =
        document.getElementById("healthyStock");

    const lowElement =
        document.getElementById("dashboardLowStock");

    const outElement =
        document.getElementById("outOfStock");


    if (healthyElement) {
        healthyElement.textContent =
            healthyStock;
    }

    if (lowElement) {
        lowElement.textContent =
            lowStock;
    }

    if (outElement) {
        outElement.textContent =
            outOfStock;
    }


    // ======================================
    // RECENT PRODUCTS
    // ======================================

    displayRecentProducts();


    // ======================================
    // DATE
    // ======================================

    updateDashboardDate();
}
// ==========================================
// RECENT PRODUCTS
// ==========================================

function displayRecentProducts() {

    const container =
        document.getElementById("recentProducts");

    if (!container) {
        return;
    }

    if (products.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    📦
                </div>

                <h4>
                    No products yet
                </h4>

                <p>
                    Add your first product to start
                    managing your inventory.
                </p>

                <button
                    class="primary-btn"
                    onclick="openProductForm()">

                    + Add Product

                </button>

            </div>
        `;

        return;
    }

    const recentProducts =
        products
            .slice(-5)
            .reverse();

    container.innerHTML =
        recentProducts.map(product => `

            <div class="recent-product">

                <div>

                    <strong>
                        ${product.name}
                    </strong>

                    <span>
                        SKU: ${product.sku}
                    </span>

                </div>

                <div class="recent-stock">

                    <small>
                        Stock
                    </small>

                    <strong>
                        ${product.stock}
                    </strong>

                </div>

            </div>

        `).join("");
}


// ==========================================
// DASHBOARD DATE
// ==========================================

function updateDashboardDate() {

    const dateElement =
        document.getElementById("dashboardDate");

    if (!dateElement) {
        return;
    }

    const today =
        new Date();

    const formattedDate =
        today.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });

    dateElement.textContent =
        formattedDate;
}


// ==========================================
// SALES FORM
// ==========================================

function openSaleForm() {

    populateSaleProducts();

    document
        .getElementById("saleForm")
        .classList.remove("hidden");

    updateSalePreview();
}


function closeSaleForm() {

    document
        .getElementById("saleForm")
        .classList.add("hidden");

    document.getElementById("saleQuantity").value = "";

    updateSalePreview();
}


// ==========================================
// POPULATE SALE PRODUCTS
// ==========================================

function populateSaleProducts() {

    const select =
        document.getElementById("saleProduct");

    if (!select) {
        return;
    }

    select.innerHTML =
        `<option value="">
            Select a product
        </option>`;

    products.forEach(product => {

        const option =
            document.createElement("option");

        option.value =
            product.id;

        option.textContent =
            `${product.name} — Stock: ${product.stock}`;

        if (product.stock === 0) {
            option.disabled = true;
        }

        select.appendChild(option);
    });

    updateSalePreview();
}


// ==========================================
// SALE PREVIEW
// ==========================================

function updateSalePreview() {

    const productSelect =
        document.getElementById("saleProduct");

    const quantityInput =
        document.getElementById("saleQuantity");

    const unitPriceElement =
        document.getElementById("saleUnitPrice");

    const totalElement =
        document.getElementById("saleTotal");

    if (
        !productSelect ||
        !quantityInput ||
        !unitPriceElement ||
        !totalElement
    ) {
        return;
    }

    const productId =
        Number(productSelect.value);

    const quantity =
        Number(quantityInput.value);

    const product =
        products.find(product =>
            product.id === productId
        );

    if (!product) {

        unitPriceElement.textContent =
            "₹0.00";

        totalElement.textContent =
            "₹0.00";

        return;
    }

    const total =
        product.sellPrice * quantity;

    unitPriceElement.textContent =
        "₹" + product.sellPrice.toFixed(2);

    totalElement.textContent =
        "₹" + total.toFixed(2);
}


// ==========================================
// ADD SALE
// ==========================================

function addSale() {

    const productId =
        Number(
            document.getElementById("saleProduct").value
        );

    const quantity =
        Number(
            document.getElementById("saleQuantity").value
        );

    if (!productId) {

        alert("Please select a product.");

        return;
    }

    if (!quantity || quantity <= 0) {

        alert("Please enter a valid quantity.");

        return;
    }

    const product =
        products.find(product =>
            product.id === productId
        );

    if (!product) {

        alert("Product not found.");

        return;
    }

    if (quantity > product.stock) {

        alert(
            `Not enough stock. Available stock: ${product.stock}`
        );

        return;
    }

    const sale = {

    id: Date.now(),

    productId: product.id,

    productName: product.name,

    quantity: quantity,

    unitPrice: product.sellPrice,

    buyPrice: product.buyPrice,

    total: product.sellPrice * quantity,

    date: new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    })
};

    sales.push(sale);

    product.stock -= quantity;

    saveProducts();

    saveSales();

    closeSaleForm();

    displayProducts();

    displaySales();

    updateSalesDashboard();

    updateDashboard();

    populateSaleProducts();

    updateFinancialChart();

    alert("Sale recorded successfully!");
}


// ==========================================
// SAVE SALES
// ==========================================

function saveSales() {

    localStorage.setItem(
        "sales",
        JSON.stringify(sales)
    );
}


// ==========================================
// DISPLAY SALES
// ==========================================

function displaySales() {

    const table =
        document.getElementById("salesTable");

    if (!table) {
        return;
    }

    const searchInput =
        document.getElementById("searchSale");

    const search =
        searchInput
            ? searchInput.value.toLowerCase()
            : "";

    table.innerHTML = "";

    const filteredSales =
        sales
            .slice()
            .reverse()
            .filter(sale =>
                sale.productName
                    .toLowerCase()
                    .includes(search)
            );

    if (filteredSales.length === 0) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="empty">

                    No sales found.

                </td>

            </tr>
        `;

        return;
    }

    filteredSales.forEach(sale => {

        const row =
            document.createElement("tr");

        row.innerHTML = `

            <td>
                ${sale.productName}
            </td>

            <td>
                ${sale.quantity}
            </td>

            <td>
                ₹${sale.unitPrice.toFixed(2)}
            </td>

            <td class="sale-total">
                ₹${sale.total.toFixed(2)}
            </td>

            <td class="sale-date">
                ${sale.date}
            </td>

            <td>

                <button
                    class="delete-sale-btn"
                    onclick="deleteSale(${sale.id})">

                    Delete

                </button>

            </td>
        `;

        table.appendChild(row);
    });
}


// ==========================================
// DELETE SALE
// ==========================================

function deleteSale(id) {

    const confirmed =
        confirm(
            "Delete this sale? The sold quantity will be returned to stock."
        );

    if (!confirmed) {
        return;
    }

    const sale =
        sales.find(sale =>
            sale.id === id
        );

    if (!sale) {
        return;
    }

    const product =
        products.find(product =>
            product.id === sale.productId
        );

    if (product) {
        product.stock += sale.quantity;
    }

    sales =
        sales.filter(sale =>
            sale.id !== id
        );

    saveProducts();

    saveSales();

    displaySales();

    displayProducts();

    updateSalesDashboard();

    updateDashboard();

    populateSaleProducts();

    updateFinancialChart();
}


// ==========================================
// SALES DASHBOARD
// ==========================================

function updateSalesDashboard() {

    const totalSales =
        sales.reduce(
            (total, sale) =>
                total + sale.total,
            0
        );

    const totalTransactions =
        sales.length;

    const totalUnitsSold =
        sales.reduce(
            (total, sale) =>
                total + sale.quantity,
            0
        );

    const totalSalesElement =
        document.getElementById("totalSales");

    const totalTransactionsElement =
        document.getElementById("totalTransactions");

    const totalUnitsSoldElement =
        document.getElementById("totalUnitsSold");

    if (totalSalesElement) {

        totalSalesElement.textContent =
            "₹" + totalSales.toFixed(2);
    }

    if (totalTransactionsElement) {

        totalTransactionsElement.textContent =
            totalTransactions;
    }

    if (totalUnitsSoldElement) {

        totalUnitsSoldElement.textContent =
            totalUnitsSold;
    }
}


// ==========================================
// EXPENSE FORM
// ==========================================

function openExpenseForm() {

    document
        .getElementById("expenseForm")
        .classList.remove("hidden");
}


function closeExpenseForm() {

    document
        .getElementById("expenseForm")
        .classList.add("hidden");

    document.getElementById("expenseName").value = "";

    document.getElementById("expenseCategory").value = "";

    document.getElementById("expenseAmount").value = "";

    document.getElementById("expenseDescription").value = "";
}


// ==========================================
// ADD EXPENSE
// ==========================================

function addExpense() {

    const name =
        document
            .getElementById("expenseName")
            .value
            .trim();

    const category =
        document.getElementById("expenseCategory").value;

    const amount =
        Number(
            document.getElementById("expenseAmount").value
        );

    const description =
        document
            .getElementById("expenseDescription")
            .value
            .trim();

    if (!name) {

        alert("Please enter an expense name.");

        return;
    }

    if (!category) {

        alert("Please select a category.");

        return;
    }

    if (!amount || amount <= 0) {

        alert("Please enter a valid amount.");

        return;
    }

    const expense = {

        id: Date.now(),

        name: name,

        category: category,

        amount: amount,

        description: description,

        date: new Date().toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        })
    };

    expenses.push(expense);

    saveExpenses();

    closeExpenseForm();

    displayExpenses();

    updateExpensesDashboard();

    updateFinancialChart();

    alert("Expense recorded successfully!");
}


// ==========================================
// SAVE EXPENSES
// ==========================================

function saveExpenses() {

    localStorage.setItem(
        "expenses",
        JSON.stringify(expenses)
    );
}


// ==========================================
// DISPLAY EXPENSES
// ==========================================

function displayExpenses() {

    const table =
        document.getElementById("expenseTable");

    if (!table) {
        return;
    }

    const searchInput =
        document.getElementById("searchExpense");

    const search =
        searchInput
            ? searchInput.value.toLowerCase()
            : "";

    table.innerHTML = "";

    const filteredExpenses =
        expenses
            .slice()
            .reverse()
            .filter(expense =>

                expense.name
                    .toLowerCase()
                    .includes(search) ||

                expense.category
                    .toLowerCase()
                    .includes(search) ||

                expense.description
                    .toLowerCase()
                    .includes(search)
            );

    if (filteredExpenses.length === 0) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="empty">

                    No expenses found.

                </td>

            </tr>
        `;

        return;
    }

    filteredExpenses.forEach(expense => {

        const row =
            document.createElement("tr");

        row.innerHTML = `

            <td>
                ${expense.name}
            </td>

            <td>

                <span class="expense-category">

                    ${expense.category}

                </span>

            </td>

            <td class="expense-amount">

                ₹${expense.amount.toFixed(2)}

            </td>

            <td>

                ${expense.description || "-"}

            </td>

            <td class="expense-date">

                ${expense.date}

            </td>

            <td>

                <button
                    class="delete-expense-btn"
                    onclick="deleteExpense(${expense.id})">

                    Delete

                </button>

            </td>
        `;

        table.appendChild(row);
    });
}


// ==========================================
// DELETE EXPENSE
// ==========================================

function deleteExpense(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this expense?"
        );

    if (!confirmed) {
        return;
    }

    expenses =
        expenses.filter(expense =>
            expense.id !== id
        );

    saveExpenses();

    displayExpenses();

    updateExpensesDashboard();

    updateFinancialChart();
}


// ==========================================
// EXPENSE DASHBOARD
// ==========================================

function updateExpensesDashboard() {

    const totalExpenses =
        expenses.reduce(
            (total, expense) =>
                total + expense.amount,
            0
        );

    const totalTransactions =
        expenses.length;

    const averageExpense =
        totalTransactions > 0
            ? totalExpenses / totalTransactions
            : 0;

    const totalExpensesElement =
        document.getElementById("totalExpenses");

    const transactionsElement =
        document.getElementById(
            "totalExpenseTransactions"
        );

    const averageElement =
        document.getElementById("averageExpense");

    if (totalExpensesElement) {

        totalExpensesElement.textContent =
            "₹" + totalExpenses.toFixed(2);
    }

    if (transactionsElement) {

        transactionsElement.textContent =
            totalTransactions;
    }

    if (averageElement) {

        averageElement.textContent =
            "₹" + averageExpense.toFixed(2);
    }
}


// ==========================================
// SALE LIVE PREVIEW
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const productSelect =
        document.getElementById("saleProduct");

    const quantityInput =
        document.getElementById("saleQuantity");

    if (productSelect) {

        productSelect.addEventListener(
            "change",
            updateSalePreview
        );
    }

    if (quantityInput) {

        quantityInput.addEventListener(
            "input",
            updateSalePreview
        );
    }
});


// ==========================================
// INITIAL LOAD
// ==========================================

displayProducts();

updateDashboard();

populateSaleProducts();

displaySales();

updateSalesDashboard();

displayExpenses();

updateExpensesDashboard();


/* =================================
   FINANCIAL CHART
================================= */

let financialChart = null;

function updateFinancialChart() {
    const canvas = document.getElementById("financialChart");

    if (!canvas || typeof Chart === "undefined") {
        return;
    }

    const revenue = sales.reduce(
        (sum, sale) => sum + Number(sale.total || 0),
        0
    );

    const costOfGoods = sales.reduce((sum, sale) => {
        const product = products.find(
            item => item.id === sale.productId
        );

        const buyPrice = Number(
            sale.buyPrice ?? product?.buyPrice ?? 0
        );

        return sum + buyPrice * Number(sale.quantity || 0);
    }, 0);

    const totalExpenses = expenses.reduce(
        (sum, expense) => sum + Number(expense.amount || 0),
        0
    );

    const profit = revenue - costOfGoods - totalExpenses;

    const chartData = {
        labels: ["Revenue", "Expenses", "Profit"],
        datasets: [{
            label: "Amount (₹)",
            data: [revenue, totalExpenses, profit],
            backgroundColor: ["#16a36a", "#f59e0b", "#4f7df3"],
            borderRadius: 8,
            borderSkipped: false
        }]
    };

    if (financialChart) {
        financialChart.data = chartData;
        financialChart.update();
        return;
    }

    financialChart = new Chart(canvas, {
        type: "bar",
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: context =>
                            "₹" + context.raw.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => "₹" + value
                    },
                    grid: {
                        color: "#e9edf5"
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

updateFinancialChart();


// ==========================================
// DATA BACKUP & RESTORE
// ==========================================

// EXPORT BACKUP
function exportBackup() {

    const backupData = {
        products: products,
        sales: sales,
        expenses: expenses,
        backupDate: new Date().toISOString(),
        version: "1.0"
    };

    const data =
        JSON.stringify(backupData, null, 2);

    const blob =
        new Blob([data], {
            type: "application/json"
        });

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        `BusinessTrack-Backup-${new Date()
            .toISOString()
            .slice(0, 10)}.json`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    alert("BusinessTrack backup downloaded successfully!");
}


// IMPORT BACKUP
function importBackup(event) {

    const file =
        event.target.files[0];

    if (!file) {
        return;
    }

    if (file.type !== "application/json") {

        alert("Please select a valid BusinessTrack JSON backup file.");

        event.target.value = "";

        return;
    }

    const reader =
        new FileReader();

    reader.onload = function (e) {

        try {

            const backupData =
                JSON.parse(e.target.result);


            // Validate backup structure
            if (
                !Array.isArray(backupData.products) ||
                !Array.isArray(backupData.sales) ||
                !Array.isArray(backupData.expenses)
            ) {

                throw new Error(
                    "Invalid BusinessTrack backup."
                );
            }


            const confirmed =
                confirm(
                    "Importing this backup will replace your current BusinessTrack data. Continue?"
                );

            if (!confirmed) {

                event.target.value = "";

                return;
            }


            // Restore data
            products =
                backupData.products;

            sales =
                backupData.sales;

            expenses =
                backupData.expenses;


            // Save restored data
            saveProducts();

            saveSales();

            saveExpenses();


            // Refresh the application
            displayProducts();

            populateSaleProducts();

            displaySales();

            updateSalesDashboard();

            displayExpenses();

            updateExpensesDashboard();

            updateDashboard();

            updateFinancialChart();


            alert(
                "BusinessTrack data restored successfully!"
            );

        } catch (error) {

            alert(
                "Backup could not be imported. Please select a valid BusinessTrack backup file."
            );

            console.error(
                "Backup import error:",
                error
            );
        }


        // Clear file input
        event.target.value = "";
    };


    reader.readAsText(file);
}