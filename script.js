// ==========================================
// 1. CONFIGURACIÓN Y ESTADO DE LA APLICACIÓN
// ==========================================
let map = null;
let ubicacionActual = null;

// ==========================================
// 2. OBTENCIÓN DE GPS CON TIMEOUT (Evita el bloqueo de CEDIS)
// ==========================================
function obtenerUbicacion() {
    const barraEstado = document.querySelector('.barra-gps') || document.body;
    
    // Opciones para evitar que el GPS congelé el navegador o tarde demasiado
    const opcionesGPS = {
        enableHighAccuracy: false, // Evita forzar máxima precisión para reducir consumo
        timeout: 4000,             // Límite máximo de espera: 4 segundos
        maximumAge: 60000          // Acepta ubicación reciente guardada en memoria
    };

    if (!navigator.geolocation) {
        console.warn("Geolocalización no soportada por el navegador.");
        habilitarCedisYRutas();
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (posicion) => {
            ubicacionActual = {
                lat: posicion.coords.latitude,
                lon: posicion.coords.longitude
            };
            console.log("GPS obtenido correctamente:", ubicacionActual);
            
            // Habilitar la selección de CEDIS
            habilitarCedisYRutas();
        },
        (error) => {
            console.warn("Error o tiempo de espera agotado al obtener GPS:", error.message);
            // OBLIGATORIO: Desbloquear el selector de CEDIS aunque el GPS no responda
            habilitarCedisYRutas();
        },
        opcionesGPS
    );
}

// Función que habilita y permite seleccionar los CEDIS
function habilitarCedisYRutas() {
    const selectCedis = document.getElementById('select-cedis') || document.querySelector('select');
    if (selectCedis) {
        selectCedis.disabled = false;
    }
}

// ==========================================
// 3. MOSTRAR MAPA DE HISTORIAL / REGISTROS
// ==========================================
function mostrarMapaEnContenedor(contenedor) {
    let historial = JSON.parse(localStorage.getItem('registros_intmex') || '[]');
    let bounds = [];

    if (typeof L !== 'undefined' && map) {
        historial.forEach(reg => {
            if (reg.gps && reg.gps.lat) {
                L.marker([reg.gps.lat, reg.gps.lon])
                 .addTo(map)
                 .bindPopup(`<b>${reg.cliente || 'Cliente'}</b><br>Ruta: ${reg.ruta || 'N/A'}`);
                bounds.push([reg.gps.lat, reg.gps.lon]);
            }
        });

        if (bounds.length > 0) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }
}

// ==========================================
// 4. MÓDULO DE COMPRESIÓN DE IMÁGENES (CÁMARA / EVIDENCIAS)
// ==========================================
document.addEventListener('DOMContentLoaded', function () {
    // Iniciar intento de obtener GPS al cargar
    obtenerUbicacion();

    // Seleccionar el input de tipo archivo para la foto de Fachada / Evidencia
    const inputFoto = document.querySelector('input[type="file"]');

    if (inputFoto) {
        inputFoto.addEventListener('change', function (event) {
            const archivo = event.target.files[0];

            if (!archivo) return;

            // Verificar si la librería Compressor está disponible
            if (typeof Compressor !== 'undefined') {
                new Compressor(archivo, {
                    quality: 0.6,           // Reduce la calidad al 60%
                    maxWidth: 1024,         // Ancho máximo 1024px
                    maxHeight: 1024,        // Alto máximo 1024px
                    mimeType: 'image/jpeg', // Convierte a JPG ligero

                    success(resultadoBlob) {
                        console.log('Imagen comprimida con éxito. Peso final:', (resultadoBlob.size / 1024).toFixed(2), 'KB');
                        
                        // Generar la vista previa sin consumir RAM
                        const urlPreview = URL.createObjectURL(resultadoBlob);
                        const imgPreview = document.getElementById('preview-foto');
                        if (imgPreview) {
                            imgPreview.src = urlPreview;
                        }
                    },

                    error(err) {
                        console.error('Error al comprimir la imagen:', err.message);
                    },
                });
            } else {
                console.warn('Compressor.js no está cargado. Se procesará la imagen original.');
            }
        });
    }
});
