document.addEventListener('DOMContentLoaded', () => {
    console.log("App Intmex iniciada correctamente.");

    // --- 1. GESTIÓN DE GPS (NO BLOQUEANTE) ---
    const gpsDot = document.getElementById('gps-dot');
    const gpsTitle = document.getElementById('gps-title');
    const gpsDesc = document.getElementById('gps-desc');
    const gpsBadge = document.getElementById('gps-obligation');
    const retryBtn = document.getElementById('retry-gps-btn');
    const gpsBoxContainer = document.getElementById('gps-box-container');

    window.gpsData = { lat: 0, lon: 0, accuracy: 0 };

    function obtenerUbicacionAutomatica() {
        if (!navigator.geolocation) {
            actualizarEstadoGPS("error", "Sin GPS", "Dispositivo no soporta geolocalización.");
            return;
        }

        actualizarEstadoGPS("loading", "Buscando GPS...", "Obteniendo coordenadas...");

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;
                const accuracy = parseFloat(pos.coords.accuracy.toFixed(1));
                window.gpsData = { lat, lon, accuracy };

                actualizarEstadoGPS("success", "GPS Capturado", `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)} (${accuracy}m)`);
                if (gpsBoxContainer) gpsBoxContainer.style.borderColor = "#059669";
                if (retryBtn) retryBtn.style.display = "none";
            },
            (err) => {
                actualizarEstadoGPS("error", "GPS Sin Señal", "No se obtuvo respuesta a tiempo. Puedes continuar.");
                if (retryBtn) retryBtn.style.display = "inline-block";
            },
            { enableHighAccuracy: false, timeout: 3000, maximumAge: 60000 }
        );
    }

    function actualizarEstadoGPS(estado, titulo, descripcion) {
        if (gpsTitle) gpsTitle.textContent = titulo;
        if (gpsDesc) gpsDesc.textContent = descripcion;
        if (estado === "loading" && gpsDot) gpsDot.style.backgroundColor = "#f59e0b";
        if (estado === "success" && gpsDot) {
            gpsDot.style.backgroundColor = "#10b981";
            if (gpsBadge) { gpsBadge.textContent = "OK"; gpsBadge.style.color = "#34d399"; }
        }
        if (estado === "error" && gpsDot) {
            gpsDot.style.backgroundColor = "#ef4444";
            if (gpsBadge) { gpsBadge.textContent = "SIN GPS"; gpsBadge.style.color = "#f87171"; }
        }
    }

    obtenerUbicacionAutomatica();
    if (retryBtn) retryBtn.addEventListener('click', obtenerUbicacionAutomatica);

    // --- 2. CEDIS Y RUTAS DINÁMICAS ---
    const cedisSelect = document.getElementById('cedis-select');
    const rutaSelect = document.getElementById('ruta-select');

    function generarRutas(prefijo, inicio, fin) {
        let lista = [];
        for (let i = inicio; i <= fin; i++) {
            let num = i < 10 ? "0" + i : i;
            lista.push(prefijo + num);
        }
        return lista;
    }

    const rutasPorCedis = {
        "TIJUANA": generarRutas("TIJ", 1, 18).concat(generarRutas("TIJ", 301, 306)),
        "MEXICALI": generarRutas("MXLI", 1, 18),
        "HERMOSILLO": generarRutas("HILLO", 1, 18),
        "MOCHIS": generarRutas("MOC", 1, 18),
        "CULIACAN": generarRutas("CUL", 1, 18),
        "MAZATLAN": generarRutas("MZT", 1, 18)
    };

    if (cedisSelect && rutaSelect) {
        cedisSelect.addEventListener('change', (e) => {
            const cedis = e.target.value;
            rutaSelect.innerHTML = '<option value="">Seleccione Ruta</option>';
            if (cedis && rutasPorCedis[cedis]) {
                rutasPorCedis[cedis].forEach(r => {
                    const opt = document.createElement('option');
                    opt.value = r;
                    opt.textContent = r;
                    rutaSelect.appendChild(opt);
                });
            }
        });
    }

    // --- 3. SELECCIÓN DE BOTONES ---
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.option-btn');
        if (!btn) return;
        e.preventDefault();
        const padre = btn.parentElement;
        if (padre) {
            padre.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
        }
        btn.classList.add('active');
    });

    // --- 4. FIRMA Y FOTO ---
    const btnFirma = document.getElementById('btn-firma');
    const btnFoto = document.getElementById('btn-foto');
    const modalFirma = document.getElementById('modal-firma');
    const inputCamara = document.getElementById('input-camara');

    if (btnFirma) {
        btnFirma.addEventListener('click', (e) => {
            e.preventDefault();
            if (modalFirma) modalFirma.style.display = 'flex';
        });
    }

    if (btnFoto) {
        btnFoto.addEventListener('click', (e) => {
            e.preventDefault();
            if (inputCamara) inputCamara.click();
        });
    }

    const btnCancelarFirma = document.getElementById('btn-cancelar-firma');
    if (btnCancelarFirma) {
        btnCancelarFirma.addEventListener('click', () => {
            if (modalFirma) modalFirma.style.display = 'none';
        });
    }

    // --- 5. NAVEGACIÓN DE PESTAÑAS (REGISTRO / HISTORIAL / MAPA) ---
    const tabRegistro = document.getElementById('tab-registro');
    const tabHistorial = document.getElementById('tab-historial');
    const tabMapa = document.getElementById('tab-mapa');

    const containerForm = document.querySelector('.container');
    const viewHistorial = document.getElementById('view-historial');
    const viewMapa = document.getElementById('view-mapa');

    function cambiarPestana(destino) {
        if (containerForm) containerForm.style.display = 'none';
        if (viewHistorial) viewHistorial.style.display = 'none';
        if (viewMapa) viewMapa.style.display = 'none';

        [tabRegistro, tabHistorial, tabMapa].forEach(t => { if (t) t.classList.remove('active'); });

        if (destino === 'registro') {
            if (containerForm) containerForm.style.display = 'block';
            if (tabRegistro) tabRegistro.classList.add('active');
        } else if (destino === 'historial') {
            if (viewHistorial) viewHistorial.style.display = 'block';
            if (tabHistorial) tabHistorial.classList.add('active');
        } else if (destino === 'mapa') {
            if (viewMapa) viewMapa.style.display = 'block';
            if (tabMapa) tabMapa.classList.add('active');
        }
    }

    if (tabRegistro) tabRegistro.addEventListener('click', (e) => { e.preventDefault(); cambiarPestana('registro'); });
    if (tabHistorial) tabHistorial.addEventListener('click', (e) => { e.preventDefault(); cambiarPestana('historial'); });
    if (tabMapa) tabMapa.addEventListener('click', (e) => { e.preventDefault(); cambiarPestana('mapa'); });
});
