import axios from "axios";


export function addBill(cartDetail, coupons){
    return new Promise(require =>{
        require(
            axios.post("http://localhost:8080/api/bill/order",{cartDetailList:cartDetail, coupons:coupons}).then(res=>{
                return true
            }).catch(Error =>{
                return false
            })
        )
    })
}
export function findAllOrdersByMerchant(id_merchant){
    return new Promise(require =>{
        require(
            axios.get(`http://localhost:8080/api/billDetail/${id_merchant}`).then(res=>{
                return res.data
            }).catch(Error =>{
                return []
            })
        )
    })
}
export function findOrderByProduct(id_product){
    return new Promise(require =>{
        require(
            axios.get(`http://localhost:8080/api/billDetail/SearchByProduct/${id_product}`).then(res=>{
                return res.data
            }).catch(Error =>{
                return undefined
            })
        )
    })
}

export function findOrderByStatus(id_merchant, id_status){
    return new Promise(require =>{
        require(
            axios.get(`http://localhost:8080/api/billDetail/search_status/${id_merchant}/${id_status}`).then(res=>{
                return res.data
            }).catch(Error =>{
                return undefined
            })
        )
    })
}

export function findOrderByUser(id_merchant, id_user){
    return new Promise(require =>{
        require(
            axios.get(`http://localhost:8080/api/billDetail/search_user/${id_merchant}/${id_user}`).then(res=>{
                return res.data
            }).catch(Error =>{
                return undefined
            })
        )
    })
}

export function findUser(id_merchant){
    return new Promise(require =>{
        require(
            axios.get(`http://localhost:8080/api/bill/user/${id_merchant}`).then(res=>{
                return res.data
            }).catch(Error =>{
                return undefined
            })
        )
    })
}

export function findAllBillByMerchant(id_merchant){
    return new Promise(require =>{
        require(
            axios.get(`http://localhost:8080/api/bill/user/${id_merchant}`).then(res=>{
                return res.data
            }).catch(Error =>{
                return []
            })
        )
    })
}

export function searchByNameAndPhone(id_merchant,value){
    return new Promise(require =>{
        require(
            axios.get(`http://localhost:8080/api/billDetail/search/${id_merchant}?name=${value}`).then(res=>{
                return res.data
            }).catch(Error =>{
                return undefined;
            })
        )
    })
}

export function orderNow(product, id_account, quantity, discount){
    return new Promise(require =>{
        require(
            require(
                axios.post(`http://localhost:8080/api/bill/order-now/${id_account}/quantity/${quantity}/discount/${discount}`,product).then(res=>{
                    console.log(res)
                    return true
                }).catch(Error =>{
                    return false
                })
            )
        )
    })
}

export function getAllBillDetailByAccount(id_account){
    return new Promise(resolve => {
        resolve(
            axios.get(`http://localhost:8080/api/bill/all/account/${id_account}`).then(res =>{
                return res.data;
            }).catch(Error=>{
                return undefined;
            })
        )
    })
}


export function getAllStatus(){
    return new Promise(resolve => {
        resolve(
            axios.get(`http://localhost:8080/api/billDetail/status`).then(res =>{
                return res.data;
            }).catch(Error=>{
                return [];
            })
        )
    })
}

export function groupByBill(list){
    let arr = []
    let count = 0
    let a = {bill : list[0].bill, billDetails : [list[0]], total : list[0].quantity * list[0].price}
    arr.push(a)
    for (let i = 1; i < list.length; i++) {
        if (list[i].bill.id_bill === arr[count].bill.id_bill){
            arr[count].billDetails.push(list[i])
            arr[count].total +=list[i].quantity * list[i].price
        }else {
            arr.push({bill : list[i].bill, billDetails : [list[i]], total : list[i].quantity * list[i].price})
            count ++;
        }
    }

    return arr;
}
export function cancelBill(id_bill) {
    return axios.get(`http://localhost:8080/api/bill/cancel/bill/${id_bill}`)
        .then(response => {
            if (response.status === 200) {
                return true;
            } else {
                return false;
            }
        })
        .catch(() => {
            return false;
        });
}
export function updateStatus(id_bill, status){
    return new Promise((resolve)=>{
        resolve(
            axios.post(`http://localhost:8080/api/bill/update-status/${id_bill}`, status).then(res =>{
                return true;
            }).catch(Error =>{
                return false;
            })
        )
    })
}