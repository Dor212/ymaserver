import nodemailer from "nodemailer";

const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM } =
  process.env;

const port = Number(EMAIL_PORT) || 587;

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port,
  secure: port === 465,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 20000,
});

export async function sendReferenceEmails({ request, clients }) {
  if (!clients || !clients.length) return;

  await transporter.verify();

  const fromAddress = EMAIL_FROM || `"Y.M.A – אתרים מותאמים" <${EMAIL_USER}>`;
  const { name, phone, email, message, projectType } = request;

  const projectTypeLabel =
    projectType === "landing"
      ? "דף נחיתה"
      : projectType === "business"
      ? "אתר תדמית"
      : projectType === "shop"
      ? "חנות אונליין"
      : "פרויקט כללי";

  const subject = "מתעניין חדש רוצה לשמוע על Y.M.A – בא לך לשתף?";

  const textBody = `
היי,

יש מתעניין חדש שהשאיר פרטים באתר של Y.M.A ורוצה לשמוע איך הייתה החוויה שלך בעבודה איתם.

פרטי המתעניין:
שם: ${name}
טלפון: ${phone}
מייל: ${email}
סוג פרויקט משוער: ${projectTypeLabel}

הודעה שהשאיר:
"${message}"

אם יש לך זמן, נשמח אם תחזור אליו בכנות ותשתף מהחוויה שלך.
אין שום חובה – רק אם מתאים לך.

תודה רבה!
Y.M.A – אתרים מותאמים
  `.trim();

  const htmlBody = `
    <p>היי,</p>
    <p>יש מתעניין חדש שהשאיר פרטים באתר של <strong>Y.M.A</strong> ורוצה לשמוע איך הייתה החוויה שלך בעבודה איתנו.</p>
    <p><strong>פרטי המתעניין:</strong><br/>
    שם: ${name}<br/>
    טלפון: ${phone}<br/>
    מייל: <a href="mailto:${email}">${email}</a><br/>
    סוג פרויקט משוער: ${projectTypeLabel}</p>
    <p><strong>הודעה שהשאיר:</strong><br/>
    "${message}"</p>
    <p>אם יש לך זמן, נשמח אם תחזור אליו בכנות ותשתף מהחוויה שלך.<br/>
    <em>אין שום חובה – רק אם מתאים לך.</em></p>
    <p>תודה רבה!<br/>
    <strong>Y.M.A – אתרים מותאמים</strong></p>
  `;

  await Promise.all(
    clients.map((client) =>
      transporter.sendMail({
        from: fromAddress,
        to: client.email,
        subject,
        text: textBody,
        html: htmlBody,
      })
    )
  );
}
