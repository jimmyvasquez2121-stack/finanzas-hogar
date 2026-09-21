/**
 * Módulo de Deudas
 * Gestiona el registro y visualización de deudas y compromisos
 */

const ModuloDeudas = {
    // Elementos del DOM
    formDeudas: null,
    listaDeudasContainer: null,
    
    /**
     * Inicializar el módulo
     */
    inicializar() {
        this.formDeudas = document.getElementById('form-deudas');
        this.listaDeudasContainer = document.getElementById('lista-deudas');
        
        // Configurar fecha de vencimiento (por defecto en 30 días)
        const fechaVencimiento = new Date();
        fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);
        document.getElementById('fecha-vencimiento').value = fechaVencimiento.toISOString().split('T')[0];
        
        // Event listeners
        this.formDeudas.addEventListener('submit', (e) => this.manejarEnvio(e));
        
        // Mostrar lista inicial
        this.renderizarLista();
    },
    
    /**
     * Manejar envío del formulario
     */
    manejarEnvio(e) {
        e.preventDefault();
        
        const deuda = {
            acreedor: document.getElementById('acreedor').value,
            monto_deuda: parseFloat(document.getElementById('monto-deuda').value) || 0,
            fecha_vencimiento: document.getElementById('fecha-vencimiento').value,
            estado: document.getElementById('estado-deuda').value,
            notas: document.getElementById('notas-deuda').value
        };
        
        // Validar
        if (deuda.monto_deuda <= 0) {
            alert('⚠️ El monto debe ser mayor a 0');
            return;
        }
        
        if (!deuda.acreedor.trim()) {
            alert('⚠️ Debes ingresar el acreedor o concepto');
            return;
        }
        
        // Guardar
        Almacenamiento.agregarDeuda(deuda);
        
        // Sincronizar con Firebase
        if (typeof FirebaseSync !== 'undefined') {
            FirebaseSync.sincronizarDeudas();
        }
        
        // Limpiar formulario
        this.formDeudas.reset();
        const fechaVencimiento = new Date();
        fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);
        document.getElementById('fecha-vencimiento').value = fechaVencimiento.toISOString().split('T')[0];
        document.getElementById('estado-deuda').value = 'pendiente';
        
        // Actualizar lista
        this.renderizarLista();
        
        // Actualizar dashboard
        if (typeof DashboardModule !== 'undefined') {
            DashboardModule.actualizar();
        }
        
        // Mostrar mensaje de éxito
        alert('✅ Deuda guardada correctamente');
    },
    
    /**
     * Renderizar lista de deudas
     */
    renderizarLista() {
        const deudas = Almacenamiento.obtenerDeudas();
        
        if (deudas.length === 0) {
            this.listaDeudasContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">✅</div>
                    <p>¡Sin deudas registradas! 🎉</p>
                </div>
            `;
            return;
        }
        
        let html = '<div class="lista-title">📋 Deudas y Compromisos</div>';
        
        // Separar por estado
        const deudaVencidas = deudas.filter(d => d.estado === 'vencida');
        const deudaPendientes = deudas.filter(d => d.estado === 'pendiente');
        const deudaPagadas = deudas.filter(d => d.estado === 'pagada');
        
        // Deudas Vencidas
        if (deudaVencidas.length > 0) {
            html += '<div style="margin-top: 1.5rem;">';
            html += '<h3 style="color: var(--danger); font-size: 1.1rem; margin-bottom: 1rem;">⚠️ VENCIDAS (URGENTE)</h3>';
            html += '<div class="lista-items">';
            
            deudaVencidas.forEach(deuda => {
                html += this.generarTarjetaDeuda(deuda, 'vencida');
            });
            
            html += '</div></div>';
        }
        
        // Deudas Pendientes
        if (deudaPendientes.length > 0) {
            html += '<div style="margin-top: 1.5rem;">';
            html += '<h3 style="color: var(--warning); font-size: 1.1rem; margin-bottom: 1rem;">⏰ PENDIENTES</h3>';
            html += '<div class="lista-items">';
            
            deudaPendientes.forEach(deuda => {
                html += this.generarTarjetaDeuda(deuda, 'pendiente');
            });
            
            html += '</div></div>';
        }
        
        // Deudas Pagadas
        if (deudaPagadas.length > 0) {
            html += '<div style="margin-top: 1.5rem;">';
            html += '<h3 style="color: var(--success); font-size: 1.1rem; margin-bottom: 1rem;">✅ PAGADAS</h3>';
            html += '<div class="lista-items">';
            
            deudaPagadas.slice(0, 5).forEach(deuda => {
                html += this.generarTarjetaDeuda(deuda, 'pagada');
            });
            
            if (deudaPagadas.length > 5) {
                html += `<div style="text-align: center; color: #999; padding: 1rem;">+${deudaPagadas.length - 5} más...</div>`;
            }
            
            html += '</div></div>';
        }
        
        this.listaDeudasContainer.innerHTML = html;
    },
    
    /**
     * Generar tarjeta de deuda
     */
    generarTarjetaDeuda(deuda, estado) {
        const diasFaltantes = this.calcularDiasFaltantes(deuda.fecha_vencimiento);
        let etiquetaDias = '';
        
        if (estado === 'vencida') {
            etiquetaDias = `<span style="color: var(--danger);">Vencida hace ${Math.abs(diasFaltantes)} día(s)</span>`;
        } else if (estado === 'pendiente') {
            if (diasFaltantes <= 3) {
                etiquetaDias = `<span style="color: var(--danger);">⚠️ Vence en ${diasFaltantes} día(s)</span>`;
            } else {
                etiquetaDias = `<span style="color: var(--secondary);">Vence en ${diasFaltantes} día(s)</span>`;
            }
        } else {
            etiquetaDias = `<span style="color: var(--success);">Pagada</span>`;
        }
        
        return `
            <div class="item-card">
                <div class="item-header">
                    <div>
                        <div class="item-title">${deuda.acreedor}</div>
                        <div class="item-date">${this.formatearFecha(deuda.fecha_vencimiento)}</div>
                    </div>
                    <div class="item-amount" style="color: ${estado === 'pagada' ? 'var(--success)' : 'var(--danger)'};">
                        $${parseFloat(deuda.monto_deuda).toFixed(2)}
                    </div>
                </div>
                
                <div class="item-description">
                    ${etiquetaDias}
                </div>
                
                ${deuda.notas ? `<div class="item-description">📌 ${deuda.notas}</div>` : ''}
                
                <div class="item-actions">
                    ${estado !== 'pagada' ? `<button class="btn-edit btn-small" onclick="ModuloDeudas.marcarPagada(${deuda.id})">✅ Marcar Pagada</button>` : ''}
                    <button class="btn-delete btn-small" onclick="ModuloDeudas.eliminar(${deuda.id})">🗑️ Eliminar</button>
                </div>
            </div>
        `;
    },
    
    /**
     * Marcar deuda como pagada
     */
    marcarPagada(id) {
        Almacenamiento.actualizarDeuda(id, { estado: 'pagada' });
        this.renderizarLista();
        
        if (typeof DashboardModule !== 'undefined') {
            DashboardModule.actualizar();
        }
        
        alert('✅ Deuda marcada como pagada');
    },
    
    /**
     * Eliminar una deuda
     */
    eliminar(id) {
        if (confirm('¿Estás seguro de que quieres eliminar esta deuda?')) {
            Almacenamiento.eliminarDeuda(id);
            this.renderizarLista();
            
            if (typeof DashboardModule !== 'undefined') {
                DashboardModule.actualizar();
            }
            
            alert('✅ Deuda eliminada');
        }
    },
    
    /**
     * Calcular días faltantes para vencimiento
     */
    calcularDiasFaltantes(fechaVencimiento) {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        const vencimiento = new Date(fechaVencimiento + 'T00:00:00');
        const diferencia = vencimiento - hoy;
        const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24));
        
        return dias;
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
    ModuloDeudas.inicializar();
});
