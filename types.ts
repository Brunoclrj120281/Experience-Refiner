export enum Mode {
  SINGLE = 'SINGLE',
  BATCH = 'BATCH'
}

export interface AuditItem {
  change: string;
  reason: string;
  factualConfirmation: string;
}

export interface RefinedData {
  headline: string;
  openingParagraph: string;
  whatToExpect: string;
  highlights: string[];
  importantInfo: string;
  idealFor: string;
  seoKeywords: string[];
  hasMissingOperationalInfo: boolean;
  auditTrail: AuditItem[];
}

export interface BatchItem {
  id: string;
  originalText: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: RefinedData;
  errorMsg?: string;
}

export interface GroundingResult {
  source: 'maps' | 'search';
  data: string;
  uris?: { uri: string; title: string }[];
}
