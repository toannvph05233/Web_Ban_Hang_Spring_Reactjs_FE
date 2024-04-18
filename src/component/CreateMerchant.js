import React, {useEffect, useRef, useState} from 'react';
import * as yup from 'yup';
import {
    MDBBtn,
    MDBContainer,
    MDBCard,
    MDBCardBody,
    MDBCardImage,
    MDBRow,
    MDBCol,
    MDBIcon,
    MDBInput
}
    from 'mdb-react-ui-kit';
import {ErrorMessage, Field, Form, Formik} from "formik";
import {Link, useNavigate} from "react-router-dom";
import {findCity, findDistrict, findMerchantByAccount, findWard, saveMerchant} from "../service/MerchantService";
import {upImageFirebase} from "../firebase/Upfirebase";
import {mailRegisterSuccess} from "../service/MailService";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import {toast, ToastContainer} from "react-toastify";

function FormRegister() {
    let navigate = useNavigate();
    const [load, setLoad] = useState(true)
    const [isExist, setExist] = useState(true)
    const [city, setCity] = useState([])
    const [district, setDistrict] = useState([])
    const [ward, setWard] = useState([])
    const [image, setImage] = useState(undefined)
    const [message, setMessage] = useState()
    const btn_modal = useRef()
    const [merchant, setMerchant] = useState({
        activity: {
            id_activity: 3
        },
        name: '',
        phone: '',
        email: '',
        open_time: '',
        close_time: '',
        image: ''
    });
    const [address, setAddress] = useState({})
    const inputFileMerchant = useRef()
    const account = JSON.parse(localStorage.getItem("userInfo"))

    function handleInputFileMerchant(){
        inputFileMerchant.current.click();
    }

    const handleCreateMerchant = (e) => {
        if (image === undefined){
            toast.error("Please choose image for the product!!!", {containerId : "register-merchant"})
            return
        }
        if (account !== null){
            setLoad(false)
            upImageFirebase(image).then(r => {
                let registerMerchant = {...e, addressShop: address, image: r.name, account: {id_account : account.id}}
                console.log(registerMerchant)
                saveMerchant(registerMerchant).then(r => {
                    if (r === true){
                        findMerchantByAccount(account.id).then(merchant =>{
                            localStorage.setItem("merchant", JSON.stringify(merchant))
                        })
                        toast.success("Register success!!!", {containerId : "register-merchant"})
                        mailRegisterSuccess(e.email)
                        setLoad(true)
                        setExist(false)
                         setTimeout(()=>{
                             navigate("/")
                             window.location.reload()
                         }, 2500)
                    }  else {
                        toast.error("Register error, try again!!!", {containerId : "register-merchant"})
                        setLoad(true)
                    }
                })
            })
        }else {
            toast.error("Please login and try again!!!", {containerId : "register-merchant"})
        }
    }

    const  handleInputChangeCity = (e) => {
        const fieldValue = e.target.value;
        findDistrict(fieldValue).then(r => {
            setDistrict(r)
            setAddress(x => {
                return {
                    ...x,
                    city: {
                        id_city: fieldValue
                    }
                };
            });
        }).catch(error => {
            toast.error("Error display District!!!", {containerId : "register-merchant"})
        })
    }

    const handleInputChangeDistrict = (e) => {
        const fieldValue = e.target.value;
        findWard(fieldValue).then(r => {
            setWard(r)
            setAddress(x => {
                return {
                    ...x,
                    district: {
                        id_district: fieldValue
                    }
                };
            });
        }).catch(error => {
            toast.error("Error display Ward!!!", {containerId : "register-merchant"})
        })
    }

    const handleInputChangeWard = (e) => {
        const fieldValue = e.target.value;
        setAddress(x => {
            return {
                ...x,
                ward: {
                    id_ward: fieldValue
                }
            };
        });
    }

    const handleInputChangeImage = (e) => {
        const file = e.target.files[0]
        setImage(file)
    }

    useEffect(() => {
        findCity().then(r => {
            setCity(r)
        }).catch(error => {
            toast.error("Error display City!!!", {containerId : "register-merchant"})
            }
        )
    }, []);

    const schema = yup.object().shape({
        name: yup.string().required(),
        phone: yup.string()
            .matches(/^0\d{9}$/, "Phone number must have 10 digits")
            .required(),
        email: yup.string().required().matches(/^[A-Za-z0-9._-]+@[A-Za-z]+\.[A-Za-z]{2,}$/, ("with @ and no special characters")),
        open_time: yup.string().required(),
        close_time: yup.string().required(),
    });

    return (
        <>
            <Header/>
            <ToastContainer enableMultiContainer containerId={"register-merchant"} position="top-right" autoClose={2000} pauseOnHover={false}
                            style={{width: "400px"}}/>
            {load ? (
                    <MDBContainer>
                        <MDBCard style={{marginTop : "20px", marginBottom : "20px"}}>
                            <MDBRow className='g-0'>

                                <MDBCol md='5'>
                                    <MDBCardImage style={{height: '100%'}}
                                                  src='https://firebasestorage.googleapis.com/v0/b/react-firebase-storage-f6ec9.appspot.com/o/file%2FdoAnNgon.jpg?alt=media&token=e3c3377c-463d-481d-bb04-ba2d890e27b9'
                                                  alt="register form" className='rounded-start w-100'/>
                                </MDBCol>

                                <MDBCol md='7'>
                                    <MDBCardBody className='d-flex flex-column'>

                                        <h4 className="fw-normal my-4"
                                            style={{
                                                letterSpacing: '1px',
                                                fontWeight: 'bolder',
                                                textAlign: "center"
                                            }}>Register Merchant</h4>
                                        <hr style={{marginTop: "0"}}/>
                                        <div style={{width: "600px", margin: 'auto'}}>
                                            <Formik initialValues={merchant} onSubmit={(e) => handleCreateMerchant(e)}
                                                    validationSchema={schema}>
                                                <Form>
                                                    <div className="row div-input">
                                                        <div className="mb-3" style={{paddingLeft: "0px"}}>
                                                            <label className="form-label" >Name</label>
                                                            <Field className="form-control" name="name"/>
                                                            <ErrorMessage className="error" name="name" component="div"/>
                                                        </div>
                                                    </div>
                                                    <div className="row div-input">
                                                        <div className="mb-3 col-6" style={{paddingLeft: "0px"}}>
                                                            <label className="form-label">Phone</label>
                                                            <Field className="form-control" name="phone"/>
                                                            <ErrorMessage className="error" name="phone" component="div"/>
                                                        </div>
                                                        <div className="mb-3 col-6" style={{paddingRight: "0px"}}>
                                                            <label className="form-label">Email</label>
                                                            <Field type="email" className="form-control" name="email"/>
                                                            <ErrorMessage className="error" name="email" component="div"/>
                                                        </div>
                                                    </div>
                                                    <div className="row div-input">
                                                        <div className="mb-3 col-6" style={{paddingLeft: "0px"}}>
                                                            <label className="form-label">Open Time</label>
                                                            <Field type="time" className="form-control" name="open_time"/>
                                                            <ErrorMessage className="error" name="open_time"
                                                                          component="div"/>
                                                        </div>
                                                        <div className="mb-3 col-6" style={{paddingRight: "0px"}}>
                                                            <label className="form-label">Close Time</label>
                                                            <Field type="time" className="form-control" name="close_time"/>
                                                            <ErrorMessage className="error" name="close_time"
                                                                          component="div"/>
                                                        </div>
                                                    </div>
                                                    <div className="row div-input" >
                                                        <div className="mb-3 col-6" style={{paddingLeft: "0px"}}>
                                                            <label className="form-label" htmlFor="city">City</label>
                                                            <select id="city" required onChange={handleInputChangeCity}
                                                                    className="form-select">
                                                                <option>City</option>
                                                                {city && city.map(item => (
                                                                    <option value={item.id_city}>{item.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="mb-3 col-6" style={{paddingRight: "0px"}}>
                                                            <label className="form-label" htmlFor="district">District</label>
                                                            <select required id="district" onChange={handleInputChangeDistrict}
                                                                    className="form-select">
                                                                <option> District</option>
                                                                {district && district.map(item => (
                                                                    <option value={item.id_district}>{item.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="row div-input">
                                                        <div className="mb-3 col-6" style={{paddingLeft: "0px"}}>
                                                            <label className="form-label" htmlFor="ward">Ward</label>
                                                            <select required onChange={handleInputChangeWard} id="ward"
                                                                    className="form-select">
                                                                <option>Ward</option>
                                                                {ward && ward.map(item => (
                                                                    <option value={item.id_ward}>{item.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="mb-3 col-6" style={{paddingRight: "0px"}}>
                                                            <label className="form-label">Detail</label>
                                                            <input className="form-control" onChange={(e) => setAddress({
                                                                ...address,
                                                                address_detail: e.target.value
                                                            })}/>
                                                        </div>
                                                    </div>

                                                    <div className="row">
                                                        <div className="col-6">
                                                            <label onClick={handleInputFileMerchant} className="form-label" style={{width: "300px",height: "150px"}}>Image</label>
                                                            <div>
                                                                <Link to={'/'} style={{color: "black", marginRight: "30px"}}>
                                                                    <img style={{height: "20px", width: "20px"}} src="https://firebasestorage.googleapis.com/v0/b/project-md6-cg.appspot.com/o/back.png?alt=media&token=2c33e5a3-f355-4f82-b095-32b64ec48bd1" alt=""/> Back
                                                                </Link>
                                                                <button style={{width: '150px'}} type={"submit"}
                                                                        className="btn btn-outline-danger">Register
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="col-6" onClick={handleInputFileMerchant}>
                                                            {image === undefined ? (
                                                                <div style={{position: "relative"}}
                                                                     className="file-merchant">
                                                                    <div>
                                                                        <img className='img-merchant' alt="image"
                                                                             src={"https://binamehta.com/wp-content/uploads/image-placeholder-300x200.png"}/>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div style={{position: "relative"}}
                                                                     className="file-merchant">
                                                                    <div>
                                                                        <img className="img-merchant" src={URL.createObjectURL(image)}
                                                                             alt='image'/>
                                                                    </div>
                                                                </div>)}
                                                            <input ref={inputFileMerchant} className="form-control" type="file" style={{display: 'none'}}
                                                                   onChange={(e) => handleInputChangeImage(e)}/>
                                                        </div>
                                                    </div>
                                                </Form>
                                            </Formik>
                                        </div>

                                    </MDBCardBody>
                                </MDBCol>

                            </MDBRow>
                        </MDBCard>

                    </MDBContainer>
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
                                <button type="button" className="btn btn-secondary" onClick={() => navigate("/")}
                                        data-bs-dismiss="modal">Close
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default FormRegister;



