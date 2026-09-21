/**
 * Módulo de Almacenamiento Local
 * Gestiona la persistencia de datos usando localStorage
 */

const Almacenamiento = {
    // Prefijo para todas las claves
    PREFIX: 'finanzas_hogar_',
    
    /**
     * Obtener todos los datos
     */
    obtenerDatos() {
        return {
            ingresos: this.obtener('ingresos') || [],
            gastos: this.obtener('gastos') || [],
            deudas: this.obtener('deudas') || [],
            configuracion: this.obtener('configuracion') || {
                porcentajeImpuesto: 5,
                porcentajeDiezmo: 10,
                nombreUsuario: 'Jimmy'
            }
        };
    },
    
    /**
     * Guardar un item
     */
    guardar(clave, valor) {
        try {
            const datosProcesados = JSON.stringify(valor);
            localStorage.setItem(this.PREFIX + clave, datosProcesados);
            return true;
        } catch (error) {
            console.error('Error al guardar en localStorage:', error);
            return false;
        }
    },
    
    /**
     * Obtener un item
     */
    obtener(clave) {
        try {
            const datos = localStorage.getItem(this.PREFIX + clave);
            return datos ? JSON.parse(datos) : null;
        } catch (error) {
            console.error('Error al obtener de localStorage:', error);
            return null;
        }
    },
    
    /**
     * Eliminar un item
     */
    eliminar(clave) {
        try {
            localStorage.removeItem(this.PREFIX + clave);
            return true;
        } catch (error) {
            console.error('Error al eliminar de localStorage:', error);
            return false;
        }
    },
    
    /**
     * Limpiar todos los datos
     */
    limpiarTodo() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.PREFIX)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.error('Error al limpiar localStorage:', error);
            return false;
        }
    },
    
    /**
     * Exportar datos como JSON
     */
    exportarJSON() {
        const datos = this.obtenerDatos();
        return JSON.stringify(datos, null, 2);
    },
    
    /**
     * Importar datos desde JSON
     */
    importarJSON(jsonString) {
        try {
            const datos = JSON.parse(jsonString);
            if (datos.ingresos) this.guardar('ingresos', datos.ingresos);
            if (datos.gastos) this.guardar('gastos', datos.gastos);
            if (datos.deudas) this.guardar('deudas', datos.deudas);
            if (datos.configuracion) this.guardar('configuracion', datos.configuracion);
            return true;
        } catch (error) {
            console.error('Error al importar JSON:', error);
            return false;
        }
    },
    
    /**
     * Agregar un ingreso
     */
    agregarIngreso(ingreso) {
        const ingresos = this.obtener('ingresos') || [];
        ingreso.id = Date.now();
        ingreso.fecha = ingreso.fecha || new Date().toISOString().split('T')[0];
        ingresos.push(ingreso);
        this.guardar('ingresos', ingresos);
        return ingreso;
    },
    
    /**
     * Obtener todos los ingresos
     */
    obtenerIngresos() {
        return this.obtener('ingresos') || [];
    },
    
    /**
     * Eliminar un ingreso
     */
    eliminarIngreso(id) {
        let ingresos = this.obtener('ingresos') || [];
        ingresos = ingresos.filter(ing => ing.id !== id);
        this.guardar('ingresos', ingresos);
    },
    
    /**
     * Actualizar un ingreso
     */
    actualizarIngreso(id, datos) {
        let ingresos = this.obtener('ingresos') || [];
        const index = ingresos.findIndex(ing => ing.id === id);
        if (index !== -1) {
            ingresos[index] = { ...ingresos[index], ...datos };
            this.guardar('ingresos', ingresos);
            return true;
        }
        return false;
    },
    
    /**
     * Agregar un gasto
     */
    agregarGasto(gasto) {
        const gastos = this.obtener('gastos') || [];
        gasto.id = Date.now();
        gasto.fecha = gasto.fecha || new Date().toISOString().split('T')[0];
        gastos.push(gasto);
        this.guardar('gastos', gastos);
        return gasto;
    },
    
    /**
     * Obtener todos los gastos
     */
    obtenerGastos() {
        return this.obtener('gastos') || [];
    },
    
    /**
     * Eliminar un gasto
     */
    eliminarGasto(id) {
        let gastos = this.obtener('gastos') || [];
        gastos = gastos.filter(gasto => gasto.id !== id);
        this.guardar('gastos', gastos);
    },
    
    /**
     * Actualizar un gasto
     */
    actualizarGasto(id, datos) {
        let gastos = this.obtener('gastos') || [];
        const index = gastos.findIndex(gasto => gasto.id === id);
        if (index !== -1) {
            gastos[index] = { ...gastos[index], ...datos };
            this.guardar('gastos', gastos);
            return true;
        }
        return false;
    },
    
    /**
     * Agregar una deuda
     */
    agregarDeuda(deuda) {
        const deudas = this.obtener('deudas') || [];
        deuda.id = Date.now();
        deuda.fechaCreacion = deuda.fechaCreacion || new Date().toISOString().split('T')[0];
        deudas.push(deuda);
        this.guardar('deudas', deudas);
        return deuda;
    },
    
    /**
     * Obtener todas las deudas
     */
    obtenerDeudas() {
        return this.obtener('deudas') || [];
    },
    
    /**
     * Eliminar una deuda
     */
    eliminarDeuda(id) {
        let deudas = this.obtener('deudas') || [];
        deudas = deudas.filter(deuda => deuda.id !== id);
        this.guardar('deudas', deudas);
    },
    
    /**
     * Actualizar una deuda
     */
    actualizarDeuda(id, datos) {
        let deudas = this.obtener('deudas') || [];
        const index = deudas.findIndex(deuda => deuda.id === id);
        if (index !== -1) {
            deudas[index] = { ...deudas[index], ...datos };
            this.guardar('deudas', deudas);
            return true;
        }
        return false;
    },
    
    /**
     * Guardar configuración
     */
    guardarConfiguracion(config) {
        const configActual = this.obtener('configuracion') || {};
        const configNueva = { ...configActual, ...config };
        this.guardar('configuracion', configNueva);
        return configNueva;
    },
    
    /**
     * Obtener configuración
     */
    obtenerConfiguracion() {
        const config = this.obtener('configuracion') || {
            porcentajeImpuesto: 5,
            porcentajeDiezmo: 10,
            nombreUsuario: 'Jimmy'
        };
        return config;
    }
};
