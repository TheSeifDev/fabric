export type ReportType = 'Inventory' | 'Production' | 'Alerts' | 'Activity';
export type ReportFormat = 'PDF' | 'CSV' | 'Excel';

export interface ReportTemplate {
  id: string;
  title: string;
  description: string;
  type: ReportType;
  iconName: string; // We'll map string names to icons in the component
  color: 'blue' | 'green' | 'orange' | 'purple';
}

export interface ReportLog {
  id: string;
  name: string;
  type: ReportType;
  generatedBy: string;
  date: string;
  size: string;
  format: ReportFormat;
  status: 'Ready' | 'Processing' | 'Failed';
}