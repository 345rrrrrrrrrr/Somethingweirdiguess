
export interface BreachInfo {
  name: string;
  title: string;
  domain: string;
  breachDate: string;
  addedDate: string;
  dataClasses: string[];
  description: string;
  logoPath: string;
}

export interface PasswordCheckResult {
  count: number;
  status: 'safe' | 'breached' | 'checking';
}

export interface HistoryItem {
  id: string;
  type: 'email' | 'password';
  query: string;
  timestamp: number;
  resultSummary: string;
}

export enum ViewMode {
  EMAIL = 'EMAIL',
  PASSWORD = 'PASSWORD',
  HISTORY = 'HISTORY',
  THREAT_MAP = 'THREAT_MAP'
}

export interface GlobalThreat {
  id: string;
  title: string;
  impact: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  date: string;
  details: string;
}

export interface RiskProfile {
  score: number;
  label: string;
  color: string;
  factors: string[];
}
