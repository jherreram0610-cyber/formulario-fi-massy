/* PDF Generator usando pdf-lib y los campos del formulario (AcroForm) */
function gv(id){return document.getElementById(id)?.value||'';}
function getPill(cid){var c=document.getElementById(cid);if(!c)return '';var s=c.querySelector('.pill.selected');return s?s.textContent.trim():'';}
function getSelect(id){var e=document.getElementById(id);return e&&e.selectedIndex>0?e.options[e.selectedIndex].text:'';}

function showPdfStatus(msg, color){
  var existing = document.getElementById('pdf-status-msg');
  if(existing) existing.remove();
  var div = document.createElement('div');
  div.id = 'pdf-status-msg';
  div.style.cssText = 'position:fixed;bottom:70px;left:50%;transform:translateX(-50%);background:'+(color||'#1a5276')+';color:#fff;padding:12px 24px;border-radius:8px;font-family:Barlow,sans-serif;font-size:14px;z-index:99999;box-shadow:0 4px 16px rgba(0,0,0,.25);text-align:center;max-width:90vw';
  div.textContent = msg;
  document.body.appendChild(div);
  return div;
}

function generarPDF(){
  console.log('Iniciando pdf-lib generator');
  if(window.PDFLib){
    fillOriginalPDF();
    return;
  }
  var statusEl = showPdfStatus('⏳ Cargando módulo PDF, espere un momento...');
  var s=document.createElement('script');
  s.src='https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js';
  s.onload=function(){
    fillOriginalPDF();
  };
  s.onerror=function(){
    statusEl.remove();
    showPdfStatus('❌ Error cargando pdf-lib. Verifique su conexión.', '#c0392b');
    setTimeout(function(){ var e=document.getElementById('pdf-status-msg'); if(e)e.remove(); }, 5000);
  };
  document.head.appendChild(s);
}

async function fillOriginalPDF(){
  try {
    var statusEl = showPdfStatus('⏳ Generando PDF, espere un momento...');
    
    const { PDFDocument } = window.PDFLib;
    
    const url = 'FORMATO F&I 2025.pdf';
    const existingPdfBytes = await fetch(url).then(res => {
      if(!res.ok) throw new Error("No se pudo cargar el archivo " + url);
      return res.arrayBuffer();
    });
    
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const form = pdfDoc.getForm();

    // Funciones de ayuda
    function setTxt(name, val) {
      try {
        if(!val) return;
        const field = form.getTextField(name);
        if(field) field.setText(String(val));
      } catch(e) { console.warn('No se pudo llenar campo texto:', name, e); }
    }
    function setChk(name, condition) {
      try {
        const field = form.getCheckBox(name);
        if(field) {
          if(condition) field.check();
          else field.uncheck();
        }
      } catch(e) { console.warn('No se pudo marcar checkbox:', name, e); }
    }

    // --- Vehículo ---
    const fec = gv('fecha').split('-');
    if(fec.length === 3) {
      setTxt('dd', fec[2]);
      setTxt('mm', fec[1]);
      setTxt('aa', fec[0]);
    }
    setTxt('Concesionario', gv('concesionario'));
    setTxt('Asesor', gv('asesor'));
    setTxt('Cedula Asesor', gv('cedulaAsesor'));
    setTxt('Referencia', gv('refVehiculo'));
    setTxt('Modelo', gv('modeloAno'));
    setTxt('Valor vehiculo', gv('valorVehiculo'));
    setTxt('Cuota Inicial', gv('cuotaInicial'));
    setTxt('Valor a financiar', gv('valorFinanciar'));
    
    const tc = getPill('tipoCredito');
    setChk('Nuevo', tc === 'Nuevo');
    setChk('Usado', tc === 'Usado');
    setChk('Leasing', tc === 'Leasing');

    const uv = getPill('usoVehiculo');
    setChk('Particular', uv === 'Particular');
    setChk('Publico', uv === 'Público');

    // --- Solicitante ---
    setTxt('Nombre Completo', gv('nombreSolicitante'));
    setTxt('cedula cliente', gv('numDocSol'));
    
    const fecNac = gv('fecNacSol').split('-');
    if(fecNac.length === 3) {
      setTxt('dd nacimiento cliente', fecNac[2]);
      setTxt('mm nacimiento cliente', fecNac[1]);
      setTxt('aa nacimiento cliente', fecNac[0]);
    }
    const fecExp = gv('fecExpSol').split('-');
    if(fecExp.length === 3) {
      setTxt('dd expedicion cliente', fecExp[2]);
      setTxt('mm expedicion', fecExp[1]);
      setTxt('aa expedicion', fecExp[0]);
    }

    const ds = getPill('tipoDocSol');
    setChk('cc cliente', ds === 'C.C.');
    setChk('ce cliente', ds === 'C.E.');
    setChk('pas cliente', ds === 'PAS');

    const ec = getPill('estadoCivil');
    setChk('Soltero', ec === 'Soltero');
    setChk('Casado', ec === 'Casado');
    setChk('union Libre', ec === 'U. Libre');
    setChk('Viudo', ec === 'Viudo');

    setTxt('Personas a cargo', gv('personasCargo'));
    setTxt('direccion residencia', gv('dirResidencia'));
    setTxt('Barrio', gv('barrio'));
    setTxt('Ciudad', gv('ciudad'));
    setTxt('celular cliente', gv('celularSol'));
    setTxt('email cliente', gv('emailSol'));

    const tv = getPill('tipoVivienda');
    setChk('propia', tv === 'Propia');
    setChk('familiar', tv === 'Familiar');
    setChk('alquilada', tv === 'Alquilada');

    // --- Cónyuge ---
    setTxt('nombre conyuge', gv('nombreConyuge'));
    setTxt('Cedula Conyuge', gv('numDocCon'));
    setTxt('celular conyuge', gv('celConyuge'));
    setTxt('email conyuge', gv('emailConyuge'));

    const dc = getPill('tipoDocCon');
    setChk('cc conyuge', dc === 'C.C.');
    setChk('ce conyuge', dc === 'C.E.');
    setChk('pas conyuge', dc === 'PAS');

    const fnc = gv('fecNacCon').split('-');
    if(fnc.length === 3) {
      setTxt('dd nacimiento conyuge', fnc[2]);
      setTxt('mm nacimiento Conyuge', fnc[1]);
      setTxt('aa nacimiento conyuge', fnc[0]);
    }
    const fecExc = gv('fecExpCon').split('-');
    if(fecExc.length === 3) {
      setTxt('dd expedicion conyuge', fecExc[2]);
      setTxt('mm expedicion conyuge', fecExc[1]);
      setTxt('aa expedicion conyuge', fecExc[0]);
    }

    // --- Laboral ---
    const vl = getPill('tipoVinculacion');
    setChk('independiente', vl === 'Independiente');
    setChk('asalariado', vl === 'Asalariado');
    setChk('rentista de capital', vl === 'Rentista de Capital');
    setChk('pensionado', vl === 'Pensionado');

    setTxt('antiguedad', gv('antiguedad'));
    setTxt('Empresa', gv('nombreEmpresa'));
    setTxt('cargo', gv('cargo'));
    setTxt('Profesion', gv('profesion'));
    setTxt('tipo de conrato', getSelect('tipoContrato'));
    setTxt('actividad economica', gv('actEconomica'));
    setTxt('direccion empresa', gv('dirEmpresa'));
    setTxt('telefono empresa', gv('telEmpresa'));
    setTxt('ciudad empresa', gv('ciudadEmpresa'));

    const pcc = document.querySelectorAll('.pill-check');
    if(pcc[0] && pcc[0].classList.contains('selected')) setChk('camara de comercio', true);
    if(pcc[1] && pcc[1].classList.contains('selected')) setChk('RUT', true);

    // --- Financiera ---
    setTxt('Salario', gv('salarioDeudor'));
    setTxt('comisiones', gv('comisionesDeudor'));
    setTxt('arriendos', gv('arriendosDeudor'));
    setTxt('otros', gv('otrosIngDeudor'));
    
    // Suma de Total Ingresos y mapeo en ambos campos que tiene el PDF
    setTxt('total ingresos', gv('totalIngDeudor'));
    setTxt('total ingreso', gv('totalIngDeudor'));

    // --- Referencias ---
    setTxt('Nombre referencia 1', gv('refPNombre1'));
    setTxt('celular referencia 1', gv('refPCel1'));
    setTxt('parentesco referencia 1', gv('refPPar1'));
    
    setTxt('nombre referencia 2', gv('refPNombre2'));
    setTxt('celular referencia 2', gv('refPCel2'));
    setTxt('parentesco referencia 2', gv('refPPar2'));

    setTxt('nombre referencia comercial 1', gv('refCNombre1'));
    setTxt('NIT referencia comercial 1', gv('refCNit1'));
    setTxt('celular referencia comercial 1', gv('refCCel1'));
    
    setTxt('nombre referencia comercial 2', gv('refCNombre2'));
    setTxt('NIT referencia comercial 2', gv('refCNit2'));
    setTxt('celular referencia comercial 2', gv('refCCel2'));

    // --- SARLAFT ---
    const expuesto = getPill('sarlaftExpuesto');
    setChk('politicamente expuesto si', expuesto === 'Sí');
    setChk('politicamente expuesto no', expuesto === 'No');

    const dineros = getPill('sarlaftDineros');
    setChk('maneja dineros publicos si', dineros === 'Sí');
    setChk('maneja dineros publicos no', dineros === 'No');

    const moneda = getPill('sarlaftMoneda');
    setChk('operaciones en moneda extranjera si', moneda === 'Sí');
    setChk('operaciones en moneda extranjera no', moneda === 'No');

    // --- Patrimonio Demostrado ---
    const inmu1 = getPill('tipoInmueble1');
    setChk('casa 1', inmu1 === 'Casa');
    setChk('apto 1', inmu1 === 'Apto');
    setChk('otro 1', inmu1 === 'Otro');
    setTxt('direccion 1', gv('dirInmueble1'));
    setTxt('valor comercial 1', gv('valInmueble1'));
    setTxt('entidad 1', gv('entInmueble1'));

    const inmu2 = getPill('tipoInmueble2');
    setChk('casa 2', inmu2 === 'Casa');
    setChk('apto 2', inmu2 === 'Apto');
    setChk('otro 2', inmu2 === 'Otro');
    setTxt('direccion 2', gv('dirInmueble2'));
    setTxt('valor comercial 2', gv('valInmueble2'));
    setTxt('entidad 2', gv('entInmueble2'));

    // --- Vehículos ---
    setTxt('referencia vehiculo 1', gv('refVeh1'));
    setTxt('modelo vehiculo 1', gv('modVeh1'));
    setTxt('placa vehiculo 1', gv('plaVeh1'));
    setTxt('Valor comercial  vehiculo 1', gv('valVeh1'));

    setTxt('referencia vehiculo 2', gv('refVeh2'));
    setTxt('modelo vehiculo 2', gv('modVeh2'));
    setTxt('placa vehiculo 2', gv('plaVeh2'));
    setTxt('valor comercial vehiculo 2', gv('valVeh2'));

    // --- Firmas (imágenes) ---
    // Usamos siempre la última página para dibujar firmas (evita error PDFRef)
    const pages = pdfDoc.getPages();
    const lastPage = pages[pages.length >= 2 ? pages.length - 1 : 0];

    try {
      // Intentar obtener rect del campo firma deudor
      let sigRect = { x: 50, y: 90, width: 200, height: 50 }; // coordenadas por defecto
      try {
        const fieldDeudor = form.getTextField('firma deudor');
        if(fieldDeudor) {
          const widgets = fieldDeudor.acroField.getWidgets();
          if(widgets && widgets.length > 0) {
            const r = widgets[0].getRectangle();
            if(r && r.width > 0) sigRect = r;
          }
        }
      } catch(fe) { console.warn('Campo firma deudor no encontrado, usando coords por defecto', fe); }

      const sigSolData = document.getElementById('sigSol').toDataURL('image/png');
      const pngImage = await pdfDoc.embedPng(sigSolData);
      lastPage.drawImage(pngImage, { x: sigRect.x, y: sigRect.y, width: sigRect.width, height: sigRect.height });
      setTxt('cedula deudor', gv('ccFirmaSol'));
    } catch(e) { console.error("No se pudo pegar firma solicitante", e); }

    try {
      if(gv('ccFirmaCon')) {
        const sigConData = document.getElementById('sigCon').toDataURL('image/png');
        const pngImage2 = await pdfDoc.embedPng(sigConData);
        lastPage.drawImage(pngImage2, { x: 350, y: 90, width: 180, height: 50 });
      }
    } catch(e) { console.error("No se pudo pegar firma cónyuge", e); }

    // ── APLANAR EL FORMULARIO (hacer PDF no editable) ────────────────────
    // pdf-lib tiene un bug con ciertos PDFs donde form.flatten() no puede
    // resolver la referencia de página de cada widget (error PDFRef).
    // Solución: parchamos manualmente la entrada "P" de cada anotación
    // con la referencia correcta de su página, luego aplanamos.
    try {
      const { PDFName } = window.PDFLib;
      const allPages = pdfDoc.getPages();

      // Paso 1: vincular cada widget a su página correcta
      allPages.forEach(function(page) {
        try {
          const annotsRef = page.node.get(PDFName.of('Annots'));
          if (!annotsRef) return;
          const annots = pdfDoc.context.lookup(annotsRef);
          if (!annots || !annots.asArray) return;
          annots.asArray().forEach(function(annotRef) {
            try {
              const annot = pdfDoc.context.lookup(annotRef);
              if (annot && annot.set && annot.has) {
                annot.set(PDFName.of('P'), page.ref);
              }
            } catch(e) {}
          });
        } catch(e) {}
      });

      // Paso 2: aplanar — ahora puede resolver todas las referencias
      form.flatten();

    } catch(flatErr) {
      console.warn('form.flatten() falló, aplicando read-only por campo:', flatErr);
      // Fallback: marcar cada campo como solo lectura
      try {
        form.getFields().forEach(function(field) {
          try { field.enableReadOnly(); } catch(e) {}
        });
      } catch(e2) { console.warn('Fallback read-only también falló:', e2); }
    }
    
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);
    
    // Descarga directa sin popup — compatible con bloqueadores de elementos emergentes
    statusEl.remove();
    var a = document.createElement('a');
    a.href = blobUrl;
    a.download = 'Solicitud-Credito-Massy-Motors.pdf';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(function(){
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    }, 3000);
    showPdfStatus('✅ PDF generado. Revise sus descargas.', '#1a7a3a');
    setTimeout(function(){ var e=document.getElementById('pdf-status-msg'); if(e)e.remove(); }, 6000);
    
  } catch(err) {
    if(typeof statusEl !== 'undefined' && statusEl) try { statusEl.remove(); } catch(x){}
    console.error(err);
    showPdfStatus('❌ Error al generar PDF: ' + err.message, '#c0392b');
    setTimeout(function(){ var e=document.getElementById('pdf-status-msg'); if(e)e.remove(); }, 8000);
  }
}
