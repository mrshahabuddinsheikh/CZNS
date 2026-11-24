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
        founder_name: settings.founder_name || 'Sherry',
        founder_title: settings.founder_title || 'Founder & CEO, CZNS',
        founder_image_url: settings.founder_image_url || '/founder.jpg',
        founder_whatsapp: settings.founder_whatsapp || '923001234567',
        founder_badge_text: settings.founder_badge_text || 'Founder Verified',
        primary_color: settings.primary_color || '#10b981',
        primary_hover: settings.primary_hover || '#059669',
        accent_preset: settings.accent_preset || 'emerald',
        primary_font: settings.primary_font || 'Inter',
        secondary_font: settings.secondary_font || 'Plus Jakarta Sans',
      },
    };
  });

  // Update Theme Color, Preset & Fonts
  fastify.put<{
    Body: {
      primary_color?: string;
      primary_hover?: string;
      accent_preset?: string;
      primary_font?: string;
      secondary_font?: string;
    };
  }>('/api/v1/settings/theme', async (request) => {
    const { primary_color, primary_hover, accent_preset, primary_font, secondary_font } = request.body || {};

    const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    if (primary_color) stmt.run('primary_color', primary_color);
    if (primary_hover) stmt.run('primary_hover', primary_hover);
    if (accent_preset) stmt.run('accent_preset', accent_preset);
    if (primary_font) stmt.run('primary_font', primary_font);
    if (secondary_font) stmt.run('secondary_font', secondary_font);

    return {
      success: true,
      message: 'Theme settings updated successfully',
      primary_color,
      primary_hover: primary_hover || primary_color,
      accent_preset: accent_preset || 'custom',
      primary_font,
      secondary_font,
    };
  });
}
