/**
 * Firebase Config
 * Inicialización de Firebase Realtime Database
 */

const firebaseConfig = {
    apiKey: "AIzaSyDWJxYwIZ5KxAzN7PZ9qMqK8VbN5mQpZ9w",
    authDomain: "finanzas-412ba.firebaseapp.com",
    databaseURL: "https://finanzas-412ba-default-rtdb.firebaseio.com",
    projectId: "finanzas-412ba",
    storageBucket: "finanzas-412ba.appspot.com",
    messagingSenderId: "798756123456",
    appId: "1:798756123456:web:abc123def456"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Obtener referencia a la base de datos
const database = firebase.database();

// Módulo de Firebase
const FirebaseSync = {
    db: database,
    sincronizando: false,
    listeners: [],
    
    /**
     * Inicializar sincronización
     */
    inicializar() {
        console.log('🔥 Firebase inicializado');
        
        // Permitir acceso anónimo
        firebase.auth().signInAnonymously()
            .then(result => {
                console.log('✅ Usuario anónimo autenticado');
                this.escucharCambios();
            })
            .catch(error => {
                console.error('Error en autenticación:', error);
            });
    },
    
    /**
     * Guardar datos en Firebase
     */
    guardar(coleccion, datos) {
        try {
            const ref = this.db.ref(`finanzas/${coleccion}`);
            ref.set(datos)
                .then(() => {
                    console.log(`✅ Guardado en Firebase: ${coleccion}`);
                })
                .catch(error => {
                    console.error(`Error guardando en Firebase:`, error);
                });
        } catch (error) {
            console.error('Error en guardar Firebase:', error);
        }
    },
    
    /**
     * Obtener datos desde Firebase
     */
    obtener(coleccion, callback) {
        try {
            const ref = this.db.ref(`finanzas/${coleccion}`);
            ref.on('value', snapshot => {
                const datos = snapshot.val();
                callback(datos || []);
            });
        } catch (error) {
            console.error('Error obteniendo de Firebase:', error);
        }
    },
    
    /**
     * Escuchar cambios en tiempo real
     */
    escucharCambios() {
        // Escuchar ingresos
        this.db.ref('finanzas/ingresos').on('value', (snapshot) => {
            const datos = snapshot.val();
            if (datos) {
                Almacenamiento.guardar('ingresos', Object.values(datos));
                if (typeof DashboardModule !== 'undefined') {
                    DashboardModule.actualizar();
                }
                if (typeof ModuloIngresos !== 'undefined') {
                    ModuloIngresos.renderizarLista();
                }
            }
        });
        
        // Escuchar gastos
        this.db.ref('finanzas/gastos').on('value', (snapshot) => {
            const datos = snapshot.val();
            if (datos) {
                Almacenamiento.guardar('gastos', Object.values(datos));
                if (typeof DashboardModule !== 'undefined') {
                    DashboardModule.actualizar();
                }
                if (typeof ModuloGastos !== 'undefined') {
                    ModuloGastos.renderizarLista();
                }
            }
        });
        
        // Escuchar deudas
        this.db.ref('finanzas/deudas').on('value', (snapshot) => {
            const datos = snapshot.val();
            if (datos) {
                Almacenamiento.guardar('deudas', Object.values(datos));
                if (typeof DashboardModule !== 'undefined') {
                    DashboardModule.actualizar();
                }
                if (typeof ModuloDeudas !== 'undefined') {
                    ModuloDeudas.renderizarLista();
                }
            }
        });
    },
    
    /**
     * Sincronizar ingresos
     */
    sincronizarIngresos() {
        const ingresos = Almacenamiento.obtenerIngresos();
        const datosFormato = {};
        ingresos.forEach((ing, index) => {
            datosFormato[ing.id] = ing;
        });
        this.guardar('ingresos', datosFormato);
    },
    
    /**
     * Sincronizar gastos
     */
    sincronizarGastos() {
        const gastos = Almacenamiento.obtenerGastos();
        const datosFormato = {};
        gastos.forEach((gasto, index) => {
            datosFormato[gasto.id] = gasto;
        });
        this.guardar('gastos', datosFormato);
    },
    
    /**
     * Sincronizar deudas
     */
    sincronizarDeudas() {
        const deudas = Almacenamiento.obtenerDeudas();
        const datosFormato = {};
        deudas.forEach((deuda, index) => {
            datosFormato[deuda.id] = deuda;
        });
        this.guardar('deudas', datosFormato);
    }
};

// Inicializar Firebase cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    FirebaseSync.inicializar();
});
