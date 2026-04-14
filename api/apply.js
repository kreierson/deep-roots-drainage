import { Resend } from "resend";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const normalize = (value) => String(value || "").trim();
const LOGO_URL = "https://deeprootsdrainage.com/images/logo-footer.png";
const requiredEnv = ["RESEND_API_KEY", "CAREERS_TO_EMAIL", "FROM_EMAIL"];

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
    console.error("Missing careers env vars:", missingEnv);
    return json({ error: "Form not configured" }, 500);
  }

  try {
    const formData = await req.formData();

    const honeypot = normalize(formData.get("website_url"));
    if (honeypot) return json({ success: true });

    const loadedAt = parseInt(normalize(formData.get("_loaded")) || "0", 10);
    if (loadedAt && Date.now() - loadedAt < 3000) return json({ success: true });

    const firstName = normalize(formData.get("first_name"));
    const lastName = normalize(formData.get("last_name"));
    const email = normalize(formData.get("email"));
    const phone = normalize(formData.get("phone"));
    const position = normalize(formData.get("position"));
    const message = normalize(formData.get("message")) || "No message provided";
    const resume = formData.get("resume");

    if (!firstName || !lastName || !email || !phone || !position || !(resume instanceof File)) {
      return json({ error: "Missing required fields" }, 400);
    }

    if (resume.size > 5 * 1024 * 1024) {
      return json({ error: "Resume must be under 5MB" }, 400);
    }

    const buffer = Buffer.from(await resume.arrayBuffer());
    const resend = new Resend(process.env.RESEND_API_KEY);
    const fullName = `${firstName} ${lastName}`;

    await resend.emails.send({
      from: `Deep Roots Drainage <${process.env.FROM_EMAIL}>`,
      to: [process.env.CAREERS_TO_EMAIL],
      replyTo: email,
      subject: `New Career Application: ${position} - ${fullName}`,
      text: [
        `Name: ${fullName}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        `Position: ${position}`,
        "",
        "Cover Letter / Message:",
        message,
      ].join("\n"),
      html: `
        <h2>New Career Application</h2>
        <p><strong>Name:</strong> ${escapeHtml(fullName)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
        <p><strong>Position:</strong> ${escapeHtml(position)}</p>
        <p><strong>Cover Letter / Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
      `,
      attachments: [
        {
          filename: resume.name,
          content: buffer.toString("base64"),
        },
      ],
    });

    await resend.emails.send({
      from: `Deep Roots Drainage <${process.env.FROM_EMAIL}>`,
      to: [email],
      replyTo: process.env.CAREERS_TO_EMAIL,
      subject: "We received your application - Deep Roots Drainage",
      text: [
        `Hi ${fullName},`,
        "",
        `Thanks for applying${position ? ` for the ${position} position` : ""} with Deep Roots Drainage.`,
        "We received your application and will review it soon.",
        "",
        "If you need to add anything, reply to this email and our team will get it.",
        "",
        "Deep Roots Drainage",
      ].join("\n"),
      html: `
        <div style="background:#f8fafc;padding:32px 16px;font-family:Inter,Arial,sans-serif;color:#111827;">
          <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;padding:32px 24px;text-align:left;">
            <div style="text-align:center;margin-bottom:24px;">
              <img src="${LOGO_URL}" alt="Deep Roots Drainage" style="max-width:220px;width:100%;height:auto;display:inline-block;" />
            </div>
            <p>Hi ${escapeHtml(fullName)},</p>
            <p>Thanks for applying${position ? ` for the <strong>${escapeHtml(position)}</strong> position` : ""} with Deep Roots Drainage.</p>
            <p>We received your application and will review it soon.</p>
            <p>If you need to add anything, reply to this email and our team will get it.</p>
            <p style="margin-top:24px;"><strong>Deep Roots Drainage</strong></p>
          </div>
        </div>
      `,
    });

    return json({ success: true });
  } catch (error) {
    console.error("Application error:", error);
    return json({ error: "Internal server error" }, 500);
  }
}
