const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const cors = require("cors")({ origin: true }); // Configura CORS
// Inicializa Firebase Admin SDK si no ha sido inicializado
if (!admin.apps.length) {
  admin.initializeApp();
}

const firestore = admin.firestore();
const PATH_Boletas_usadas = 'Boletas_usadas';
const messaging = admin.messaging(); // Inicializa el servicio de mensajería de Firebase

// Configura nodemailer con credenciales
const transport = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: "capstoneduoc@gmail.com",
    pass: "foupcsgbtgtrrddv"
  }
});

// Función para enviar el formulario y el adjunto
const sendContactForm = (form: any, to: any, attachment: any) => {
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
    .then((r: any) => {
      console.log("Aceptado => ", r.accepted); // Correo enviado
      console.log("Rechazado => ", r.rejected); // Correo rechazado
    })
    .catch((error: any) => console.log(error));
};

// Define la función en Firebase con CORS habilitado
exports.helloworld = functions.https.onRequest((request: any, response: any) => {
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
      .catch((error: any) => response.status(500).json({ error: "Error al enviar el correo", details: error.toString() }));
  });
});

// Función para enviar notificación push
const sendNotificationPush = async (tokens: any, title: string, body: string, imageUrl: string | null, data = {}, tag = "") => {
  console.log("Enviando notificación con título y contenido personalizados");

  // Definir el mensaje multicast con el título, cuerpo y URL de la imagen especificados
  const multicastMessage = {
    tokens,
    data,
    notification: {
      title: title,
      body: body,
      image: imageUrl || undefined // Solo añade la imagen si se proporciona
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
exports.sendPushNotification = functions.https.onRequest((request: any, response: any) => {
  cors(request, response, async () => {
    // Verifica un secreto o autenticación básica si deseas añadir seguridad
    if (request.body.secret !== "firebaseIsCool") {
      return response.status(403).json({ error: "Secreto incorrecto" });
    }

    // Extrae los datos necesarios del cuerpo de la solicitud
    const tokens = request.body.tokens;
    const title = request.body.title;
    const body = request.body.body;
    const imageUrl = request.body.imageUrl || null; // URL de la imagen opcional
    const data = request.body.data || {};

    // Validación de campos obligatorios
    if (!title || !body) {
      return response.status(400).json({ error: "El título y el contenido de la notificación son obligatorios." });
    }

    try {
      // Llama a la función para enviar la notificación push
      const sendResponse = await sendNotificationPush(tokens, title, body, imageUrl, data);
      response.json({
        message: "Notificación enviada correctamente",
        successCount: sendResponse.successCount,
        failureCount: sendResponse.failureCount,
      });
    } catch (error: any) {
      console.error("Error al enviar notificación:", error);
      response.status(500).json({ error: "Error al enviar la notificación", details: error.toString() });
    }
  });
});



// Envío correo
// Función para enviar correos de felicitación o sugerencia
const sendOIRSEmail = (oirsType:any, to:any) => {
  let subject;
  let message;

  // Define el asunto y el mensaje dependiendo del tipo de OIRS
  if (oirsType === "felicitacion") {
    subject = "¡Gracias por tu felicitación!";
    message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
        <h2 style="text-align: center; color: #4CAF50;">🎉 ¡Gracias por tu felicitación! 🎉</h2>
        <p style="font-size: 16px; color: #333;">
          Nos complace saber que has tenido una buena experiencia. Tus palabras nos motivan a seguir mejorando para ofrecerte el mejor servicio posible.
        </p>
        <p style="font-size: 14px; color: #555; text-align: center;">
          ¡Esperamos verte pronto!
        </p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;">
          © 2024 Buin Zoo. Todos los derechos reservados.
        </p>
      </div>`;
  } else if (oirsType === "sugerencia") {
    subject = "¡Gracias por tu sugerencia!";
    message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
        <h2 style="text-align: center; color: #4CAF50;">💡 ¡Gracias por tu sugerencia! 💡</h2>
        <p style="font-size: 16px; color: #333;">
          Valoramos mucho tus comentarios y sugerencias. Nos ayudan a mejorar continuamente nuestros servicios para brindarte una mejor experiencia.
        </p>
        <p style="font-size: 14px; color: #555; text-align: center;">
          Tu opinión cuenta. ¡Gracias por tomarte el tiempo de compartirla!
        </p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;">
          © 2024 Buin Zoo. Todos los derechos reservados.
        </p>
      </div>`;
  } else if (oirsType === "reclamo") {
    subject = "Hemos recibido tu reclamo";
    message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
        <h2 style="text-align: center; color: #F44336;">⚠️ Hemos recibido tu reclamo ⚠️</h2>
        <p style="font-size: 16px; color: #333;">
          Lamentamos que hayas tenido una experiencia insatisfactoria. Agradecemos que nos hayas compartido tu opinión y estamos comprometidos a revisar tu situación para mejorar nuestro servicio.
        </p>
        <p style="font-size: 14px; color: #555; text-align: center;">
          Nos pondremos en contacto contigo si necesitamos más información.
        </p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;">
          © 2024 Buin Zoo. Todos los derechos reservados.
        </p>
      </div>`;
  } else if (oirsType === "consulta") {
    subject = "Hemos recibido tu consulta";
    message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
        <h2 style="text-align: center; color: #2196F3;">❓ Hemos recibido tu consulta ❓</h2>
        <p style="font-size: 16px; color: #333;">
          Gracias por contactarnos. Hemos recibido tu consulta y nuestro equipo la revisará para responderte a la brevedad.
        </p>
        <p style="font-size: 14px; color: #555; text-align: center;">
          Si tienes más preguntas, no dudes en comunicarte nuevamente con nosotros.
        </p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;">
          © 2024 Buin Zoo. Todos los derechos reservados.
        </p>
      </div>`;
  } else {
    console.log("El tipo de OIRS no requiere enviar un correo.");
    return Promise.resolve();
  }

  // Envía el correo
  return transport
    .sendMail({
      subject: subject,
      bcc: ["lilpepe@gmail.com"], // Dirección oculta (BCC)
      html: message,
      to: to,
    })
    .then((response: any) => {
      console.log("Correo enviado a:", to);
      console.log("Aceptado => ", response.accepted);
      console.log("Rechazado => ", response.rejected);
    })
    .catch((error: any) => {
      console.error("Error al enviar el correo:", error);
      throw error;
    });
};

// Define la función en Firebase con CORS habilitado
exports.sendOIRSEmailFunction = functions.https.onRequest((request:any, response:any) => {
  cors(request, response, () => {
    // Verifica el secreto por seguridad básica
    if (request.body.secret !== 'firebaseIsCool') {
      return response.status(403).json({ error: "Secreto incorrecto" });
    }

    // Extrae el tipo de OIRS y el destinatario del cuerpo de la solicitud
    const oirsType = request.body.type;
    const destinatario = request.body.to;

    // Llama a sendOIRSEmail con el tipo de OIRS y el destinatario
    sendOIRSEmail(oirsType, destinatario)
      .then(() => response.json({ message: "Correo enviado correctamente" }))
      .catch((error:any) => response.status(500).json({ error: "Error al enviar el correo", details: error.toString() }));
  });
});


// Función para enviar un correo con un mensaje personalizado
const sendEmailWithMessage = (to:any, customMessage:any) => {
  const subject = "Respuesta del equipo de soporte"; // Asunto genérico para la respuesta
const message = `
  <div style="
    font-family: Arial, sans-serif;
    line-height: 1.6;
    color: #333;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
    background-color: #f9f9f9;
    max-width: 600px;
    margin: auto;
  ">
    <h2 style=" text-align: center; margin-bottom: 20px;">
       👷‍♂️🛠️ Respuesta del Equipo de Soporte 👷‍♂️🛠️
    </h2>
    <p style="font-size: 16px; text-align: justify; margin-bottom: 20px;">
      ${customMessage}
    </p>
    <p style="font-size: 14px; color: #555; text-align: center;">
      Si tienes más preguntas o inquietudes, no dudes en contactarnos nuevamente. ¡Estamos aquí para ayudarte!
    </p>
    <footer style="margin-top: 20px; text-align: center;">
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="font-size: 12px; color: #888;">
        Este mensaje fue generado automáticamente. Por favor, no respondas a este correo.
      </p>
      <p style="font-size: 12px; color: #999; text-align: center;">
        © 2024 Buin Zoo. Todos los derechos reservados.
      </p>
    </footer>
  </div>
`;


  // Envía el correo
  return transport
    .sendMail({
      subject: subject,
      to: to,
      bcc: ["lilpepe@gmail.com"], // Dirección oculta (BCC)
      html: message
    })
    .then((response:any) => {
      console.log("Correo enviado a:", to);
      console.log("Aceptado => ", response.accepted);
      console.log("Rechazado => ", response.rejected);
    })
    .catch((error:any) => {
      console.error("Error al enviar el correo:", error);
      throw error;
    });
};

// Define la función en Firebase con CORS habilitado
exports.sendEmailWithMessageFunction = functions.https.onRequest((request:any, response:any) => {
  cors(request, response, () => {
    // Verifica el secreto por seguridad básica
    if (request.body.secret !== 'firebaseIsCool') {
      return response.status(403).json({ error: "Secreto incorrecto" });
    }

    // Extrae el destinatario y el mensaje personalizado del cuerpo de la solicitud
    const destinatario = request.body.to;
    const customMessage = request.body.message;

    // Llama a sendEmailWithMessage con el destinatario y el mensaje personalizado
    sendEmailWithMessage(destinatario, customMessage)
      .then(() => response.json({ message: "Correo enviado correctamente" }))
      .catch((error:any) => response.status(500).json({ error: "Error al enviar el correo", details: error.toString() }));
  });
});
