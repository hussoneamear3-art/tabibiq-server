const express = require("express");
const cors = require("cors");
const { Resend } = require("resend");

const app = express();

app.use(cors());
app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY);

app.get("/", (req, res) => {
  res.send("TabibiQ Server Running");
});

app.post("/send-email", async (req, res) => {
  try {

    const { email, name, link } = req.body;

    const response = await resend.emails.send({

      from: "TabibiQ <onboarding@resend.dev>",

      to: email,

      subject: "تفعيل حسابك في TabibiQ",

      html: `
      <div style="font-family:Arial;padding:30px">

      <h1 style="color:#08AED3">
      TabibiQ
      </h1>

      <h3>
      مرحباً ${name}
      </h3>

      <p>
      اضغط الزر لتفعيل الحساب
      </p>

      <a
      href="${link}"
      style="
      background:#08AED3;
      color:white;
      padding:15px 25px;
      border-radius:10px;
      text-decoration:none;
      display:inline-block;
      ">

      تفعيل الحساب

      </a>

      </div>
      `

    });

    res.json(response);

  } catch (error) {

    console.log(error);

    res.status(500).json(error);

  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(`Server running on port ${PORT}`);

});