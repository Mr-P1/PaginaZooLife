import { MulticastMessage, getMessaging } from "firebase-admin/messaging";

const messaging = getMessaging();


const sendNotificationPush = async (
    tokens: string[],
    message: { title: string, content: string, imagen?: string },
    data: any = {},
    tag: string = "") => {
    console.log("SendNotificacionPush demo");

    const multicastMessage: MulticastMessage = {
        tokens,
        data,
        notification:{
            title:message.title,
            body: message.content
        },
        android:{
            notification:{
                color: '#05498c',
                priority:"max",
                //sticky:true, // Si le da click a la notificacion se cierra
                visibility:"public",
            }

        }
    }

    // if(message.imagen){
    //     multicastMessage.notification.imageUrl = message.imagen;
    // }

    const response = await messaging.sendEachForMulticast(multicastMessage);
    console.log("respuesta ",response.successCount);
    };

export const Notfications = {
    sendNotificationPush
}
