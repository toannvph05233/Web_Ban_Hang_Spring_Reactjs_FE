import React, {useEffect, useRef, useState} from "react";
import {ErrorMessage, Field, Form, Formik} from "formik";
import {saveProduct} from "../service/ProductService";
import {getAllCategories} from "../service/CategoryService";
import {upImageFirebase} from "../firebase/Upfirebase";
import * as yup from "yup";
import {Link, useNavigate} from "react-router-dom";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import {toast, ToastContainer} from "react-toastify";


export default function CreateProduct() {
    const [file, setFile] = useState(undefined)
    const [load, setLoad] = useState(true)
    const [isExist, setExist] = useState(true)
    const inputFile = useRef()
    const btn_modal = useRef()
    const [message, setMessage] = useState("")
    const [categoriesDB, setCategoriesDB] = useState([])
    const [categories, setCategories] = useState([])
    const [product, setProduct] = useState({
        name: "",
        price: "",
        image: "",
        timeMake: "",
        description: ""
    })
    const navigate = useNavigate()
    let merchant = JSON.parse(localStorage.getItem("merchant"))


    useEffect(() => {
        getAllCategories().then(res => {
            setCategoriesDB([...res])
        })
    }, [])

    const handledCreate = (e) => {
        if (file === undefined) {
            toast.error("Please choose image for the product!!!", {containerId:'create-product'})
            return
        }
        if (categories === undefined || categories.length === 0) {
            toast.error("Please select category for the product!!!", {containerId:'create-product'})
            return
        }
        setLoad(false)
        upImageFirebase(file).then(res => {
            let a = {id_merchant: merchant.id_merchant}
            let product = {...e, image: res.name, categories: categories, merchant: a, priceSale: e.price * 0.95}
            saveProduct(product).then(response => {
                if (response) {
                    toast.success("Create product success!!!", {containerId:'create-product'})
                    setFile(undefined)
                    setLoad(true)
                    setExist(false)
                } else {
                    toast.error("Action error occurred. Please check again!!!", {containerId:'create-product'})
                    setLoad(true)
                }
            })
        }).catch(Error => {
            toast.error("Action error occurred. Please check again!!!", {containerId:'create-product'})
            setLoad(true)
            console.log("up file" + Error)
        })
    }
    const handledClickInput = () => {
        inputFile.current.click();
    }
    const handledCategories = (id_category) => {
        if (categories.length !== 0) {
            let flag = true;
            for (let i = 0; i < categories.length; i++) {
                if (categories[i].id_category === id_category) {
                    categories.splice(i, 1)
                    flag = false
                }
            }
            if (flag) {
                categories.push({id_category: id_category})
            }
        } else {
            categories.push({id_category: id_category})
        }
        setCategories([...categories])
    }

    const handledInputFile = (file) => {
        setFile(file);
    }

    const schema = yup.object().shape({
        name: yup.string().required("Name is a data field that cannot be left blank."),
        price: yup.number().required("Price is a data field that cannot be left blank.").min(5000, "Price cannot be lower than 5000."),
        timeMake: yup.string().required("Time make is a data field that cannot be left blank.")
    })


    return (
        <>
            <Header/>
            <ToastContainer enableMultiContainer containerId={"create-product"} position="top-right" autoClose={2000} pauseOnHover={false}
                                     style={{width: "400px"}}/>
            {load ? (
                    <div className="form-input" style={{marginTop : "20px", marginBottom : "20px"}}>
                        <h3 className="title">Add new</h3>
                        <hr/>
                        <Formik onSubmit={(e) => handledCreate(e)}
                                initialValues={product} validationSchema={schema}>
                            <Form style={{marginLeft: "20px", marginRight: "20px"}}>
                                <div className="row">
                                    <div className="col-6">
                                        <div className="input-form-label mb-3">
                                            <label className="form-label" id="name">Name <span style={{color: "red"}}>(*)</span></label>
                                            <Field type="text" className="form-control" name="name" placeholder="Enter name product"
                                                   aria-describedby="name"/>
                                            <ErrorMessage name="name" component="span" className="error"/>
                                        </div>
                                        <div className="input-form-label mb-3">
                                            <label className="form-label" id="price">Price <span style={{color: "red"}}>(*)</span></label>
                                            <Field type="text" className="form-control" name="price"
                                                   placeholder="Enter price product"
                                                   aria-describedby="price"/>
                                            <ErrorMessage name="price" component="span" className="error"/>
                                        </div>
                                        <div className="input-form-label mb-3">
                                            <label className="form-label" id="timeMake">Time Make <span style={{color: "red"}}>(*)</span></label>
                                            <Field type="text" className="form-control" name="timeMake"
                                                   placeholder="Enter time make product"
                                                   aria-describedby="timeMake"/>
                                            <ErrorMessage name="timeMake" component="span" className="error"/>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-form-label mb-3" onClick={handledClickInput}>
                                            <label className="form-label">Image <span style={{color: "red"}}>(*)</span></label>
                                            <input ref={inputFile} name="image" type="file" id="form-file-create"
                                                   style={{display: 'none'}} onChange={(e) => handledInputFile(e.target.files[0])}/>
                                            {file === undefined ? (
                                                <div style={{backgroundColor: "white", position: "relative", height: "264px"}}
                                                     className="form-control">
                                                    <div>
                                                        <img className='image-input' alt="image"
                                                             src={"https://binamehta.com/wp-content/uploads/image-placeholder-300x200.png"}/>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div style={{backgroundColor: "white", position: "relative", height: "264px"}}
                                                     className="form-control">
                                                    <div>
                                                        <img className="image-input" src={URL.createObjectURL(file)}
                                                             alt='image'/>
                                                    </div>
                                                </div>)}
                                            {/*<ErrorMessage name="image" component="span" className="error"/>*/}
                                        </div>
                                    </div>
                                </div>

                                <div className="input-form-label mb-3">
                                    <label className="form-label" id="description">Description</label>
                                    <Field as="textarea" className="form-control" style={{paddingLeft : "2px", height: "80px", resize: "none"}} name="description"
                                           placeholder="Enter description product"
                                           aria-describedby="description"/>
                                </div>
                                <div className="div-checkbox mb-3 row ">
                                    <label className="form-label">Categories <span style={{color: "red"}}>(*)</span></label>
                                    <div className="form-checkbox">
                                        {categoriesDB.map((category, index = 0) => {
                                            return (
                                                <div className="form-check" key={index}>
                                                    <input className="form-check-input" type="checkbox"
                                                           onChange={(e) => handledCategories(e.target.value)}
                                                           value={category.id_category} id={"categories" + index}/>
                                                    <label className="form-check-label"
                                                           htmlFor={"categories" + index}>{category.name}</label>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <hr/>
                                <div className="div-button">
                                    <div className="row" style={{display: "flex"}}>
                                        <Link className="col-1" to={'/list'} style={{color : "black", padding: "6px 0 0 0"}} type="submit">
                                            <img style={{height: "20px", width: "20px"}} src="https://firebasestorage.googleapis.com/v0/b/project-md6-cg.appspot.com/o/back.png?alt=media&token=2c33e5a3-f355-4f82-b095-32b64ec48bd1" alt=""/> Back</Link>
                                        <div className={"col-10"} style={{display: "flex", alignItems:"center", justifyContent:"center"}}>
                                            <button style={{width: '150px'}} type="submit"
                                                    className="btn btn-outline-danger ">Create
                                            </button>
                                        </div>
                                        <div className="col-1"></div>
                                    </div>
                                </div>
                            </Form>
                        </Formik>
                    </div>
                )
                : (
                    <div className="d-flex justify-content-center">
                        <div className="spinner-border" style={{width: "4rem", height: "4rem", marginTop: "20vh", marginBottom:"20vh"}}
                             role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                )}

            <Footer/>
            {/*{message !== "" && <Demo mess={message} test={true}/>}*/}

            {/*button modal*/}
            <button type="button" ref={btn_modal} className="btn btn-primary" data-bs-toggle="modal"
                    data-bs-target="#exampleModal" style={{display: "none"}}>
            </button>

            {/*modal*/}
            <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel"
                 aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">Notification</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"
                                    aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <span>{message}</span>
                        </div>
                        <div className="modal-footer">
                            {isExist ? (
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close
                                </button>
                            ):(
                                <button type="button" className="btn btn-secondary" onClick={() => navigate("/list")}
                                        data-bs-dismiss="modal">Close
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}