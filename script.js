document.addEventListener('DOMContentLoaded', () => {
    // Referencias principales
    const tabRegistro = document.getElementById('tab-registro');
    const tabHistorial = document.getElementById('tab-historial');
    const tabMapa = document.getElementById('tab-mapa');
    
    const viewRegistro = document.getElementById('view-registro');
    const viewHistorial = document.getElementById('view-historial');
    const viewMapa = document.getElementById('view-mapa');

    // Cambiar entre pestañas
    function cambiarVista(vistaActiva) {
        [viewRegistro, viewHistorial, viewMapa].forEach(v => v.style.display = 'none');
        [tabRegistro, tabHistorial, tabMapa].forEach(t => t.classList.remove('active'));

        if (vistaActiva === 'registro') {
            viewRegistro.style.display = 'block';
            tabRegistro.classList.add('active');
        } else if (vistaActiva === 'historial') {
            viewHistorial.style.display = 'block';
            tabHistorial.classList.add('active');
            mostrarHistorialEnContenedor(viewHistorial);
        } else if (vistaActiva === 'mapa') {
            viewMapa.style.display = 'block';
            tabMapa.classList.add('active');
            mostrarMapaEnContenedor(viewMapa);
        }
    }

    tabRegistro.addEventListener('click', () => cambiarVista('registro'));
    tabHistorial.addEventListener('click', () => cambiarVista('historial'));
    tabMapa.addEventListener('click', () => cambiarVista('mapa'));

    // Configuración de CEDIS y Rutas Dinámicas (Del 01 al 18 y bloque 301 a 306 para TODOS)
    function generarRutas(prefijo, inicio, fin) {
        let rutas = [];
        for (let i = inicio; i <= fin; i++) {
            let numStr = i < 10 ? '0' + i : i;
            if (i >= 301) numStr = i; // Mantener 301, 302...
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

    // Captura de GPS automática al cargar
    let gpsData = { lat: 0, lon: 0, accuracy: 0 };
    const gpsStatusDiv = document.getElementById('gps-status');

    if (navigator.geolocation) {
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
                            <b>⚠️ Error de GPS:</b> Active la ubicación en su dispositivo.
                        </div>
                    `;
                }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }

    // Guardar Formulario de Supervisión
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
                evidencia: document.getElementById('evidencia-preview')?.src || 'Firma del Cliente',
                gps: gpsData
            };

            let historial = JSON.parse(localStorage.getItem('registros_intmex') || '[]');
            historial.push(nuevoRegistro);
            localStorage.setItem('registros_intmex', JSON.stringify(historial));

            alert("✅ ¡Supervisión guardada localmente con éxito!");
            formSupervision.reset();
            if (rutaSelect) rutaSelect.innerHTML = '<option value="">Primero seleccione un CEDIS</option>';
            cambiarVista('historial');
        });
    }

    // Vista de Historial, Base de Datos y Expedientes por Ruta
    function mostrarHistorialEnContenedor(contenedor) {
        let historialHTML = JSON.parse(localStorage.getItem('registros_intmex') || '[]');
        let rutasUnicas = [...new Set(historialHTML.map(reg => reg.ruta))].filter(Boolean);

        let html = `
            <div style="padding: 20px; color: #fff; max-width: 800px; margin: 0 auto; padding-bottom: 90px;">
                <h2>📊 Historial, Base de Datos y Expedientes</h2>
                <p>Registros almacenados localmente (${historialHTML.length}):</p>
                
                <div style="background: #1e293b; padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #334155;">
                    <h3 style="margin-top: 0; color: #38bdf8; font-size: 16px;">📈 Estadísticas Generales</h3>
                    <p style="font-size: 14px; margin: 5px 0;">Total de supervisiones: <b>${historialHTML.length}</b></p>
                    <p style="font-size: 14px; margin: 5px 0;">Rutas auditadas: <b>${rutasUnicas.join(', ') || 'Ninguna'}</b></p>
                </div>

                <div style="display: flex; gap: 10px; margin: 15px 0; flex-wrap: wrap;">
                    <button id="btn-exportar-csv" style="background: #059669; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; font-weight: 600;">📥 Descargar Base de Datos (CSV)</button>
                    <button id="btn-limpiar-historial" style="background: #dc2626; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; font-weight: 600;">🗑️ Borrar Historial</button>
                </div>

                <div style="background: #1e293b; padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #334155;">
                    <h3 style="margin-top: 0; color: #38bdf8; font-size: 16px;">📑 Expediente Ejecutivo de Supervisión (Excel por Ruta)</h3>
                    <p style="font-size: 13px; color: #94a3b8; margin-bottom: 10px;">Genera un reporte gerencial con estadísticas y detalle de visitas exclusivo para la ruta seleccionada.</p>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <select id="select-ruta-reporte" style="flex: 1; padding: 8px; border-radius: 6px; background: #0f172a; color: #fff; border: 1px solid #334155;">
                            <option value="">Seleccione Ruta para Expediente</option>
                            ${rutasUnicas.map(r => `<option value="${r}">${r}</option>`).join('')}
                        </select>
                        <button id="btn-exportar-excel-ruta" style="background: #2563eb; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; font-weight: 600;">📊 Descargar Expediente Excel</button>
                    </div>
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
                        <strong style="color: #38bdf8;">${reg.cliente}</strong> (CEDIS: ${reg.cedis || 'N/D'} | Ruta: ${reg.ruta})<br>
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

        // Evento botón exportar CSV general
        const btnExportarCsv = document.getElementById('btn-exportar-csv');
        if (btnExportarCsv) {
            btnExportarCsv.addEventListener('click', () => {
                if (historialHTML.length === 0) { alert("⚠️ No hay registros para exportar."); return; }
                exportarCSVGeneral(historialHTML);
            });
        }

        // Evento botón exportar Expediente Excel por ruta
        const btnExportarExcelRuta = document.getElementById('btn-exportar-excel-ruta');
        const selectRutaReporte = document.getElementById('select-ruta-reporte');
        if (btnExportarExcelRuta && selectRutaReporte) {
            btnExportarExcelRuta.addEventListener('click', () => {
                const rutaSeleccionada = selectRutaReporte.value;
                if (!rutaSeleccionada) {
                    alert("⚠️ Por favor seleccione una ruta para generar su expediente.");
                    return;
                }
                const filtrados = historialHTML.filter(reg => reg.ruta === rutaSeleccionada);
                if (filtrados.length === 0) {
                    alert("⚠️ No hay registros para la ruta seleccionada.");
                    return;
                }
                exportarReporteExcelIndividual(rutaSeleccionada, filtrados);
            });
        }

        // Evento limpiar historial
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

    function exportarCSVGeneral(datos) {
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; 
        csvContent += "ID,Fecha,CEDIS,Ruta,Cliente,Asesor,Atendio,TipoCliente,Latitud,Longitud,PrecisionGPS,Evidencia,SKU_No_Impactados,Notas\n";

        datos.forEach(reg => {
            let evLimpia = reg.evidencia || "Firma del Cliente";
            if (evLimpia.includes("undefined")) evLimpia = "Firma del Cliente";

            const fila = [
                reg.id,
                `"${reg.fecha}"`,
                `"${reg.cedis || ''}"`,
                `"${reg.ruta || ''}"`,
                `"${reg.cliente || ''}"`,
                `"${reg.asesor || ''}"`,
                `"${reg.quienRecibe || ''}"`,
                `"${reg.tipoCte || ''}"`,
                reg.gps ? reg.gps.lat : 0,
                reg.gps ? reg.gps.lon : 0,
                reg.gps ? `${reg.gps.accuracy}m` : '0m',
                `"${evLimpia}"`,
                `"${reg.codigosSinImpactar || ''}"`,
                `"${(reg.notas || '').replace(/"/g, '""')}"`
            ];
            csvContent += fila.join(",") + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", encodedUri);
        downloadAnchor.setAttribute("download", `base_datos_universo_clientes_${Date.now()}.csv`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    }

    function exportarReporteExcelIndividual(ruta, datosRuta) {
        const totalVisitas = datosRuta.length;
        const cedisActual = datosRuta[0].cedis || 'N/D';
        const asesorActual = datosRuta[0].asesor || 'N/D';
        const tiposConteo = datosRuta.reduce((acc, curr) => {
            acc[curr.tipoCte] = (acc[curr.tipoCte] || 0) + 1;
            return acc;
        }, {});

        let excelHtml = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
            <head><meta charset="UTF-8"></head>
            <body>
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #1e3a8a; margin: 0;">EXPEDIENTE DE SUPERVISIÓN DE RUTA</h2>
                    <p style="color: #555; font-size: 12px;">Sistema de Control de Campo y Auditoría INTMEX</p>
                </div>

                <table border="1" style="border-collapse: collapse; width: 100%;">
                    <tr style="background-color: #f3f4f6;">
                        <th style="padding: 8px;">CEDIS</th>
                        <th style="padding: 8px;">Ruta</th>
                        <th style="padding: 8px;">Asesor Asignado</th>
                        <th style="padding: 8px;">Total Visitas</th>
                        <th style="padding: 8px;">Desglose Tipos (A/B/C)</th>
                    </tr>
                    <tr>
                        <td style="padding: 8px; text-align: center;">${cedisActual}</td>
                        <td style="padding: 8px; text-align: center; font-weight: bold;">${ruta}</td>
                        <td style="padding: 8px; text-align: center;">${asesorActual}</td>
                        <td style="padding: 8px; text-align: center;">${totalVisitas}</td>
                        <td style="padding: 8px; text-align: center;">A: ${tiposConteo['A'] || 0} | B: ${tiposConteo['B'] || 0} | C: ${tiposConteo['C'] || 0}</td>
                    </tr>
                </table>

                <br>
                <h3 style="color: #1e3a8a;">DETALLE DE VISITAS Y AUDITORÍA</h3>
                <table border="1" style="border-collapse: collapse; width: 100%;">
                    <thead>
                        <tr style="background-color: #2563eb; color: #ffffff;">
                            <th style="padding: 8px;">ID Visita</th>
                            <th style="padding: 8px;">Fecha y Hora</th>
                            <th style="padding: 8px;">Cliente</th>
                            <th style="padding: 8px;">Teléfono</th>
                            <th style="padding: 8px;">Persona que Atiende</th>
                            <th style="padding: 8px;">Tipo Cliente</th>
                            <th style="padding: 8px;">Coordenadas GPS</th>
                            <th style="padding: 8px;">Evidencia</th>
                            <th style="padding: 8px;">SKU No Impactados</th>
                            <th style="padding: 8px;">Observaciones / Notas</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        datosRuta.forEach(reg => {
            let evLimpia = reg.evidencia || "Firma del Cliente";
            if (evLimpia.includes("undefined")) evLimpia = "Firma del Cliente";

            excelHtml += `
                <tr>
                    <td style="padding: 6px;">${reg.id}</td>
                    <td style="padding: 6px;">${reg.fecha}</td>
                    <td style="padding: 6px;">${reg.cliente}</td>
                    <td style="padding: 6px;">${reg.telefono || 'N/D'}</td>
                    <td style="padding: 6px;">${reg.quienRecibe}</td>
                    <td style="padding: 6px; text-align: center;">${reg.tipoCte}</td>
                    <td style="padding: 6px;">Lat: ${reg.gps.lat.toFixed(5)}, Lon: ${reg.gps.lon.toFixed(5)}</td>
                    <td style="padding: 6px;">${evLimpia}</td>
                    <td style="padding: 6px;">${reg.codigosSinImpactar || 'Ninguno'}</td>
                    <td style="padding: 6px;">${reg.notas || 'Sin notas'}</td>
                </tr>
            `;
        });

        excelHtml += `
                    </tbody>
                </table>
            </body>
            </html>
        `;

        const blob = new Blob([excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const downloadAnchor = document.createElement('a');
        downloadAnchor.href = url;
        downloadAnchor.download = `expediente_ruta_${ruta}_${Date.now()}.xls`;
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        URL.revokeObjectURL(url);
    }

    // Mapa Leaflet (Libre de API Keys)
    let map = null;
    function mostrarMapaEnContenedor(contenedor) {
        contenedor.innerHTML = `
            <div style="padding: 20px; color: #fff; max-width: 800px; margin: 0 auto; padding-bottom: 90px;">
                <h2>🗺️ Mapa de Visitas y Auditoría</h2>
                <p>Pines diferenciados por ubicación GPS recopilada:</p>
                <div id="leaflet-map" style="height: 450px; width: 100%; border-radius: 8px; border: 1px solid #334155; margin-top: 15px;"></div>
            </div>
        `;

        setTimeout(() => {
            if (!map) {
                map = L.map('leaflet-map').setView([32.5149, -117.0382], 12);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: '© OpenStreetMap contributors'
                }).addTo(map);
            } else {
                map.invalidateSize();
            }

            let historial = JSON.parse(localStorage.getItem('registros_intmex') || '[]');
            let bounds = [];

            historial.forEach(reg => {
                if (reg.gps && reg.gps.lat && reg.gps.lon) {
                    const marker = L.marker([reg.gps.lat, reg.gps.lon]).addTo(map);
                    marker.bindPopup(`<b>${reg.cliente}</b><br>Ruta: ${reg.ruta}<br>Asesor: ${reg.asesor}`);
                    bounds.push([reg.gps.lat, reg.gps.lon]);
                }
            });

            if (bounds.length > 0) {
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        }, 200);
    }
});
