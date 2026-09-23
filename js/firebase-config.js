// ===== CONFIGURACIÓN FIREBASE =====
const firebaseConfig = {
    apiKey: "AIzaSyAaJ9pG2kLXBnRfQqM8zZvXmKzB5xJ4dZ8",
    authDomain: "finanzas-412ba.firebaseapp.com",
    databaseURL: "https://finanzas-412ba-default-rtdb.firebaseio.com",
    projectId: "finanzas-412ba",
    storageBucket: "finanzas-412ba.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcd1234efgh5678ijkl"
};

// Inicializar Firebase (CDN en index.html)
let database = null;
let userId = localStorage.getItem('userId') || 'user_' + Date.now();

if (!localStorage.getItem('userId')) {
    localStorage.setItem('userId', userId);
}

// Esperar a que Firebase esté disponible
function initializeFirebase() {
    try {
        firebase.initializeApp(firebaseConfig);
        database = firebase.database();
        console.log('✅ Firebase inicializado correctamente');
        setupSyncListeners();
        return true;
    } catch (error) {
        console.error('❌ Error inicializando Firebase:', error);
        return false;
    }
}

// ===== SINCRONIZACIÓN CON FIREBASE =====

// Listeners para sincronización en tiempo real
function setupSyncListeners() {
    if (!database) return;

    // Escuchar cambios en ingresos
    database.ref('finanzas/ingresos').on('value', snapshot => {
        const datos = snapshot.val() || {};
        const almacenamiento = JSON.parse(localStorage.getItem('almacenamiento') || '{"ingresos":[]}');
        almacenamiento.ingresos = Object.values(datos);
        localStorage.setItem('almacenamiento', JSON.stringify(almacenamiento));
        
        // Disparar evento para actualizar UI
        window.dispatchEvent(new Event('sincronizacion'));
    }, error => {
        console.warn('⚠️ Error escuchando ingresos:', error.message);
    });

    // Escuchar cambios en gastos
    database.ref('finanzas/gastos').on('value', snapshot => {
        const datos = snapshot.val() || {};
        const almacenamiento = JSON.parse(localStorage.getItem('almacenamiento') || '{"gastos":[]}');
        almacenamiento.gastos = Object.values(datos);
        localStorage.setItem('almacenamiento', JSON.stringify(almacenamiento));
        
        window.dispatchEvent(new Event('sincronizacion'));
    }, error => {
        console.warn('⚠️ Error escuchando gastos:', error.message);
    });

    // Escuchar cambios en configuración
    database.ref('finanzas/config').on('value', snapshot => {
        const datos = snapshot.val();
        if (datos) {
            const almacenamiento = JSON.parse(localStorage.getItem('almacenamiento') || '{}');
            almacenamiento.config = datos;
            localStorage.setItem('almacenamiento', JSON.stringify(almacenamiento));
            
            window.dispatchEvent(new Event('sincronizacion'));
        }
    }, error => {
        console.warn('⚠️ Error escuchando config:', error.message);
    });
}

// ===== FUNCIONES SYNC A FIREBASE =====

// Guardar ingreso a Firebase
async function syncIngresoToFirebase(ingreso) {
    if (!database) {
        console.warn('⚠️ Firebase no disponible');
        return false;
    }

    try {
        const id = ingreso.id || 'ingreso_' + Date.now();
        await database.ref(`finanzas/ingresos/${id}`).set({
            ...ingreso,
            id: id,
            ultimaSincronizacion: new Date().toISOString()
        });
        console.log('✅ Ingreso sincronizado:', id);
        return true;
    } catch (error) {
        console.error('❌ Error sincronizando ingreso:', error);
        return false;
    }
}

// Guardar gasto a Firebase
async function syncGastoToFirebase(gasto) {
    if (!database) {
        console.warn('⚠️ Firebase no disponible');
        return false;
    }

    try {
        const id = gasto.id || 'gasto_' + Date.now();
        await database.ref(`finanzas/gastos/${id}`).set({
            ...gasto,
            id: id,
            ultimaSincronizacion: new Date().toISOString()
        });
        console.log('✅ Gasto sincronizado:', id);
        return true;
    } catch (error) {
        console.error('❌ Error sincronizando gasto:', error);
        return false;
    }
}

// Guardar configuración a Firebase
async function syncConfigToFirebase(config) {
    if (!database) {
        console.warn('⚠️ Firebase no disponible');
        return false;
    }

    try {
        await database.ref('finanzas/config').set({
            ...config,
            ultimaActualizacion: new Date().toISOString()
        });
        console.log('✅ Configuración sincronizada');
        return true;
    } catch (error) {
        console.error('❌ Error sincronizando config:', error);
        return false;
    }
}

// Eliminar ingreso de Firebase
async function deleteIngresoFromFirebase(id) {
    if (!database) return false;

    try {
        await database.ref(`finanzas/ingresos/${id}`).remove();
        console.log('✅ Ingreso eliminado de Firebase:', id);
        return true;
    } catch (error) {
        console.error('❌ Error eliminando ingreso:', error);
        return false;
    }
}

// Eliminar gasto de Firebase
async function deleteGastoFromFirebase(id) {
    if (!database) return false;

    try {
        await database.ref(`finanzas/gastos/${id}`).remove();
        console.log('✅ Gasto eliminado de Firebase:', id);
        return true;
    } catch (error) {
        console.error('❌ Error eliminando gasto:', error);
        return false;
    }
}

// ===== UTILIDADES =====

// Obtener todos los datos de Firebase (para backup/migración)
async function getAllDataFromFirebase() {
    if (!database) return null;

    try {
        const snapshot = await database.ref('finanzas').get();
        return snapshot.val() || {};
    } catch (error) {
        console.error('❌ Error obteniendo datos:', error);
        return null;
    }
}

// Sincronizar localStorage completo a Firebase
async function fullSyncToFirebase() {
    const almacenamiento = JSON.parse(localStorage.getItem('almacenamiento') || '{}');

    if (almacenamiento.ingresos) {
        for (const ingreso of almacenamiento.ingresos) {
            await syncIngresoToFirebase(ingreso);
        }
    }

    if (almacenamiento.gastos) {
        for (const gasto of almacenamiento.gastos) {
            await syncGastoToFirebase(gasto);
        }
    }

    if (almacenamiento.config) {
        await syncConfigToFirebase(almacenamiento.config);
    }

    console.log('✅ Sincronización completa finalizada');
}

// Verificar conectividad
function checkFirebaseConnectivity() {
    if (!database) return false;

    return new Promise((resolve) => {
        const ref = database.ref('.info/connected');
        ref.on('value', snapshot => {
            resolve(snapshot.val() === true);
        });
    });
}
