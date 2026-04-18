// Stripe client — connected via Replit Stripe integration
import Stripe from 'stripe';

let connectionSettings: any;

async function fetchConnection(hostname: string, xReplitToken: string, environment: string) {
  const url = new URL(`https://${hostname}/api/v2/connection`);
  url.searchParams.set('include_secrets', 'true');
  url.searchParams.set('connector_names', 'stripe');
  url.searchParams.set('environment', environment);

  const response = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json',
      'X-Replit-Token': xReplitToken,
    },
  });

  const data = await response.json();
  const item = data.items?.[0];
  if (item?.settings?.publishable && item?.settings?.secret) {
    return item;
  }
  return null;
}

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? 'depl ' + process.env.WEB_REPL_RENEWAL
      : null;

  if (!xReplitToken) {
    throw new Error('X-Replit-Token not found for repl/depl');
  }

  const isProduction = process.env.REPLIT_DEPLOYMENT === '1';

  // Try the target environment first, then fall back to 'development'
  const envOrder = isProduction
    ? ['production', 'development']
    : ['development'];

  for (const env of envOrder) {
    const item = await fetchConnection(hostname!, xReplitToken, env);
    if (item) {
      connectionSettings = item;
      return {
        publishableKey: connectionSettings.settings.publishable as string,
        secretKey: connectionSettings.settings.secret as string,
      };
    }
  }

  throw new Error('Stripe connection not found (tried: ' + envOrder.join(', ') + ')');
}

// WARNING: Never cache this client — always call to get a fresh one
export async function getUncachableStripeClient() {
  const { secretKey } = await getCredentials();
  return new Stripe(secretKey, {
    apiVersion: '2026-03-25.dahlia' as any,
  });
}

export async function getStripePublishableKey() {
  const { publishableKey } = await getCredentials();
  return publishableKey;
}

export async function getStripeSecretKey() {
  const { secretKey } = await getCredentials();
  return secretKey;
}

// StripeSync singleton for webhook processing and data sync
let stripeSync: any = null;

export async function getStripeSync() {
  if (!stripeSync) {
    const { StripeSync } = await import('stripe-replit-sync');
    const secretKey = await getStripeSecretKey();
    stripeSync = new StripeSync({
      poolConfig: {
        connectionString: process.env.DATABASE_URL!,
        max: 2,
      },
      stripeSecretKey: secretKey,
    });
  }
  return stripeSync;
}
