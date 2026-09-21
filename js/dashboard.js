/**
 * Módulo Dashboard
 * Muestra el resumen visual de finanzas
 */

const DashboardModule = {
    container: null,
    
    /**
     * Inicializar el dashboard
     */
    inicializar() {
        this.container = document.getElementById('dashboard-container');
        this.actualizar();
    },
    
    /**
     * Actualizar todo el dashboard
     */
    actualizar() {
        const resumenMes = Calculos.obtenerResumenMes();
        const resumenHoy = Calculos.obtenerResumenHoy();
        const deudasVencidas = Calculos.obtenerDeudasVencidas();
        const deudasProximas = Calculos.obtenerDeudasProximas();
        
        let html = '';
        
        // ========== TARJETAS DE RESUMEN ==========
        html += this.generarTarjetaResumen(
            '💵 Ingresos (Este Mes)',
            `$${resumenMes.totalIngresos.toFixed(2)}`,
            'success'
        );
        
        html += this.generarTarjetaResumen(
            '💸 Gastos (Este Mes)',
            `$${resumenMes.totalGastos.toFixed(2)}`,
            'warning'
        );
        
        html += this.generarTarjetaResumen(
            '📊 Balance (Este Mes)',
            `$${resumenMes.balance.toFixed(2)}`,
            resumenMes.balance >= 0 ? 'success' : 'danger'
        );
        
        html += this.generarTarjetaResumen(
            '💰 Disponible (Neto)',
            `$${resumenMes.disponibleReal.toFixed(2)}`,
            resumenMes.disponibleReal >= 0 ? 'success' : 'danger'
        );
        
        // ========== TARJETA ESPECIAL: DIEZMO E IMPUESTOS ==========
        html += `
            <div class="dashboard-card dashboard-card-special">
                <div class="card-title">⚠️ A APARTAR</div>
                
                <div class="special-item">
                    <div class="special-label">⛪ Diezmo</div>
                    <div class="special-value">$${resumenMes.diezmoAApartar.toFixed(2)}</div>
                </div>
                
                <div class="special-item">
                    <div class="special-label">📄 Impuestos (Hacienda)</div>
                    <div class="special-value">$${resumenMes.impuestoAApartar.toFixed(2)}</div>
                </div>
                
                <div class="special-item" style="background: #fff; border-top: 2px solid var(--primary); margin-top: 0.5rem; padding-top: 0.8rem;">
                    <div class="special-label">✅ Total a Apartar</div>
                    <div class="special-value">${(resumenMes.diezmoAApartar + resumenMes.impuestoAApartar).toFixed(2)}</div>
                </div>
            </div>
        `;
        
        // ========== ALERTAS DE DEUDAS ==========
        if (deudasVencidas.length > 0 || deudasProximas.length > 0) {
            html += `<div class="dashboard-card dashboard-card-alerts">
                <div class="card-title">🚨 ALERTAS - DEUDAS</div>
                <div class="alerts-list">
            `;
            
            // Deudas vencidas
            deudasVencidas.forEach(deuda => {
                const diasVencida = Math.abs(Calculos.totalDeudasPendientes ? 1 : 1);
                html += `
                    <div class="alert-item critical">
                        <div class="alert-icon-box">⛔</div>
                        <div class="alert-content">
                            <div class="alert-content-title">${deuda.acreedor} - VENCIDA</div>
                            <div class="alert-content-text">Adeudas: $${parseFloat(deuda.monto_deuda).toFixed(2)}</div>
                        </div>
                    </div>
                `;
            });
            
            // Deudas próximas
            deudasProximas.forEach(deuda => {
                const dias = Math.ceil((new Date(deuda.fecha_vencimiento) - new Date()) / (1000 * 60 * 60 * 24));
                html += `
                    <div class="alert-item">
                        <div class="alert-icon-box">⏰</div>
                        <div class="alert-content">
                            <div class="alert-content-title">${deuda.acreedor}</div>
                            <div class="alert-content-text">Vence en ${dias} día(s) - $${parseFloat(deuda.monto_deuda).toFixed(2)}</div>
                        </div>
                    </div>
                `;
            });
            
            html += `</div></div>`;
        }
        
        // ========== ACCIONES RÁPIDAS ==========
        html += `
            <div class="dashboard-card dashboard-card-actions">
                <div class="card-title" style="color: white;">⚡ ACCIONES RÁPIDAS</div>
                <div class="quick-actions">
                    <button class="quick-action-btn" onclick="document.querySelector('[data-tab=ingresos]').click()">
                        <span class="quick-action-icon">💵</span>
                        Registrar Ingreso
                    </button>
                    <button class="quick-action-btn" onclick="document.querySelector('[data-tab=gastos]').click()">
                        <span class="quick-action-icon">💸</span>
                        Registrar Gasto
                    </button>
                    <button class="quick-action-btn" onclick="document.querySelector('[data-tab=deudas]').click()">
                        <span class="quick-action-icon">📋</span>
                        Registrar Deuda
                    </button>
                </div>
            </div>
        `;
        
        // ========== ESTADÍSTICAS DEL MES ==========
        html += `
            <div class="dashboard-card dashboard-card-stats">
                <div class="card-title">📈 ESTADÍSTICAS</div>
                <div class="stats-grid">
                    <div class="stat-mini">
                        <div class="stat-mini-label">Transacciones Hoy</div>
                        <div class="stat-mini-value">${resumenHoy.ingresos.length + resumenHoy.gastos.length}</div>
                    </div>
                    <div class="stat-mini">
                        <div class="stat-mini-label">Ingresos Hoy</div>
                        <div class="stat-mini-value" style="color: var(--success);">$${resumenHoy.totalIngresos.toFixed(2)}</div>
                    </div>
                    <div class="stat-mini">
                        <div class="stat-mini-label">Gastos Hoy</div>
                        <div class="stat-mini-value" style="color: var(--danger);">$${resumenHoy.totalGastos.toFixed(2)}</div>
                    </div>
                    <div class="stat-mini">
                        <div class="stat-mini-label">Deudas Pendientes</div>
                        <div class="stat-mini-value" style="color: var(--warning);">$${Calculos.totalDeudasPendientes().toFixed(2)}</div>
                    </div>
                </div>
            </div>
        `;
        
        // ========== TRANSACCIONES RECIENTES ==========
        const transacciones = Calculos.obtenerUltimasTransacciones(8);
        if (transacciones.length > 0) {
            html += `
                <div class="dashboard-card dashboard-card-recent">
                    <div class="card-title">📝 ÚLTIMAS TRANSACCIONES</div>
                    <div class="transactions-list">
            `;
            
            transacciones.forEach(trans => {
                const esIngreso = trans.tipo === 'ingreso';
                const signo = esIngreso ? '+' : '-';
                const color = esIngreso ? 'success' : 'expense';
                
                html += `
                    <div class="transaction-item ${color}">
                        <div class="transaction-info">
                            <div class="transaction-type">${trans.descripcion || (esIngreso ? trans.origen : trans.categoria)}</div>
                            <div class="transaction-date">${this.formatearFecha(trans.fecha)}</div>
                        </div>
                        <div class="transaction-amount ${color}">${signo}$${Math.abs(trans.monto).toFixed(2)}</div>
                    </div>
                `;
            });
            
            html += `</div></div>`;
        }
        
        this.container.innerHTML = html;
    },
    
    /**
     * Generar una tarjeta de resumen
     */
    generarTarjetaResumen(titulo, valor, tipo = 'info') {
        const clases = `dashboard-card ${tipo}`;
        const colorValue = tipo === 'success' ? 'positive' : (tipo === 'danger' ? 'negative' : 'neutral');
        
        return `
            <div class="${clases}">
                <div class="card-title">${titulo}</div>
                <div class="card-value ${colorValue}">${valor}</div>
            </div>
        `;
    },
    
    /**
     * Formatear fecha
     */
    formatearFecha(fecha) {
        const opciones = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(fecha + 'T00:00:00').toLocaleDateString('es-SV', opciones);
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    DashboardModule.inicializar();
});
