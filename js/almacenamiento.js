// ===== ALMACENAMIENTO LOCAL =====

const STORAGE_KEY = 'almacenamiento';

// Estructura inicial
const ALMACENAMIENTO_INICIAL = {
    config: {
        porcentajeGanancia: 22,
        porcentajeDiezmo: 10,
        tarjetas: [
            { id: 'tarjeta_1', nombre: 'Tarjeta Crédito 1', saldo: 0 },
            { id: 'tarjeta_2', nombre: 'Tarjeta Débito', saldo: 0 }
        ],
        empresas: [
            { id: 'empresa_1', nombre: 'Taller de Costura', sujetos_impuestos: true },
            { id: 'empresa_2', nombre: 'Tienda 1', sujetos_impuestos: false },
            { id: 'empresa_3', nombre: 'Tienda 2', sujetos_impuestos: false },
            { id: 'empresa_4', nombre: 'Bazar de Ropa', sujetos_impuestos: true }
        ]
    },
    ingresos: [],
    gastos: [],
    flujos: []
};

// ===== INICIALIZAR ALMACENAMIENTO =====
function inicializarAlmacenamiento() {
    if (!localStorage.getItem(STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ALMACENAMIENTO_INICIAL));
        console.log('✅ Almacenamiento inicializado');
    }
}

// ===== GETTERS =====

// Obtener objeto almacenamiento completo
function obtenerAlmacenamiento() {
    const datos = localStorage.getItem(STORAGE_KEY);
    return datos ? JSON.parse(datos) : ALMACENAMIENTO_INICIAL;
}

// Obtener configuración
function obtenerConfig() {
    return obtenerAlmacenamiento().config;
}

// Obtener todos los ingresos
function obtenerIngresos() {
    return obtenerAlmacenamiento().ingresos || [];
}

// Obtener todos los gastos
function obtenerGastos() {
    return obtenerAlmacenamiento().gastos || [];
}

// Obtener un ingreso por ID
function obtenerIngresoById(id) {
    return obtenerIngresos().find(i => i.id === id);
}

// Obtener un gasto por ID
function obtenerGastoById(id) {
    return obtenerGastos().find(g => g.id === id);
}

// Obtener tarjetas
function obtenerTarjetas() {
    return obtenerConfig().tarjetas || [];
}

// Obtener empresas
function obtenerEmpresas() {
    return obtenerConfig().empresas || [];
}

// ===== SETTERS =====

// Guardar ingreso
function guardarIngreso(ingreso) {
    const almacenamiento = obtenerAlmacenamiento();
    
    // Asignar ID si no existe
    if (!ingreso.id) {
        ingreso.id = 'ingreso_' + Date.now();
    }
    
    // Asignar fecha si no existe
    if (!ingreso.fecha) {
        ingreso.fecha = new Date().toISOString().split('T')[0];
    }
    
    // Buscar si existe y actualizar o agregar
    const index = almacenamiento.ingresos.findIndex(i => i.id === ingreso.id);
    
    if (index >= 0) {
        almacenamiento.ingresos[index] = {
            ...almacenamiento.ingresos[index],
            ...ingreso
        };
    } else {
        almacenamiento.ingresos.push(ingreso);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(almacenamiento));
    console.log('✅ Ingreso guardado:', ingreso.id);
    
    // Sincronizar con Firebase si está disponible
    if (window.syncIngresoToFirebase) {
        syncIngresoToFirebase(ingreso);
    }
    
    return ingreso.id;
}

// Guardar gasto
function guardarGasto(gasto) {
    const almacenamiento = obtenerAlmacenamiento();
    
    // Asignar ID si no existe
    if (!gasto.id) {
        gasto.id = 'gasto_' + Date.now();
    }
    
    // Asignar fecha si no existe
    if (!gasto.fecha) {
        gasto.fecha = new Date().toISOString().split('T')[0];
    }
    
    // Buscar si existe y actualizar o agregar
    const index = almacenamiento.gastos.findIndex(g => g.id === gasto.id);
    
    if (index >= 0) {
        almacenamiento.gastos[index] = {
            ...almacenamiento.gastos[index],
            ...gasto
        };
    } else {
        almacenamiento.gastos.push(gasto);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(almacenamiento));
    console.log('✅ Gasto guardado:', gasto.id);
    
    // Sincronizar con Firebase si está disponible
    if (window.syncGastoToFirebase) {
        syncGastoToFirebase(gasto);
    }
    
    return gasto.id;
}

// Actualizar configuración
function actualizarConfig(configNueva) {
    const almacenamiento = obtenerAlmacenamiento();
    almacenamiento.config = {
        ...almacenamiento.config,
        ...configNueva
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(almacenamiento));
    console.log('✅ Configuración actualizada');
    
    // Sincronizar con Firebase si está disponible
    if (window.syncConfigToFirebase) {
        syncConfigToFirebase(almacenamiento.config);
    }
}

// ===== ELIMINAR =====

// Eliminar ingreso
function eliminarIngreso(id) {
    const almacenamiento = obtenerAlmacenamiento();
    almacenamiento.ingresos = almacenamiento.ingresos.filter(i => i.id !== id);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(almacenamiento));
    console.log('✅ Ingreso eliminado:', id);
    
    // Eliminar de Firebase si está disponible
    if (window.deleteIngresoFromFirebase) {
        deleteIngresoFromFirebase(id);
    }
}

// Eliminar gasto
function eliminarGasto(id) {
    const almacenamiento = obtenerAlmacenamiento();
    almacenamiento.gastos = almacenamiento.gastos.filter(g => g.id !== id);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(almacenamiento));
    console.log('✅ Gasto eliminado:', id);
    
    // Eliminar de Firebase si está disponible
    if (window.deleteGastoFromFirebase) {
        deleteGastoFromFirebase(id);
    }
}

// ===== FILTROS =====

// Obtener ingresos de un mes específico
function obtenerIngresosPorMes(mes, año) {
    return obtenerIngresos().filter(ingreso => {
        const fecha = new Date(ingreso.fecha);
        return fecha.getMonth() + 1 === mes && fecha.getFullYear() === año;
    });
}

// Obtener gastos de un mes específico
function obtenerGastosPorMes(mes, año) {
    return obtenerGastos().filter(gasto => {
        const fecha = new Date(gasto.fecha);
        return fecha.getMonth() + 1 === mes && fecha.getFullYear() === año;
    });
}

// Obtener gastos por tipo
function obtenerGastosPorTipo(tipo) {
    return obtenerGastos().filter(gasto => gasto.tipo === tipo);
}

// Obtener gastos por tarjeta
function obtenerGastosPorTarjeta(tarjetaId) {
    return obtenerGastos().filter(gasto => gasto.tarjeta === tarjetaId);
}

// Obtener ingresos por empresa
function obtenerIngresosPorEmpresa(empresaId) {
    return obtenerIngresos().filter(ingreso => ingreso.empresa === empresaId);
}

// ===== VALIDACIÓN =====

// Validar que un ingreso tenga datos requeridos
function validarIngreso(ingreso) {
    const errores = [];
    
    if (!ingreso.monto || ingreso.monto <= 0) {
        errores.push('El monto debe ser mayor a 0');
    }
    
    if (!ingreso.empresa) {
        errores.push('Debe seleccionar una empresa');
    }
    
    if (!ingreso.descripcion || ingreso.descripcion.trim() === '') {
        errores.push('La descripción no puede estar vacía');
    }
    
    return {
        valido: errores.length === 0,
        errores
    };
}

// Validar que un gasto tenga datos requeridos
function validarGasto(gasto) {
    const errores = [];
    
    if (!gasto.monto || gasto.monto <= 0) {
        errores.push('El monto debe ser mayor a 0');
    }
    
    if (!gasto.tipo) {
        errores.push('Debe seleccionar un tipo de gasto');
    }
    
    if (!gasto.tarjeta) {
        errores.push('Debe seleccionar una tarjeta');
    }
    
    if (!gasto.descripcion || gasto.descripcion.trim() === '') {
        errores.push('La descripción no puede estar vacía');
    }
    
    return {
        valido: errores.length === 0,
        errores
    };
}

// ===== EXPORTAR/IMPORTAR =====

// Exportar datos a JSON
function exportarDatos() {
    const almacenamiento = obtenerAlmacenamiento();
    const fecha = new Date().toISOString().split('T')[0];
    const nombreArchivo = `finanzas_backup_${fecha}.json`;
    
    const elemento = document.createElement('a');
    elemento.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(almacenamiento, null, 2)));
    elemento.setAttribute('download', nombreArchivo);
    elemento.style.display = 'none';
    document.body.appendChild(elemento);
    elemento.click();
    document.body.removeChild(elemento);
    
    console.log('✅ Datos exportados:', nombreArchivo);
}

// Limpiar todos los datos (PELIGROSO)
function limpiarTodo() {
    if (confirm('⚠️ ¿Está seguro que desea ELIMINAR todos los datos? Esta acción no se puede deshacer.')) {
        localStorage.removeItem(STORAGE_KEY);
        inicializarAlmacenamiento();
        console.log('✅ Todos los datos han sido eliminados');
        window.dispatchEvent(new Event('sincronizacion'));
        return true;
    }
    return false;
}
