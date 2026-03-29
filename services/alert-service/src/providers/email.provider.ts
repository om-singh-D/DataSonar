import nodemailer from 'nodemailer';

import { AlertPayload } from '../schemas/alert.schema';
import { NotificationProvider } from './provider.interface';

export class EmailProvider implements NotificationProvider {
  private readonly smtpConnString?: string;
  private readonly to: string;
  private readonly from: string;

  constructor(params: { smtpConnString?: string; to?: string; from?: string }) {
    this.smtpConnString = params.smtpConnString;
    this.to = params.to ?? 'alerts@datasonar.local';
    this.from = params.from ?? 'no-reply@datasonar.local';
  }

  async send(alert: AlertPayload): Promise<boolean> {
    if (!this.smtpConnString) {
      return false;
    }

    const transporter = nodemailer.createTransport(this.smtpConnString);
    const html = `
      <h2>DataSonar Anomaly Alert (${alert.severity})</h2>
      <p><strong>Source:</strong> ${alert.source_id}</p>
      <p><strong>Pipeline:</strong> ${alert.pipeline_id}</p>
      <p><strong>Anomaly Types:</strong> ${alert.anomaly_types.join(', ')}</p>
      <p><strong>Summary:</strong> ${alert.summary}</p>
      <p><strong>Quality Score:</strong> ${alert.quality_score}</p>
      <p><strong>Record Count:</strong> ${alert.record_count}</p>
    `;

    await transporter.sendMail({
      from: this.from,
      to: this.to,
      subject: `[DataSonar] ${alert.severity.toUpperCase()} anomaly detected`,
      html,
    });

    return true;
  }
}
