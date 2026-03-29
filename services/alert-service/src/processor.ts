import { NotificationProvider } from './providers/provider.interface';
import { alertSchema, AlertPayload } from './schemas/alert.schema';
import { DedupService } from './services/dedup.service';

export type ProcessResult = {
  ok: boolean;
  requeue: boolean;
  reason?: string;
};

export class MessageProcessor {
  private readonly dedupService: DedupService;
  private readonly providerResolver: (payload: AlertPayload) => NotificationProvider[];

  constructor(
    dedupService: DedupService,
    providerResolver: (payload: AlertPayload) => NotificationProvider[],
  ) {
    this.dedupService = dedupService;
    this.providerResolver = providerResolver;
  }

  async processRaw(payload: unknown): Promise<ProcessResult> {
    const parsed = alertSchema.safeParse(payload);
    if (!parsed.success) {
      return { ok: false, requeue: false, reason: 'invalid_schema' };
    }

    const alert = parsed.data;
    const dedup = await this.dedupService.shouldSend(alert);
    if (!dedup.allow) {
      return { ok: true, requeue: false, reason: 'deduplicated' };
    }

    const providers = this.providerResolver(alert);
    if (providers.length === 0) {
      return { ok: false, requeue: false, reason: 'no_providers' };
    }

    try {
      const responses = await Promise.all(providers.map((provider) => provider.send(alert)));
      const anySent = responses.some((sent) => sent);
      if (!anySent) {
        return { ok: false, requeue: false, reason: 'no_provider_active' };
      }
      return { ok: true, requeue: false };
    } catch {
      return { ok: false, requeue: true, reason: 'provider_error' };
    }
  }
}
