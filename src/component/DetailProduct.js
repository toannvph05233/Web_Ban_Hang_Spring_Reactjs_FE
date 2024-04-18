import {Link, useParams} from "react-router-dom";

import React, {useEffect, useRef, useState} from "react";
import {addToCart} from "../service/CartService";
import {findOneProduct, getAllProductByIdMerchant, MostPurchasedProducts} from "../service/ProductService";
import {couponByIdMerchant} from "../service/CouponService";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import {toast, ToastContainer} from "react-toastify";
import {findAccountByMerchant} from "../service/AccountService";
import {handledSendAccountSelf, handledSendNotification} from "../service/Websocket";

function DetailProduct() {
    let {id} = useParams();
    const [product, setProduct] = useState({});
    const [products, setProducts] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [everyoneLikes, setEveryoneLikes] = useState([]);
    const [merchant, setMerchant] = useState({})
    const [quantity, setQuantity] = useState(1);
    const account = JSON.parse(localStorage.getItem("userInfo"))
    const btn_modal = useRef()
    const [message, setMessage] = useState("");


    useEffect(() => {
        findOneProduct(id).then(data => {
            setProduct(data)
            setMerchant(data.merchant)
            getAllProductByIdMerchant(data.merchant.id_merchant).then(r => {
                let arr = r.reverse();
                setProducts(arr.slice(0,5));
            });
            couponByIdMerchant(data.merchant.id_merchant).then(r => {
                setCoupons(r)
            })
        })
        MostPurchasedProducts().then(r => {
            const limitedProducts = r.slice(0, 10);
            setEveryoneLikes([...limitedProducts]);
        })
    }, []);
    const handleQuantityChange = (event) => {
        let quantityInput = document.getElementById("quantity_p");
        let newValue = parseInt(event.target.value, 10);
        if (!isNaN(newValue) && newValue >= 1 && newValue <= 20) {
            quantityInput.value = newValue
            // setQuantity(newValue);
            console.log(quantity)
        }
    };
    const addition = () => {
        let quantityInput = document.getElementById("quantity_p");
        let currentValue = parseInt(quantityInput.value, 10);
        if (currentValue <= 19) {
            let newValue = currentValue + 1;
            quantityInput.value = newValue;
             // setQuantity(newValue);
        } else {
            quantityInput.value = currentValue
        }
    }
    const subtraction = () => {
        let quantityInput = document.getElementById("quantity_p");
        let currentValue = parseInt(quantityInput.value, 10);
        if (currentValue >= 2) {
            let newValue = currentValue - 1;
            quantityInput.value = newValue;
            // setQuantity(newValue);
        } else {
            quantityInput.value = currentValue
        }
    }

    const handleAddToCart = () => {
        let quantityOrder = document.getElementById("quantity_p").value;
        if (account !== null){
            findAccountByMerchant(merchant.id_merchant).then(res=>{
                if(res !== undefined && res.id_account === account.id){
                    toast.error('Your action is not authorized, please try again later!', {containerId: 'detail-product'});
                    return
                }
                let cartDetail = {price: product.priceSale, quantity: quantityOrder, product: product}
                console.log(cartDetail)
                addToCart(account.id, cartDetail).then(res => {
                    if (res === true) {
                        handledSendAccountSelf(account, account)
                        toast.success('Add to cart success!!!', {containerId: 'detail-product'});
                    }
                })
            })

        }else {
            toast.error('Please login!!!', {containerId: 'detail-product'});
        }
    }


    return (
        <>
            <Header/>
            <ToastContainer enableMultiContainer containerId="detail-product" position="top-center"
                            autoClose={2000} pauseOnHover={false}
                            style={{width: "300px"}}/>
            <div onLoad={window.scrollTo({ top: 0, behavior: 'instant' })} className="now-detail-restaurant clearfix" >
                <div className="container">
                    <div className="row" style={{marginTop: "20px"}}>
                        <div className="">
                            <div className="">
                                <div style={{paddingRight: '0px', paddingLeft: '65px'}} className="col-md-12">

                                    {/*kích thước detail product*/}

                                    <div className="row p-2 bg-white border rounded" style={{height: "400.777778px"}}>
                                        <div className="col-md-3 mt-1">
                                            <img style={{width: '600px', height: '370px'}}
                                                 src={product.image}  alt={"eroor"}/></div>
                                        <div style={{paddingLeft: '400px'}} className="col-md-7 mt-1">
                                               <h3 className="name-title">{product.name}</h3>
                                            <div className="d-flex flex-row">
                                                <div className="ratings mr-2">
                                                    <small style={{color: '#d1d124'}} className="fas fa-star"></small>
                                                    <small style={{color: '#d1d124'}} className="fas fa-star"></small>
                                                    <small style={{color: '#d1d124'}} className="fas fa-star"></small>
                                                    <small style={{color: '#d1d124'}} className="fas fa-star-half-alt"></small>
                                                    <small style={{color: '#d1d124'}} className="far fa-star"></small>
                                                </div>
                                                <span>{product.purchase}</span>
                                            </div>
                                            <div className="mt-1 mb-1 spec-1" style={{width: "400px"}}>
                                                <h5><Link
                                                 to={`/detail_merchant/${merchant.id_merchant}`}>{merchant.name} - Shop Online</Link></h5>
                                            </div>
                                            <div className="mt-1 mb-1 spec-1" >
                                                <span style={{fontSize: '20px'}}>Categories: </span>
                                                    {product.categories && product.categories.map(item => (
                                                        <span style={{marginLeft: '3px', fontSize: '18px'}}>{item.name}. </span>
                                                    ))}
                                                </div>
                                            <div className="mt-1 mb-1 spec-1">
                                                <span style={{fontSize: '20px'}}>Time make : </span>
                                                <span style={{fontSize: '18px'}}>{product.timeMake}</span>
                                            </div>
                                                <div className="d-flex flex-row align-items-center" style={{width: "400px"}}>
                                                    <del style={{marginRight: '8px', marginTop: '5px', marginBottom: '10px'}}
                                                        className="mr-1">{product.price} <del>VND</del></del>
                                                    <span style={{marginBottom: '8px'}} className="strike-text">
                                                        <i style={{color: 'red', marginLeft: '8px'}} className="fa-solid fa-tag"></i>
                                                    <span style={{fontSize: '21px', marginLeft: '8px'}}>{product.priceSale} <span style={{fontSize: '15px'}}>VND</span></span>
                                                    </span>
                                                </div>
                                                <h6 className="text-success">Free shipping</h6>
                                                <div className="d-flex flex-column mt-4">
                                                        <div className="input-group quantity mr-3" style={{width: '130px'}}>
                                                            <div className="input-group-btn" id="minus_div">
                                                                <button onClick={subtraction} style={{
                                                                    backgroundColor: '#ff5757',
                                                                    padding: '5px',
                                                                    display: 'inline-block',
                                                                    borderRadius: '10px',
                                                                    width: '35px',
                                                                    border: 'none'
                                                                }}>
                                                                    {/*tru*/}
                                                                    <i style={{color: "white"}} className="fa fa-minus"></i>
                                                                </button>
                                                            </div>
                                                            <input style={{
                                                                borderRadius: '8px',
                                                                marginLeft: '10px',
                                                                color: 'white',
                                                                backgroundColor: '#ff5757',
                                                            }} type="text" className="form-control bg-secondary text-center"
                                                                   id="quantity_p"
                                                                   defaultValue={1}
                                                                   onChange={handleQuantityChange}/>
                                                            <div style={{marginLeft: '10px'}} className="input-group-btn" id="plus_div">
                                                                <button onClick={addition} style={{
                                                                    backgroundColor: '#ff5757',
                                                                    padding: '5px',
                                                                    display: 'inline-block',
                                                                    borderRadius: '10px',
                                                                    width: '35px',
                                                                    border: 'none'
                                                                }}>
                                                                    {/*cong*/}
                                                                    <i style={{color: "white"}} className="fa fa-plus"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    <button style={{
                                                        backgroundColor: '#ff5757',
                                                        color: 'white',
                                                        border: 'none',
                                                        width: '200px',
                                                        borderRadius: '5px',
                                                        height: '35px'
                                                    }} onClick={handleAddToCart} className="btn btn-outline-primary btn-sm mt-2" type="button">
                                                        <i className="fa fa-shopping-cart mr-1"></i>Add to card
                                                    </button>
                                                </div>
                                        </div>

                                    </div>





                                </div>
                            </div>
                        </div>




                    </div>
                </div>
            </div>

            {/*list sp*/}
            <section className="home-page">
                <section className="section-newsfeed">
                    <main className="container">
                        <section className="section-newsfeed">
                            <div className="title with-action">
                                <h2>List product</h2>
                            </div>
                            <div className="content">
                                <div className="list-view">
                                    {products && products.map(item => (
                                        <div onClick={() => {
                                            document.getElementById("quantity_p").value = 1
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                            setProduct(item)
                                            setMerchant(item.merchant)
                                        }} className="list-item eatery-item-landing">
                                            <div className="img-lazy figure square">
                                                <div className="img"
                                                     style={{backgroundImage: `url(${item.image})`}}>
                                                </div>
                                            </div>
                                            <div className="content">
                                                <div className="name mb-5">
                                                    {item.name}
                                                </div>
                                                <div className="name mb-5">
                                                    Purchase: {item.purchase}
                                                </div>
                                                <div className="promotion">
                                                    <i className="fa-solid fa-tag"></i>
                                                    <span>{item.priceSale.toLocaleString()} VND</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <a className="btn-view-all">
                                    See all <i className="fa-solid fa-angle-right fa-bounce fa-lg"></i>
                                </a>
                            </div>
                        </section>
                    </main>
                </section>
            </section>
            {/*end list sp*/}


            {/*list coupon*/}
            <section className="home-page">
                <section className="section-newsfeed">
                    <main className="container">
                        <section className="section-newsfeed">
                            <div className="title with-action">
                                <h2>List Coupon</h2>
                            </div>
                            <div className="content">
                                <div className="list-view">
                                    {coupons && coupons.map(item => (
                                        <div className="list-item eatery-item-landing">
                                            <div className="img-lazy figure square">
                                                <div className="img"
                                                     style={{backgroundImage: `url(${item.image})`}}>
                                                </div>
                                            </div>
                                            <div className="content">
                                                <div className="name mb-5">
                                                    {item.name}
                                                </div>
                                                <p>Discount: {item.discountAmount ? item.discountAmount.toLocaleString() + " VND" : item.percentageDiscount + "%"}
                                                </p>
                                                <div className="promotion">
                                                    <p>Quantity: {item.quantity}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <a className="btn-view-all">
                                    See all <i className="fa-solid fa-angle-right fa-bounce fa-lg"></i>
                                </a>
                            </div>
                        </section>
                    </main>
                </section>
            </section>
            {/*end list coupon*/}


            {/*Everyone likes*/}
            <section className="home-page">
                <section className="section-newsfeed">
                    <main className="container">
                        <section className="section-newsfeed">
                            <div className="title with-action">
                                <h2>Everyone likes</h2>
                            </div>
                            <div className="content">
                                <div className="list-view">
                                    {everyoneLikes && everyoneLikes.map(item => (
                                        <div onClick={() => {
                                            document.getElementById("quantity_p").value = 1
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                            setProduct(item)
                                            setMerchant(item.merchant)
                                        }} className="list-item eatery-item-landing">
                                            <div className="img-lazy figure square">
                                                <div className="img"
                                                     style={{backgroundImage: `url(${item.image})`}}>
                                                </div>
                                            </div>
                                            <div className="content">
                                                <div className="name mb-5">
                                                    {item.name}
                                                </div>
                                                <div className="name mb-5">
                                                    Purchase: {item.purchase}
                                                </div>
                                                <div className="promotion">
                                                    <i className="fa-solid fa-tag"></i>
                                                    <span>{item.priceSale.toLocaleString()} VND</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <a className="btn-view-all">
                                    See all <i className="fa-solid fa-angle-right fa-bounce fa-lg"></i>
                                </a>
                            </div>
                        </section>
                    </main>
                </section>
            </section>
            {/*end list sp*/}
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
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
}

export default DetailProduct
