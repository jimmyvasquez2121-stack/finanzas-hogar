/**
 * Módulo de Ingresos
 * Gestiona el registro y visualización de ingresos
 */

const ModuloIngresos = {
    // Elementos del DOM
    formIngresos: null,
    listaIngresosContainer: null,
    
    /**
     * Inicializar el módulo
     */
    inicializar() {
        this.formIngresos = document.getElementById('form-ingresos');
        this.listaIngresosContainer = document.getElementById('lista-ingresos');
        
        // Configurar fecha actual
        const hoy = new Date().toISOString().split('T')[0];
        document.getElementById('fecha-ingreso').value = hoy;
        
        // Event listeners
        this.formIngresos.addEventListener('submit', (e) => this.manejarEnvio(e));
        document.getElementById('venta-bruta').addEventListener('input', () => this.actualizarGanancia());
        document.getElementById('costo-produccion').addEventListener('input', () => this.actualizarGanancia());
        
        // Mostrar lista inicial
        this.renderizarLista();
    },
    
    /**
     * Actualizar ganancia neta automáticamente
     */
    actualizarGanancia() {
        const ventaBruta = parseFloat(document.getElementById('venta-bruta').value) || 0;
        const costos = parseFloat(document.getElementById('costo-produccion').value) || 0;
        const gananciaNeta = Calculos.calcularGananciaNeta(ventaBruta, costos);
        
        document.getElementById('ganancia-neta').value = gananciaNeta.toFixed(2);
    },
    
    /**
     * Manejar envío del formulario
     */
    manejarEnvio(e) {
        e.preventDefault();
        
        const ingreso = {
            fecha: document.getElementById('fecha-ingreso').value,
            origen: document.getElementById('origen-ingreso').value,
            venta_bruta: parseFloat(document.getElementById('venta-bruta').value) || 0,
            costo_produccion: parseFloat(document.getElementById('costo-produccion').value) || 0,
            ganancia_neta: parseFloat(document.getElementById('ganancia-neta').value) || 0,
            sujeto_impuesto: document.getElementById('sujeto-impuesto').value,
            notas: document.getElementById('notas-ingreso').value
        };
        
        // Guardar
        Almacenamiento.agregarIngreso(ingreso);
        
        // Limpiar formulario
        this.formIngresos.reset();
        const hoy = new Date().toISOString().split('T')[0];
        document.getElementById('fecha-ingreso').value = hoy;
        document.getElementById('sujeto-impuesto').value = 'no';
        
        // Actualizar lista
        this.renderizarLista();
        
        // Actualizar dashboard
        if (typeof DashboardModule !== 'undefined') {
            DashboardModule.actualizar();
        }
        
        // Mostrar mensaje de éxito
        alert('✅ Ingreso guardado correctamente');
    },
    
    /**
     * Renderizar lista de ingresos
     */
    renderizarLista() {
        const ingresos = Almacenamiento.obtenerIngresos();
        
        if (ingresos.length === 0) {
            this.listaIngresosContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <p>No hay ingresos registrados aún</p>
                </div>
            `;
            return;
        }
        
        // Agrupar por fecha (más reciente primero)
        const ingresosOrdenados = [...ingresos].sort((a, b) => 
            new Date(b.fecha) - new Date(a.fecha)
        );
        
        let html = '<div class="lista-title">📝 Historial de Ingresos</div>';
        html += '<div class="lista-items">';
        
        ingresosOrdenados.forEach(ingreso => {
            const diezmo = Calculos.calcularDiezmo(ingreso.ganancia_neta);
            const impuesto = Calculos.calcularImpuesto(ingreso.ganancia_neta, ingreso.sujeto_impuesto === 'si');
            const neto = ingreso.ganancia_neta - diezmo - impuesto;
            
            const etiquetaOrigen = this.obtenerEtiquetaOrigen(ingreso.origen);
            const etiquetaImpuesto = ingreso.sujeto_impuesto === 'si' ? '⚠️ Con Impuesto' : '';
            
            html += `
                <div class="item-card">
                    <div class="item-header">
                        <div>
                            <div class="item-title">${etiquetaOrigen}</div>
                            <div class="item-date">${this.formatearFecha(ingreso.fecha)}</div>
                        </div>
                        <div class="item-amount positive">$${ingreso.ganancia_neta.toFixed(2)}</div>
                    </div>
                    
                    <div class="item-description">
                        Venta Bruta: <strong>$${ingreso.venta_bruta.toFixed(2)}</strong>
                        ${ingreso.costo_produccion > 0 ? ` | Costos: <strong>$${ingreso.costo_produccion.toFixed(2)}</strong>` : ''}
                    </div>
                    
                    <div class="item-description">
                        Diezmo: <span style="color: #8e44ad;">$${diezmo.toFixed(2)}</span>
                        ${ingreso.sujeto_impuesto === 'si' ? ` | Impuesto: <span style="color: #e67e22;">$${impuesto.toFixed(2)}</span>` : ''}
                        | Neto: <span style="color: #27ae60;"><strong>$${neto.toFixed(2)}</strong></span>
                    </div>
                    
                    ${ingreso.notas ? `<div class="item-description">📌 ${ingreso.notas}</div>` : ''}
                    ${etiquetaImpuesto ? `<div style="color: #e67e22; font-weight: 600; margin-top: 0.5rem;">${etiquetaImpuesto}</div>` : ''}
                    
                    <div class="item-actions">
                        <button class="btn-delete btn-small" onclick="ModuloIngresos.eliminar(${ingreso.id})">🗑️ Eliminar</button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        this.listaIngresosContainer.innerHTML = html;
    },
    
    /**
     * Eliminar un ingreso
     */
    eliminar(id) {
        if (confirm('¿Estás seguro de que quieres eliminar este ingreso?')) {
            Almacenamiento.eliminarIngreso(id);
            this.renderizarLista();
            
            // Actualizar dashboard
            if (typeof DashboardModule !== 'undefined') {
                DashboardModule.actualizar();
            }
            
            alert('✅ Ingreso eliminado');
        }
    },
    
    /**
     * Obtener etiqueta legible del origen
     */
    obtenerEtiquetaOrigen(origen) {
        const etiquetas = {
            'taller': '🪡 Taller de Costura',
            'tienda1': '🛍️ Tienda 1',
            'tienda2': '🛍️ Tienda 2',
            'bazar': '👕 Bazar de Ropa',
            'otro': '➕ Otro Ingreso'
        };
        return etiquetas[origen] || origen;
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
    ModuloIngresos.inicializar();
});
