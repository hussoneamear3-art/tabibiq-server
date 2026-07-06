const functions = require("firebase-functions");
const {Resend} = require("resend");

const resend = new Resend(functions.config().resend.key);

exports.sendVerificationEmail = functions.https.onCall(async (data) => {
  const email = data.email;
  const name = data.name;
  const link = data.link;

  await resend.emails.send({
    from: "TabibiQ <verify@tabibiq.org>",
    to: email,
    subject: "تفعيل حسابك في TabibiQ",
    html: `
      <div style="font-family:Arial;padding:30px">
        <h1 style="color:#08AED3;">TabibiQ</h1>

        <h3>مرحباً ${name}</h3>

        <p>اضغط الزر لتفعيل حسابك</p>

        <a
          href="${link}"
          style="
            background:#08AED3;
            color:white;
            padding:15px 25px;
            text-decoration:none;
            border-radius:10px;
            display:inline-block;
          "
        >
          تفعيل الحساب
        </a>

      </div>
    `,
  });

  return {
    success: true,
  };
});
