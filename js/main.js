document.addEventListener('DOMContentLoaded', () => {
    // --- User Authentication ---
    const loginForm = document.querySelector('#login-form');
    const registerForm = document.querySelector('#register-form');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = e.target.username.value;
            const password = e.target.password.value;
            
            // Retrieve users from localStorage
            const users = JSON.parse(localStorage.getItem('asset_users')) || [];
            const user = users.find(u => u.username === username && u.password === password);

            if (user) {
                alert('Inicio de sesión exitoso!');
                window.location.href = 'dashboard.html';
            } else {
                alert('Usuario o contraseña incorrectos.');
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('new-username').value;
            const password = document.getElementById('new-password').value;

            const users = JSON.parse(localStorage.getItem('asset_users')) || [];
            
            // Check if user already exists
            if (users.find(u => u.username === username)) {
                alert('Este nombre de usuario ya está en uso.');
                return;
            }

            // Add new user and save to localStorage
            users.push({ username, password });
            localStorage.setItem('asset_users', JSON.stringify(users));

            alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
            window.location.href = 'index.html';
        });
    }

    // --- Activos Page Functionality ---
    const assetTableBody = document.querySelector('.asset-table tbody');
    const modal = document.getElementById('asset-modal');
    const modalTitle = document.getElementById('modal-title');
    const assetForm = document.getElementById('asset-form');
    const closeButton = document.querySelector('.close-button');
    let editingRow = null;

    // Show modal for adding a new asset
    const addAssetButton = document.querySelector('.add-button');
    if (addAssetButton) {
        addAssetButton.addEventListener('click', () => {
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

    // Handle form submission for both add and edit
    if (assetForm) {
        assetForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('asset-id').value;
            const name = document.getElementById('asset-name').value;
            const category = document.getElementById('asset-category').value;
            const date = document.getElementById('asset-date').value;
            const status = document.getElementById('asset-status').value;

            if (editingRow) {
                // Update existing row
                editingRow.cells[1].textContent = name;
                editingRow.cells[2].textContent = category;
                editingRow.cells[3].textContent = date;
                editingRow.cells[4].textContent = status;
                alert('Activo actualizado.');
            } else {
                // Add new row
                const newRow = document.createElement('tr');
                newRow.innerHTML = `
                    <td>${id}</td>
                    <td>${name}</td>
                    <td>${category}</td>
                    <td>${date}</td>
                    <td>${status}</td>
                    <td>
                        <button class="action-button">Editar</button>
                        <button class="action-button delete">Eliminar</button>
                    </td>
                `;
                assetTableBody.appendChild(newRow);
                alert('Nuevo activo añadido.');
            }
            
            modal.style.display = 'none';
            attachActionListeners();
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
        if (e.target.classList.contains('delete')) {
            if (confirm('¿Está seguro de que desea eliminar este activo?')) {
                row.remove();
                alert('Activo eliminado.');
            }
        } else { // Edit button
            editingRow = row;
            modalTitle.textContent = 'Editar Activo';
            document.getElementById('asset-id').value = row.cells[0].textContent;
            document.getElementById('asset-name').value = row.cells[1].textContent;
            document.getElementById('asset-category').value = row.cells[2].textContent;
            document.getElementById('asset-date').value = row.cells[3].textContent;
            document.getElementById('asset-status').value = row.cells[4].textContent;
            modal.style.display = 'block';
        }
    }
    
    attachActionListeners();


    // --- Reportes Page Functionality ---
    const generateReportButton = document.querySelector('.generate-button');
    if (generateReportButton) {
        generateReportButton.addEventListener('click', () => {
            const reportType = document.getElementById('report-type').value;
            const reportContent = document.querySelector('.report-content');
            
            // Sample data for the report
            const data = [
                { id: 1, nombre: 'Laptop Dell XPS 15', categoria: 'Tecnología', estado: 'Asignado' },
                { id: 2, nombre: 'Silla de Oficina Ergonómica', categoria: 'Mobiliario', estado: 'Disponible' },
                { id: 3, nombre: 'Proyector Epson', categoria: 'Tecnología', estado: 'En Mantenimiento' },
                { id: 4, nombre: 'Escritorio de Madera', categoria: 'Mobiliario', estado: 'Asignado' }
            ];

            let tableHTML = `
                <table style="width:100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;">ID</th>
                            <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;">Nombre</th>
                            <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;">Categoría</th>
                            <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            data.forEach(item => {
                tableHTML += `
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;">${item.id}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${item.nombre}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${item.categoria}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${item.estado}</td>
                    </tr>
                `;
            });

            tableHTML += `</tbody></table>`;
            
            reportContent.innerHTML = tableHTML;
            
            // Add download button
            const downloadButton = document.createElement('button');
            downloadButton.textContent = 'Descargar Reporte (CSV)';
            downloadButton.style.marginTop = '1rem';
            downloadButton.addEventListener('click', () => downloadCSV(data));
            reportContent.appendChild(downloadButton);

            alert(`Reporte de "${reportType}" generado exitosamente.`);
        });
    }

    function downloadCSV(data) {
        const headers = ['ID', 'Nombre', 'Categoría', 'Estado'];
        const csvContent = [
            headers.join(','),
            ...data.map(item => [item.id, item.nombre, item.categoria, item.estado].join(','))
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
