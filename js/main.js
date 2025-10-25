document.addEventListener('DOMContentLoaded', async () => {
    // --- Generic Modal Functionality ---
    const genericModal = document.getElementById('generic-modal');
    const genericModalTitle = document.getElementById('generic-modal-title');
    const genericModalMessage = document.getElementById('generic-modal-message');
    const genericCloseButton = genericModal ? genericModal.querySelector('.close-button') : null;

    const showModal = (title, message) => {
        if (genericModal) {
            genericModalTitle.textContent = title;
            genericModalMessage.textContent = message;
            genericModal.style.display = 'block';
        } else {
            alert(message);
        }
    };

    if (genericCloseButton) {
        genericCloseButton.addEventListener('click', () => {
            genericModal.style.display = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target == genericModal) {
            genericModal.style.display = 'none';
        }
    });

    // --- Default Admin User ---
    const initializeAdmin = () => {
        const users = JSON.parse(localStorage.getItem('asset_users')) || [];
        if (users.length === 0) {
            users.push({ username: 'admin', password: 'admin' });
            localStorage.setItem('asset_users', JSON.stringify(users));
            console.log('Default admin user created.');
        }
    };
    initializeAdmin();

    // --- User Authentication ---
    const loginForm = document.querySelector('#login-form');
    const registerForm = document.querySelector('#register-form');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = e.target.username.value;
            const password = e.target.password.value;

            if (username.trim() === '' || password.trim() === '') {
                alert('Por favor, ingrese su usuario y contraseña.');
                return;
            }
            
            // Retrieve users from localStorage
            const users = JSON.parse(localStorage.getItem('asset_users')) || [];
            const user = users.find(u => u.username === username && u.password === password);

            if (user) {
                showModal('Éxito', 'Inicio de sesión exitoso!');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                showModal('Error', 'Usuario o contraseña incorrectos.');
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('new-username').value;
            const password = document.getElementById('new-password').value;

            if (username.length < 4) {
                showModal('Error de Validación', 'El nombre de usuario debe tener al menos 4 caracteres.');
                return;
            }

            if (password.length < 6) {
                showModal('Error de Validación', 'La contraseña debe tener al menos 6 caracteres.');
                return;
            }

            const users = JSON.parse(localStorage.getItem('asset_users')) || [];
            
            // Check if user already exists
            if (users.find(u => u.username === username)) {
                showModal('Error', 'Este nombre de usuario ya está en uso.');
                return;
            }

            // Add new user and save to localStorage
            users.push({ username, password });
            localStorage.setItem('asset_users', JSON.stringify(users));

            showModal('Éxito', '¡Registro exitoso! Ahora puedes iniciar sesión.');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        });
    }

    // --- Asset Data Management ---
    const depreciationRates = {
        'Edificaciones': 0.05,
        'Instalaciones, maquinaria, equipos y muebles': 0.10,
        'Vehículos y equipo caminero': 0.20,
        'Equipos de cómputo y software': 0.33,
        'Barcazas y aeronaves': 0.05,
        'Aviones de fumigación': 0.25,
        'Otros aviones': 0.10,
        'Equipo ferroviario': 0.06,
        'Vehículos de carga': 0.25,
        'Vehículos eléctricos ligeros': 0.25,
        'Equipos de Laboratorio': 0.10 // Manteniendo este por si acaso
    };

    const getAssets = () => {
        return JSON.parse(localStorage.getItem('assets')) || [];
    };

    const saveAssets = (assets) => {
        localStorage.setItem('assets', JSON.stringify(assets));
    };

    // Load initial assets from JSON if localStorage is empty
    const initializeAssets = async () => {
        if (!localStorage.getItem('assets')) {
            try {
                const response = await fetch('data/assets.json');
                if (!response.ok) throw new Error('Failed to load initial asset data.');
                const defaultAssets = await response.json();
                saveAssets(defaultAssets);
                console.log('Default assets loaded from data/assets.json');
            } catch (error) {
                console.error(error);
                saveAssets([]); // Initialize with empty array on error
            }
        }
    };

    await initializeAssets();

    // --- Activos Page Functionality ---
    const modal = document.getElementById('asset-modal');
    const modalTitle = document.getElementById('modal-title');
    const assetForm = document.getElementById('asset-form');
    const closeButton = document.querySelector('.close-button');
    let editingRow = null;

    // Show modal for adding a new asset
    const addAssetButton = document.querySelector('.add-button');
    if (addAssetButton) {
        addAssetButton.addEventListener('click', () => {
            const assetTableBody = document.querySelector('#activos-table-body');
            editingRow = null;
            modalTitle.textContent = 'Añadir Activo';
            assetForm.reset();
            document.getElementById('asset-id').value = assetTableBody.rows.length + 1;
            modal.style.display = 'block';
        });
    }

    // Close modal
    if(closeButton) {
        closeButton.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target == modal) {
            modal.style.display = 'none';
        }
    });

    // --- Filter Functionality ---
    const searchInput = document.getElementById('search-input');
    const typeFilter = document.getElementById('type-filter');

    const filterAssets = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const typeValue = typeFilter.value;
        const allAssets = getAssets();

        const filteredAssets = allAssets.filter(asset => {
            const nameMatch = asset.name.toLowerCase().includes(searchTerm);
            const typeMatch = typeValue === '' || asset.type === typeMatch;
            return nameMatch && typeMatch;
        });

        renderAssetTable(filteredAssets);
    };

    if (searchInput && typeFilter) {
        searchInput.addEventListener('input', filterAssets);
        typeFilter.addEventListener('change', filterAssets);
    }

    // Render asset table from localStorage
    const renderAssetTable = (assetsToRender) => {
        const assetTableBody = document.querySelector('#activos-table-body');
        if (!assetTableBody) return;
        const assets = assetsToRender || getAssets();
        assetTableBody.innerHTML = ''; // Clear existing table
        assets.forEach(asset => {
            const row = document.createElement('tr');
            row.dataset.id = asset.id;

            const rate = depreciationRates[asset.type] || 0;
            const totalValue = (asset.quantity || 1) * (asset.price || 0);
            const annualDepreciation = totalValue * rate;

            const purchaseDate = new Date(asset.date);
            const yearsOwned = new Date().getFullYear() - purchaseDate.getFullYear();
            const totalDepreciation = annualDepreciation * yearsOwned;
            const currentValue = totalValue - totalDepreciation;

            row.innerHTML = `
                <td>${asset.id || ''}</td>
                <td>${asset.name || ''}</td>
                <td>${asset.type || ''}</td>
                <td>${asset.responsible || ''}</td>
                <td>${asset.location || ''}</td>
                <td>${asset.quantity || ''}</td>
                <td>$${annualDepreciation.toFixed(2)}</td>
                <td>${(rate * 100).toFixed(0)}%</td>
                <td>${yearsOwned}</td>
                <td>$${currentValue.toFixed(2)}</td>
                <td>${asset.date || ''}</td>
                <td>${asset.status || ''}</td>
                <td>
                    <button class="action-button">Editar</button>
                    <button class="action-button delete">Eliminar</button>
                </td>
            `;
            assetTableBody.appendChild(row);
        });
        attachActionListeners();
    };

    // --- Real-time Depreciation Calculation in Modal ---
    const calculateDepreciation = () => {
        const type = document.getElementById('asset-type').value;
        const quantity = parseInt(document.getElementById('asset-quantity').value) || 0;
        const price = parseFloat(document.getElementById('asset-price').value) || 0;
        
        const rate = depreciationRates[type] || 0;
        const totalValue = quantity * price;
        const annualDepreciation = totalValue * rate;

        document.getElementById('asset-degradation').value = `$${annualDepreciation.toFixed(2)}`;
    };

    if (assetForm) {
        document.getElementById('asset-type').addEventListener('change', calculateDepreciation);
        document.getElementById('asset-quantity').addEventListener('input', calculateDepreciation);
        document.getElementById('asset-price').addEventListener('input', calculateDepreciation);
    }

    // Handle form submission for both add and edit
    if (assetForm) {
        assetForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const assetName = document.getElementById('asset-name').value;
            const assetResponsible = document.getElementById('asset-responsible').value;
            const assetLocation = document.getElementById('asset-location').value;
            const assetQuantity = parseInt(document.getElementById('asset-quantity').value);
            const assetPrice = parseFloat(document.getElementById('asset-price').value);
            const assetDate = document.getElementById('asset-date').value;

            if (!assetName.trim() || !assetResponsible.trim() || !assetLocation.trim() || !assetDate) {
                showModal('Error de Validación', 'Por favor, complete todos los campos.');
                return;
            }

            if (isNaN(assetQuantity) || assetQuantity <= 0) {
                showModal('Error de Validación', 'La cantidad debe ser un número positivo.');
                return;
            }

            if (isNaN(assetPrice) || assetPrice <= 0) {
                showModal('Error de Validación', 'El precio debe ser un número positivo.');
                return;
            }

            const assets = getAssets();
            const assetData = {
                id: document.getElementById('asset-id').value,
                name: assetName,
                type: document.getElementById('asset-type').value,
                responsible: assetResponsible,
                location: assetLocation,
                quantity: assetQuantity,
                price: assetPrice,
                date: assetDate,
                status: document.getElementById('asset-status').value
            };

            if (editingRow) {
                // Update existing asset
                const index = assets.findIndex(a => a.id == assetData.id);
                if (index !== -1) {
                    assets[index] = assetData;
                    showModal('Éxito', 'Activo actualizado.');
                }
            } else {
                // Add new asset
                assetData.id = assets.length > 0 ? Math.max(...assets.map(a => a.id)) + 1 : 1;
                assets.push(assetData);
                showModal('Éxito', 'Nuevo activo añadido.');
            }
            
            saveAssets(assets);
            renderAssetTable();
            modal.style.display = 'none';
        });
    }

    function attachActionListeners() {
        const actionButtons = document.querySelectorAll('.action-button');
        actionButtons.forEach(button => {
            button.removeEventListener('click', handleActionClick);
            button.addEventListener('click', handleActionClick);
        });
    }

    function handleActionClick(e) {
        const row = e.target.closest('tr');
        const assetId = row.dataset.id;
        const assets = getAssets();
        const asset = assets.find(a => a.id == assetId);

        if (e.target.classList.contains('delete')) {
            if (confirm('¿Está seguro de que desea eliminar este activo?')) {
                const updatedAssets = assets.filter(a => a.id != assetId);
                saveAssets(updatedAssets);
                renderAssetTable();
                showModal('Éxito', 'Activo eliminado.');
            }
        } else { // Edit button
            editingRow = row;
            modalTitle.textContent = 'Editar Activo';
            document.getElementById('asset-id').value = asset.id;
            document.getElementById('asset-name').value = asset.name;
            document.getElementById('asset-type').value = asset.type;
            document.getElementById('asset-responsible').value = asset.responsible;
            document.getElementById('asset-location').value = asset.location;
            document.getElementById('asset-quantity').value = asset.quantity;
            document.getElementById('asset-price').value = asset.price;
            document.getElementById('asset-date').value = asset.date;
            document.getElementById('asset-status').value = asset.status;
            
            // Calculate and display depreciation on edit
            const rate = depreciationRates[asset.type] || 0;
            const totalValue = asset.quantity * asset.price;
            const annualDepreciation = totalValue * rate;
            document.getElementById('asset-degradation').value = `$${annualDepreciation.toFixed(2)}`;

            modal.style.display = 'block';
        }
    }
    
    renderAssetTable();


    // --- Dashboard Page Functionality ---
    const updateDashboardWidgets = () => {
        const widgets = document.querySelector('.widgets');
        if (!widgets) return;

        const assets = getAssets();
        const totalAssets = assets.length;
        const assignedAssets = assets.filter(a => a.status === 'Asignado').length;
        const availableAssets = assets.filter(a => a.status === 'Disponible').length;

        document.querySelector('.widget:nth-child(1) p').textContent = totalAssets;
        document.querySelector('.widget:nth-child(2) p').textContent = assignedAssets;
        document.querySelector('.widget:nth-child(3) p').textContent = availableAssets;
    };

    updateDashboardWidgets(); // Update widgets on page load


    // --- Chart Functionality ---
    const renderAssetChart = () => {
        const chartCanvas = document.getElementById('asset-chart');
        if (!chartCanvas) return;

        const assets = getAssets();
        const assetCounts = assets.reduce((acc, asset) => {
            acc[asset.type] = (acc[asset.type] || 0) + 1;
            return acc;
        }, {});

        const chartData = {
            labels: Object.keys(assetCounts),
            datasets: [{
                label: 'Distribución de Activos',
                data: Object.values(assetCounts),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        };

        new Chart(chartCanvas, {
            type: 'pie',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    };

    renderAssetChart();


    // --- Registro Page Functionality ---
    const renderRegistroTables = () => {
        const userTableBody = document.querySelector('#user-table-body');
        const assetTableBody = document.querySelector('#asset-table-body');

        if (userTableBody) {
            const users = JSON.parse(localStorage.getItem('asset_users')) || [];
            userTableBody.innerHTML = '';
            users.forEach((user, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${user.username}</td>
                `;
                userTableBody.appendChild(row);
            });
        }

        if (assetTableBody) {
            const assets = getAssets();
            assetTableBody.innerHTML = '';
            assets.forEach(asset => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${asset.id}</td>
                    <td>${asset.name}</td>
                    <td>${asset.type}</td>
                    <td>${asset.responsible}</td>
                    <td>${asset.location}</td>
                    <td>${asset.status}</td>
                `;
                assetTableBody.appendChild(row);
            });
        }
    };

    renderRegistroTables();



    // --- Reportes Page Functionality ---
    const generateReportButton = document.querySelector('.generate-button');
    if (generateReportButton) {
        generateReportButton.addEventListener('click', () => {
            const reportType = document.getElementById('report-type').value;
            const startDate = document.getElementById('start-date').value;
            const endDate = document.getElementById('end-date').value;
            const reportContent = document.querySelector('.report-content');

            let assets = getAssets();

            // Filter by report type
            if (reportType === 'asignacion') {
                assets = assets.filter(asset => asset.status === 'Asignado');
            } else if (reportType === 'disponibles') {
                assets = assets.filter(asset => asset.status === 'Disponible');
            } else if (reportType === 'mantenimiento') {
                assets = assets.filter(asset => asset.status === 'En Mantenimiento');
            }

            // Filter by date range if dates are provided
            if (startDate && endDate) {
                const start = new Date(startDate);
                const end = new Date(endDate);
                assets = assets.filter(asset => {
                    const assetDate = new Date(asset.date);
                    return assetDate >= start && assetDate <= end;
                });
            }

            if (assets.length === 0) {
                reportContent.innerHTML = '<p>No se encontraron activos que coincidan con los filtros seleccionados.</p>';
                return;
            }

            let tableHTML = `
                <table style="width:100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;">ID</th>
                            <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;">Nombre</th>
                            <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;">Tipo</th>
                            <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;">Responsable</th>
                            <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;">Ubicación</th>
                            <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;">Fecha de Compra</th>
                            <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            assets.forEach(asset => {
                tableHTML += `
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;">${asset.id}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${asset.name}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${asset.type}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${asset.responsible}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${asset.location}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${asset.date}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${asset.status}</td>
                    </tr>
                `;
            });

            tableHTML += `</tbody></table>`;
            
            reportContent.innerHTML = tableHTML;
            
            // Add download button
            const downloadButton = document.createElement('button');
            downloadButton.textContent = 'Descargar Reporte (CSV)';
            downloadButton.style.marginTop = '1rem';
            downloadButton.addEventListener('click', () => downloadCSV(assets));
            reportContent.appendChild(downloadButton);

            alert(`Reporte de "${reportType}" generado exitosamente.`);
        });
    }

    function downloadCSV(data) {
        const headers = ['ID', 'Nombre', 'Tipo', 'Responsable', 'Ubicación', 'Fecha de Compra', 'Estado'];
        const csvContent = [
            headers.join(','),
            ...data.map(item => [item.id, item.name, item.type, item.responsible, item.location, item.date, item.status].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'reporte_activos.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
});
