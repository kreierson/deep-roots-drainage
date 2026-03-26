export const config = { runtime: "edge" };

export default function handler(req) {
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  const url = new URL(req.url);
  const siteUrl = `${url.protocol}//${url.host}`;

  const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${siteUrl}/api/auth/callback&scope=repo,user`;

  return Response.redirect(authUrl, 302);
}
