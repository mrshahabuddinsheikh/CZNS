import { FastifyInstance, FastifyRequest } from 'fastify';
import { db } from '../db/index.js';

export async function settingsRoutes(fastify: FastifyInstance) {
  // Public store settings
  fastify.get('/api/v1/settings', async () => {
    const rows: any[] = db.prepare('SELECT key, value FROM settings').all();
    const settings: Record<string, string> = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }

    return {
      settings: {
        karachi_only_cod: settings.karachi_only_cod === '1',
        cod_karachi_fee: parseInt(settings.cod_karachi_fee || '250', 10),
        cod_nationwide_fee: parseInt(settings.cod_nationwide_fee || '450', 10),
        online_advance_delivery_fee: parseInt(settings.online_advance_delivery_fee || '0', 10),
        jazzcash_title: settings.jazzcash_title || 'CZNS MOBILES (PVT) LTD',
        jazzcash_number: settings.jazzcash_number || '03001234567',
        easypaisa_title: settings.easypaisa_title || 'CZNS MOBILES STORE',
        easypaisa_number: settings.easypaisa_number || '03337654321',
        bank_name: settings.bank_name || 'Meezan Bank Limited',
        bank_account_title: settings.bank_account_title || 'CZNS MOBILE STORE OFFICIAL',
        bank_account_number: settings.bank_account_number || '01010102938475',
        bank_iban: settings.bank_iban || 'PK45MEZN0001010102938475',
        payoneer_email: settings.payoneer_email || 'payments@czns.pk',
        safepay_public_key: settings.safepay_public_key || '',
        whatsapp_support_number: settings.whatsapp_support_number || '923001234567',
        social_proof_enabled: settings.social_proof_enabled === '1',
        coins_reward_percent: parseInt(settings.coins_reward_percent || '2', 10),
        meta_pixel_id: settings.meta_pixel_id || '',
        tiktok_pixel_id: settings.tiktok_pixel_id || '',
        google_ads_id: settings.google_ads_id || '',
      },
    };
  });
}
