

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


// Dependencias necesarias para Firebase Functions y Firebase Admin
const admin = require("firebase-admin");

// Inicializa Firebase Admin si no ha sido inicializado
if (!admin.apps.length) {
    admin.initializeApp();
}

const messaging = admin.messaging(); // Inicializa el servicio de mensajería de Firebase

// Función para enviar notificación push
const sendNotificationPush = async (tokens:any, data = {}, tag = "") => {
    console.log("Enviando notificación de prueba");

    // Definir el mensaje multicast con el título y cuerpo especificados
    const multicastMessage = {
        tokens,
        data,
        notification: {
            title: "Esto es una prueba",
            body: "Esto es una prueba desde la página",
        },
        android: {
            notification: {
                color: "#05498c",
                priority: "max",
                visibility: "public",
            },
        },
    };

    // Enviar el mensaje a todos los tokens proporcionados
    const response = await messaging.sendEachForMulticast(multicastMessage);
    console.log("Número de notificaciones enviadas con éxito:", response.successCount);
    return response;
};

// Define la función en Firebase con CORS habilitado
exports.sendPushNotification = functions.https.onRequest((request:any, response:any) => {
    cors(request, response, async () => {
        // Verifica un secreto o autenticación básica si deseas añadir seguridad
        if (request.body.secret !== "firebaseIsCool") {
            return response.status(403).json({ error: "Secreto incorrecto" });
        }

        // Extrae los tokens y datos del cuerpo de la solicitud
        const tokens = request.body.tokens;
        const data = request.body.data || {};

        try {
            const sendResponse = await sendNotificationPush(tokens, data);
            response.json({
                message: "Notificación enviada correctamente",
                successCount: sendResponse.successCount,
                failureCount: sendResponse.failureCount,
            });
        } catch (error:any) {
            console.error("Error al enviar notificación:", error);
            response.status(500).json({ error: "Error al enviar la notificación", details: error.toString() });
        }
    });
});
