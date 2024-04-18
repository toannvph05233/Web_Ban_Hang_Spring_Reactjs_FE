import {Link, useParams} from "react-router-dom";
import Header from "../../layout/Header";
import React, {useEffect, useState} from "react";
import {
    findAllOrdersByMerchant,
    findOrderByProduct, findOrderByStatus, findOrderByUser, findUser,
    getAllStatus,
    groupByBill
} from "../../service/BillService";
import {getAllProductByIdMerchant} from "../../service/ProductService";
import Footer from "../../layout/Footer";
import Chart from "./Chart";
import MyBarChar from "./Test";
import ReactPaginate from "react-paginate";
function OrderStatistics() {
    let {id} = useParams();
    const [billDetail, setBillDetail] = useState([]);
    const [status, setStatus] = useState([]);
    const [user, setUser] = useState([]);
    const [product, setProduct] = useState([]);
    const [check, setCheck] = useState(true);
    const [message, setMessage] = useState("");
    const [totalMoNey, setTotalMoNey] = useState(0);
    const [totalProduct, setTotalProduct] = useState(0);
    const [totalOrder, setTotalOrder] = useState(0);
    const [totalUser, setTotalUser] = useState(0);
    const [data, setData] = useState([])
    const [conversion, setConversion] = useState(true)
    const [list, setList] = useState([])

    //phan trang
    const ItemsPerPage = 10;
    const totalPages = Math.ceil(list.length / ItemsPerPage);
    const handlePageChange = (selectedPage) => {
        const startIndex = selectedPage.selected * ItemsPerPage;
        const endIndex = startIndex + ItemsPerPage;
        console.log(selectedPage.selected)
        setBillDetail(list.slice(startIndex, endIndex))
        setCheck(false)
    };

    const [defaultSelect, setDefaultSelect] = useState(true)

    useEffect(() => {
        if (check){
            findAllOrdersByMerchant(id).then(r => {
                if (r.length !== 0){
                    let arr = groupByBill(r)
                    setList(arr)
                    setBillDetail(arr.slice(0, ItemsPerPage))
                    setData(calculateTotalByYear(arr))
                    order(arr.length)
                    money(arr)
                    setMessage("Statistics")
                }
            })
        }
        getAllProductByIdMerchant(id).then(re => {
            setProduct(re)
            setTotalProduct(re.length)
        })
        getAllStatus().then(res => {
            setStatus(res)
        })

        findUser(id).then(r => {
            if (r !== undefined){
                setUser(r.reverse())
                setTotalUser(r.length)
            }
        })
    }, [check, defaultSelect]);
    const selectProduct = (e) => {
        if (e.target.value == 0){
            setCheck(true)
            setDefaultSelect(!defaultSelect)
            return
        }
        findOrderByProduct(e.target.value).then(r => {
            if (r !== undefined){
                setBill(r)
            } else {
                setTotalOrder(0);
                setTotalMoNey(0);
                setData([{name: '', Money: 0 , Orders: 0}, {name: '', Money: 0 , Orders: 0},
                    {name: '', Money: 0 , Orders: 0}, {name: '', Money: 0 , Orders: 0},
                    {name: '', Money: 0 , Orders: 0}, {name: '', Money: 0 , Orders: 0}])
                setMessage("No order display");
                setBillDetail([])
            }
        })
    }

    const selectStatus = (e) => {
        if (e.target.value == 0){
            setCheck(true)
            setDefaultSelect(!defaultSelect)
            return
        }
        findOrderByStatus(id, e.target.value).then(r => {
            if (r !== undefined){
                setBill(r)
            } else {
                setTotalOrder(0);
                setTotalMoNey(0);
                setData([{name: '', Money: 0 , Orders: 0}, {name: '', Money: 0 , Orders: 0},
                    {name: '', Money: 0 , Orders: 0}, {name: '', Money: 0 , Orders: 0},
                    {name: '', Money: 0 , Orders: 0}, {name: '', Money: 0 , Orders: 0}])
                setMessage("No order display");
                setBillDetail([])
            }
        })
    }

    const selectUser = (e) => {
        if (e.target.value == 0){
            setCheck(true)
            setDefaultSelect(!defaultSelect)
            return
        }
        findOrderByUser(id, e.target.value).then(r => {
            if (r !== undefined){
                setBill(r)
            } else {
                setTotalOrder(0);
                setTotalMoNey(0);
                setData([{name: '', Money: 0 , Orders: 0}, {name: '', Money: 0 , Orders: 0},
                    {name: '', Money: 0 , Orders: 0}, {name: '', Money: 0 , Orders: 0},
                    {name: '', Money: 0 , Orders: 0}, {name: '', Money: 0 , Orders: 0}])
                setMessage("No order display");
                setBillDetail([])
            }
        })
    }
    const setBill = (r) => {
        if (r.length > 0) {
            let arr = groupByBill(r);
            setList(arr)
            setBillDetail(arr.slice(0, ItemsPerPage))
            order(arr.length);
            money(arr);
            setData(calculateTotalByYear(arr))
            setMessage("Result search");
            setCheck(false);
        } else {
            setBillDetail([])
            setTotalOrder(0);
            setTotalMoNey(0);
            setData([{name: '', Money: 0 , Orders: 0}, {name: '', Money: 0 , Orders: 0},
                {name: '', Money: 0 , Orders: 0}, {name: '', Money: 0 , Orders: 0},
                {name: '', Money: 0 , Orders: 0}, {name: '', Money: 0 , Orders: 0}])
            setMessage("No order display");

        }
    }

    const money = (r) => {
        let count = 0;
        for (let i = 0; i < r.length; i++) {
            count += r[i].total
        }
        setTotalMoNey(count)
    }

    const order = (r) => {
        setTotalOrder(r)
    }

    const calculateTotalByYear = (billDetails) => {
        const result = Array.from({ length: 12 }, (_, index) => {
            return { name: ``, Money: 0, Orders: 0 };
        });
        billDetails.forEach(detail => {
            const orderDate = new Date(detail.bill.time_purchase);
            const monthIndex = orderDate.getMonth()
            result[monthIndex].Money += detail.total;
            result[monthIndex].Orders += 1;
        });
        for (let i = 0; i < result.length; i++) {
            result[i].name = `Month ${i + 1}`;
        }
        return result;
    };




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
                        {/*Sidebar*/}
                        <aside style={{marginTop: '18px'}} id="sidebar" className="bg-side-nav w-1/2 md:w-1/6 lg:w-1/6 border-r border-side-nav hidden md:block lg:block">

                            <ul className="list-reset flex flex-col">
                                <li style={{height: '75px'}} className=" w-full h-full py-3 px-2 border-b border-light-border">
                                    <Link to={`/order-manager/${id}`}
                                       className="font-sans font-hairline hover:font-normal text-sm text-nav-item no-underline">
                                        <i className="fas fa-tachometer-alt float-left mx-2"></i>
                                        Dashboard
                                        <span><i className="fas fa-angle-right float-right"></i></span>
                                    </Link>
                                </li>
                                <li style={{backgroundColor: '#efd6d6',height: '75px'}} className="w-full h-full py-3 px-2 border-b border-light-border">
                                    <a
                                       className="font-sans font-hairline hover:font-normal text-sm text-nav-item no-underline">
                                        <i className="fas fa-table float-left mx-2"></i>
                                        Order statistics
                                        <span><i className="fa fa-angle-right float-right"></i></span>
                                    </a>
                                </li>
                                <li style={{height: '75px'}} className="w-full h-full py-3 px-2 border-b border-light-border">
                                    <Link to={`/all-order/${id}`}
                                          className="font-sans font-hairline hover:font-normal text-sm text-nav-item no-underline">
                                        <i className="fab fa-wpforms float-left mx-2"></i>
                                        All orders
                                        <span><i className="fa fa-angle-right float-right"></i></span>
                                    </Link>
                                </li>
                            </ul>

                        </aside>
                        {/*/Sidebar*/}

                        {/*Main*/}
                        <main id="show-list" style={{backgroundColor: '#eeeeee'}} className="bg-white-300 flex-1 p-3 overflow-hidden">

                            <div className="flex flex-col">
                                {/* Stats Row Starts Here */}
                                <div className="flex flex-1 flex-col md:flex-row lg:flex-row mx-2">
                                    <div className="shadow-lg bg-red-vibrant border-l-8 hover:bg-red-vibrant-dark border-red-vibrant-dark mb-2 p-2 md:w-1/4 mx-2">
                                        <div className="p-4 flex flex-col">
                                            <a href="#" className="no-underline text-white text-2xl">
                                                <span className="number">{totalMoNey.toLocaleString()}</span> VND
                                            </a>
                                            <a href="#" className="no-underline text-white text-lg">
                                                Total Money
                                            </a>
                                        </div>
                                    </div>

                                    <div className="shadow bg-info border-l-8 hover:bg-info-dark border-info-dark mb-2 p-2 md:w-1/4 mx-2">
                                        <div className="p-4 flex flex-col">
                                            <a href="#" className="no-underline text-white text-2xl">
                                                {totalOrder} Orders
                                            </a>
                                            <a href="#" className="no-underline text-white text-lg">
                                                Total Orders
                                            </a>
                                        </div>
                                    </div>

                                    <div className="shadow bg-warning border-l-8 hover:bg-warning-dark border-warning-dark mb-2 p-2 md:w-1/4 mx-2">
                                        <div className="p-4 flex flex-col">
                                            <a href="#" className="no-underline text-white text-2xl">
                                                {totalUser} Customers
                                            </a>
                                            <a href="#" className="no-underline text-white text-lg">
                                                Total Customers
                                            </a>
                                        </div>
                                    </div>

                                    <div className="shadow bg-success border-l-8 hover:bg-success-dark border-success-dark mb-2 p-2 md:w-1/4 mx-2">
                                        <div className="p-4 flex flex-col">
                                            <a href="#" className="no-underline text-white text-2xl">
                                                {totalProduct} Products
                                            </a>
                                            <a href="#" className="no-underline text-white text-lg">
                                                Total Products
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* /Stats Row Ends Here */}

                                {/* Card Sextion Starts Here */}
                                <div className="flex flex-1 flex-col md:flex-row lg:flex-row mx-2">

                                    {/* card */}

                                    <div className="rounded overflow-hidden shadow bg-white mx-2 w-full">
                                        <div className="flex items-center px-6 py-2 border-b border-light-grey">
                                            <div style={{width: '300px'}} className="font-bold text-xl">{message}
                                               </div>
                                            <div style={{marginLeft: '90px', width: '300px'}} className="ml-4"> {/* Thêm margin-left để tạo khoảng cách giữa div và select */}
                                                <select onChange={selectProduct}  className="form-select">
                                                    <option value="0">Product</option>
                                                    {product && product.map(item => (
                                                        <option value={item.id_product}>{item.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div style={{marginLeft: '30px', width: '300px'}} className="ml-4"> {/* Thêm margin-left để tạo khoảng cách giữa div và select */}
                                                <select onChange={selectUser} className="form-select">
                                                    <option value="0">Customer</option>
                                                    {user && user.map(item => (
                                                        <option value={item.account.id_account}>{item.account.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div style={{marginLeft: '30px', width: '300px'}} className="ml-4"> {/* Thêm margin-left để tạo khoảng cách giữa div và select */}
                                                <select onChange={selectStatus} className="form-select">
                                                    <option value="0">Status</option>
                                                    {status && status.map(item => {
                                                        if(item.id_status !== 7) {
                                                            return(
                                                                    <option value={item.id_status}>{item.name}</option>
                                                                )
                                                        }})
                                                    }

                                                </select>
                                            </div>
                                            <div className="ml-4">
                                                <span style={{marginLeft: '30px'}}>
                                                <button style={{backgroundColor: 'rgb(73 201 121)', color: 'white', borderRadius: '5px', height:'37px', width: '65px'}}
                                                        onClick={()=>{document.getElementById("chart-order").
                                                        scrollIntoView({behavior: "smooth"})}}>Chart</button>
                                            </span>

                                            </div>
                                        </div>


                                        <div className="table-responsive" >
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
                                                        <td>{item.billDetails.map(item=>{
                                                            return(
                                                                <>
                                                                    <p style={{textAlign: 'center'}}>{item.product.name}</p>
                                                                </>
                                                            )
                                                        })}</td>
                                                        <td style={{
                                                            fontWeight: 'bold',
                                                            color: '#a13d3d',
                                                            textAlign: 'center'
                                                        }}><span className="number">{item.total.toLocaleString()}</span> </td>
                                                        <td style={{textAlign: 'center'}}>
                                                            <span className="number">{item.bill.status.name}</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>

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
                                    {/* /card */}

                                </div>
                                {/* /Cards Section Ends Here */}

                                <div className="flex flex-1 flex-col md:flex-row lg:flex-row mx-2 p-1 mt-2 mx-auto lg:mx-2 md:mx-2 justify-between">

                            </div>
                            </div>
                            <div id="chart-order" style={{marginTop: '20px',backgroundColor: 'white', marginLeft: '15px', marginRight: '15px', borderRadius: '5px'}} className="footer-wraper">
                                <button
                                    style={{
                                        backgroundColor: 'white',
                                        marginLeft: '1150px',
                                        height: '25px',
                                        width: '50px',
                                        color: '#8884d8',
                                        marginTop: '10px',
                                        fontSize: '18px'
                                    }}
                                    onClick={() => setConversion(!conversion)}
                                >
                                    Conversion
                                </button>
                                <button
                                    style={{
                                        backgroundColor: 'white',
                                        marginLeft: '60px',
                                        height: '25px',
                                        width: '50px',
                                        color: '#82ca9d',
                                        marginTop: '10px',
                                        fontSize: '18px'
                                    }}
                                    onClick={() => {
                                        document.getElementById("show-list").scrollIntoView({ behavior: "smooth" });
                                    }}
                                >
                                    List
                                </button>
                                {conversion ? (
                                    <Chart data={data}/>
                                ) : (
                                    <MyBarChar data={data}/>
                                )}
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

export default OrderStatistics;