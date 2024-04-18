import {Link, useParams} from "react-router-dom";
import Header from "../../layout/Header";
import React, {useEffect, useState} from "react";
import {
    cancelBill,
    findAllOrdersByMerchant,
    groupByBill,
    searchByNameAndPhone,
    updateStatus
} from "../../service/BillService";
import {findAccountByMerchant} from "../../service/AccountService";
import SockJS from "sockjs-client";
import {over} from "stompjs";
import Pagination from "../pagination/Pagination";
import {getList} from "../../service/PageService";
import Footer from "../../layout/Footer";
import {handledSendNotification} from "../../service/Websocket";
import ReactPaginate from "react-paginate";
import {reverse} from "lodash/array";


let stompClient = null;

function AllOrders() {
    const account = JSON.parse(localStorage.getItem("userInfo"))
    let {id} = useParams();
    const [billDetail, setBillDetail] = useState([]);
    const [status, setStatus] = useState(true)
    const [conversion, setConversion] = useState(true)
    const [check, setCheck] = useState(true)
    const [mess, setMess] = useState("")
    const [list, setList] = useState([])

    //phan trang
    const ItemsPerPage = 10;
    const totalPages = Math.ceil(list.length / ItemsPerPage);
    let [page, setPage] = useState(0)
    const handlePageChange = (selectedPage) => {
        setPage(selectedPage.selected)
        const startIndex = selectedPage.selected * ItemsPerPage;
        const endIndex = startIndex + ItemsPerPage;
        setBillDetail(list.slice(startIndex, endIndex))
    };

    useEffect(() => {
        if (check){
            findAllOrdersByMerchant(id).then(r => {
                if (r.length !== 0){
                    let arr = groupByBill(r)
                    setList(arr)
                    const startIndex = page * ItemsPerPage;
                    const endIndex = startIndex + ItemsPerPage;
                    setBillDetail(arr.slice(startIndex, endIndex))
                    setMess("All list orders")
                }
            })
        }else {
            findAllOrdersByMerchant(id).then(r => {
                if (r.length !== 0){
                    let arr = groupByBill(r)
                    setList(arr)
                    setBillDetail(arr.slice(0, ItemsPerPage))
                    setMess("All list orders")
                }
            })
        }
        connect()
        connectNotification(account)
    }, [status, check]);


    //websocket
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
            setStatus(!status);
            setCheck(true)
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


    //notification websocket
    let stompClientNotification = null
    const connectNotification = (sendAcc) => {
        let Sock = new SockJS('http://localhost:8080/ws')
        stompClientNotification = over(Sock)
        stompClientNotification.connect({}, ()=>{
            stompClientNotification.subscribe('/user/' + sendAcc.username + sendAcc.id + '/private-notification', (payload)=>{
                console.log(JSON.parse(payload.body));
                setStatus(!status);
                setCheck(true)
            })
        }, (err)=>{
            console.log(err)
        });
    }

    const search = () => {
        let value = document.getElementById("valueSearch").value;
        if (value === "") {
            setCheck(false)
        } else {
            searchByNameAndPhone(id, value).then(r => {
                if (r !== undefined) {
                    if (r.length > 0){
                        let arr = groupByBill(r)
                        setList(arr.reverse())
                        setBillDetail(arr.slice(0, ItemsPerPage))
                        setMess("Result")
                    } else {
                        setMess("No Orders")
                    }
                } else {
                }
            })
        }
    }

    function handleCancel(id_bill, accountRec) {
        if (window.confirm("Are you sure you want to cancel this order?")){
            receiver = accountRec
            cancelBill(id_bill)
                .then(success => {
                    if (success) {
                        let notification = `Your order has been cancelled`
                        let link = "http://localhost:3000/user/manage-order"
                        handledSendNotification(account, receiver, notification, link)
                        handledSend()
                        setStatus(!status)
                        // The status was successfully updated
                        console.log('Bill status cancel successfully');
                    } else {
                        // The status update failed
                        console.log('Failed to update bill status');
                    }
                });
        }
    }

    function handleConfirm(id_bill, accountRec) {
        receiver = accountRec
        let statusUpdate = {id_status : 2}
        updateStatus(id_bill, statusUpdate)
            .then(success => {
                if (success) {
                    let notification = `Your order has been confirmed and is being shipped`
                    let link = "http://localhost:3000/user/manage-order"
                    handledSendNotification(account, receiver, notification, link)
                    handledSend()
                    setStatus(!status)
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

            {/*Container */}
            <div className="mx-auto bg-grey-400">
                {/*hi*/}
                {/*Screen*/}
                <div className="min-h-screen flex flex-col">
                    {/*Header Section Starts Here*/}
                    <Header/>
                    {/*/Header*/}

                    <div className="flex flex-1">
                        <aside style={{marginTop : '18px'}} id="sidebar" className="bg-side-nav w-1/2 md:w-1/6 lg:w-1/6 border-r border-side-nav hidden md:block lg:block">
                            <ul className="list-reset flex flex-col">
                                <li style={{height: '73px'}} className=" w-full h-full py-3 px-2 border-b border-light-border">
                                    <Link to={`/order-manager/${id}`}
                                        className="font-sans font-hairline hover:font-normal text-sm text-nav-item no-underline">
                                        <i className="fas fa-tachometer-alt float-left mx-2"></i>
                                        Dashboard
                                        <span><i className="fas fa-angle-right float-right"></i></span>
                                    </Link>
                                </li>
                                <li style={{height: '73px'}} className="w-full h-full py-3 px-2 border-b border-light-border">
                                    <Link  to={`/order-statistics/${id}`}
                                           className="font-sans font-hairline hover:font-normal text-sm text-nav-item no-underline">
                                        <i className="fas fa-table float-left mx-2"></i>
                                        Order statistics
                                        <span><i className="fa fa-angle-right float-right"></i></span>
                                    </Link>
                                </li>
                                <li style={{height: '73px',backgroundColor: '#efd6d6', }} className="w-full h-full py-3 px-2 border-b border-light-border">
                                    <a
                                        className="font-sans font-hairline hover:font-normal text-sm text-nav-item no-underline">
                                        <i className="fab fa-wpforms float-left mx-2"></i>
                                        All orders
                                        <span><i className="fa fa-angle-right float-right"></i></span>
                                    </a>
                                </li>
                            </ul>

                        </aside>
                        {/*/Sidebar*/}

                        {/*Main*/}
                        <main className="bg-white-300 flex-1 p-3 overflow-hidden">



                            <div className="flex flex-col">

                                {/* Card Sextion Starts Here */}
                                <div className="flex flex-1 flex-col md:flex-row lg:flex-row mx-2">

                                    {/* card */}
                                    <div className="rounded overflow-hidden shadow bg-white mx-2 w-full">


                                        <div className="rounded overflow-hidden shadow bg-white mx-2 w-full">
                                            <div style={{height: '60px'}} className="px-6 py-2 border-b border-light-grey flex items-center justify-between">
                                                <div className="font-bold text-xl">{mess}</div>
                                                {/* search */}
                                                <div className="flex items-center"> {/* Updated this line to use 'items-center' */}
                                                    <div style={{width: '400px'}} className="font-bold text-xl">
                                                        <input
                                                            type="search"
                                                            className="form-control rounded"
                                                            placeholder="Type name or phone"
                                                            aria-label="Search"
                                                            aria-describedby="search-addon"
                                                            id="valueSearch"
                                                        />
                                                    </div>
                                                    <button onClick={search} style={{height: '35px', marginLeft: '8px'}} className="btn btn-outline-dark">
                                                        Search
                                                    </button>
                                                </div>
                                            </div>

                                        </div>


                                        <div className="table-responsive">
                                            <table className="table text-grey-darkest">
                                                <thead className="bg-grey-dark text-white text-normal">
                                                <tr style={{textAlign: 'center'}}>
                                                    <th scope="col"></th>
                                                    <th scope="col">User Name</th>
                                                    <th scope="col">User Phone</th>
                                                    <th scope="col">Date of purchase</th>
                                                    <th scope="col">Product Name</th>
                                                    <th scope="col">Total Money (VND)</th>
                                                    <th scope="col">Status</th>
                                                    <th scope="col">Action</th>
                                                </tr>
                                                </thead>
                                                <tbody>

                                                {billDetail && billDetail.map && billDetail.map((item, index) => (
                                                    <tr>
                                                        <th scope="row">{index + 1}</th>
                                                        <td style={{textAlign: 'center'}}>
                                                            <Link style={{
                                                                color: 'black',
                                                                fontSize: '19px',
                                                                textAlign: 'center'
                                                            }}>
                                                                {item.bill.account.name}<br/>
                                                            </Link><br/>
                                                        </td>
                                                        <td style={{textAlign: 'center'}}>{item.bill.account.phone}</td>
                                                        <td style={{textAlign: 'center'}}>{new Date(item.bill.time_purchase).toLocaleString(
                                                            'en-UK', {
                                                                year: 'numeric',
                                                                month: '2-digit',
                                                                day: '2-digit',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}</td>
                                                        <td>{item.billDetails.map(item => {
                                                            return (
                                                                <>
                                                                    <p style={{textAlign: 'center'}}>{item.product.name}</p>
                                                                </>
                                                            )
                                                        })}</td>
                                                        <td style={{
                                                            fontWeight: 'bold',
                                                            color: '#a13d3d',
                                                            textAlign: 'center'
                                                        }}><span className="number">{item.total.toLocaleString()}</span>
                                                        </td>
                                                        <td style={{textAlign: 'center'}}>
                                                            <span className="number">{item.bill.status.name}</span>
                                                        </td>
                                                        <td style={{textAlign: 'center'}}>
                                                            {item.bill.status.id_status === 1 ? (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleConfirm(item.bill.id_bill, item.bill.account)}
                                                                        className="btn btn-outline-danger">Confirm
                                                                    </button>
                                                                    <button style={{marginLeft: "10px"}}
                                                                            onClick={() => handleCancel(item.bill.id_bill, item.bill.account)}
                                                                            className="btn btn-outline-danger">Cancel
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <div style={{width : "96px"}}></div>
                                                                </>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                             {/*end search*/}
                                            <div className="pagination-container">
                                                <ReactPaginate
                                                    previousLabel={'Previous'}
                                                    nextLabel={'Next'}
                                                    onPageChange={handlePageChange}
                                                    pageCount={totalPages}
                                                    pageRangeDisplayed={1}
                                                    marginPagesDisplayed={1}
                                                    breakLabel={"..."}
                                                    containerClassName={'pagination'}
                                                    activeClassName={'active'}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {/* /card */}


                                </div>
                                {/* /Cards Section Ends Here */}
                                <div
                                    className="flex flex-1 flex-col md:flex-row lg:flex-row mx-2 p-1 mt-2 mx-auto lg:mx-2 md:mx-2 justify-between">
                                </div>
                                {/*/Profile Tabs*/}
                            </div>
                        </main>
                        {/*/Main*/}
                    </div>
                    <Footer/>
                </div>

            </div>
        </>

    )

}

export default AllOrders;