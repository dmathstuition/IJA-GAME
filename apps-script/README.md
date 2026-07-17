# Qizora mailer (Google Apps Script)

Sends transactional emails from your own Gmail — no email provider or API key needed.

- **welcome** — login / sign-up affirmation when a school is created
- **receipt** — payment receipt after a PayPal activation

## Deploy

1. Open <https://script.google.com> → **New project**. Paste `Code.gs`.
2. **Project Settings → Script properties → Add**: `APP_SECRET` = a long random string.
3. **Deploy → New deployment → Web app**
   - *Execute as:* **Me**
   - *Who has access:* **Anyone**
   - Copy the **`…/exec`** URL.
4. Run `doPost` once from the editor and approve the Gmail permission prompt.

## Connect the app (Vercel → Settings → Environment Variables)

| Variable | Value |
|---|---|
| `APPS_SCRIPT_WEBHOOK_URL` | the `…/exec` URL from step 3 |
| `APPS_SCRIPT_SECRET` | the same `APP_SECRET` string |

That's it. If these vars are unset the app runs normally and simply sends no email
(`notify()` is a no-op), so nothing breaks before you finish setup.

## Test

```bash
curl -sX POST "$APPS_SCRIPT_WEBHOOK_URL" -H 'Content-Type: application/json' \
  -d '{"secret":"YOUR_SECRET","type":"welcome","to":"you@example.com","school":"Test School"}'
```
