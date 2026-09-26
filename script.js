document.addEventListener('DOMContentLoaded', () => {
    // Referencias de pestañas y vistas
    const tabRegistro = document.getElementById('tab-registro');
    const tabHistorial = document.getElementById('tab-historial');
    const tabMapa = document.getElementById('tab-mapa');
    
    const viewRegistro = document.getElementById('view-registro');
    const viewHistorial = document.getElementById('view-historial');
    const viewMapa = document.getElementById('view-mapa');

    function cambiarVista(vistaActiva) {
        // Ocultar todas las vistas y remover la clase active de las pestañas
        if (viewRegistro) viewRegistro.classList.remove('active-view');
        if (viewHistorial) viewHistorial.classList.remove('active-view');
        if (viewMapa) viewMapa.classList.remove('active-view');

        if (tabRegistro) tabRegistro.classList.remove('active');
        if (tabHistorial) tabHistorial.classList.remove('active');
        if (tabMapa) tabMapa.classList.remove('active');

        // Mostrar la vista seleccionada
        if (vistaActiva === 'registro') {
            if (viewRegistro) viewRegistro.classList.add('active-view');
            if (tabRegistro) tabRegistro.classList.add('active');
        } else if (vistaActiva === 'historial') {
            if (viewHistorial) viewHistorial.classList.add('active-view');
            if (tabHistorial) tabHistorial.classList.add('active');
            mostrarHistorialEnContenedor(viewHistorial);
        } else if (vistaActiva === 'mapa') {
            if (viewMapa) viewMapa.classList.add('active-view');
            if (tabMapa) tabMapa.classList.add('active');
            mostrarMapaEnContenedor(viewMapa);
        }
    }

    // Eventos de clic en la barra inferior
    if (tabRegistro) tabRegistro.addEventListener('click', () => cambiarVista('registro'));
    if (tabHistorial) tabHistorial.addEventListener('click', () => cambiarVista('historial'));
    if (tabMapa) tabMapa.addEventListener('click', () => cambiarVista('mapa'));

    // Generador dinámico de rutas por CEDIS
    function generarRutas(prefijo, inicio, fin) {
        let rutas = [];
        for (let i = inicio; i <= fin; i++) {
            let numStr = i < 10 ? '0' + i : i;
            if (i >= 301) numStr = i;
            rutas.push(prefijo + numStr);
        }
        return rutas;
    }

    const rutasPorCedis = {
        "TIJUANA": generarRutas("TIJ", 1, 18).concat(generarRutas("TIJ", 301, 306)),
        "MEXICALI": generarRutas("MXLI", 1, 18).concat(generarRutas("MXLI", 301, 306)),
        "HERMOSILLO": generarRutas("HILLO", 1, 18).concat(generarRutas("HILLO", 301, 306)),
        "MOCHIS": generarRutas("MOC", 1, 18).concat(generarRutas("MOC", 301, 306)),
        "CULIACAN": generarRutas("CUL", 1, 18).concat(generarRutas("CUL", 301, 306)),
        "MAZATLAN": generarRutas("MZT", 1, 18).concat(generarRutas("MZT", 301, 306))
    };

    const cedisSelect = document.getElementById('cedis-select');
    const rutaSelect = document.getElementById('ruta-select');

    if (cedisSelect && rutaSelect) {
        cedisSelect.addEventListener('change', (e) => {
            const cedisSeleccionado = e.target.value;
            rutaSelect.innerHTML = '<option value="">Seleccione una Ruta</option>';
            
            if (cedisSeleccionado && rutasPorCedis[cedisSeleccionado]) {
                rutasPorCedis[cedisSeleccionado].forEach(ruta => {
                    const opt = document.createElement('option');
                    opt.value = ruta;
                    opt.textContent = ruta;
                    rutaSelect.appendChild(opt);
                });
            } else {
                rutaSelect.innerHTML = '<option value="">Primero seleccione un CEDIS</option>';
            }
        });
    }

    // GPS automático
    let gpsData = { lat: 0, lon: 0, accuracy: 0 };
    const gpsStatusDiv = document.getElementById('gps-status');

    function obtenerGPS() {
        if (navigator.geolocation) {
            if (gpsStatusDiv) {
                gpsStatusDiv.innerHTML = `
                    <div style="background: #1e293b; color: #38bdf8; padding: 10px; border-radius: 6px; border: 1px solid #334155;">
                        <b>Buscando ubicación GPS...</b><br><small>Conectando con satélites...</small>
                    </div>
                `;
            }
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    gpsData = {
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    };
                    if (gpsStatusDiv) {
                        gpsStatusDiv.innerHTML = `
                            <div style="background: #065f46; color: #d1fae5; padding: 10px; border-radius: 6px;">
                                <b>GPS Capturado Correctamente</b><br>
                                <small>Lat: ${gpsData.lat.toFixed(5)}, Lon: ${gpsData.lon.toFixed(5)} (Precisión: ${gpsData.accuracy.toFixed(1)}m)</small>
                            </div>
                        `;
                    }
                },
                (error) => {
                    if (gpsStatusDiv) {
                        gpsStatusDiv.innerHTML = `
                            <div style="background: #991b1b; color: #fee2e2; padding: 10px; border-radius: 6px;">
                                <b>⚠️ Error de GPS:</b> Active la ubicación en los permisos de su navegador.
                            </div>
                        `;
                    }
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
            );
        } else {
            if (gpsStatusDiv) {
                gpsStatusDiv.innerHTML = `<div style="background: #991b1b; color: #fee2e2; padding: 10px; border-radius: 6px;">Geolocalización no soportada en este navegador.</div>`;
            }
        }
    }
    obtenerGPS();

    // Guardar formulario en LocalStorage
    const formSupervision = document.getElementById('form-supervision');
    if (formSupervision) {
        formSupervision.addEventListener('submit', (e) => {
            e.preventDefault();

            const nuevoRegistro = {
                id: 'INT-' + Date.now(),
                fecha: new Date().toLocaleString(),
                cedis: cedisSelect ? cedisSelect.value : '',
                ruta: rutaSelect ? rutaSelect.value : '',
                asesor: document.getElementById('asesor-input')?.value || '',
                cliente: document.getElementById('cliente-input')?.value || '',
                telefono: document.getElementById('telefono-input')?.value || '',
                quienRecibe: document.getElementById('quien-recibe-input')?.value || '',
                tipoCte: document.getElementById('tipo-cte-input')?.value || 'A',
                codigosSinImpactar: document.getElementById('codigos-input')?.value || 'Ninguno',
                notas: document.getElementById('notas-input')?.value || '',
                gps: gpsData
            };

            let historial = JSON.parse(localStorage.getItem('registros_intmex') || '[]');
            historial.push(nuevoRegistro);
            localStorage.setItem('registros_intmex', JSON.stringify(historial));

            alert("✅ ¡Supervisión guardada con éxito!");
            formSupervision.reset();
            if (rutaSelect) rutaSelect.innerHTML = '<option value="">Primero seleccione un CEDIS</option>';
            cambiarVista('historial');
        });
    }

    // Funcionalidad de Historial
    function mostrarHistorialEnContenedor(contenedor) {
        let historialHTML = JSON.parse(localStorage.getItem('registros_intmex') || '[]');
        let rutasUnicas = [...new Set(historialHTML.map(reg => reg.ruta))].filter(Boolean);

        let html = `
            <div style="padding: 20px; color: #fff; max-width: 800px; margin: 0 auto; padding-bottom: 90px;">
                <h2>📊 Historial y Expedientes</h2>
                <p>Registros almacenados localmente: <b>${historialHTML.length}</b></p>
                
                <div style="display: flex; gap: 10px; margin: 15px 0; flex-wrap: wrap;">
                    <button id="btn-exportar-csv" style="background: #059669; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; font-weight: 600;">📥 Descargar CSV</button>
                    <button id="btn-limpiar-historial" style="background: #dc2626; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; font-weight: 600;">🗑️ Borrar Historial</button>
                </div>

                <div style="background: #1e293b; padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #334155;">
                    <h3 style="margin-top: 0; color: #38bdf8; font-size: 16px;">📑 Expediente por Ruta (Excel)</h3>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <select id="select-ruta-reporte" style="flex: 1; padding: 8px; border-radius: 6px; background: #0f172a; color: #fff; border: 1px solid #334155;">
                            <option value="">Seleccione Ruta</option>
                            ${rutasUnicas.map(r => `<option value="${r}">${r}</option>`).join('')}
                        </select>
                        <button id="btn-exportar-excel-ruta" style="background: #2563eb; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; font-weight: 600;">📊 Descargar Excel</button>
                    </div>
                </div>
                <hr style="border-color: #334155; margin-bottom: 20px;">
        `;

        if (historialHTML.length === 0) {
            html += `<p style="color: #94a3b8;">No hay registros guardados todavía.</p>`;
        } else {
            historialHTML.slice().reverse().forEach(reg => {
                html += `
                    <div style="background: #1e293b; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #334155;">
                        <strong style="color: #38bdf8;">${reg.cliente}</strong> (CEDIS: ${reg.cedis} | Ruta: ${reg.ruta})<br>
                        <small style="color: #94a3b8;">📅 ${reg.fecha} | Asesor: ${reg.asesor}</small>
                    </div>
                `;
            });
        }
        html += `</div>`;
        contenedor.innerHTML = html;

        document.getElementById('btn-exportar-csv')?.addEventListener('click', () => {
            if (historialHTML.length === 0) { alert("⚠️ No hay registros."); return; }
            exportarCSVGeneral(historialHTML);
        });

        document.getElementById('btn-exportar-excel-ruta')?.addEventListener('click', () => {
            const rutaSel = document.getElementById('select-ruta-reporte')?.value;
            if (!rutaSel) { alert("⚠️ Seleccione una ruta."); return; }
            const filtrados = historialHTML.filter(reg => reg.ruta === rutaSel);
            exportarReporteExcelIndividual(rutaSel, filtrados);
        });

        document.getElementById('btn-limpiar-historial')?.addEventListener('click', () => {
            if (confirm("¿Desea vaciar todo el historial local?")) {
                localStorage.removeItem('registros_intmex');
                mostrarHistorialEnContenedor(contenedor);
            }
        });
    }

    function exportarCSVGeneral(datos) {
        let csvContent = "data:text/csv;charset=utf-8,\uFEFFID,Fecha,CEDIS,Ruta,Cliente,Asesor,Atendio,TipoCliente,Latitud,Longitud\n";
        datos.forEach(reg => {
            csvContent += `${reg.id},"${reg.fecha}","${reg.cedis}","${reg.ruta}","${reg.cliente}","${reg.asesor}","${reg.quienRecibe}","${reg.tipoCte}",${reg.gps.lat},${reg.gps.lon}\n`;
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `base_datos_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    function exportarReporteExcelIndividual(ruta, datosRuta) {
        let excelHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"></head><body><h3>Expediente Ruta ${ruta}</h3><table border="1"><tr><th>Cliente</th><th>Atendió</th><th>Fecha</th></tr>`;
        datosRuta.forEach(reg => {
            excelHtml += `<tr><td>${reg.cliente}</td><td>${reg.quienRecibe}</td><td>${reg.fecha}</td></tr>`;
        });
        excelHtml += `</table></body></html>`;
        const blob = new Blob([excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `expediente_${ruta}.xls`;
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    // Funcionalidad del Mapa Leaflet
    let map = null;
    function mostrarMapaEnContenedor(contenedor) {
        contenedor.innerHTML = `
            <div style="padding: 20px; color: #fff; max-width: 800px; margin: 0 auto; padding-bottom: 90px;">
                <h2>🗺️ Mapa de Visitas</h2>
                <div id="leaflet-map" style="height: 450px; width: 100%; border-radius: 8px; border: 1px solid #334155; margin-top: 15px;"></div>
            </div>
        `;

        setTimeout(() => {
            if (!map) {
                map = L.map('leaflet-map').setView([32.5149, -117.0382], 12);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
            } else {
                map.invalidateSize();
            }

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
        }, 250);
    }
});
