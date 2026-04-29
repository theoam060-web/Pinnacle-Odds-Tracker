// Stripe client — uses the Replit Stripe connector integration.
// WARNING: Never cache this client — tokens expire.
import Stripe from 'stripe';

async function getCredentials(): Promise<{ publishableKey: string; secretKey: string }> {
  // Prefer explicit env vars (production secrets) when set
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  if (secretKey && publishableKey) {
    return { secretKey, publishableKey };
  }

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? 'depl ' + process.env.WEB_REPL_RENEWAL
      : null;

  if (!hostname || !xReplitToken) {
    throw new Error('No Stripe credentials available. Set STRIPE_SECRET_KEY + STRIPE_PUBLISHABLE_KEY, or configure the Replit Stripe connector.');
  }

  const isProduction = process.env.REPLIT_DEPLOYMENT === '1';
  const targetEnvironment = isProduction ? 'production' : 'development';

  const url = new URL(`https://${hostname}/api/v2/connection`);
  url.searchParams.set('include_secrets', 'true');
  url.searchParams.set('connector_names', 'stripe');
  url.searchParams.set('environment', targetEnvironment);

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      'X-Replit-Token': xReplitToken,
    },
  });

  const data = await response.json();
  const item = data.items?.[0];

  if (!item || !item.settings?.publishable || !item.settings?.secret) {
    // Try development fallback when in production and no prod connection found
    if (isProduction) {
      const devUrl = new URL(`https://${hostname}/api/v2/connection`);
      devUrl.searchParams.set('include_secrets', 'true');
      devUrl.searchParams.set('connector_names', 'stripe');
      devUrl.searchParams.set('environment', 'development');
      const devResponse = await fetch(devUrl.toString(), {
        headers: { Accept: 'application/json', 'X-Replit-Token': xReplitToken },
      });
      const devData = await devResponse.json();
      const devItem = devData.items?.[0];
      if (devItem?.settings?.publishable && devItem?.settings?.secret) {
        return { publishableKey: devItem.settings.publishable, secretKey: devItem.settings.secret };
      }
    }
    throw new Error(`Stripe ${targetEnvironment} connection not found`);
  }

  return { publishableKey: item.settings.publishable, secretKey: item.settings.secret };
}

export async function getUncachableStripeClient() {
  const { secretKey } = await getCredentials();
  return new Stripe(secretKey, { apiVersion: '2025-08-27.basil' as any });
}

export async function getStripePublishableKey() {
  const { publishableKey } = await getCredentials();
  return publishableKey;
}

export async function getStripeSecretKey() {
  const { secretKey } = await getCredentials();
  return secretKey;
}

let stripeSync: any = null;

export async function getStripeSync() {
  if (!stripeSync) {
    const { StripeSync } = await import('stripe-replit-sync');
    const secretKey = await getStripeSecretKey();
    stripeSync = new StripeSync({
      poolConfig: { connectionString: process.env.DATABASE_URL!, max: 2 },
      stripeSecretKey: secretKey,
    });
  }
  return stripeSync;
}
