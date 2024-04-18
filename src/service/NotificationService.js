import axios from "axios";

export function getAllNotification(id_account){
    return new Promise(require=>{
        require(
            axios.get(`http://localhost:8080/api/websocket/notification/account/${id_account}`).then(res =>{
                return res.data
            }).catch(Error =>{
                return []
            })
        )
    })
}

export function updateWatch(id_notification){
    return new Promise(require=>{
        require(
            axios.get(`http://localhost:8080/api/websocket/notification/${id_notification}`).then(res =>{
                return true
            }).catch(Error =>{
                return false
            })
        )
    })
}