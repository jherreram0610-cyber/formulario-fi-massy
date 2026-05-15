/* PDF Generator usando pdf-lib y los campos del formulario (AcroForm) */
function gv(id){return document.getElementById(id)?.value||'';}
function getPill(cid){var c=document.getElementById(cid);if(!c)return '';var s=c.querySelector('.pill.selected');return s?s.textContent.trim():'';}
function getSelect(id){var e=document.getElementById(id);return e&&e.selectedIndex>0?e.options[e.selectedIndex].text:'';}

function generarPDF(){
  console.log('Iniciando pdf-lib generator');
  if(window.PDFLib){
    fillOriginalPDF();
    return;
  }
  var s=document.createElement('script');
  s.src='https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js';
  s.onload=function(){
    fillOriginalPDF();
  };
  s.onerror=function(){
    alert('Error cargando pdf-lib');
  };
  document.head.appendChild(s);
}

async function fillOriginalPDF(){
  try {
    alert('Cargando formulario PDF. Esto puede tardar unos segundos...');
    
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
    try {
      const fieldDeudor = form.getTextField('firma deudor');
      if(fieldDeudor) {
        const widgets = fieldDeudor.acroField.getWidgets();
        if(widgets && widgets.length > 0) {
          const rect = widgets[0].getRectangle();
          const pageRef = widgets[0].P();
          const pages = pdfDoc.getPages();
          let targetPage = pages[pages.length - 1]; // fallback
          for(const p of pages) {
            if(p.ref === pageRef) { targetPage = p; break; }
          }
          
          const sigSolData = document.getElementById('sigSol').toDataURL('image/png');
          const pngImage = await pdfDoc.embedPng(sigSolData);
          targetPage.drawImage(pngImage, {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
          });
          setTxt('cedula deudor', gv('ccFirmaSol'));
        }
      }
    } catch(e) { console.error("No se pudo pegar firma solicitante", e); }

    try {
      if(gv('ccFirmaCon')) {
        const pages = pdfDoc.getPages();
        const lastPage = pages[pages.length - 1];
        const sigConData = document.getElementById('sigCon').toDataURL('image/png');
        const pngImage2 = await pdfDoc.embedPng(sigConData);
        // Dibujamos arbitrariamente a la derecha de la del deudor (no hay campo para firma cónyuge)
        lastPage.drawImage(pngImage2, {
          x: 350,
          y: 100, // Coordenadas aproximadas si no hay campo
          width: 150,
          height: 40
        });
      }
    } catch(e) { console.error("No se pudo pegar firma cónyuge", e); }

    // Aplanar el formulario para que no se pueda modificar
    form.flatten();
    
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);
    
    window.open(blobUrl, '_blank');
    
  } catch(err) {
    console.error(err);
    alert('Error al llenar la plantilla PDF: ' + err.message);
  }
}
