// ===== MÓDULO DASHBOARD =====

// Renderizar dashboard principal
function renderDashboard(contenedor, mes = null, año = null) {
    if (!mes || !año) {
        const hoy = new Date();
        mes = hoy.getMonth() + 1;
        año = hoy.getFullYear();
    }
    
    const resumenIngresos = obtenerResumenIngresos(mes, año);
    const resumenGastos = obtenerResumenGastos(mes, año);
    const flujos = calcularFlujosDelPeriodo(mes, año);
    
    const html = `
        <div class="dashboard-container">
            
            <!-- SELECTOR DE PERÍODO -->
            <div class="form-container" style="margin-bottom: 2rem;">
                <div style="display: flex; gap: 1rem; align-items: flex-end;">
                    <div style="flex: 1;">
                        <label for="dashboard-mes">Mes:</label>
                        <select id="dashboard-mes" style="padding: 0.8rem; border: 1px solid var(--border); border-radius: var(--radius); width: 100%;">
                            <option value="1" ${mes === 1 ? 'selected' : ''}>Enero</option>
                            <option value="2" ${mes === 2 ? 'selected' : ''}>Febrero</option>
                            <option value="3" ${mes === 3 ? 'selected' : ''}>Marzo</option>
                            <option value="4" ${mes === 4 ? 'selected' : ''}>Abril</option>
                            <option value="5" ${mes === 5 ? 'selected' : ''}>Mayo</option>
                            <option value="6" ${mes === 6 ? 'selected' : ''}>Junio</option>
                            <option value="7" ${mes === 7 ? 'selected' : ''}>Julio</option>
                            <option value="8" ${mes === 8 ? 'selected' : ''}>Agosto</option>
                            <option value="9" ${mes === 9 ? 'selected' : ''}>Septiembre</option>
                            <option value="10" ${mes === 10 ? 'selected' : ''}>Octubre</option>
                            <option value="11" ${mes === 11 ? 'selected' : ''}>Noviembre</option>
                            <option value="12" ${mes === 12 ? 'selected' : ''}>Diciembre</option>
                        </select>
                    </div>
                    <div style="flex: 1;">
                        <label for="dashboard-año">Año:</label>
                        <input type="number" id="dashboard-año" min="2020" max="2099" value="${año}" style="padding: 0.8rem; border: 1px solid var(--border); border-radius: var(--radius); width: 100%;">
                    </div>
                    <button id="btn-cargar-periodo" class="btn btn-primary" style="width: auto;">📅 Cargar</button>
                </div>
            </div>
            
            <!-- ESTADÍSTICAS PRINCIPALES -->
            <div class="stats-grid">
                <div class="stat-card ingreso">
                    <div class="stat-card-icon">📈</div>
                    <div class="stat-card-label">Total Ingresos</div>
                    <div class="stat-card-value">$${resumenIngresos.totalMonto.toFixed(2)}</div>
                    <div class="stat-card-sublabel">${resumenIngresos.cantidad} registros</div>
                </div>
                
                <div class="stat-card ganancia">
                    <div class="stat-card-icon">💰</div>
                    <div class="stat-card-label">Ganancia Bruta</div>
                    <div class="stat-card-value">$${resumenIngresos.totalGanancia.toFixed(2)}</div>
                    <div class="stat-card-sublabel">22% de ingresos</div>
                </div>
                
                <div class="stat-card costo">
                    <div class="stat-card-icon">🏭</div>
                    <div class="stat-card-label">Costo Base</div>
                    <div class="stat-card-value">$${resumenIngresos.totalCosto.toFixed(2)}</div>
                    <div class="stat-card-sublabel">78% de ingresos</div>
                </div>
                
                <div class="stat-card diezmo">
                    <div class="stat-card-icon">🙏</div>
                    <div class="stat-card-label">Diezmos</div>
                    <div class="stat-card-value">$${resumenIngresos.totalDiezmo.toFixed(2)}</div>
                    <div class="stat-card-sublabel">10% de ganancia</div>
                </div>
            </div>
            
            <!-- FLUJOS DUALES -->
            <h3 style="font-size: 1.4rem; color: var(--primary); margin: 2rem 0 1rem 0; font-weight: 700;">📊 Flujos de Caja Disponibles</h3>
            
            <div class="flujos-container">
                <div class="flujo-card ganancia">
                    <div class="flujo-title">
                        <span>💰</span> Flujo de Ganancia (22%)
                    </div>
                    <div class="flujo-item">
                        <span class="flujo-label">Entrada Ganancia</span>
                        <span class="flujo-valor" style="color: var(--success);">+$${flujos.flujoGanancia.entrada.toFixed(2)}</span>
                    </div>
                    <div class="flujo-item">
                        <span class="flujo-label">- Diezmo</span>
                        <span class="flujo-valor" style="color: var(--danger);">-$${flujos.flujoGanancia.diezmo.toFixed(2)}</span>
                    </div>
                    <div class="flujo-item">
                        <span class="flujo-label">- Gastos Familiares</span>
                        <span class="flujo-valor" style="color: var(--danger);">-$${flujos.flujoGanancia.gastosFamiliares.toFixed(2)}</span>
                    </div>
                    <div class="flujo-item disponible">
                        <span class="flujo-label">✅ Disponible</span>
                        <span class="flujo-valor">$${flujos.flujoGanancia.disponible.toFixed(2)}</span>
                    </div>
                </div>
                
                <div class="flujo-card costo">
                    <div class="flujo-title">
                        <span>🏭</span> Flujo de Costo (78%)
                    </div>
                    <div class="flujo-item">
                        <span class="flujo-label">Entrada Costo</span>
                        <span class="flujo-valor" style="color: var(--success);">+$${flujos.flujoCosto.entrada.toFixed(2)}</span>
                    </div>
                    <div class="flujo-item">
                        <span class="flujo-label">- Reinversión</span>
                        <span class="flujo-valor" style="color: var(--danger);">-$${flujos.flujoCosto.reinversion.toFixed(2)}</span>
                    </div>
                    <div class="flujo-item disponible">
                        <span class="flujo-label">✅ Disponible</span>
                        <span class="flujo-valor">$${flujos.flujoCosto.disponible.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            
            <!-- GASTOS -->
            <h3 style="font-size: 1.4rem; color: var(--primary); margin: 2rem 0 1rem 0; font-weight: 700;">💳 Gastos del Período</h3>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-card-icon">🏭</div>
                    <div class="stat-card-label">Reinversión</div>
                    <div class="stat-card-value" style="color: var(--warning);">-$${resumenGastos.gastoReinversion.toFixed(2)}</div>
                    <div class="stat-card-sublabel">${resumenGastos.cantidadReinversion} compras</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-card-icon">👨‍👩‍👧</div>
                    <div class="stat-card-label">Gastos Familiares</div>
                    <div class="stat-card-value" style="color: var(--danger);">-$${resumenGastos.gastoFamiliar.toFixed(2)}</div>
                    <div class="stat-card-sublabel">${resumenGastos.cantidadFamiliar} gastos</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-card-icon">💸</div>
                    <div class="stat-card-label">Total Gastos</div>
                    <div class="stat-card-value" style="color: var(--danger);">-$${resumenGastos.totalGastos.toFixed(2)}</div>
                    <div class="stat-card-sublabel">${resumenGastos.cantidad} transacciones</div>
                </div>
            </div>
            
            <!-- DISPONIBILIDAD TOTAL -->
            <div class="alert alert-success" style="margin-top: 2rem;">
                <div class="alert-icon">✅</div>
                <div class="alert-content">
                    <h4>Disponibilidad Total del Período</h4>
                    <p style="font-size: 1.3rem; margin-top: 0.5rem; font-weight: 700;">
                        <strong>$${flujos.disponibilidadTotal.toFixed(2)}</strong>
                        (Ganancia: $${flujos.flujoGanancia.disponible.toFixed(2)} + Costo: $${flujos.flujoCosto.disponible.toFixed(2)})
                    </p>
                </div>
            </div>
            
            <!-- ANÁLISIS RÁPIDO -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-top: 2rem;">
                <div style="background: white; border: 1px solid var(--border); border-radius: var(--radius); padding: 1.5rem; box-shadow: var(--shadow-sm);">
                    <h4 style="color: var(--primary); margin-bottom: 1rem;">📊 Promedio por Ingreso</h4>
                    <div style="font-size: 0.9rem; line-height: 1.8;">
                        <div><strong>Monto Promedio:</strong> $${resumenIngresos.promedioPorIngreso.toFixed(2)}</div>
                        <div><strong>Ganancia Promedio:</strong> $${(resumenIngresos.totalGanancia / Math.max(resumenIngresos.cantidad, 1)).toFixed(2)}</div>
                        <div><strong>Diezmo Promedio:</strong> $${(resumenIngresos.totalDiezmo / Math.max(resumenIngresos.cantidad, 1)).toFixed(2)}</div>
                    </div>
                </div>
                
                <div style="background: white; border: 1px solid var(--border); border-radius: var(--radius); padding: 1.5rem; box-shadow: var(--shadow-sm);">
                    <h4 style="color: var(--primary); margin-bottom: 1rem;">🎯 Eficiencia</h4>
                    <div style="font-size: 0.9rem; line-height: 1.8;">
                        <div><strong>% Ganancia Gastado (Familia):</strong> ${resumenIngresos.totalGanancia > 0 ? ((resumenGastos.gastoFamiliar / resumenIngresos.totalGanancia) * 100).toFixed(1) : 0}%</div>
                        <div><strong>% Costo Gastado (Reinversión):</strong> ${resumenIngresos.totalCosto > 0 ? ((resumenGastos.gastoReinversion / resumenIngresos.totalCosto) * 100).toFixed(1) : 0}%</div>
                        <div><strong>% Ganancia para Diezmo:</strong> ${resumenIngresos.totalGanancia > 0 ? ((resumenIngresos.totalDiezmo / resumenIngresos.totalGanancia) * 100).toFixed(1) : 0}%</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    contenedor.innerHTML = html;
    
    // Listener para cambio de período
    const btnCargar = contenedor.querySelector('#btn-cargar-periodo');
    const selectMes = contenedor.querySelector('#dashboard-mes');
    const inputAño = contenedor.querySelector('#dashboard-año');
    
    btnCargar.addEventListener('click', () => {
        const nuevoMes = parseInt(selectMes.value);
        const nuevoAño = parseInt(inputAño.value);
        renderDashboard(contenedor, nuevoMes, nuevoAño);
    });
}

// Renderizar tarjeta rápida de estadísticas
function renderTarjetaRapida(contenedor, titulo, icono, valor, subtitulo, color) {
    const html = `
        <div class="stat-card" style="border-left-color: ${color};">
            <div class="stat-card-icon">${icono}</div>
            <div class="stat-card-label">${titulo}</div>
            <div class="stat-card-value" style="color: ${color};">${valor}</div>
            <div class="stat-card-sublabel">${subtitulo}</div>
        </div>
    `;
    
    contenedor.innerHTML = html;
}
