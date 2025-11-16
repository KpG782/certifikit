export type EmailStatus = "pending" | "sending" | "sent" | "failed";

export interface EmailQueueItem {
  id: number;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  message: string;
  certificateImage: string;
  status: EmailStatus;
  errorMessage: string | null;
  createdAt: string;
  sentAt: string | null;
}

export interface EmailQueueFilters {
  status?: EmailStatus;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface EmailQueueStats {
  total: number;
  pending: number;
  sent: number;
  failed: number;
}