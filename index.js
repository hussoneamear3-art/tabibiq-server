const express = require("express");
const cors = require("cors");
const { Resend } = require("resend");
const admin = require("firebase-admin");
const crypto = require("crypto");
const app = express();

app.use(cors());
app.use(express.json());

const resend = new Resend(
  process.env.RESEND_API_KEY
);

const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT
);

admin.initializeApp({

  credential:
    admin.credential.cert(
      serviceAccount
    )

});

const db = admin.firestore();

app.get("/", (req, res) => {

  res.send(
    "TabibiQ Server Running"
  );

});


app.post(

"/send-email",

async (req,res)=>{

try{

const{

email,
name,
link

}=req.body;


const response = await resend.emails.send({

from:

"TabibiQ <verify@tabibiq.org>",

to:email,

subject:

"تفعيل حسابك في TabibiQ",

html:`

<div
style="
font-family:Arial;
padding:30px;
text-align:center;
">

<h1
style="
color:#08AED3;
">

TabibiQ

</h1>

<h3>

مرحباً ${name}

</h3>

<p>

اضغط الزر التالي لتفعيل حسابك

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

margin-top:20px;

"

>

تفعيل الحساب

</a>

</div>

`

});

res.json(response);

}

catch(error){

console.log(error);

res.status(500)

.json(error);

}

}

);



app.get(

"/verify/:uid",

async(req,res)=>{

try{

const uid = req.params.uid;


const patient = await db

.collection("patients")

.doc(uid)

.get();



if(patient.exists){

await db

.collection("patients")

.doc(uid)

.update({

emailVerified:true

});


return res.send(`

<h2>

تم تفعيل حساب المريض بنجاح

</h2>

<p>

يمكنك العودة إلى تطبيق TabibiQ

</p>

`);

}



const doctor = await db

.collection("doctors")

.doc(uid)

.get();



if(doctor.exists){

await db

.collection("doctors")

.doc(uid)

.update({

emailVerified:true

});


return res.send(`

<h2>

تم تفعيل حساب الطبيب بنجاح

</h2>

<p>

يمكنك العودة إلى تطبيق TabibiQ

</p>

`);

}


res.status(404)

.send(

"الحساب غير موجود"

);

}

catch(error){

console.log(error);

res.status(500)

.send(

"حدث خطأ أثناء التفعيل"

);

}

}

);
app.post("/send-password-reset", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const resetLink = await admin
      .auth()
      .generatePasswordResetLink(email);

    await resend.emails.send({
      from: "TabibiQ <verify@tabibiq.org>",
      to: email,
      subject: "إعادة تعيين كلمة المرور - TabibiQ",
      html: `
      <div style="font-family:Arial;padding:30px;text-align:center">
        <h1 style="color:#08AED3;">TabibiQ</h1>

        <h2>إعادة تعيين كلمة المرور</h2>

        <p>
          اضغط الزر التالي لإعادة تعيين كلمة المرور.
        </p>

        <a
          href="${resetLink}"
          style="
            background:#08AED3;
            color:white;
            padding:15px 25px;
            border-radius:10px;
            text-decoration:none;
            display:inline-block;
            margin-top:20px;
          "
        >
          إعادة تعيين كلمة المرور
        </a>

        <p style="margin-top:25px;color:#666;">
          إذا لم تطلب إعادة تعيين كلمة المرور فتجاهل هذه الرسالة.
        </p>
      </div>
      `,
    });

    res.json({
      success: true,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

const PORT =

process.env.PORT || 3000;



app.listen(

PORT,

()=>{

console.log(

`Server running on port ${PORT}`

);

}

);