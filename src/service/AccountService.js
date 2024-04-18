import axios from "axios";

export const loginUser = (username, password) => {
    return new Promise((resolve, reject) => {
        axios.post("http://localhost:8080/api/accounts/login", {
            name: username,
            password: password
        })
            .then(response => {
                // Handle success
                resolve(response);
            })
            .catch(error => {
                // Handle error
                reject(error);
            });
    });
}
export const saveAccount = (account) => {
    return new Promise((resolve) => {
        resolve(
            axios.post("http://localhost:8080/api/accounts/register", account)
                .then(response => {
                        return true
                    }
                ).catch(() => {
                return false
            })
        )
    })
}
export const updateAccount = (account) => {
    return new Promise((resolve) => {
        resolve(
            axios.post("http://localhost:8080/api/accounts/update", account)
                .then(response => {
                        return true
                    }
                ).catch(() => {
                return false
            })
        )
    })
}

export function findAccountByMerchant(id_merchant){
    return new Promise((resolve) => {
        resolve(
            axios.get(`http://localhost:8080/api/accounts/account-by-merchant/${id_merchant}`)
                .then(response => {
                        return response.data
                    }
                ).catch(() => {
                return undefined
            })
        )
    })
}

export function findAccountById(id_account){
    return new Promise((resolve) => {
        resolve(
            axios.get(`http://localhost:8080/api/accounts/${id_account}`)
                .then(response => {
                        return response.data
                    }
                ).catch(() => {
                return undefined
            })
        )
    })
}