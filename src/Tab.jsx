import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import MoroccoHolidaysPage from './MoroccoHolidaysPage';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const CALENDAR_DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const HOURS = ['08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00'];
const CELL_COLORS = ['#fff3bf', '#d8f3dc', '#dbeafe', '#ffe4e6', '#ede9fe', '#cffafe', '#fef3c7', '#dcfce7', '#e0e7ff', '#fce7f3', '#ccfbf1', '#f5f5f4', '#fbcfe8', '#bfdbfe', '#bbf7d0', '#fed7aa', '#ddd6fe', '#bae6fd', '#fecdd3', '#ccfbf1'];
const HOMEWORK_COLORS = ['#66c43f', '#b34bd7', '#2f80ed', '#ff3f5f', '#f2994a'];
const GROUP_COLORS = ['#e0f2fe', '#dcfce7', '#fef3c7'];
const GROUP_TITLES = ['Tronc Commun', '1ères Bac', '2ème Bac'];
const DOT_TEXT = Array.from({ length: 3 }, () => '.'.repeat(74)).join('\n');
const MANDATORY_EVENTS = [
  { start: '05/09', end: '06/09', label: 'Religieuse', text: 'Vacance religieuse : Aïd Al Mawlid Annabaoui', type: 'holiday' },
  { start: '19/10', end: '26/10', label: 'Scolaire', text: 'Vacance scolaire : Vacances intermédiaires 1', type: 'holiday' },
  { start: '31/10', end: '31/10', label: 'Nationale', text: 'Fête nationale : Fête de l’Unité', type: 'holiday' },
  { start: '06/11', end: '06/11', label: 'Nationale', text: 'Fête nationale : Marche Verte', type: 'holiday' },
  { start: '18/11', end: '18/11', label: 'Nationale', text: 'Fête nationale : Fête de l’Indépendance', type: 'holiday' },
  { start: '07/12', end: '14/12', label: 'Scolaire', text: 'Vacance scolaire : Vacances intermédiaires 2', type: 'holiday' },
  { start: '01/01', end: '01/01', label: 'Nationale', text: 'Fête nationale : Nouvel An', type: 'holiday' },
  { start: '11/01', end: '11/01', label: 'Nationale', text: 'Fête nationale : Manifeste de l’Indépendance', type: 'holiday' },
  { start: '14/01', end: '14/01', label: 'Nationale', text: 'Fête nationale : Nouvel An Amazigh', type: 'holiday' },
  { start: '20/01', end: '24/01', label: 'Primaire', text: 'Examen : Examen normalisé local', type: 'exam' },
  { start: '25/01', end: '01/02', label: 'Scolaire', text: 'Vacance scolaire : Vacances de mi-année', type: 'holiday' },
  { start: '15/03', end: '22/03', label: 'Scolaire', text: 'Vacance scolaire : Vacances intermédiaires 3', type: 'holiday' },
  { start: '20/03', end: '22/03', label: 'Religieuse', text: 'Vacance religieuse : Aïd Al-Fitr', type: 'holiday' },
  { start: '01/05', end: '01/05', label: 'Nationale', text: 'Fête nationale : Fête du Travail', type: 'holiday' },
  { start: '03/05', end: '10/05', label: 'Scolaire', text: 'Vacance scolaire : Vacances intermédiaires 4', type: 'holiday' },
  { start: '27/05', end: '30/05', label: 'Religieuse', text: 'Vacance religieuse : Aïd Al-Adha', type: 'holiday' },
  { start: '29/05', end: '30/05', label: 'Lycée', text: 'Examen : Examen régional 1ère Bac', type: 'exam' },
  { start: '01/06', end: '04/06', label: 'Lycée', text: 'Examen : Examen national 2ème Bac', type: 'exam' },
  { start: '16/06', end: '16/06', label: 'Religieuse', text: 'Vacance religieuse : 1er Moharram', type: 'holiday' },
  { start: '16/06', end: '17/06', label: 'Collège', text: 'Examen : Examen régional', type: 'exam' },
  { start: '23/06', end: '24/06', label: 'Primaire', text: 'Examen : Examen normalisé provincial', type: 'exam' },
  { start: '03/07', end: '04/07', label: 'Lycée', text: 'Rattrapage : 1ère Bac', type: 'exam' },
  { start: '06/07', end: '09/07', label: 'Lycée', text: 'Rattrapage : 2ème Bac', type: 'exam' },
  { start: '10/07', end: '10/07', label: 'Lycée', text: 'Signature du Procès-verbal de sortie', type: 'exam' }
];
const EXAM_EVENTS = MANDATORY_EVENTS.filter((event) => event.type === 'exam');
const SCHOOL_PROGRESS_FLAGS = [
  { date: '19/10', label: 'العطلة البينية الأولى' },
  { date: '07/12', label: 'العطلة البينية الثانية' },
  { date: '25/01', label: 'عطلة منتصف السنة الدراسية' },
  { date: '03/05', label: 'العطلة البينية الرابعة' }
];

const createCell = () => ({ text: '', room: 1, span: 1, hidden: false });
const clampRoom = (value) => Math.min(Math.max(Number(value) || 1, 1), 80);
const normalizeCell = (cell) => typeof cell === 'object' && cell !== null ? {
  text: String(cell.text ?? ''),
  room: clampRoom(cell.room ?? 1),
  span: Math.max(Number(cell.span) || 1, 1),
  hidden: Boolean(cell.hidden)
} : { text: String(cell ?? ''), room: 1, span: 1, hidden: false };
const cloneCell = (cell) => ({ ...normalizeCell(cell), hidden: false });

const dotTextStyle = { color: 'rgba(63, 64, 80, 0.28)', fontSize: '22px', fontWeight: 900, lineHeight: 1.35, letterSpacing: '1px', whiteSpace: 'pre-wrap', overflow: 'hidden' };
const holidayTextStyle = { color: '#9a3412', fontSize: '21px', fontWeight: 900, lineHeight: 1.25, letterSpacing: '0.2px', textAlign: 'center', justifyContent: 'center', background: 'linear-gradient(90deg, rgba(254,215,170,0.38), rgba(254,243,199,0.62))', borderRadius: '12px', margin: '8px 18px', padding: '10px 16px', overflow: 'hidden' };
const examTextStyle = { color: '#1e3a8a', fontSize: '20px', fontWeight: 900, lineHeight: 1.25, letterSpacing: '0.2px', textAlign: 'center', justifyContent: 'center', background: 'linear-gradient(90deg, rgba(191,219,254,0.45), rgba(219,234,254,0.82))', border: '1px solid rgba(37,99,235,0.28)', borderRadius: '12px', margin: '8px 18px', padding: '10px 16px', overflow: 'hidden' };
const subjectTextStyle = { display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'center', gap: '6px', padding: '8px 10px', textAlign: 'center', overflow: 'hidden' };
const sessionLineStyle = { display: 'grid', gridTemplateColumns: '52px minmax(0, 1fr) 34px', alignItems: 'center', gap: '6px', minHeight: '24px', padding: '4px 7px', border: '1px solid rgba(63, 64, 80, 0.18)', borderRadius: '8px', background: 'rgba(63, 64, 80, 0.045)', color: '#343545', fontFamily: 'Arial, sans-serif', lineHeight: 1, overflow: 'hidden', userSelect: 'none' };
const sessionHourStyle = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '72px', height: '22px', borderRadius: '999px', background: 'var(--homework-color)', color: 'white', fontSize: '12px', fontWeight: 900, whiteSpace: 'nowrap' };
const sessionClassStyle = { display: 'block', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px', fontWeight: 900, textTransform: 'uppercase' };
const sessionDurationStyle = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '30px', fontSize: '12px', fontWeight: 900, whiteSpace: 'nowrap' };
const levelGroupsStyle = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '10px' };
const levelGroupTitleStyle = { marginBottom: '8px', color: '#111827', fontSize: '14px', fontWeight: 900, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.3px' };
const levelGroupClassesStyle = { display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-start', gap: '7px', minHeight: '130px', color: 'rgba(17, 17, 17, 0.45)', fontSize: '10px', fontWeight: 800, lineHeight: 1.1, textAlign: 'center' };
const levelChipStyle = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '100%', minHeight: '32px', padding: '7px 9px', borderRadius: '9px', border: '1px solid rgba(17, 17, 17, 0.22)', color: '#111827', fontSize: '18px', fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'grab', boxShadow: '0 1px 3px rgba(17, 17, 17, 0.12)' };
const examListWrapStyle = { marginTop: '85px', border: 0, borderRadius: 0, overflow: 'visible', background: 'transparent' };
const examListTableStyle = { width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px', fontFamily: 'Arial, sans-serif', background: 'transparent' };
const examListHeaderCellStyle = { padding: '12px 14px', border: 0, background: '#111827', color: 'white', fontSize: '13px', fontWeight: 900, textAlign: 'left', textTransform: 'uppercase' };
const examListCellStyle = { padding: '14px', borderTop: '1px solid rgba(17,17,17,0.08)', borderBottom: '1px solid rgba(17,17,17,0.08)', background: 'white', color: '#111827', fontSize: '14px', fontWeight: 800, textAlign: 'left', lineHeight: 1.2 };
const groupHomeworkHeaderStyle = { position: 'absolute', top: '30px', left: '50px', right: '18px', height: '42px', display: 'grid', gridTemplateColumns: '230px 1fr', alignItems: 'center', gap: '18px', borderRadius: '12px', background: 'var(--group-color)', color: '#111827', padding: '0 18px', boxShadow: '0 2px 6px rgba(17, 17, 17, 0.12)' };
const groupHomeworkTitleStyle = { fontSize: '20px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.4px', textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };
const groupCoverPageStyle = { position: 'relative', display: 'block', padding: 0, background: 'linear-gradient(180deg, var(--group-color), #ffffff 78%)', borderLeft: '14px solid var(--group-color)', overflow: 'hidden', textAlign: 'center' };
const groupCoverBrandStyle = { position: 'absolute', top: '92px', left: '50%', zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'translateX(-50%)', fontFamily: 'Arial, sans-serif', whiteSpace: 'nowrap' };
const groupCoverBrandMainStyle = { position: 'relative', color: '#1565c0', fontSize: '42px', fontWeight: 1000, lineHeight: 0.95, letterSpacing: '-1.2px' };
const groupCoverBrandDotStyle = { position: 'absolute', top: '-7px', right: '-14px', width: '11px', height: '11px', borderRadius: '999px', background: '#f47b55' };
const groupCoverBrandSubStyle = { marginTop: '5px', color: '#f47b55', fontSize: '16px', fontWeight: 1000, lineHeight: 1, letterSpacing: '1.8px' };
const groupCoverIconsStyle = { position: 'absolute', top: '180px', left: '50%', zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', transform: 'translateX(-50%)' };
const groupCoverTitleStyle = { position: 'absolute', top: '50%', left: '50%', zIndex: 2, width: 'calc(100% - 116px)', maxWidth: '680px', margin: 0, padding: '34px 20px', borderRadius: '28px', transform: 'translate(-50%, -50%)', background: 'var(--group-color)', color: '#111827', fontSize: '60px', fontWeight: 900, lineHeight: 1.05, textTransform: 'uppercase', boxShadow: '0 18px 35px rgba(17, 24, 39, 0.16)' };
const groupCoverClassWrapStyle = { position: 'absolute', left: '50%', bottom: '130px', zIndex: 2, width: 'calc(100% - 116px)', maxWidth: '650px', padding: '24px', boxSizing: 'border-box', transform: 'translateX(-50%)', borderRadius: '24px', background: 'rgba(255, 255, 255, 0.80)', border: '2px solid rgba(17, 24, 39, 0.12)', boxShadow: '0 10px 24px rgba(17, 24, 39, 0.10)' };
const groupCoverClassTitleStyle = { marginBottom: '14px', color: '#475569', fontSize: '18px', fontWeight: 800, letterSpacing: '0.2px' };
const groupCoverGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' };
const groupCoverChipStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50px', padding: '10px 14px', borderRadius: '14px', border: '1.5px solid rgba(17, 24, 39, 0.20)', color: '#111827', fontSize: '24px', fontWeight: 900, textTransform: 'uppercase', boxShadow: '0 2px 6px rgba(17, 24, 39, 0.10)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
const groupCoverEmptyStyle = { color: 'rgba(55, 65, 81, 0.65)', fontSize: '18px', fontWeight: 800 };
const progressWrapStyle = { display: 'grid', gridTemplateColumns: '1fr 46px', alignItems: 'center', gap: '10px' };
const progressBarStyle = { position: 'relative', height: '12px', borderRadius: '999px', background: 'rgba(255, 255, 255, 0.85)', border: '1px solid rgba(17, 24, 39, 0.12)', boxShadow: 'inset 0 1px 3px rgba(17, 24, 39, 0.10)' };
const progressFillStyle = { position: 'absolute', top: 0, left: 0, bottom: 0, borderRadius: '999px', background: 'linear-gradient(90deg, #22c55e, #16a34a)' };
const progressFlagStyle = { position: 'absolute', top: '-15px', transform: 'translateX(-50%)', fontSize: '13px', lineHeight: 1, filter: 'drop-shadow(0 1px 1px rgba(17, 24, 39, 0.25))' };
const progressPercentStyle = { fontSize: '12px', fontWeight: 900, textAlign: 'right', color: '#111827' };

const EducationIcon = ({ kind, color }) => <span aria-hidden="true" style={{ width: '48px', height: '48px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '15px', background: 'rgba(255,255,255,0.82)', border: `2px solid ${color}`, color: '#1e3a8a', boxShadow: '0 6px 14px rgba(17,24,39,0.11)' }}>
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {kind === 'book' && <>
      <path d="M3.5 5.5c3 0 5.2.8 8.5 3v11c-3.3-2.2-5.5-3-8.5-3z" />
      <path d="M20.5 5.5c-3 0-5.2.8-8.5 3v11c3.3-2.2 5.5-3 8.5-3z" />
    </>}
    {kind === 'pencil' && <>
      <path d="m4 20 4.1-1.1L19 8l-3-3L5.1 15.9z" />
      <path d="m13.8 7.2 3 3" />
      <path d="m4.8 16.2 3 3" />
    </>}
    {kind === 'cap' && <>
      <path d="m3 9 9-5 9 5-9 5z" />
      <path d="M7 12.3v4.2c3 2.2 7 2.2 10 0v-4.2" />
      <path d="M21 9v6" />
    </>}
  </svg>
</span>;

const fitTimetableClassText = (textarea) => {
  if (!textarea) return;

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const computedStyle = window.getComputedStyle(textarea);
  const availableWidth = Math.max(textarea.clientWidth - 8, 1);
  let fontSize = 15;
  const measureText = () => {
    context.font = `${computedStyle.fontWeight} ${fontSize}px ${computedStyle.fontFamily}`;
    return context.measureText(String(textarea.value || '').replace(/\s+/g, ' ')).width;
  };

  while (fontSize > 5 && measureText() > availableWidth) {
    fontSize -= 0.5;
  }

  textarea.style.setProperty('--timetable-class-font-size', `${fontSize}px`);
  textarea.scrollLeft = 0;
};

const fitLastAssignmentLabel = (element) => {
  if (!element) return;

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const style = window.getComputedStyle(element);
  const dateFontSize = Number.parseFloat(style.fontSize) || 24;
  const dateText = String(element.textContent || '').trim();
  context.font = `${style.fontWeight} ${dateFontSize}px ${style.fontFamily}`;
  const remainingWidth = Math.max(element.clientWidth - context.measureText(dateText).width - 22, 1);
  const assignmentLabel = element.dataset.assignmentWeekLabel || '';
  let labelFontSize = dateFontSize;

  while (labelFontSize > 5) {
    context.font = `${style.fontWeight} ${labelFontSize}px ${style.fontFamily}`;
    if (context.measureText(assignmentLabel).width <= remainingWidth) break;
    labelFontSize -= 0.5;
  }

  element.style.setProperty('--last-assignment-label-size', `${labelFontSize}px`);
};

const TimetableClassInput = ({ span, value, ...props }) => {
  const textareaRef = useRef(null);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return undefined;

    fitTimetableClassText(textarea);
    const observer = new ResizeObserver(() => fitTimetableClassText(textarea));
    observer.observe(textarea);

    return () => observer.disconnect();
  }, [span, value]);

  return <textarea ref={textareaRef} value={value} rows="1" wrap="off" {...props} />;
};

const getCellColor = (text) => {
  const normalized = String(text ?? '').toLowerCase().replace(/[\s-]/g, '').trim();
  if (!normalized) return 'white';
  let hash = 2166136261;
  for (let index = 0; index < normalized.length; index += 1) {
    hash ^= normalized.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return CELL_COLORS[Math.abs(hash) % CELL_COLORS.length];
};

const SCHOOL_START_YEAR = 2026;
const getSchoolStartYear = () => SCHOOL_START_YEAR;
const getSchoolYear = () => {
  const startYear = getSchoolStartYear();
  return `Année scolaire : ${startYear} / ${startYear + 1}`;
};
const getSchoolProgressBounds = () => {
  return {
    start: new Date(Date.UTC(2026, 8, 1)),
    end: new Date(Date.UTC(2027, 8, 10))
  };
};
const getSchoolProgressPercentForDate = (date) => {
  const { start, end } = getSchoolProgressBounds();
  const percent = ((date - start) / (end - start)) * 100;
  return Math.min(100, Math.max(0, percent));
};
const getMonthDateAsSchoolDate = (monthDate) => {
  const [day, month] = String(monthDate).split('/').map(Number);
  const year = month >= 9 ? SCHOOL_START_YEAR : SCHOOL_START_YEAR + 1;
  return new Date(Date.UTC(year, month - 1, day));
};
const getFlagPercent = (dateText) => {
  const flagDate = getMonthDateAsSchoolDate(dateText);
  const { start, end } = getSchoolProgressBounds();
  return Math.min(100, Math.max(0, ((flagDate - start) / (end - start)) * 100));
};
const getPageProgressExactPercent = (entries) => getSchoolProgressPercentForDate(getMonthDateAsSchoolDate(entries?.[0]?.progressDate || '01/09'));
const getPageProgressPercent = (entries) => Math.floor(getPageProgressExactPercent(entries));
const createRows = () => DAYS.map((day) => ({ day, cells: HOURS.reduce((acc, hour) => ({ ...acc, [hour]: createCell() }), {}) }));
const getHourStart = (hour) => String(hour ?? '').split('-')[0].trim();
const getMondayBasedDayIndex = (date) => (date.getDay() + 6) % 7;
const getDisplayDay = (date, rows) => getMondayBasedDayIndex(date) < rows.length ? String(rows[getMondayBasedDayIndex(date)]?.day || DAYS[getMondayBasedDayIndex(date)]).toUpperCase() : CALENDAR_DAYS[date.getDay()].toUpperCase();
const formatMonthDate = (date) => `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
const getSchoolHomeworkDates = () => {
  const startYear = getSchoolStartYear();
  const dates = [];
  const current = new Date(startYear, 8, 1);
  const end = new Date(startYear + 1, 6, 31);
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
};
const chunkEntries = (entries, size) => {
  const pages = [];
  let page = [];
  let occupiedSlots = 0;

  entries.forEach((entry) => {
    const entrySlots = entry.isMidYearHoliday ? 2 : 1;
    if (page.length && occupiedSlots + entrySlots > size) {
      pages.push(page);
      page = [];
      occupiedSlots = 0;
    }
    page.push(entry);
    occupiedSlots += entrySlots;
  });

  if (page.length) pages.push(page);
  return pages;
};
const getClassLevel = (className) => {
  const normalized = String(className ?? '').toUpperCase().replace(/[\s-]/g, '');
  if (normalized.startsWith('1BAC') || normalized.startsWith('1ERE') || normalized.startsWith('1ÈRE')) return '1ères Bac';
  if (normalized.startsWith('2BAC') || normalized.startsWith('2EME') || normalized.startsWith('2ÈME')) return '2ème Bac';
  return 'Tronc Commun';
};
const getGroupIndex = (className) => {
  const level = getClassLevel(className);
  return level === '1ères Bac' ? 1 : level === '2ème Bac' ? 2 : 0;
};
const getMandatoryEventStart = (monthDate) => MANDATORY_EVENTS.filter((event) => event.start === monthDate);
const isInsideMandatoryEventAfterStart = (monthDate) => MANDATORY_EVENTS.some((event) => {
  const date = getMonthDateAsSchoolDate(monthDate);
  return date > getMonthDateAsSchoolDate(event.start) && date <= getMonthDateAsSchoolDate(event.end);
});
export default function Tab({ onClassGroupsChange }) {
  const [school, setSchool] = useState('Établissement :');
  const [teacher, setTeacher] = useState('Professeur :');
  const [hours, setHours] = useState(HOURS);
  const [rows, setRows] = useState(createRows);
  const [copiedCell, setCopiedCell] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [draggedCell, setDraggedCell] = useState(null);
  const [dragOverCell, setDragOverCell] = useState(null);
  const [manualGroups, setManualGroups] = useState(null);
  const [draggedClass, setDraggedClass] = useState(null);
  const [generatedData, setGeneratedData] = useState(null);
  const [classColors, setClassColors] = useState({});
  const schoolYear = getSchoolYear();

  const validateOnEnter = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.currentTarget.blur();
    }
  };

  const updateHour = (index, value) => {
    const oldHour = hours[index];
    setHours((current) => current.map((hour, i) => i === index ? value : hour));
    setRows((current) => current.map((row) => {
      const nextCells = { ...row.cells, [value]: normalizeCell(row.cells[oldHour]) };
      delete nextCells[oldHour];
      return { ...row, cells: nextCells };
    }));
  };
  const updateDay = (index, value) => setRows((current) => current.map((row, i) => i === index ? { ...row, day: value } : row));
  const updateCellText = (dayIndex, hour, value) => {
    setRows((current) => current.map((row, i) => i === dayIndex ? { ...row, cells: { ...row.cells, [hour]: { ...normalizeCell(row.cells[hour]), text: value } } } : row));
  };
  const updateRoom = (dayIndex, hour, value) => setRows((current) => current.map((row, i) => i === dayIndex ? { ...row, cells: { ...row.cells, [hour]: { ...normalizeCell(row.cells[hour]), room: clampRoom(value) } } } : row));

  const tableClasses = rows.reduce((classes, row) => {
    hours.forEach((hour) => {
      const cell = normalizeCell(row.cells[hour]);
      const className = cell.text.trim();
      if (!cell.hidden && className && !classes.includes(className)) classes.push(className);
    });
    return classes;
  }, []);
  const autoGroups = GROUP_TITLES.map((title) => ({ title, classes: [] }));
  tableClasses.forEach((className) => {
    const targetIndex = getGroupIndex(className);
    autoGroups[targetIndex].classes.push(className);
  });
  const reconciledManualGroups = manualGroups ? GROUP_TITLES.map((title, index) => ({ title, classes: (manualGroups[index]?.classes ?? []).filter((className) => tableClasses.includes(className)) })) : null;
  if (reconciledManualGroups) {
    tableClasses.forEach((className) => {
      const alreadyGrouped = reconciledManualGroups.some((group) => group.classes.includes(className));
      if (!alreadyGrouped) reconciledManualGroups[getGroupIndex(className)].classes.push(className);
    });
  }
  const classGroups = reconciledManualGroups ?? autoGroups;
  const classGroupsSignature = JSON.stringify(classGroups.map((group) => [group.title, group.classes]));

  useEffect(() => {
    if (!onClassGroupsChange) return;
    onClassGroupsChange(classGroups.map((group) => ({
      title: group.title,
      classes: [...group.classes]
    })));
  }, [classGroupsSignature, onClassGroupsChange]);

  const moveClassToGroup = (className, targetIndex) => {
    setManualGroups((current) => {
      const base = (current ?? classGroups).map((group, index) => ({ title: GROUP_TITLES[index], classes: [...(group.classes ?? [])] }));
      const next = base.map((group) => ({ ...group, classes: group.classes.filter((item) => item !== className) }));
      if (!next[targetIndex].classes.includes(className)) next[targetIndex].classes.push(className);
      return next;
    });
  };

  const generatePages = () => {
    setGeneratedData(JSON.parse(JSON.stringify({ rows, hours, classGroups, classColors })));
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => window.dispatchEvent(new Event('cahier-pages-generated')));
    });
  };

  const generatedRows = generatedData?.rows ?? [];
  const generatedHours = generatedData?.hours ?? [];
  const generatedClassGroups = generatedData?.classGroups ?? [];
  const generatedClassColors = generatedData?.classColors ?? {};
  const getClassColor = (className) => classColors[className] || getCellColor(className);
  const getGeneratedClassColor = (className) => generatedClassColors[className] || getCellColor(className);
  const updateClassColor = (className, color) => setClassColors((current) => ({ ...current, [className]: color }));

  const generatedSessionsByDay = generatedRows.map((row) => generatedHours.reduce((list, hour) => {
    const cell = normalizeCell(row.cells[hour]);
    if (!cell.hidden && cell.text.trim()) list.push({ hour: getHourStart(hour), className: cell.text.trim(), duration: `${cell.span}h` });
    return list;
  }, []));

  const groupedHomeworkPages = generatedClassGroups.map((group, groupIndex) => {
    const classSet = new Set(group.classes);
    const entries = getSchoolHomeworkDates().flatMap((date) => {
      const dayIndex = getMondayBasedDayIndex(date);
      const monthDate = formatMonthDate(date);

      if (monthDate === '05/09') {
        const saturdaySessions = (generatedSessionsByDay[5] ?? []).filter((session) => classSet.has(session.className));
        if (!saturdaySessions.length) return [];
      }

      const eventEntries = getMandatoryEventStart(monthDate).map((event, eventIndex) => {
        const endDate = getMonthDateAsSchoolDate(event.end);
        const displayDate = event.start === event.end ? `${getDisplayDay(date, generatedRows)} ${event.start}` : `${getDisplayDay(date, generatedRows)} ${event.start} - ${getDisplayDay(endDate, generatedRows)} ${event.end}`;
        return { date: displayDate, sessions: [{ hour: event.label, className: '' }], text: event.text, isHoliday: event.type === 'holiday', isExam: event.type === 'exam', isMidYearHoliday: event.text.includes('Vacances de mi-année'), progressDate: event.start, color: event.type === 'exam' ? '#38bdf8' : '#f97316', eventKey: `${event.start}-${eventIndex}` };
      });

      if (eventEntries.length) return eventEntries;
      if (isInsideMandatoryEventAfterStart(monthDate)) return [];
      if (dayIndex >= generatedRows.length || !classSet.size) return [];
      const sessions = (generatedSessionsByDay[dayIndex] ?? []).filter((session) => classSet.has(session.className));
      if (!sessions.length) return [];
      return [{ date: `${getDisplayDay(date, generatedRows)} ${monthDate}`, sessions, text: DOT_TEXT, isHoliday: false, isExam: false, progressDate: monthDate, color: HOMEWORK_COLORS[dayIndex % HOMEWORK_COLORS.length] }];
    }).filter(Boolean);

    return { title: GROUP_TITLES[groupIndex], color: GROUP_COLORS[groupIndex], classes: group.classes, pages: chunkEntries(entries, 5) };
  }).filter((group) => group.classes.length > 0 && group.pages.length > 0);

  const findFirstTeachingEntry = (groups, startDay, endDay, month) => groups
    .flatMap((group) => group.pages.flat())
    .reduce((target, entry) => {
      if (entry.isHoliday || entry.isExam) return target;
      const [day, entryMonth] = String(entry.progressDate || '').split('/').map(Number);
      if (entryMonth !== month || day < startDay || day > endDay) return target;
      if (!target || day < target.day) return { day, entry };
      return target;
    }, null)?.entry;

  const assignmentWeekLabels = new Map();
  groupedHomeworkPages.forEach((group) => {
    const firstSemesterTarget = findFirstTeachingEntry([group], 4, 9, 1);
    if (firstSemesterTarget) assignmentWeekLabels.set(firstSemesterTarget, '"Sem.Du Dernier.Devoir.S1"');
  });

  groupedHomeworkPages.forEach((group) => {
    const isSecondBac = group.title === GROUP_TITLES[2];
    const isFirstOrCommon = group.title === GROUP_TITLES[0] || group.title === GROUP_TITLES[1];
    if (!isSecondBac && !isFirstOrCommon) return;
    const target = findFirstTeachingEntry(
      [group],
      isSecondBac ? 17 : 14,
      isSecondBac ? 22 : 19,
      isSecondBac ? 5 : 6
    );
    if (target) assignmentWeekLabels.set(target, '"Sem.Du Dernier.Devoir.S2"');
  });

  useLayoutEffect(() => {
    const elements = [...document.querySelectorAll('.homework-date[data-assignment-week-label]')];
    if (!elements.length) return undefined;

    let frame = 0;
    const scheduleFit = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => elements.forEach(fitLastAssignmentLabel));
    };
    const resizeObserver = new ResizeObserver(scheduleFit);
    const mutationObserver = new MutationObserver(scheduleFit);
    elements.forEach((element) => {
      resizeObserver.observe(element);
      mutationObserver.observe(element, { childList: true, characterData: true, subtree: true });
    });
    scheduleFit();

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [assignmentWeekLabels]);

  const canExtendLeft = (row, hourIndex) => hourIndex > 0 && Boolean(normalizeCell(row.cells[hours[hourIndex]]).text.trim()) && !normalizeCell(row.cells[hours[hourIndex - 1]]).hidden && !normalizeCell(row.cells[hours[hourIndex - 1]]).text.trim();
  const canExtendRight = (row, hourIndex) => {
    const cell = normalizeCell(row.cells[hours[hourIndex]]);
    const nextIndex = hourIndex + cell.span;
    return Boolean(cell.text.trim()) && nextIndex < hours.length && !normalizeCell(row.cells[hours[nextIndex]]).hidden && !normalizeCell(row.cells[hours[nextIndex]]).text.trim();
  };
  const canPasteCell = (row, hourIndex, cellToPaste) => {
    const sourceCell = normalizeCell(cellToPaste);
    if (!sourceCell.text.trim() || hourIndex + sourceCell.span > hours.length) return false;
    for (let index = hourIndex; index < hourIndex + sourceCell.span; index += 1) {
      const target = normalizeCell(row.cells[hours[index]]);
      if (target.hidden || target.text.trim()) return false;
    }
    return true;
  };

  const duplicateCellTo = (dayIndex, hourIndex, cellToPaste) => {
    setRows((current) => current.map((row, i) => {
      if (i !== dayIndex || !canPasteCell(row, hourIndex, cellToPaste)) return row;
      const pasted = cloneCell(cellToPaste);
      const nextCells = { ...row.cells, [hours[hourIndex]]: pasted };
      for (let index = hourIndex + 1; index < hourIndex + pasted.span; index += 1) nextCells[hours[index]] = { ...createCell(), hidden: true };
      return { ...row, cells: nextCells };
    }));
    setCopiedCell(cloneCell(cellToPaste));
    setSelectedCell(`${dayIndex}-${hourIndex}`);
  };

  const handleCellClick = (dayIndex, hourIndex, cell) => {
    const normalized = normalizeCell(cell);
    if (!normalized.text.trim()) return;
    setCopiedCell(cloneCell(normalized));
    setSelectedCell(`${dayIndex}-${hourIndex}`);
  };
  const handleDragStart = (event, dayIndex, hourIndex, cell) => {
    const normalized = normalizeCell(cell);
    if (!normalized.text.trim()) return event.preventDefault();
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('text/plain', normalized.text);
    setDraggedCell(cloneCell(normalized));
    setCopiedCell(cloneCell(normalized));
    setSelectedCell(`${dayIndex}-${hourIndex}`);
  };
  const handleDragOver = (event, dayIndex, hourIndex, row, hasClass) => {
    if (!draggedCell || hasClass || !canPasteCell(row, hourIndex, draggedCell)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    setDragOverCell(`${dayIndex}-${hourIndex}`);
  };
  const handleDrop = (event, dayIndex, hourIndex, row, hasClass) => {
    if (!draggedCell || hasClass || !canPasteCell(row, hourIndex, draggedCell)) return;
    event.preventDefault();
    duplicateCellTo(dayIndex, hourIndex, draggedCell);
    setDraggedCell(null);
    setDragOverCell(null);
  };

  const extendCellLeft = (dayIndex, hourIndex) => {
    if (hourIndex <= 0) return;
    setRows((current) => current.map((row, i) => {
      if (i !== dayIndex || !canExtendLeft(row, hourIndex)) return row;
      const cell = normalizeCell(row.cells[hours[hourIndex]]);
      return { ...row, cells: { ...row.cells, [hours[hourIndex - 1]]: { ...cell, span: cell.span + 1, hidden: false }, [hours[hourIndex]]: { ...createCell(), hidden: true } } };
    }));
  };
  const extendCellRight = (dayIndex, hourIndex) => setRows((current) => current.map((row, i) => {
    if (i !== dayIndex || !canExtendRight(row, hourIndex)) return row;
    const cell = normalizeCell(row.cells[hours[hourIndex]]);
    return { ...row, cells: { ...row.cells, [hours[hourIndex]]: { ...cell, span: cell.span + 1, hidden: false }, [hours[hourIndex + cell.span]]: { ...createCell(), hidden: true } } };
  }));
  const shrinkCellLeft = (dayIndex, hourIndex) => setRows((current) => current.map((row, i) => {
    if (i !== dayIndex) return row;
    const cell = normalizeCell(row.cells[hours[hourIndex]]);
    if (cell.span <= 1 || hourIndex + 1 >= hours.length) return row;
    return { ...row, cells: { ...row.cells, [hours[hourIndex]]: createCell(), [hours[hourIndex + 1]]: { ...cell, span: cell.span - 1, hidden: false } } };
  }));
  const shrinkCellRight = (dayIndex, hourIndex) => setRows((current) => current.map((row, i) => {
    if (i !== dayIndex) return row;
    const cell = normalizeCell(row.cells[hours[hourIndex]]);
    if (cell.span <= 1) return row;
    return { ...row, cells: { ...row.cells, [hours[hourIndex]]: { ...cell, span: cell.span - 1, hidden: false }, [hours[hourIndex + cell.span - 1]]: createCell() } };
  }));
  const deleteCell = (dayIndex, hourIndex) => {
    setRows((current) => current.map((row, i) => {
      if (i !== dayIndex) return row;
      const cell = normalizeCell(row.cells[hours[hourIndex]]);
      const nextCells = { ...row.cells, [hours[hourIndex]]: createCell() };
      for (let index = hourIndex + 1; index < hourIndex + cell.span && index < hours.length; index += 1) nextCells[hours[index]] = createCell();
      return { ...row, cells: nextCells };
    }));
    setCopiedCell(null);
    setSelectedCell(null);
  };

  const totalHours = rows.reduce((total, row) => total + hours.reduce((subtotal, hour) => {
    const cell = normalizeCell(row.cells[hour]);
    return subtotal + (!cell.hidden && cell.text.trim() ? cell.span : 0);
  }, 0), 0);

  return <main className="cahier-shell clean-cahier-shell">
    <section className="cahier-preview-zone">
      <div className="a4-page cahier-page">
        <header className="cahier-header">
          <input value={school} onChange={(e) => setSchool(e.target.value)} onKeyDown={validateOnEnter} />
          <h2>Cahier de texte</h2>
          <input value={teacher} onChange={(e) => setTeacher(e.target.value)} onKeyDown={validateOnEnter} />
          <input value={schoolYear} readOnly aria-label="Année scolaire automatique" />
        </header>
        <table className="timetable-table">
          <colgroup>
            <col className="cahier-day-col" />
            {hours.map((hour, index) => <col key={`col-${hour}-${index}`} className={index === 4 || index === 5 ? 'cahier-noon-col' : undefined} />)}
          </colgroup>
          <thead><tr><th>Jour</th>{hours.map((hour, index) => <th key={`${hour}-${index}`}><textarea value={hour} onChange={(e) => updateHour(index, e.target.value)} onKeyDown={validateOnEnter} rows="2" /></th>)}</tr></thead>
          <tbody>{rows.map((row, dayIndex) => <tr key={dayIndex}>
            <td className="hour-cell day-cell"><textarea value={row.day} onChange={(e) => updateDay(dayIndex, e.target.value)} onKeyDown={validateOnEnter} rows="2" /></td>
            {hours.map((hour, hourIndex) => {
              const cell = normalizeCell(row.cells[hour]);
              if (cell.hidden) return null;
              const hasClass = Boolean(cell.text.trim());
              const cellKey = `${dayIndex}-${hourIndex}`;
              const canDropHere = !hasClass && draggedCell && canPasteCell(row, hourIndex, draggedCell);
              return <td key={`${hour}-${hourIndex}`} colSpan={cell.span}><div className={`timetable-cell-content ${hasClass ? 'colored-cell draggable-cell clickable-cell' : ''} ${selectedCell === cellKey ? 'selected-cell' : ''} ${canDropHere || dragOverCell === cellKey ? 'drop-ready-cell' : ''}`} style={hasClass ? { '--cell-color': getClassColor(cell.text) } : undefined} draggable={hasClass} onDragStart={(e) => handleDragStart(e, dayIndex, hourIndex, cell)} onDragEnd={() => { setDraggedCell(null); setDragOverCell(null); }} onDragOver={(e) => handleDragOver(e, dayIndex, hourIndex, row, hasClass)} onDragLeave={() => setDragOverCell(null)} onDrop={(e) => handleDrop(e, dayIndex, hourIndex, row, hasClass)} onClick={hasClass ? () => handleCellClick(dayIndex, hourIndex, cell) : undefined} title={hasClass ? 'Cliquer pour sélectionner ou glisser pour dupliquer' : draggedCell ? 'Déposer ici pour dupliquer' : ''}>
                {hasClass && <div className="span-tools no-print" onClick={(e) => e.stopPropagation()}><button type="button" onClick={() => extendCellLeft(dayIndex, hourIndex)} disabled={!canExtendLeft(row, hourIndex)}>‹</button>{cell.span > 1 && <button type="button" className="span-remove-button" onClick={() => shrinkCellLeft(dayIndex, hourIndex)} title="Réduire depuis la gauche">▷</button>}<button type="button" className="cell-delete-button" onClick={() => deleteCell(dayIndex, hourIndex)} title="Supprimer la cellule">×</button>{cell.span > 1 && <button type="button" className="span-remove-button" onClick={() => shrinkCellRight(dayIndex, hourIndex)} title="Réduire depuis la droite">◁</button>}<button type="button" onClick={() => extendCellRight(dayIndex, hourIndex)} disabled={!canExtendRight(row, hourIndex)}>›</button></div>}
                <TimetableClassInput className="timetable-class-input" span={cell.span} value={cell.text} onChange={(e) => updateCellText(dayIndex, hour, e.target.value)} onClick={(e) => e.stopPropagation()} onDragStart={(e) => e.preventDefault()} onKeyDown={validateOnEnter} placeholder="Classe" aria-label="Classe" />
                {hasClass && <label className="room-control" onClick={(e) => e.stopPropagation()}><span>Salle</span><input type="number" min="1" max="80" value={cell.room} onChange={(e) => updateRoom(dayIndex, hour, e.target.value)} onKeyDown={validateOnEnter} /></label>}
              </div></td>;
            })}
          </tr>)}</tbody>
        </table>
        <div className="total-hours-control"><span>Total heures :</span><strong>{totalHours} h</strong></div>
        <div className="groups-under-timetable" data-cahier-class-groups="true" style={levelGroupsStyle}>
          {classGroups.map((group, index) => <div key={`${GROUP_TITLES[index]}-${index}`} style={{ minHeight: '192px', padding: '11px 9px', border: '2px solid rgba(17, 17, 17, 0.55)', borderRadius: '14px', background: `linear-gradient(180deg, ${GROUP_COLORS[index]}, white)`, boxShadow: '0 4px 10px rgba(17, 17, 17, 0.12)', overflow: 'hidden' }} onDragOver={(event) => { if (draggedClass) event.preventDefault(); }} onDrop={(event) => { event.preventDefault(); if (draggedClass) moveClassToGroup(draggedClass, index); setDraggedClass(null); }}>
            <div style={levelGroupTitleStyle} contentEditable suppressContentEditableWarning onKeyDown={validateOnEnter}>{GROUP_TITLES[index]}</div>
            <div style={levelGroupClassesStyle} aria-label={`Classes du groupe ${GROUP_TITLES[index]}`}>{group.classes.length ? group.classes.map((className) => <span className="cahier-class-group-chip" key={className} style={{ ...levelChipStyle, background: getClassColor(className) }} draggable onDragStart={(event) => { event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', className); setDraggedClass(className); }} onDragEnd={() => setDraggedClass(null)}><span className="cahier-class-group-name">{className}</span><input className="cahier-class-color-picker no-print" type="color" value={getClassColor(className)} aria-label="Changer la couleur" title="Changer la couleur" draggable={false} onPointerDown={(event) => event.stopPropagation()} onClick={(event) => event.stopPropagation()} onChange={(event) => updateClassColor(className, event.target.value)} /></span>) : null}</div>
          </div>)}
        </div>
        <footer className="cahier-footer"><span>Signature :</span><span>Observations :</span></footer>
      </div>
      {groupedHomeworkPages.flatMap((group, groupIndex) => [
        <div className="a4-page cahier-page homework-cover-page" key={`homework-cover-${groupIndex}`} style={{ ...groupCoverPageStyle, '--group-color': group.color }}>
          <div className="cahier-activities-brand" style={groupCoverBrandStyle}>
            <span style={groupCoverBrandMainStyle}>Activités<span style={groupCoverBrandDotStyle} /></span>
            <span style={groupCoverBrandSubStyle}>PÉDAGOGIQUES</span>
          </div>
          <div className="cahier-education-icons" style={groupCoverIconsStyle}>
            <EducationIcon kind="book" color={group.color} />
            <EducationIcon kind="pencil" color={group.color} />
            <EducationIcon kind="cap" color={group.color} />
          </div>
          <h1 className="cahier-group-main-title" style={groupCoverTitleStyle}>{group.title}</h1>
          <div className="cahier-group-classes-panel" style={groupCoverClassWrapStyle}>
            <div style={groupCoverClassTitleStyle}>Classes :</div>
            {group.classes.length ? <div style={groupCoverGridStyle}>{group.classes.map((className) => <span className="cahier-group-cover-class-chip" key={`${group.title}-cover-${className}`} style={{ ...groupCoverChipStyle, background: getGeneratedClassColor(className) }}>{className}</span>)}</div> : <div style={groupCoverEmptyStyle}>Aucune classe affectée</div>}
          </div>
        </div>,
        ...group.pages.map((pageEntries, pageIndex) => <div className="a4-page cahier-page homework-page" key={`homework-page-${groupIndex}-${pageIndex}`} style={{ '--group-color': group.color, position: 'relative', paddingTop: '60px' }}>
          <div style={groupHomeworkHeaderStyle}>
            <div style={groupHomeworkTitleStyle}>{group.title}</div>
            <div style={progressWrapStyle}>
              <div style={progressBarStyle}>
                <div style={{ ...progressFillStyle, width: `${getPageProgressExactPercent(pageEntries)}%` }} />
                {SCHOOL_PROGRESS_FLAGS.map((flag) => <span key={flag.date} style={{ ...progressFlagStyle, left: `${getFlagPercent(flag.date)}%` }} title={flag.label}>⚑</span>)}
              </div>
              <div style={progressPercentStyle}>{getPageProgressPercent(pageEntries)}%</div>
            </div>
          </div>
          {pageEntries.map((entry) => <section className={`homework-entry ${entry.isExam ? 'cahier-exam-entry' : ''} ${entry.isHoliday ? 'cahier-extra-holiday-entry' : ''} ${entry.isMidYearHoliday ? 'cahier-midyear-holiday-entry' : ''}`} key={`${group.title}-${entry.date}-${entry.eventKey || entry.text}`} style={{ '--homework-color': entry.isMidYearHoliday ? '#16a34a' : entry.color }}>
            <div className="homework-date" data-assignment-week-label={assignmentWeekLabels.get(entry)}>{entry.date}</div>
            {entry.isMidYearHoliday ? <div className="homework-content cahier-midyear-holiday-content">
              <div className="cahier-midyear-school-panel">
                <div className="cahier-midyear-icons">
                  <EducationIcon kind="book" color="#16a34a" />
                  <EducationIcon kind="pencil" color="#16a34a" />
                  <EducationIcon kind="cap" color="#16a34a" />
                </div>
                <div className="cahier-midyear-school-label">Deuxième Semestre</div>
              </div>
              <div className="cahier-midyear-message" contentEditable suppressContentEditableWarning onKeyDown={validateOnEnter}>
                <span>Vacances scolaires</span>
                <strong>Vacances de mi-année</strong>
              </div>
            </div> : <div className="homework-content"><div className="homework-subject" contentEditable={entry.sessions.length === 0} suppressContentEditableWarning onKeyDown={validateOnEnter} style={entry.sessions.length ? subjectTextStyle : undefined}>{entry.sessions.map((session) => <div key={`${group.title}-${entry.date}-${session.hour}-${session.className}`} style={sessionLineStyle}><span style={sessionHourStyle}>{session.hour}</span><span style={sessionClassStyle}>{session.className}</span><span className="cahier-session-duration" style={sessionDurationStyle}>{session.duration}</span></div>)}</div><div className="homework-text" contentEditable suppressContentEditableWarning onKeyDown={validateOnEnter} style={entry.isHoliday ? holidayTextStyle : entry.isExam ? examTextStyle : dotTextStyle}>{entry.text}</div></div>}
          </section>)}
        </div>)
      ])}
      {generatedData && <div id="cahier-exams-groups-page" className="a4-page cahier-page cahier-exams-groups-page">
        <div className="cahier-exams-groups-main-title">Liste des examens</div>
        <section className="cahier-exams-list" style={examListWrapStyle}>
          <table style={examListTableStyle}>
            <colgroup><col style={{ width: '18%' }} /><col style={{ width: '18%' }} /><col style={{ width: '18%' }} /><col style={{ width: '46%' }} /></colgroup>
            <thead><tr><th style={{ ...examListHeaderCellStyle, borderRadius: '12px 0 0 12px' }}>Cycle</th><th style={examListHeaderCellStyle}>Date de</th><th style={examListHeaderCellStyle}>Date à</th><th style={{ ...examListHeaderCellStyle, borderRadius: '0 12px 12px 0' }}>Examen</th></tr></thead>
            <tbody>{EXAM_EVENTS.map((exam) => <tr key={`${exam.start}-${exam.end}-${exam.text}`}><td style={{ ...examListCellStyle, borderLeft: '1px solid rgba(17,17,17,0.08)', borderRadius: '12px 0 0 12px', fontWeight: 900 }}>{exam.label}</td><td style={examListCellStyle}>{exam.start}</td><td style={examListCellStyle}>{exam.end}</td><td style={{ ...examListCellStyle, borderRight: '1px solid rgba(17,17,17,0.08)', borderRadius: '0 12px 12px 0', fontWeight: 900 }}>{exam.text.replace('Examen : ', '').replace('Rattrapage : ', 'Rattrapage - ')}</td></tr>)}</tbody>
          </table>
        </section>
      </div>}
      {generatedData && <MoroccoHolidaysPage />}
    </section>
    <button type="button" className="cahier-generate-pages-button no-print" onClick={generatePages}>Générer les pages</button>
  </main>;
}
