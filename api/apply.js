import { Resend } from "resend";
import formidable from "formidable";
import fs from "node:fs/promises";

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

function parseForm(req) {
  const form = formidable({ multiples: false, maxFileSize: 5 * 1024 * 1024 });
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

function fileValue(files, key) {
  const value = files[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, { error: "Method not allowed" }, 405);

  const missingEnv = getMissingEnv();
  if (missingEnv.length) {
    console.error("Missing careers env vars:", missingEnv);
    return json(res, { error: "Form not configured" }, 500);
  }

  try {
    const { fields, files } = await parseForm(req);

    const honeypot = normalize(fieldValue(fields, "website_url"));
    if (honeypot) return json(res, { success: true });

    const loadedAt = parseInt(normalize(fieldValue(fields, "_loaded")) || "0", 10);
    if (loadedAt && Date.now() - loadedAt < 3000) return json(res, { success: true });

    const firstName = normalize(fieldValue(fields, "first_name"));
    const lastName = normalize(fieldValue(fields, "last_name"));
    const email = normalize(fieldValue(fields, "email"));
    const phone = normalize(fieldValue(fields, "phone"));
    const position = normalize(fieldValue(fields, "position"));
    const message = normalize(fieldValue(fields, "message")) || "No message provided";
    const resume = fileValue(files, "resume");

    if (!firstName || !lastName || !email || !phone || !position || !resume) {
      return json(res, { error: "Missing required fields" }, 400);
    }

    if (resume.size > 5 * 1024 * 1024) {
      return json(res, { error: "Resume must be under 5MB" }, 400);
    }

    const buffer = await fs.readFile(resume.filepath);
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
        <div style="background:#f8fafc;padding:32px 16px;font-family:Inter,Arial,sans-serif;color:#111827;">
          <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;padding:32px 24px;text-align:left;">
            <div style="text-align:center;margin-bottom:24px;">
              <img src="${LOGO_URL}" alt="Deep Roots Drainage" style="max-width:220px;width:100%;height:auto;display:inline-block;" />
            </div>
            <h2 style="margin:0 0 20px;font-size:24px;line-height:1.2;">New Career Application</h2>
            <p><strong>Name:</strong> ${escapeHtml(fullName)}</p>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
            <p><strong>Position:</strong> ${escapeHtml(position)}</p>
            <p><strong>Cover Letter / Message:</strong></p>
            <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: resume.originalFilename || "resume",
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

    return json(res, { success: true });
  } catch (error) {
    console.error("Application error:", error);
    return json(res, { error: "Internal server error" }, 500);
  }
}
