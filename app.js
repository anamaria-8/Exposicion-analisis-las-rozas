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

const ADMIN_PASS = "admin1234";
let isAdminAuthenticated = false;
const DEFAULT_IMG = "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80";

// Datos iniciales cargados rigurosamente desde las memorias oficiales (Ene 2024 - Mar 2026)
const exposicionesIniciales = [
    { id: 1, periodo: "Ene-Mar 2024", titulo: "Marisa Cebrián. Nueva York-Londres - Madrid", disciplina: "Pintura", lugar: "Auditorio", fechas: "14/12 - 15/01", artistas: "Marisa Cebrián / Ayto. Las Rozas", asistentes: 150, link: "", imagen: DEFAULT_IMG, infoAdicional: "Exposición de pintura de la artista Marisa Cebrián con paisajes de Nueva York, Londres y Madrid." },
    { id: 2, periodo: "Ene-Mar 2024", titulo: "Ganadores y seleccionados del XXIV Certamen de grabado José Caballero", disciplina: "Grabado", lugar: "Sala Maruja Mallo", fechas: "20/12 - 25/01", artistas: "Varios artistas / Ayto. Las Rozas", asistentes: 300, link: "", imagen: DEFAULT_IMG, infoAdicional: "Muestra con las obras ganadoras y seleccionadas en el XXIV Certamen de Grabado José Caballero." },
    { id: 3, periodo: "Ene-Mar 2024", titulo: "Asociación Cámara en Mano. Imágenes surrealistas", disciplina: "Fotografía", lugar: "Auditorio", fechas: "14/02 - 10/02", artistas: "Asociación Cámara en Mano", asistentes: 150, link: "", imagen: DEFAULT_IMG, infoAdicional: "Imágenes surrealistas elaboradas por los miembros de la Asociación Cámara en Mano." },
    { id: 4, periodo: "Ene-Mar 2024", titulo: "Reasentados, 14 historias del Gueto de Varsovia", disciplina: "Fotografía", lugar: "Auditorio", fechas: "25/01 - 31/01", artistas: "Comunidad Judía de Madrid / CSI", asistentes: 50, link: "", imagen: DEFAULT_IMG, infoAdicional: "Organizada en colaboración con la Comunidad Judía de Madrid y el Centro Sefarad-Israel." },
    { id: 5, periodo: "Ene-Mar 2024", titulo: "II Certamen fotográfico Asociación Cámara en Mano", disciplina: "Fotografía", lugar: "Auditorio", fechas: "01/02 - 29/02", artistas: "Asociación Cámara en Mano", asistentes: 150, link: "", imagen: DEFAULT_IMG, infoAdicional: "Exposición de los trabajos participantes en el II Certamen Fotográfico de la Asociación Cámara en Mano." },
    { id: 6, periodo: "Ene-Mar 2024", titulo: "Juan Salvago. Lugares imaginarios", disciplina: "Pintura", lugar: "Sala Maruja Mallo", fechas: "08/02 - 25/03", artistas: "Juan Salvago", asistentes: 420, link: "", imagen: DEFAULT_IMG, infoAdicional: "Obras pictóricas del artista Juan Salvago centradas en espacios y paisajes imaginarios." },
    { id: 7, periodo: "Ene-Mar 2024", titulo: "36º Concurso de Fotografía 'Jesús y Adán'", disciplina: "Fotografía", lugar: "Sala Díaz Caneja", fechas: "20/02 - 08/03", artistas: "Concejalía de Juventud", asistentes: 50, link: "", imagen: DEFAULT_IMG, infoAdicional: "Muestra de las fotografías presentadas al 36º Concurso de Fotografía Jesús y Adán de la Concejalía de Juventud." },
    { id: 8, periodo: "Ene-Mar 2024", titulo: "Exvotos. Alumnos de 'Modelado del natural' (UCM)", disciplina: "Escultura", lugar: "Auditorio", fechas: "14/03 - 14/04", artistas: "Alumnos UCM Bellas Artes", asistentes: 210, link: "", imagen: DEFAULT_IMG, infoAdicional: "Esculturas elaboradas por los alumnos de Modelado del Natural del Grado en Bellas Artes de la UCM." },
    { id: 9, periodo: "Ene-Mar 2024", titulo: "José Luis Sanz. Ecos de Japón", disciplina: "Pintura, grabado y dibujo", lugar: "Sala Díaz Caneja", fechas: "21/03 - 21/04", artistas: "José Luis Sanz", asistentes: 80, link: "", imagen: DEFAULT_IMG, infoAdicional: "Colección multidisciplinar de pintura, grabado y dibujo inspirada en la cultura y tradición japonesa." },
    { id: 10, periodo: "Abr-Jun 2024", titulo: "Encuentro con el objeto. Escultura contemporánea (Red Itiner)", disciplina: "Escultura", lugar: "Sala Maruja Mallo", fechas: "01/04 - 21/04", artistas: "Red Itiner / CAM", asistentes: 300, link: "", imagen: DEFAULT_IMG, infoAdicional: "Exposición itinerante de la Red Itiner de la Comunidad de Madrid sobre escultura contemporánea." },
    { id: 11, periodo: "Abr-Jun 2024", titulo: "José Andrés Fernández Cornejo. Kybernetike", disciplina: "Pintura", lugar: "Auditorio", fechas: "18/04 - 23/05", artistas: "José Andrés Fernández Cornejo", asistentes: 120, link: "", imagen: DEFAULT_IMG, infoAdicional: "Proyecto pictórico de José Andrés Fernández Cornejo sobre el arte de gobernar la nave." },
    { id: 12, periodo: "Abr-Jun 2024", titulo: "Fernando Luján. Redes", disciplina: "Fotografía", lugar: "Sala Maruja Mallo", fechas: "25/04 - 25/05", artistas: "Fernando Luján", asistentes: 290, link: "", imagen: DEFAULT_IMG, infoAdicional: "Serie fotográfica del autor Fernando Luján centrada en entramados y estructuras visuales." },
    { id: 13, periodo: "Abr-Jun 2024", titulo: "1975. Cambio de tercio (Red Itiner)", disciplina: "Fotografía", lugar: "Sala Maruja Mallo", fechas: "30/05 - 19/06", artistas: "Red Itiner / CAM", asistentes: 450, link: "", imagen: DEFAULT_IMG, infoAdicional: "Muestra fotográfica histórica integrada en la programación de la Red Itiner." },
    { id: 14, periodo: "Abr-Jun 2024", titulo: "Fragmentos. Universidad de Mayores UCM", disciplina: "Escultura", lugar: "Sala Auditorio", fechas: "06/06 - 30/06", artistas: "Universidad de Mayores UCM", asistentes: 280, link: "", imagen: DEFAULT_IMG, infoAdicional: "Exposición colectiva de esculturas realizadas por la Universidad de Mayores de la UCM." },
    { id: 15, periodo: "Abr-Jun 2024", titulo: "Creatividad infantil y Pintura Adultos", disciplina: "Pintura", lugar: "CC Las Matas", fechas: "18/06 - 28/06", artistas: "Alumnos Talleres Las Matas", asistentes: 200, link: "", imagen: DEFAULT_IMG, infoAdicional: "Muestra fin de curso de los talleres de pintura del Centro Cultural Las Matas Marga Gil Roësset." },
    { id: 16, periodo: "Abr-Jun 2024", titulo: "Creatividad infantil / Pintura Infantil", disciplina: "Pintura", lugar: "Sala Díaz Caneja", fechas: "30/05 - 13/06", artistas: "Alumnos Talleres Municipales", asistentes: 250, link: "", imagen: DEFAULT_IMG, infoAdicional: "Muestra fin de curso de los talleres municipales infantiles." },
    { id: 17, periodo: "Jul-Sep 2024", titulo: "Muestra Talleres Municipales", disciplina: "Varios", lugar: "CCPR", fechas: "11/SEP - 24/SEP", artistas: "Alumnos Talleres Municipales", asistentes: 250, link: "", imagen: DEFAULT_IMG, infoAdicional: "Exposición colectiva con trabajos de diversas disciplinas elaborados en los talleres municipales." },
    { id: 18, periodo: "Jul-Sep 2024", titulo: "Vive tu sueño", disciplina: "Pintura", lugar: "Auditorio", fechas: "19/SEP - 30/SEP", artistas: "Fundación Colisée", asistentes: 300, link: "", imagen: DEFAULT_IMG, infoAdicional: "Organizada en colaboración con la Fundación Colisée dedicada al cuidado de personas mayores." },
    { id: 19, periodo: "Oct-Dic 2024", titulo: "Taller municipal de Tapices", disciplina: "Textil", lugar: "Sala Díaz Caneja", fechas: "03/OCT - 25/OCT", artistas: "Alumnos Taller Tapices", asistentes: 150, link: "", imagen: DEFAULT_IMG, infoAdicional: "Muestra de trabajos elaborados en el taller municipal de tapices." },
    { id: 20, periodo: "Oct-Dic 2024", titulo: "Félix Arellano. Flor caníbal", disciplina: "Pintura y escultura", lugar: "Auditorio", fechas: "04/OCT - 31/OCT", artistas: "Félix Arellano", asistentes: 290, link: "", imagen: DEFAULT_IMG, infoAdicional: "Muestra plástica combinando pintura y escultura de Félix Arellano." },
    { id: 21, periodo: "Oct-Dic 2024", titulo: "Juan Vicente Muñoz. Nomofobias", disciplina: "Escultura", lugar: "Sala Maruja Mallo", fechas: "17/OCT - 08/DIC", artistas: "Juan Vicente Muñoz", asistentes: 850, link: "", imagen: DEFAULT_IMG, infoAdicional: "Proyecto escultórico de Juan Vicente Muñoz integrado en el Plan de Salud Mental de Las Rozas." },
    { id: 22, periodo: "Oct-Dic 2024", titulo: "Fotografía de proyectos. Seis + cuatro visiones", disciplina: "Fotografía", lugar: "Sala Díaz Caneja", fechas: "07/NOV - 30/NOV", artistas: "Alumnos Taller Fotografía", asistentes: 210, link: "", imagen: DEFAULT_IMG, infoAdicional: "Exposición de proyectos finales de los alumnos del taller municipal de fotografía." },
    { id: 23, periodo: "Oct-Dic 2024", titulo: "Carlos González Alonso. Un instante en movimiento", disciplina: "Pintura", lugar: "Auditorio", fechas: "08/NOV - 08/DIC", artistas: "Carlos González Alonso", asistentes: 120, link: "", imagen: DEFAULT_IMG, infoAdicional: "Colección de pinturas sobre el movimiento y la fugacidad de Carlos González Alonso." },
    { id: 24, periodo: "Oct-Dic 2024", titulo: "Asociación Esfumato. Transparencias", disciplina: "Pintura", lugar: "Auditorio", fechas: "12/DIC - 12/ENE", artistas: "Asociación Esfumato", asistentes: 250, link: "", imagen: DEFAULT_IMG, infoAdicional: "Muestra colectiva de pintura de la Asociación Esfumato." },
    { id: 25, periodo: "Oct-Dic 2024", titulo: "Asociación Cámara en Mano. Las horas mágicas del sol", disciplina: "Fotografía", lugar: "Sala Díaz Caneja", fechas: "12/DIC - 12/ENE", artistas: "Asociación Cámara en Mano", asistentes: 250, link: "", imagen: DEFAULT_IMG, infoAdicional: "Exposición de fotografía paisajística e iluminación natural realizada por Cámara en Mano." },
    { id: 26, periodo: "Oct-Dic 2024", titulo: "Ganadores y seleccionados Certamen José Caballero", disciplina: "Grabado", lugar: "Sala Maruja Mallo", fechas: "19/DIC - 20/ENE", artistas: "Varios artistas", asistentes: 280, link: "", imagen: DEFAULT_IMG, infoAdicional: "Obras premiadas en el certamen anual de grabado." },
    { id: 27, periodo: "Ene-Mar 2025", titulo: "III Certamen Fotográfico Asociación Cámara en Mano", disciplina: "Fotografía", lugar: "Sala Auditorio", fechas: "23/ENE - 13/FEB", artistas: "Asociación Cámara en Mano", asistentes: 120, link: "", imagen: DEFAULT_IMG, infoAdicional: "Ganadores y seleccionados del III Certamen Fotográfico de la Asociación Cámara en Mano." },
    { id: 28, periodo: "Ene-Mar 2025", titulo: "Alejandro Fernández Sáez (Kalifa). Poco tengo que decir", disciplina: "Pintura y dibujo", lugar: "Sala Maruja Mallo", fechas: "30/ENE - 02/MAR", artistas: "Kalifa", asistentes: 300, link: "", imagen: DEFAULT_IMG, infoAdicional: "Exposición integrada en el Plan de Salud Mental con repercusión en prensa nacional (El País)." },
    { id: 29, periodo: "Ene-Mar 2025", titulo: "Lucía Rodríguez. Hilo de acero y bambú", disciplina: "Fotografía", lugar: "Sala Díaz Caneja", fechas: "30/ENE - 02/MAR", artistas: "Lucía Rodríguez", asistentes: 120, link: "", imagen: DEFAULT_IMG, infoAdicional: "Proyecto de fotografía artística de Lucía Rodríguez." },
    { id: 30, periodo: "Ene-Mar 2025", titulo: "Carmen la Griega. Llévame donde haya vida", disciplina: "Pintura, dibujo y vídeo", lugar: "Sala Maruja Mallo", fechas: "06/MAR - 06/ABR", artistas: "Carmen la Griega", asistentes: 850, link: "", imagen: DEFAULT_IMG, infoAdicional: "Muestra multidisciplinar con cobertura en televisión regional (Telemadrid)." },
    { id: 31, periodo: "Ene-Mar 2025", titulo: "Madrileños centenarios. La sabiduría de la longevidad", disciplina: "Fotografía", lugar: "Sala Auditorio", fechas: "19/MAR - 07/ABR", artistas: "Varios / CAM", asistentes: 1200, link: "", imagen: DEFAULT_IMG, infoAdicional: "Exposición de fotografía con notable repercusión e inaugurada por la Presidencia de la Comunidad de Madrid." },
    { id: 32, periodo: "Ene-Mar 2025", titulo: "37º Certamen de Fotografía Jesús y Adán", disciplina: "Fotografía", lugar: "Sala Díaz Caneja", fechas: "20/MAR - 03/ABR", artistas: "Concejalía de Juventud", asistentes: 150, link: "", imagen: DEFAULT_IMG, infoAdicional: "Obras premiadas en el concurso de fotografía para jóvenes Jesús y Adán." },
    { id: 33, periodo: "Ene-Mar 2025", titulo: "Exposición 'Olimpiadas Escolares'", disciplina: "Varios", lugar: "Sala Auditorio", fechas: "04/ABR", artistas: "Escuelas locales", asistentes: 230, link: "", imagen: DEFAULT_IMG, infoAdicional: "Muestra conmemorativa de las Olimpiadas Escolares de Las Rozas." },
    { id: 34, periodo: "Ene-Mar 2025", titulo: "Fashion Show", disciplina: "Moda", lugar: "Sala Auditorio", fechas: "07/MAR", artistas: "Alumnas Taller Corte y Confección", asistentes: 300, link: "", imagen: DEFAULT_IMG, infoAdicional: "Presentación de diseños del Taller Municipal de Corte y Confección coordinado por Liseo Cachán." },
    { id: 35, periodo: "Abr-Jun 2025", titulo: "Tirando del hilo. Lenguajes textiles en el arte contemporáneo", disciplina: "Textil", lugar: "Sala Maruja Mallo", fechas: "14/ABR - 04/MAY", artistas: "Red Itiner / Bellas Artes CAM", asistentes: 420, link: "", imagen: DEFAULT_IMG, infoAdicional: "Exposición realizada en colaboración con la Subdirección General de Bellas Artes de la Comunidad de Madrid." },
    { id: 36, periodo: "Abr-Jun 2025", titulo: "Asociación Cámara en Mano. Visiones textiles", disciplina: "Fotografía", lugar: "Sala Díaz Caneja", fechas: "10/ABR - 10/MAY", artistas: "Asociación Cámara en Mano", asistentes: 150, link: "", imagen: DEFAULT_IMG, infoAdicional: "Serie fotográfica sobre texturas e hilos." },
    { id: 37, periodo: "Abr-Jun 2025", titulo: "Pedro Palleiro. La ruina moderna", disciplina: "Fotografía", lugar: "Sala Auditorio", fechas: "11/ABR - 11/MAY", artistas: "Pedro Palleiro", asistentes: 320, link: "", imagen: DEFAULT_IMG, infoAdicional: "Fotografías de Pedro Palleiro sobre espacios urbanos abandonados." },
    { id: 38, periodo: "Abr-Jun 2025", titulo: "India Toctli. El otro idioma", disciplina: "Pintura", lugar: "Sala Maruja Mallo", fechas: "14/MAY - 18/JUN", artistas: "India Toctli (Comisaria: Nerea Ubieto)", asistentes: 560, link: "", imagen: DEFAULT_IMG, infoAdicional: "Centrada en la creatividad neurodivergente en el marco del Plan de Salud Mental de Las Rozas." },
    { id: 39, periodo: "Abr-Jun 2025", titulo: "Exvotos", disciplina: "Escultura", lugar: "Sala Auditorio", fechas: "19/MAY - 06/JUN", artistas: "Alumnos UCM", asistentes: 120, link: "", imagen: DEFAULT_IMG, infoAdicional: "Muestra de escultura en colaboración con la UCM." },
    { id: 40, periodo: "Abr-Jun 2025", titulo: "Mariano Cobo. Gotas", disciplina: "Pintura y escultura", lugar: "Sala Auditorio", fechas: "13/JUN - 20/JUL", artistas: "Mariano Cobo", asistentes: 210, link: "", imagen: DEFAULT_IMG, infoAdicional: "Obras plásticas y tridimensionales del artista Mariano Cobo." },
    { id: 41, periodo: "Abr-Jun 2025", titulo: "Talleres infantiles Centro Cultural Pérez de la Riva", disciplina: "Creatividad", lugar: "Sala Díaz Caneja", fechas: "28/MAY - 11/JUN", artistas: "Alumnos CCPR", asistentes: 200, link: "", imagen: DEFAULT_IMG, infoAdicional: "Exposición de fin de curso de los talleres infantiles del Pérez de la Riva." },
    { id: 42, periodo: "Abr-Jun 2025", titulo: "Talleres infantiles Entremontes", disciplina: "Creatividad y pintura", lugar: "CC Entremontes", fechas: "05/MAY - 23/MAY", artistas: "Alumnos Entremontes", asistentes: 100, link: "", imagen: DEFAULT_IMG, infoAdicional: "Muestra de los talleres de creatividad y pintura en Entremontes." },
    { id: 43, periodo: "Abr-Jun 2025", titulo: "Talleres adultos Entremontes", disciplina: "Vidrio, restauración y pintura", lugar: "CC Entremontes", fechas: "28/MAY - 16/JUN", artistas: "Alumnos Entremontes", asistentes: 120, link: "", imagen: DEFAULT_IMG, infoAdicional: "Trabajos de vidrio, restauración y pintura de alumnos adultos." },
    { id: 44, periodo: "Abr-Jun 2025", titulo: "Talleres Centro Cultural Las Matas", disciplina: "Pintura adultos, dibujo y creatividad", lugar: "CC Las Matas", fechas: "16/JUN - 22/JUN", artistas: "Alumnos Las Matas", asistentes: 150, link: "", imagen: DEFAULT_IMG, infoAdicional: "Exposición anual del Centro Cultural Las Matas Marga Gil Roësset." },
    { id: 45, periodo: "Oct-Dic 2025", titulo: "Marina Reina. Tras el umbral: Relatos de una estancia", disciplina: "Pintura y cerámica", lugar: "Sala Maruja Mallo", fechas: "09/OCT - 06/NOV", artistas: "Marina Reina", asistentes: 620, link: "", imagen: DEFAULT_IMG, infoAdicional: "Obras de pintura y cerámica de Marina Reina." },
    { id: 46, periodo: "Oct-Dic 2025", titulo: "José Luis García de Ceca. Acuarelas", disciplina: "Pintura", lugar: "Sala Díaz Caneja", fechas: "09/OCT - 21/NOV", artistas: "José Luis García de Ceca", asistentes: 450, link: "", imagen: DEFAULT_IMG, infoAdicional: "Colección de acuarelas de José Luis García de Ceca." },
    { id: 47, periodo: "Oct-Dic 2025", titulo: "Vicente Sarrión. A través de los años", disciplina: "Pintura", lugar: "Sala Auditorio", fechas: "03/OCT - 31/OCT", artistas: "Vicente Sarrión", asistentes: 320, link: "", imagen: DEFAULT_IMG, infoAdicional: "Retrospectiva pictórica de Vicente Sarrión." },
    { id: 48, periodo: "Oct-Dic 2025", titulo: "Sara García. Un vaso de agua salada", disciplina: "Varios", lugar: "Sala Maruja Mallo", fechas: "13/NOV - 11/DIC", artistas: "Sara García", asistentes: 560, link: "", imagen: DEFAULT_IMG, infoAdicional: "Instalación artística de Sara García." },
    { id: 49, periodo: "Oct-Dic 2025", titulo: "Fotografía de proyectos. Entorno íntimo", disciplina: "Fotografía", lugar: "Sala Auditorio", fechas: "07/NOV - 03/DIC", artistas: "Alumnos Taller Fotografía", asistentes: 790, link: "", imagen: DEFAULT_IMG, infoAdicional: "Muestra fotográfica colectiva del alumnado del taller municipal." },
    { id: 50, periodo: "Oct-Dic 2025", titulo: "Ganadores y seleccionados. XXVI Certamen José Caballero", disciplina: "Grabado", lugar: "Sala Maruja Mallo", fechas: "18/DIC - 20/ENE", artistas: "Varios artistas", asistentes: 410, link: "", imagen: DEFAULT_IMG, infoAdicional: "Obras del XXVI Certamen de Grabado José Caballero." },
    { id: 51, periodo: "Oct-Dic 2025", titulo: "Asociación Esfumato. 20 años, 20 miradas", disciplina: "Pintura", lugar: "Sala Díaz Caneja", fechas: "11/DIC - 15/ENE", artistas: "Asociación Esfumato", asistentes: 200, link: "", imagen: DEFAULT_IMG, infoAdicional: "Exposición conmemorativa del 20º aniversario de la Asociación Esfumato." },
    { id: 52, periodo: "Oct-Dic 2025", titulo: "Imágenes de la Navidad en el Archivo ABC", disciplina: "Fotografía", lugar: "Calle", fechas: "15/DIC - 03/ABR", artistas: "Archivo ABC", asistentes: 1100, link: "", imagen: DEFAULT_IMG, infoAdicional: "Exposición fotográfica al aire libre con imágenes históricas del Archivo ABC." },
    { id: 53, periodo: "Ene-Mar 2026", titulo: "IV Certamen fotográfico Cámara en Mano", disciplina: "Fotografía", lugar: "Sala Díaz Caneja", fechas: "15/ENE - 15/FEB", artistas: "Asociación Cámara en Mano", asistentes: 350, link: "", imagen: DEFAULT_IMG, infoAdicional: "Edición IV del certamen fotográfico organizado por Cámara en Mano." },
    { id: 54, periodo: "Ene-Mar 2026", titulo: "Mateo García Menéndez. Las formas del hábito", disciplina: "Pintura", lugar: "Sala Auditorio", fechas: "24/ENE - 26/FEB", artistas: "Mateo García Menéndez", asistentes: 1100, link: "", imagen: DEFAULT_IMG, infoAdicional: "Exposición pictórica de Mateo García Menéndez en el Auditorio." },
    { id: 55, periodo: "Ene-Mar 2026", titulo: "Eduardo Arroyo: la creación de un artista", disciplina: "Dibujo", lugar: "Sala Maruja Mallo", fechas: "29/ENE - 19/FEB", artistas: "Eduardo Arroyo / Red Itiner", asistentes: 850, link: "", imagen: DEFAULT_IMG, infoAdicional: "Exposición inédita sobre la obra dibujística de Eduardo Arroyo durante su etapa parisina en los años 60." },
    { id: 56, periodo: "Ene-Mar 2026", titulo: "Ecologías del colapso", disciplina: "Varios", lugar: "Sala Maruja Mallo", fechas: "29/FEB - 20/MAY", artistas: "Varios artistas", asistentes: 650, link: "", imagen: DEFAULT_IMG, infoAdicional: "Muestra multidisciplinar e instalación colectiva." },
    { id: 57, periodo: "Ene-Mar 2026", titulo: "Arquitectura moderna de Madrid. Fotografías de Ana Amado", disciplina: "Fotografía", lugar: "Sala Díaz Caneja", fechas: "29/FEB - 20/MAY", artistas: "Ana Amado", asistentes: 290, link: "", imagen: DEFAULT_IMG, infoAdicional: "Fotografías de arquitectura moderna en la Comunidad de Madrid por Ana Amado." },
    { id: 58, periodo: "Ene-Mar 2026", titulo: "Ex Votos. Alumnos de escultura y modelado UCM", disciplina: "Escultura", lugar: "Sala Auditorio", fechas: "04/MAR - 14/MAR", artistas: "Alumnos UCM", asistentes: 200, link: "", imagen: DEFAULT_IMG, infoAdicional: "Exposición de escultura realizada en colaboración con la Universidad Complutense." },
    { id: 59, periodo: "Ene-Mar 2026", titulo: "Música popular: una visión fotográfica", disciplina: "Fotografía", lugar: "Sala Auditorio", fechas: "20/MAR - 12/ABR", artistas: "Varios artistas", asistentes: 253, link: "", imagen: DEFAULT_IMG, infoAdicional: "Fotografías documentales sobre la historia y manifestaciones de la música popular." }
];

window.exposiciones = [];
let chartGenEvolucion, chartGenDisciplinas, chartAnaInteres, chartAnaSalas, chartAnaPromSala, chartAnaEvolMedia;

// Referencias a los nodos principales en la base de datos de Firebase
const exposRef = ref(db, 'exposiciones');
const infoRef = ref(db, 'informacion');

// Escucha reactiva en tiempo real para la lista de exposiciones
onValue(exposRef, (snapshot) => {
    const data = snapshot.val();
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
    const disciplinas = [...new Set(window.exposiciones.map(e => e.disciplina))];
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
    const totalExp = window.exposiciones.length;
    const totalAsist = window.exposiciones.reduce((sum, e) => sum + Number(e.asistentes), 0);
    const promAsist = totalExp > 0 ? Math.round(totalAsist / totalExp) : 0;

    const discMap = {};
    window.exposiciones.forEach(e => {
        discMap[e.disciplina] = (discMap[e.disciplina] || 0) + Number(e.asistentes);
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
    grid.innerHTML = "";

    const search = document.getElementById('searchInput').value.toLowerCase();
    const periodo = document.getElementById('periodoFilter').value;
    const disciplina = document.getElementById('disciplinaFilter').value;
    const orden = document.getElementById('ordenFilter').value;

    let filtradas = window.exposiciones.filter(e => {
        const matchSearch = e.titulo.toLowerCase().includes(search) || e.artistas.toLowerCase().includes(search);
        const matchPeriodo = periodo === "TODOS" || e.periodo === periodo;
        const matchDisciplina = disciplina === "TODOS" || e.disciplina === disciplina;
        return matchSearch && matchPeriodo && matchDisciplina;
    });

    if(orden === "ASIST_DESC") {
        filtradas.sort((a, b) => b.asistentes - a.asistentes);
    } else if(orden === "ASIST_ASC") {
        filtradas.sort((a, b) => a.asistentes - b.asistentes);
    } else if(orden === "TITULO_ASC") {
        filtradas.sort((a, b) => a.titulo.localeCompare(b.titulo));
    } else if(orden === "TITULO_DESC") {
        filtradas.sort((a, b) => b.titulo.localeCompare(a.titulo));
    }

    filtradas.forEach((e) => {
        const card = document.createElement('div');
        card.className = 'expo-card';
        card.onclick = () => abrirModal(e);
        card.innerHTML = `
            <img class="expo-card-img" src="${e.imagen || DEFAULT_IMG}" alt="${e.titulo}">
            <div class="expo-card-body">
                <div>
                    <span class="expo-tag">${e.disciplina}</span>
                    <div class="expo-card-title">${e.titulo}</div>
                    <div class="expo-info"><strong>Período:</strong> ${e.periodo}</div>
                    <div class="expo-info"><strong>Sala:</strong> ${e.lugar}</div>
                    <div class="expo-info"><strong>Fechas:</strong> ${e.fechas}</div>
                </div>
                <div style="margin-top: 12px; font-weight: bold; color: var(--primary-color);">
                    👥 ${Number(e.asistentes).toLocaleString('es-ES')} Asistentes
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
    document.getElementById('modalTag').innerText = e.disciplina;
    document.getElementById('modalTitulo').innerText = e.titulo;
    document.getElementById('modalPeriodo').innerText = e.periodo;
    document.getElementById('modalLugar').innerText = e.lugar;
    document.getElementById('modalFechas').innerText = e.fechas;
    document.getElementById('modalArtistas').innerText = e.artistas;
    document.getElementById('modalAsistentes').innerText = Number(e.asistentes).toLocaleString('es-ES');
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
    tbody.innerHTML = "";
    window.exposiciones.forEach(e => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${e.id}</td>
            <td>${e.periodo}</td>
            <td><strong>${e.titulo}</strong></td>
            <td>${e.disciplina}</td>
            <td>${e.lugar}</td>
            <td>${e.asistentes}</td>
            <td>
                <button class="btn-secondary" style="padding: 4px 8px; font-size: 0.8em;" onclick="cargarExpoParaEditar(${e.id})">✏️ Editar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.cargarExpoParaEditar = function(id) {
    const expo = window.exposiciones.find(e => e.id === id);
    if(!expo) return;

    document.getElementById('formExpoId').value = expo.id;
    document.getElementById('formPeriodo').value = expo.periodo;
    document.getElementById('formTitulo').value = expo.titulo;
    document.getElementById('formDisciplina').value = expo.disciplina;
    document.getElementById('formLugar').value = expo.lugar;
    document.getElementById('formFechas').value = expo.fechas;
    document.getElementById('formArtistas').value = expo.artistas;
    document.getElementById('formAsistentes').value = expo.asistentes;
    document.getElementById('formLink').value = expo.link || "";
    document.getElementById('formImagenUrl').value = expo.imagen || "";
    document.getElementById('formInformacionAdicional').value = expo.infoAdicional || "";

    document.getElementById('formAdminTitle').innerText = `Editar Exposición #${expo.id}: ${expo.titulo}`;
    document.getElementById('btnFormSave').innerText = "Actualizar Exposición";
    document.getElementById('btnFormCancel').style.display = "inline-block";

    window.scrollTo({ top: document.getElementById('addExpoForm').offsetTop - 20, behavior: 'smooth' });
};

window.resetearFormularioAdmin = function() {
    document.getElementById('addExpoForm').reset();
    document.getElementById('formExpoId').value = "-1";
    document.getElementById('formAdminTitle').innerText = "Añadir Nueva Exposición";
    document.getElementById('btnFormSave').innerText = "Guardar Exposición";
    document.getElementById('btnFormCancel').style.display = "none";
};

// Guardado de exposición en la nube
window.guardarExposicionAdmin = function(event) {
    event.preventDefault();
    if(!isAdminAuthenticated) return;

    const id = parseInt(document.getElementById('formExpoId').value);
    const periodo = document.getElementById('formPeriodo').value;
    const titulo = document.getElementById('formTitulo').value;
    const disciplina = document.getElementById('formDisciplina').value;
    const lugar = document.getElementById('formLugar').value;
    const fechas = document.getElementById('formFechas').value;
    const artistas = document.getElementById('formArtistas').value || "No especificado";
    const asistentes = parseInt(document.getElementById('formAsistentes').value);
    const link = document.getElementById('formLink').value;
    const imagen = document.getElementById('formImagenUrl').value || DEFAULT_IMG;
    const infoAdicional = document.getElementById('formInformacionAdicional').value;

    let updatedExpos = [...window.exposiciones];

    if(id === -1) {
        const maxId = updatedExpos.length > 0 ? Math.max(...updatedExpos.map(e => e.id)) : 0;
        updatedExpos.push({
            id: maxId + 1,
            periodo, titulo, disciplina, lugar, fechas, artistas, asistentes, link, imagen, infoAdicional
        });
    } else {
        const index = updatedExpos.findIndex(e => e.id === id);
        if(index !== -1) {
            updatedExpos[index] = { id, periodo, titulo, disciplina, lugar, fechas, artistas, asistentes, link, imagen, infoAdicional };
        }
    }

    // Guardado global persistente en Firebase
    set(exposRef, updatedExpos).then(() => {
        alert("Exposición guardada y sincronizada globalmente.");
        resetearFormularioAdmin();
    }).catch((error) => {
        alert("Error al sincronizar con la nube: " + error.message);
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
        return window.exposiciones.filter(e => e.periodo === p).reduce((sum, e) => sum + Number(e.asistentes), 0);
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
        discAsist[e.disciplina] = (discAsist[e.disciplina] || 0) + Number(e.asistentes);
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
        salaMap[e.lugar] = (salaMap[e.lugar] || 0) + Number(e.asistentes);
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
        const total = expsPeriodo.reduce((sum, e) => sum + Number(e.asistentes), 0);
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
