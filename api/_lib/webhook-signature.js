import { createHmac, timingSafeEqual } from 'node:crypto';

export function validateWebhookSignature(req, secret) {
    if (!secret) {
        return true;
    }

    const header = req?.headers?.['x-signature'] || req?.headers?.['X-Signature'] || '';
    if (!header || typeof header !== 'string') {
        return false;
    }

    const parts = header.split(',').reduce((acc, item) => {
        const [key, value] = item.split('=');
        if (key && value) {
            acc[key.trim()] = value.trim();
        }
        return acc;
    }, {});

    const timestamp = parts.ts;
    const version = parts.v1;
    const payload = typeof req?.body === 'string' ? req.body : JSON.stringify(req?.body || {});

    if (!timestamp || !version || !payload) {
        return false;
    }

    const expected = createHmac('sha256', secret).update(`${timestamp}.${payload}`).digest('hex');
    const actual = version;

    const expectedBuffer = Buffer.from(expected, 'hex');
    const actualBuffer = Buffer.from(actual, 'hex');

    if (expectedBuffer.length !== actualBuffer.length) {
        return false;
    }

    return timingSafeEqual(expectedBuffer, actualBuffer);
}
