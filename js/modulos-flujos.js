// ===== MÓDULO DE FLUJOS DE CAJA =====

// Calcular flujos del período
function calcularFlujosDelPeriodo(mes, año) {
    const resumenIngresos = obtenerResumenIngresos(mes, año);
    const resumenGastos = obtenerResumenGastos(mes, año);
    
    // FLUJO DE GANANCIA (22% del ingreso)
    const gananciaDisponible = Math.round((resumenIngresos.totalGanancia - resumenIngresos.totalDiezmo - resumenGastos.gastoFamiliar) * 100) / 100;
    
    // FLUJO DE COSTO (78% del ingreso)
    const costoDisponible = Math.round((resumenIngresos.totalCosto - resumenGastos.gastoReinversion) * 100) / 100;
    
    return {
        periodo: `${mes}/${año}`,
        
        // FLUJO DE GANANCIA
        flujoGanancia: {
            entrada: resumenIngresos.totalGanancia,
            diezmo: resumenIngresos.totalDiezmo,
            gastosFamiliares: resumenGastos.gastoFamiliar,
            disponible: gananciaDisponible,
            porcentajeEntrada: 22
        },
        
        // FLUJO DE COSTO
        flujoCosto: {
            entrada: resumenIngresos.totalCosto,
            reinversion: resumenGastos.gastoReinversion,
            disponible: costoDisponible,
            porcentajeEntrada: 78
        },
        
        // TOTALES
        totalIngresos: resumenIngresos.totalMonto,
        totalGastos: resumenGastos.totalGastos,
        disponibilidadTotal: Math.round((gananciaDisponible + costoDisponible) * 100) / 100
    };
}

// Obtener historial de flujos (últimos 6 meses)
function obtenerHistorialFlujos(meses = 6) {
    const hoy = new Date();
    const flujos = [];
    
    for (let i = meses - 1; i >= 0; i--) {
        const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
        const mes = fecha.getMonth() + 1;
        const año = fecha.getFullYear();
        
        flujos.push(calcularFlujosDelPeriodo(mes, año));
    }
    
    return flujos;
}

// Comparar flujos entre dos períodos
function compararFlujos(mes1, año1, mes2, año2) {
    const flujo1 = calcularFlujosDelPeriodo(mes1, año1);
    const flujo2 = calcularFlujosDelPeriodo(mes2, año2);
    
    return {
        periodo1: flujo1.periodo,
        periodo2: flujo2.periodo,
        
        ingresosCambio: {
            anterior: flujo1.totalIngresos,
            actual: flujo2.totalIngresos,
            diferencia: flujo2.totalIngresos - flujo1.totalIngresos,
            porcentajeCambio: flujo1.totalIngresos > 0 ? ((flujo2.totalIngresos - flujo1.totalIngresos) / flujo1.totalIngresos * 100).toFixed(1) : 0
        },
        
        gananciaDisponibleCambio: {
            anterior: flujo1.flujoGanancia.disponible,
            actual: flujo2.flujoGanancia.disponible,
            diferencia: flujo2.flujoGanancia.disponible - flujo1.flujoGanancia.disponible,
            porcentajeCambio: flujo1.flujoGanancia.disponible > 0 ? ((flujo2.flujoGanancia.disponible - flujo1.flujoGanancia.disponible) / flujo1.flujoGanancia.disponible * 100).toFixed(1) : 0
        },
        
        costoDisponibleCambio: {
            anterior: flujo1.flujoCosto.disponible,
            actual: flujo2.flujoCosto.disponible,
            diferencia: flujo2.flujoCosto.disponible - flujo1.flujoCosto.disponible,
            porcentajeCambio: flujo1.flujoCosto.disponible > 0 ? ((flujo2.flujoCosto.disponible - flujo1.flujoCosto.disponible) / flujo1.flujoCosto.disponible * 100).toFixed(1) : 0
        }
    };
}

// ===== RENDERIZAR FLUJOS EN UI =====

// Renderizar flujos de caja
function renderFlujos(contenedor, mes = null, año = null) {
    if (!mes || !año) {
        const hoy = new Date();
        mes = hoy.getMonth() + 1;
        año = hoy.getFullYear();
    }
    
    const flujos = calcularFlujosDelPeriodo(mes, año);
    
    const html = `
        <div class="flujos-container">
            
            <!-- FLUJO DE GANANCIA -->
            <div class="flujo-card ganancia">
                <div class="flujo-title">
                    <span>💰</span> Flujo de Ganancia (22%)
                </div>
                
                <div class="flujo-item">
                    <span class="flujo-label">Ingreso Ganancia</span>
                    <span class="flujo-valor" style="color: var(--success);">+$${flujos.flujoGanancia.entrada.toFixed(2)}</span>
                </div>
                
                <div class="flujo-item">
                    <span class="flujo-label">Diezmo (10%)</span>
                    <span class="flujo-valor" style="color: var(--danger);">-$${flujos.flujoGanancia.diezmo.toFixed(2)}</span>
                </div>
                
                <div class="flujo-item">
                    <span class="flujo-label">Gastos Familiares</span>
                    <span class="flujo-valor" style="color: var(--danger);">-$${flujos.flujoGanancia.gastosFamiliares.toFixed(2)}</span>
                </div>
                
                <div class="flujo-item disponible">
                    <span class="flujo-label">Disponible para Familia</span>
                    <span class="flujo-valor">$${flujos.flujoGanancia.disponible.toFixed(2)}</span>
                </div>
            </div>
            
            <!-- FLUJO DE COSTO -->
            <div class="flujo-card costo">
                <div class="flujo-title">
                    <span>🏭</span> Flujo de Costo (78%)
                </div>
                
                <div class="flujo-item">
                    <span class="flujo-label">Ingreso Costo</span>
                    <span class="flujo-valor" style="color: var(--success);">+$${flujos.flujoCosto.entrada.toFixed(2)}</span>
                </div>
                
                <div class="flujo-item">
                    <span class="flujo-label">Reinversión (Compras)</span>
                    <span class="flujo-valor" style="color: var(--danger);">-$${flujos.flujoCosto.reinversion.toFixed(2)}</span>
                </div>
                
                <div class="flujo-item disponible">
                    <span class="flujo-label">Disponible para Reinvertir</span>
                    <span class="flujo-valor">$${flujos.flujoCosto.disponible.toFixed(2)}</span>
                </div>
            </div>
            
        </div>
        
        <!-- RESUMEN TOTAL -->
        <div class="summary-box" style="margin-top: 2rem;">
            <div class="summary-title">📊 Resumen Total del Período ${flujos.periodo}</div>
            <div class="summary-grid">
                <div class="summary-item">
                    <div class="summary-item-label">Total Ingresos</div>
                    <div class="summary-item-value">$${flujos.totalIngresos.toFixed(2)}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-item-label">Total Gastos</div>
                    <div class="summary-item-value">-$${flujos.totalGastos.toFixed(2)}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-item-label">Disponibilidad Total</div>
                    <div class="summary-item-value" style="color: #27ae60; font-weight: 900;">$${flujos.disponibilidadTotal.toFixed(2)}</div>
                </div>
            </div>
        </div>
        
        <!-- DETALLES VISUALES -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-top: 2rem;">
            <div style="background: linear-gradient(135deg, rgba(52, 152, 219, 0.1) 0%, rgba(52, 152, 219, 0.05) 100%); border-left: 4px solid var(--secondary); padding: 1.5rem; border-radius: var(--radius);">
                <div style="font-size: 0.9rem; color: #888; margin-bottom: 0.5rem;">FLUJO GANANCIA</div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <strong style="font-size: 1.3rem;">Entrada: $${flujos.flujoGanancia.entrada.toFixed(2)}</strong>
                </div>
                <div style="background: white; padding: 1rem; border-radius: 4px; font-size: 0.9rem;">
                    <div style="margin-bottom: 0.5rem;">Diezmo: -$${flujos.flujoGanancia.diezmo.toFixed(2)}</div>
                    <div style="margin-bottom: 0.5rem;">Gastos: -$${flujos.flujoGanancia.gastosFamiliares.toFixed(2)}</div>
                    <div style="border-top: 1px solid #ddd; padding-top: 0.5rem; margin-top: 0.5rem; font-weight: 700; color: var(--success);">
                        Disponible: $${flujos.flujoGanancia.disponible.toFixed(2)}
                    </div>
                </div>
            </div>
            
            <div style="background: linear-gradient(135deg, rgba(243, 156, 18, 0.1) 0%, rgba(243, 156, 18, 0.05) 100%); border-left: 4px solid var(--warning); padding: 1.5rem; border-radius: var(--radius);">
                <div style="font-size: 0.9rem; color: #888; margin-bottom: 0.5rem;">FLUJO COSTO</div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <strong style="font-size: 1.3rem;">Entrada: $${flujos.flujoCosto.entrada.toFixed(2)}</strong>
                </div>
                <div style="background: white; padding: 1rem; border-radius: 4px; font-size: 0.9rem;">
                    <div style="margin-bottom: 0.5rem;">Reinversión: -$${flujos.flujoCosto.reinversion.toFixed(2)}</div>
                    <div style="border-top: 1px solid #ddd; padding-top: 0.5rem; margin-top: 0.5rem; font-weight: 700; color: var(--success);">
                        Disponible: $${flujos.flujoCosto.disponible.toFixed(2)}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    contenedor.innerHTML = html;
}

// Renderizar historial de flujos (últimos 6 meses)
function renderHistorialFlujos(contenedor, meses = 6) {
    const historial = obtenerHistorialFlujos(meses);
    
    let html = `
        <div class="lista-container">
            <h3 class="lista-title">📈 Historial de Flujos - Últimos ${meses} Meses</h3>
            
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Período</th>
                            <th style="text-align: right;">Total Ingresos</th>
                            <th style="text-align: right;">Ganancia</th>
                            <th style="text-align: right;">Disponible Ganancia</th>
                            <th style="text-align: right;">Costo</th>
                            <th style="text-align: right;">Disponible Costo</th>
                            <th style="text-align: right;">Disponibilidad Total</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    historial.forEach(flujo => {
        html += `
            <tr>
                <td><strong>${flujo.periodo}</strong></td>
                <td style="text-align: right;">$${flujo.totalIngresos.toFixed(2)}</td>
                <td style="text-align: right; color: var(--secondary);">$${flujo.flujoGanancia.entrada.toFixed(2)}</td>
                <td style="text-align: right; color: var(--success); font-weight: 600;">$${flujo.flujoGanancia.disponible.toFixed(2)}</td>
                <td style="text-align: right; color: var(--warning);">$${flujo.flujoCosto.entrada.toFixed(2)}</td>
                <td style="text-align: right; color: var(--success); font-weight: 600;">$${flujo.flujoCosto.disponible.toFixed(2)}</td>
                <td style="text-align: right; font-weight: 700; color: var(--primary); background: rgba(52, 152, 219, 0.1);">$${flujo.disponibilidadTotal.toFixed(2)}</td>
            </tr>
        `;
    });
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    contenedor.innerHTML = html;
}
