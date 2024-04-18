import {getAllProductByMerchant} from "../service/ProductService";
import React, {useEffect, useRef, useState} from "react";
import axios from "axios";
import {deleteProduct} from "../service/ProductService";
import {Link, useNavigate, useParams} from "react-router-dom";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import Pagination from "./pagination/Pagination";
import {value} from "lodash/seq";
import {getList} from "../service/PageService";
import {toast, ToastContainer} from "react-toastify";

export default function ProductList(props) {
    const [products, setProducts] = useState([]);
    const [list, setList] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const btn_modal = useRef()
    const [message, setMessage] = useState("")
    const [modalDelete, setModalDelete] = useState(false);
    const [isDelete, setDelete] = useState(false);
    const [changePage, setChangePage] = useState(false);
    const [indexDelete, setIndexDelete] = useState();
    const navigate = useNavigate();

    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(5)
    const totalPage = Math.ceil(list.length / limit)
    if (totalPage !== 0 && page > totalPage) {
        setPage(totalPage)
    }
    let merchant = JSON.parse(localStorage.getItem("merchant"))

    useEffect(() => {
        if (merchant !== null) {
            getAllProductByMerchant(merchant.id_merchant, searchInput)
                .then((data) => {
                    let arr = data.reverse();
                    setProducts(getList(arr, page, limit));
                    setList(arr)
                })
                .catch((error) => {
                    console.log(error);
                });
        } else {
            console.log("merchant not exist")
        }
    }, [searchInput, isDelete]);


    const handleDeleteProduct = () => {
        deleteProduct(indexDelete).then(r => {
            if (r === true) {
                setModalDelete(false)
                setDelete(!isDelete)
                // toast.success("Delete product success!",{containerId: "product-list"})
                setMessage("Delete product success!!!")
                btn_modal.current.click();
            } else {
                setMessage("An error occurred!!!")
                btn_modal.current.click();
            }
        })
    }

    useEffect(() => {
        setProducts(getList(list, page, limit));
    }, [changePage])

    const displayModal = (id_product) => {
        setModalDelete(true)
        setIndexDelete(id_product)
    }

    const searchName = (e) => {
        let result = []
        for (const item of list) {
            if (item.name.toLowerCase().includes(e.toLowerCase())) {
                result.push(item)
            }
        }
        setProducts([...result])
    }


    const handleChangeItem = (value) => {
        setLimit(value)
        setChangePage(!changePage)
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


    return (
        <>
            <Header/>
            {/*<ToastContainer enableMultiContainer containerId={"product-list"} position="top-right" autoClose={2000}*/}
            {/*                pauseOnHover={false}*/}
            {/*                style={{width: "400px"}}/>*/}
            <div className="container" style={{marginBottom:"50px"}}>
                <section className="section-newsfeed" style={{marginTop : "20px", marginBottom : "20px"}}>
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
                                      style={{color: "#ff3d3d", marginTop: "13px"}} to={"/product/create"}>
                                   <span> <h5 style={{marginBottom: "0px"}}> <img style={{height : "20px", width:"20px", marginBottom: "5px"}}
                                        src="https://firebasestorage.googleapis.com/v0/b/project-md6-cg.appspot.com/o/add.png?alt=media&token=ff56ec11-8fa4-48c4-9a6b-4adbff8468db"
                                        alt=""/> Add new</h5></span></Link>
                                <div className="col-6" style={{marginTop: "10px"}}><h4>Your product</h4></div>
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
                            <Link className="item-manage" to={`/list_coupon/${merchant.id_merchant}`}>
                                <img className="sidebar-icon"
                                     src="https://firebasestorage.googleapis.com/v0/b/project-md6-cg.appspot.com/o/list.png?alt=media&token=7e1b1332-d9f4-4392-971d-510b9ce3cb0d"
                                     alt="coupon"/>
                                Coupon</Link>
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
                            {products.length > 0 ? (
                                products.map((product, index) => (
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
                                                            backgroundImage: `url(${product.image})`,
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <div className="col-8">
                                                <div className="content">
                                                    <div className="name mb-5"
                                                         style={{fontSize: "18px"}}>{product.name}</div>
                                                    <div className="description mb-5">{product.description}</div>
                                                    <div className="promotion" style={{marginTop: "10px"}}>
                                                        <del><em><span
                                                            className="number">{product.price.toLocaleString()} VND</span></em>
                                                        </del>
                                                        <i style={{marginLeft: "15px"}} className="fa-solid fa-tag"></i>
                                                        <span
                                                            className="number"><strong>{product.priceSale.toLocaleString()} VND</strong></span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-2">
                                                <div className="d-flex justify-content-end">
                                                    <img className="icon-detail-merchant"
                                                         onClick={() => navigate(`/product/update/${product.id_product}`)}
                                                         src="https://firebasestorage.googleapis.com/v0/b/project-md6-cg.appspot.com/o/fcfff593-8038-474f-b1ea-8e7373c9d326.png?alt=media&token=f7b2c870-9cdb-4781-b4f8-49eefdc01f0f"
                                                         alt="update"/>
                                                    <img className="icon-detail-merchant" data-bs-toggle="modal" data-bs-target="#staticBackdrop"
                                                         onClick={() => displayModal(product.id_product)}
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
                                                                        id="staticBackdropLabel">Delete</h5>
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
                                                                            onClick={handleDeleteProduct}
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
    );
}
