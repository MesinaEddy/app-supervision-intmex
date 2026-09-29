document.addEventListener('DOMContentLoaded', () => {
    // Referencias principales
    // Referencias de pestañas y vistas
    const tabRegistro = document.getElementById('tab-registro');
    const tabHistorial = document.getElementById('tab-historial');
    const tabMapa = document.getElementById('tab-mapa');
@@ -8,35 +8,42 @@ document.addEventListener('DOMContentLoaded', () => {
    const viewHistorial = document.getElementById('view-historial');
    const viewMapa = document.getElementById('view-mapa');

    // Cambiar entre pestañas
    function cambiarVista(vistaActiva) {
        [viewRegistro, viewHistorial, viewMapa].forEach(v => v.style.display = 'none');
        [tabRegistro, tabHistorial, tabMapa].forEach(t => t.classList.remove('active'));
        // Ocultar todas las vistas y remover la clase active de las pestañas
        if (viewRegistro) viewRegistro.classList.remove('active-view');
        if (viewHistorial) viewHistorial.classList.remove('active-view');
        if (viewMapa) viewMapa.classList.remove('active-view');

        if (tabRegistro) tabRegistro.classList.remove('active');
        if (tabHistorial) tabHistorial.classList.remove('active');
        if (tabMapa) tabMapa.classList.remove('active');

        // Mostrar la vista seleccionada
        if (vistaActiva === 'registro') {
            viewRegistro.style.display = 'block';
            tabRegistro.classList.add('active');
            if (viewRegistro) viewRegistro.classList.add('active-view');
            if (tabRegistro) tabRegistro.classList.add('active');
        } else if (vistaActiva === 'historial') {
            viewHistorial.style.display = 'block';
            tabHistorial.classList.add('active');
            if (viewHistorial) viewHistorial.classList.add('active-view');
            if (tabHistorial) tabHistorial.classList.add('active');
            mostrarHistorialEnContenedor(viewHistorial);
        } else if (vistaActiva === 'mapa') {
            viewMapa.style.display = 'block';
            tabMapa.classList.add('active');
            if (viewMapa) viewMapa.classList.add('active-view');
            if (tabMapa) tabMapa.classList.add('active');
            mostrarMapaEnContenedor(viewMapa);
        }
    }

    tabRegistro.addEventListener('click', () => cambiarVista('registro'));
    tabHistorial.addEventListener('click', () => cambiarVista('historial'));
    tabMapa.addEventListener('click', () => cambiarVista('mapa'));
    // Eventos de clic en la barra inferior
    if (tabRegistro) tabRegistro.addEventListener('click', () => cambiarVista('registro'));
    if (tabHistorial) tabHistorial.addEventListener('click', () => cambiarVista('historial'));
    if (tabMapa) tabMapa.addEventListener('click', () => cambiarVista('mapa'));

    // Configuración de CEDIS y Rutas Dinámicas (Del 01 al 18 y bloque 301 a 306 para TODOS)
    // Generador dinámico de rutas por CEDIS
    function generarRutas(prefijo, inicio, fin) {
        let rutas = [];
        for (let i = inicio; i <= fin; i++) {
            let numStr = i < 10 ? '0' + i : i;
            if (i >= 301) numStr = i; // Mantener 301, 302...
            if (i >= 301) numStr = i;
            rutas.push(prefijo + numStr);
        }
        return rutas;
@@ -72,41 +79,55 @@ document.addEventListener('DOMContentLoaded', () => {
        });
    }

    // Captura de GPS automática al cargar
    // GPS automático
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

    // Guardar Formulario de Supervisión
    // Guardar formulario en LocalStorage
    const formSupervision = document.getElementById('form-supervision');
    if (formSupervision) {
        formSupervision.addEventListener('submit', (e) => {
@@ -124,285 +145,141 @@ document.addEventListener('DOMContentLoaded', () => {
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
            alert("✅ ¡Supervisión guardada con éxito!");
            formSupervision.reset();
            if (rutaSelect) rutaSelect.innerHTML = '<option value="">Primero seleccione un CEDIS</option>';
            cambiarVista('historial');
        });
    }

    // Vista de Historial, Base de Datos y Expedientes por Ruta
    // Funcionalidad de Historial
    function mostrarHistorialEnContenedor(contenedor) {
        let historialHTML = JSON.parse(localStorage.getItem('registros_intmex') || '[]');
        let rutasUnicas = [...new Set(historialHTML.map(reg => reg.ruta))].filter(Boolean);

        let html = `
            <div style="padding: 20px; color: #fff; max-width: 800px; margin: 0 auto; padding-bottom: 90px;">
                <h2>📊 Historial, Base de Datos y Expedientes</h2>
                <p>Registros almacenados localmente (${historialHTML.length}):</p>
                <h2>📊 Historial y Expedientes</h2>
                <p>Registros almacenados localmente: <b>${historialHTML.length}</b></p>
                
                <div style="background: #1e293b; padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #334155;">
                    <h3 style="margin-top: 0; color: #38bdf8; font-size: 16px;">📈 Estadísticas Generales</h3>
                    <p style="font-size: 14px; margin: 5px 0;">Total de supervisiones: <b>${historialHTML.length}</b></p>
                    <p style="font-size: 14px; margin: 5px 0;">Rutas auditadas: <b>${rutasUnicas.join(', ') || 'Ninguna'}</b></p>
                </div>

                <div style="display: flex; gap: 10px; margin: 15px 0; flex-wrap: wrap;">
                    <button id="btn-exportar-csv" style="background: #059669; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; font-weight: 600;">📥 Descargar Base de Datos (CSV)</button>
                    <button id="btn-exportar-csv" style="background: #059669; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; font-weight: 600;">📥 Descargar CSV</button>
                    <button id="btn-limpiar-historial" style="background: #dc2626; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; font-weight: 600;">🗑️ Borrar Historial</button>
                </div>

                <div style="background: #1e293b; padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #334155;">
                    <h3 style="margin-top: 0; color: #38bdf8; font-size: 16px;">📑 Expediente Ejecutivo de Supervisión (Excel por Ruta)</h3>
                    <p style="font-size: 13px; color: #94a3b8; margin-bottom: 10px;">Genera un reporte gerencial con estadísticas y detalle de visitas exclusivo para la ruta seleccionada.</p>
                    <h3 style="margin-top: 0; color: #38bdf8; font-size: 16px;">📑 Expediente por Ruta (Excel)</h3>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <select id="select-ruta-reporte" style="flex: 1; padding: 8px; border-radius: 6px; background: #0f172a; color: #fff; border: 1px solid #334155;">
                            <option value="">Seleccione Ruta para Expediente</option>
                            <option value="">Seleccione Ruta</option>
                            ${rutasUnicas.map(r => `<option value="${r}">${r}</option>`).join('')}
                        </select>
                        <button id="btn-exportar-excel-ruta" style="background: #2563eb; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; font-weight: 600;">📊 Descargar Expediente Excel</button>
                        <button id="btn-exportar-excel-ruta" style="background: #2563eb; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; font-weight: 600;">📊 Descargar Excel</button>
                    </div>
                </div>

                <hr style="border-color: #333; margin-bottom: 20px;">
                <hr style="border-color: #334155; margin-bottom: 20px;">
        `;

        if (historialHTML.length === 0) {
            html += `<p style="color: #9ca3af;">No hay registros guardados todavía.</p>`;
            html += `<p style="color: #94a3b8;">No hay registros guardados todavía.</p>`;
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
                        <strong style="color: #38bdf8;">${reg.cliente}</strong> (CEDIS: ${reg.cedis} | Ruta: ${reg.ruta})<br>
                        <small style="color: #94a3b8;">📅 ${reg.fecha} | Asesor: ${reg.asesor}</small>
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
        document.getElementById('btn-exportar-csv')?.addEventListener('click', () => {
            if (historialHTML.length === 0) { alert("⚠️ No hay registros."); return; }
            exportarCSVGeneral(historialHTML);
        });

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
        document.getElementById('btn-exportar-excel-ruta')?.addEventListener('click', () => {
            const rutaSel = document.getElementById('select-ruta-reporte')?.value;
            if (!rutaSel) { alert("⚠️ Seleccione una ruta."); return; }
            const filtrados = historialHTML.filter(reg => reg.ruta === rutaSel);
            exportarReporteExcelIndividual(rutaSel, filtrados);
        });

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
        document.getElementById('btn-limpiar-historial')?.addEventListener('click', () => {
            if (confirm("¿Desea vaciar todo el historial local?")) {
                localStorage.removeItem('registros_intmex');
                mostrarHistorialEnContenedor(contenedor);
            }
        });
    }

    function exportarCSVGeneral(datos) {
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; 
        csvContent += "ID,Fecha,CEDIS,Ruta,Cliente,Asesor,Atendio,TipoCliente,Latitud,Longitud,PrecisionGPS,Evidencia,SKU_No_Impactados,Notas\n";

        let csvContent = "data:text/csv;charset=utf-8,\uFEFFID,Fecha,CEDIS,Ruta,Cliente,Asesor,Atendio,TipoCliente,Latitud,Longitud\n";
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
            csvContent += `${reg.id},"${reg.fecha}","${reg.cedis}","${reg.ruta}","${reg.cliente}","${reg.asesor}","${reg.quienRecibe}","${reg.tipoCte}",${reg.gps.lat},${reg.gps.lon}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", encodedUri);
        downloadAnchor.setAttribute("download", `base_datos_universo_clientes_${Date.now()}.csv`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `base_datos_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
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

        let excelHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"></head><body><h3>Expediente Ruta ${ruta}</h3><table border="1"><tr><th>Cliente</th><th>Atendió</th><th>Fecha</th></tr>`;
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
            excelHtml += `<tr><td>${reg.cliente}</td><td>${reg.quienRecibe}</td><td>${reg.fecha}</td></tr>`;
        });

        excelHtml += `
                    </tbody>
                </table>
            </body>
            </html>
        `;

        excelHtml += `</table></body></html>`;
        const blob = new Blob([excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const downloadAnchor = document.createElement('a');
        downloadAnchor.href = url;
        downloadAnchor.download = `expediente_ruta_${ruta}_${Date.now()}.xls`;
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        URL.revokeObjectURL(url);
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `expediente_${ruta}.xls`;
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    // Mapa Leaflet (Libre de API Keys)
    // Funcionalidad del Mapa Leaflet
    let map = null;
    function mostrarMapaEnContenedor(contenedor) {
        contenedor.innerHTML = `
            <div style="padding: 20px; color: #fff; max-width: 800px; margin: 0 auto; padding-bottom: 90px;">
                <h2>🗺️ Mapa de Visitas y Auditoría</h2>
                <p>Pines diferenciados por ubicación GPS recopilada:</p>
                <h2>🗺️ Mapa de Visitas</h2>
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
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
            } else {
                map.invalidateSize();
            }

            let historial = JSON.parse(localStorage.getItem('registros_intmex') || '[]');
            let bounds = [];

            historial.forEach(reg => {
                if (reg.gps && reg.gps.lat && reg.gps.lon) {
                    const marker = L.marker([reg.gps.lat, reg.gps.lon]).addTo(map);
                    marker.bindPopup(`<b>${reg.cliente}</b><br>Ruta: ${reg.ruta}<br>Asesor: ${reg.asesor}`);
                if (reg.gps && reg.gps.lat) {
                    L.marker([reg.gps.lat, reg.gps.lon]).addTo(map).bindPopup(`<b>${reg.cliente}</b><br>Ruta: ${reg.ruta}`);
                    bounds.push([reg.gps.lat, reg.gps.lon]);
                }
            });

            if (bounds.length > 0) {
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        }, 200);
        }, 250);
    }
});
