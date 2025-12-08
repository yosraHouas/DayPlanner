import * as XLSX from 'xlsx';
import { Task } from '../types';

export const parseExcelFile = (file: File): Promise<Task[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const tasks: Task[] = jsonData.map((row: any, index: number) => {
          const startTime = parseTime(row['Heure début'] || row['Start Time'] || row['Début']);
          const endTime = parseTime(row['Heure fin'] || row['End Time'] || row['Fin']);
          const title = row['Tâche'] || row['Task'] || row['Title'] || row['Titre'] || 'Sans titre';
          const category = row['Catégorie'] || row['Category'] || row['Type'];
          const priority = parsePriority(row['Priorité'] || row['Priority']);
          const description = row['Description'] || row['Notes'];

          const duration = calculateDuration(startTime, endTime);

          return {
            id: `task-${index}-${Date.now()}`,
            title,
            startTime,
            endTime,
            duration,
            category,
            priority,
            description,
            color: getCategoryColor(category),
          };
        });

        resolve(tasks.filter(task => task.startTime && task.endTime));
      } catch (error) {
        reject(new Error('Erreur lors de la lecture du fichier Excel. Vérifiez le format.'));
      }
    };

    reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
    reader.readAsBinaryString(file);
  });
};

const parseTime = (timeValue: any): string => {
  if (!timeValue) return '';

  if (typeof timeValue === 'string') {
    if (timeValue.match(/^\d{1,2}:\d{2}$/)) {
      return timeValue;
    }
  }

  if (typeof timeValue === 'number') {
    const totalMinutes = Math.round(timeValue * 24 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  return '';
};

const calculateDuration = (startTime: string, endTime: string): number => {
  if (!startTime || !endTime) return 0;

  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);

  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;

  return endTotalMinutes - startTotalMinutes;
};

const parsePriority = (value: any): 'low' | 'medium' | 'high' | undefined => {
  if (!value) return undefined;

  const str = value.toString().toLowerCase();
  if (str.includes('high') || str.includes('haute') || str.includes('élevée')) return 'high';
  if (str.includes('medium') || str.includes('moyenne') || str.includes('moyen')) return 'medium';
  if (str.includes('low') || str.includes('basse') || str.includes('faible')) return 'low';

  return undefined;
};

const getCategoryColor = (category?: string): string => {
  if (!category) return '#3b82f6';

  const colors: Record<string, string> = {
    travail: '#ef4444',
    work: '#ef4444',
    personnel: '#10b981',
    personal: '#10b981',
    sport: '#f59e0b',
    exercise: '#f59e0b',
    réunion: '#8b5cf6',
    meeting: '#8b5cf6',
    repos: '#6366f1',
    rest: '#6366f1',
  };

  const key = category.toLowerCase();
  return colors[key] || '#3b82f6';
};

export const generateSampleExcel = () => {
  const sampleData = [
    {
      'Tâche': 'Réunion d\'équipe',
      'Heure début': '09:00',
      'Heure fin': '10:00',
      'Catégorie': 'Travail',
      'Priorité': 'Haute',
      'Description': 'Point hebdomadaire avec l\'équipe'
    },
    {
      'Tâche': 'Sport',
      'Heure début': '12:00',
      'Heure fin': '13:00',
      'Catégorie': 'Personnel',
      'Priorité': 'Moyenne',
      'Description': 'Séance de running'
    },
    {
      'Tâche': 'Développement',
      'Heure début': '14:00',
      'Heure fin': '17:00',
      'Catégorie': 'Travail',
      'Priorité': 'Haute',
      'Description': 'Développement de nouvelles fonctionnalités'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Planning');
  XLSX.writeFile(wb, 'exemple-planning.xlsx');
};
