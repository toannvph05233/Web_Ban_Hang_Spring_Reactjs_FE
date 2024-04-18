import axios from "axios";

export function getListCart(id) {
    return new Promise(resolve => {
        resolve(
            axios.get(`http://localhost:8080/api/carts/account/${id}/status/7`).then(res => {
                return res.data
            }).catch(Error => {
                return undefined
            })
        )
    })
}

export function updateQuantity(id, quantity) {
    return new Promise(resolve => {
        resolve(
            axios.get(`http://localhost:8080/api/carts/account/${id}/update/${quantity}`).then(res => {
                return true
            }).catch(Error => {
                return false
            })
        )
    })
}

export function deleteCartDetail(id) {
    return new Promise(resolve => {
        resolve(
            axios.delete(`http://localhost:8080/api/carts/account/cart-detail/${id}`).then(res => {
                return true
            }).catch(Error => {
                return false
            })
        )
    })
}

export function addToCart(id_account, cartDetail) {
    return new Promise(resolve => {
        resolve(
            axios.post(`http://localhost:8080/api/carts/account/${id_account}/create/7/status`, cartDetail).then(res => {
                return true
            }).catch(Error => {
                return false
            })
        )
    })
}