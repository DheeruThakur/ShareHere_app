const express = require("express");
const router = express.Router();
const File = require("../models/file");
const sendMail = require("../services/emailService");
const { v4: uuid4 } = require("uuid");

router.post("/", async (req, res) => {
  // console.log(req.file);
  // store file
  try {
    if (!req.file) {
      return res.json({ error: "All fields are required" });
    }

    const file = new File({
      fileName: req.file.filename,
      uuid: uuid4(),
      path: req.file.path,
      size: req.file.size,
    });
    // console.log(file);

    const response = await file.save();
    return res.json({
      file: `${process.env.APP_BASE_URL}/files/${response.uuid}`,
    });
  } catch (e) {
    console.log(e);
  }
});

router.post("/send", async (req, res) => {
  const { uuid, emailTo, emailFrom } = req.body;
  if (!uuid || !emailTo || !emailFrom) {
    return res.status(422).send({ error: "All fields are required" });
  }

  const file = await File.findOne({ uuid: uuid });

  if (file.sender) {
    return res.status(422).send({ error: "Email already sent" });
  }
  file.sender = emailFrom;
  file.receiver = emailTo;
  const response = await file.save();

  // send email

  sendMail({
    from: emailFrom,
    to: emailTo,
    subject: "File sharing Application",
    text: `${emailFrom} shares a file with you`,
    html: require("../services/emailTemplate")({
      emailFrom: emailFrom,
      downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}`,
      size: parseInt(file.size / 1000) + "KB",
      expires: "24 hours",
    }),
  });
  return res.send({ success: true });
});

module.exports = router;
