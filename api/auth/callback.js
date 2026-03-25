export default async function handler(req) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_OAUTH_CLIENT_ID,
      client_secret: process.env.GITHUB_OAUTH_CLIENT_SECRET,
      code,
    }),
  });

  const data = await response.json();
  const token = data.access_token;
  const provider = "github";

  const html = `<!DOCTYPE html>
<html>
<body>
<script>
(function() {
  function receiveMessage(e) {
    window.opener.postMessage(
      'authorization:${provider}:success:{"token":"${token}","provider":"${provider}"}',
      e.origin
    );
    window.removeEventListener("message", receiveMessage, false);
  }
  window.addEventListener("message", receiveMessage, false);
  window.opener.postMessage("authorizing:${provider}", "*");
})();
</script>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  });
}
