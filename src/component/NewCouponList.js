import {Link, useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useRef, useState} from "react";
import {couponByIdMerchant, deleteCoupon} from "../service/CouponService";
import Header from "../layout/Header";
import Pagination from "./pagination/Pagination";
import Footer from "../layout/Footer";
import {getList} from "../service/PageService";


function NewCouponList() {
    let {id} = useParams();
    const [list, setList] = useState([]);
    const navigate = useNavigate();
    const [couponList, setCouponList] = useState([]);
    const [changePage, setChangePage] = useState(false);
    const [isDelete, setDelete] = useState(false);
    const [coupons, setCoupons] = useState([])
    const [searchInput, setSearchInput] = useState('');
    const [modalDelete, setModalDelete] = useState(false);
    const [indexDelete, setIndexDelete] = useState();
    const btn_modal = useRef()
    const [message, setMessage] = useState("")
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(5)
    const totalPage = Math.ceil(list.length / limit)
    if (totalPage !== 0 && page > totalPage) {
        setPage(totalPage)
    }
    let merchant = JSON.parse(localStorage.getItem("merchant"))

    useEffect(() => {
        if (merchant !== null) {
            couponByIdMerchant(merchant.id_merchant, searchInput).then((data) => {
                let arr = data.reverse();
                setCoupons(getList(arr, page, limit))
                setCouponList(arr)
            }).catch((error) => {
                console.log(error)
            })
        } else {
            console.log("coupon list not exist")
        }

    }, [searchInput, isDelete]);

    useEffect(() => {
        setCoupons(getList(couponList, page, limit));
    }, [changePage])

    const searchName = (e) => {
        let result = []
        for (const item of couponList) {
            if (item.name.toLowerCase().includes(e.toLowerCase())) {
                result.push(item)
            }
        }
        setCoupons([...result])
    }

    const displayModal = (id_coupon) => {
        setModalDelete(true)
        setIndexDelete(id_coupon)
    }
    const handlePageChange = (value) => {
        if (value === "&laquo;" || value === " ...") {
            setPage(1)
        } else if (value === "&lsaquo;") {
            if (page !== 1) {
                setPage(page - 1)
            }
        } else if (value === "&raquo;" || value === "... ") {
            setPage(totalPage)
        } else if (value === "&rsaquo;") {
            if (page !== totalPage) {
                setPage(page + 1)
            }
        } else {
            setPage(value)
        }
        setChangePage(!changePage)
    }
    const handleChangeItem = (value) => {
        setLimit(value)
        setChangePage(!changePage)
    }

    const handleDeleteCoupon = () => {
        deleteCoupon(indexDelete).then(r => {
            if (r === true) {
                couponByIdMerchant(merchant.id_merchant).then(r => {
                    setCoupons(r.reverse())  // Reverse the order of the list before setting it
                    setModalDelete(false)
                    setMessage("Delete product success!!!")
                    btn_modal.current.click();
                })
            } else {
                setMessage("An error occurred!!!")
                btn_modal.current.click();
            }
        })
    }


    return (
        <>
            <Header/>
            <div className="container">
                <section className="section-newsfeed" style={{marginTop: "20px", marginBottom: "20px"}}>
                    <Pagination totalPage={totalPage} page={page} limit={limit} siblings={1}
                                onPageChange={handlePageChange} onChangeItem={handleChangeItem}/>
                    <hr style={{marginTop: "0px"}}/>
                    <div className="content row">
                        <div className="col-3" style={{
                            borderRight: "1px solid black",
                            display: "flex", alignItems: "center", justifyContent: "center"
                        }}>
                            <h3 style={{margin: "0", fontSize: "24px"}}>Manage</h3>
                        </div>
                        <div className="col-9">
                            <div className="row" style={{marginLeft: "5px"}}>
                                <Link className="col-2 link-offset-1-hover"
                                      style={{color: "#ff3d3d", marginTop: "13px"}} to={`/create_Coupon/${merchant.id_merchant}`}>
                                   <span> <h5 style={{marginBottom: "0px"}}> <img
                                       style={{height: "20px", width: "20px", marginBottom: "5px"}}
                                       src="https://firebasestorage.googleapis.com/v0/b/project-md6-cg.appspot.com/o/add.png?alt=media&token=ff56ec11-8fa4-48c4-9a6b-4adbff8468db"
                                       alt=""/> Add new</h5></span></Link>
                                <div className="col-6" style={{marginTop: "10px"}}><h4>Your coupons</h4></div>
                                <div className="col-4" style={{marginTop: "10px"}}>
                                    <input type="search" className="form-control rounded"
                                           placeholder="Search" aria-label="Search"
                                           aria-describedby="search-addon" onKeyUp={(e) => searchName(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr/>

                    <div className="content row">
                        <div className="col-3" style={{borderRight: "1px solid black", marginBottom: "50px"}}>
                            <Link className="item-manage" to={`/list`}>
                                <img className="sidebar-icon"
                                     src="https://firebasestorage.googleapis.com/v0/b/project-md6-cg.appspot.com/o/list.png?alt=media&token=7e1b1332-d9f4-4392-971d-510b9ce3cb0d"
                                     alt="coupon"/>
                                Products</Link>

                            <Link className="item-manage" to={`/all-order/${merchant.id_merchant}`}>
                                <img className="sidebar-icon"
                                     src="https://firebasestorage.googleapis.com/v0/b/project-md6-cg.appspot.com/o/clipboard.png?alt=media&token=5888ea14-532e-47e3-a6d0-b24d9fda06c6"
                                     alt="order"/>
                                Orders </Link>

                            <Link className="item-manage" to={`/order-manager/${merchant.id_merchant}`}>
                                <img className="sidebar-icon"
                                     src="https://firebasestorage.googleapis.com/v0/b/project-md6-cg.appspot.com/o/revenue.png?alt=media&token=8c0c2771-2147-44a2-a465-5115ab8a095d"
                                     alt="revenue"/>
                                Revenue </Link>
                            <Link className="item-manage" to={`/merchant/update/${merchant.id_merchant}`}>
                                <img className="sidebar-icon"
                                     src="https://firebasestorage.googleapis.com/v0/b/project-md6-cg.appspot.com/o/settings.png?alt=media&token=d2ec17a6-b723-4fd8-baf9-06b3fa93f90c"
                                     alt="revenue"/>
                                Profile </Link>
                        </div>
                        <div className="col-9" style={{marginBottom: "50px"}}>
                            {coupons.length > 0 ? (
                                coupons.map((coupon, index) => (
                                    <div
                                        className="list-item eatery-item-landing"
                                        key={index}
                                    >
                                        <div className="row">
                                            <div className="col-2">
                                                <div className="img-lazy figure square">
                                                    <div
                                                        className="img"
                                                        style={{
                                                            backgroundImage: `url(${coupon.image})`,
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <div className="col-8">
                                                <div className="content">
                                                    <div className="name mb-5"
                                                         style={{fontSize: "18px"}}>{coupon.name}</div>
                                                    {/*<div className="description mb-5">{coupon.description}</div>*/}
                                                    <div className="promotion" style={{marginTop: "10px"}}>
                                                        <span
                                                            className="number"><strong>{coupon.discountAmount ? coupon.discountAmount.toLocaleString() + " VND" : coupon.percentageDiscount + "%"} discount</strong></span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-2">
                                                <div className="d-flex justify-content-end">
                                                    <img className="icon-detail-merchant"
                                                         onClick={() => navigate(`/update_coupon/${coupon.id}`)}
                                                         src="https://firebasestorage.googleapis.com/v0/b/project-md6-cg.appspot.com/o/fcfff593-8038-474f-b1ea-8e7373c9d326.png?alt=media&token=f7b2c870-9cdb-4781-b4f8-49eefdc01f0f"
                                                         alt="update"/>
                                                    <img className="icon-detail-merchant" data-bs-toggle="modal"
                                                         data-bs-target="#staticBackdrop"
                                                         onClick={() => displayModal(coupon.id)}
                                                         src="https://firebasestorage.googleapis.com/v0/b/project-md6-cg.appspot.com/o/delete.png?alt=media&token=e1d0f8fd-2f66-44af-b738-0e6aab66ec1f"
                                                         alt="delete"/>


                                                    {/*<button className="mr-2 btn btn-warning"*/}
                                                    {/*        onClick={() => navigate(`/product/update/${product.id_product}`)}>Update*/}
                                                    {/*</button>*/}

                                                    {/*<button type="button" className="mx-2 btn btn-primary"*/}
                                                    {/*        data-bs-toggle="modal" data-bs-target="#staticBackdrop"*/}
                                                    {/*        onClick={() => displayModal(product.id_product)}>Delete*/}
                                                    {/*</button>*/}

                                                    <div className="modal fade" id="staticBackdrop"
                                                         data-bs-backdrop="static"
                                                         data-bs-keyboard="false" tabIndex="10"
                                                         aria-labelledby="staticBackdropLabel"
                                                         aria-hidden={modalDelete}>
                                                        <div className="modal-dialog">
                                                            <div className="modal-content">
                                                                <div className="modal-header">
                                                                    <h5 className="modal-title"
                                                                        id="staticBackdropLabel">Modal Delete</h5>
                                                                    <button type="button" className="btn-close"
                                                                            data-bs-dismiss="modal"
                                                                            aria-label="Close"></button>
                                                                </div>
                                                                <div className="modal-body">
                                                                    Are you sure?
                                                                </div>
                                                                <div className="modal-footer">
                                                                    <button type="button" className="btn btn-info"
                                                                            data-bs-dismiss="modal">Cancel
                                                                    </button>
                                                                    <button className="mx-2 btn btn-primary"
                                                                            onClick={handleDeleteCoupon}
                                                                            type="button">Confirm
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>


                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div>No search results found.</div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
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
    )
}

export default NewCouponList;