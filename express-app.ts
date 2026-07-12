import express from "express";

const app = express();

// API Routes
app.get("/api/auth/google/url", (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return res.status(400).json({ error: "GOOGLE_CLIENT_ID not configured" });
  }

  const redirectUri = `${req.protocol}://${req.get('host')}/auth/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent'
  });

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  res.json({ url: googleAuthUrl });
});

app.get(['/auth/callback', '/auth/callback/'], (req, res) => {
  res.send(`
    <html>
      <body style="background: #000; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif;">
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
            window.close();
          } else {
            window.location.href = '/';
          }
        </script>
        <div style="text-align: center;">
          <p style="font-weight: bold; font-size: 1.2rem;">Autenticação bem-sucedida!</p>
          <p style="color: #888;">Esta janela fechará automaticamente...</p>
        </div>
      </body>
    </html>
  `);
});

export default app;
