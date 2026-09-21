/**
 * App.js
 * Inicialización principal de la aplicación
 */

class FinanzasApp {
    constructor() {
        this.inicializarEventos();
        this.cargarConfiguracion();
    }
    
    /**
     * Inicializar eventos generales
     */
    inicializarEventos() {
        // Navegación de tabs
        const navBtns = document.querySelectorAll('.nav-btn');
        navBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.cambiarTab(e));
        });
        
        // Configuración
        this.inicializarConfiguracion();
    }
    
    /**
     * Cambiar de tab
     */
    cambiarTab(e) {
        const tabName = e.target.getAttribute('data-tab');
        
        // Remover clase active de todos los botones
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Remover clase active de todos los tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Agregar clase active al botón y tab actual
        e.target.classList.add('active');
        const tabElement = document.getElementById(`${tabName}-tab`);
        if (tabElement) {
            tabElement.classList.add('active');
        }
    }
    
    /**
     * Inicializar sección de configuración
     */
    inicializarConfiguracion() {
        const config = Almacenamiento.obtenerConfiguracion();
        
        // Cargar valores en inputs
        document.getElementById('porcentaje-impuesto').value = config.porcentajeImpuesto || 5;
        document.getElementById('porcentaje-diezmo').value = config.porcentajeDiezmo || 10;
        document.getElementById('nombre-usuario').value = config.nombreUsuario || 'Jimmy';
        
        // Guardar cuando cambien
        document.getElementById('porcentaje-impuesto').addEventListener('change', () => this.guardarConfiguracion());
        document.getElementById('porcentaje-diezmo').addEventListener('change', () => this.guardarConfiguracion());
        document.getElementById('nombre-usuario').addEventListener('change', () => this.guardarConfiguracion());
        
        // Botones de peligro
        document.getElementById('btn-exportar-datos').addEventListener('click', () => this.exportarDatos());
        document.getElementById('btn-limpiar-datos').addEventListener('click', () => this.limpiarDatos());
    }
    
    /**
     * Guardar configuración
     */
    guardarConfiguracion() {
        const config = {
            porcentajeImpuesto: parseFloat(document.getElementById('porcentaje-impuesto').value) || 5,
            porcentajeDiezmo: parseFloat(document.getElementById('porcentaje-diezmo').value) || 10,
            nombreUsuario: document.getElementById('nombre-usuario').value || 'Jimmy'
        };
        
        Almacenamiento.guardarConfiguracion(config);
        
        // Actualizar dashboard
        if (typeof DashboardModule !== 'undefined') {
            DashboardModule.actualizar();
        }
        
        alert('✅ Configuración guardada');
    }
    
    /**
     * Cargar configuración
     */
    cargarConfiguracion() {
        const config = Almacenamiento.obtenerConfiguracion();
        console.log('Configuración cargada:', config);
    }
    
    /**
     * Exportar datos como JSON
     */
    exportarDatos() {
        const datos = Almacenamiento.exportarJSON();
        
        // Crear blob y descargar
        const blob = new Blob([datos], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `finanzas-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        alert('✅ Datos exportados correctamente');
    }
    
    /**
     * Limpiar todos los datos
     */
    limpiarDatos() {
        const confirmacion = confirm('⚠️ ¿ESTÁS COMPLETAMENTE SEGURO? Esto eliminará TODOS los datos y NO se puede deshacer.');
        
        if (confirmacion) {
            const dobleConfirmacion = confirm('Esta es tu última oportunidad. ¿Realmente quieres eliminar TODO?');
            
            if (dobleConfirmacion) {
                Almacenamiento.limpiarTodo();
                
                // Recargar la página
                window.location.reload();
                
                alert('✅ Todos los datos han sido eliminados');
            }
        }
    }
}

// Inicializar la app cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando Finanzas del Hogar...');
    
    // Crear instancia de la app
    window.app = new FinanzasApp();
    
    console.log('✅ App inicializada correctamente');
});

// Función auxiliar: ir al inicio
function irAlDashboard() {
    document.querySelector('[data-tab="dashboard"]').click();
    window.scrollTo(0, 0);
}
