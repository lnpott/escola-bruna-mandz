import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { validateWebhookSignature } from '../api/_lib/webhook-signature.js';

function buildSignature(timestamp, payload, secret) {
    return createHmac('sha256', secret).update(`${timestamp}.${payload}`).digest('hex');
}

test('aceita assinatura válida do webhook', () => {
    const payload = JSON.stringify({ type: 'payment', data: { id: '123' } });
    const timestamp = '1712345678';
    const secret = 'webhook-secret';
    const signature = buildSignature(timestamp, payload, secret);

    const req = {
        headers: {
            'x-signature': `ts=${timestamp},v1=${signature}`,
        },
        body: payload,
    };

    assert.equal(validateWebhookSignature(req, secret), true);
});

test('rejeita assinatura inválida do webhook', () => {
    const payload = JSON.stringify({ type: 'payment', data: { id: '123' } });
    const timestamp = '1712345678';
    const secret = 'webhook-secret';

    const req = {
        headers: {
            'x-signature': `ts=${timestamp},v1=invalid-signature`,
        },
        body: payload,
    };

    assert.equal(validateWebhookSignature(req, secret), false);
});
