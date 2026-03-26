export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const formData = await req.formData();

    const firstName = formData.get("first_name");
    const lastName = formData.get("last_name");
    const email = formData.get("email");
    const phone = formData.get("phone");
    const position = formData.get("position");
    const message = formData.get("message") || "No message provided";
    const resume = formData.get("resume");

    if (!firstName || !lastName || !email || !phone || !position || !resume) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate file size (5MB)
    if (resume.size > 5 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: "Resume must be under 5MB" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // TODO: Wire up email service (e.g. Resend, SendGrid, Postmark)
    // Send to: careers@deeprootsdrainage.com
    // Include resume as attachment
    //
    // Example with Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // const resumeBuffer = await resume.arrayBuffer();
    // await resend.emails.send({
    //   from: 'Deep Roots Drainage <noreply@deeprootsdrainage.com>',
    //   to: 'careers@deeprootsdrainage.com',
    //   subject: `New Application: ${position} — ${firstName} ${lastName}`,
    //   html: `...`,
    //   attachments: [{ filename: resume.name, content: Buffer.from(resumeBuffer) }],
    // });

    console.log("Application received:", {
      name: `${firstName} ${lastName}`,
      email,
      phone,
      position,
      resumeName: resume.name,
      resumeSize: resume.size,
      message,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Application error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
