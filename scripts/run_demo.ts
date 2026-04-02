declare const process: any;
declare function require(name: string): any;

const { createInterface } = require('readline');

const INGEST_URL = process.env.DEMO_INGEST_URL ?? 'http://localhost:3001/api/v1/ingest';
const INTERVAL_MS = 1500;
const MAX_EVENTS = process.env.DEMO_MAX_EVENTS ? Number(process.env.DEMO_MAX_EVENTS) : null;
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

let attackMode = ['1', 'true', 'yes', 'on'].includes(String(process.env.DEMO_ATTACK_MODE || '').toLowerCase());
let sentEvents = 0;

function buildPayload(faker: any): Record<string, unknown> {
  const payload: Record<string, any> = {
    sourceId: 'stripe-checkout-prod-us',
    sourceName: 'US Payment Gateway',
    sourceType: 'stream',
    eventType: 'incremental',
    timestamp: new Date().toISOString(),
    data: {
      schema: {
        transaction_id: 'string',
        amount: 'float',
        status: 'string',
      },
      records: [
        {
          transaction_id: faker.string.uuid(),
          user_name: faker.person.fullName(),
          amount: Number(faker.finance.amount({ min: 10, max: 2000, dec: 2 })),
          status: faker.helpers.arrayElement(['COMPLETED', 'PENDING']),
        },
      ],
      recordCount: 1,
    },
    metadata: {
      pipeline: 'payments-realtime',
      environment: 'production',
    },
  };

  if (!attackMode) {
    return payload;
  }

  // Intentionally break multiple fields to trigger schema validation errors.
  const badPayload = { ...payload };
  delete badPayload.sourceId;
  badPayload.sourceType = 'magic';
  badPayload.timestamp = 'yesterday';

  const data = { ...(badPayload.data as Record<string, any>) };
  data.recordCount = -5;
  badPayload.data = data;

  return badPayload;
}

async function postPayload(axios: any, payload: Record<string, unknown>): Promise<void> {
  try {
    const response = await axios.post(INGEST_URL, payload, {
      timeout: 35000,
      validateStatus: () => true,
    });

    const amount = (payload as any)?.data?.records?.[0]?.amount;
    const tag = attackMode ? 'ATTACK' : 'HEALTHY';

    if (response.status === 202) {
      console.log(`${GREEN}✅ [202 ACCEPTED]${RESET} [${tag}] Order processed for $${amount}`);
      return;
    }

    if (response.status === 400) {
      const errors = Array.isArray(response.data?.errors)
        ? response.data.errors.map((e: any) => `${e.field}: ${e.message}`).join('; ')
        : 'Validation failed';
      console.log(`${RED}🚨 [400 REJECTED]${RESET} [${tag}] ${errors}. Sent to Dead Letter Queue.`);
      return;
    }

    console.log(`${YELLOW}⚠ [${response.status}]${RESET} [${tag}] ${JSON.stringify(response.data)}`);
  } catch (error: any) {
    const message = error?.message || 'Request failed';
    console.error(`${RED}Network error:${RESET} ${message}`);
  }
}

function setupKeyboard(): void {
  if (!process.stdin || !process.stdin.isTTY) {
    console.log('Non-interactive terminal detected. Keyboard toggle disabled.');
    return;
  }

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }

  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  process.stdin.on('data', (key: string) => {
    if (key === ' ') {
      attackMode = !attackMode;
      console.log(`\nSwitched mode -> ${attackMode ? 'ATTACK (sending malformed events)' : 'HEALTHY (sending valid events)'}`);
      return;
    }

    if (key === 'q' || key === 'Q' || key === '\u0003') {
      console.log('\nStopping demo emitter...');
      rl.close();
      process.exit(0);
    }
  });
}

function printBanner(): void {
  console.log(`${CYAN}DataSonar Expo Demo Emitter${RESET}`);
  console.log(`Target endpoint: ${INGEST_URL}`);
  console.log(`Interval: ${INTERVAL_MS}ms`);
  if (MAX_EVENTS !== null && !Number.isNaN(MAX_EVENTS)) {
    console.log(`Auto-stop after: ${MAX_EVENTS} events`);
  }
  console.log(`Initial mode: ${attackMode ? 'ATTACK' : 'HEALTHY'}`);
  console.log('Controls: [Space] toggle attack mode, [Q] quit');
}

async function main(): Promise<void> {
  const { faker } = await import('@faker-js/faker');
  const axios = (await import('axios')).default;

  printBanner();
  setupKeyboard();

  setInterval(async () => {
    const payload = buildPayload(faker);
    await postPayload(axios, payload);
    sentEvents += 1;

    if (MAX_EVENTS !== null && !Number.isNaN(MAX_EVENTS) && sentEvents >= MAX_EVENTS) {
      console.log(`${CYAN}Reached DEMO_MAX_EVENTS=${MAX_EVENTS}. Exiting.${RESET}`);
      process.exit(0);
    }
  }, INTERVAL_MS);
}

main().catch((error) => {
  console.error('Demo emitter failed to start:', error);
  process.exit(1);
});
