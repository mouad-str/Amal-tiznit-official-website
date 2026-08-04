
export interface Player {
  id: string;
  name: string;
  nameAr: string;
  position: 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward';
  number: number;
  image: string;
  nationality: string;
}

export interface Match {
  id: string;
  opponent: string;
  date: string;
  time: string;
  stadium: string;
  isHome: boolean;
  score?: {
    home: number;
    away: number;
  };
  status: 'upcoming' | 'finished' | 'live';
}

export interface NewsArticle {
  id: string;
  title: string;
  date: string;
  summary: string;
  image: string;
  category: string;
}

export interface NavItem {
  label: string;
  path: string;
}

export type SplashScreenStatus = 'idle' | 'animating' | 'hidden';
