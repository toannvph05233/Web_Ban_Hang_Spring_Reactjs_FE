import SockJS from "sockjs-client";
import {over} from "stompjs";
import {useEffect, useState} from "react";

let stompClient = null;
export default function DemoStatusWebsocket(){
    const [status, setStatus] = useState("")
    const [recAcc, setRecAcc] = useState( {id_account:1, name: "amin"})
    const [sendAcc, setSendAcc] = useState( {id_account:2, name: "user"})

    // useEffect(()=>{
    //     connect()
    // })
    // const connect=()=>{
    //     let Sock = new SockJS('http://localhost:8080/ws')
    //     stompClient = over(Sock)
    //     stompClient.connect({},onConnected, onError);
    // }
    // const onConnected = () => {
    //     stompClient.subscribe('/user/'+sendAcc.name+sendAcc.id_account +'/private', onPrivateMessage);
    // }
    // const onPrivateMessage = (payload)=>{
    //     console.log(payload);
    //     let payloadData = JSON.parse(payload.body);
    //     if (payloadData.sendAcc.id_account !== sendAcc.id_account){
    //         setStatus(payloadData);
    //         console.log("status" + payloadData)
    //     }
    // }
    // const onError = (err) => {
    //     console.log(err);
    // }
    // const handledSend=()=>{
    //     if (stompClient) {
    //         var chatMessage = {
    //             sendAcc: {
    //                 id_account: sendAcc.id_account,
    //                 name: sendAcc.name
    //             },
    //             receiverAcc:{
    //                 id_account:recAcc.id_account,
    //                 name: recAcc.name
    //             },
    //             message: "true"
    //         };
    //         console.log(chatMessage);
    //         stompClient.send("/app/private-message", {}, JSON.stringify(chatMessage));
    //     }
    // }
    // return(
    //     <>
    //         <button onClick={handledSend}>Send</button>
    //     </>
    // )
}