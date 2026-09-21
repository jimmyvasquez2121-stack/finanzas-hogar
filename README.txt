====================================================================
FINANZAS DEL HOGAR - PWA
====================================================================

¡Bienvenido! Esta es una aplicación web progresiva (PWA) para 
gestionar tus finanzas familiares y de negocios.

====================================================================
ESTRUCTURA DE CARPETAS
====================================================================

finanzas-hogar/
├── index.html              (Archivo principal - punto de entrada)
├── manifest.json           (Configuración de PWA)
├── service-worker.js       (Para funcionamiento offline)
├── README.txt             (Este archivo)
│
├── css/
│   ├── estilos.css        (Estilos generales)
│   └── dashboard.css      (Estilos del dashboard)
│
└── js/
    ├── app.js             (Inicialización principal)
    ├── almacenamiento.js  (Gestión de datos locales)
    ├── modulos-calculo.js (Cálculos de diezmo/impuestos)
    ├── modulos-ingresos.js (Registro de ingresos)
    ├── modulos-gastos.js  (Registro de gastos)
    ├── modulos-deudas.js  (Gestión de deudas)
    └── dashboard.js       (Visualización del dashboard)

====================================================================
INSTALACIÓN EN NETLIFY
====================================================================

1. DESCARGAR Y PREPARAR
   - Descargar esta carpeta completa (finanzas-hogar)
   - Asegurarse de que tiene TODOS los archivos y carpetas

2. CREAR UN REPOSITORIO EN GITHUB (Opcional pero recomendado)
   - Ir a: https://github.com/new
   - Crear un repositorio público o privado
   - Subir los archivos de esta carpeta
   - Copiar la URL del repositorio

3. CONECTAR CON NETLIFY
   - Ir a: https://www.netlify.com
   - Hacer click en "Sign up" (si no tienes cuenta)
   - Elegir "Sign up with GitHub"
   - Autorizar Netlify para acceder a GitHub

4. CREAR UN NUEVO SITIO
   - Click en "New site from Git"
   - Seleccionar GitHub
   - Buscar el repositorio "finanzas-hogar"
   - Click en Guardar y Deploy

5. ESPERAR A QUE SE DEPLIEGUE
   - Netlify compilará y desplegará automáticamente
   - Recibirás una URL pública: algo como https://finanzas-xxx.netlify.app
   - ¡Listo! Tu app está en línea

====================================================================
ACCESO EN EL TELÉFONO (iOS/Android)
====================================================================

DESDE IPHONE:
1. Abrir Safari
2. Ir a tu URL de Netlify (https://finanzas-xxx.netlify.app)
3. Click en el botón de "Compartir" (ícono de flecha)
4. Scroll down y buscar "Agregar a Pantalla de Inicio"
5. Elegir un nombre y agregar
6. La app aparecerá como ícono en tu pantalla principal

DESDE ANDROID:
1. Abrir Chrome
2. Ir a tu URL de Netlify
3. Click en el menú (3 puntos arriba a la derecha)
4. Seleccionar "Instalar app"
5. Confirmar
6. La app se instalará en tu pantalla principal

====================================================================
CARACTERÍSTICAS PRINCIPALES
====================================================================

✅ Dashboard visual con resumen de finanzas
✅ Registro de ingresos (Taller, Tienda 1, Tienda 2, Bazar)
✅ Registro de gastos del hogar
✅ Cálculo automático de diezmo (10% por defecto)
✅ Cálculo automático de impuestos para Taller y Bazar
✅ Gestión de deudas con alertas de vencimiento
✅ Historial completo de transacciones
✅ Funciona completamente sin internet (offline)
✅ Los datos se guardan localmente en el teléfono
✅ Exportar datos como JSON para respaldo

====================================================================
CÓMO USAR
====================================================================

PRIMER USO:
1. Ir a ⚙️ Configuración
2. Ajustar los porcentajes de:
   - Impuesto a Hacienda (por defecto 5%)
   - Diezmo (por defecto 10%)
3. Poner tu nombre de usuario
4. Guardar

REGISTRAR UN INGRESO:
1. Ir a pestaña "Ingresos"
2. Llenar:
   - Fecha
   - Origen (Taller, Tienda 1, Tienda 2, Bazar, etc.)
   - Venta Bruta (monto total vendido)
   - Costos/Gastos (si aplica)
   - La Ganancia Neta se calcula automáticamente
   - Marcar si está sujeto a impuesto (Taller y Bazar: SÍ)
3. Click en "Guardar Ingreso"

REGISTRAR UN GASTO:
1. Ir a pestaña "Gastos"
2. Llenar:
   - Fecha
   - Categoría (Servicios, Comida, Transporte, etc.)
   - Monto
   - Descripción (opcional)
3. Click en "Guardar Gasto"

REGISTRAR UNA DEUDA:
1. Ir a pestaña "Deudas"
2. Llenar:
   - Acreedor (quién le debes)
   - Monto
   - Fecha de vencimiento
   - Estado (Pendiente, Vencida, Pagada)
   - Notas (términos, intereses, etc.)
3. Click en "Guardar Deuda"

DASHBOARD:
- Muestra resumen del mes
- Alertas de deudas próximas o vencidas
- Cuánto apartar para diezmo e impuestos
- Últimas transacciones
- Balance real disponible

====================================================================
COPIAS DE SEGURIDAD
====================================================================

Los datos se guardan automáticamente en tu teléfono.

HACER UN RESPALDO (IMPORTANTE):
1. Ir a ⚙️ Configuración
2. Click en "📥 Exportar Datos (JSON)"
3. Se descargará un archivo .json
4. Guardar ese archivo en un lugar seguro (email, Google Drive, etc.)

RESTAURAR DESDE UN RESPALDO:
1. Si cambias de teléfono, puedes:
   - Instalar la app en el nuevo teléfono
   - Ir a Configuración
   - (Nota: La importación se hace manualmente, contacta si necesitas ayuda)

====================================================================
PREGUNTAS FRECUENTES
====================================================================

P: ¿Mis datos se envían a internet?
R: NO. Todo se guarda localmente en tu teléfono. Netlify solo aloja
   la app, los datos nunca se suben.

P: ¿Funciona sin internet?
R: SÍ. Una vez instalada, funciona completamente sin conexión.

P: ¿Qué pasa si borro la app?
R: Tus datos se perderán. Siempre haz un respaldo en Configuración.

P: ¿Puedo usar en múltiples dispositivos?
R: No sincroniza entre dispositivos. Los datos de cada teléfono 
   son independientes. Puedes exportar/importar manualmente.

P: ¿Cómo cambio los porcentajes de impuesto o diezmo?
R: Ve a ⚙️ Configuración, ajusta los porcentajes y guarda.

P: ¿Puedo editar un ingreso/gasto registrado?
R: Actualmente solo puedes eliminar y crear uno nuevo.
   Próxima versión tendrá edición.

====================================================================
SOPORTE Y MEJORAS
====================================================================

Si encuentras problemas o quieres sugerencias:
- Anota lo que no funciona
- Toma una captura de pantalla
- Envía la información para mejoras futuras

Mejoras planeadas:
✓ Editar transacciones registradas
✓ Gráficos de gastos por categoría
✓ Reportes mensuales en PDF
✓ Sincronización entre dispositivos (opcional)

====================================================================
VERSIÓN: 1.0
ÚLTIMA ACTUALIZACIÓN: 2026
====================================================================
