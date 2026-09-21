/**
 * Módulo de Gastos
 * Gestiona el registro y visualización de gastos del hogar
 */

const ModuloGastos = {
    // Elementos del DOM
    formGastos: null,
    listaGastosContainer: null,
    
    /**
     * Inicializar el módulo
     */
    inicializar() {
        this.formGastos = document.getElementById('form-gastos');
        this.listaGastosContainer = document.getElementById('lista-gastos');
        
        // Configurar fecha actual
        const hoy = new Date().toISOString().split('T')[0];
        document.getElementById('fecha-gasto').value = hoy;
        
        // Event listeners
        this.formGastos.addEventListener('submit', (e) => this.manejarEnvio(e));
        
        // Mostrar lista inicial
        this.renderizarLista();
    },
    
    /**
     * Manejar envío del formulario
     */
    manejarEnvio(e) {
        e.preventDefault();
        
        const gasto = {
            fecha: document.getElementById('fecha-gasto').value,
            categoria: document.getElementById('categoria-gasto').value,
            monto: parseFloat(document.getElementById('monto-gasto').value) || 0,
            descripcion: document.getElementById('descripcion-gasto').value
        };
        
        // Validar
        if (gasto.monto <= 0) {
            alert('⚠️ El monto debe ser mayor a 0');
            return;
        }
        
        // Guardar
        Almacenamiento.agregarGasto(gasto);
        
        // Sincronizar con Firebase
        if (typeof FirebaseSync !== 'undefined') {
            FirebaseSync.sincronizarGastos();
        }
        
        // Limpiar formulario
        this.formGastos.reset();
        const hoy = new Date().toISOString().split('T')[0];
        document.getElementById('fecha-gasto').value = hoy;
        
        // Actualizar lista
        this.renderizarLista();
        
        // Actualizar dashboard
        if (typeof DashboardModule !== 'undefined') {
            DashboardModule.actualizar();
        }
        
        // Mostrar mensaje de éxito
        alert('✅ Gasto guardado correctamente');
    },
    
    /**
     * Renderizar lista de gastos
     */
    renderizarLista() {
        const gastos = Almacenamiento.obtenerGastos();
        
        if (gastos.length === 0) {
            this.listaGastosContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">💸</div>
                    <p>No hay gastos registrados aún</p>
                </div>
            `;
            return;
        }
        
        // Agrupar por fecha (más reciente primero)
        const gastosOrdenados = [...gastos].sort((a, b) => 
            new Date(b.fecha) - new Date(a.fecha)
        );
        
        let html = '<div class="lista-title">💰 Historial de Gastos</div>';
        html += '<div class="lista-items">';
        
        // Agrupar por fecha para mejor visualización
        let fechaActual = null;
        let totalPorFecha = 0;
        
        gastosOrdenados.forEach((gasto, index) => {
            // Mostrar encabezado de fecha si cambió
            if (gasto.fecha !== fechaActual) {
                if (fechaActual !== null) {
                    html += `<div style="text-align: right; font-weight: 600; color: var(--danger); margin: 1rem 0; padding: 0.5rem 1rem; background: var(--light); border-radius: 4px;">Total: $${totalPorFecha.toFixed(2)}</div>`;
                }
                fechaActual = gasto.fecha;
                totalPorFecha = 0;
                html += `<div style="font-weight: 600; color: var(--primary); margin: 1.5rem 0 1rem 0; font-size: 1rem;">📅 ${this.formatearFecha(gasto.fecha)}</div>`;
            }
            
            totalPorFecha += parseFloat(gasto.monto) || 0;
            
            const etiquetaCategoria = this.obtenerEtiquetaCategoria(gasto.categoria);
            
            html += `
                <div class="item-card">
                    <div class="item-header">
                        <div>
                            <div class="item-title">${etiquetaCategoria}</div>
                            <div class="item-description">${gasto.descripcion || 'Sin descripción'}</div>
                        </div>
                        <div class="item-amount negative">-$${parseFloat(gasto.monto).toFixed(2)}</div>
                    </div>
                    
                    <div class="item-actions">
                        <button class="btn-delete btn-small" onclick="ModuloGastos.eliminar(${gasto.id})">🗑️ Eliminar</button>
                    </div>
                </div>
            `;
        });
        
        // Mostrar total del último día
        if (fechaActual !== null) {
            html += `<div style="text-align: right; font-weight: 600; color: var(--danger); margin: 1rem 0; padding: 0.5rem 1rem; background: var(--light); border-radius: 4px;">Total: $${totalPorFecha.toFixed(2)}</div>`;
        }
        
        html += '</div>';
        this.listaGastosContainer.innerHTML = html;
    },
    
    /**
     * Eliminar un gasto
     */
    eliminar(id) {
        if (confirm('¿Estás seguro de que quieres eliminar este gasto?')) {
            Almacenamiento.eliminarGasto(id);
            this.renderizarLista();
            
            // Actualizar dashboard
            if (typeof DashboardModule !== 'undefined') {
                DashboardModule.actualizar();
            }
            
            alert('✅ Gasto eliminado');
        }
    },
    
    /**
     * Obtener etiqueta legible de la categoría
     */
    obtenerEtiquetaCategoria(categoria) {
        const etiquetas = {
            'servicios': '⚡ Servicios (Luz, Agua, Gas)',
            'comida': '🍽️ Comida/Despensa',
            'transporte': '🚗 Transporte',
            'medicinas': '💊 Medicinas/Salud',
            'ropa': '👕 Ropa/Accesorios',
            'diezmo': '⛪ Diezmo (Iglesia)',
            'impuestos': '📄 Impuestos (Hacienda)',
            'otro': '➕ Otro'
        };
        return etiquetas[categoria] || categoria;
    },
    
    /**
     * Formatear fecha
     */
    formatearFecha(fecha) {
        const opciones = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(fecha + 'T00:00:00').toLocaleDateString('es-SV', opciones);
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    ModuloGastos.inicializar();
});
