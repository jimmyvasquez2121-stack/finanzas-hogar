// ===== APP PRINCIPAL - ORQUESTACIÓN =====

let mesActual = new Date().getMonth() + 1;
let añoActual = new Date().getFullYear();

// ===== INICIALIZACIÓN =====

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Iniciando Finanzas Hogar v2...');
    
    // Inicializar almacenamiento local
    inicializarAlmacenamiento();
    
    // Registrar service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('✅ Service Worker registrado'))
            .catch(err => console.warn('⚠️ Error registrando Service Worker:', err.message));
    }
    
    // Configurar navegación de tabs
    setupNavigation();
    
    // Cargar tab inicial
    switchTab('dashboard');
    
    // Esperar a que Firebase esté disponible (no es crítico)
    let attempts = 0;
    const maxAttempts = 100;
    
    const checkFirebase = setInterval(() => {
        if (typeof firebase !== 'undefined' && firebase.database) {
            clearInterval(checkFirebase);
            console.log('✅ Firebase disponible, inicializando...');
            initializeFirebase();
        } else {
            attempts++;
            if (attempts >= maxAttempts) {
                clearInterval(checkFirebase);
                console.warn('⚠️ Firebase no disponible - app en modo offline');
            }
        }
    }, 200);
    
    console.log('✅ App inicializada correctamente');
});

// ===== NAVEGACIÓN DE TABS =====

function setupNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Ocultar todas las tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Desactivar todos los botones
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostrar tab seleccionada
    const tabContent = document.getElementById(tabName);
    if (tabContent) {
        tabContent.classList.add('active');
    }
    
    // Activar botón
    const navBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (navBtn) {
        navBtn.classList.add('active');
    }
    
    // Renderizar contenido según la tab
    switch(tabName) {
        case 'dashboard': {
            const container = document.getElementById('dashboard-content');
            if (container) renderDashboard(container, mesActual, añoActual);
            break;
        }
        case 'ingresos': {
            const container = document.getElementById('ingresos-content');
            if (container) renderIngresos(container);
            break;
        }
        case 'gastos': {
            const container = document.getElementById('gastos-content');
            if (container) renderGastos(container);
            break;
        }
        case 'flujos': {
            const container = document.getElementById('flujos-content');
            if (container) renderFlujos(container, mesActual, añoActual);
            break;
        }
        case 'config': {
            const container = document.getElementById('config-content');
            if (container) renderConfiguracion(container);
            break;
        }
    }
}

// ===== TAB: INGRESOS =====

function renderIngresos() {
    const ingresos = document.getElementById('ingresos-content');
    
    // Limpiar contenedor
    ingresos.innerHTML = '';
    
    // Crear wrapper para formulario y lista
    const wrapper = document.createElement('div');
    wrapper.style.display = 'grid';
    wrapper.style.gridTemplateColumns = '1fr 1fr';
    wrapper.style.gap = '2rem';
    wrapper.style.marginBottom = '2rem';
    
    const formContainer = document.createElement('div');
    const listaContainer = document.createElement('div');
    
    wrapper.appendChild(formContainer);
    wrapper.appendChild(listaContainer);
    
    ingresos.appendChild(wrapper);
    
    // Renderizar formulario
    renderFormularioIngreso(formContainer);
    
    // Renderizar lista
    renderListaIngresos(listaContainer, mesActual, añoActual);
    
    // Listeners para editar
    window.addEventListener('editar-ingreso', (e) => {
        renderFormularioIngreso(formContainer, e.detail);
    });
    
    // Listener para actualizar lista
    window.addEventListener('formulario-ingreso-completado', () => {
        renderListaIngresos(listaContainer, mesActual, añoActual);
    });
}

// ===== TAB: GASTOS =====

function renderGastos() {
    const gastos = document.getElementById('gastos-content');
    
    // Limpiar contenedor
    gastos.innerHTML = '';
    
    // Crear wrapper para formulario y lista
    const wrapper = document.createElement('div');
    wrapper.style.display = 'grid';
    wrapper.style.gridTemplateColumns = '1fr 1fr';
    wrapper.style.gap = '2rem';
    wrapper.style.marginBottom = '2rem';
    
    const formContainer = document.createElement('div');
    const listaContainer = document.createElement('div');
    
    wrapper.appendChild(formContainer);
    wrapper.appendChild(listaContainer);
    
    gastos.appendChild(wrapper);
    
    // Renderizar formulario
    renderFormularioGasto(formContainer);
    
    // Renderizar lista
    renderListaGastos(listaContainer, mesActual, añoActual);
    
    // Listeners para editar
    window.addEventListener('editar-gasto', (e) => {
        renderFormularioGasto(formContainer, e.detail);
    });
    
    // Listener para actualizar lista
    window.addEventListener('formulario-gasto-completado', () => {
        renderListaGastos(listaContainer, mesActual, añoActual);
    });
}

// ===== TAB: CONFIGURACIÓN =====

function renderConfiguracion() {
    const config = document.getElementById('config-content');
    const configActual = obtenerConfig();
    
    const html = `
        <div class="config-container">
            
            <div class="section-header">
                <h2>⚙️ Configuración</h2>
            </div>
            
            <!-- PORCENTAJES -->
            <div class="config-item">
                <h3>📊 Porcentajes</h3>
                <p>Configurar los porcentajes de ganancia y diezmo</p>
                
                <form id="form-porcentajes" class="form-container">
                    <div class="form-group">
                        <label for="config-porcentaje-ganancia">Porcentaje de Ganancia (%):</label>
                        <input type="number" id="config-porcentaje-ganancia" min="1" max="99" step="1" value="${configActual.porcentajeGanancia}" required>
                        <small style="color: #666; margin-top: 0.3rem; display: block;">El resto se considera Costo. Actualmente: ${100 - configActual.porcentajeGanancia}% Costo</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="config-porcentaje-diezmo">Porcentaje de Diezmo (% de Ganancia):</label>
                        <input type="number" id="config-porcentaje-diezmo" min="0" max="100" step="1" value="${configActual.porcentajeDiezmo}" required>
                        <small style="color: #666; margin-top: 0.3rem; display: block;">Se calcula sobre la ganancia, no sobre el ingreso total</small>
                    </div>
                    
                    <button type="submit" class="btn btn-primary">💾 Guardar Porcentajes</button>
                </form>
            </div>
            
            <!-- TARJETAS -->
            <div class="config-item">
                <h3>💳 Tarjetas</h3>
                <p>Configurar tarjetas disponibles para gastos</p>
                
                <div id="lista-tarjetas" style="margin-bottom: 1rem;">
                    ${configActual.tarjetas.map((tarjeta, index) => `
                        <div style="background: white; border: 1px solid var(--border); padding: 1rem; border-radius: var(--radius); margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong>${tarjeta.nombre}</strong>
                                <div style="font-size: 0.85rem; color: #888;">Saldo: $${(tarjeta.saldo || 0).toFixed(2)}</div>
                            </div>
                            <div>
                                <button type="button" class="btn-edit btn-edit-tarjeta" data-id="${tarjeta.id}" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">✏️ Editar</button>
                                <button type="button" class="btn-delete btn-delete-tarjeta" data-id="${tarjeta.id}" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">🗑️ Eliminar</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <form id="form-nueva-tarjeta" class="form-container">
                    <div class="form-group">
                        <label for="config-nombre-tarjeta">Nombre de la Tarjeta:</label>
                        <input type="text" id="config-nombre-tarjeta" placeholder="Ej: Tarjeta Crédito 1" required>
                    </div>
                    
                    <button type="submit" class="btn btn-primary">➕ Agregar Tarjeta</button>
                </form>
            </div>
            
            <!-- EMPRESAS -->
            <div class="config-item">
                <h3>🏢 Empresas</h3>
                <p>Configurar empresas y su estado tributario</p>
                
                <div id="lista-empresas" style="margin-bottom: 1rem;">
                    ${configActual.empresas.map(empresa => `
                        <div style="background: white; border: 1px solid var(--border); padding: 1rem; border-radius: var(--radius); margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong>${empresa.nombre}</strong>
                                <div style="font-size: 0.85rem; color: #888;">
                                    ${empresa.sujetos_impuestos ? '🏛️ Sujeta a impuestos (Hacienda)' : '✅ No sujeta a impuestos'}
                                </div>
                            </div>
                            <div>
                                <button type="button" class="btn-edit btn-edit-empresa" data-id="${empresa.id}" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">✏️ Editar</button>
                                <button type="button" class="btn-delete btn-delete-empresa" data-id="${empresa.id}" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">🗑️ Eliminar</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <form id="form-nueva-empresa" class="form-container">
                    <div class="form-group">
                        <label for="config-nombre-empresa">Nombre de la Empresa:</label>
                        <input type="text" id="config-nombre-empresa" placeholder="Ej: Taller de Costura" required>
                    </div>
                    
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="config-sujeta-impuestos"> 
                            ¿Sujeta a impuestos de Hacienda?
                        </label>
                    </div>
                    
                    <button type="submit" class="btn btn-primary">➕ Agregar Empresa</button>
                </form>
            </div>
            
            <!-- RESPALDO Y SINCRONIZACIÓN -->
            <div class="config-item">
                <h3>☁️ Sincronización y Respaldo</h3>
                <p>Gestionar datos, sincronización y respaldos</p>
                
                <div style="display: grid; gap: 0.5rem;">
                    <button id="btn-export" class="btn btn-secondary">📥 Descargar Respaldo (JSON)</button>
                    <button id="btn-sync-firebase" class="btn btn-secondary">🔄 Sincronizar Firebase</button>
                    <button id="btn-historial-flujos" class="btn btn-secondary">📈 Ver Historial Flujos (6 meses)</button>
                </div>
            </div>
            
            <!-- PELIGRO -->
            <div class="config-item danger">
                <h3>⚠️ Zona de Peligro</h3>
                <p>Acciones que no se pueden deshacer</p>
                
                <button id="btn-limpiar-todo" class="btn btn-danger">🗑️ ELIMINAR TODOS LOS DATOS</button>
            </div>
        </div>
    `;
    
    config.innerHTML = html;
    setupConfigListeners();
}

// Setup de listeners en configuración
function setupConfigListeners() {
    // Guardar porcentajes
    document.getElementById('form-porcentajes').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const porcentajeGanancia = parseInt(document.getElementById('config-porcentaje-ganancia').value);
        const porcentajeDiezmo = parseInt(document.getElementById('config-porcentaje-diezmo').value);
        
        actualizarConfig({
            porcentajeGanancia,
            porcentajeDiezmo
        });
        
        alert('✅ Porcentajes actualizados correctamente');
        renderConfiguracion();
    });
    
    // Agregar tarjeta
    document.getElementById('form-nueva-tarjeta').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nombre = document.getElementById('config-nombre-tarjeta').value;
        const config = obtenerConfig();
        
        config.tarjetas.push({
            id: 'tarjeta_' + Date.now(),
            nombre: nombre,
            saldo: 0
        });
        
        actualizarConfig(config);
        alert('✅ Tarjeta agregada correctamente');
        renderConfiguracion();
    });
    
    // Agregar empresa
    document.getElementById('form-nueva-empresa').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nombre = document.getElementById('config-nombre-empresa').value;
        const sujetaImpuestos = document.getElementById('config-sujeta-impuestos').checked;
        const config = obtenerConfig();
        
        config.empresas.push({
            id: 'empresa_' + Date.now(),
            nombre: nombre,
            sujetos_impuestos: sujetaImpuestos
        });
        
        actualizarConfig(config);
        alert('✅ Empresa agregada correctamente');
        renderConfiguracion();
    });
    
    // Botones de acciones
    document.getElementById('btn-export').addEventListener('click', () => {
        exportarDatos();
        alert('✅ Respaldo descargado correctamente');
    });
    
    document.getElementById('btn-sync-firebase').addEventListener('click', async () => {
        alert('🔄 Sincronizando con Firebase...');
        if (window.fullSyncToFirebase) {
            await fullSyncToFirebase();
            alert('✅ Sincronización completada');
        } else {
            alert('⚠️ Firebase no está disponible');
        }
    });
    
    document.getElementById('btn-historial-flujos').addEventListener('click', () => {
        switchTab('flujos');
        setTimeout(() => {
            renderHistorialFlujos(document.getElementById('flujos-content'), 6);
        }, 100);
    });
    
    document.getElementById('btn-limpiar-todo').addEventListener('click', () => {
        if (limpiarTodo()) {
            alert('✅ Todos los datos han sido eliminados');
            renderConfiguracion();
            switchTab('dashboard');
        }
    });
}

// ===== ESCUCHADORES GLOBALES =====

// Escuchar cambios en almacenamiento
window.addEventListener('sincronizacion', () => {
    console.log('🔄 Actualizando UI por sincronización');
    
    // Actualizar la tab actual
    const tabActiva = document.querySelector('.tab-content.active');
    if (tabActiva) {
        const tabName = tabActiva.id.replace('tab-', '');
        switchTab(tabName);
    }
});

// ===== INICIALIZACIÓN EN PANTALLA =====

console.log('%c✅ Finanzas Hogar v2 lista', 'color: green; font-weight: bold; font-size: 14px');
console.log('%c📱 Usuarios: Jimmy (iPhone) + Esposa (Android)', 'color: blue; font-size: 12px');
console.log('%c🔄 Sincronización Firebase activa', 'color: purple; font-size: 12px');
console.log('%c💾 Almacenamiento local disponible', 'color: orange; font-size: 12px');
