import axios from "axios";

export function couponByIdMerchant(id_merchant){
    return new Promise(resolve => {
        resolve(
            axios.get(`http://localhost:8080/api/coupons/${id_merchant}`).then(res =>{
                return res.data;
            }).catch(Error =>{
                return [];
            })
        )
    })

}

export function findOneCoupon(id_coupon){
    return new Promise(resolve => {
        resolve(
            axios.get(`http://localhost:8080/api/coupons/findOne/${id_coupon}`).then(res =>{
                return res.data;
            }).catch(Error =>{
            })
        )
    })
}

export function saveCoupon(coupon){
    return new Promise(resolve => {
        resolve(
            axios.post(`http://localhost:8080/api/coupons/create`, coupon).then(res =>{
                return true
            }).catch(Error =>{
                return false
            })
        )
    })
}

export function editCoupon(coupon){
    return new Promise(resolve => {
        resolve(
            axios.put(`http://localhost:8080/api/coupons/update`, coupon).then(res =>{
                return true
            }).catch(Error =>{
                return false
            })
        )
    })
}

export function deleteCoupon(id){
    return new Promise(resolve => {
        resolve(
            axios.delete(`http://localhost:8080/api/coupons/${id}`,).then(res =>{
                return true
            }).catch(Error =>{
                return false
            })
        )
    })
}