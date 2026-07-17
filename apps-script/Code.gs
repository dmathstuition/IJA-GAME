/**
 * Qizora mailer — Google Apps Script web app.
 *
 * Receives JSON POSTs from the Qizora app and sends emails from your Gmail:
 *   • type "welcome"  → login/sign-up affirmation to a new school
 *   • type "receipt"  → payment receipt after a PayPal activation
 *
 * SETUP
 * 1. Go to https://script.google.com → New project, paste this file.
 * 2. Set a shared secret: Project Settings → Script properties →
 *    add  APP_SECRET = <a long random string>.
 * 3. Deploy → New deployment → type "Web app":
 *      Execute as: Me      Who has access: Anyone
 *    Copy the /exec URL.
 * 4. In Vercel set:
 *      APPS_SCRIPT_WEBHOOK_URL = <that /exec URL>
 *      APPS_SCRIPT_SECRET      = <the same secret>
 * 5. Run doPost once from the editor to grant the Gmail send permission.
 */

var FROM_NAME = 'Qizora';

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents || '{}');
    var expected = PropertiesService.getScriptProperties().getProperty('APP_SECRET') || '';
    if (!expected || body.secret !== expected) {
      return json_({ ok: false, error: 'unauthorized' });
    }
    if (!body.to) return json_({ ok: false, error: 'missing recipient' });

    if (body.type === 'welcome') sendWelcome_(body);
    else if (body.type === 'receipt') sendReceipt_(body);
    else return json_({ ok: false, error: 'unknown type: ' + body.type });

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function sendWelcome_(b) {
  var school = b.school || 'your school';
  var subject = 'Welcome to Qizora 🎉';
  var html = wrap_(
    'Welcome to Qizora!',
    '<p>Your account for <b>' + esc_(school) + '</b> is ready.</p>' +
      '<p>You can now build question banks and run live quiz competitions — Standard, Team Battle, Speed and on-stage Quiz Bowl.</p>' +
      '<p><a class="btn" href="https://ija-game.vercel.app/dashboard">Open your dashboard</a></p>' +
      '<p style="color:#8b8296">Your 14-day free trial is active. When you\'re ready, a one-time payment keeps live hosting on.</p>'
  );
  MailApp.sendEmail({ to: b.to, subject: subject, htmlBody: html, name: FROM_NAME });
}

function sendReceipt_(b) {
  var amount = (b.currency || 'USD') + ' ' + (b.amount || '');
  var subject = 'Your Qizora receipt — ' + (b.plan || 'activation');
  var rows =
    row_('School', b.school || '—') +
    row_('Plan', b.plan || '—') +
    row_('Amount', amount) +
    row_('Order ID', b.orderId || '—') +
    (b.paidUntil ? row_('Active until', new Date(b.paidUntil).toDateString()) : '');
  var html = wrap_(
    'Payment received ✅',
    '<p>Thank you! Your school is now activated for live hosting.</p>' +
      '<table style="width:100%;border-collapse:collapse;margin:14px 0">' + rows + '</table>' +
      '<p><a class="btn" href="https://ija-game.vercel.app/dashboard">Go to dashboard</a></p>' +
      '<p style="color:#8b8296">Keep this email as your receipt. Questions? Reply to this message.</p>'
  );
  MailApp.sendEmail({ to: b.to, subject: subject, htmlBody: html, name: FROM_NAME });
}

function row_(k, v) {
  return (
    '<tr><td style="padding:7px 0;color:#8b8296;border-bottom:1px solid #eee">' + esc_(k) +
    '</td><td style="padding:7px 0;text-align:right;font-weight:700;border-bottom:1px solid #eee">' + esc_(v) + '</td></tr>'
  );
}

function wrap_(heading, inner) {
  return (
    '<div style="font-family:system-ui,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1a1428">' +
    '<div style="font-weight:900;font-size:20px;margin-bottom:4px">QIZ<span style="color:#FF6A00">ORA</span></div>' +
    '<div style="font-size:11px;letter-spacing:2px;color:#8b8296;margin-bottom:20px">LEARN. PRACTICE. WIN.</div>' +
    '<h1 style="font-size:22px;margin:0 0 12px">' + esc_(heading) + '</h1>' +
    inner +
    '<style>.btn{display:inline-block;background:linear-gradient(135deg,#ff7a1a,#ff2d55);color:#fff;text-decoration:none;font-weight:800;padding:11px 20px;border-radius:10px;margin:8px 0}</style>' +
    '<div style="margin-top:24px;padding-top:14px;border-top:1px solid #eee;font-size:12px;color:#8b8296">Qizora · Founded by DMaths Academy · dmathstuition@gmail.com</div>' +
    '</div>'
  );
}

function esc_(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
