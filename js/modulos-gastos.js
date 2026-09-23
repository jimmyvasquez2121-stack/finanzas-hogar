// ===== MÓDULO DE GASTOS =====

// Estructura de un gasto
/*
{
    id: 'gasto_timestamp',
    fecha: 'YYYY-MM-DD',
    tipo: 'reinversion' | 'familiar',  // Reinversión → flujo COSTO, Familiar → flujo GANANCIA
    tarjeta: 'tarjeta_id',
    descripcion: 'Compra de tela',
    monto: 100,
    notas: 'Opcional'
}
*/

// ===== TIPOS DE GASTO =====
const TIPOS_GASTO = {
    REINVERSION: 'reinversion',
    NOMINA: 'nomina',
    INTERNET: 'internet',
    ELECTRICIDAD: 'electricidad',
    RENTA: 'renta',
    AGUA: 'agua',
    FAMILIAR: 'familiar'
};

const ETIQUETAS_GASTO = {
    'reinversion': '🏭 Reinversión',
    'nomina': '💼 Nómina/Salarios',
    'internet': '🌐 Internet',
    'electricidad': '💡 Electricidad',
    'renta': '🏢 Renta',
    'agua': '💧 Agua',
    'familiar': '👨‍👩‍👧 Gastos Familiares'
};

const GASTOS_OPERATIVOS = ['reinversion', 'nomina', 'internet', 'electricidad', 'renta', 'agua'];

// ===== GUARDAR GASTO =====

// Guardar nuevo gasto
function guardarNuevoGasto(datos) {
    const validacion = validarGasto(datos);
    if (!validacion.valido) {
        return { exito: false, errores: validacion.errores };
    }
    
    try {
        const gasto = {
            id: datos.id || 'gasto_' + Date.now(),
            fecha: datos.fecha || new Date().toISOString().split('T')[0],
            tipo: datos.tipo,
            tarjeta: datos.tarjeta,
            descripcion: datos.descripcion,
            monto: datos.monto,
            notas: datos.notas || ''
        };
        
        guardarGasto(gasto);
        
        console.log('✅ Gasto guardado:', gasto.id);
        
        window.dispatchEvent(new Event('sincronizacion'));
        
        return { exito: true, id: gasto.id, gasto };
    } catch (error) {
        console.error('❌ Error al guardar gasto:', error);
        return { exito: false, errores: [error.message] };
    }
}

// Actualizar gasto existente
function actualizarGastoExistente(id, datos) {
    const validacion = validarGasto(datos);
    if (!validacion.valido) {
        return { exito: false, errores: validacion.errores };
    }
    
    try {
        const gasto = {
            ...datos,
            id
        };
        
        guardarGasto(gasto);
        
        console.log('✅ Gasto actualizado:', id);
        
        window.dispatchEvent(new Event('sincronizacion'));
        
        return { exito: true, id, gasto };
    } catch (error) {
        console.error('❌ Error al actualizar gasto:', error);
        return { exito: false, errores: [error.message] };
    }
}

// ===== OBTENER RESÚMENES =====

// Obtener resumen de gastos de un período
function obtenerResumenGastos(mes, año) {
    const gastos = obtenerGastosPorMes(mes, año);
    
    let totalOperativos = 0;
    let totalReinversion = 0;
    let totalNomina = 0;
    let totalElectricidad = 0;
    let totalInternet = 0;
    let totalRenta = 0;
    let totalAgua = 0;
    let totalFamiliar = 0;
    
    gastos.forEach(gasto => {
        if (gasto.tipo === TIPOS_GASTO.REINVERSION) {
            totalReinversion += gasto.monto;
            totalOperativos += gasto.monto;
        } else if (gasto.tipo === TIPOS_GASTO.NOMINA) {
            totalNomina += gasto.monto;
            totalOperativos += gasto.monto;
        } else if (gasto.tipo === TIPOS_GASTO.ELECTRICIDAD) {
            totalElectricidad += gasto.monto;
            totalOperativos += gasto.monto;
        } else if (gasto.tipo === TIPOS_GASTO.INTERNET) {
            totalInternet += gasto.monto;
            totalOperativos += gasto.monto;
        } else if (gasto.tipo === TIPOS_GASTO.RENTA) {
            totalRenta += gasto.monto;
            totalOperativos += gasto.monto;
        } else if (gasto.tipo === TIPOS_GASTO.AGUA) {
            totalAgua += gasto.monto;
            totalOperativos += gasto.monto;
        } else if (gasto.tipo === TIPOS_GASTO.FAMILIAR) {
            totalFamiliar += gasto.monto;
        }
    });
    
    return {
        periodo: `${mes}/${año}`,
        totalGastos: Math.round((totalOperativos + totalFamiliar) * 100) / 100,
        gastoOperativos: Math.round(totalOperativos * 100) / 100,
        gastoReinversion: Math.round(totalReinversion * 100) / 100,
        gastoNomina: Math.round(totalNomina * 100) / 100,
        gastoElectricidad: Math.round(totalElectricidad * 100) / 100,
        gastoInternet: Math.round(totalInternet * 100) / 100,
        gastoRenta: Math.round(totalRenta * 100) / 100,
        gastoAgua: Math.round(totalAgua * 100) / 100,
        gastoFamiliar: Math.round(totalFamiliar * 100) / 100,
        cantidad: gastos.length,
        cantidadOperativos: gastos.filter(g => GASTOS_OPERATIVOS.includes(g.tipo)).length,
        cantidadFamiliar: gastos.filter(g => g.tipo === TIPOS_GASTO.FAMILIAR).length,
        gastos
    };
}

// Obtener resumen de gastos por tarjeta
function obtenerResumenGastosPorTarjeta(mes, año) {
    const gastos = obtenerGastosPorMes(mes, año);
    const tarjetas = obtenerTarjetas();
    
    const resumen = {};
    
    tarjetas.forEach(tarjeta => {
        const gastosTarjeta = gastos.filter(g => g.tarjeta === tarjeta.id);
        
        let totalMonto = 0;
        gastosTarjeta.forEach(gasto => {
            totalMonto += gasto.monto;
        });
        
        resumen[tarjeta.id] = {
            nombre: tarjeta.nombre,
            cantidad: gastosTarjeta.length,
            totalMonto: Math.round(totalMonto * 100) / 100,
            gastos: gastosTarjeta
        };
    });
    
    return resumen;
}

// Obtener gastos por tipo (operativos vs familiar)
function obtenerGastosAgrupados(mes, año) {
    const gastos = obtenerGastosPorMes(mes, año);
    
    const operativos = gastos.filter(g => GASTOS_OPERATIVOS.includes(g.tipo));
    const familiar = gastos.filter(g => g.tipo === TIPOS_GASTO.FAMILIAR);
    
    // Ordenar operativos por tipo
    const operativosOrdenados = {
        reinversion: operativos.filter(g => g.tipo === TIPOS_GASTO.REINVERSION),
        nomina: operativos.filter(g => g.tipo === TIPOS_GASTO.NOMINA),
        electricidad: operativos.filter(g => g.tipo === TIPOS_GASTO.ELECTRICIDAD),
        internet: operativos.filter(g => g.tipo === TIPOS_GASTO.INTERNET),
        renta: operativos.filter(g => g.tipo === TIPOS_GASTO.RENTA),
        agua: operativos.filter(g => g.tipo === TIPOS_GASTO.AGUA)
    };
    
    return {
        operativos: operativosOrdenados,
        familiar: familiar
    };
}

// ===== RENDERIZAR GASTOS EN UI =====

// Renderizar formulario de gasto
function renderFormularioGasto(contenedor, gastoExistente = null) {
    const tarjetas = obtenerTarjetas();
    
    const form = document.createElement('form');
    form.className = 'form-container';
    form.innerHTML = `
        <h3>${gastoExistente ? 'Editar Gasto' : 'Registrar Nuevo Gasto'}</h3>
        
        <div class="form-group">
            <label for="gasto-tipo">Tipo de Gasto:</label>
            <select id="gasto-tipo" required>
                <option value="">Seleccionar tipo...</option>
                <optgroup label="📊 Gastos Operativos (Flujo Costo)">
                    <option value="${TIPOS_GASTO.REINVERSION}" ${gastoExistente?.tipo === TIPOS_GASTO.REINVERSION ? 'selected' : ''}>
                        🏭 Reinversión (Compra de productos)
                    </option>
                    <option value="${TIPOS_GASTO.NOMINA}" ${gastoExistente?.tipo === TIPOS_GASTO.NOMINA ? 'selected' : ''}>
                        💼 Nómina/Salarios
                    </option>
                    <option value="${TIPOS_GASTO.ELECTRICIDAD}" ${gastoExistente?.tipo === TIPOS_GASTO.ELECTRICIDAD ? 'selected' : ''}>
                        💡 Electricidad
                    </option>
                    <option value="${TIPOS_GASTO.INTERNET}" ${gastoExistente?.tipo === TIPOS_GASTO.INTERNET ? 'selected' : ''}>
                        🌐 Internet
                    </option>
                    <option value="${TIPOS_GASTO.RENTA}" ${gastoExistente?.tipo === TIPOS_GASTO.RENTA ? 'selected' : ''}>
                        🏢 Renta
                    </option>
                    <option value="${TIPOS_GASTO.AGUA}" ${gastoExistente?.tipo === TIPOS_GASTO.AGUA ? 'selected' : ''}>
                        💧 Agua
                    </option>
                </optgroup>
                <optgroup label="👨‍👩‍👧 Gastos Personales (Flujo Ganancia)">
                    <option value="${TIPOS_GASTO.FAMILIAR}" ${gastoExistente?.tipo === TIPOS_GASTO.FAMILIAR ? 'selected' : ''}>
                        👨‍👩‍👧 Gastos Familiares
                    </option>
                </optgroup>
            </select>
            <small style="color: #666; margin-top: 0.3rem; display: block;">
                • <strong>Gastos Operativos:</strong> Salen del flujo de COSTO
                <br>• <strong>Gastos Familiares:</strong> Salen del flujo de GANANCIA
            </small>
        </div>
        
        <div class="form-group">
            <label for="gasto-fecha">Fecha:</label>
            <input type="date" id="gasto-fecha" value="${gastoExistente?.fecha || new Date().toISOString().split('T')[0]}" required>
        </div>
        
        <div class="form-group">
            <label for="gasto-tarjeta">Tarjeta Utilizada:</label>
            <select id="gasto-tarjeta" required>
                <option value="">Seleccionar tarjeta...</option>
                ${tarjetas.map(t => `<option value="${t.id}" ${gastoExistente?.tarjeta === t.id ? 'selected' : ''}>${t.nombre}</option>`).join('')}
            </select>
        </div>
        
        <div class="form-group">
            <label for="gasto-monto">Monto ($):</label>
            <input type="number" id="gasto-monto" min="0.01" step="0.01" value="${gastoExistente?.monto || ''}" placeholder="0.00" required>
        </div>
        
        <div class="form-group">
            <label for="gasto-descripcion">Descripción:</label>
            <textarea id="gasto-descripcion" placeholder="Detalle del gasto..." required>${gastoExistente?.descripcion || ''}</textarea>
        </div>
        
        <div class="form-group">
            <label for="gasto-notas">Notas (Opcional):</label>
            <textarea id="gasto-notas" placeholder="Información adicional...">${gastoExistente?.notas || ''}</textarea>
        </div>
        
        <button type="submit" class="btn btn-primary">
            ${gastoExistente ? '🔄 Actualizar Gasto' : '✅ Guardar Gasto'}
        </button>
    `;
    
    // Manejo del submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const datos = {
            id: gastoExistente?.id,
            fecha: form.querySelector('#gasto-fecha').value,
            tipo: form.querySelector('#gasto-tipo').value,
            tarjeta: form.querySelector('#gasto-tarjeta').value,
            monto: parseFloat(form.querySelector('#gasto-monto').value),
            descripcion: form.querySelector('#gasto-descripcion').value,
            notas: form.querySelector('#gasto-notas').value
        };
        
        const resultado = gastoExistente
            ? actualizarGastoExistente(datos.id, datos)
            : guardarNuevoGasto(datos);
        
        if (resultado.exito) {
            alert('✅ ' + (gastoExistente ? 'Gasto actualizado' : 'Gasto guardado') + ' exitosamente');
            form.reset();
            window.dispatchEvent(new Event('formulario-gasto-completado'));
        } else {
            alert('❌ Error: ' + resultado.errores.join('\n'));
        }
    });
    
    contenedor.innerHTML = '';
    contenedor.appendChild(form);
}

// Renderizar lista de gastos
function renderListaGastos(contenedor, mes = null, año = null) {
    if (!mes || !año) {
        const hoy = new Date();
        mes = hoy.getMonth() + 1;
        año = hoy.getFullYear();
    }
    
    const resumen = obtenerResumenGastos(mes, año);
    const gastosAgrupados = obtenerGastosAgrupados(mes, año);
    
    const html = `
        <div class="lista-container">
            <h3 class="lista-title">Gastos - ${mes}/${año}</h3>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                <div style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 1rem; border-radius: 8px; text-align: center;">
                    <div style="font-size: 0.85rem; opacity: 0.9;">Total Gastos</div>
                    <div style="font-size: 1.8rem; font-weight: 700;">$${resumen.totalGastos.toFixed(2)}</div>
                    <div style="font-size: 0.8rem; margin-top: 0.5rem;">${resumen.cantidad} transacciones</div>
                </div>
                <div style="background: linear-gradient(135deg, #f39c12 0%, #d68910 100%); color: white; padding: 1rem; border-radius: 8px; text-align: center;">
                    <div style="font-size: 0.85rem; opacity: 0.9;">📊 Gastos Operativos</div>
                    <div style="font-size: 1.8rem; font-weight: 700;">$${resumen.gastoOperativos.toFixed(2)}</div>
                    <div style="font-size: 0.8rem; margin-top: 0.5rem;">${resumen.cantidadOperativos} gastos</div>
                </div>
                <div style="background: linear-gradient(135deg, #e67e22 0%, #c0562c 100%); color: white; padding: 1rem; border-radius: 8px; text-align: center;">
                    <div style="font-size: 0.85rem; opacity: 0.9;">👨‍👩‍👧 Gastos Familiares</div>
                    <div style="font-size: 1.8rem; font-weight: 700;">$${resumen.gastoFamiliar.toFixed(2)}</div>
                    <div style="font-size: 0.8rem; margin-top: 0.5rem;">${resumen.cantidadFamiliar} gastos</div>
                </div>
            </div>
            
            <!-- GASTOS OPERATIVOS POR CATEGORÍA -->
            <h4 style="margin-bottom: 1rem; color: #2c3e50; margin-top: 2rem; font-weight: 700;">📊 Gastos Operativos (Flujo de Costo)</h4>
            
            ${gastosAgrupados.operativos.reinversion.length > 0 ? `
                <div style="margin-bottom: 1.5rem;">
                    <div style="font-weight: 600; color: #555; margin-bottom: 0.5rem;">🏭 Reinversión ($${resumen.gastoReinversion.toFixed(2)})</div>
                    <div class="lista-items">
                        ${gastosAgrupados.operativos.reinversion.map(gasto => renderItemGasto(gasto)).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${gastosAgrupados.operativos.nomina.length > 0 ? `
                <div style="margin-bottom: 1.5rem;">
                    <div style="font-weight: 600; color: #555; margin-bottom: 0.5rem;">💼 Nómina/Salarios ($${resumen.gastoNomina.toFixed(2)})</div>
                    <div class="lista-items">
                        ${gastosAgrupados.operativos.nomina.map(gasto => renderItemGasto(gasto)).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${gastosAgrupados.operativos.electricidad.length > 0 ? `
                <div style="margin-bottom: 1.5rem;">
                    <div style="font-weight: 600; color: #555; margin-bottom: 0.5rem;">💡 Electricidad ($${resumen.gastoElectricidad.toFixed(2)})</div>
                    <div class="lista-items">
                        ${gastosAgrupados.operativos.electricidad.map(gasto => renderItemGasto(gasto)).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${gastosAgrupados.operativos.internet.length > 0 ? `
                <div style="margin-bottom: 1.5rem;">
                    <div style="font-weight: 600; color: #555; margin-bottom: 0.5rem;">🌐 Internet ($${resumen.gastoInternet.toFixed(2)})</div>
                    <div class="lista-items">
                        ${gastosAgrupados.operativos.internet.map(gasto => renderItemGasto(gasto)).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${gastosAgrupados.operativos.renta.length > 0 ? `
                <div style="margin-bottom: 1.5rem;">
                    <div style="font-weight: 600; color: #555; margin-bottom: 0.5rem;">🏢 Renta ($${resumen.gastoRenta.toFixed(2)})</div>
                    <div class="lista-items">
                        ${gastosAgrupados.operativos.renta.map(gasto => renderItemGasto(gasto)).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${gastosAgrupados.operativos.agua.length > 0 ? `
                <div style="margin-bottom: 1.5rem;">
                    <div style="font-weight: 600; color: #555; margin-bottom: 0.5rem;">💧 Agua ($${resumen.gastoAgua.toFixed(2)})</div>
                    <div class="lista-items">
                        ${gastosAgrupados.operativos.agua.map(gasto => renderItemGasto(gasto)).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${Object.values(gastosAgrupados.operativos).every(arr => arr.length === 0) ? `
                <div class="empty-state"><div class="empty-state-icon">🎯</div>No hay gastos operativos registrados</div>
            ` : ''}
            
            <!-- GASTOS FAMILIARES -->
            <h4 style="margin-bottom: 1rem; color: #2c3e50; margin-top: 2rem; font-weight: 700;">👨‍👩‍👧 Gastos Familiares (Flujo de Ganancia)</h4>
            <div class="lista-items">
                ${gastosAgrupados.familiar.length === 0 ? '<div class="empty-state"><div class="empty-state-icon">🏠</div>No hay gastos familiares registrados</div>' : ''}
                ${gastosAgrupados.familiar.map(gasto => renderItemGasto(gasto)).join('')}
            </div>
        </div>
    `;
    
    contenedor.innerHTML = html;
    
    // Agregar listeners
    contenedor.querySelectorAll('.btn-edit-gasto').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            const gasto = obtenerGastoById(id);
            if (gasto) {
                window.scrollTo(0, 0);
                window.dispatchEvent(new CustomEvent('editar-gasto', { detail: gasto }));
            }
        });
    });
    
    contenedor.querySelectorAll('.btn-delete-gasto').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            if (confirm('¿Está seguro que desea eliminar este gasto?')) {
                eliminarGasto(id);
                window.dispatchEvent(new Event('sincronizacion'));
                renderListaGastos(contenedor, mes, año);
            }
        });
    });
}

// Helper para renderizar un item de gasto
function renderItemGasto(gasto) {
    const tarjeta = obtenerTarjetas().find(t => t.id === gasto.tarjeta);
    
    return `
        <div class="item-card">
            <div class="item-header">
                <div>
                    <div class="item-title">${ETIQUETAS_GASTO[gasto.tipo] || gasto.tipo}</div>
                    <div class="item-date">${gasto.fecha} • ${tarjeta?.nombre || 'Tarjeta desconocida'}</div>
                </div>
                <div class="item-amount negative">-$${gasto.monto.toFixed(2)}</div>
            </div>
            <div class="item-description">${gasto.descripcion}</div>
            ${gasto.notas ? `<div style="color: #888; font-size: 0.85rem; margin-top: 0.5rem; font-style: italic;">💬 ${gasto.notas}</div>` : ''}
            <div class="item-actions">
                <button class="btn-edit btn-edit-gasto" data-id="${gasto.id}">✏️ Editar</button>
                <button class="btn-delete btn-delete-gasto" data-id="${gasto.id}">🗑️ Eliminar</button>
            </div>
        </div>
    `;
}
