const AuditLog = require('../models/AuditLog');

const audit = (action, model) => async (req, res, next) => {
  res.on('finish', async () => {
    if (res.statusCode < 400 && req.user) {
      await AuditLog.create({
        user: req.user._id,
        action,
        model,
        docId: req.params.id || res.locals.docId,
        details: JSON.stringify(req.body).slice(0, 200),
        ip: req.ip,
      }).catch(() => {});
    }
  });
  next();
};

module.exports = audit;
