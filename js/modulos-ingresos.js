// ===== MÓDULO DE INGRESOS =====

// Estructura de un ingreso
/*
{
    id: 'ingreso_timestamp',
    fecha: 'YYYY-MM-DD',
    empresa: 'empresa_id',
    monto: 1000,
    descripcion: 'Venta semanal',
    ganancia: 220,           // Calculado: monto * % ganancia
    costo: 780,              // Calculado: monto * % costo
    diezmo: 22,              // Calculado: ganancia * 10%
    impuesto: 0              // Para empresas sujetas a impuestos
}
*/

// ===== CALCULAR FLUJOS AUTOMÁTICOS =====

// Calcular ganancia y costo a partir de un monto
function calcularFlujos(monto) {
    const config = obtenerConfig();
    const porcentajeGanancia = config.porcentajeGanancia || 22;
    const porcentajeCosto = 100 - porcentajeGanancia;
    
    const ganancia = Math.round(monto * (porcentajeGanancia / 100) * 100) / 100;
    const costo = Math.round(monto * (porcentajeCosto / 100) * 100) / 100;
    
    return { ganancia, costo };
}

// Calcular diezmo
function calcularDiezmo(ganancia) {
    const config = obtenerConfig();
    const porcentajeDiezmo = config.porcentajeDiezmo || 10;
    
    const diezmo = Math.round(ganancia * (porcentajeDiezmo / 100) * 100) / 100;
    
    return diezmo;
}

// Crear objeto ingreso completo con cálculos
function crearIngreso(datos) {
    const flujos = calcularFlujos(datos.monto);
    const diezmo = calcularDiezmo(flujos.ganancia);
    
    return {
        id: datos.id || 'ingreso_' + Date.now(),
        fecha: datos.fecha || new Date().toISOString().split('T')[0],
        empresa: datos.empresa,
        monto: datos.monto,
        descripcion: datos.descripcion,
        ganancia: flujos.ganancia,
        costo: flujos.costo,
        diezmo: diezmo,
        impuesto: calcularImpuesto(datos.empresa, flujos.ganancia) || 0
    };
}

// Calcular impuesto según la empresa
function calcularImpuesto(empresaId, ganancia) {
    const empresas = obtenerEmpresas();
    const empresa = empresas.find(e => e.id === empresaId);
    
    if (empresa && empresa.sujetos_impuestos) {
        // Aplicar impuesto (3% de la ganancia por ejemplo)
        return Math.round(ganancia * 0.03 * 100) / 100;
    }
    
    return 0;
}

// ===== GUARDAR INGRESO =====

// Guardar nuevo ingreso y sincronizar
function guardarNuevoIngreso(datos) {
    // Validar datos básicos
    const validacion = validarIngreso(datos);
    if (!validacion.valido) {
        return { exito: false, errores: validacion.errores };
    }
    
    try {
        // Crear ingreso con cálculos
        const ingreso = crearIngreso(datos);
        
        // Guardar en almacenamiento
        const id = guardarIngreso(ingreso);
        
        console.log('✅ Ingreso guardado y sincronizado:', id);
        
        // Disparar evento de actualización
        window.dispatchEvent(new Event('sincronizacion'));
        
        return { exito: true, id, ingreso };
    } catch (error) {
        console.error('❌ Error al guardar ingreso:', error);
        return { exito: false, errores: [error.message] };
    }
}

// Actualizar ingreso existente
function actualizarIngresoExistente(id, datos) {
    const validacion = validarIngreso(datos);
    if (!validacion.valido) {
        return { exito: false, errores: validacion.errores };
    }
    
    try {
        // Crear ingreso con cálculos
        const ingreso = crearIngreso({
            ...datos,
            id
        });
        
        // Guardar actualización
        guardarIngreso(ingreso);
        
        console.log('✅ Ingreso actualizado:', id);
        
        window.dispatchEvent(new Event('sincronizacion'));
        
        return { exito: true, id, ingreso };
    } catch (error) {
        console.error('❌ Error al actualizar ingreso:', error);
        return { exito: false, errores: [error.message] };
    }
}

// ===== OBTENER INGRESOS CON RESUMEN =====

// Obtener resumen de ingresos de un período
function obtenerResumenIngresos(mes, año) {
    const ingresos = obtenerIngresosPorMes(mes, año);
    
    let totalMonto = 0;
    let totalGanancia = 0;
    let totalCosto = 0;
    let totalDiezmo = 0;
    let totalImpuesto = 0;
    
    ingresos.forEach(ingreso => {
        totalMonto += ingreso.monto;
        totalGanancia += ingreso.ganancia;
        totalCosto += ingreso.costo;
        totalDiezmo += ingreso.diezmo;
        totalImpuesto += ingreso.impuesto || 0;
    });
    
    return {
        periodo: `${mes}/${año}`,
        cantidad: ingresos.length,
        totalMonto: Math.round(totalMonto * 100) / 100,
        totalGanancia: Math.round(totalGanancia * 100) / 100,
        totalCosto: Math.round(totalCosto * 100) / 100,
        totalDiezmo: Math.round(totalDiezmo * 100) / 100,
        totalImpuesto: Math.round(totalImpuesto * 100) / 100,
        promedioPorIngreso: ingresos.length > 0 ? Math.round((totalMonto / ingresos.length) * 100) / 100 : 0,
        ingresos
    };
}

// Obtener resumen por empresa
function obtenerResumenPorEmpresa(mes, año) {
    const ingresos = obtenerIngresosPorMes(mes, año);
    const empresas = obtenerEmpresas();
    
    const resumen = {};
    
    empresas.forEach(empresa => {
        const ingresosEmpresa = ingresos.filter(i => i.empresa === empresa.id);
        
        let totalMonto = 0;
        let totalGanancia = 0;
        let totalCosto = 0;
        
        ingresosEmpresa.forEach(ingreso => {
            totalMonto += ingreso.monto;
            totalGanancia += ingreso.ganancia;
            totalCosto += ingreso.costo;
        });
        
        resumen[empresa.id] = {
            nombre: empresa.nombre,
            cantidad: ingresosEmpresa.length,
            totalMonto: Math.round(totalMonto * 100) / 100,
            totalGanancia: Math.round(totalGanancia * 100) / 100,
            totalCosto: Math.round(totalCosto * 100) / 100,
            porcentajeDelTotal: totalMonto > 0 ? Math.round((totalMonto / ingresos.reduce((sum, i) => sum + i.monto, 0) * 100) * 100) / 100 : 0
        };
    });
    
    return resumen;
}

// ===== RENDERIZAR INGRESOS EN UI =====

// Renderizar formulario de ingreso
function renderFormularioIngreso(contenedor, ingresoExistente = null) {
    const empresas = obtenerEmpresas();
    const config = obtenerConfig();
    
    const form = document.createElement('form');
    form.className = 'form-container';
    form.innerHTML = `
        <h3>${ingresoExistente ? 'Editar Ingreso' : 'Registrar Nuevo Ingreso'}</h3>
        
        <div class="form-group">
            <label for="ingreso-fecha">Fecha:</label>
            <input type="date" id="ingreso-fecha" value="${ingresoExistente?.fecha || new Date().toISOString().split('T')[0]}" required>
        </div>
        
        <div class="form-group">
            <label for="ingreso-empresa">Empresa:</label>
            <select id="ingreso-empresa" required>
                <option value="">Seleccionar empresa...</option>
                ${empresas.map(e => `<option value="${e.id}" ${ingresoExistente?.empresa === e.id ? 'selected' : ''}>${e.nombre}</option>`).join('')}
            </select>
        </div>
        
        <div class="form-group">
            <label for="ingreso-monto">Monto Total ($):</label>
            <input type="number" id="ingreso-monto" min="0.01" step="0.01" value="${ingresoExistente?.monto || ''}" placeholder="0.00" required>
        </div>
        
        <div class="form-group">
            <label for="ingreso-descripcion">Descripción:</label>
            <textarea id="ingreso-descripcion" placeholder="Ej: Venta semanal, Devolución, etc.">${ingresoExistente?.descripcion || ''}</textarea>
        </div>
        
        <div class="form-group info-box">
            <strong>ℹ️ Cálculos automáticos:</strong>
            <div style="margin-top: 0.5rem;">
                <div>Porcentaje Ganancia: <strong>${config.porcentajeGanancia}%</strong></div>
                <div>Porcentaje Costo: <strong>${100 - config.porcentajeGanancia}%</strong></div>
                <div style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid #999;">
                    <div id="preview-ganancia">Ganancia: $0.00</div>
                    <div id="preview-costo">Costo: $0.00</div>
                    <div id="preview-diezmo">Diezmo: $0.00</div>
                </div>
            </div>
        </div>
        
        <button type="submit" class="btn btn-primary">
            ${ingresoExistente ? '🔄 Actualizar Ingreso' : '✅ Guardar Ingreso'}
        </button>
    `;
    
    // Actualizar preview en tiempo real
    const montoInput = form.querySelector('#ingreso-monto');
    montoInput.addEventListener('input', () => {
        const monto = parseFloat(montoInput.value) || 0;
        const flujos = calcularFlujos(monto);
        const diezmo = calcularDiezmo(flujos.ganancia);
        
        form.querySelector('#preview-ganancia').textContent = `Ganancia: $${flujos.ganancia.toFixed(2)}`;
        form.querySelector('#preview-costo').textContent = `Costo: $${flujos.costo.toFixed(2)}`;
        form.querySelector('#preview-diezmo').textContent = `Diezmo: $${diezmo.toFixed(2)}`;
    });
    
    // Manejo del submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const datos = {
            id: ingresoExistente?.id,
            fecha: form.querySelector('#ingreso-fecha').value,
            empresa: form.querySelector('#ingreso-empresa').value,
            monto: parseFloat(form.querySelector('#ingreso-monto').value),
            descripcion: form.querySelector('#ingreso-descripcion').value
        };
        
        const resultado = ingresoExistente
            ? actualizarIngresoExistente(datos.id, datos)
            : guardarNuevoIngreso(datos);
        
        if (resultado.exito) {
            alert('✅ ' + (ingresoExistente ? 'Ingreso actualizado' : 'Ingreso guardado') + ' exitosamente');
            form.reset();
            // Trigger actualización de UI
            window.dispatchEvent(new Event('formulario-ingreso-completado'));
        } else {
            alert('❌ Error: ' + resultado.errores.join('\n'));
        }
    });
    
    contenedor.innerHTML = '';
    contenedor.appendChild(form);
    
    // Trigger preview inicial si hay monto
    if (ingresoExistente) {
        montoInput.dispatchEvent(new Event('input'));
    }
}

// Renderizar lista de ingresos
function renderListaIngresos(contenedor, mes = null, año = null) {
    if (!mes || !año) {
        const hoy = new Date();
        mes = hoy.getMonth() + 1;
        año = hoy.getFullYear();
    }
    
    const resumen = obtenerResumenIngresos(mes, año);
    const ingresos = resumen.ingresos;
    
    const html = `
        <div class="lista-container">
            <h3 class="lista-title">Ingresos - ${mes}/${año}</h3>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                <div style="background: linear-gradient(135deg, #27ae60 0%, #229954 100%); color: white; padding: 1rem; border-radius: 8px; text-align: center;">
                    <div style="font-size: 0.85rem; opacity: 0.9;">Total Ingreso</div>
                    <div style="font-size: 1.8rem; font-weight: 700;">$${resumen.totalMonto.toFixed(2)}</div>
                </div>
                <div style="background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); color: white; padding: 1rem; border-radius: 8px; text-align: center;">
                    <div style="font-size: 0.85rem; opacity: 0.9;">Total Ganancia</div>
                    <div style="font-size: 1.8rem; font-weight: 700;">$${resumen.totalGanancia.toFixed(2)}</div>
                </div>
                <div style="background: linear-gradient(135deg, #f39c12 0%, #d68910 100%); color: white; padding: 1rem; border-radius: 8px; text-align: center;">
                    <div style="font-size: 0.85rem; opacity: 0.9;">Total Costo</div>
                    <div style="font-size: 1.8rem; font-weight: 700;">$${resumen.totalCosto.toFixed(2)}</div>
                </div>
                <div style="background: linear-gradient(135deg, #9b59b6 0%, #7d3c98 100%); color: white; padding: 1rem; border-radius: 8px; text-align: center;">
                    <div style="font-size: 0.85rem; opacity: 0.9;">Total Diezmo</div>
                    <div style="font-size: 1.8rem; font-weight: 700;">$${resumen.totalDiezmo.toFixed(2)}</div>
                </div>
            </div>
            
            <div class="lista-items">
                ${ingresos.length === 0 ? '<div class="empty-state"><div class="empty-state-icon">📭</div>No hay ingresos registrados</div>' : ''}
                ${ingresos.map(ingreso => {
                    const empresa = obtenerEmpresas().find(e => e.id === ingreso.empresa);
                    return `
                        <div class="item-card">
                            <div class="item-header">
                                <div>
                                    <div class="item-title">${empresa?.nombre || 'Empresa desconocida'}</div>
                                    <div class="item-date">${ingreso.fecha}</div>
                                </div>
                                <div class="item-amount positive">$${ingreso.monto.toFixed(2)}</div>
                            </div>
                            <div class="item-description">${ingreso.descripcion}</div>
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; font-size: 0.85rem; margin: 0.8rem 0; padding: 0.8rem; background: #f9f9f9; border-radius: 4px;">
                                <div><strong>Ganancia:</strong> $${ingreso.ganancia.toFixed(2)}</div>
                                <div><strong>Costo:</strong> $${ingreso.costo.toFixed(2)}</div>
                                <div><strong>Diezmo:</strong> $${ingreso.diezmo.toFixed(2)}</div>
                            </div>
                            <div class="item-actions">
                                <button class="btn-edit btn-edit-ingreso" data-id="${ingreso.id}">✏️ Editar</button>
                                <button class="btn-delete btn-delete-ingreso" data-id="${ingreso.id}">🗑️ Eliminar</button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
    
    contenedor.innerHTML = html;
    
    // Agregar listeners a botones
    contenedor.querySelectorAll('.btn-edit-ingreso').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            const ingreso = obtenerIngresoById(id);
            if (ingreso) {
                // Scroll al formulario y mostrarlo en modo edición
                window.scrollTo(0, 0);
                window.dispatchEvent(new CustomEvent('editar-ingreso', { detail: ingreso }));
            }
        });
    });
    
    contenedor.querySelectorAll('.btn-delete-ingreso').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            if (confirm('¿Está seguro que desea eliminar este ingreso?')) {
                eliminarIngreso(id);
                window.dispatchEvent(new Event('sincronizacion'));
                renderListaIngresos(contenedor, mes, año);
            }
        });
    });
}
