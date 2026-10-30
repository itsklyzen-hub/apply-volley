export type Position = 'Passeur' | 'Pointu' | 'Central' | 'R4' | 'Libéro';

export const POSITIONS: Position[] = ['Passeur', 'Pointu', 'Central', 'R4', 'Libéro'];

export type Player = {
  id: string;
  firstName: string;
  lastName: string;
  number: number;
  position: Position;
};

export type Attendance = 'present' | 'absent' | 'unknown';

export type CalendarEvent = {
  id: string;
  kind: 'training' | 'match' | 'other';
  title: string;
  date: string; // AAAA-MM-JJ
  time: string; // HH:MM
  location: string;
  attendance: Record<string, Attendance>;
};

export type AppData = {
  teamName: string;
  players: Player[];
  events: CalendarEvent[];
};
