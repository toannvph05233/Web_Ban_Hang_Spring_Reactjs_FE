

export const getList = (list, page, limit) => {
    let arr = []
    for (let i = (page - 1)*limit; i < (page * limit) && list[i]; i++) {
        arr.push(list[i])
    }
    return arr
}