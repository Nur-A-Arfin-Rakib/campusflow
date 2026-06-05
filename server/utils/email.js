const nodemailer = require('nodemailer')
const logger = require('./logger')

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
  port:   parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const sendMail = async ({ to, subject, html }) => {
  if (!process.env.SMTP_USER) {
    logger.warn('Email skipped — SMTP not configured')
    return
  }
  try {
    await transporter.sendMail({
      from: `"CampusFlow" <${process.env.SMTP_USER}>`,
      to, subject, html,
    })
    logger.info(`Email sent to ${to}: ${subject}`)
  } catch (err) {
    logger.error(`Email failed to ${to}: ${err.message}`)
  }
}

// ── Email Templates ──────────────────────────────────────────────────────────

const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #f4f4f8; margin: 0; padding: 20px; }
    .card { background: #fff; border-radius: 12px; max-width: 520px; margin: 0 auto; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #6c63ff, #2dd4bf); padding: 28px 32px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 22px; letter-spacing: -0.5px; }
    .header p { color: rgba(255,255,255,0.75); margin: 4px 0 0; font-size: 13px; }
    .body { padding: 28px 32px; color: #333; line-height: 1.6; font-size: 14px; }
    .footer { background: #f8f8fc; padding: 16px 32px; text-align: center; font-size: 11px; color: #999; }
    .btn { display: inline-block; padding: 10px 24px; background: linear-gradient(135deg, #6c63ff, #8b5cf6); color: #fff; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 12px 0; font-size: 14px; }
    .alert { background: #fff3cd; border-left: 4px solid #fbbf24; padding: 12px 16px; border-radius: 4px; margin: 12px 0; font-size: 13px; }
    .conflict { background: #fee2e2; border-left: 4px solid #f87171; padding: 12px 16px; border-radius: 4px; margin: 12px 0; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 13px; }
    th { background: #f4f4f8; padding: 8px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #888; }
    td { padding: 8px 12px; border-bottom: 1px solid #f0f0f4; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>🎓 CampusFlow</h1>
      <p>Class Routine Management System</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">© ${new Date().getFullYear()} CampusFlow · This is an automated message.</div>
  </div>
</body>
</html>`

// Welcome email on registration
exports.sendWelcome = (user) => sendMail({
  to: user.email,
  subject: '🎓 Welcome to CampusFlow!',
  html: baseTemplate(`
    <p>Hi <strong>${user.name}</strong>,</p>
    <p>Welcome to <strong>CampusFlow</strong> — your university's class routine management system.</p>
    <p>Your account has been created with role: <strong>${user.role}</strong></p>
    <p>You can now log in and view your class routine anytime.</p>
    <br/>
    <p>Best regards,<br/>CampusFlow Team</p>
  `)
})

// Routine change notification
exports.sendRoutineUpdate = ({ to, name, action, details }) => sendMail({
  to,
  subject: `📅 Routine ${action} — CampusFlow`,
  html: baseTemplate(`
    <p>Hi <strong>${name}</strong>,</p>
    <p>Your class routine has been <strong>${action.toLowerCase()}</strong>:</p>
    <table>
      <tr><th>Field</th><th>Value</th></tr>
      ${Object.entries(details).map(([k,v]) => `<tr><td>${k}</td><td><strong>${v}</strong></td></tr>`).join('')}
    </table>
    <p>Please check your routine on CampusFlow for the latest schedule.</p>
  `)
})

// Conflict alert to admin
exports.sendConflictAlert = ({ to, conflicts }) => sendMail({
  to,
  subject: `⚡ ${conflicts.length} Schedule Conflict(s) Detected — CampusFlow`,
  html: baseTemplate(`
    <p>Hi Admin,</p>
    <div class="conflict">
      ⚡ <strong>${conflicts.length} scheduling conflict(s)</strong> were detected in the routine.
    </div>
    ${conflicts.map(c => `
      <table>
        <tr><th colspan="2">Conflict — ${c.type === 'room' ? '🚪 Room Clash' : '👨‍🏫 Teacher Clash'}</th></tr>
        <tr><td>Day</td><td>${c.a.dayName}</td></tr>
        <tr><td>Time</td><td>${c.a.startTime}–${c.a.endTime}</td></tr>
        <tr><td>Course A</td><td>${c.a.course?.courseCode || '—'}</td></tr>
        <tr><td>Course B</td><td>${c.b.course?.courseCode || '—'}</td></tr>
      </table>
    `).join('')}
    <p>Please resolve these conflicts from the CampusFlow admin dashboard.</p>
  `)
})

// Password change confirmation
exports.sendPasswordChanged = (user) => sendMail({
  to: user.email,
  subject: '🔒 Password Changed — CampusFlow',
  html: baseTemplate(`
    <p>Hi <strong>${user.name}</strong>,</p>
    <div class="alert">
      ⚠ Your CampusFlow password was just changed.
    </div>
    <p>If you made this change, no action is needed.</p>
    <p>If you did <strong>not</strong> make this change, please contact your administrator immediately.</p>
  `)
})

// Password reset email
exports.sendPasswordReset = (user, resetUrl) => sendMail({
  to: user.email,
  subject: '🔑 Password Reset — CampusFlow',
  html: baseTemplate(`
    <p>Hi <strong>${user.name}</strong>,</p>
    <p>We received a request to reset your CampusFlow password.</p>
    <p style="text-align:center">
      <a href="${resetUrl}" class="btn">Reset Password</a>
    </p>
    <p style="font-size:12px;color:#999">This link expires in <strong>30 minutes</strong>.</p>
    <div class="alert">If you did not request this, please ignore this email.</div>
  `)
})
