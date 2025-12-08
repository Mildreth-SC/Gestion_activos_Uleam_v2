/**
 * Módulo especializado en XML para Auditorías y Control de Activos
 * Funcionalidades únicas diferentes al JSON
 */

class XMLAuditoria {
    
    // 1. GENERAR REPORTE DE AUDITORÍA COMPLETO
    static generarReporteAuditoria() {
        const assets = this.getAssetsFromJSON();
        const fechaActual = new Date();
        
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<auditoriaActivos>\n';
        
        // Información de auditoría
        xml += '  <informacionAuditoria>\n';
        xml += `    <numeroAuditoria>AUD-${fechaActual.getFullYear()}-${String(fechaActual.getMonth() + 1).padStart(3, '0')}</numeroAuditoria>\n`;
        xml += `    <fechaAuditoria>${fechaActual.toISOString().split('T')[0]}</fechaAuditoria>\n`;
        xml += `    <auditor>Sistema Automático ULEAM</auditor>\n`;
        xml += '    <periodo>\n';
        xml += `      <inicio>2023-01-01</inicio>\n`;
        xml += `      <fin>${fechaActual.toISOString().split('T')[0]}</fin>\n`;
        xml += '    </periodo>\n';
        xml += '  </informacionAuditoria>\n';
        
        // Resumen general con cálculos
        const totalActivos = assets.length;
        const valorTotal = assets.reduce((sum, a) => sum + (a.price * a.quantity), 0);
        const asignados = assets.filter(a => a.status === 'Asignado').length;
        const disponibles = assets.filter(a => a.status === 'Disponible').length;
        const depreciacionEstimada = valorTotal * 0.10;
        
        xml += '  <resumenGeneral>\n';
        xml += `    <totalActivos>${totalActivos}</totalActivos>\n`;
        xml += `    <valorTotalInventario>${valorTotal.toFixed(2)}</valorTotalInventario>\n`;
        xml += `    <activosAsignados>${asignados}</activosAsignados>\n`;
        xml += `    <activosDisponibles>${disponibles}</activosDisponibles>\n`;
        xml += `    <depreciacionEstimada>${depreciacionEstimada.toFixed(2)}</depreciacionEstimada>\n`;
        xml += '  </resumenGeneral>\n';
        
        // Activos detallados
        xml += '  <activos>\n';
        assets.forEach((asset, index) => {
            const criticidad = this.calcularCriticidad(asset);
            const vidaUtil = this.calcularVidaUtil(asset.type);
            const depreciacion = this.calcularDepreciacion(asset, vidaUtil);
            
            xml += `    <activo id="${asset.id}" criticidad="${criticidad}">\n`;
            xml += `      <codigoPatrimonial>PAT-${asset.date.substring(0,4)}-${String(index + 1).padStart(3, '0')}</codigoPatrimonial>\n`;
            xml += `      <descripcion><![CDATA[${asset.name}]]></descripcion>\n`;
            xml += `      <categoria><![CDATA[${asset.type}]]></categoria>\n`;
            xml += '      <asignacion>\n';
            xml += `        <responsable><![CDATA[${asset.responsible}]]></responsable>\n`;
            xml += `        <ubicacion><![CDATA[${asset.location}]]></ubicacion>\n`;
            xml += `        <fechaAsignacion>${asset.date}</fechaAsignacion>\n`;
            xml += '      </asignacion>\n';
            xml += '      <valoracion>\n';
            xml += `        <cantidad>${asset.quantity}</cantidad>\n`;
            xml += `        <valorUnitario>${asset.price.toFixed(2)}</valorUnitario>\n`;
            xml += `        <valorTotal>${(asset.price * asset.quantity).toFixed(2)}</valorTotal>\n`;
            xml += `        <vidaUtil>${vidaUtil} años</vidaUtil>\n`;
            xml += `        <depreciacionMensual>${depreciacion.mensual.toFixed(2)}</depreciacionMensual>\n`;
            xml += `        <valorActual>${depreciacion.valorActual.toFixed(2)}</valorActual>\n`;
            xml += '      </valoracion>\n';
            xml += `      <estadoFisico>Bueno</estadoFisico>\n`;
            xml += '    </activo>\n';
        });
        xml += '  </activos>\n';
        
        // Alertas
        xml += '  <alertas>\n';
        assets.forEach(asset => {
            const alertas = this.generarAlertas(asset);
            alertas.forEach(alerta => {
                xml += `    <alerta tipo="${alerta.tipo}" prioridad="${alerta.prioridad}">\n`;
                xml += `      <activo>${asset.id}</activo>\n`;
                xml += `      <mensaje><![CDATA[${alerta.mensaje}]]></mensaje>\n`;
                xml += `      <fechaEmision>${new Date().toISOString().split('T')[0]}</fechaEmision>\n`;
                xml += '    </alerta>\n';
            });
        });
        xml += '  </alertas>\n';
        
        // Firmas
        xml += '  <firmas>\n';
        xml += '    <responsableInventario>\n';
        xml += '      <nombre>Dr. Carlos Mendoza</nombre>\n';
        xml += '      <cargo>Director Administrativo</cargo>\n';
        xml += `      <fecha>${new Date().toISOString().split('T')[0]}</fecha>\n`;
        xml += '    </responsableInventario>\n';
        xml += '  </firmas>\n';
        xml += '</auditoriaActivos>';
        
        return xml;
    }
    
    // 2. CERTIFICADO DE ASIGNACIÓN
    static generarCertificadoAsignacion(assetId) {
        const assets = this.getAssetsFromJSON();
        const asset = assets.find(a => a.id === parseInt(assetId));
        
        if (!asset) return null;
        
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<certificadoAsignacion>\n';
        xml += `  <numeroCertificado>CERT-${Date.now()}</numeroCertificado>\n`;
        xml += `  <fechaEmision>${new Date().toLocaleDateString('es-EC')}</fechaEmision>\n`;
        xml += '  <institucion>\n';
        xml += '    <nombre>Universidad Laica Eloy Alfaro de Manabí</nombre>\n';
        xml += '    <siglas>ULEAM</siglas>\n';
        xml += '  </institucion>\n';
        xml += '  <activoAsignado>\n';
        xml += `    <codigo>${asset.id}</codigo>\n`;
        xml += `    <descripcion><![CDATA[${asset.name}]]></descripcion>\n`;
        xml += `    <valorDeclarado>$${(asset.price * asset.quantity).toFixed(2)}</valorDeclarado>\n`;
        xml += '  </activoAsignado>\n';
        xml += '  <responsable>\n';
        xml += `    <nombre><![CDATA[${asset.responsible}]]></nombre>\n`;
        xml += `    <ubicacion><![CDATA[${asset.location}]]></ubicacion>\n`;
        xml += '    <responsabilidades>\n';
        xml += '      <responsabilidad>Uso adecuado del activo</responsabilidad>\n';
        xml += '      <responsabilidad>Custodia y conservación</responsabilidad>\n';
        xml += '    </responsabilidades>\n';
        xml += '  </responsable>\n';
        xml += '</certificadoAsignacion>';
        
        return xml;
    }
    
    // 3. REPORTE DE DEPRECIACIÓN
    static generarReporteDepreciacion() {
        const assets = this.getAssetsFromJSON();
        
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<reporteDepreciacion>\n';
        xml += `  <periodoFiscal>${new Date().getFullYear()}</periodoFiscal>\n`;
        
        let totalDepreciacion = 0;
        
        xml += '  <activos>\n';
        assets.forEach(asset => {
            const vidaUtil = this.calcularVidaUtil(asset.type);
            const depreciacion = this.calcularDepreciacion(asset, vidaUtil);
            totalDepreciacion += depreciacion.acumulada;
            
            xml += '    <activo>\n';
            xml += `      <codigo>${asset.id}</codigo>\n`;
            xml += `      <descripcion><![CDATA[${asset.name}]]></descripcion>\n`;
            xml += `      <valorOriginal>${(asset.price * asset.quantity).toFixed(2)}</valorOriginal>\n`;
            xml += `      <depreciacionAcumulada>${depreciacion.acumulada.toFixed(2)}</depreciacionAcumulada>\n`;
            xml += `      <valorEnLibros>${depreciacion.valorActual.toFixed(2)}</valorEnLibros>\n`;
            xml += '    </activo>\n';
        });
        xml += '  </activos>\n';
        xml += `  <totalDepreciacion>${totalDepreciacion.toFixed(2)}</totalDepreciacion>\n`;
        xml += '</reporteDepreciacion>';
        
        return xml;
    }
    
    // 4. HISTORIAL DE MOVIMIENTOS
    static generarHistorialMovimientos() {
        const assets = this.getAssetsFromJSON();
        
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<historialMovimientos>\n';
        xml += `  <fechaGeneracion>${new Date().toISOString()}</fechaGeneracion>\n`;
        xml += '  <movimientos>\n';
        
        assets.forEach(asset => {
            xml += '    <movimiento>\n';
            xml += `      <tipoMovimiento>Asignación Inicial</tipoMovimiento>\n`;
            xml += `      <fecha>${asset.date}</fecha>\n`;
            xml += `      <activo><![CDATA[${asset.name}]]></activo>\n`;
            xml += `      <destino><![CDATA[${asset.location}]]></destino>\n`;
            xml += `      <responsable><![CDATA[${asset.responsible}]]></responsable>\n`;
            xml += '    </movimiento>\n';
        });
        
        xml += '  </movimientos>\n';
        xml += '</historialMovimientos>';
        
        return xml;
    }
    
    // FUNCIONES AUXILIARES
    static calcularCriticidad(asset) {
        if (asset.price > 500) return 'Alta';
        if (asset.price > 100) return 'Media';
        return 'Baja';
    }
    
    static calcularVidaUtil(tipo) {
        const vidasUtiles = {
            'Equipos de cómputo y software': 5,
            'Instalaciones, maquinaria, equipos y muebles': 10,
            'Vehículos': 7,
            'Edificios': 20
        };
        return vidasUtiles[tipo] || 5;
    }
    
    static calcularDepreciacion(asset, vidaUtil) {
        const valorTotal = asset.price * asset.quantity;
        const fechaAdquisicion = new Date(asset.date);
        const mesesTranscurridos = Math.floor((new Date() - fechaAdquisicion) / (1000 * 60 * 60 * 24 * 30));
        
        const depreciacionAnual = valorTotal / vidaUtil;
        const depreciacionMensual = depreciacionAnual / 12;
        const depreciacionAcumulada = Math.min(depreciacionMensual * mesesTranscurridos, valorTotal);
        const valorActual = Math.max(valorTotal - depreciacionAcumulada, 0);
        const porcentaje = (depreciacionAcumulada / valorTotal) * 100;
        
        return {
            anual: depreciacionAnual,
            mensual: depreciacionMensual,
            acumulada: depreciacionAcumulada,
            valorActual: valorActual,
            porcentaje: porcentaje
        };
    }
    
    static generarAlertas(asset) {
        const alertas = [];
        const vidaUtil = this.calcularVidaUtil(asset.type);
        const depreciacion = this.calcularDepreciacion(asset, vidaUtil);
        
        if (depreciacion.porcentaje > 50) {
            alertas.push({
                tipo: 'Depreciación',
                prioridad: depreciacion.porcentaje > 80 ? 'Alta' : 'Media',
                mensaje: `Activo ha alcanzado ${depreciacion.porcentaje.toFixed(0)}% de depreciación`
            });
        }
        
        return alertas;
    }
    
    static getAssetsFromJSON() {
        let assets = localStorage.getItem('assets');
        if (assets) {
            return JSON.parse(assets);
        }
        return [];
    }
    
    static downloadXML(xmlContent, filename) {
        const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

// FUNCIONES GLOBALES
function generarAuditoriaXML() {
    const xml = XMLAuditoria.generarReporteAuditoria();
    XMLAuditoria.downloadXML(xml, `auditoria_${new Date().toISOString().split('T')[0]}.xml`);
    alert('✅ Reporte de auditoría generado');
}

function generarCertificadoXML(assetId) {
    const xml = XMLAuditoria.generarCertificadoAsignacion(assetId);
    if (xml) {
        XMLAuditoria.downloadXML(xml, `certificado_${assetId}.xml`);
        alert('✅ Certificado generado');
    } else {
        alert('❌ Activo no encontrado');
    }
}

function generarDepreciacionXML() {
    const xml = XMLAuditoria.generarReporteDepreciacion();
    XMLAuditoria.downloadXML(xml, `depreciacion_${new Date().getFullYear()}.xml`);
    alert('✅ Reporte de depreciación generado');
}

function generarHistorialXML() {
    const xml = XMLAuditoria.generarHistorialMovimientos();
    XMLAuditoria.downloadXML(xml, `historial_${new Date().toISOString().split('T')[0]}.xml`);
    alert('✅ Historial generado');
}
