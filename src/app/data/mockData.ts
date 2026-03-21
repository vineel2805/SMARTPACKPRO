export const SUBJECT_COLORS = {
  Mathematics: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  Science: 'bg-green-500/10 text-green-500 border-green-500/20',
  English: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  'Social Studies': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  'Physical Education': 'bg-red-500/10 text-red-500 border-red-500/20',
  Art: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
  Music: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  Computer: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
};

export interface PackingItem {
  id: string;
  name: string;
  subject?: string;
  type: 'bring' | 'do-not-bring';
  addedBy?: 'teacher' | 'student';
}

export interface StudentChecklistItem extends PackingItem {
  checked: boolean;
}

export const todayPackingItems: PackingItem[] = [
  { id: '1', name: 'Mathematics Textbook', subject: 'Mathematics', type: 'bring' },
  { id: '2', name: 'Mathematics Workbook', subject: 'Mathematics', type: 'bring' },
  { id: '3', name: 'Science Notebook', subject: 'Science', type: 'bring' },
  { id: '4', name: 'Lab Coat', subject: 'Science', type: 'bring' },
  { id: '5', name: 'English Novel', subject: 'English', type: 'bring' },
  { id: '6', name: 'Calculator', subject: 'Mathematics', type: 'do-not-bring' },
  { id: '7', name: 'Art Supplies', subject: 'Art', type: 'do-not-bring' },
  { id: '8', name: 'Sports Shoes', subject: 'Physical Education', type: 'do-not-bring' },
];

export const mockClasses = ['6-A', '6-B', '7-A', '7-B', '8-A', '8-B'];

export const quickSuggestions = [
  'Textbook',
  'Workbook',
  'Notebook',
  'Calculator',
  'Lab Coat',
  'Art Supplies',
  'Sports Shoes',
  'Drawing Book',
  'Color Pencils',
  'Ruler',
  'Compass',
  'Dictionary',
];

export interface HistoryEntry {
  id: string;
  date: string;
  class: string;
  itemsAdded: string[];
  itemsRemoved: string[];
}

export const mockHistory: HistoryEntry[] = [
  {
    id: '1',
    date: '2026-03-21',
    class: '6-A',
    itemsAdded: ['Mathematics Textbook', 'Mathematics Workbook', 'Science Notebook'],
    itemsRemoved: ['Calculator', 'Art Supplies'],
  },
  {
    id: '2',
    date: '2026-03-20',
    class: '6-A',
    itemsAdded: ['English Novel', 'Dictionary'],
    itemsRemoved: ['Sports Shoes'],
  },
  {
    id: '3',
    date: '2026-03-19',
    class: '6-B',
    itemsAdded: ['Lab Coat', 'Science Textbook'],
    itemsRemoved: ['Color Pencils'],
  },
];

export interface StudentEngagement {
  id: string;
  name: string;
  class: string;
  status: 'completed' | 'in-progress' | 'not-seen' | 'inactive';
  lastSeen?: string;
}

export const mockStudentEngagement: StudentEngagement[] = [
  { id: '1', name: 'Alex Johnson', class: '6-A', status: 'completed', lastSeen: '10 min ago' },
  { id: '2', name: 'Emma Wilson', class: '6-A', status: 'completed', lastSeen: '15 min ago' },
  { id: '3', name: 'Michael Brown', class: '6-A', status: 'in-progress', lastSeen: '5 min ago' },
  { id: '4', name: 'Sophia Davis', class: '6-A', status: 'in-progress', lastSeen: '20 min ago' },
  { id: '5', name: 'James Miller', class: '6-A', status: 'not-seen', lastSeen: '2 hours ago' },
  { id: '6', name: 'Olivia Garcia', class: '6-A', status: 'not-seen', lastSeen: '3 hours ago' },
  { id: '7', name: 'William Martinez', class: '6-A', status: 'inactive', lastSeen: '2 days ago' },
  { id: '8', name: 'Isabella Anderson', class: '6-A', status: 'inactive', lastSeen: '3 days ago' },
];

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  assignedClasses: string[];
  isClassTeacher: boolean;
  classTeacherOf?: string;
}

export const mockTeachers: Teacher[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    subject: 'Mathematics',
    assignedClasses: ['6-A', '6-B', '7-A'],
    isClassTeacher: true,
    classTeacherOf: '6-A',
  },
  {
    id: '2',
    name: 'Mr. David Chen',
    subject: 'Science',
    assignedClasses: ['6-A', '6-B', '7-B'],
    isClassTeacher: true,
    classTeacherOf: '6-B',
  },
  {
    id: '3',
    name: 'Ms. Emily Rodriguez',
    subject: 'English',
    assignedClasses: ['7-A', '7-B', '8-A'],
    isClassTeacher: true,
    classTeacherOf: '7-A',
  },
  {
    id: '4',
    name: 'Mr. Robert Taylor',
    subject: 'Social Studies',
    assignedClasses: ['6-A', '7-A', '8-A'],
    isClassTeacher: false,
  },
  {
    id: '5',
    name: 'Ms. Jennifer Lee',
    subject: 'Physical Education',
    assignedClasses: ['6-A', '6-B', '7-A', '7-B'],
    isClassTeacher: false,
  },
];
