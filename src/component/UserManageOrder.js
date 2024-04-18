import Header from "../layout/Header";
import Footer from "../layout/Footer";
import React, {useEffect, useRef, useState} from "react";
import {getAllBillDetailByAccount, groupByBill, updateStatus} from "../service/BillService";
import {toast, ToastContainer} from "react-toastify";
import {getList} from "../service/PageService";
import Pagination from "./pagination/Pagination";
import {cancelBill} from "../service/BillService";
import {Link} from "react-router-dom";
import SockJS from "sockjs-client";
import {over} from "stompjs";
import {findMerchantById} from "../service/MerchantService";
import {findAccountByMerchant} from "../service/AccountService";
import {handledSendNotification} from "../service/Websocket";


let stompClient = null;
export default function UserManageOrder() {
    const account = JSON.parse(localStorage.getItem("userInfo"))
    const [billDetails, setBillDetails] = useState(undefined)
    const [list, setList] = useState([]);
    const [check, setCheck] = useState(true)
    const [changePage, setChangePage] = useState(false);
    let receiver;
    const connect = () => {
        let Sock = new SockJS('http://localhost:8080/ws')
        stompClient = over(Sock)
        stompClient.connect({}, onConnected, onError);
    }
    const onConnected = () => {
        stompClient.subscribe('/user/' + account.username + account.id + '/private', onPrivateMessage);
    }
    const onPrivateMessage = (payload) => {
        let payloadData = JSON.parse(payload.body);
        if (payloadData.sendAcc.id_account !== account.id) {
            setCheck(!check);
            console.log(payloadData)
        }
    }
    const onError = (err) => {
        console.log(err);
    }
    const handledSend = () => {
        console.log(receiver)
        if (stompClient) {
            var chatMessage = {
                sendAcc: {
                    id_account: account.id,
                    name: account.username
                },
                receiverAcc: {
                    id_account: receiver.id_account,
                    name: receiver.name
                },
                message: "true"
            };
            console.log(chatMessage);
            stompClient.send("/app/private-message", {}, JSON.stringify(chatMessage));
        }
    }
    const [item, setItem] = useState(undefined)
    const [address, setAddress] = useState(undefined)

    useEffect(() => {
        getAllBillDetailByAccount(account.id).then(res => {
            if (res !== undefined) {
                let arr = groupByBill(res)
                setBillDetails(getList(arr, page, limit));
                setList(arr)
                setItem(arr[0])
            } else {
                setBillDetails([])
            }
            connect()
        })
    }, [check])

    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(5)
    const totalPage = Math.ceil(list.length / limit)
    if (totalPage !== 0 && page > totalPage) {
        setPage(totalPage)
    }
    const handleChangeItem = (value) => {
        setLimit(value)
        setChangePage(!changePage)
    }
    useEffect(() => {
        setBillDetails(getList(list, page, limit));
    }, [changePage])

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

    const button = useRef()

    function handleModal(bill) {
        setItem(bill)
        setAddress(bill.bill.account.addressDelivery)
        button.current.click();
    }

    function handleCancel(id_bill, id_merchant) {
        findAccountByMerchant(id_merchant).then(res => {
            receiver = res
        })
        cancelBill(id_bill)
            .then(success => {
                if (success) {
                    setCheck(!check)
                    let notification = `Customer ${account.username} has canceled the order placed at your merchant`
                    let link = `http://localhost:3000/all-order/${id_merchant}`
                    handledSendNotification(account, receiver, notification, link)
                    handledSend()
                    // The status was successfully updated
                    console.log('Bill status updated successfully');
                } else {
                    // The status update failed
                    console.log('Failed to update bill status');
                }
            });
    }

    function handleReceived(id_bill, id_merchant) {
        findAccountByMerchant(id_merchant).then(res => {
            receiver = res
        })
        let statusUpdate = {id_status: 3}
        updateStatus(id_bill, statusUpdate)
            .then(success => {
                if (success) {
                    setCheck(!check)
                    handledSend()
                    // The status was successfully updated
                    console.log('Bill status updated successfully');
                } else {
                    // The status update failed
                    console.log('Failed to update bill status');
                }
            });
    }

    return (
        <>
            <Header/>
            <ToastContainer enableMultiContainer containerId={"account-bill"} position="top-right" autoClose={1500}
                            pauseOnHover={false}
                            style={{width: "400px"}}/>
            <div className="container" style={{marginBottom :"50px"}}>
                <div className="container">
                    {billDetails === undefined ? (
                        <>
                            <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                                <h3 style={{textAlign: "center", marginTop: "20vh", marginBottom: "20vh"}}>Your bill is
                                    empty.
                                    <Link to={"/"} style={{fontStyle: 'italic', color: "#ff5757"}}> Go to shopping
                                        now!!!
                                    </Link>
                                </h3>
                            </div>
                        </>
                    ) : (
                        <div>
                            <div style={{marginTop: "15px"}}>
                                <Pagination totalPage={totalPage} page={page} limit={limit} siblings={1}
                                            onPageChange={handlePageChange} onChangeItem={handleChangeItem}/>
                            </div>

                            <div className="content">
                                <table className="table table-hover">
                                    <thead>
                                    <tr>
                                        <th>STT</th>
                                        <th>Merchant</th>
                                        <th>Product</th>
                                        <th>Time purchase</th>
                                        <th>Total amount</th>
                                        <th>Status</th>
                                        <th></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {billDetails.map((bill, index) => {
                                        return (
                                            <tr>
                                                <td>{index + 1}</td>
                                                <td>{bill.bill.merchant.name}</td>
                                                <td>{bill.billDetails.map(item => {
                                                    return (
                                                        <>
                                                            <p>{item.product.name}</p>
                                                        </>
                                                    )
                                                })}</td>
                                                <td>{new Date(bill.bill.time_purchase).toLocaleString(
                                                    'en-UK', {
                                                        year: 'numeric',
                                                        month: '2-digit',
                                                        day: '2-digit',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    }
                                                )}</td>
                                                <td><span className="number">{bill.total.toLocaleString()} VND</span>
                                                </td>
                                                <td>{bill.bill.status.name}</td>
                                                <td>
                                                    <div className="row">
                                                        <div className="col-6">
                                                            {bill.bill.status.id_status === 1 ? (
                                                                <button
                                                                    className="btn btn-sm btn-primary"
                                                                    onClick={() => {
                                                                        if (window.confirm("Are you sure you want to cancel?")) {
                                                                            handleCancel(bill.bill.id_bill, bill.bill.merchant.id_merchant);
                                                                        }
                                                                    }}
                                                                >Cancel
                                                                </button>
                                                            ) : (
                                                                bill.bill.status.id_status !== 2 ? (
                                                                    <></>
                                                                ) : (
                                                                    <button
                                                                        className="btn btn-sm btn-outline-danger"
                                                                        onClick={() => {
                                                                            handleReceived(bill.bill.id_bill, bill.bill.merchant.id_merchant);
                                                                        }}
                                                                    >Received
                                                                    </button>
                                                                )
                                                            )}
                                                        </div>
                                                        <div className="col-6">
                                                            <button className="btn btn-sm btn-primary"
                                                                    style={{width: "96px"}}
                                                                    onClick={() => {
                                                                        handleModal(bill)
                                                                    }}>View Details
                                                            </button>

                                                        </div>
                                                    </div>

                                                </td>
                                            </tr>
                                        )
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                <>
                    <button
                        ref={button}
                        type="button"
                        data-bs-toggle="modal"
                        data-bs-target="#detailModal"
                        style={{visibility: "hidden", pointerEvents: "none"}}></button>

                    {item !== undefined && (
                        <div className="modal fade bd-example-modal-lg" id="detailModal" tabIndex="-1"
                             role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">

                            <div className="modal-dialog modal-dialog-centered modal-lg">
                                <div className="modal-content">
                                    <div className="modal-header">Detail</div>
                                    <div className="modal-body">
                                        {/*<div className="row">*/}
                                        {/*    <div>{billDetails.}</div>*/}
                                        {/*</div>*/}
                                        <table className="table table-hover">
                                            <thead>
                                            <tr>
                                                <td colSpan="2">Order number : {item.bill.codePurchase}</td>
                                                <td colSpan="2">Order Status : {item.bill.status.name}</td>
                                            </tr>
                                            <tr>
                                                {address !== undefined && (
                                                    <td colSpan="4">Delivery Address
                                                        : {address.city.name}, {address.district.name}, {address.ward.name}, {address.address_detail}</td>
                                                )}
                                            </tr>
                                            <tr>
                                                <th>Product</th>
                                                <th>Price</th>
                                                <th>Quantity</th>
                                                <th>Amount</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {item.billDetails.map((billDetail, index) => {
                                                return (
                                                    <tr>
                                                        <td>{billDetail.product.name}</td>
                                                        <td>{billDetail.price.toLocaleString()} VND</td>
                                                        <td>{billDetail.quantity}</td>
                                                        <td>{(billDetail.quantity * billDetail.price).toLocaleString()} VND</td>
                                                    </tr>
                                                )
                                            })}
                                            <tr>
                                                <td><strong>Total amount</strong></td>
                                                <td colSpan={2}></td>
                                                <td><strong><em>{item.total.toLocaleString()} VND</em></strong></td>
                                            </tr>
                                            <tr>
                                                <td><strong>Discount</strong></td>
                                                <td colSpan={2}></td>
                                                <td><strong><em>{item.bill.discount.toLocaleString()} VND</em></strong></td>
                                            </tr>
                                            <tr>
                                                <td><strong>Total payment</strong></td>
                                                <td colSpan={2}></td>
                                                <td><strong><em>{(item.total - item.bill.discount).toLocaleString()} VND</em></strong></td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </>


            </div>
            <Footer/>
        </>
    )
}