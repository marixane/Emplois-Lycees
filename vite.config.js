import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const correctSchoolCalendar = () => ({
  name: 'correct-school-calendar-2026-2027',
  enforce: 'pre',
  transform(code, id) {
    if (!id.endsWith('/src/Tab.jsx')) return null;

    const replacements = [
      ["const getSchoolStartYear = () => {\n  const today = new Date();\n  return today.getMonth() >= 8 ? today.getFullYear() : today.getFullYear() - 1;\n};", "const getSchoolStartYear = () => 2026;"],
      ["return { start: new Date(startYear, 8, 1), end: new Date(startYear + 1, 6, 31) };", "return { start: new Date(startYear, 8, 1), end: new Date(startYear + 1, 6, 10) };"],
      ["const end = new Date(startYear + 1, 6, 31);", "const end = new Date(startYear + 1, 6, 10);"],
      ["{ start: '19/10', end: '26/10', label: 'Scolaire', text: 'Vacance scolaire : Vacances intermédiaires 1', type: 'holiday' }", "{ start: '18/10', end: '25/10', label: 'Scolaire', text: 'Vacance scolaire : Vacances intermédiaires 1', type: 'holiday' }"],
      ["{ start: '07/12', end: '14/12', label: 'Scolaire', text: 'Vacance scolaire : Vacances intermédiaires 2', type: 'holiday' }", "{ start: '06/12', end: '13/12', label: 'Scolaire', text: 'Vacance scolaire : Vacances intermédiaires 2', type: 'holiday' }"],
      ["{ start: '25/01', end: '01/02', label: 'Scolaire', text: 'Vacance scolaire : Vacances de mi-année', type: 'holiday' }", "{ start: '24/01', end: '31/01', label: 'Scolaire', text: 'Vacance scolaire : Vacances de mi-année', type: 'holiday' }"],
      ["{ start: '03/05', end: '10/05', label: 'Scolaire', text: 'Vacance scolaire : Vacances intermédiaires 4', type: 'holiday' }", "{ start: '09/05', end: '16/05', label: 'Scolaire', text: 'Vacance scolaire : Vacances intermédiaires 4', type: 'holiday' }"],
      ["{ date: '19/10', label: 'Vacances intermédiaires 1' }", "{ date: '18/10', label: 'Vacances intermédiaires 1' }"],
      ["{ date: '07/12', label: 'Vacances intermédiaires 2' }", "{ date: '06/12', label: 'Vacances intermédiaires 2' }"],
      ["{ date: '03/05', label: 'Vacances intermédiaires 4' }", "{ date: '09/05', label: 'Vacances intermédiaires 4' }"]
    ];

    let transformed = code;
    for (const [from, to] of replacements) transformed = transformed.replace(from, to);
    return { code: transformed, map: null };
  }
});

export default defineConfig({
  plugins: [correctSchoolCalendar(), react()],
  build: {
    target: 'es2017',
    cssTarget: 'safari13'
  },
  esbuild: {
    target: 'es2017'
  }
});