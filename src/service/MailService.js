import axios from "axios";


export function mailRegisterSuccess(receiver) {
    let mail = {
        subject: "Notification from Yummy",
        message: "Your merchant registration request on our platform has been successful. " +
            "Wishing you success on our platform!",
        receiver: receiver
    }
    axios.post("http://localhost:8080/api/mail/send", mail).then(res => {
        return true
    }).catch(Error => {
        return false
    })


}