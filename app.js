import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Configuración de Firebase vinculada
const firebaseConfig = {
    apiKey: "AIzaSyAOgkw80F8reopQh9UPg3lewgX5zrg8_ok",
    authDomain: "lasrozas-exposiciones.firebaseapp.com",
    databaseURL: "https://lasrozas-exposiciones-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "lasrozas-exposiciones",
    storageBucket: "lasrozas-exposiciones.firebasestorage.app",
    messagingSenderId: "193566960192",
    appId: "1:193566960192:web:ca5114ab332dc0dc2d4da5",
    measurementId: "G-GTYH06XMRK"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Security note: don't keep secrets (passwords/tokens) in frontend code for production.
const ADMIN_PASS = "admin1234";
let isAdminAuthenticated = false;
const DEFAULT_IMG = "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80";

// Datos iniciales cargados rigurosamente desde las memorias oficiales (Ene 2024 - Mar 2026)
const exposicionesIniciales = [
    { id: 1, periodo: "Ene-Mar 2024", titulo: "Marisa Cebrián. Nueva York-Londres - Madrid", disciplina: "Pintura", lugar: "Auditorio", fechas: "14/12 - 15/01", artistas: "Marisa Cebrián / Ayto.[...]" },
    { id: 2, periodo: "Ene-Mar 2024", titulo: "Ganadores y seleccionados del XXIV Certamen de grabado José Caballero", disciplina: "Grabado", lugar: "Sala Maruja Mallo", fechas: "20/12 - 25/01", [...] },
    { id: 3, periodo: "Ene-Mar 2024", titulo: "Asociación Cámara en Mano. Imágenes surrealistas", disciplina: "Fotografía", lugar: "Auditorio", fechas: "14/02 - 10/02", artistas: "Asociación [...]" },
    { id: 4, periodo: "Ene-Mar 2024", titulo: "Reasentados, 14 historias del Gueto de Varsovia", disciplina: "Fotografía", lugar: "Auditorio", fechas: "25/01 - 31/01", artistas: "Comunidad Judía[...]" },
    { id: 5, periodo: "Ene-Mar 2024", titulo: "II Certamen fotográfico Asociación Cámara en Mano", disciplina: "Fotografía", lugar: "Auditorio", fechas: "01/02 - 29/02", artistas: "Asociación[...]" },
    { id: 6, periodo: "Ene-Mar 2024", titulo: "Juan Salvago. Lugares imaginarios", disciplina: "Pintura", lugar: "Sala Maruja Mallo", fechas: "08/02 - 25/03", artistas: "Juan Salvago", asistentes:[...] },
    { id: 7, periodo: "Ene-Mar 2024", titulo: "36º Concurso de Fotografía 'Jesús y Adán'", disciplina: "Fotografía", lugar: "Sala Díaz Caneja", fechas: "20/02 - 08/03", artistas: "Concejalí[...]" },
    { id: 8, periodo: "Ene-Mar 2024", titulo: "Exvotos. Alumnos de 'Modelado del natural' (UCM)", disciplina: "Escultura", lugar: "Auditorio", fechas: "14/03 - 14/04", artistas: "Alumnos UCM Bella[...]" },
    { id: 9, periodo: "Ene-Mar 2024", titulo: "José Luis Sanz. Ecos de Japón", disciplina: "Pintura, grabado y dibujo", lugar: "Sala Díaz Caneja", fechas: "21/03 - 21/04", artistas: "José Luis[...]" },
    { id: 10, periodo: "Abr-Jun 2024", titulo: "Encuentro con el objeto. Escultura contemporánea (Red Itiner)", disciplina: "Escultura", lugar: "Sala Maruja Mallo", fechas: "01/04 - 21/04", artis[...]" },
    /* ... resto del array original ... */
];

window.exposiciones = [];
let chartGenEvolucion, chartGenDisciplinas, chartAnaInteres, chartAnaSalas, chartAnaPromSala, chartAnaEvolMedia;

// Referencias a los nodos principales en la base de datos de Firebase
const exposRef = ref(db, 'exposiciones');
const infoRef = ref(db, 'informacion');

// Escucha reactiva en tiempo real para la lista de exposiciones
onValue(exposRef, (snapshot) => {
    const data = snapshot.val();
    console.log('Firebase: snapshot de exposiciones recibida:', data); // <-- log añadido para depuración
    if (data) {
        window.exposiciones = Array.isArray(data) ? data : Object.values(data);
    } else {
        window.exposiciones = exposicionesIniciales;
        set(exposRef, exposicionesIniciales);
    }
    poblarFiltroDisciplinas();
    actualizarTodo();
});

// Escucha reactiva en tiempo real para la sección de Información
onValue(infoRef, (snapshot) => {
    const infoData = snapshot.val();
    if (infoData) {
        document.getElementById('infoDisplay').innerHTML = infoData;
        if (document.getElementById('infoEditor')) {
            document.getElementById('infoEditor').value = infoData;
        }
    } else {
        const initialInfo = document.getElementById('infoDisplay').innerHTML;
        set(infoRef, initialInfo);
    }
});

window.switchTab = function(tabId, event) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    if(event) event.target.classList.add('active');
    document.getElementById(`tab-${tabId}`).classList.add('active');

    if(tabId === 'general' || tabId === 'analisis') {
        actualizarGraficos();
    } else if(tabId === 'admin' && isAdminAuthenticated) {
        renderTablaAdmin();
    }
};

function poblarFiltroDisciplinas() {
    const select = document.getElementById('disciplinaFilter');
    if(!select) return;
    select.innerHTML = '<option value="TODOS">Todas las disciplinas</option>';
    const disciplinas = [...new Set((window.exposiciones || []).map(e => e.disciplina))];
    disciplinas.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = d;
        select.appendChild(opt);
    });
}

function actualizarTodo() {
    renderKPIs();
    renderGridExposiciones();
    actualizarGraficos();
    if(isAdminAuthenticated) renderTablaAdmin();
}

function renderKPIs() {
    const totalExp = Array.isArray(window.exposiciones) ? window.exposiciones.length : 0;
    const totalAsist = (window.exposiciones || []).reduce((sum, e) => sum + (Number(e.asistentes) || 0), 0);
    const promAsist = totalExp > 0 ? Math.round(totalAsist / totalExp) : 0;

    const discMap = {};
    (window.exposiciones || []).forEach(e => {
        const asistentes = Number(e.asistentes) || 0;
        discMap[e.disciplina] = (discMap[e.disciplina] || 0) + asistentes;
    });
    let topDisc = "-";
    let maxAsist = 0;
    for(let d in discMap) {
        if(discMap[d] > maxAsist) {
            maxAsist = discMap[d];
            topDisc = d;
        }
    }

    document.getElementById('kpi-total-exp').innerText = totalExp;
    document.getElementById('kpi-total-asist').innerText = totalAsist.toLocaleString('es-ES');
    document.getElementById('kpi-prom-asist').innerText = promAsist.toLocaleString('es-ES');
    document.getElementById('kpi-top-disc').innerText = topDisc;
}

function renderGridExposiciones() {
    const grid = document.getElementById('expoGrid');
    if(!grid) return;
    grid.innerHTML = "";

    const searchEl = document.getElementById('searchInput');
    const search = searchEl ? searchEl.value.toLowerCase() : "";
    const periodo = document.getElementById('periodoFilter') ? document.getElementById('periodoFilter').value : "TODOS";
    const disciplina = document.getElementById('disciplinaFilter') ? document.getElementById('disciplinaFilter').value : "TODOS";
    const orden = document.getElementById('ordenFilter') ? document.getElementById('ordenFilter').value : "DEFAULT";

    let filtradas = (window.exposiciones || []).filter(e => {
        const titulo = (e.titulo || "").toLowerCase();
        const artistas = (e.artistas || "").toLowerCase();
        const matchSearch = titulo.includes(search) || artistas.includes(search);
        const matchPeriodo = periodo === "TODOS" || e.periodo === periodo;
        const matchDisciplina = disciplina === "TODOS" || e.disciplina === disciplina;
        return matchSearch && matchPeriodo && matchDisciplina;
    });

    if(orden === "ASIST_DESC") {
        filtradas.sort((a, b) => (Number(b.asistentes) || 0) - (Number(a.asistentes) || 0));
    } else if(orden === "ASIST_ASC") {
        filtradas.sort((a, b) => (Number(a.asistentes) || 0) - (Number(b.asistentes) || 0));
    } else if(orden === "TITULO_ASC") {
        filtradas.sort((a, b) => (a.titulo || "").localeCompare(b.titulo || ""));
    } else if(orden === "TITULO_DESC") {
        filtradas.sort((a, b) => (b.titulo || "").localeCompare(a.titulo || ""));
    }

    filtradas.forEach((e) => {
        const card = document.createElement('div');
        card.className = 'expo-card';
        card.onclick = () => abrirModal(e);
        card.innerHTML = `
            <img class="expo-card-img" src="${e.imagen || DEFAULT_IMG}" alt="${e.titulo || ''}">
            <div class="expo-card-body">
                <div>
                    <span class="expo-tag">${e.disciplina || ''}</span>
                    <div class="expo-card-title">${e.titulo || ''}</div>
                    <div class="expo-info"><strong>Período:</strong> ${e.periodo || ''}</div>
                    <div class="expo-info"><strong>Sala:</strong> ${e.lugar || ''}</div>
                    <div class="expo-info"><strong>Fechas:</strong> ${e.fechas || ''}</div>
                </div>
                <div style="margin-top: 12px; font-weight: bold; color: var(--primary-color);">
                    👥 ${(Number(e.asistentes) || 0).toLocaleString('es-ES')} Asistentes
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

window.filtrarExposiciones = function() {
    renderGridExposiciones();
};

window.abrirModal = function(e) {
    document.getElementById('modalImg').src = e.imagen || DEFAULT_IMG;
    document.getElementById('modalTag').innerText = e.disciplina || "";
    document.getElementById('modalTitulo').innerText = e.titulo || "";
    document.getElementById('modalPeriodo').innerText = e.periodo || "";
    document.getElementById('modalLugar').innerText = e.lugar || "";
    document.getElementById('modalFechas').innerText = e.fechas || "";
    document.getElementById('modalArtistas').innerText = e.artistas || "";
    document.getElementById('modalAsistentes').innerText = (Number(e.asistentes) || 0).toLocaleString('es-ES');
    document.getElementById('modalInfoAdicional').innerText = e.infoAdicional || "Sin información adicional registrada.";
    
    const linkCont = document.getElementById('modalLinkContainer');
    if(e.link) {
        linkCont.innerHTML = `<a href="${e.link}" target="_blank" style="color: var(--primary-color); font-weight: bold;">🔗 Ver documentación externa</a>`;
    } else {
        linkCont.innerHTML = `<span style="color: #888; font-size: 0.9em;">Sin enlace externo registrado.</span>`;
    }

    document.getElementById('expoModal').style.display = 'flex';
};

window.cerrarModal = function() {
    document.getElementById('expoModal').style.display = 'none';
};

window.autenticarAdmin = function(event) {
    event.preventDefault();
    const pass = document.getElementById('adminPassword').value;
    if(pass === ADMIN_PASS) {
        isAdminAuthenticated = true;
        document.getElementById('adminLoginCard').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        document.getElementById('loginError').style.display = 'none';
        renderTablaAdmin();
    } else {
        document.getElementById('loginError').style.display = 'block';
    }
};

window.cerrarSesionAdmin = function() {
    isAdminAuthenticated = false;
    document.getElementById('adminLoginCard').style.display = 'block';
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('adminPassword').value = '';
};

function renderTablaAdmin() {
    const tbody = document.getElementById('adminExpoTableBody');
    if(!tbody) return;
    tbody.innerHTML = "";
    (window.exposiciones || []).forEach(e => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${e.id}</td>
            <td>${e.periodo || ''}</td>
            <td><strong>${e.titulo || ''}</strong></td>
            <td>${e.disciplina || ''}</td>
            <td>${e.lugar || ''}</td>
            <td>${e.asistentes || 0}</td>
            <td>
                <button class="btn-secondary" style="padding: 4px 8px; font-size: 0.8em;" onclick="cargarExpoParaEditar(${e.id})">✏️ Editar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.cargarExpoParaEditar = function(id) {
    const expo = (window.exposiciones || []).find(e => e.id === id);
    if(!expo) return;

    document.getElementById('formExpoId').value = expo.id;
    document.getElementById('formPeriodo').value = expo.periodo || "";
    document.getElementById('formTitulo').value = expo.titulo || "";
    document.getElementById('formDisciplina').value = expo.disciplina || "";
    document.getElementById('formLugar').value = expo.lugar || "";
    document.getElementById('formFechas').value = expo.fechas || "";
    document.getElementById('formArtistas').value = expo.artistas || "";
    document.getElementById('formAsistentes').value = expo.asistentes || 0;
    document.getElementById('formLink').value = expo.link || "";
    document.getElementById('formImagenUrl').value = expo.imagen || "";
    document.getElementById('formInformacionAdicional').value = expo.infoAdicional || "";

    document.getElementById('formAdminTitle').innerText = `Editar Exposición #${expo.id}: ${expo.titulo}`;
    document.getElementById('btnFormSave').innerText = "Actualizar Exposición";
    document.getElementById('btnFormCancel').style.display = "inline-block";

    window.scrollTo({ top: document.getElementById('addExpoForm').offsetTop - 20, behavior: 'smooth' });
};

window.resetearFormularioAdmin = function() {
    const form = document.getElementById('addExpoForm');
    if(form) form.reset();
    document.getElementById('formExpoId').value = "-1";
    document.getElementById('formAdminTitle').innerText = "Añadir Nueva Exposición";
    document.getElementById('btnFormSave').innerText = "Guardar Exposición";
    document.getElementById('btnFormCancel').style.display = "none";
};

// Guardado de exposición en la nube (versión robusta: valida asistentes, actualiza UI inmediatamente y registra logs)
window.guardarExposicionAdmin = function(event) {
    event.preventDefault();
    if(!isAdminAuthenticated) return;

    const id = parseInt(document.getElementById('formExpoId').value, 10);
    const periodo = document.getElementById('formPeriodo').value;
    const titulo = document.getElementById('formTitulo').value;
    const disciplina = document.getElementById('formDisciplina').value;
    const lugar = document.getElementById('formLugar').value;
    const fechas = document.getElementById('formFechas').value;
    const artistas = document.getElementById('formArtistas').value || "No especificado";

    let asistentes = parseInt(document.getElementById('formAsistentes').value, 10);
    asistentes = isNaN(asistentes) ? 0 : asistentes; // proteger contra NaN

    const link = document.getElementById('formLink').value;
    const imagen = document.getElementById('formImagenUrl').value || DEFAULT_IMG;
    const infoAdicional = document.getElementById('formInformacionAdicional').value;

    let updatedExpos = Array.isArray(window.exposiciones) ? [...window.exposiciones] : [];

    if(id === -1) {
        const maxId = updatedExpos.length > 0 ? Math.max(...updatedExpos.map(e => e.id || 0)) : 0;
        updatedExpos.push({
            id: maxId + 1,
            periodo, titulo, disciplina, lugar, fechas, artistas, asistentes, link, imagen, infoAdicional
        });
    } else {
        const index = updatedExpos.findIndex(e => e.id === id);
        if(index !== -1) {
            updatedExpos[index] = { id, periodo, titulo, disciplina, lugar, fechas, artistas, asistentes, link, imagen, infoAdicional };
        } else {
            console.warn('guardarExposicionAdmin: no se encontró expo con id', id);
        }
    }

    // Actualiza UI local inmediatamente para que el usuario vea el cambio sin esperar la confirmación remota
    window.exposiciones = updatedExpos;
    actualizarTodo();

    console.log('Intentando guardar en Firebase (exposiciones):', updatedExpos);
    set(exposRef, updatedExpos)
        .then(() => {
            alert("Exposición guardada y sincronizada globalmente.");
            resetearFormularioAdmin();
        })
        .catch((error) => {
            console.error('Error al sincronizar con Firebase:', error);
            alert("Error al sincronizar con la nube: " + (error.message || error));
        });
};

// Guardado global del texto de Información en la nube
window.guardarInformacionRedactada = function() {
    if(!isAdminAuthenticated) return;
    const nuevoTexto = document.getElementById('infoEditor').value;
    set(infoRef, nuevoTexto).then(() => {
        alert("Texto de Información actualizado en todos los navegadores.");
    }).catch((error) => {
        alert("Error al guardar texto: " + error.message);
    });
};

function actualizarGraficos() {
    if (!window.exposiciones || window.exposiciones.length === 0) return;

    const periodos = [...new Set(window.exposiciones.map(e => e.periodo))];
    const asistPorPeriodo = periodos.map(p => {
        return window.exposiciones.filter(e => e.periodo === p).reduce((sum, e) => sum + (Number(e.asistentes) || 0), 0);
    });

    if(chartGenEvolucion) chartGenEvolucion.destroy();
    chartGenEvolucion = new Chart(document.getElementById('chartGeneralEvolucion'), {
        type: 'line',
        data: {
            labels: periodos,
            datasets: [{
                label: 'Asistentes Totales',
                data: asistPorPeriodo,
                borderColor: '#b01c2e',
                backgroundColor: 'rgba(176, 28, 46, 0.1)',
                fill: true,
                tension: 0.3
            }]
        }
    });

    const discMap = {};
    window.exposiciones.forEach(e => discMap[e.disciplina] = (discMap[e.disciplina] || 0) + 1);

    if(chartGenDisciplinas) chartGenDisciplinas.destroy();
    chartGenDisciplinas = new Chart(document.getElementById('chartGeneralDisciplinas'), {
        type: 'pie',
        data: {
            labels: Object.keys(discMap),
            datasets: [{
                data: Object.values(discMap),
                backgroundColor: ['#b01c2e', '#2c3e50', '#e67e22', '#27ae60', '#9b59b6', '#34495e', '#16a085', '#d35400']
            }]
        }
    });

    const discAsist = {}, discCount = {};
    window.exposiciones.forEach(e => {
        discAsist[e.disciplina] = (discAsist[e.disciplina] || 0) + (Number(e.asistentes) || 0);
        discCount[e.disciplina] = (discCount[e.disciplina] || 0) + 1;
    });
    const discProm = Object.keys(discAsist).map(d => Math.round(discAsist[d] / discCount[d]));

    if(chartAnaInteres) chartAnaInteres.destroy();
    chartAnaInteres = new Chart(document.getElementById('chartAnalisisInteres'), {
        type: 'bar',
        data: {
            labels: Object.keys(discAsist),
            datasets: [{
                label: 'Promedio de Asistentes por Exposición',
                data: discProm,
                backgroundColor: '#2c3e50'
            }]
        }
    });

    const salaMap = {}, salaCount = {};
    window.exposiciones.forEach(e => {
        salaMap[e.lugar] = (salaMap[e.lugar] || 0) + (Number(e.asistentes) || 0);
        salaCount[e.lugar] = (salaCount[e.lugar] || 0) + 1;
    });

    if(chartAnaSalas) chartAnaSalas.destroy();
    chartAnaSalas = new Chart(document.getElementById('chartAnalisisSalas'), {
        type: 'bar',
        data: {
            labels: Object.keys(salaMap),
            datasets: [{
                label: 'Total Asistentes Acumulados por Sala',
                data: Object.values(salaMap),
                backgroundColor: '#b01c2e'
            }]
        },
        options: { indexAxis: 'y' }
    });

    const salaProm = Object.keys(salaMap).map(s => Math.round(salaMap[s] / salaCount[s]));
    if(chartAnaPromSala) chartAnaPromSala.destroy();
    chartAnaPromSala = new Chart(document.getElementById('chartAnalisisPromedioSala'), {
        type: 'bar',
        data: {
            labels: Object.keys(salaMap),
            datasets: [{
                label: 'Promedio de Asistentes por Exposición según Sala',
                data: salaProm,
                backgroundColor: '#e67e22'
            }]
        }
    });

    const promPorPeriodo = periodos.map(p => {
        const expsPeriodo = window.exposiciones.filter(e => e.periodo === p);
        const total = expsPeriodo.reduce((sum, e) => sum + (Number(e.asistentes) || 0), 0);
        return expsPeriodo.length > 0 ? Math.round(total / expsPeriodo.length) : 0;
    });

    if(chartAnaEvolMedia) chartAnaEvolMedia.destroy();
    chartAnaEvolMedia = new Chart(document.getElementById('chartAnalisisEvolucionMedia'), {
        type: 'line',
        data: {
            labels: periodos,
            datasets: [{
                label: 'Asistencia Media por Muestra en el Período',
                data: promPorPeriodo,
                borderColor: '#27ae60',
                backgroundColor: 'rgba(39, 174, 96, 0.1)',
                fill: true,
                tension: 0.2
            }]
        }
    });
}
