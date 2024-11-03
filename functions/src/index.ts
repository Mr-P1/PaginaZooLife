

// Correos
const functions = require("firebase-functions");
const nodemailer = require("nodemailer");
const cors = require("cors")({ origin: true }); // Configura CORS

// Configura nodemailer con credenciales
const transport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: "lilpepe132@gmail.com", // Reemplazar con variables de entorno en producción
        pass: "nudhjqinsitfqoqc" // Reemplazar con variables de entorno en producción
    }
});

// Función para enviar el formulario y el adjunto
const sendContactForm = (form:any, to:any, attachment:any) => {
  return transport
  .sendMail({
      subject: "Qr ingreso app",
      bcc: ["lilpepe@gmail.com"], // Dirección oculta (BCC)
      html: `${form}`,
      to: to,
      attachments: [
          {
              filename: 'qrcode.png', // Nombre del archivo adjunto
              content: attachment.split("base64,")[1], // Obtiene solo la parte base64
              encoding: 'base64'
          }
      ]
  })
  .then((r:any) => {
      console.log("Aceptado => ", r.accepted); // Correo enviado
      console.log("Rechazado => ", r.rejected); // Correo rechazado
  })
  .catch((error:any) => console.log(error));
};

// Define la función en Firebase con CORS habilitado
exports.helloworld = functions.https.onRequest((request:any, response:any) => {
    cors(request, response, () => {
        // Verifica el secreto por seguridad básica
        if (request.body.secret !== 'firebaseIsCool') {
            return response.status(403).json({ error: "Secreto incorrecto" });
        }

        // Extrae el destinatario, contenido del formulario y adjunto del cuerpo de la solicitud
        const form = request.body.form;
        const destinatario = request.body.to;
        const attachment = request.body.attachment;

        // Llama a sendContactForm con el contenido y el adjunto
        sendContactForm(form, destinatario, attachment)
            .then(() => response.json({ message: "Correo enviado correctamente" }))
            .catch((error:any) => response.status(500).json({ error: "Error al enviar el correo", details: error.toString() }));
    });
});
