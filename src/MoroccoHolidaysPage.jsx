const HOLIDAYS = [
  { name: 'Vacances intermédiaires 1', date: '18-25/10/2026', days: '8 jours', type: 'Scolaire' },
  { name: 'Fête de l’Unité', date: '31/10/2026', days: '1 jour', type: 'Nationale' },
  { name: 'Marche Verte', date: '06/11/2026', days: '1 jour', type: 'Nationale' },
  { name: 'Fête de l’Indépendance', date: '18/11/2026', days: '1 jour', type: 'Nationale' },
  { name: 'Vacances intermédiaires 2', date: '06-13/12/2026', days: '8 jours', type: 'Scolaire' },
  { name: 'Nouvel An', date: '01/01/2027', days: '1 jour', type: 'Nationale' },
  { name: 'Manifeste de l’Indépendance', date: '11/01/2027', days: '1 jour', type: 'Nationale' },
  { name: 'Nouvel An Amazigh', date: '14/01/2027', days: '1 jour', type: 'Nationale' },
  { name: 'Vacances de mi-année', date: '24-31/01/2027', days: '8 jours', type: 'Scolaire' },
  { name: 'Aïd Al-Fitr', date: '29 Ramadan - 2 Chawwal 1448', days: '3 à 4 jours', type: 'Religieuse' },
  { name: 'Fête du Travail', date: '01/05/2027', days: '1 jour', type: 'Nationale' },
  { name: 'Vacances intermédiaires 4', date: '09-16/05/2027', days: '8 jours', type: 'Scolaire' },
  { name: 'Aïd Al-Adha', date: '09-11 Dhou Al-Hijja 1448', days: '3 jours', type: 'Religieuse' },
  { name: '1er Moharram', date: '01 Moharram 1449', days: '1 jour', type: 'Religieuse' }
];

const pageStyle = {
  padding: '18px 22px',
  background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 45%, #fefce8 100%)'
};

const headerStyle = {
  display: 'grid',
  gap: '8px',
  marginBottom: '16px',
  padding: '18px',
  borderRadius: '18px',
  background: 'linear-gradient(135deg, #14532d, #16a34a)',
  color: 'white',
  textAlign: 'center',
  boxShadow: '0 8px 18px rgba(20, 83, 45, 0.22)'
};

const titleStyle = {
  margin: 0,
  fontSize: '30px',
  fontWeight: 900,
  textTransform: 'uppercase',
  letterSpacing: '0.8px'
};

const subtitleStyle = {
  margin: 0,
  fontSize: '15px',
  fontWeight: 800,
  opacity: 0.95
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'separate',
  borderSpacing: '0 8px',
  fontFamily: 'Arial, sans-serif'
};

const headCellStyle = {
  padding: '10px 8px',
  background: '#111827',
  color: 'white',
  fontSize: '12px',
  fontWeight: 900,
  textTransform: 'uppercase',
  textAlign: 'center'
};

const cellStyle = {
  padding: '10px 9px',
  background: 'white',
  borderTop: '1px solid rgba(17,17,17,0.08)',
  borderBottom: '1px solid rgba(17,17,17,0.08)',
  color: '#111827',
  fontSize: '12px',
  fontWeight: 800,
  textAlign: 'center'
};

const nameStyle = {
  ...cellStyle,
  textAlign: 'left',
  fontSize: '13px',
  fontWeight: 900
};

const badgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '82px',
  padding: '5px 8px',
  borderRadius: '999px',
  color: '#111827',
  fontSize: '11px',
  fontWeight: 900
};

const noteStyle = {
  marginTop: '12px',
  padding: '10px 14px',
  borderRadius: '12px',
  background: 'rgba(37, 99, 235, 0.08)',
  color: '#1f2937',
  fontSize: '11px',
  fontWeight: 800,
  textAlign: 'center'
};

const typeColor = (type) => type === 'Scolaire' ? '#bfdbfe' : type === 'Nationale' ? '#bbf7d0' : '#fed7aa';

export default function MoroccoHolidaysPage() {
  return <div className="a4-page cahier-page holidays-page" style={pageStyle}>
    <header style={headerStyle}>
      <h1 style={titleStyle}>Vacances scolaires</h1>
      <p style={subtitleStyle}>Éducation nationale marocaine · Année scolaire 2026 / 2027</p>
    </header>
    <table style={tableStyle}>
      <thead><tr><th style={{ ...headCellStyle, borderRadius: '12px 0 0 12px' }}>N°</th><th style={headCellStyle}>Vacance / fête</th><th style={headCellStyle}>Date</th><th style={headCellStyle}>Durée</th><th style={{ ...headCellStyle, borderRadius: '0 12px 12px 0' }}>Type</th></tr></thead>
      <tbody>{HOLIDAYS.map((holiday, index) => <tr key={holiday.name}>
        <td style={{ ...cellStyle, borderLeft: '1px solid rgba(17,17,17,0.08)', borderRadius: '12px 0 0 12px', fontWeight: 900 }}>{String(index + 1).padStart(2, '0')}</td>
        <td style={nameStyle}>{holiday.name}</td>
        <td style={cellStyle}>{holiday.date}</td>
        <td style={cellStyle}>{holiday.days}</td>
        <td style={{ ...cellStyle, borderRight: '1px solid rgba(17,17,17,0.08)', borderRadius: '0 12px 12px 0' }}><span style={{ ...badgeStyle, background: typeColor(holiday.type) }}>{holiday.type}</span></td>
      </tr>)}</tbody>
    </table>
    <div style={noteStyle}>Les fêtes religieuses sont gardées selon les dates hijri indiquées dans le PDF officiel.</div>
  </div>;
}
