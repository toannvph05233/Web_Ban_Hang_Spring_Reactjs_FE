import axios from "axios";

export function saveProduct(product){
    return new Promise(resolve => {
        resolve(
            axios.post("http://localhost:8080/api/products", product).then(res =>{
                return true;
            }).catch(Error =>{
                return false;
            })
        )
    })
}

export function getProductById(id){
    return new Promise(resolve => {
        resolve(
            axios.get(`http://localhost:8080/api/products/merchant/${id}`).then(res =>{
                return res.data;
            }).catch(Error =>{
            })
        )
    })
}

export function getAllProductByIdMerchant(id){
    return new Promise(resolve => {
        resolve(
            axios.get(`http://localhost:8080/api/products/purchase/${id}`).then(res =>{
                return res.data;
            }).catch(Error =>{
            })
        )
    })
}

export function fillByPrice(){
    return new Promise(resolve => {
        resolve(
            axios.get(`http://localhost:8080/api/products/fill_by_price`).then(res =>{
                return res.data;
            }).catch(Error =>{
            })
        )
    })
}

export function MostPurchasedProducts(id){
    return new Promise(resolve => {
        resolve(
            axios.get(`http://localhost:8080/api/products/purchased`).then(res =>{
                return res.data;
            }).catch(Error =>{
            })
        )
    })
}


export function findOneProduct(id){
    return new Promise(resolve => {
        resolve(
            axios.get(`http://localhost:8080/api/products/findOne/${id}`).then(res =>{
                return res.data;
            }).catch(Error =>{
                return undefined;
            })
        )
    })
}

export function getAllProductByMerchant(id, name) {
    return new Promise(resolve => {
        resolve(
            axios.get(`http://localhost:8080/api/products/search?id_merchant=${id}&name=${name}`)
                .then(res => {
                    return res.data;
                })
                .catch(error => {
                    return undefined;
                })
        )
    })
}

export function deleteProduct(id_product){
    return new Promise(resolve => {
        resolve(
            axios.delete("http://localhost:8080/api/products/" + id_product).then(res =>{
                return true;
            }).catch(Error =>{
                return false;
            })
        )
    })
}

export function searchByCategory(id_category){
    return new Promise(resolve => {
        resolve(
            axios.get(`http://localhost:8080/api/products/search/${id_category}`).then(res =>{
                return res.data;
            }).catch(Error =>{
                return []
            })
        )
    })
}

export function findAll(){
    return new Promise(resolve => {
        resolve(
            axios.get("http://localhost:8080/api/products").then(res =>{
                return res.data;
            }).catch(Error =>{
            })
        )
    })
}