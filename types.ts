export enum ComplianceStatus {
  PENDING = 'PENDING',
  COMPLIANT = 'COMPLIANT',
  NON_COMPLIANT = 'NON_COMPLIANT',
  NOT_APPLICABLE = 'NOT_APPLICABLE',
  NEEDS_CONSULTATION = 'NEEDS_CONSULTATION'
}

export interface ChecklistItem {
  id: string;
  text: string;
  subtext?: string;
  status: ComplianceStatus;
  notes: string;
}

export interface ChecklistCategory {
  id: string;
  title: string;
  items: ChecklistItem[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface AIAnalysisResult {
  id: string;
  status: ComplianceStatus;
  notes: string;
}

export interface ProjectMetadata {
  ownerName: string;
  address: string;
  lotDp: string;
}

export interface AnalysisResponse {
  metadata: ProjectMetadata;
  results: AIAnalysisResult[];
}

export interface FileUpload {
  name: string;
  type: string;
  data: string; // Base64
}