import { BookOpen, FileText, FolderOpen, Guitar, Library, PlaySquare } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDocuments } from '../hooks/useDocuments.js';

const COURSE_ORDER = ['KIKO', 'Matheus Asato', 'Leandro Celleri', 'Nick Johnston', 'Libros y canciones', 'Libros', 'PDF sueltos', 'General'];
const LESSON_ORDER = ['Introduccion', 'Dia 1', 'Dia 2', 'Dia 3', 'Dia 4', 'Ejercicios extras', 'Tics and Tricks', 'Download', 'Carpeta principal', 'PDF principal'];

function sortByKnownOrder(order) {
  return (a, b) => {
    const indexA = order.indexOf(a);
    const indexB = order.indexOf(b);
    if (indexA !== -1 || indexB !== -1) {
      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    }
    return a.localeCompare(b, undefined, { numeric: true });
  };
}

function getCourseTypeCounts(documents) {
  return documents.reduce(
    (counts, document) => {
      if (document.tipo_documento === 'video') counts.videos += 1;
      else if (document.tipo_documento === 'guitar-pro') counts.tabs += 1;
      else counts.pdfs += 1;
      return counts;
    },
    { videos: 0, pdfs: 0, tabs: 0 },
  );
}

function getMaterialIcon(type) {
  if (type === 'video') return <PlaySquare size={18} />;
  if (type === 'guitar-pro') return <Guitar size={18} />;
  return <FileText size={18} />;
}

function getMaterialLabel(document) {
  if (document.tipo_documento === 'video') return 'Video';
  if (document.tipo_documento === 'guitar-pro') return `Tab ${document.extension?.toUpperCase() || 'GP'}`;
  return 'PDF';
}

export function CoursesPage() {
  const { allDocuments, loading, error } = useDocuments({ sort: 'nombre' });
  const courses = useMemo(() => {
    const grouped = allDocuments.reduce((map, document) => {
      const courseName = document.seccion || 'General';
      if (!map.has(courseName)) map.set(courseName, []);
      map.get(courseName).push(document);
      return map;
    }, new Map());

    return [...grouped.entries()]
      .map(([name, documents]) => ({
        name,
        documents,
        counts: getCourseTypeCounts(documents),
        updatedAt: documents
          .map((doc) => new Date(doc.fecha_modificacion_drive || 0).getTime())
          .sort((a, b) => b - a)[0],
      }))
      .sort((a, b) => sortByKnownOrder(COURSE_ORDER)(a.name, b.name));
  }, [allDocuments]);

  const [selectedCourse, setSelectedCourse] = useState('');
  const activeCourse = courses.find((course) => course.name === selectedCourse) || courses[0];
  const lessons = useMemo(() => {
    if (!activeCourse) return [];
    const grouped = activeCourse.documents.reduce((map, document) => {
      const lessonName = document.subcarpeta || 'Carpeta principal';
      if (!map.has(lessonName)) map.set(lessonName, []);
      map.get(lessonName).push(document);
      return map;
    }, new Map());

    return [...grouped.entries()]
      .map(([name, documents]) => ({
        name,
        documents: [...documents].sort((a, b) => {
          const typeOrder = { video: 0, pdf: 1, 'guitar-pro': 2 };
          return (typeOrder[a.tipo_documento] ?? 9) - (typeOrder[b.tipo_documento] ?? 9) || a.titulo.localeCompare(b.titulo);
        }),
        counts: getCourseTypeCounts(documents),
      }))
      .sort((a, b) => sortByKnownOrder(LESSON_ORDER)(a.name, b.name));
  }, [activeCourse]);

  return (
    <section className="page courses-page">
      <div className="courses-hero">
        <div>
          <span>Centro de estudio</span>
          <h2>Cursos y materiales</h2>
          <p>Videos, PDFs y tablaturas agrupados por carpeta para practicar como una clase real.</p>
        </div>
        <Link className="button secondary" to="/archivo">
          <Library size={17} />
          Archivo completo
        </Link>
      </div>

      {loading && <div className="empty-state">Cargando cursos...</div>}
      {error && <div className="empty-state">{error}</div>}
      {!loading && !error && courses.length === 0 && <div className="empty-state">No hay cursos para mostrar.</div>}

      {!loading && !error && courses.length > 0 && (
        <div className="course-workspace">
          <aside className="course-rail">
            <div className="course-rail-title">
              <span>Carpetas</span>
              <strong>{courses.length}</strong>
            </div>
            {courses.map((course) => (
              <button
                className={activeCourse?.name === course.name ? 'course-tab active' : 'course-tab'}
                key={course.name}
                onClick={() => setSelectedCourse(course.name)}
                type="button"
              >
                <FolderOpen size={18} />
                <span>
                  <strong>{course.name}</strong>
                  <small>{course.documents.length} materiales</small>
                </span>
              </button>
            ))}
          </aside>

          <div className="course-detail">
            <div className="course-header">
              <div>
                <span>Curso seleccionado</span>
                <h3>{activeCourse.name}</h3>
                <p>{lessons.length} carpetas de estudio ordenadas para navegar sin perder el contexto.</p>
              </div>
              <div className="course-stats">
                <span><PlaySquare size={16} /> {activeCourse.counts.videos} videos</span>
                <span><FileText size={16} /> {activeCourse.counts.pdfs} PDFs</span>
                <span><Guitar size={16} /> {activeCourse.counts.tabs} tabs</span>
              </div>
            </div>

            <div className="lesson-stack">
              {lessons.map((lesson) => (
                <article className="lesson-card" key={lesson.name}>
                  <div className="lesson-heading">
                    <div>
                      <span>Modulo</span>
                      <h4>{lesson.name}</h4>
                    </div>
                    <strong>{lesson.documents.length} materiales</strong>
                  </div>

                  <div className="lesson-materials">
                    {lesson.documents.map((document) => (
                      <Link className={`lesson-material ${document.tipo_documento}`} to={`/documentos/${document.id}`} key={document.id}>
                        <span>{getMaterialIcon(document.tipo_documento)}</span>
                        <div>
                          <small>{getMaterialLabel(document)}</small>
                          <strong>{document.titulo}</strong>
                        </div>
                        <BookOpen size={17} />
                      </Link>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
