/**
 * Módulo de Cálculos
 * Realiza cálculos de ingresos, gastos, diezmo e impuestos
 */

const Calculos = {
    /**
     * Calcular ganancia neta
     * Ganancia Neta = Venta Bruta - Costos
     */
    calcularGananciaNeta(ventaBruta, costos = 0) {
        return Math.max(0, ventaBruta - costos);
    },
    
    /**
     * Calcular diezmo
     * Diezmo = Ganancia Neta * (Porcentaje Diezmo / 100)
     */
    calcularDiezmo(ganancia) {
        const config = Almacenamiento.obtenerConfiguracion();
        const porcentaje = config.porcentajeDiezmo || 10;
        return (ganancia * porcentaje) / 100;
    },
    
    /**
     * Calcular impuesto
     * Impuesto = Ganancia * (Porcentaje Impuesto / 100)
     * Solo aplica a ingresos sujetos a impuesto (Taller + Bazar)
     */
    calcularImpuesto(ganancia, sujetoImpuesto = false) {
        if (!sujetoImpuesto) return 0;
        
        const config = Almacenamiento.obtenerConfiguracion();
        const porcentaje = config.porcentajeImpuesto || 5;
        return (ganancia * porcentaje) / 100;
    },
    
    /**
     * Calcular total de ingresos del día/período
     */
    totalIngresos(ingresos) {
        return ingresos.reduce((total, ingreso) => {
            return total + (parseFloat(ingreso.ganancia_neta) || 0);
        }, 0);
    },
    
    /**
     * Calcular total de gastos del día/período
     */
    totalGastos(gastos) {
        return gastos.reduce((total, gasto) => {
            return total + (parseFloat(gasto.monto) || 0);
        }, 0);
    },
    
    /**
     * Calcular balance (Ingresos - Gastos)
     */
    calcularBalance(totalIngresos, totalGastos) {
        return totalIngresos - totalGastos;
    },
    
    /**
     * Obtener resumen del día actual
     */
    obtenerResumenHoy() {
        const hoy = new Date().toISOString().split('T')[0];
        const ingresos = Almacenamiento.obtenerIngresos();
        const gastos = Almacenamiento.obtenerGastos();
        
        const ingresosHoy = ingresos.filter(ing => ing.fecha === hoy);
        const gastosHoy = gastos.filter(gasto => gasto.fecha === hoy);
        
        const totalIngresos = this.totalIngresos(ingresosHoy);
        const totalGastos = this.totalGastos(gastosHoy);
        const balance = this.calcularBalance(totalIngresos, totalGastos);
        
        return {
            fecha: hoy,
            ingresos: ingresosHoy,
            gastos: gastosHoy,
            totalIngresos,
            totalGastos,
            balance,
            saldo: balance
        };
    },
    
    /**
     * Obtener resumen del mes actual
     */
    obtenerResumenMes() {
        const hoy = new Date();
        const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
        const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0];
        
        const ingresos = Almacenamiento.obtenerIngresos();
        const gastos = Almacenamiento.obtenerGastos();
        
        const ingresosMes = ingresos.filter(ing => ing.fecha >= primerDia && ing.fecha <= ultimoDia);
        const gastosMes = gastos.filter(gasto => gasto.fecha >= primerDia && gasto.fecha <= ultimoDia);
        
        const totalIngresos = this.totalIngresos(ingresosMes);
        const totalGastos = this.totalGastos(gastosMes);
        const balance = this.calcularBalance(totalIngresos, totalGastos);
        
        // Calcular diezmo e impuestos a apartar
        const diezmoTotal = ingresosMes.reduce((total, ing) => {
            return total + this.calcularDiezmo(parseFloat(ing.ganancia_neta) || 0);
        }, 0);
        
        const impuestoTotal = ingresosMes.reduce((total, ing) => {
            const sujetoImpuesto = ing.sujeto_impuesto === 'si';
            return total + this.calcularImpuesto(parseFloat(ing.ganancia_neta) || 0, sujetoImpuesto);
        }, 0);
        
        return {
            periodo: `${primerDia} a ${ultimoDia}`,
            ingresos: ingresosMes,
            gastos: gastosMes,
            totalIngresos,
            totalGastos,
            balance,
            diezmoAApartar: diezmoTotal,
            impuestoAApartar: impuestoTotal,
            disponibleReal: balance - diezmoTotal - impuestoTotal
        };
    },
    
    /**
     * Obtener deudas próximas (próximos 7 días)
     */
    obtenerDeudasProximas() {
        const deudas = Almacenamiento.obtenerDeudas();
        const hoy = new Date();
        const en7dias = new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const deudasProximas = deudas.filter(deuda => {
            if (deuda.estado === 'pagada') return false;
            const fechaVencimiento = new Date(deuda.fecha_vencimiento);
            return fechaVencimiento >= hoy && fechaVencimiento <= en7dias;
        });
        
        return deudasProximas.sort((a, b) => {
            return new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento);
        });
    },
    
    /**
     * Obtener deudas vencidas
     */
    obtenerDeudasVencidas() {
        const deudas = Almacenamiento.obtenerDeudas();
        const hoy = new Date();
        
        const deudasVencidas = deudas.filter(deuda => {
            if (deuda.estado === 'pagada') return false;
            const fechaVencimiento = new Date(deuda.fecha_vencimiento);
            return fechaVencimiento < hoy;
        });
        
        return deudasVencidas.sort((a, b) => {
            return new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento);
        });
    },
    
    /**
     * Calcular total de deudas pendientes
     */
    totalDeudasPendientes() {
        const deudas = Almacenamiento.obtenerDeudas();
        return deudas
            .filter(d => d.estado !== 'pagada')
            .reduce((total, deuda) => total + (parseFloat(deuda.monto_deuda) || 0), 0);
    },
    
    /**
     * Obtener ingresos por origen
     */
    ingresoPorOrigen() {
        const ingresos = Almacenamiento.obtenerIngresos();
        const origenes = ['taller', 'tienda1', 'tienda2', 'bazar', 'otro'];
        const resultado = {};
        
        origenes.forEach(origen => {
            const ingresosOrigen = ingresos.filter(ing => ing.origen === origen);
            resultado[origen] = this.totalIngresos(ingresosOrigen);
        });
        
        return resultado;
    },
    
    /**
     * Obtener gastos por categoría
     */
    gastosPorCategoria() {
        const gastos = Almacenamiento.obtenerGastos();
        const categorias = ['servicios', 'comida', 'transporte', 'medicinas', 'ropa', 'diezmo', 'impuestos', 'otro'];
        const resultado = {};
        
        categorias.forEach(categoria => {
            const gastosCategoria = gastos.filter(g => g.categoria === categoria);
            resultado[categoria] = this.totalGastos(gastosCategoria);
        });
        
        return resultado;
    },
    
    /**
     * Obtener últimas N transacciones
     */
    obtenerUltimasTransacciones(cantidad = 10) {
        const ingresos = Almacenamiento.obtenerIngresos().map(ing => ({
            ...ing,
            tipo: 'ingreso',
            monto: parseFloat(ing.ganancia_neta) || 0,
            descripcion: `${ing.origen} - Ganancia`
        }));
        
        const gastos = Almacenamiento.obtenerGastos().map(gasto => ({
            ...gasto,
            tipo: 'gasto',
            monto: parseFloat(gasto.monto) || 0
        }));
        
        const todas = [...ingresos, ...gastos];
        return todas
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
            .slice(0, cantidad);
    },
    
    /**
     * Validar si hay suficientes fondos
     */
    haySuficientesFondos(monto) {
        const resumen = this.obtenerResumenMes();
        return resumen.disponibleReal >= monto;
    }
};
