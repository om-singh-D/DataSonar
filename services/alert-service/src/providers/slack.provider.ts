import axios from 'axios';

import { AlertPayload } from '../schemas/alert.schema';
import { NotificationProvider } from './provider.interface';

export class SlackProvider implements NotificationProvider {
  private readonly webhookUrl?: string;

  constructor(webhookUrl?: string) {
    this.webhookUrl = webhookUrl;
  }

  async send(alert: AlertPayload): Promise<boolean> {
    if (!this.webhookUrl) {
      return false;
    }

    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `DataSonar Alert: ${alert.severity.toUpperCase()}`,
        },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Source:* ${alert.source_id}` },
          { type: 'mrkdwn', text: `*Pipeline:* ${alert.pipeline_id}` },
          { type: 'mrkdwn', text: `*Anomalies:* ${alert.anomaly_types.join(', ')}` },
          { type: 'mrkdwn', text: `*Quality:* ${alert.quality_score}` },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Summary:* ${alert.summary}`,
        },
      },
    ];

    await axios.post(this.webhookUrl, { blocks });
    return true;
  }
}
