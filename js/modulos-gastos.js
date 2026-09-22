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
    REINVERSION: 'reinversion',  // Salen del flujo de COSTO
    FAMILIAR: 'familiar'          // Salen del flujo de GANANCIA
};

const ETIQUETAS_GASTO = {
    'reinversion': '🏭 Reinversión',
    'familiar': '👨‍👩‍👧 Familiar'
};

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
    
    let totalReinversion = 0;
    let totalFamiliar = 0;
    
    gastos.forEach(gasto => {
        if (gasto.tipo === TIPOS_GASTO.REINVERSION) {
            totalReinversion += gasto.monto;
        } else if (gasto.tipo === TIPOS_GASTO.FAMILIAR) {
            totalFamiliar += gasto.monto;
        }
    });
    
    return {
        periodo: `${mes}/${año}`,
        totalGastos: Math.round((totalReinversion + totalFamiliar) * 100) / 100,
        gastoReinversion: Math.round(totalReinversion * 100) / 100,
        gastoFamiliar: Math.round(totalFamiliar * 100) / 100,
        cantidad: gastos.length,
        cantidadReinversion: gastos.filter(g => g.tipo === TIPOS_GASTO.REINVERSION).length,
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

// Obtener gastos por tipo (reinversión vs familiar)
function obtenerGastosAgrupados(mes, año) {
    const gastos = obtenerGastosPorMes(mes, año);
    
    return {
        reinversion: gastos.filter(g => g.tipo === TIPOS_GASTO.REINVERSION),
        familiar: gastos.filter(g => g.tipo === TIPOS_GASTO.FAMILIAR)
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
                <option value="${TIPOS_GASTO.REINVERSION}" ${gastoExistente?.tipo === TIPOS_GASTO.REINVERSION ? 'selected' : ''}>
                    🏭 Reinversión (Compra de productos)
                </option>
                <option value="${TIPOS_GASTO.FAMILIAR}" ${gastoExistente?.tipo === TIPOS_GASTO.FAMILIAR ? 'selected' : ''}>
                    👨‍👩‍👧 Gasto Familiar (Gastos del hogar)
                </option>
            </select>
            <small style="color: #666; margin-top: 0.3rem; display: block;">
                • <strong>Reinversión:</strong> Sale del flujo de COSTO
                <br>• <strong>Familiar:</strong> Sale del flujo de GANANCIA
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
                    <div style="font-size: 0.85rem; opacity: 0.9;">🏭 Reinversión</div>
                    <div style="font-size: 1.8rem; font-weight: 700;">$${resumen.gastoReinversion.toFixed(2)}</div>
                    <div style="font-size: 0.8rem; margin-top: 0.5rem;">${resumen.cantidadReinversion} compras</div>
                </div>
                <div style="background: linear-gradient(135deg, #e67e22 0%, #c0562c 100%); color: white; padding: 1rem; border-radius: 8px; text-align: center;">
                    <div style="font-size: 0.85rem; opacity: 0.9;">👨‍👩‍👧 Familiar</div>
                    <div style="font-size: 1.8rem; font-weight: 700;">$${resumen.gastoFamiliar.toFixed(2)}</div>
                    <div style="font-size: 0.8rem; margin-top: 0.5rem;">${resumen.cantidadFamiliar} gastos</div>
                </div>
            </div>
            
            <div style="margin-bottom: 2rem;">
                <h4 style="margin-bottom: 1rem; color: #2c3e50;">🏭 Gastos de Reinversión (Flujo de Costo)</h4>
                <div class="lista-items">
                    ${gastosAgrupados.reinversion.length === 0 ? '<div class="empty-state"><div class="empty-state-icon">🎯</div>No hay reinversiones registradas</div>' : ''}
                    ${gastosAgrupados.reinversion.map(gasto => renderItemGasto(gasto)).join('')}
                </div>
            </div>
            
            <div>
                <h4 style="margin-bottom: 1rem; color: #2c3e50;">👨‍👩‍👧 Gastos Familiares (Flujo de Ganancia)</h4>
                <div class="lista-items">
                    ${gastosAgrupados.familiar.length === 0 ? '<div class="empty-state"><div class="empty-state-icon">🏠</div>No hay gastos familiares registrados</div>' : ''}
                    ${gastosAgrupados.familiar.map(gasto => renderItemGasto(gasto)).join('')}
                </div>
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
