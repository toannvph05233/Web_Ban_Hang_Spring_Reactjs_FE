import axios from "axios";

export function findByTimeRange(id_merchant, startTime, endTime){
    return new Promise(require =>{
        require(
            axios.get(`http://localhost:8080/api/billDetail/merchant/${id_merchant}/${startTime}T00:00:00/${endTime}T00:00:00`).then(res=>{
                return res.data
            }).catch(Error =>{
                return undefined
            })
        )
    })
}
export function findByQuarter(id_merchant, valueQuarter){
    return new Promise(require =>{
        require(
            axios.get(`http://localhost:8080/api/billDetail/merchant/${id_merchant}/quarter/${valueQuarter}`).then(res=>{
                return res.data
            }).catch(Error =>{
                return undefined
            })
        )
    })
}

export function findByYearAndWeekAndMerchant(id_merchant, year, week){
    return new Promise(require =>{
        require(
            axios.get(`http://localhost:8080/api/billDetail/merchant/${id_merchant}/year/${year}/week/${week}`).then(res=>{
                return res.data
            }).catch(Error =>{
                return undefined
            })
        )
    })
}
export function findByMonthAndMerchant(id_merchant, year, month){
    return new Promise(require =>{
        require(
            axios.get(`http://localhost:8080/api/billDetail/merchant/${id_merchant}/year/${year}/month/${month}`).then(res=>{
                return res.data
            }).catch(Error =>{
                return undefined
            })
        )
    })
}
