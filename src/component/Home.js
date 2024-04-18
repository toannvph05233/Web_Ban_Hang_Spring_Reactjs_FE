import BannerSlide from "./BannerSlide";
import React, {useEffect, useRef, useState} from "react";
import {fillByPrice, findAll, findOneProduct, MostPurchasedProducts, searchByCategory} from "../service/ProductService";
import {getAllCategories} from "../service/CategoryService";
import {Link} from "react-router-dom";
import {couponByIdMerchant} from "../service/CouponService";
import {getAllMerchantCheckDelete} from "../service/MerchantService";
import {orderNow} from "../service/BillService";
import {toast, ToastContainer} from "react-toastify";
import {connect, handledSendAccountSelf, handledSendNotification} from "../service/Websocket";
import SockJS from "sockjs-client";
import {over} from "stompjs";


export default function Home() {
    const [products, setProducts] = useState([]);
    const [list, setList] = useState([]);
    const [categories, setCategories] = useState([]);
    const [shouldCallFindAll, setShouldCallFindAll] = useState(true);
    const btn_modal = useRef()
    const [message, setMessage] = useState("")
    const [nameProduct, setNameProduct] = useState("")
    const [load, setLoad] = useState(false);
    const [product, setProduct] = useState(undefined);
    const [merchant, setMerchant] = useState({})
    const [totalOderMoney, setTotalOderMoney] = useState(0);
    const [totalMoney, setTotalMoney] = useState(0);
    const [coupons, setCoupons] = useState(undefined);
    const [coupon, setCoupon] = useState(undefined);
    const [discount, setDiscount] = useState(0);
    const [merchants, setMerchants] = useState([]);
    const [everyoneLikes, setEveryoneLikes] = useState([]);
    const [productByPriceSale, setProductByPriceSale] = useState([]);
    const account = JSON.parse(localStorage.getItem("userInfo"))
    const search = useRef()
    const search1 = useRef()
    const [isNotification, setNotification] = useState(false)


    useEffect(() => {
        if (shouldCallFindAll) {
            findAll().then(r => {
                setNameProduct("New Product")
                let arr = r.reverse()
                setList(arr)
                setProducts(arr.slice(0, 10));
                setShouldCallFindAll(false);
                getAllMerchantCheckDelete().then(m => {
                    let arr = m.reverse();
                    setMerchants(arr.slice(0, 10))
                    if (account !== null) {
                        connectHome(account)
                    }
                })
            });
        }
        getAllCategories().then(category => {
            setCategories(category)
        })
        MostPurchasedProducts().then(r => {
            const limitedProducts = r.slice(0, 10);
            setEveryoneLikes([...limitedProducts]);
        })
        fillByPrice().then(r => {
            setProductByPriceSale(r)
        })


    }, [products, shouldCallFindAll, isNotification]);


    let stompClient = null;
    const connectHome = (sendAcc) => {
        let Sock = new SockJS('http://localhost:8080/ws')
        stompClient = over(Sock)
        stompClient.connect({}, () => {
            stompClient.subscribe('/user/' + sendAcc.username + sendAcc.id + '/private-notification', (payload) => {
                setNotification(!isNotification)
                setShouldCallFindAll(true);
            })
        }, (err) => {
            console.log(err)
        });
    }

    const handleInputName = (e) => {
        const inputSearch = document.getElementById("input-search");
        inputSearch.addEventListener('keydown', function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                setProducts([])
                const value = e.target.value.toLowerCase();
                if (value === "") {
                    setShouldCallFindAll(true)
                }
                {
                    const filteredProducts = list.filter(product => {
                        const productName = product.name.toLowerCase();
                        return productName.includes(value.toLowerCase());
                    });
                    setNameProduct("Searching")
                    setProducts(filteredProducts);
                }
                search.current.scrollIntoView({behavior: "smooth"});
            }
        })
    }

    const handleInputCategory = (id_category) => {
        searchByCategory(id_category).then(r => {
            setNameProduct("Searching")
            setProducts(r)
        })
        search.current.scrollIntoView({behavior: "smooth"});
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

    const seeAllProducts = () => {
        findAll().then(r => {
            setNameProduct("New Product")
            setProducts(r);
        });
    }

    const seeAllMerchants = () => {
        getAllMerchantCheckDelete().then(m => {
            let arr = m.reverse();
            console.log(arr)
            setMerchants(arr)
            setShouldCallFindAll(false)
        })
    }

    function handleOrderNow() {
        let quantityOrder = document.getElementById("quantity_p").value;
        if (account !== null) {
            if (product.merchant.account.id_account === account.id) {
                toast.error('Your action is not authorized, please try again later!', {containerId: 'home-notification'});
                return
            }
            orderNow(product, account.id, quantityOrder, discount).then(res => {
                if (res === true) {
                    handledSendAccountSelf(account, account)
                    let notification = `${account.username} just placed an order with your merchant, please check your merchant`
                    let link = `http://localhost:3000/all-order/${product.merchant.id_merchant}`
                    handledSendNotification(account, product.merchant.account, notification, link)
                    toast.success('Order success!', {containerId: 'home-notification'});
                } else {
                    toast.error('An error occurred. Please check again!', {containerId: 'home-notification'});
                }
            })
        } else {
            toast.error('Please login!', {containerId: 'home-notification'});
        }
    }

    const handleSearch = () => {
        const inputSearch = document.getElementById("input-search");
        inputSearch.addEventListener('keydown', function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                search.current.scrollIntoView({behavior: "smooth"});
            }
        })
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
            <ToastContainer enableMultiContainer containerId="home-notification" position="top-right"
                            autoClose={2000} pauseOnHover={false}
                            style={{width: "400px"}}/>
            {/*Home*/}
            <section className="home-page">
                <section className="top-banner loship"
                         style={{backgroundColor: '#A4EA9E'}}>
                    <h1>
                        <span>
                            Order Your Favorite
                            <br/>
                            <h2 className="banner-title-highlight" style={{padding:'10px'}}>
                                With Freeshipping
                            </h2>
                        </span>
                    </h1>
                    <div className="wrapper">
                        <div className="search-box">
                            <span className="btn bg-transparent text-blue btn-search btn-link">
                                <i className="fa-solid fa-magnifying-glass"></i>
                            </span>
                            <input onKeyDown={handleInputName} id={"input-search"} type="text"
                                   className="search-box-input"
                                   placeholder="Find the nearest location"/>
                        </div>
                    </div>
                </section>


                {/*Container*/}
                <main className="container">
                    <section style={{marginTop:'30px'}}>
                        <div className="content">
                            <div className="list-view">
                                <BannerSlide/>
                                {/*caroseul*/}

                                {/*List category*/}
                                <section className="section-newsfeed">
                                    <div className="content-category">
                                        <div className="list-view">
                                            {categories && categories.map(item => (
                                                <div className="list-item category-item">
                                                    <div className="img-lazy figure square">
                                                        <div onClick={() => handleInputCategory(item.id_category)}
                                                             className="img"
                                                             style={{backgroundImage: `url(${item.image})`}}></div>
                                                    </div>
                                                    <div className="content">
                                                        <div style={{textAlign: 'center', marginTop: '8px'}}
                                                             className="metadata">
                                                            <b>{item.name}</b>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                                {/*End List Category*/}


                                {/*list sp*/}
                                <section className="section-newsfeed">
                                    <div ref={search} className="title with-action">
                                        <h2>{nameProduct}</h2>
                                    </div>

                                    {products.length !== 0 ? (
                                        <div className="content">
                                            <div className="list-view">
                                                {products && products.map(item => (
                                                    <div className="list-item eatery-item-landing">
                                                        <Link to={`detailProduct/${item.id_product}`}>
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
                                                                    textAlign: 'center',
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
                                            <a className="btn-view-all" onClick={seeAllProducts}>
                                                See all <i className="fa-solid fa-angle-right fa-bounce fa-lg"></i>
                                            </a>
                                        </div>
                                    ) : (
                                        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                            <h4 style={{opacity: 0.5, fontStyle: 'italic'}}>No matching results, please
                                                try again!</h4>
                                        </div>
                                    )}

                                </section>
                                {/*end list sp*/}


                                {/*everyoneLikes*/}
                                <section className="section-newsfeed">
                                    <div className="title with-action">
                                        <h2>Everyone Likes</h2>
                                    </div>

                                    <div className="content">
                                        <div className="list-view">
                                            {everyoneLikes && everyoneLikes.map(item => (
                                                <div className="list-item eatery-item-landing">
                                                    <Link to={`detailProduct/${item.id_product}`}>
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
                                                                textAlign: 'center',
                                                                marginTop: '8px',
                                                                color: 'black'
                                                            }} className="name mb-5">
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
                                    </div>
                                </section>
                                {/*end list everyoneLikes*/}

                                {/*product by price sale*/}
                                <section className="section-newsfeed">
                                    <div className="title with-action">
                                        <h2>Most discounts</h2>
                                    </div>

                                    <div className="content">
                                        <div className="list-view">
                                            {productByPriceSale && productByPriceSale.map(item => (
                                                <div className="list-item eatery-item-landing">
                                                    <Link to={`detailProduct/${item.id_product}`}>
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
                                                                textAlign: 'center',
                                                                marginTop: '8px',
                                                                color: 'black'
                                                            }} className="name mb-5">
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
                                    </div>
                                </section>
                                {/*end list product by price sale/}



                                {/*list merchant*/}
                                <section className="section-newsfeed">
                                    <div className="title with-action">
                                        <h2>Merchant</h2>
                                    </div>
                                    <div className="content">
                                        <div className="list-view">
                                            {merchants && merchants.map(item => (
                                                <Link to={`detail_merchant/${item.id_merchant}`}
                                                      className="list-item eatery-item-landing">
                                                    <div className="img-lazy figure square">
                                                        <div className="img"
                                                             style={{
                                                                 backgroundImage: `url(${item.image})`,
                                                                 color: 'black'
                                                             }}>
                                                        </div>
                                                    </div>
                                                    <div className="content">
                                                        <div style={{textAlign: 'center', marginTop: '8px'}}
                                                             className="name mb-5">
                                                            {item.name}
                                                        </div>
                                                        <div className="promotion">
                                                            <svg style={{marginBottom: '8px'}}
                                                                 xmlns="http://www.w3.org/2000/svg" width="20"
                                                                 height="20" fill="currentColor"
                                                                 className="bi bi-house-check" viewBox="0 0 16 16">
                                                                <path
                                                                    d="M7.293 1.5a1 1 0 0 1 1.414 0L11 3.793V2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v3.293l2.354 2.353a.5.5 0 0 1-.708.708L8 2.207l-5 5V13.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 2 13.5V8.207l-.646.647a.5.5 0 1 1-.708-.708L7.293 1.5Z"/>
                                                                <path
                                                                    d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm1.679-4.493-1.335 2.226a.75.75 0 0 1-1.174.144l-.774-.773a.5.5 0 0 1 .708-.707l.547.547 1.17-1.951a.5.5 0 1 1 .858.514Z"/>
                                                            </svg>
                                                            <span> {item.addressShop.address_detail}, {item.addressShop.ward.name}, {item.addressShop.district.name}, {item.addressShop.city.name}</span>
                                                        </div>
                                                        <div style={{marginLeft: '20px', marginTop: "12px"}}
                                                             className="promotion">
                                                            <svg style={{fontWeight: 'none'}}
                                                                 xmlns="http://www.w3.org/2000/svg" width="16"
                                                                 height="16" fill="currentColor"
                                                                 className="bi bi-telephone-inbound"
                                                                 viewBox="0 0 16 16">
                                                                <path
                                                                    d="M15.854.146a.5.5 0 0 1 0 .708L11.707 5H14.5a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5v-4a.5.5 0 0 1 1 0v2.793L15.146.146a.5.5 0 0 1 .708 0zm-12.2 1.182a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"/>
                                                            </svg>
                                                            <span>  Phone: <span
                                                                style={{fontWeight: 'bold'}}>{item.phone}</span></span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                        <a className="btn-view-all" onClick={seeAllMerchants}>
                                            See all <i className="fa-solid fa-angle-right fa-bounce fa-lg"></i>
                                        </a>
                                    </div>
                                </section>
                                {/*end list merchant*/}

                            </div>
                        </div>
                    </section>
                </main>
            </section>
            {/*End Home*/}

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


            {/*modal*/}
            <div className="modal fade" id="show_product" tabIndex="-1" aria-labelledby="exampleModalLabel"
                 aria-hidden="true" style={{margin: "0px"}}>
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content" style={{minHeight: '75vh', minWidth: '100vh'}}>
                        <div className="modal-header">
                            <div className="row">
                                <div className="col-1"></div>
                                <div className="col-10"
                                     style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                                    <h3 className="modal-title" id="show_productLabel">ORDER NOW</h3>
                                </div>
                                <button type="button" className="btn-close col-1" data-bs-dismiss="modal"
                                        aria-label="Close"></button>
                            </div>
                        </div>
                        {product !== undefined && (
                            <div>
                                <div className="modal-body">
                                    <div style={{marginTop: '30px'}} className="now-detail-restaurant clearfix">
                                        <div className="container">
                                            <div className="row">
                                                <div className="col-5">
                                                    <div id="product-carousel" className="carousel slide"
                                                         data-ride="carousel">
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

                                                    <Link to={`/detail_merchant/${product.merchant.id_merchant}`}>
                                                        <h5>{product.merchant.name} - Shop
                                                            Online</h5></Link>
                                                    <div style={{marginTop: '8px'}} className="d-flex">
                                                        <div className="text-primary mr-2">
                                                            <small style={{color: '#d1d124'}}
                                                                   className="fas fa-star"></small>
                                                            <small style={{color: '#d1d124'}}
                                                                   className="fas fa-star"></small>
                                                            <small style={{color: '#d1d124'}}
                                                                   className="fas fa-star"></small>
                                                            <small style={{color: '#d1d124'}}
                                                                   className="fas fa-star-half-alt"></small>
                                                            <small style={{color: '#d1d124'}}
                                                                   className="far fa-star"></small>
                                                        </div>
                                                        <small className="pt-1">{product.view}</small>
                                                    </div>
                                                    <div className="row">
                                                    <span className="col-4" style={{marginTop: "3px"}}>
                                                        <h5 className="font-weight-semi-bold text-muted">
                                                            <del><em><span
                                                                className="number"></span>{product.price.toLocaleString()} VND</em></del>
                                                    </h5></span>
                                                        <h5 className="font-weight-semi-bold col-6"
                                                            style={{marginLeft: "0px"}}>
                                                            <span
                                                                className="number"/>{product.priceSale.toLocaleString()} VND
                                                        </h5>
                                                        <div className="col-2"></div>
                                                    </div>
                                                    <div className="d-flex mb-3">
                                                        <h5 className="text-dark font-weight-medium mb-0 mr-3">Category: </h5>
                                                        {product.categories && product.categories.map((item, index) => {
                                                            if (index < product.categories.length - 1) {
                                                                return (
                                                                    <div
                                                                        onClick={() => handleInputCategory(item.id_category)}
                                                                        className="custom-control custom-radio custom-control-inline">
                                                                        <label style={{marginLeft: '5px'}}
                                                                               htmlFor="size-1">{item.name},</label>
                                                                    </div>
                                                                )
                                                            } else {
                                                                return (
                                                                    <div
                                                                        onClick={() => handleInputCategory(item.id_category)}
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
                                                            <div
                                                                className="custom-control custom-radio custom-control-inline">
                                                                <label htmlFor="color-1">{product.purchase}</label>
                                                            </div>
                                                        </form>
                                                    </div>
                                                    <div className="d-flex mb-3">
                                                        <h5 className="text-dark font-weight-medium mb-0 mr-3">Time
                                                            make: </h5>
                                                        <form>
                                                            <div
                                                                className="custom-control custom-radio custom-control-inline">
                                                                <label htmlFor="color-1">{product.timeMake}</label>
                                                            </div>
                                                        </form>
                                                    </div>
                                                    <div className="d-flex align-items-center mb-3 pt-2">
                                                        <div className="input-group quantity mr-3"
                                                             style={{width: '130px'}}>
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
                                                                    <i style={{color: "white"}}
                                                                       className="fa fa-minus"></i>
                                                                </button>
                                                            </div>
                                                            <input style={{
                                                                borderRadius: '8px',
                                                                marginLeft: '10px',
                                                                color: 'white',
                                                                backgroundColor: '#df8686'
                                                            }} type="text"
                                                                   className="form-control bg-secondary text-center"
                                                                   id="quantity_p"
                                                                   defaultValue={1}
                                                                   onChange={handleQuantityChange}/>
                                                            <div style={{marginLeft: '10px'}}
                                                                 className="input-group-btn"
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
                                                                    <i style={{color: "white"}}
                                                                       className="fa fa-plus"></i>
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
                                                    {coupons !== undefined && coupons.length !== 0 && (
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

                        <hr/>
                        <div>
                            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                <button onClick={() => handleOrderNow()} style={{
                                    width: '100px',
                                    height: '40px',
                                    marginBottom: "10px",
                                    backgroundColor: '#ff3d3d',
                                    border: "0px"
                                }} type="button" className="btn btn-secondary" data-bs-dismiss="modal">Pay now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}
