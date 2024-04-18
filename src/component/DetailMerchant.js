import {Link, useParams} from "react-router-dom";
import React, {useEffect, useRef, useState} from "react";
import {couponByIdMerchant} from "../service/CouponService";
import {findMerchantById} from "../service/MerchantService";
import {findOneProduct, getAllProductByIdMerchant, getAllProductByMerchant} from "../service/ProductService";
import Header from "../layout/Header";
import {toast, ToastContainer} from "react-toastify";
import {orderNow} from "../service/BillService";
import {handledSendAccountSelf, handledSendNotification} from "../service/Websocket";
import SockJS from "sockjs-client";
import {over} from "stompjs";

function DetailMerchant() {
    let {id} = useParams();
    const [product, setProduct] = useState(undefined);
    const [coupons, setCoupons] = useState([]);
    const [merchant, setMerchant] = useState({})
    const [products, setProducts] = useState([]);
    const [load, setLoad] = useState(false);
    const [totalOderMoney, setTotalOderMoney] = useState(0);
    const [totalMoney, setTotalMoney] = useState(0);
    const [coupon, setCoupon] = useState(undefined);
    const [discount, setDiscount] = useState(0);
    const [shouldCallFindAll, setShouldCallFindAll] = useState(true);
    const [isNotification, setNotification] = useState(false)

    useEffect(() => {
        findMerchantById(id).then(data => {
            setMerchant(data)
            couponByIdMerchant(data.id_merchant).then(r => {
                setCoupons(r)
            })
            if (shouldCallFindAll) {
            getAllProductByIdMerchant(data.id_merchant).then(r => {
                setProducts(r)
            })
                if (account !== null){
                    connectDetailMerchant(account)
                }
        }})
    }, [shouldCallFindAll, isNotification])

    //websocket
    let stompClient = null;
    const connectDetailMerchant = (sendAcc) => {
        let Sock = new SockJS('http://localhost:8080/ws')
        stompClient = over(Sock)
        stompClient.connect({}, ()=>{
            stompClient.subscribe('/user/' + sendAcc.username + sendAcc.id + '/private-notification', (payload)=>{
                setNotification(!isNotification)
                setShouldCallFindAll(true);
            })
        }, (err)=>{
            console.log(err)
        });
    }
    const displayModal = async (id_product) => {
        try {
            const data = await findOneProduct(id_product);
            setProduct(data);
            setDiscount(0)
            const coupon = await couponByIdMerchant(data.merchant.id_merchant)
            setCoupons(coupon)
            document.getElementById("quantity_p").value = 1
            setMerchant(data.merchant);
            setTotalOderMoney(data.priceSale)
            if (product) {
                setLoad(true);
            }
            selectFirstOption()
        } catch (error) {
            console.error('Error fetching product:', error);
        }
    };

    function selectFirstOption(){
        let select = document.getElementById("select-coupon")
        const firstOption = select.querySelector("option:first-child");
        firstOption.selected = true;
    }

    const addition = () => {
        let quantityInput = document.getElementById("quantity_p");
        let currentValue = parseInt(quantityInput.value, 10);
        let total;
        if (currentValue <= 19) {
            let newValue = currentValue + 1;
            quantityInput.value = newValue;
            total = product.priceSale * newValue;
        } else {
            quantityInput.value = currentValue
            total = product.priceSale * currentValue;
        }
        setTotalOderMoney(total)
        let totalDiscount = 0
        if (coupon !== undefined) {
            if (coupon.discountAmount !== null) {
                totalDiscount = coupon.discountAmount;
            } else {
                totalDiscount = total * coupon.percentageDiscount / 100
            }
        }
        setDiscount(totalDiscount)
    }
    const subtraction = () => {
        let quantityInput = document.getElementById("quantity_p");
        let currentValue = parseInt(quantityInput.value, 10);
        let total;
        if (currentValue >= 2) {
            let newValue = currentValue - 1;
            quantityInput.value = newValue;
            total = product.priceSale * newValue;
        } else {
            quantityInput.value = currentValue
            total = product.priceSale * currentValue;
        }
        setTotalOderMoney(total)
        let totalDiscount = 0
        if (coupon !== undefined) {
            if (coupon.discountAmount !== null) {
                totalDiscount = coupon.discountAmount;
            } else {
                totalDiscount = total * coupon.percentageDiscount / 100
            }
        }
        setDiscount(totalDiscount)
    }

    const handleQuantityChange = (event) => {
        let quantityInput = document.getElementById("quantity_p");
        let newValue = parseInt(event.target.value, 10);
        if (!isNaN(newValue) && newValue >= 1 && newValue <= 20) {
            quantityInput.value = newValue
            // setQuantity(newValue);
            let total = product.priceSale * newValue;
            setTotalOderMoney(total)
        }
    };

    const handleInputName = (e) => {
        setProducts([])
        const value = e.target.value.toLowerCase();
        if (value === "") {
            setShouldCallFindAll(true)
        } else {
            const filteredProducts = products.filter(product => {
                const productName = product.name.toLowerCase();
                return productName.includes(value);
            });
            setProducts(filteredProducts);
            setNotification(!isNotification)
            setShouldCallFindAll(false)
        }
    }


    const account = JSON.parse(localStorage.getItem("userInfo"))
    function handleOrderNow() {
        let quantityOrder = document.getElementById("quantity_p").value;
        if (account !== null) {
            if (product.merchant.account.id_account === account.id) {
                toast.error('Your action is not authorized, please try again later!', {containerId: 'merchant-detail'});
                return
            }
            orderNow(product, account.id, quantityOrder, discount).then(res => {
                if (res === true) {
                    handledSendAccountSelf(account, account)
                    let notification = `${account.username} just placed an order with your merchant, please check your merchant`
                    let link = `http://localhost:3000/all-order/${product.merchant.id_merchant}`
                    handledSendNotification(account, product.merchant.account, notification, link)
                    toast.success('Order success!', {containerId: 'merchant-detail'});
                } else {
                    toast.error('An error occurred. Please check again!', {containerId: 'merchant-detail'});
                }
            })
        } else {
            toast.error('Please login!', {containerId: 'merchant-detail'});
        }
    }

    function findCoupon(id_coupon) {
        if (id_coupon == 0){
            setDiscount(0)
            return
        }
        let item;
        for (let i = 0; i < coupons.length; i++) {
            if (coupons[i].id == id_coupon) {
                item = coupons[i]
                break
            }
        }
        setCoupon(item)
        let totalDiscount = 0
        if (item.discountAmount !== null) {
            totalDiscount = item.discountAmount;
        } else {
            totalDiscount = totalOderMoney * item.percentageDiscount / 100
        }
        setDiscount(totalDiscount)
    }



    return (
        <>
            <Header/>
            <ToastContainer enableMultiContainer containerId="merchant-detail" position="top-right"
                            autoClose={1500} pauseOnHover={false}
                            style={{width: "400px"}}/>
            <div style={{height: '300px', marginTop: "20px"}} className="now-detail-restaurant clearfix" >
                <div className="container">
                    <div className="row px-xl-5">
                        <div className="col-lg-5 pb-5">
                            <div id="product-carousel" className="carousel slide" data-ride="carousel">
                                <div style={{
                                    width: '480px',
                                    height: '500px',
                                    position: 'relative',
                                    float: 'left'
                                }}>
                                    <div className="carousel-item active">
                                        <img className="w-100 h-75" src={merchant.image} alt="Image"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-7 pb-5">
                            <h2 className="font-weight-semi-bold">{merchant.name} - Shop Online</h2>
                            <div style={{marginTop: "15px"}} className="d-flex mb-3">
                                <div className="text-primary mr-2">
                                    <small style={{color: '#d1d124'}} className="fas fa-star"></small>
                                    <small style={{color: '#d1d124'}} className="fas fa-star"></small>
                                    <small style={{color: '#d1d124'}} className="fas fa-star"></small>
                                    <small style={{color: '#d1d124'}} className="fas fa-star-half-alt"></small>
                                    <small style={{color: '#d1d124'}} className="far fa-star"></small>
                                </div>
                            </div>
                            <div className="d-flex mb-3">
                                <div className="promotion">
                                    <span style={{fontSize: '19px'}}>  Phone : <span style={{
                                        fontWeight: 'bold',
                                        fontSize: '19px',
                                        marginTop: '3px'
                                    }}>{merchant.phone}</span></span>
                                </div>
                            </div>
                            <div className="d-flex mb-4">
                                <h6 style={{marginTop: '4px', fontSize: '19px'}}
                                    className="text-dark font-weight-medium mb-0 mr-3">Email : </h6>
                                <form>
                                    <div className="custom-control custom-radio custom-control-inline">
                                        <label style={{marginLeft: '5px', fontSize: '19px', fontWeight: 'bold'}}
                                               htmlFor="color-1"> {merchant.email}</label>
                                    </div>
                                </form>
                            </div>
                            <h6>
                                <div style={{fontSize: '19px'}} className="promotion">
                                    Address :
                                    <span> {merchant.addressShop?.address_detail}, {merchant.addressShop?.ward.name}, {merchant.addressShop?.district.name}, {merchant.addressShop?.city.name}</span>
                                </div>
                            </h6>
                            <div style={{fontSize: '19px', marginTop: '15px'}} className="d-flex mb-3">
                                Opening hour :
                                <div style={{marginRight: '5px', fontSize: '19px'}}>{merchant.open_time} </div>
                                <span style={{marginRight: '8px', fontSize: '19px'}}> ~ </span>
                                <div style={{marginRight: '5px', fontSize: '19px'}}> {merchant.close_time}</div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
            {/*container*/}
            <section className="home-page">
            <main className="container">
                <section>
                    <div className="content">
                        <div className="list-view">
            {/*list sp*/}
            <section className="section-newsfeed">
                <div className="title with-action">
                    <div className="row">
                        <div className="col-4"></div>
                        <h2 className="col-4" style={{textAlign: "center"}}>List Product</h2>
                        <input onKeyUp={handleInputName} type="search" style={{backgroundColor: "white", border:"1px solid #dee2e6"}} className="col-4 rounded"
                               placeholder="Search" aria-label="Search"
                               aria-describedby="search-addon"
                        />
                    </div>
                </div>

                <div className="content">
                    <div className="list-view">
                        {products && products.map(item => (
                            <div className="list-item eatery-item-landing">
                                <Link to={`/detailProduct/${item.id_product}`} >
                                    <div className="img-lazy figure square">
                                        <div className="img"
                                             style={{
                                                 backgroundImage: `url(${item.image})`,
                                                 color: 'black'
                                             }}>
                                        </div>
                                    </div>
                                    <div className="content">
                                        <div style={{
                                            marginTop: '8px',
                                            color: 'black'
                                        }}
                                             className="name mb-5">
                                            {item.name}
                                        </div>
                                        <div style={{color: 'black'}} className="name mb-5">
                                            Purchase: {item.purchase}
                                        </div>
                                        <div className="promotion">
                                            <i className="fa-solid fa-tag"></i>
                                            <span
                                                style={{color: 'black'}}>{item.priceSale.toLocaleString()} VND</span>
                                        </div>
                                    </div>
                                </Link>
                                <div className="name mb-5">
                                    <button data-bs-toggle="modal"
                                            data-bs-target="#show_product"
                                            className="container-fluid.modal-body"
                                            onClick={() => displayModal(item.id_product)}
                                            type="button" data-toggle="modal"
                                            data-target="#exampleModalLong" style={{
                                        backgroundColor: '#ff3d3d',
                                        padding: '7px',
                                        borderRadius: '10px',
                                        width: '180px',
                                        border: 'none',
                                        position: 'absolute',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        marginTop: '20px'
                                    }}>
                                        <a style={{display: "block", color: 'white'}}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="19"
                                                 height="19"
                                                 fill="currentColor" className="bi bi-cash-coin"
                                                 viewBox="0 0 16 16">
                                                <path fillRule="evenodd"
                                                      d="M11 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm5-4a5 5 0 1 1-10 0 5 5 0 0 1 10 0z"/>
                                                <path
                                                    d="M9.438 11.944c.047.596.518 1.06 1.363 1.116v.44h.375v-.443c.875-.061 1.386-.529 1.386-1.207 0-.618-.39-.936-1.09-1.1l-.296-.07v-1.2c.376.043.614.248.671.532h.658c-.047-.575-.54-1.024-1.329-1.073V8.5h-.375v.45c-.747.073-1.255.522-1.255 1.158 0 .562.378.92 1.007 1.066l.248.061v1.272c-.384-.058-.639-.27-.696-.563h-.668zm1.36-1.354c-.369-.085-.569-.26-.569-.522 0-.294.216-.514.572-.578v1.1h-.003zm.432.746c.449.104.655.272.655.569 0 .339-.257.571-.709.614v-1.195l.054.012z"/>
                                                <path
                                                    d="M1 0a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4.083c.058-.344.145-.678.258-1H3a2 2 0 0 0-2-2V3a2 2 0 0 0 2-2h10a2 2 0 0 0 2 2v3.528c.38.34.717.728 1 1.154V1a1 1 0 0 0-1-1H1z"/>
                                                <path
                                                    d="M9.998 5.083 10 5a2 2 0 1 0-3.132 1.65 5.982 5.982 0 0 1 3.13-1.567z"/>
                                            </svg> Order now</a>
                                    </button>
                                </div>
                            </div>
                        ))}

                    </div>
                    <a className="btn-view-all" href="">
                        See all <i className="fa-solid fa-angle-right fa-bounce fa-lg"></i>
                    </a>
                </div>
            </section>
            {/*end list sp*/}
                        </div>
                    </div>
                </section>
            </main>
        </section>


            {/*/!*modal*!/*/}
            {/*<div className="modal fade" id="show_product" tabIndex="-1" aria-labelledby="exampleModalLabel"*/}
            {/*     aria-hidden="true">*/}
            {/*    <div className="modal-dialog modal-dialog-centered modal-lg">*/}
            {/*        <div className="modal-content" style={{minHeight: '75vh', minWidth: '100vh'}}>*/}
            {/*            <div className="modal-header">*/}
            {/*                <h3 style={{marginLeft: '350px'}} className="modal-title" id="show_productLabel">ODER*/}
            {/*                    NOW</h3>*/}
            {/*                <button type="button" className="btn-close" data-bs-dismiss="modal"*/}
            {/*                        aria-label="Close"></button>*/}
            {/*            </div>*/}
            {/*            <div className="modal-body" style={{height: '520px'}}>*/}
            {/*                <div style={{marginTop: '30px'}} className="now-detail-restaurant clearfix">*/}
            {/*                    <div className="container">*/}
            {/*                        <div className="row px-xl-5">*/}
            {/*                            <div className="col-lg-5 pb-5">*/}
            {/*                                <div id="product-carousel" className="carousel slide" data-ride="carousel">*/}
            {/*                                    <div style={{*/}
            {/*                                        width: '480px',*/}
            {/*                                        height: '500px',*/}
            {/*                                        position: 'relative',*/}
            {/*                                        float: 'left'*/}
            {/*                                    }}>*/}
            {/*                                        <div className="carousel-item active">*/}
            {/*                                            <img style={{width: '300px', height: '250px'}}*/}
            {/*                                                 src={product.image} alt="Image"/>*/}
            {/*                                        </div>*/}
            {/*                                    </div>*/}
            {/*                                </div>*/}
            {/*                            </div>*/}

            {/*                            <div className="col-lg-7 pb-5">*/}
            {/*                                <h3 className="font-weight-semi-bold">{product.name}</h3>*/}
            {/*                                /!*link dẫn tới merchant, cần có cả id merchant để lấy dữ liệu. *!/*/}
            {/*                                <Link>{merchant.name} - Shop Online</Link>*/}
            {/*                                <div style={{marginTop: '8px'}} className="d-flex mb-3">*/}
            {/*                                    <div className="text-primary mr-2">*/}
            {/*                                        <small style={{color: '#d1d124'}} className="fas fa-star"></small>*/}
            {/*                                        <small style={{color: '#d1d124'}} className="fas fa-star"></small>*/}
            {/*                                        <small style={{color: '#d1d124'}} className="fas fa-star"></small>*/}
            {/*                                        <small style={{color: '#d1d124'}} className="fas fa-star-half-alt"></small>*/}
            {/*                                        <small style={{color: '#d1d124'}} className="far fa-star"></small>*/}
            {/*                                    </div>*/}
            {/*                                    <small className="pt-1">{product.view}</small>*/}
            {/*                                </div>*/}
            {/*                                <h3 className="font-weight-semi-bold mb-4">*/}
            {/*                                    <h3 style={{fontSize: "smaller"}} className="text-muted ml-2">*/}
            {/*                                        <del>{product.price}VND</del>*/}
            {/*                                    </h3>*/}
            {/*                                </h3>*/}
            {/*                                <h3 className="font-weight-semi-bold mb-4">*/}
            {/*                                    <input id="price_sale" type="number" value={product.priceSale}*/}
            {/*                                           hidden="hidden"/>*/}
            {/*                                    {product.priceSale}VND*/}
            {/*                                </h3>*/}
            {/*                                <div className="d-flex mb-3">*/}
            {/*                                    <h5 className="text-dark font-weight-medium mb-0 mr-3">Category : </h5>*/}
            {/*                                    {product.categories && product.categories.map(item => (*/}
            {/*                                        <form>*/}
            {/*                                            <div*/}
            {/*                                                className="custom-control custom-radio custom-control-inline">*/}
            {/*                                                <label style={{marginLeft: '5px'}}*/}
            {/*                                                       htmlFor="size-1"> {item.name}</label>*/}
            {/*                                            </div>*/}
            {/*                                        </form>*/}
            {/*                                    ))}*/}
            {/*                                </div>*/}
            {/*                                <div className="d-flex mb-4">*/}
            {/*                                    <h5 className="text-dark font-weight-medium mb-0 mr-3">Purchase : </h5>*/}
            {/*                                    <form>*/}
            {/*                                        <div className="custom-control custom-radio custom-control-inline">*/}
            {/*                                            <label htmlFor="color-1">{product.purchase}</label>*/}
            {/*                                        </div>*/}
            {/*                                    </form>*/}
            {/*                                </div>*/}
            {/*                                <div className="d-flex mb-4">*/}
            {/*                                    <h5 className="text-dark font-weight-medium mb-0 mr-3">Time make : </h5>*/}
            {/*                                    <form>*/}
            {/*                                        <div className="custom-control custom-radio custom-control-inline">*/}
            {/*                                            <label htmlFor="color-1">{product.timeMake}</label>*/}
            {/*                                        </div>*/}
            {/*                                    </form>*/}
            {/*                                </div>*/}
            {/*                                <div className="d-flex align-items-center mb-4 pt-2">*/}
            {/*                                    <div className="input-group quantity mr-3" style={{width: '130px'}}>*/}
            {/*                                        <div className="input-group-btn" id="minus_div">*/}
            {/*                                            <button onClick={subtraction} style={{*/}
            {/*                                                backgroundColor: '#df8686',*/}
            {/*                                                padding: '10px',*/}
            {/*                                                display: 'inline-block',*/}
            {/*                                                borderRadius: '10px',*/}
            {/*                                                width: '35px',*/}
            {/*                                                border: 'none'*/}
            {/*                                            }}>*/}
            {/*                                                /!*tru*!/*/}
            {/*                                                <i style={{color: "white"}} className="fa fa-minus"></i>*/}
            {/*                                            </button>*/}
            {/*                                        </div>*/}
            {/*                                        <input style={{*/}
            {/*                                            borderRadius: '8px',*/}
            {/*                                            marginLeft: '10px',*/}
            {/*                                            color: 'white',*/}
            {/*                                            backgroundColor: '#df8686'*/}
            {/*                                        }} type="text" className="form-control bg-secondary text-center"*/}
            {/*                                               id="quantity_p"*/}
            {/*                                               defaultValue={quantity}*/}
            {/*                                               onChange={handleQuantityChange}/>*/}
            {/*                                        <div style={{marginLeft: '10px'}} className="input-group-btn"*/}
            {/*                                             id="plus_div">*/}
            {/*                                            <button onClick={addition} style={{*/}
            {/*                                                backgroundColor: '#df8686',*/}
            {/*                                                padding: '10px',*/}
            {/*                                                display: 'inline-block',*/}
            {/*                                                borderRadius: '10px',*/}
            {/*                                                width: '35px',*/}
            {/*                                                border: 'none'*/}
            {/*                                            }}>*/}
            {/*                                                /!*cong*!/*/}
            {/*                                                <i style={{color: "white"}} className="fa fa-plus"></i>*/}
            {/*                                            </button>*/}
            {/*                                        </div>*/}
            {/*                                    </div>*/}
            {/*                                </div>*/}
            {/*                            </div>*/}
            {/*                        </div>*/}
            {/*                    </div>*/}
            {/*                </div>*/}
            {/*            </div>*/}
            {/*            <div className="modal-footer" style={{*/}
            {/*                display: 'flex',*/}
            {/*                justifyContent: 'space-between',*/}
            {/*                alignItems: 'center',*/}
            {/*                marginTop: '10px'*/}
            {/*            }}>*/}

            {/*                <button style={{backgroundColor: 'white', border: "none"}}>*/}
            {/*                    <span style={{marginLeft: '40px'}}> Coupon</span>*/}
            {/*                    <div>*/}
            {/*                        <svg style={{marginLeft: '50px'}} xmlns="http://www.w3.org/2000/svg" width="45"*/}
            {/*                             height="45"*/}
            {/*                             fill="currentColor" className="bi bi-credit-card" viewBox="0 0 16 16">*/}
            {/*                            <path*/}
            {/*                                d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v1h14V4a1 1 0 0 0-1-1H2zm13 4H1v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7z"/>*/}
            {/*                            <path*/}
            {/*                                d="M2 10a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-1z"/>*/}
            {/*                        </svg>*/}
            {/*                    </div>*/}
            {/*                </button>*/}
            {/*                <div>*/}
            {/*                    <h4 style={{*/}
            {/*                        marginRight: '60px',*/}
            {/*                        marginBottom: 0,*/}
            {/*                        display: 'flex',*/}
            {/*                        alignItems: 'center'*/}
            {/*                    }}>*/}
            {/*                        Total order money : <span style={{*/}
            {/*                        color: 'red',*/}
            {/*                        marginLeft: '5px',*/}
            {/*                        marginRight: '5px'*/}
            {/*                    }}>{totalOderMoney}</span> VND*/}
            {/*                    </h4>*/}
            {/*                    <h4 style={{*/}
            {/*                        marginRight: '60px',*/}
            {/*                        marginBottom: 0,*/}
            {/*                        display: 'flex',*/}
            {/*                        alignItems: 'center'*/}
            {/*                    }}>*/}
            {/*                        Discount: <span style={{color: 'red'}}></span> VND*/}
            {/*                    </h4>*/}
            {/*                    <h4 style={{*/}
            {/*                        marginRight: '60px',*/}
            {/*                        marginBottom: 0,*/}
            {/*                        display: 'flex',*/}
            {/*                        alignItems: 'center'*/}
            {/*                    }}>*/}
            {/*                        Total money: <span style={{color: 'red'}}>{totalMoney}</span> VND*/}
            {/*                    </h4>*/}
            {/*                    <h6 style={{marginBottom: 0}}>thrifty: {} </h6>*/}
            {/*                </div>*/}
            {/*            </div>*/}
            {/*            <div className="modal-footer">*/}
            {/*                <button style={{width: '400px', height: '40px', backgroundColor: '#df8686', border: 'none', marginRight: '280px'}} type="button" className="btn btn-secondary" data-bs-dismiss="modal">Pay now</button>*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*</div>*/}

            {/*modal*/}
            <div className="modal fade" id="show_product" tabIndex="-1" aria-labelledby="exampleModalLabel"
                 aria-hidden="true" style={{margin: "0px"}}>
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content" style={{minHeight: '75vh', minWidth: '100vh'}}>
                        <div className="modal-header" >
                            <div className="row">
                                <div className="col-1"></div>
                                <div className="col-10" style={{display: "flex", justifyContent:"center", alignItems:"center"}}>
                                    <h3 className="modal-title" id="show_productLabel">ORDER NOW</h3>
                                </div>
                                <button type="button" className="btn-close col-1" data-bs-dismiss="modal"
                                        aria-label="Close"></button>
                            </div>
                        </div>
                        {product !== undefined &&(
                            <div>
                                <div className="modal-body">
                                    <div style={{marginTop: '30px'}} className="now-detail-restaurant clearfix">
                                        <div className="container">
                                            <div className="row">
                                                <div className="col-5">
                                                    <div id="product-carousel" className="carousel slide" data-ride="carousel">
                                                        <div style={{
                                                            // width: '480px',
                                                            // height: '500px',
                                                            position: 'relative',
                                                            float: 'left'
                                                        }}>
                                                            {/*<div className="carousel-item active">*/}
                                                            <img style={{width: '300px', height: '250px'}}
                                                                 src={product.image} alt="Image"/>
                                                            {/*</div>*/}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-lg-7">
                                                    <h3 className="font-weight-semi-bold">{product.name}</h3>
                                                    {/*link dẫn tới merchant, cần có cả id merchant để lấy dữ liệu. */}

                                                    <Link to={`/detail_merchant/${merchant.id_merchant}`}><h5>{merchant.name} - Shop
                                                        Online</h5></Link>
                                                    <div style={{marginTop: '8px'}} className="d-flex">
                                                        <div className="text-primary mr-2">
                                                            <small style={{color: '#d1d124'}} className="fas fa-star"></small>
                                                            <small style={{color: '#d1d124'}} className="fas fa-star"></small>
                                                            <small style={{color: '#d1d124'}} className="fas fa-star"></small>
                                                            <small style={{color: '#d1d124'}}
                                                                   className="fas fa-star-half-alt"></small>
                                                            <small style={{color: '#d1d124'}} className="far fa-star"></small>
                                                        </div>
                                                        <small className="pt-1">{product.view}</small>
                                                    </div>
                                                    <div className="row">
                                                    <span className="number col-4" style={{marginTop:"3px"}}>
                                                        <h5 className="font-weight-semi-bold text-muted">
                                                            <del><em><span className="number">{product.price.toLocaleString()} VND</span></em></del>
                                                    </h5></span>
                                                        <h5 className="font-weight-semi-bold col-6" style={{marginLeft :"0px"}}>
                                                            <span className="number"/>{product.priceSale.toLocaleString()} VND</h5>
                                                        <div className="col-2"></div>
                                                    </div>
                                                    <div className="d-flex mb-3">
                                                        <h5 className="text-dark font-weight-medium mb-0 mr-3">Category: </h5>
                                                        {product.categories && product.categories.map((item, index) => {
                                                            if (index < product.categories.length -1){
                                                                return(
                                                                    <div
                                                                        className="custom-control custom-radio custom-control-inline">
                                                                        <label style={{marginLeft: '5px'}}
                                                                               htmlFor="size-1">{item.name},</label>
                                                                    </div>
                                                                )
                                                            }else {
                                                                return (
                                                                    <div
                                                                        className="custom-control custom-radio custom-control-inline">
                                                                        <label style={{marginLeft: '5px'}}
                                                                               htmlFor="size-1">{item.name}</label>
                                                                    </div>
                                                                )
                                                            }
                                                        })}
                                                    </div>
                                                    <div className="d-flex mb-3">
                                                        <h5 className="text-dark font-weight-medium mb-0 mr-3">Purchase: </h5>
                                                        <form>
                                                            <div className="custom-control custom-radio custom-control-inline">
                                                                <label htmlFor="color-1">{product.purchase}</label>
                                                            </div>
                                                        </form>
                                                    </div>
                                                    <div className="d-flex mb-3">
                                                        <h5 className="text-dark font-weight-medium mb-0 mr-3">Time make: </h5>
                                                        <form>
                                                            <div className="custom-control custom-radio custom-control-inline">
                                                                <label htmlFor="color-1">{product.timeMake}</label>
                                                            </div>
                                                        </form>
                                                    </div>
                                                    <div className="d-flex align-items-center mb-3 pt-2">
                                                        <div className="input-group quantity mr-3" style={{width: '130px'}}>
                                                            <div className="input-group-btn" id="minus_div">
                                                                <button onClick={subtraction} style={{
                                                                    backgroundColor: '#ff3d3d',
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
                                                                backgroundColor: '#df8686'
                                                            }} type="text" className="form-control bg-secondary text-center"
                                                                   id="quantity_p"
                                                                   defaultValue={1}
                                                                   onChange={handleQuantityChange}/>
                                                            <div style={{marginLeft: '10px'}} className="input-group-btn"
                                                                 id="plus_div">
                                                                <button onClick={addition} style={{
                                                                    backgroundColor: '#ff3d3d',
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
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer" style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginTop: '10px'
                                }}>
                                    <div className="row">
                                        <div className="col-6">
                                            <button style={{backgroundColor: 'white', border: "none"}}>
                                                <div style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center"
                                                }}>
                                                    <h5>Coupon</h5>
                                                </div>

                                                <div style={{display: "flex"}}>
                                                    <svg xmlns="http://www.w3.org/2000/svg"
                                                         width="45"
                                                         height="45"
                                                         fill="currentColor" className="bi bi-credit-card"
                                                         viewBox="0 0 16 16">
                                                        <path
                                                            d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v1h14V4a1 1 0 0 0-1-1H2zm13 4H1v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7z"/>
                                                        <path
                                                            d="M2 10a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-1z"/>
                                                    </svg>
                                                    {coupons !== undefined && (
                                                        <select onChange={(e) => findCoupon(e.target.value)}
                                                                className="select" id="select-coupon"
                                                                style={{marginLeft: "10px", marginTop: "5px"}}>
                                                            <option value="0">Choice</option>
                                                            {coupons.map((item, index) => (
                                                                <option key={index} value={item.id}>{item.name}</option>
                                                            ))}
                                                        </select>
                                                    )}

                                                </div>
                                            </button>
                                        </div>
                                        <div className="col-6">
                                            <div>
                                                {totalOderMoney !== 0 ? (
                                                    <h5>
                                                        Total order money: <span
                                                        style={{color: 'red', marginLeft: '5px', marginRight: '5px'}}>
                                        {totalOderMoney.toLocaleString()}</span> VND
                                                    </h5>
                                                ) : (
                                                    <h5>
                                                        Total order money: <span
                                                        style={{color: 'red', marginLeft: '5px', marginRight: '5px'}}>
                                                {product.priceSale.toLocaleString()}</span> VND</h5>
                                                )}

                                                <h5>
                                                    Discount: <span
                                                    style={{color: 'red'}}>{discount.toLocaleString()}</span> VND
                                                </h5>
                                                {totalOderMoney !== 0 ? (
                                                    <h5>
                                                        Total money: <span
                                                        style={{color: 'red'}}>{(totalOderMoney - discount).toLocaleString()}</span> VND
                                                    </h5>
                                                ) : (
                                                    <h5>
                                                        Total money: <span
                                                        style={{color: 'red'}}>{product.priceSale.toLocaleString()}</span> VND
                                                    </h5>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        )}






                        <div >
                            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                <button onClick={() => handleOrderNow()} style={{
                                    width: '100px',
                                    height: '40px',
                                    marginBottom:"10px",
                                    backgroundColor: '#ff3d3d',
                                    border:"0px"
                                }} type="button" className="btn btn-secondary" data-bs-dismiss="modal">Pay now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </>
    );
}

export default DetailMerchant