import React, {useState, useRef, useEffect} from "react";
import Header from "../layout/Header";
import {toast, ToastContainer} from "react-toastify";
import {MDBCard, MDBCardBody, MDBCardFooter, MDBCardHeader, MDBCol, MDBContainer, MDBRow} from "mdb-react-ui-kit";
import {ErrorMessage, Field, Form, Formik} from "formik";
import {useParams} from "react-router-dom";
import {findAccountById,updateAccount} from "../service/AccountService";
import {findCity, findDistrict, findWard} from "../service/MerchantService";
import {upImageFirebase} from "../firebase/Upfirebase";
import Footer from "../layout/Footer";
import {handledSendAccountSelf} from "../service/Websocket";

export default function Profile() {
    const [account, setAccount] = useState({})
    const [file, setFile] = useState()
    const inputFile = useRef()
    const [city, setCity] = useState()
    const [ward, setWard] = useState()
    const [district, setDistrict] = useState()
    const [address, setAddress] = useState()
    const [addressDB, setAddressDB] = useState()
    const [image, setImage] = useState(undefined)
    let {id} = useParams();
    const btn_modal = useRef()
    useEffect(() => {
        const fetchData = async () => {
            try {
                const account = await findAccountById(id);
                if (account) {
                    setAccount(account);
                    setAddressDB(account.addressDelivery);

                    const city = await findCity();
                    if (city) {
                        setCity(city);

                        if (account.addressDelivery && account.addressDelivery.city) {
                            const dataDistrict = await findDistrict(account.addressDelivery.city.id_city);
                            if (dataDistrict) {
                                setDistrict(dataDistrict);

                                if (dataDistrict && dataDistrict.id_district) {
                                    const dataWard = await findWard(dataDistrict.id_district);
                                    if (dataWard) {
                                        setWard(dataWard);
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const handleUpdateProfile = async (e) => {
        try {
            let imageTemp =  account.image;
            if (image !== undefined) {
                const uploadedImage = await upImageFirebase(image);
                imageTemp = uploadedImage.name;
            }
            const updateProfile = {
                ...e,
                addressDelivery: addressDB,
                image: imageTemp
            };
            const updateResult = await updateAccount(updateProfile);
            if (updateResult) {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                handledSendAccountSelf(userInfo, userInfo)
                toast.success("Update Successfully!",{containerId: "update-profile"})

            }
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    }
    const handledClickInput = () => {
        inputFile.current.click();
    }
    const handleInputChangeCity = (e) => {
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
    useEffect(() => {
        findCity().then(r => {
            setCity(r)
        }).catch(error => {
                btn_modal.current.click();
            }
        )
    }, []);

    const handleInputChangeImage = (e) => {
        const file = e.target.files[0]
        if (!file) {
        }
        setImage(file)
        setFile(e.target.files[0])
    }
    return (
        <>
            <Header/>
            <ToastContainer enableMultiContainer containerId={"update-profile"} position="top-right" autoClose={2000}
                            pauseOnHover={false}
                            style={{width: "300px"}}/>
            <MDBContainer className="custom-my-4">
                <MDBCard>
                    <Formik initialValues={account} onSubmit={(e) => handleUpdateProfile(e)}
                            enableReinitialize={true}>
                        <Form>
                            <MDBCardHeader style={{backgroundColor: "white"}}>
                                <h5
                                    style={{
                                        textAlign: "center", marginTop: "10px", marginBottom: "20px"
                                    }}>Update Profile</h5>
                            </MDBCardHeader>
                            <MDBRow className='g-0'>

                                <MDBCol md='5'>
                                    <div style={{display: "flex", paddingLeft: "40px"}}
                                         onClick={handledClickInput}>
                                        <div>
                                            <input ref={inputFile} className="form-control"
                                                   name="image" type="file" id="formFile"
                                                   style={{display: 'none'}}
                                                   onChange={(e) => handleInputChangeImage(e)}/>

                                            {file === undefined && account.image !== "" ? (
                                                <div>
                                                    <img className="image-update" src={account.image} alt="coupon-img"/>
                                                </div>
                                            ) : (
                                                <div>
                                                    <img className='image-update' alt="image"
                                                         src={URL.createObjectURL(file)}/>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </MDBCol>

                                <MDBCol md='7'>
                                    <MDBCardBody className='d-flex flex-column'>
                                        <div style={{width: "500px", margin: 'auto'}}>
                                            <div className="mb-3">
                                                <label className="form-label">Username</label>
                                                <Field className="form-control" name="name"/>
                                                <ErrorMessage className="error" name="name" component="div"/>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Full name</label>
                                                <Field className="form-control" name="fullName"/>
                                                <ErrorMessage className="error" name="fullName" component="div"/>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Email</label>
                                                <Field disabled className="form-control" name="email"/>
                                                <ErrorMessage className="error" name="email" component="div"/>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Phone Number</label>
                                                <Field disabled className="form-control" name="phone"/>
                                                <ErrorMessage className="error" name="phone" component="div"/>
                                            </div>
                                            <div className="row"
                                                 style={{marginLeft: "0px", marginRight: "0px"}}>
                                                <div className="mb-3 col-6"
                                                     style={{paddingLeft: "0px"}}>
                                                    <label className="form-label"
                                                           htmlFor="city">City</label>
                                                    <select id="city" required
                                                            onChange={handleInputChangeCity}
                                                            className="form-select">
                                                        <option>City</option>
                                                        {city && city.map(item => {
                                                            if (item.id_city === addressDB.city.id_city){
                                                                return(
                                                                    <option selected value={item.id_city}>{item.name}</option>
                                                                )
                                                            }else {
                                                                return (
                                                                    <option value={item.id_city}>{item.name}</option>
                                                                )
                                                            }
                                                        })}
                                                    </select>
                                                </div>
                                                <div className="mb-3 col-6"
                                                     style={{paddingRight: "0px"}}>
                                                    <label className="form-label"
                                                           htmlFor="district">District</label>
                                                    <select required id="district"
                                                            onChange={handleInputChangeDistrict}
                                                            className="form-select">
                                                        <option> District</option>
                                                        {district && district.map(item =>{
                                                            if (item.id_district === addressDB.district.id_district){
                                                                return(
                                                                    <option selected value={item.id_district}>{item.name}</option>
                                                                )
                                                            }else {
                                                                return (
                                                                    <option value={item.id_district}>{item.name}</option>
                                                                )
                                                            }
                                                        })}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="row"
                                                 style={{marginLeft: "0px", marginRight: "0px"}}>
                                                <div className="mb-3 col-6"
                                                     style={{paddingLeft: "0px"}}>
                                                    <label className="form-label"
                                                           htmlFor="ward">Ward</label>
                                                    <select required onChange={handleInputChangeWard}
                                                            id="ward"
                                                            className="form-select">
                                                        <option>Ward</option>
                                                        {ward && ward.map(item => {
                                                            if (item.id_ward === addressDB.ward.id_ward){
                                                                return(
                                                                    <option selected value={item.id_ward}>{item.name}</option>
                                                                )
                                                            }else {
                                                                return (
                                                                    <option value={item.id_ward}>{item.name}</option>
                                                                )
                                                            }
                                                        })}
                                                    </select>
                                                </div>
                                                <div className="mb-3 col-6"
                                                     style={{paddingRight: "0px"}}>
                                                    <label className="form-label">Detail</label>
                                                    {addressDB && (
                                                        <input defaultValue={addressDB.address_detail}
                                                               className="form-control input-focus input-register-form"
                                                               onChange={(e) => setAddress({
                                                                   ...address,
                                                                   address_detail: e.target.value
                                                               })}/>
                                                    )}

                                                </div>
                                            </div>
                                        </div>

                                    </MDBCardBody>
                                </MDBCol>

                            </MDBRow>
                            <MDBCardFooter style={{backgroundColor: "white"}}>
                                <div className="row">
                                    <div className="col-3">
                                    </div>
                                    <div className="col-6"
                                         style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                        <button style={{
                                            width: '300px',
                                        }} type={"submit"}
                                                className="btn btn-outline-danger">Update
                                        </button>
                                    </div>
                                    <div className="col-3"></div>
                                </div>
                            </MDBCardFooter>
                        </Form>
                    </Formik>

                </MDBCard>

            </MDBContainer>
            <Footer/>
        </>
    )
}