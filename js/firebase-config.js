// ===== FIREBASE CONFIG - REST API =====
// Usa Firebase Realtime Database REST API en lugar del SDK
// Esto evita todos los conflictos de módulos ES6

const FIREBASE_CONFIG = {
    databaseURL: "https://finanzas-412ba-default-rtdb.firebaseio.com",
    apiKey: "AIzaSyAaJ9pG2kLXBnRfQqM8zZvXmKzB5xJ4dZ8"
};

let userId = localStorage.getItem('userId') || 'user_' + Date.now();
if (!localStorage.getItem('userId')) {
    localStorage.setItem('userId', userId);
}

let isFirebaseConnected = false;

// ===== INICIALIZACIÓN FIREBASE =====

function initializeFirebase() {
    console.log('🔄 Inicializando Firebase REST API...');
    
    // Verificar conectividad
    checkFirebaseConnectivity().then(connected => {
        isFirebaseConnected = connected;
        if (connected) {
            console.log('✅ Firebase conectado (REST API)');
            setupSyncListeners();
        } else {
            console.warn('⚠️ Firebase no disponible - usando localStorage');
        }
    });
    
    return true;
}

// ===== VERIFICAR CONECTIVIDAD =====

async function checkFirebaseConnectivity() {
    try {
        const response = await fetch(
            `${FIREBASE_CONFIG.databaseURL}/.json?shallow=true&auth=${FIREBASE_CONFIG.apiKey}`,
            { method: 'GET', mode: 'cors' }
        );
        return response.ok;
    } catch (error) {
        console.warn('⚠️ Error verificando Firebase:', error.message);
        return false;
    }
}

// ===== FUNCIONES SYNC A FIREBASE (REST API) =====

async function syncIngresoToFirebase(ingreso) {
    if (!isFirebaseConnected) return false;

    try {
        const id = ingreso.id || 'ingreso_' + Date.now();
        const url = `${FIREBASE_CONFIG.databaseURL}/finanzas/ingresos/${id}.json?auth=${FIREBASE_CONFIG.apiKey}`;
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...ingreso,
                id: id,
                ultimaSincronizacion: new Date().toISOString()
            })
        });

        if (response.ok) {
            console.log('✅ Ingreso sincronizado:', id);
            return true;
        } else {
            console.error('❌ Error Firebase:', response.statusText);
            return false;
        }
    } catch (error) {
        console.error('❌ Error sincronizando ingreso:', error.message);
        isFirebaseConnected = false;
        return false;
    }
}

async function syncGastoToFirebase(gasto) {
    if (!isFirebaseConnected) return false;

    try {
        const id = gasto.id || 'gasto_' + Date.now();
        const url = `${FIREBASE_CONFIG.databaseURL}/finanzas/gastos/${id}.json?auth=${FIREBASE_CONFIG.apiKey}`;
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...gasto,
                id: id,
                ultimaSincronizacion: new Date().toISOString()
            })
        });

        if (response.ok) {
            console.log('✅ Gasto sincronizado:', id);
            return true;
        } else {
            console.error('❌ Error Firebase:', response.statusText);
            return false;
        }
    } catch (error) {
        console.error('❌ Error sincronizando gasto:', error.message);
        isFirebaseConnected = false;
        return false;
    }
}

async function syncConfigToFirebase(config) {
    if (!isFirebaseConnected) return false;

    try {
        const url = `${FIREBASE_CONFIG.databaseURL}/finanzas/config.json?auth=${FIREBASE_CONFIG.apiKey}`;
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...config,
                ultimaActualizacion: new Date().toISOString()
            })
        });

        if (response.ok) {
            console.log('✅ Configuración sincronizada');
            return true;
        } else {
            console.error('❌ Error Firebase:', response.statusText);
            return false;
        }
    } catch (error) {
        console.error('❌ Error sincronizando config:', error.message);
        isFirebaseConnected = false;
        return false;
    }
}

async function deleteIngresoFromFirebase(id) {
    if (!isFirebaseConnected) return false;

    try {
        const url = `${FIREBASE_CONFIG.databaseURL}/finanzas/ingresos/${id}.json?auth=${FIREBASE_CONFIG.apiKey}`;
        
        const response = await fetch(url, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            console.log('✅ Ingreso eliminado de Firebase:', id);
            return true;
        } else {
            console.error('❌ Error eliminando:', response.statusText);
            return false;
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        isFirebaseConnected = false;
        return false;
    }
}

async function deleteGastoFromFirebase(id) {
    if (!isFirebaseConnected) return false;

    try {
        const url = `${FIREBASE_CONFIG.databaseURL}/finanzas/gastos/${id}.json?auth=${FIREBASE_CONFIG.apiKey}`;
        
        const response = await fetch(url, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            console.log('✅ Gasto eliminado de Firebase:', id);
            return true;
        } else {
            console.error('❌ Error eliminando:', response.statusText);
            return false;
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        isFirebaseConnected = false;
        return false;
    }
}

// ===== SYNC LISTENERS (Polling cada 5 segundos) =====

function setupSyncListeners() {
    if (!isFirebaseConnected) return;

    // Escuchar cambios en ingresos
    setInterval(async () => {
        try {
            const url = `${FIREBASE_CONFIG.databaseURL}/finanzas/ingresos.json?auth=${FIREBASE_CONFIG.apiKey}`;
            const response = await fetch(url);
            
            if (response.ok) {
                const datos = await response.json() || {};
                const almacenamiento = JSON.parse(localStorage.getItem('almacenamiento') || '{"ingresos":[]}');
                almacenamiento.ingresos = Object.values(datos).filter(v => v !== null);
                localStorage.setItem('almacenamiento', JSON.stringify(almacenamiento));
                
                window.dispatchEvent(new Event('sincronizacion'));
            }
        } catch (error) {
            console.warn('⚠️ Error escuchando ingresos:', error.message);
        }
    }, 5000); // Cada 5 segundos

    // Escuchar cambios en gastos
    setInterval(async () => {
        try {
            const url = `${FIREBASE_CONFIG.databaseURL}/finanzas/gastos.json?auth=${FIREBASE_CONFIG.apiKey}`;
            const response = await fetch(url);
            
            if (response.ok) {
                const datos = await response.json() || {};
                const almacenamiento = JSON.parse(localStorage.getItem('almacenamiento') || '{"gastos":[]}');
                almacenamiento.gastos = Object.values(datos).filter(v => v !== null);
                localStorage.setItem('almacenamiento', JSON.stringify(almacenamiento));
                
                window.dispatchEvent(new Event('sincronizacion'));
            }
        } catch (error) {
            console.warn('⚠️ Error escuchando gastos:', error.message);
        }
    }, 5000); // Cada 5 segundos

    // Escuchar cambios en config
    setInterval(async () => {
        try {
            const url = `${FIREBASE_CONFIG.databaseURL}/finanzas/config.json?auth=${FIREBASE_CONFIG.apiKey}`;
            const response = await fetch(url);
            
            if (response.ok) {
                const datos = await response.json();
                if (datos) {
                    const almacenamiento = JSON.parse(localStorage.getItem('almacenamiento') || '{}');
                    almacenamiento.config = datos;
                    localStorage.setItem('almacenamiento', JSON.stringify(almacenamiento));
                    
                    window.dispatchEvent(new Event('sincronizacion'));
                }
            }
        } catch (error) {
            console.warn('⚠️ Error escuchando config:', error.message);
        }
    }, 5000); // Cada 5 segundos

    console.log('✅ Sync listeners activos (polling cada 5s)');
}

// ===== OBTENER TODOS LOS DATOS =====

async function getAllDataFromFirebase() {
    if (!isFirebaseConnected) return null;

    try {
        const url = `${FIREBASE_CONFIG.databaseURL}/finanzas.json?auth=${FIREBASE_CONFIG.apiKey}`;
        const response = await fetch(url);
        
        if (response.ok) {
            return await response.json() || {};
        } else {
            return null;
        }
    } catch (error) {
        console.error('❌ Error obteniendo datos:', error.message);
        return null;
    }
}

// ===== SINCRONIZACIÓN COMPLETA =====

async function fullSyncToFirebase() {
    if (!isFirebaseConnected) {
        console.warn('⚠️ Firebase no disponible para sync completo');
        return false;
    }

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
    return true;
}

// ===== EXPORTAR PARA USO GLOBAL =====
// (No usar módulos - todo es global)
