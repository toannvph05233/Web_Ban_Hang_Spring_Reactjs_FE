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
import {Link, useNavigate, useParams} from "react-router-dom";
import {
    findAllActivity,
    findCity,
    findDistrict,
    findMerchantById,
    findWard,
    saveMerchant, updateMerchant
} from "../service/MerchantService";
import {upImageFirebase} from "../firebase/Upfirebase";
import axios from "axios";
import {toast, ToastContainer} from "react-toastify";
import Header from "../layout/Header";
import Footer from "../layout/Footer";

function UpdateMerchant() {
    let navigate = useNavigate();
    let {id} = useParams()
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
            id_activity: ''
        },
        name: '',
        phone: '',
        email: '',
        open_time: '',
        close_time: '',
        image: ''
    })
    const [address, setAddress] = useState(undefined)
    const [activity, setActivity] = useState([])
    const [address_detail, setAddress_detail] = useState()
    const account = JSON.parse(localStorage.getItem("userInfo"))
    const inputFileMerchant = useRef()
    const [activityUpdate, setActivityUpdate] = useState()
    const [check, setCheck] = useState(true)


    useEffect(() => {
        if (account !== null) {
            findMerchantById(id).then(dataMerchant => {
                console.log(dataMerchant)
                setMerchant(dataMerchant)
                setActivityUpdate(dataMerchant.activity)
                setAddress_detail(dataMerchant.addressShop.address_detail)
                findAllActivity().then(dataActivity => {
                    setActivity(dataActivity)
                }).catch(() => {
                    toast.error("Error display Activity!!!", {containerId: "update-merchant"})
                })
                findCity().then(r => {
                    setCity(r)
                })
                findDistrict(dataMerchant.addressShop.city.id_city).then(dataDistrict => {
                    setDistrict(dataDistrict)
                })
                findWard(dataMerchant.addressShop.district.id_district).then(dataWard => {
                    setWard(dataWard)
                })
            }).catch(e => {
                toast.error("There is no data on this Merchant!!!", {containerId: "update-merchant"})
            })
        } else {
            toast.error("Please login!!!", {containerId: "update-merchant"})
        }
    }, [check]);


    const handleUpdateMerchant = async (e) => {
        setLoad(false);
        try {
            let updatedImage = merchant.image;
            let updatedAddress = merchant.addressShop;
            if (image !== undefined) {
                const uploadedImage = await upImageFirebase(image);
                updatedImage = uploadedImage.name;
            }
            if (address !== undefined) {
                updatedAddress = address;
            }
            const registerMerchant = {
                ...e, addressShop: updatedAddress, account: {id_account: account.id},
                image: updatedImage, activity: activityUpdate
            };
            updateMerchant(registerMerchant).then(r => {
                    toast.success("Update success!!!", {containerId: "update-merchant"})
                    setLoad(true)
                    setExist(false)
                    setCheck(!check)
                }
            ).catch(e => {
                    toast.error("Update error, try again!!!", {containerId: "update-merchant"})
                }
            )
        } catch (Error) {
            toast.error("Update error, try again!!!", {containerId: "update-merchant"})
            setLoad(true);
        }
    }

    const handleActivity = (id_activity) => {
        let item = {id_activity: id_activity}
        if (id_activity === "1") {
            if (window.confirm("The merchant will be shut down, are you sure?")) {
                setActivityUpdate({...item})
            }
        } else {
            setActivityUpdate({...item})
        }
    }

    const handleInputChangeCity = (e) => {
        setAddress_detail(null)
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
            setWard([])
        }).catch(error => {
            toast.error("Error display District!!!", {containerId: "update-merchant"})
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
            toast.error("Error display Ward!!!", {containerId: "update-merchant"})
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
        if (!file) {
            setMessage("Please choose image for the newMerchant!!!")
            btn_modal.current.click();
        }
        setImage(file)
    }

    function handleInputFileMerchant() {
        inputFileMerchant.current.click();
    }

    const schema = yup.object().shape({
        name: yup.string().required(),
        open_time: yup.string().required(),
        close_time: yup.string().required()
    });

    return (
        <>
            <Header/>
            <ToastContainer enableMultiContainer containerId={"update-merchant"} position="top-right" autoClose={2000}
                            pauseOnHover={false}
                            style={{width: "400px"}}/>
            {load ? (
                    <MDBContainer>
                        <MDBCard style={{marginTop : "20px", marginBottom : "20px"}}>
                            <MDBRow className='g-0'>

                                <MDBCol md='5'>
                                    <MDBCardImage style={{height: '100%'}}
                                                  src='https://kenh14cdn.com/thumb_w/660/203336854389633024/2021/3/30/photo-1-16170954931802133008298.jpg'
                                                  alt="register form" className='rounded-start w-100'/>
                                </MDBCol>

                                <MDBCol md='7'>
                                    <MDBCardBody className='d-flex flex-column'>

                                        <h4 className="fw-normal my-4"
                                            style={{
                                                letterSpacing: '1px',
                                                fontWeight: 'bolder',
                                                textAlign: "center"
                                            }}>Update Merchant</h4>
                                        <hr style={{marginTop: "0"}}/>
                                        <div style={{width: "600px", margin: 'auto'}}>
                                            <Formik initialValues={merchant} onSubmit={(e) => handleUpdateMerchant(e)}
                                                    validationSchema={schema} enableReinitialize={true}>
                                                <Form>
                                                    <div className="row div-input">
                                                        <div className="mb-3 col-6" style={{paddingLeft: "0px"}}>
                                                            <label className="form-label">Name</label>
                                                            <Field className="form-control" name="name"/>
                                                            <ErrorMessage className="error" name="name" component="div"/>
                                                        </div>
                                                        <div className="mb-3 col-6" style={{paddingRight: "0px"}}>
                                                            <label className="form-label">Email</label>
                                                            <div className="form-control">{merchant.email}</div>
                                                        </div>
                                                    </div>
                                                    <div className="row div-input">
                                                        <div className="mb-3 col-6" style={{paddingLeft: "0px"}}>
                                                            <label className="form-label">Phone</label>
                                                            <div className="form-control">{merchant.phone}</div>
                                                        </div>
                                                        <div className="mb-3 col-6" style={{paddingRight: "0px"}}>
                                                            <label className="form-label">Activity</label>
                                                            <select onChange={(e) => handleActivity(e.target.value)}
                                                                    className="form-select">
                                                                {activity && activity.map(item => {
                                                                    if (item.id_activity === activityUpdate.id_activity) {
                                                                        return (
                                                                            <option selected
                                                                                    value={item.id_activity}>{item.name}</option>
                                                                        )
                                                                    } else {
                                                                        return (
                                                                            <option
                                                                                value={item.id_activity}>{item.name}</option>
                                                                        )
                                                                    }
                                                                })}
                                                            </select>
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

                                                    <div className="row div-input">
                                                        <div className="mb-3 col-6" style={{paddingLeft: "0px"}}>
                                                            <label className="form-label" htmlFor="ward">City</label>
                                                            <select onChange={handleInputChangeCity}
                                                                    className="form-select col-6">
                                                                {city && city.map(item => {
                                                                    if (item.id_city === merchant.addressShop.city.id_city) {
                                                                        return (
                                                                            <option selected
                                                                                    value={item.id_city}>{item.name}</option>
                                                                        )
                                                                    } else {
                                                                        return (
                                                                            <option
                                                                                value={item.id_city}>{item.name}</option>
                                                                        )
                                                                    }
                                                                })}
                                                            </select>
                                                        </div>
                                                        <div className="mb-3 col-6" style={{paddingRight: "0px"}}>
                                                            <label className="form-label" htmlFor="ward">District</label>
                                                            <select onChange={handleInputChangeDistrict}
                                                                    className="form-select col-6">
                                                                {district && district.map(item => {
                                                                    if (item.id_district === merchant.addressShop.district.id_district) {
                                                                        return (
                                                                            <option selected
                                                                                    value={item.id_district}>{item.name}</option>
                                                                        )
                                                                    } else {
                                                                        return (
                                                                            <option
                                                                                value={item.id_district}>{item.name}</option>
                                                                        )
                                                                    }
                                                                })}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="row div-input">
                                                        <div className="mb-3 col-6" style={{paddingLeft: "0px"}}>
                                                            <label className="form-label" htmlFor="ward">Ward</label>
                                                            <select onChange={handleInputChangeWard} id="ward"
                                                                    className="form-select">
                                                                {/*<option>{merchant.addressShop.ward.name}</option>*/}
                                                                <option>Ward</option>
                                                                {ward && ward.map(item => {
                                                                    if (item.id_ward === merchant.addressShop.ward.id_ward) {
                                                                        return (
                                                                            <option selected
                                                                                    value={item.id_ward}>{item.name}</option>
                                                                        )
                                                                    } else {
                                                                        return (
                                                                            <option
                                                                                value={item.id_ward}>{item.name}</option>
                                                                        )
                                                                    }
                                                                })}
                                                            </select>
                                                        </div>
                                                        <div className="mb-3 col-6" style={{paddingRight: "0px"}}>
                                                            <label className="form-label">Detail</label>
                                                            <input defaultValue={address_detail} className="form-control"
                                                                   onChange={(e) => setAddress({
                                                                       ...address,
                                                                       address_detail: e.target.value
                                                                   })}/>
                                                        </div>
                                                    </div>

                                                    <div className="row">
                                                        <div className="col-6">
                                                            <label onClick={handleInputFileMerchant} className="form-label"
                                                                   style={{width: "300px", height: "150px"}}>Image</label>
                                                            <div>
                                                                <Link to={'/list'}
                                                                      style={{color: "black", marginRight: "30px"}}>
                                                                    <img style={{height: "20px", width: "20px"}} src="https://firebasestorage.googleapis.com/v0/b/project-md6-cg.appspot.com/o/back.png?alt=media&token=2c33e5a3-f355-4f82-b095-32b64ec48bd1" alt=""/> Back
                                                                </Link>
                                                                <button style={{width: '150px'}} type={"submit"}
                                                                        className="btn btn-outline-danger">Save
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="col-6" onClick={handleInputFileMerchant}>
                                                            {image === undefined ? (
                                                                <div style={{position: "relative"}}
                                                                     className="file-merchant">
                                                                    <div>
                                                                        <img className='img-merchant' alt="image"
                                                                             src={merchant.image}/>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div style={{position: "relative"}}
                                                                     className="file-merchant">
                                                                    <div>
                                                                        <img className="img-merchant"
                                                                             src={URL.createObjectURL(image)}
                                                                             alt='image'/>
                                                                    </div>
                                                                </div>)}
                                                            <input ref={inputFileMerchant} className="form-control"
                                                                   type="file" style={{display: 'none'}}
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
                        <div className="spinner-border"
                             style={{width: "4rem", height: "4rem", marginTop: "20vh", marginBottom: "20vh"}}
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
                            ) : (
                                <button type="button" className="btn btn-secondary" onClick={() => navigate("/list")}
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

export default UpdateMerchant;



