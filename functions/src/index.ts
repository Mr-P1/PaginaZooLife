const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const cors = require("cors")({ origin: true }); // Configura CORS
import * as moment from 'moment';
import { Timestamp } from 'firebase-admin/firestore';

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
    user: "lilpepe132@gmail.com", // Reemplazar con variables de entorno en producción
    pass: "nudhjqinsitfqoqc" // Reemplazar con variables de entorno en producción
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

interface BoletaUsada {
  fecha: Timestamp;
  id_usuario: string;
  tipo: string;
}

export const calcularVisitasPorPeriodo = functions.https.onRequest((req:any, res:any) => {
  cors(req, res, async () => {
    try {
      const boletasSnapshot = await firestore.collection(PATH_Boletas_usadas).get();
      const data: Record<string, Record<string, number | Set<string>>> = {
        anual: {},
        mensual: {},
        semanal: {},
        diario: {}
      };

      boletasSnapshot.forEach((doc: any) => {
        const boleta = doc.data() as BoletaUsada;
        const fecha = boleta.fecha.toDate();
        const idUsuario = boleta.id_usuario;

        const year = fecha.getFullYear();
        const month = fecha.getMonth() + 1;
        const week = moment(fecha).isoWeek();
        const day = fecha.getDate();

        if (!data.anual[year]) data.anual[year] = new Set<string>();
        (data.anual[year] as Set<string>).add(idUsuario);

        const monthKey = `${year}-${month}`;
        if (!data.mensual[monthKey]) data.mensual[monthKey] = new Set<string>();
        (data.mensual[monthKey] as Set<string>).add(idUsuario);

        const weekKey = `${year}-W${week}`;
        if (!data.semanal[weekKey]) data.semanal[weekKey] = new Set<string>();
        (data.semanal[weekKey] as Set<string>).add(idUsuario);

        const dayKey = `${year}-${month}-${day}`;
        if (!data.diario[dayKey]) data.diario[dayKey] = new Set<string>();
        (data.diario[dayKey] as Set<string>).add(idUsuario);
      });

      for (const key in data.anual) data.anual[key] = (data.anual[key] as Set<string>).size;
      for (const key in data.mensual) data.mensual[key] = (data.mensual[key] as Set<string>).size;
      for (const key in data.semanal) data.semanal[key] = (data.semanal[key] as Set<string>).size;
      for (const key in data.diario) data.diario[key] = (data.diario[key] as Set<string>).size;

      res.json(data);
    } catch (error) {
      console.error('Error al calcular visitas:', error);
      res.status(500).send('Error en el cálculo de visitas.');
    }
  });
});

//Envio correo
// Función para enviar correos de felicitación o sugerencia
const sendOIRSEmail = (oirsType:any, to:any) => {
  let subject;
  let message;

  // Define el asunto y el mensaje dependiendo del tipo de OIRS
  if (oirsType === "felicitacion") {
    subject = "¡Gracias por tu felicitación!";
    message = "Gracias por enviarnos tu felicitación. Nos complace saber que has tenido una buena experiencia.";
  } else if (oirsType === "sugerencia") {
    subject = "¡Gracias por tu sugerencia!";
    message = "Gracias por tomarte el tiempo de enviarnos tus sugerencias. Las valoramos mucho y nos ayudan a mejorar.";
  } else if (oirsType === "reclamo") {
    subject = "Hemos recibido tu reclamo";
    message = "Lamentamos que hayas tenido una experiencia insatisfactoria. Apreciamos que nos hayas compartido tu opinión y estamos comprometidos a revisar tu situación para mejorar nuestro servicio. Nos pondremos en contacto contigo si necesitamos más información.";
  }
  else if (oirsType === "consulta") {
    subject = "Hemos recibido tu consulta";
    message = "Gracias por contactarnos. Hemos recibido tu consulta y nuestro equipo la revisará para responderte a la brevedad. Si tienes más preguntas, no dudes en comunicarte nuevamente con nosotros.";
  }
   else {
    console.log("El tipo de OIRS no requiere enviar un correo.");
    return Promise.resolve();
  }

  // Envía el correo
  return transport
    .sendMail({
      subject: subject,
      bcc: ["lilpepe@gmail.com"], // Dirección oculta (BCC)
      html: `<p>${message}</p>`,
      to: to
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
  const message = `<p>${customMessage}</p>`;

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
