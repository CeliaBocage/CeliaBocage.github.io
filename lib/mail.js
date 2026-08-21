/**
 * Envoi des emails du formulaire de contact.
 *
 * Resend est appelé via son API HTTPS, pas par son SDK ni en SMTP : un simple
 * fetch, aucune dépendance à installer, et ça fonctionne tel quel sur le
 * runtime serverless de Vercel, où une socket SMTP longue durée ne tient pas.
 *
 * Le système est volontairement "prêt mais éteint" : sans RESEND_API_KEY, le
 * message est quand même enregistré en base et visible dans l'espace admin, et
 * la visiteuse ou le visiteur reçoit bien la confirmation d'envoi. Rien n'est
 * perdu tant que la partie email n'est pas configurée.
 */

const SITE_NAME = 'Portfolio Célia Bocage';

export function mailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.CONTACT_TO_EMAIL);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderEmail(message, id) {
  const lines = [
    ['Nom', message.nom],
    ['Email', message.email],
    ['Sujet', message.sujet || 'aucun'],
    ['Session', message.session_code || 'inconnue'],
  ];

  const subject = `[Portfolio] ${message.sujet ? message.sujet : 'Nouveau message'} de ${message.nom}`;

  const text = [
    ...lines.map(([label, value]) => `${label} : ${value}`),
    '',
    message.message,
    '',
    `Message n°${id} envoyé depuis le formulaire de contact du portfolio.`,
  ].join('\n');

  const html = `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#0b2845">
  <h2 style="margin:0 0 16px;font-size:18px">Nouveau message depuis le portfolio</h2>
  <table style="border-collapse:collapse;margin-bottom:20px">
    ${lines
      .map(
        ([label, value]) =>
          `<tr><td style="padding:4px 16px 4px 0;color:#4a6a88">${label}</td><td style="padding:4px 0;font-weight:600">${escapeHtml(value)}</td></tr>`,
      )
      .join('')}
  </table>
  <div style="padding:16px;background:#eef4fa;border-radius:10px;white-space:pre-wrap">${escapeHtml(message.message)}</div>
  <p style="margin-top:20px;color:#4a6a88;font-size:13px">Message n°${id}. Répondre directement à ${escapeHtml(message.email)}.</p>
</div>`;

  return { subject, html, text };
}

async function deliver(payload) {
  if (!mailConfigured()) {
    return { status: 'disabled', error: null };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // MAIL_FROM doit être un domaine vérifié dans Resend. L'adresse de la
        // personne qui écrit part en reply_to, pour pouvoir répondre depuis la
        // boîte mail sans recopier l'adresse.
        from: process.env.MAIL_FROM || `${SITE_NAME} <onboarding@resend.dev>`,
        to: [process.env.CONTACT_TO_EMAIL],
        ...payload,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      return { status: 'failed', error: `${response.status} ${body.slice(0, 300)}` };
    }
    return { status: 'sent', error: null };
  } catch (error) {
    return { status: 'failed', error: error instanceof Error ? error.message : String(error) };
  }
}

export async function sendMessageEmail(message, id) {
  const { subject, html, text } = renderEmail(message, id);
  return deliver({ reply_to: message.email, subject, html, text });
}

/**
 * Le bouton "vérifier le câblage" de l'admin : prouve que la clé API,
 * l'expéditeur et l'adresse de destination fonctionnent vraiment, sans
 * attendre un vrai message.
 */
export async function sendTestEmail() {
  const text = [
    "Si vous lisez ceci, l'envoi d'emails du portfolio fonctionne.",
    '',
    'Les prochains messages envoyés depuis le formulaire de contact arriveront ici, et vous pourrez y répondre directement.',
  ].join('\n');

  return deliver({
    subject: '[Portfolio] Email de test : tout fonctionne',
    text,
    html: `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#0b2845">
  <h2 style="margin:0 0 16px;font-size:18px">Tout fonctionne ✔</h2>
  <p>Si vous lisez ceci, l'envoi d'emails du portfolio fonctionne.</p>
  <p>Les prochains messages envoyés depuis le formulaire de contact arriveront ici, et vous pourrez y répondre directement.</p>
</div>`,
  });
}
