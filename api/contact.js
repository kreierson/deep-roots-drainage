import { Resend } from "resend";
import formidable from "formidable";

export const config = {
  api: {
    bodyParser: false,
  },
};

const json = (res, body, status = 200) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
};

const normalize = (value) => String(value || "").trim();
const LOGO_URL = "https://deeprootsdrainage.com/images/logo-footer-old.png";
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

function parseForm(req) {
  const form = formidable({ multiples: false });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

function fieldValue(fields, key) {
  const value = fields[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, { error: "Method not allowed" }, 405);

  const missingEnv = getMissingEnv();
  if (missingEnv.length) {
    console.error("Missing contact env vars:", missingEnv);
    return json(res, { error: "Form not configured" }, 500);
  }

  try {
    const { fields } = await parseForm(req);

    const honeypot = normalize(fieldValue(fields, "company_website"));
    if (honeypot) return json(res, { success: true });

    const loadedAt = parseInt(normalize(fieldValue(fields, "_loaded")) || "0", 10);
    if (loadedAt && Date.now() - loadedAt < 3000) return json(res, { success: true });

    const name = normalize(fieldValue(fields, "name"));
    const phone = normalize(fieldValue(fields, "phone"));
    const email = normalize(fieldValue(fields, "email"));
    const service = normalize(fieldValue(fields, "service"));
    const location = normalize(fieldValue(fields, "location"));
    const acres = normalize(fieldValue(fields, "acres"));
    const message = normalize(fieldValue(fields, "message"));

    if (!name || !phone) return json(res, { error: "Missing required fields" }, 400);

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
        <div style="background:#f8fafc;padding:32px 16px;font-family:Inter,Arial,sans-serif;color:#111827;">
          <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;padding:32px 24px;text-align:left;">
            <div style="text-align:center;margin-bottom:24px;">
              <img src="${LOGO_URL}" alt="Deep Roots Drainage" style="max-width:220px;width:100%;height:auto;display:inline-block;" />
            </div>
            <h2 style="margin:0 0 20px;font-size:24px;line-height:1.2;">New Website Lead</h2>
            <p><strong>Name:</strong> ${escapeHtml(name)}</p>
            <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
            <p><strong>Email:</strong> ${escapeHtml(email || "Not provided")}</p>
            <p><strong>Service:</strong> ${escapeHtml(service || "Not provided")}</p>
            <p><strong>County / Area:</strong> ${escapeHtml(location || "Not provided")}</p>
            <p><strong>Approx. Acres:</strong> ${escapeHtml(acres || "Not provided")}</p>
            <p><strong>Project Details:</strong></p>
            <p>${escapeHtml(message || "No project details provided.").replace(/\n/g, "<br>")}</p>
          </div>
        </div>
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

    return json(res, { success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return json(res, { error: "Internal server error" }, 500);
  }
}
