import React, {useEffect, useRef, useState} from 'react';
import * as yup from 'yup';
import {
    MDBContainer,
    MDBCard,
    MDBCardBody,
    MDBCardImage,
    MDBRow,
    MDBCol, MDBCardHeader, MDBCardFooter
}
    from 'mdb-react-ui-kit';
import formik, {ErrorMessage, Field, Form, Formik} from "formik";
import {Link, useNavigate, useParams} from "react-router-dom";
import {upImageFirebase} from "../firebase/Upfirebase";
import {saveCoupon} from "../service/CouponService";
import {toast, ToastContainer} from "react-toastify";
import Header from "../layout/Header";
import Footer from "../layout/Footer";

function CreateCoupon() {
    const navigate = useNavigate()
    let {id} = useParams();
    const [load, setLoad] = useState(true)
    const [isExist, setExist] = useState(true)
    const [image, setImage] = useState()
    const [message, setMessage] = useState()
    const btn_modal = useRef()
    const [checkDiscount, setCheckDiscount] = useState(false);
    const [discountType, setDiscountType] = useState('amount');
    const [file, setFile] = useState(undefined)
    const inputFile = useRef()
    const [coupon, setCoupon] = useState({
        name: '',
        image: '',
        discountAmount: '',
        percentageDiscount: '',
        quantity: '',
        merchant: {
            id_merchant: id
        }

    })
    let merchant = JSON.parse(localStorage.getItem("merchant"))

    const handleCreateCoupon = async (e)  => {
        let imageTemp = "https://firebasestorage.googleapis.com/v0/b/project-md6-cg.appspot.com/o/products%2FUntitled-1.png5ac3227c-399f-46b5-9371-2c8ce35e51d4?alt=media&token=109dae2e-251f-44b3-b76b-d7855e7634b2"
        if (file !== undefined) {
            const uploadResult = await upImageFirebase(file);
            imageTemp = uploadResult.name;
        }
        let createCoupon = {...e, image: imageTemp}
        console.log(createCoupon)
        saveCoupon(createCoupon).then(r => {
                if (r === true) {
                    toast.success("Create product success!!!", {containerId: 'create-coupon'})
                } else {
                    toast.error("Action error occurred. Please check again!!!", {containerId: 'create-coupon'})
                }
            }
        )
    }
    const handledInputFile = (file) => {
        setFile(file);
    }
    const handledClickInput = () => {
        inputFile.current.click();
    }

    const schema = yup.object().shape({
        name: yup.string().required().max(250),
        quantity: yup.number().required()
    });

    return (
        <>
            <Header/>
            <ToastContainer enableMultiContainer containerId={"create-coupon"} position="top-right" autoClose={2000}
                            pauseOnHover={false}
                            style={{width: "400px"}}/>
            {load ? (
                    <MDBContainer className="custom-my-4">
                        <MDBCard>
                            <Formik initialValues={coupon} onSubmit={(e) => handleCreateCoupon(e)}
                                    validationSchema={schema}>
                                <Form>
                                    <MDBCardHeader style={{backgroundColor: "white"}}>
                                        <h5
                                            style={{
                                                textAlign: "center", marginTop: "10px", marginBottom: "20px"
                                            }}>Create Coupon</h5>
                                    </MDBCardHeader>
                                    <MDBRow className='g-0'>
                                        <MDBCol md='5'>
                                            <div style={{display: "flex"}}
                                                 onClick={handledClickInput}>
                                                <div>
                                                    <input ref={inputFile} className="form-control"
                                                           name="image" type="file" id="formFile"
                                                           style={{display: 'none'}}
                                                           onChange={(e) => handledInputFile(e.target.files[0])}/>

                                                    {file === undefined ? (
                                                        <div>
                                                            <img className="image-coupon"
                                                                src="https://firebasestorage.googleapis.com/v0/b/project-md6-cg.appspot.com/o/products%2FUntitled-1.png5ac3227c-399f-46b5-9371-2c8ce35e51d4?alt=media&token=109dae2e-251f-44b3-b76b-d7855e7634b2"
                                                                 alt="placeholder"/>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <img className="image-coupon"
                                                                 src={URL.createObjectURL(file)}
                                                                 alt='image'/>
                                                        </div>)}
                                                </div>
                                            </div>
                                        </MDBCol>

                                        <MDBCol md='7'>
                                            <MDBCardBody className='d-flex flex-column'>
                                                <div style={{width: "500px", margin: 'auto'}}>
                                                    <div className="mb-3">
                                                        <label className="form-label">Name</label>
                                                        <Field className="form-control" name="name"/>
                                                        <ErrorMessage className="error" name="name" component="div"/>
                                                    </div>

                                                    <div className="mb-3">
                                                        <label className="form-label">Discount Type</label><br/>
                                                        <div className="form-check">
                                                            <input type="radio"
                                                                   id="discountTypeAmount"
                                                                   name="discountType"
                                                                   value="amount"
                                                                   className="form-check-input"
                                                                   checked={discountType === 'amount'}
                                                                   onChange={() => setDiscountType('amount')}
                                                            />
                                                            <label htmlFor="discountTypeAmount"
                                                                   className="form-check-label">Amount</label>
                                                        </div>
                                                        <div className="form-check">
                                                            <input
                                                                type="radio"
                                                                id="discountTypePercentage"
                                                                name="discountType"
                                                                value="percentage"
                                                                className="form-check-input"
                                                                checked={discountType === 'percentage'}
                                                                onChange={() => setDiscountType('percentage')}
                                                            />
                                                            <label htmlFor="discountTypePercentage"
                                                                   className="form-check-label">Percentage</label>
                                                        </div>
                                                    </div>
                                                    {discountType === 'amount' && (
                                                        <div className="mb-3">
                                                            <label className="form-label">Discount Amount</label>
                                                            <Field min="1" type="number" className="form-control"
                                                                   name="discountAmount"/>
                                                        </div>
                                                    )}
                                                    {discountType === 'percentage' && (
                                                        <div className="mb-3">
                                                            <label className="form-label">Percentage Discount</label>
                                                            <Field min="1" max="100" type="number" className="form-control"
                                                                   name="percentageDiscount"/>
                                                        </div>
                                                    )}

                                                    <div className="mb-3">
                                                        <label className="form-label">Quantity</label>
                                                        <Field type="number"  min="1" max="200" className="form-control" name="quantity"/>
                                                        <ErrorMessage className="error" name="quantity" component="div"/>
                                                    </div>

                                                </div>

                                            </MDBCardBody>
                                        </MDBCol>

                                    </MDBRow>
                                    <MDBCardFooter style={{backgroundColor: "white"}}>
                                        <div className="row">
                                            <div className="col-3">
                                                <Link to={`/list_coupon/${merchant.id_merchant}`}
                                                      style={{color: "black", padding: "6px 0 0 0"}}
                                                      type="submit">
                                                    <img style={{height: "20px", width: "20px"}}
                                                         src="https://firebasestorage.googleapis.com/v0/b/project-md6-cg.appspot.com/o/back.png?alt=media&token=2c33e5a3-f355-4f82-b095-32b64ec48bd1"
                                                         alt=""/> Back</Link>
                                            </div>
                                            <div className="col-6" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                <button style={{
                                                    width: '300px',
                                                }} type={"submit"}
                                                        className="btn btn-outline-danger">Create
                                                </button>
                                            </div>
                                            <div className="col-3"></div>
                                        </div>
                                    </MDBCardFooter>
                                </Form>
                            </Formik>
                        </MDBCard>

                    </MDBContainer>
                )
                : (
                    <div className="d-flex justify-content-center">
                        <div className="spinner-border" style={{width: "4rem", height: "4rem", marginTop: "40vh"}}
                             role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                )}
            <Footer/>
        </>
    );
}

export default CreateCoupon