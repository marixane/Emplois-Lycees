import { useState } from 'react';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const HOURS = ['08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00'];

const createCell = () => ({ text: '', room: 1, span: 1, hidden: false });
const cloneCell = (cell) => ({ ...normalizeCell(cell), hidden: false });
const clampRoom = (value) => Math.min(Math.max(Number(value) || 1, 1), 80);

const createRows = () => DAYS.map((day) => ({
  day,
  cells: HOURS.reduce((acc, hour) => ({ ...acc, [hour]: createCell() }), {})
}));

const normalizeCell = (cell) => {
  if (typeof cell === 'object' && cell !== null) {
    return {
      text: String(cell.text ?? ''),
      room: clampRoom(cell.room ?? 1),
      span: Math.max(Number(cell.span) || 1, 1),
      hidden: Boolean(cell.hidden)
    };
  }

  return { text: String(cell ?? ''), room: 1, span: 1, hidden: false };
};

export default function Tab() {
  const [school, setSchool] = useState('Établissement :');
  const [teacher, setTeacher] = useState('Professeur :');
  const [year, setYear] = useState('Année scolaire : 2026 / 2027');
  const [hours, setHours] = useState(HOURS);
  const [rows, setRows] = useState(createRows);
  const [copiedCell, setCopiedCell] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);

  const validateOnEnter = (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    event.currentTarget.blur();
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

  const updateDay = (index, value) => {
    setRows((current) => current.map((row, i) => i === index ? { ...row, day: value } : row));
  };

  const updateCellText = (dayIndex, hour, value) => {
    setRows((current) => current.map((row, i) => i === dayIndex ? {
      ...row,
      cells: { ...row.cells, [hour]: { ...normalizeCell(row.cells[hour]), text: value } }
    } : row));
  };

  const updateRoom = (dayIndex, hour, value) => {
    setRows((current) => current.map((row, i) => i === dayIndex ? {
      ...row,
      cells: { ...row.cells, [hour]: { ...normalizeCell(row.cells[hour]), room: clampRoom(value) } }
    } : row));
  };

  const canExtendLeft = (row, hourIndex) => {
    if (hourIndex <= 0) return false;
    const cell = normalizeCell(row.cells[hours[hourIndex]]);
    const previous = normalizeCell(row.cells[hours[hourIndex - 1]]);
    return Boolean(cell.text.trim()) && !previous.hidden && !previous.text.trim();
  };

  const canExtendRight = (row, hourIndex) => {
    const cell = normalizeCell(row.cells[hours[hourIndex]]);
    const nextIndex = hourIndex + cell.span;
    if (!cell.text.trim() || nextIndex >= hours.length) return false;
    const next = normalizeCell(row.cells[hours[nextIndex]]);
    return !next.hidden && !next.text.trim();
  };

  const canPasteCell = (row, hourIndex, cellToPaste) => {
    const sourceCell = normalizeCell(cellToPaste);
    if (!sourceCell.text.trim()) return false;
    if (hourIndex + sourceCell.span > hours.length) return false;

    for (let index = hourIndex; index < hourIndex + sourceCell.span; index += 1) {
      const target = normalizeCell(row.cells[hours[index]]);
      if (target.hidden || target.text.trim()) return false;
    }

    return true;
  };

  const handleCellClick = (dayIndex, hourIndex, cell) => {
    const normalized = normalizeCell(cell);
    const key = `${dayIndex}-${hourIndex}`;

    if (normalized.text.trim()) {
      setCopiedCell(cloneCell(normalized));
      setSelectedCell(key);
      return;
    }

    if (!copiedCell) return;

    setRows((current) => current.map((row, i) => {
      if (i !== dayIndex || !canPasteCell(row, hourIndex, copiedCell)) return row;
      const pasted = cloneCell(copiedCell);
      const nextCells = { ...row.cells, [hours[hourIndex]]: pasted };

      for (let index = hourIndex + 1; index < hourIndex + pasted.span; index += 1) {
        nextCells[hours[index]] = { ...createCell(), hidden: true };
      }

      return { ...row, cells: nextCells };
    }));

    setSelectedCell(`${dayIndex}-${hourIndex}`);
  };

  const extendCellLeft = (dayIndex, hourIndex) => {
    if (hourIndex <= 0) return;
    setRows((current) => current.map((row, i) => {
      if (i !== dayIndex || !canExtendLeft(row, hourIndex)) return row;
      const currentHour = hours[hourIndex];
      const previousHour = hours[hourIndex - 1];
      const cell = normalizeCell(row.cells[currentHour]);

      return {
        ...row,
        cells: {
          ...row.cells,
          [previousHour]: { ...cell, span: cell.span + 1, hidden: false },
          [currentHour]: { ...createCell(), hidden: true }
        }
      };
    }));
  };

  const extendCellRight = (dayIndex, hourIndex) => {
    setRows((current) => current.map((row, i) => {
      if (i !== dayIndex || !canExtendRight(row, hourIndex)) return row;
      const currentHour = hours[hourIndex];
      const cell = normalizeCell(row.cells[currentHour]);
      const nextHour = hours[hourIndex + cell.span];

      return {
        ...row,
        cells: {
          ...row.cells,
          [currentHour]: { ...cell, span: cell.span + 1, hidden: false },
          [nextHour]: { ...createCell(), hidden: true }
        }
      };
    }));
  };

  const shrinkCellRight = (dayIndex, hourIndex) => {
    setRows((current) => current.map((row, i) => {
      if (i !== dayIndex) return row;
      const currentHour = hours[hourIndex];
      const cell = normalizeCell(row.cells[currentHour]);
      if (cell.span <= 1) return row;
      const releasedHour = hours[hourIndex + cell.span - 1];

      return {
        ...row,
        cells: {
          ...row.cells,
          [currentHour]: { ...cell, span: cell.span - 1, hidden: false },
          [releasedHour]: createCell()
        }
      };
    }));
  };

  return <main className="cahier-shell clean-cahier-shell">
    <section className="cahier-preview-zone">
      <div className="a4-page cahier-page">
        <header className="cahier-header">
          <input value={school} onChange={(e) => setSchool(e.target.value)} onKeyDown={validateOnEnter} />
          <h2>Cahier de texte</h2>
          <input value={teacher} onChange={(e) => setTeacher(e.target.value)} onKeyDown={validateOnEnter} />
          <input value={year} onChange={(e) => setYear(e.target.value)} onKeyDown={validateOnEnter} />
        </header>

        <table className="timetable-table">
          <thead>
            <tr>
              <th>Jour</th>
              {hours.map((hour, index) => <th key={`${hour}-${index}`}>
                <textarea value={hour} onChange={(e) => updateHour(index, e.target.value)} onKeyDown={validateOnEnter} rows="2" />
              </th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, dayIndex) => <tr key={dayIndex}>
              <td className="hour-cell day-cell">
                <textarea value={row.day} onChange={(e) => updateDay(dayIndex, e.target.value)} onKeyDown={validateOnEnter} rows="2" />
              </td>
              {hours.map((hour, hourIndex) => {
                const cell = normalizeCell(row.cells[hour]);
                if (cell.hidden) return null;
                const hasClass = Boolean(cell.text.trim());
                const cellKey = `${dayIndex}-${hourIndex}`;
                const canPasteHere = !hasClass && copiedCell && canPasteCell(row, hourIndex, copiedCell);

                return <td key={`${hour}-${hourIndex}`} colSpan={cell.span}>
                  <div
                    className={`timetable-cell-content ${selectedCell === cellKey ? 'selected-cell' : ''} ${canPasteHere ? 'paste-ready-cell' : ''}`}
                    onClick={() => handleCellClick(dayIndex, hourIndex, cell)}
                    title={hasClass ? 'Cliquer pour copier cette cellule' : copiedCell ? 'Cliquer pour coller ici' : ''}
                  >
                    {hasClass && <div className="span-tools no-print" onClick={(e) => e.stopPropagation()}>
                      <button type="button" onClick={() => extendCellLeft(dayIndex, hourIndex)} disabled={!canExtendLeft(row, hourIndex)}>‹</button>
                      {cell.span > 1 && <button type="button" className="span-remove-button" onClick={() => shrinkCellRight(dayIndex, hourIndex)}>×</button>}
                      <button type="button" onClick={() => extendCellRight(dayIndex, hourIndex)} disabled={!canExtendRight(row, hourIndex)}>›</button>
                    </div>}
                    <textarea
                      value={cell.text}
                      onChange={(e) => updateCellText(dayIndex, hour, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={validateOnEnter}
                      placeholder={copiedCell ? 'Cliquer ici pour coller' : 'Classe / matière'}
                      rows="4"
                    />
                    {hasClass && <label className="room-control" onClick={(e) => e.stopPropagation()}>
                      <span>Salle</span>
                      <input
                        type="number"
                        min="1"
                        max="80"
                        value={cell.room}
                        onChange={(e) => updateRoom(dayIndex, hour, e.target.value)}
                        onKeyDown={validateOnEnter}
                      />
                    </label>}
                  </div>
                </td>;
              })}
            </tr>)}
          </tbody>
        </table>

        <footer className="cahier-footer">
          <span>Signature :</span>
          <span>Observations :</span>
        </footer>
      </div>
    </section>
  </main>;
}
