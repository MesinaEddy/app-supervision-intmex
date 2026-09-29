document.addEventListener('DOMContentLoaded', () => {
    // Referencias GPS
    const gpsDot = document.getElementById('gps-dot');
    const gpsTitle = document.getElementById('gps-title');
    const gpsDesc = document.getElementById('gps-desc');
    const gpsBadge = document.getElementById('gps-obligation');
    const retryBtn = document.getElementById('retry-gps-btn');
    const gpsBoxContainer = document.getElementById('gps-box-container');

    window.gpsData = { lat: 0, lon: 0, accuracy: 0 };

    // 1. GEOLOCALIZACIÓN (3 Segundos Máximo)
    function obtenerUbicacionAutomatica() {
        if (!navigator.geolocation) {
            actualizarEstadoGPS("error", "Sin soporte GPS", "El navegador no soporta geolocalización.");
            return;
        }

        actualizarEstadoGPS("loading", "Buscando GPS...", "Obteniendo coordenadas...");

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const accuracy = parseFloat(position.coords.accuracy.toFixed(1));

                window.gpsData = { lat, lon, accuracy };

                actualizarEstadoGPS("success", "GPS Registrado", `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)} (${accuracy}m)`);
                if (gpsBoxContainer) gpsBoxContainer.style.borderColor = "#059669";
                if (retryBtn) retryBtn.style.display = "none";
            },
            (error) => {
                actualizarEstadoGPS("error", "GPS Sin Coordenadas", "No se obtuvo respuesta GPS a tiempo. Puedes continuar.");
                if (retryBtn) retryBtn.style.display = "inline-block";
            },
            { 
                enableHighAccuracy: true,
                timeout: 3000,   // Solo 3 segundos para que jamás congele Chrome en Android
                maximumAge: 60000 
            }
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

    // 2. CEDIS Y RUTAS DINÁMICAS
    const cedisSelect = document.getElementById('cedis-select');
    const rutaSelect = document.getElementById('ruta-select');

    const rutasPorCedis = {
        "TIJUANA": generarRutas("TIJ", 1, 18).concat(generarRutas("TIJ", 301, 306)),
        "MEXICALI": generarRutas("MXLI", 1, 18),
        "HERMOSILLO": generarRutas("HILLO", 1, 18),
        "MOCHIS": generarRutas("MOC", 1, 18),
        "CULIACAN": generarRutas("CUL", 1, 18),
        "MAZATLAN": generarRutas("MZT", 1, 18)
    };

    function generarRutas(prefijo, inicio, fin) {
        let lista = [];
        for (let i = inicio; i <= fin; i++) {
            let num = i < 10 ? "0" + i : i;
            lista.push(prefijo + num);
        }
        return lista;
    }

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

    // 3. SELECCIÓN DE BOTONES
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

    // 4. FIRMA Y FOTO
    let firmaRealizada = false;
    let datosFirmaBase64 = "";
    let fotoFachadaBase64 = "";

    const btnFirma = document.getElementById('btn-firma');
    const btnFoto = document.getElementById('btn-foto');
    const modalFirma = document.getElementById('modal-firma');
    const canvas = document.getElementById('signature-pad');
    const inputCamara = document.getElementById('input-camara');
    let ctx = canvas ? canvas.getContext('2d') : null;

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

    let dibujando = false;
    function getCanvasPos(e) {
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    }

    if (canvas && ctx) {
        canvas.addEventListener('touchstart', (e) => { dibujando = true; const p = getCanvasPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); }, {passive: true});
        canvas.addEventListener('touchmove', (e) => { if (!dibujando) return; const p = getCanvasPos(e); ctx.lineTo(p.x, p.y); ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.stroke(); }, {passive: true});
        canvas.addEventListener('touchend', () => { dibujando = false; });
    }

    const btnGuardarFirma = document.getElementById('btn-guardar-firma');
    const btnCancelarFirma = document.getElementById('btn-cancelar-firma');
    
    if (btnCancelarFirma) btnCancelarFirma.addEventListener('click', () => { if (modalFirma) modalFirma.style.display = 'none'; });
    if (btnGuardarFirma) {
        btnGuardarFirma.addEventListener('click', () => {
            if (canvas) datosFirmaBase64 = canvas.toDataURL('image/png');
            firmaRealizada = true;
            if (modalFirma) modalFirma.style.display = 'none';
            if (btnFirma) btnFirma.style.color = '#10b981';
        });
    }

    if (inputCamara) {
        inputCamara.addEventListener('change', (e) => {
            const archivo = e.target.files[0];
            if (!archivo) return;
            const reader = new FileReader();
            reader.onload = (evt) => {
                fotoFachadaBase64 = evt.target.result;
                if (btnFoto) btnFoto.style.color = '#10b981';
            };
            reader.readAsDataURL(archivo);
        });
    }

    // 5. GUARDAR DATOS
    const btnGuardar = document.querySelector('.btn-action-main');
    if (btnGuardar) {
        btnGuardar.addEventListener('click', (e) => {
            e.preventDefault();
            const ruta = rutaSelect ? rutaSelect.value : "";
            if (!ruta) {
                alert("⚠️ Seleccione una Ruta antes de guardar.");
                return;
            }

            const registro = {
                id: Date.now(),
                fecha: new Date().toLocaleString(),
                ruta: ruta,
                gps: window.gpsData
            };

            let historial = JSON.parse(localStorage.getItem('registros_intmex') || '[]');
            historial.push(registro);
            localStorage.setItem('registros_intmex', JSON.stringify(historial));

            alert("✅ ¡Registro Guardado con Éxito!");
        });
    }

    // 6. NAVEGACIÓN INFERIOR (100% FUNCIONAL EN CHROME ANDROID)
    const tabRegistro = document.getElementById('tab-registro');
    const tabHistorial = document.getElementById('tab-historial');
    const tabMapa = document.getElementById('tab-mapa');

    // Se identifican las 3 pantallas por su estructura real en tu HTML
    const containerPrincipal = document.querySelector('.container') || document.body.firstElementChild;
    const viewHistorial = document.getElementById('view-historial');
    const viewMapa = document.getElementById('view-mapa');

    function cambiarVista(vistaMostrar) {
        if (containerPrincipal) containerPrincipal.style.display = 'none';
        if (viewHistorial) viewHistorial.style.display = 'none';
        if (viewMapa) viewMapa.style.display = 'none';

        [tabRegistro, tabHistorial, tabMapa].forEach(t => { if (t) t.classList.remove('active'); });

        if (vistaMostrar === 'registro') {
            if (containerPrincipal) containerPrincipal.style.display = 'block';
            if (tabRegistro) tabRegistro.classList.add('active');
        } else if (vistaMostrar === 'historial') {
            if (viewHistorial) viewHistorial.style.display = 'block';
            if (tabHistorial) tabHistorial.classList.add('active');
            renderHistorial();
        } else if (vistaMostrar === 'mapa') {
            if (viewMapa) viewMapa.style.display = 'block';
            if (tabMapa) tabMapa.classList.add('active');
            renderMapa();
        }
    }

    if (tabRegistro) tabRegistro.addEventListener('click', (e) => { e.preventDefault(); cambiarVista('registro'); });
    if (tabHistorial) tabHistorial.addEventListener('click', (e) => { e.preventDefault(); cambiarVista('historial'); });
    if (tabMapa) tabMapa.addEventListener('click', (e) => { e.preventDefault(); cambiarVista('mapa'); });

    function renderHistorial() {
        if (!viewHistorial) return;
        let reg = JSON.parse(localStorage.getItem('registros_intmex') || '[]');
        let html = `<div style="padding:20px; color:#fff;"><h2>📊 Historial (${reg.length})</h2>`;
        if (reg.length === 0) html += `<p>No hay visitas guardadas.</p>`;
        else {
            reg.forEach(r => {
                html += `<div style="background:#1e293b; padding:10px; margin-bottom:8px; border-radius:6px;">
                    Ruta: <b>${r.ruta}</b> - ${r.fecha}<br>
                    <small>GPS: ${r.gps ? r.gps.lat : 0}, ${r.gps ? r.gps.lon : 0}</small>
                </div>`;
            });
        }
        html += `</div>`;
        viewHistorial.innerHTML = html;
    }

    function renderMapa() {
        if (!viewMapa) return;
        viewMapa.innerHTML = `<div id="map" style="width:100%; height:350px; border-radius:8px;"></div>`;
        let reg = JSON.parse(localStorage.getItem('registros_intmex') || '[]');
        setTimeout(() => {
            if (typeof L === 'undefined') return;
            const map = L.map('map').setView([32.4279, -117.0147], 10);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
            reg.forEach(r => {
                if (r.gps && r.gps.lat !== 0) {
                    L.marker([r.gps.lat, r.gps.lon]).addTo(map).bindPopup(`Ruta: ${r.ruta}`);
                }
            });
        }, 200);
    }
});
