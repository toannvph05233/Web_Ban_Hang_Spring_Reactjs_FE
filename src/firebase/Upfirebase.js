import {storage} from "./config";
import {uploadBytes,ref, getDownloadURL} from "firebase/storage";
import {v4} from "uuid";

export function upImageFirebase(file){
    const imageRef = ref(storage, `products/${file.name + v4()}`)
    return new Promise(resolve => (
          //create sub promise
        uploadBytes(imageRef, file).then((snapshot) => {
            getDownloadURL(snapshot.ref).then(url => {
                let a = {name: url}
                resolve(a)
            })
        })
    ))
}