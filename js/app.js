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
        
        // Botones de importar/exportar
        document.getElementById('btn-importar-datos').addEventListener('click', () => this.abrirImportador());
        document.getElementById('input-importar-datos').addEventListener('change', (e) => this.importarDatos(e));
        document.getElementById('btn-exportar-datos').addEventListener('click', () => this.exportarDatos());
        
        // Botones de peligro
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
     * Abrir diálogo de seleccionar archivo
     */
    abrirImportador() {
        document.getElementById('input-importar-datos').click();
    }
    
    /**
     * Importar datos desde JSON
     */
    importarDatos(event) {
        const archivo = event.target.files[0];
        
        if (!archivo) return;
        
        const lector = new FileReader();
        
        lector.onload = (e) => {
            try {
                const contenido = e.target.result;
                const datos = JSON.parse(contenido);
                
                // Validar que tiene estructura correcta
                if (!datos.ingresos && !datos.gastos && !datos.deudas) {
                    alert('⚠️ Archivo inválido. No tiene la estructura correcta.');
                    return;
                }
                
                // Confirmar antes de importar
                const confirmacion = confirm('⚠️ Esto SOBRESCRIBIRÁ todos tus datos actuales. ¿Estás seguro?');
                
                if (confirmacion) {
                    // Importar los datos
                    Almacenamiento.importarJSON(contenido);
                    
                    // Sincronizar con Firebase
                    if (typeof FirebaseSync !== 'undefined') {
                        if (datos.ingresos) FirebaseSync.sincronizarIngresos();
                        if (datos.gastos) FirebaseSync.sincronizarGastos();
                        if (datos.deudas) FirebaseSync.sincronizarDeudas();
                    }
                    
                    // Actualizar vistas
                    if (typeof DashboardModule !== 'undefined') {
                        DashboardModule.actualizar();
                    }
                    if (typeof ModuloIngresos !== 'undefined') {
                        ModuloIngresos.renderizarLista();
                    }
                    if (typeof ModuloGastos !== 'undefined') {
                        ModuloGastos.renderizarLista();
                    }
                    if (typeof ModuloDeudas !== 'undefined') {
                        ModuloDeudas.renderizarLista();
                    }
                    
                    alert('✅ Datos importados correctamente. Se están sincronizando con Firebase...');
                    
                    // Limpiar input
                    event.target.value = '';
                }
            } catch (error) {
                console.error('Error al importar:', error);
                alert('❌ Error al importar: ' + error.message);
                event.target.value = '';
            }
        };
        
        lector.readAsText(archivo);
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
