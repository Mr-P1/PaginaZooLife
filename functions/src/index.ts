
// Correos
// const functions = require("firebase-functions");
// const nodemailer = require("nodemailer");
// const cors = require("cors")({ origin: true }); // Importa y configura CORS

// const transport = nodemailer.createTransport({
//     service: 'Gmail',
//     auth: {
//         user: "lilpepe132@gmail.com", // Cambiarlo a una variable de entorno para mayor seguridad
//         pass: "nudhjqinsitfqoqc" // Cambiarlo a una variable de entorno para mayor seguridad
//     }
// });

// const sendContactForm = (form:any,to:string) => {
//     return transport
//     .sendMail({
//         subject: "Esto es una prueba",
//         bcc: ["lilpepe@gmail.com"], // Se usa bcc para que el correo no sea visible
//         html: `${form}`,
//         to: to,
//     })
//     .then((r:any) => {
//         console.log("Aceptado => ", r.accepted); // Correo enviado
//         console.log("Rechazado => ", r.rejected); // Correo rechazado
//     })
//     .catch((error:any) => console.log(error));
// };

// exports.helloworld = functions.https.onRequest((request:any, response:any) => {
//     // Habilita CORS para permitir solicitudes de diferentes orígenes
//     cors(request, response, () => {
//         // Verifica si el secreto es correcto para seguridad básica
//         if (request.body.secret !== 'firebaseIsCool') {
//             return response.status(403).json({ error: "Secreto faltante" });
//         }

//         // Extrae el destinatario y el contenido del formulario del cuerpo de la solicitud
//         const form = request.body.form; // Contenido del correo (formulario)
//         const destinatario = request.body.to; // Dirección del destinatario

//         // Llama a sendContactForm con el destinatario dinámico
//         sendContactForm(form, destinatario)
//             .then(() => response.json({ message: "Correo enviado correctamente" }))
//             .catch((error:any) => response.status(500).json({ error: "Error al enviar el correo", details: error.toString() }));
//     });
// });



// // Correos
// const functions = require("firebase-functions");
// const nodemailer = require("nodemailer");
// const cors = require("cors")({ origin: true }); // Configura CORS

// // Configura nodemailer con credenciales
// const transport = nodemailer.createTransport({
//     service: 'Gmail',
//     auth: {
//         user: "lilpepe132@gmail.com", // Reemplazar con variables de entorno en producción
//         pass: "nudhjqinsitfqoqc" // Reemplazar con variables de entorno en producción
//     }
// });

// // Función para enviar el formulario y el adjunto
// const sendContactForm = (form:any, to:any, attachment:any) => {
//     return transport
//     .sendMail({
//         subject: "Esto es una prueba",
//         bcc: ["lilpepe@gmail.com"], // Dirección oculta (BCC)
//         html: `${form}
//          <p>Imagen QR:</p>
//           <img src="cid:qrcode" alt="QR Code">`, // Contenido HTML del correo
//         to: to,
//         attachments: [
//             {
//                 filename: 'qrcode.png', // Nombre del archivo adjunto
//                 content: attachment.split("base64,")[1], // Obtiene solo la parte base64
//                 encoding: 'base64'
//             }
//         ]
//     })
//     .then((r:any) => {
//         console.log("Aceptado => ", r.accepted); // Correo enviado
//         console.log("Rechazado => ", r.rejected); // Correo rechazado
//     })
//     .catch((error:any) => console.log(error));
// };

// // Define la función en Firebase con CORS habilitado
// exports.helloworld = functions.https.onRequest((request:any, response:any) => {
//     cors(request, response, () => {
//         // Verifica el secreto por seguridad básica
//         if (request.body.secret !== 'firebaseIsCool') {
//             return response.status(403).json({ error: "Secreto incorrecto" });
//         }

//         // Extrae el destinatario, contenido del formulario y adjunto del cuerpo de la solicitud
//         const form = request.body.form;
//         const destinatario = request.body.to;
//         const attachment = request.body.attachment;

//         // Llama a sendContactForm con el contenido y el adjunto
//         sendContactForm(form, destinatario, attachment)
//             .then(() => response.json({ message: "Correo enviado correctamente" }))
//             .catch((error:any) => response.status(500).json({ error: "Error al enviar el correo", details: error.toString() }));
//     });
// });



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
      subject: "Esto es una prueba",
      bcc: ["lilpepe@gmail.com"], // Dirección oculta (BCC)
      html: `${form}
       <p>Imagen QR:</p>
       <img src="data:image/png;base64,${attachment.split("base64,")[1]}" alt="QR Code">`, // Contenido HTML del correo
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
