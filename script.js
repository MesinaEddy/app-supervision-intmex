document.addEventListener('DOMContentLoaded', () => {
    // Referencias del GPS
    const gpsDot = document.getElementById('gps-dot');
    const gpsTitle = document.getElementById('gps-title');
    const gpsDesc = document.getElementById('gps-desc');
    const gpsBadge = document.getElementById('gps-obligation');
    const retryBtn = document.getElementById('retry-gps-btn');
    const gpsBoxContainer = document.getElementById('gps-box-container');

    window.gpsData = { lat: 0, lon: 0, accuracy: 0 };

    // 1. GEOLOCALIZACIÓN AUTOMÁTICA
    function obtenerUbicacionAutomatica() {
        if (!navigator.geolocation) {
            actualizarEstadoGPS("error", "Geolocalización no soportada", "Tu dispositivo no soporta esta función.");
            return;
        }

        actualizarEstadoGPS("loading", "Obteniendo ubicación automática...", "Buscando coordenadas exactas...");

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const accuracy = position.coords.accuracy.toFixed(1);

                window.gpsData = { lat, lon, accuracy };

                actualizarEstadoGPS("success", "GPS Capturado Correctamente", `Lat: ${lat.toFixed(5)}, Lon: ${lon.toFixed(5)} (Precisión: ${accuracy}m)`);
                if (gpsBoxContainer) gpsBoxContainer.style.borderColor = "#059669";
                if (retryBtn) retryBtn.style.display = "none";
            },
            (error) => {
                let mensajeError = "No se pudo obtener la ubicación.";
                if (error.code === error.PERMISSION_DENIED) {
                    mensajeError = "Permisos de ubicación denegados.";
                }
                actualizarEstadoGPS("error", "GPS pendiente / Error", mensajeError);
                if (retryBtn) retryBtn.style.display = "flex";
            },
            { 
                enableHighAccuracy: true, // Forzar uso del chip GPS real del teléfono
                timeout: 15000,           // Darle un poco más de tiempo (15 seg) para conectar con satélites
                maximumAge: 0             // No permitir ubicaciones guardadas en caché, exigir lectura en tiempo real
            }
        );
    }

    function actualizarEstadoGPS(estado, titulo, descripcion) {
        if (!gpsTitle || !gpsDesc) return;
        gpsTitle.textContent = titulo;
        gpsDesc.textContent = descripcion;
        if (estado === "loading" && gpsDot) gpsDot.style.backgroundColor = "#f59e0b";
        if (estado === "success" && gpsDot) {
            gpsDot.style.backgroundColor = "#10b981";
            if (gpsBadge) { gpsBadge.textContent = "OBTENIDO"; gpsBadge.style.color = "#34d399"; }
        }
        if (estado === "error" && gpsDot) {
            gpsDot.style.backgroundColor = "#ef4444";
            if (gpsBadge) { gpsBadge.textContent = "ERROR GPS"; gpsBadge.style.color = "#f87171"; }
        }
    }

    obtenerUbicacionAutomatica();
    if (retryBtn) retryBtn.addEventListener('click', obtenerUbicacionAutomatica);

    // 2. TABULADOR DINÁMICO
    document.addEventListener('click', (e) => {
        const boton = e.target.closest('.option-btn');
        if (!boton) return;
        e.preventDefault();
        const grupoPadre = boton.closest('.tab-row') || boton.parentElement;
        if (grupoPadre) {
            grupoPadre.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
        }
        boton.classList.add('active');
    });

    // 3. EVIDENCIAS (Firma / Foto)
    let evidenciaTipo = 'firma';
    let firmaRealizada = false;
    let fotoCapturada = false;
    let datosFirmaBase64 = "";
    let fotoFachadaBase64 = "";

    const btnFirma = document.getElementById('btn-firma');
    const btnFoto = document.getElementById('btn-foto');
    const modalFirma = document.getElementById('modal-firma');
    const canvas = document.getElementById('signature-pad');
    const inputCamara = document.getElementById('input-camara');
    let ctx = canvas ? canvas.getContext('2d') : null;

    if (btnFirma && btnFoto) {
        btnFirma.addEventListener('click', () => {
            evidenciaTipo = 'firma';
            btnFirma.classList.add('active');
            btnFoto.classList.remove('active');
            if (!firmaRealizada && modalFirma) {
                modalFirma.style.display = 'flex';
                if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        });

        btnFoto.addEventListener('click', () => {
            evidenciaTipo = 'foto';
            btnFoto.classList.add('active');
            btnFirma.classList.remove('active');
            if (!fotoCapturada && inputCamara) inputCamara.click();
        });
    }

    // Dibujo en Canvas
    let dibujando = false;
    function obtenerPosicionCanvas(e) {
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        return { x: clientX - rect.left, y: clientY - rect.top };
    }

    if (canvas && ctx) {
        canvas.addEventListener('mousedown', (e) => { dibujando = true; const p = obtenerPosicionCanvas(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); });
        canvas.addEventListener('mousemove', (e) => { if (!dibujando) return; const p = obtenerPosicionCanvas(e); ctx.lineTo(p.x, p.y); ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.stroke(); });
        window.addEventListener('mouseup', () => { dibujando = false; });
        canvas.addEventListener('touchstart', (e) => { e.preventDefault(); dibujando = true; const p = obtenerPosicionCanvas(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); });
        canvas.addEventListener('touchmove', (e) => { e.preventDefault(); if (!dibujando) return; const p = obtenerPosicionCanvas(e); ctx.lineTo(p.x, p.y); ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.stroke(); });
        canvas.addEventListener('touchend', (e) => { e.preventDefault(); dibujando = false; });
    }

    const btnLimpiar = document.getElementById('btn-limpiar-firma');
    const btnCancelar = document.getElementById('btn-cancelar-firma');
    const btnGuardarFirma = document.getElementById('btn-guardar-firma');

    if (btnLimpiar) btnLimpiar.addEventListener('click', () => { if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height); firmaRealizada = false; datosFirmaBase64 = ""; });
    if (btnCancelar) btnCancelar.addEventListener('click', () => { if (modalFirma) modalFirma.style.display = 'none'; });
    if (btnGuardarFirma) btnGuardarFirma.addEventListener('click', () => {
        if (!canvas || !ctx) return;
        const pixelBuffer = new Uint32Array(ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
        if (!pixelBuffer.some(color => color !== 0)) { alert("⚠️ Capture la firma antes de aceptar."); return; }
        datosFirmaBase64 = canvas.toDataURL('image/png');
        firmaRealizada = true;
        if (modalFirma) modalFirma.style.display = 'none';
        if (btnFirma) { btnFirma.innerHTML = '✍️ Firma Registrada Correctamente ✓'; btnFirma.style.borderColor = '#10b981'; btnFirma.style.color = '#10b981'; }
    });

    if (inputCamara) {
        inputCamara.addEventListener('change', function(e) {
            const archivo = e.target.files[0];
            if (archivo) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    fotoFachadaBase64 = event.target.result;
                    fotoCapturada = true;
                    if (btnFoto) { btnFoto.innerHTML = '📷 Foto Capturada Correctamente ✓'; btnFoto.style.borderColor = '#10b981'; btnFoto.style.color = '#10b981'; }
                };
                reader.readAsDataURL(archivo);
            }
        });
    }

    // 4. GUARDADO Y VALIDACIÓN
    const btnAccion = document.querySelector('.btn-action-main');
    if (btnAccion) {
        btnAccion.addEventListener('click', (e) => {
            e.preventDefault();
            const selectRuta = document.getElementById('ruta-select');
            const ruta = selectRuta ? selectRuta.value : "Seleccione Ruta";
            const asesorInput = document.querySelector('input[placeholder*="Carlos Gutiérrez"]');
            const clienteInput = document.querySelector('input[placeholder*="Mini Super Alex"]');
            const quienRecibeInput = document.querySelector('input[placeholder*="Persona que atiende"]');
            const codigosInput = document.querySelector('input[placeholder*="SKU"]');

            if (ruta === "Seleccione Ruta" || !asesorInput?.value.trim() || !clienteInput?.value.trim() || !quienRecibeInput?.value.trim() || !codigosInput?.value.trim()) {
                alert("⚠️ Complete todos los campos obligatorios.");
                return;
            }
            if (!window.gpsData || window.gpsData.lat === 0) {
                alert("⚠️ Se requiere la ubicación GPS.");
                return;
            }
            if (evidenciaTipo === 'firma' && !firmaRealizada) {
                alert("❌ Evidencia requerida: Debe registrar la firma del cliente.");
                if (modalFirma) modalFirma.style.display = 'flex';
                return;
            }
            if (evidenciaTipo === 'foto' && !fotoCapturada) {
                alert("❌ Evidencia requerida: Debe tomar la foto de la fachada.");
                if (inputCamara) inputCamara.click();
                return;
            }

            ejecutarGuardadoFinal(evidenciaTipo === 'firma' ? "Firma del Cliente (Registrada)" : "Foto de la Fachada (Capturada)");
        });
    }

    function ejecutarGuardadoFinal(detalleEvidencia) {
        const selectRuta = document.getElementById('ruta-select');
        const asesorInput = document.querySelector('input[placeholder*="Carlos Gutiérrez"]');
        const clienteInput = document.querySelector('input[placeholder*="Mini Super Alex"]');
        const telefonoInput = document.querySelector('input[placeholder*="10 dígitos"]');
        const quienRecibeInput = document.querySelector('input[placeholder*="Persona que atiende"]');
        const notasInput = document.querySelector('textarea');
        const codigosInput = document.querySelector('input[placeholder*="SKU"]');
        const tabRows = document.querySelectorAll('.tab-row');

        const nuevoRegistro = {
            id: 'SUP-' + Date.now(),
            fecha: new Date().toLocaleString(),
            gps: window.gpsData,
            ruta: selectRuta ? selectRuta.value : "",
            asesor: asesorInput ? asesorInput.value.trim() : "",
            cliente: clienteInput ? clienteInput.value.trim() : "",
            telefono: telefonoInput ? telefonoInput.value.trim() : "",
            quienRecibe: quienRecibeInput ? quienRecibeInput.value.trim() : "",
            tipoCte: tabRows[0]?.querySelector('.option-btn.active')?.textContent || 'A',
            notas: notasInput ? notasInput.value.trim() : "",
            codigosSinImpactar: codigosInput ? codigosInput.value.trim() : "",
            evidencia: detalleEvidencia,
            firmaImagen: datosFirmaBase64,
            fotoImagen: fotoFachadaBase64
        };

        let historial = JSON.parse(localStorage.getItem('registros_intmex') || '[]');
        historial.push(nuevoRegistro);
        localStorage.setItem('registros_intmex', JSON.stringify(historial));

        alert("✅ ¡Supervisión guardada exitosamente!");
        if (clienteInput) clienteInput.value = "";
        if (telefonoInput) telefonoInput.value = "";
        if (quienRecibeInput) quienRecibeInput.value = "";
        if (notasInput) notasInput.value = "";
        if (codigosInput) codigosInput.value = "";
        datosFirmaBase64 = "";
        fotoFachadaBase64 = "";
        firmaRealizada = false;
        fotoCapturada = false;
        if (btnFirma) { btnFirma.innerHTML = '✍️ Abrir Lienzo y Firmar (Cliente)'; btnFirma.style.borderColor = ''; btnFirma.style.color = ''; }
        if (btnFoto) { btnFoto.innerHTML = '📷 Tomar Foto de la Fachada'; btnFoto.style.borderColor = ''; btnFoto.style.color = ''; }
    }

    // 5. NAVEGACIÓN ENTRE VISTAS (REGISTRO, HISTORIAL Y MAPA)
    const navRegistro = document.getElementById('nav-registro');
    const navHistorial = document.getElementById('nav-historial');
    const navMapa = document.getElementById('nav-mapa');
    
    let mainContainer = document.querySelector('main') || document.querySelector('.container') || document.body;
    
    // Contenedor Historial
    let historialView = document.getElementById('vista-historial-dinamica');
    if (!historialView) {
        historialView = document.createElement('div');
        historialView.id = 'vista-historial-dinamica';
        historialView.style.display = 'none';
        mainContainer.parentNode.insertBefore(historialView, mainContainer.nextSibling);
    }

    // Contenedor Mapa
    let mapaView = document.getElementById('vista-mapa-dinamica');
    if (!mapaView) {
        mapaView = document.createElement('div');
        mapaView.id = 'vista-mapa-dinamica';
        mapaView.style.display = 'none';
        mainContainer.parentNode.insertBefore(mapaView, mainContainer.nextSibling);
    }

    if (navRegistro && navHistorial && navMapa) {
        navRegistro.addEventListener('click', (e) => {
            e.preventDefault();
            navRegistro.classList.add('active');
            navHistorial.classList.remove('active');
            navMapa.classList.remove('active');
            mainContainer.style.display = 'block';
            historialView.style.display = 'none';
            mapaView.style.display = 'none';
        });

        navHistorial.addEventListener('click', (e) => {
            e.preventDefault();
            navHistorial.classList.add('active');
            navRegistro.classList.remove('active');
            navMapa.classList.remove('active');
            mainContainer.style.display = 'none';
            historialView.style.display = 'block';
            mapaView.style.display = 'none';
            mostrarHistorialEnContenedor(historialView);
        });

        navMapa.addEventListener('click', (e) => {
            e.preventDefault();
            navMapa.classList.add('active');
            navRegistro.classList.remove('active');
            navHistorial.classList.remove('active');
            mainContainer.style.display = 'none';
            historialView.style.display = 'none';
            mapaView.style.display = 'block';
            mostrarMapaEnContenedor(mapaView);
        });
    }

    function mostrarHistorialEnContenedor(contenedor) {
        let historialHTML = JSON.parse(localStorage.getItem('registros_intmex') || '[]');

        let html = `
            <div style="padding: 20px; color: #fff; max-width: 800px; margin: 0 auto; padding-bottom: 90px;">
                <h2>📊 Historial de Visitas Guardadas</h2>
                <p>Registros almacenados localmente (${historialHTML.length}):</p>
                
                <div style="display: flex; gap: 10px; margin: 15px 0; flex-wrap: wrap;">
                    <button id="btn-exportar-csv" style="background: #059669; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; font-weight: 600;">📥 Exportar a CSV (Google My Maps)</button>
                    <button id="btn-limpiar-historial" style="background: #dc2626; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; font-weight: 600;">🗑️ Borrar Historial</button>
                </div>
                <hr style="border-color: #333; margin-bottom: 20px;">
        `;

        if (historialHTML.length === 0) {
            html += `<p style="color: #9ca3af;">No hay registros guardados todavía.</p>`;
        } else {
            historialHTML.slice().reverse().forEach(reg => {
                let evidenciaLimpia = reg.evidencia || "Firma del Cliente";
                if (evidenciaLimpia.includes("undefined")) evidenciaLimpia = "Firma del Cliente";

                html += `
                    <div style="background: #1e293b; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #334155;">
                        <strong style="color: #38bdf8;">${reg.cliente}</strong> (${reg.ruta})<br>
                        <small style="color: #94a3b8;">📅 ${reg.fecha} | Asesor: ${reg.asesor}</small><br>
                        <p style="margin: 8px 0 0 0; font-size: 14px;">
                            📍 GPS: Lat: ${reg.gps.lat.toFixed(4)}, Lon: ${reg.gps.lon.toFixed(4)}<br>
                            👤 Atiende: ${reg.quienRecibe} | Tipo Cte: ${reg.tipoCte}<br>
                            📝 Evidencia: ${evidenciaLimpia} | Notas: ${reg.notas || 'Sin notas'}
                        </p>
                    </div>
                `;
            });
        }
        html += `</div>`;
        contenedor.innerHTML = html;

        const btnExportarCsv = document.getElementById('btn-exportar-csv');
        if (btnExportarCsv) {
            btnExportarCsv.addEventListener('click', () => {
                if (historialHTML.length === 0) { alert("⚠️ No hay registros para exportar."); return; }

                let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; 
                csvContent += "ID,Fecha,Cliente,Ruta,Asesor,Atendio,TipoCliente,Latitud,Longitud,PrecisionGPS,Evidencia,Notas\n";

                historialHTML.forEach(reg => {
                    let evLimpia = reg.evidencia || "Firma del Cliente";
                    if (evLimpia.includes("undefined")) evLimpia = "Firma del Cliente";

                    const fila = [
                        reg.id,
                        `"${reg.fecha}"`,
                        `"${reg.cliente || ''}"`,
                        `"${reg.ruta || ''}"`,
                        `"${reg.asesor || ''}"`,
                        `"${reg.quienRecibe || ''}"`,
                        `"${reg.tipoCte || ''}"`,
                        reg.gps ? reg.gps.lat : 0,
                        reg.gps ? reg.gps.lon : 0,
                        reg.gps ? `${reg.gps.accuracy}m` : '0m',
                        `"${evLimpia}"`,
                        `"${(reg.notas || '').replace(/"/g, '""')}"`
                    ];
                    csvContent += fila.join(",") + "\n";
                });

                const encodedUri = encodeURI(csvContent);
                const downloadAnchor = document.createElement('a');
                downloadAnchor.setAttribute("href", encodedUri);
                downloadAnchor.setAttribute("download", `visitas_google_maps_${Date.now()}.csv`);
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();
            });
        }

        const btnLimpiarHistorial = document.getElementById('btn-limpiar-historial');
        if (btnLimpiarHistorial) {
            btnLimpiarHistorial.addEventListener('click', () => {
                if (confirm("¿Estás seguro de vaciar todo el historial local?")) {
                    localStorage.removeItem('registros_intmex');
                    mostrarHistorialEnContenedor(contenedor);
                }
            });
        }
    }

    function mostrarMapaEnContenedor(contenedor) {
        let historialHTML = JSON.parse(localStorage.getItem('registros_intmex') || '[]');

        contenedor.innerHTML = `
            <div style="padding: 20px; color: #fff; max-width: 900px; margin: 0 auto; padding-bottom: 90px;">
                <h2>🗺️ Mapa en Tiempo Real (${historialHTML.length} visitas)</h2>
                <p>Visualización interactiva de los puntos geolocalizados en este dispositivo:</p>
                <div id="leaflet-map" style="width: 100%; height: 450px; border-radius: 8px; border: 2px solid #334155; margin-top: 15px; z-index: 1;"></div>
            </div>
        `;

        // Inicializar el mapa con Leaflet
        setTimeout(() => {
            let latInicial = 32.4279; // Coordenada por defecto (ej. Tijuana o centro genérico)
            let lonInicial = -117.0147;

            if (historialHTML.length > 0 && historialHTML[0].gps) {
                latInicial = historialHTML[historialHTML.length - 1].gps.lat;
                lonInicial = historialHTML[historialHTML.length - 1].gps.lon;
            }

            const map = L.map('leaflet-map').setView([latInicial, lonInicial], 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap contributors & CARTO'
            }).addTo(map);

            historialHTML.forEach(reg => {
                if (reg.gps && reg.gps.lat !== 0) {
                    const marker = L.marker([reg.gps.lat, reg.gps.lon]).addTo(map);
                    marker.bindPopup(`
                        <div style="color: #000;">
                            <strong>${reg.cliente}</strong><br>
                            <small>Ruta: ${reg.ruta} | Asesor: ${reg.asesor}</small><br>
                            <span>📅 ${reg.fecha}</span><br>
                            <span>👤 Atendió: ${reg.quienRecibe}</span>
                        </div>
                    `);
                }
            });
        }, 100);
    }
});