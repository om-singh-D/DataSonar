import { AlertPayload } from '../schemas/alert.schema';

export interface NotificationProvider {
  send(alert: AlertPayload): Promise<boolean>;
}
