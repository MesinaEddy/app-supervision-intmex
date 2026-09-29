function mostrarMapaEnContenedor(contenedor) {
    let historial = JSON.parse(localStorage.getItem('registros_intmex') || '[]');
    let bounds = [];

    historial.forEach(reg => {
        if (reg.gps && reg.gps.lat) {
            L.marker([reg.gps.lat, reg.gps.lon]).addTo(map).bindPopup(`<b>${reg.cliente}</b><br>Ruta: ${reg.ruta}`);
            bounds.push([reg.gps.lat, reg.gps.lon]);
        }
    });

    if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] });
    }
}

// Seleccionamos el input de la fachada/establecimiento
const inputFoto = document.querySelector('input[type="file"]');

if (inputFoto) {
    inputFoto.addEventListener('change', function (event) {
        const archivo = event.target.files[0];

        if (!archivo) return;

        // Aplicamos el módulo de compresión
        new Compressor(archivo, {
            quality: 0.6,
            maxWidth: 1024,
            maxHeight: 1024,
            mimeType: 'image/jpeg',

            success(resultadoBlob) {
                // Generamos la URL para mostrar la vista previa en el HTML
                const urlPreview = URL.createObjectURL(resultadoBlob);
                
                // ASIGNA AQUÍ TU ELEMENTO IMG DE VISTA PREVIA (Ajusta 'id-de-tu-img' con tu ID real)
                // document.getElementById('id-de-tu-img').src = urlPreview;

                // GUARDAR EL BLOB COMPRIMIDO EN TU VARIABLE GLOBAL O FORMULARIO
                // fotoComprimidaParaEnviar = resultadoBlob; 
            },

            error(err) {
                console.error('Error al comprimir la imagen:', err.message);
            },
        });
    });
}
