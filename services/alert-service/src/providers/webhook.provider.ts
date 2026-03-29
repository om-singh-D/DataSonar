import axios from 'axios';

import { AlertPayload } from '../schemas/alert.schema';
import { NotificationProvider } from './provider.interface';

export class WebhookProvider implements NotificationProvider {
  private readonly url?: string;

  constructor(url?: string) {
    this.url = url;
  }

  async send(alert: AlertPayload): Promise<boolean> {
    if (!this.url) {
      return false;
    }
    await axios.post(this.url, alert);
    return true;
  }
}
