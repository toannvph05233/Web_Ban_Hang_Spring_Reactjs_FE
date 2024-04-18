import axios from "axios";
import {Link} from "react-router-dom";
import React from "react";
import data from "bootstrap/js/src/dom/data";

export const saveMerchant = (merchant) => {
    return new Promise((resolve) => {
        resolve(
            axios.post("http://localhost:8080/api/merchants/register", merchant)
                .then(response => {
                    return true
                    }
                ).catch(() => {
                    return false
            })
        )
    })
}

export const getAllMerchantCheckDelete = () => {
    return new Promise((resolve) => {
        resolve(
            axios.get("http://localhost:8080/api/merchants/merchant")
                .then(response => {
                        return response.data
                    }
                ).catch(() => {
                return []
            })
        )
    })
}

export const updateMerchant = (merchant) => {
    return new Promise((resolve) => {
        resolve(
            axios.put("http://localhost:8080/api/merchants/update", merchant)
                .then(response => {
                    return true
                    }
                ).catch(() => {
                    return false
            })
        )
    })
}

export function findCity() {
    return new Promise((resolve) => {
        resolve(
            axios.get("http://localhost:8080/api/address")
                .then(response => {
                        return response.data;
                    }
                ).catch(() => {
            })
        )
    })
}

export function findDistrict(id_city) {
    return new Promise((resolve) => {
        resolve(
            axios.get("http://localhost:8080/api/address/district/" + id_city)
                .then(response => {
                        return response.data;
                    }
                ).catch(() => {
            })
        )
    })
}

export function findWard(id_district) {
    return new Promise((resolve) => {
        resolve(
            axios.get("http://localhost:8080/api/address/ward/" + id_district)
                .then(response => {
                        return response.data;
                    }
                ).catch(() => {
            })
        )
    })
}

export function findMerchantById(id_merchant) {
    return new Promise((resolve) => {
        resolve(
            axios.get("http://localhost:8080/api/merchants/" + id_merchant)
                .then(response => {
                    return response.data;
                }).catch(() => {
                return {}
            })
        )
    })
}
export function findMerchantByAccount(id_account) {
    return new Promise((resolve) => {
        resolve(
            axios.get("http://localhost:8080/api/merchants/find-merchant/" + id_account)
                .then(response => {
                    return response.data;
                }).catch(() => {
                return {}
            })
        )
    })
}

export function findAllActivity() {
    return new Promise((resolve) => {
        resolve(
            axios.get("http://localhost:8080/api/merchants/activity" )
                .then(response => {
                    return response.data;
                }).catch(() => {
                return {}
            })
        )
    })
}



