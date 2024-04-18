
import axios from 'axios';

export function getAllCategories(){
    return new Promise(resolve =>{
        resolve(
            axios.get("http://localhost:8080/api/categories").then(res =>{
                return res.data
            }).catch (Error =>{
                return []
            })
        )
    })
}