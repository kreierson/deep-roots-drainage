import { Resend } from "resend";

export const config = { runtime: "edge" };

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const normalize = (value) => String(value || "").trim();
const LOGO_URL = "https://deeprootsdrainage.com/images/logo-footer.png";
const requiredEnv = ["RESEND_API_KEY", "CONTACT_TO_EMAIL", "FROM_EMAIL"];

function getMissingEnv() {
  return requiredEnv.filter((key) => !process.env[key]);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export default async function handler(req) {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const missingEnv = getMissingEnv();
  if (missingEnv.length) {
    console.error("Missing contact env vars:", missingEnv);
    return json({ error: "Form not configured" }, 500);
  }

  try {
    const formData = await req.formData();

    const honeypot = normalize(formData.get("company_website"));
    if (honeypot) return json({ success: true });

    const loadedAt = parseInt(normalize(formData.get("_loaded")) || "0", 10);
    if (loadedAt && Date.now() - loadedAt < 3000) return json({ success: true });

    const name = normalize(formData.get("name"));
    const phone = normalize(formData.get("phone"));
    const email = normalize(formData.get("email"));
    const service = normalize(formData.get("service"));
    const location = normalize(formData.get("location"));
    const acres = normalize(formData.get("acres"));
    const message = normalize(formData.get("message"));

    if (!name || !phone) return json({ error: "Missing required fields" }, 400);

    const resend = new Resend(process.env.RESEND_API_KEY);
    const replyTo = email || undefined;

    await resend.emails.send({
      from: `Deep Roots Drainage <${process.env.FROM_EMAIL}>`,
      to: [process.env.CONTACT_TO_EMAIL],
      replyTo,
      subject: `New Website Lead: ${name}`,
      text: [
        `Name: ${name}`,
        `Phone: ${phone}`,
        `Email: ${email || "Not provided"}`,
        `Service: ${service || "Not provided"}`,
        `County / Area: ${location || "Not provided"}`,
        `Approx. Acres: ${acres || "Not provided"}`,
        "",
        "Project Details:",
        message || "No project details provided.",
      ].join("\n"),
      html: `
        <h2>New Website Lead</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email || "Not provided")}</p>
        <p><strong>Service:</strong> ${escapeHtml(service || "Not provided")}</p>
        <p><strong>County / Area:</strong> ${escapeHtml(location || "Not provided")}</p>
        <p><strong>Approx. Acres:</strong> ${escapeHtml(acres || "Not provided")}</p>
        <p><strong>Project Details:</strong></p>
        <p>${escapeHtml(message || "No project details provided.").replace(/\n/g, "<br>")}</p>
      `,
    });

    if (email) {
      await resend.emails.send({
        from: `Deep Roots Drainage <${process.env.FROM_EMAIL}>`,
        to: [email],
        replyTo: process.env.CONTACT_TO_EMAIL,
        subject: "We got your request - Deep Roots Drainage",
        text: [
          `Hi ${name},`,
          "",
          "Thanks for reaching out to Deep Roots Drainage.",
          "We got your request and will follow up within 24 hours.",
          "",
          "If you need anything sooner, reply to this email or call us directly.",
          "",
          "Deep Roots Drainage",
        ].join("\n"),
        html: `
          <div style="background:#f8fafc;padding:32px 16px;font-family:Inter,Arial,sans-serif;color:#111827;">
            <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;padding:32px 24px;text-align:left;">
              <div style="text-align:center;margin-bottom:24px;">
                <img src="${LOGO_URL}" alt="Deep Roots Drainage" style="max-width:220px;width:100%;height:auto;display:inline-block;" />
              </div>
              <p>Hi ${escapeHtml(name)},</p>
              <p>Thanks for reaching out to Deep Roots Drainage.</p>
              <p>We got your request and will follow up within 24 hours.</p>
              <p>If you need anything sooner, reply to this email or call us directly.</p>
              <p style="margin-top:24px;"><strong>Deep Roots Drainage</strong></p>
            </div>
          </div>
        `,
      });
    }

    return json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return json({ error: "Internal server error" }, 500);
  }
}
