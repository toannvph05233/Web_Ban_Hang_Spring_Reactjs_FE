import {over} from 'stompjs';
import SockJS from 'sockjs-client'


let stompClient = null;
export const connect = (sendAcc) => {
    let Sock = new SockJS('http://localhost:8080/ws')
    stompClient = over(Sock)
    stompClient.connect({}, ()=>{
        stompClient.subscribe('/user/' + sendAcc.username + sendAcc.id + '/private-notification', (payload)=>{
            console.log(JSON.parse(payload.body));
        })
    }, (err)=>{
        console.log(err)
    });
}

export const handledSendNotification = (sendAcc, recAcc, notification, link) => {
    console.log(recAcc)
    if (stompClient) {
        var notificationSend = {
            sendAcc: {
                id_account: sendAcc.id,
                name: sendAcc.username
            },
            recAcc: {
                id_account: recAcc.id_account,
                name: recAcc.name
            },
            notification: notification,
            link: link
        };
        stompClient.send("/app/private-notification", {}, JSON.stringify(notificationSend));
    }
}
export const handledSendAccountSelf = (sendAcc, recAcc) => {
    console.log(recAcc)
    if (stompClient) {
        var notificationSend = {
            sendAcc: {
                id_account: sendAcc.id,
                name: sendAcc.username
            },
            recAcc: {
                id_account: recAcc.id,
                name: recAcc.username
            }
        };
        stompClient.send("/app/private-notification", {}, JSON.stringify(notificationSend));
    }
}