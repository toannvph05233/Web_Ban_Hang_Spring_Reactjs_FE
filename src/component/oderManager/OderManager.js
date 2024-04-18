import {Link, useParams} from "react-router-dom";
import Header from "../../layout/Header";
import React, {useEffect, useState} from "react";
import {findAllOrdersByMerchant, findUser, groupByBill} from "../../service/BillService";
import {getAllProductByIdMerchant} from "../../service/ProductService";
import {
    findByMonthAndMerchant,
    findByQuarter,
    findByTimeRange,
    findByYearAndWeekAndMerchant
} from "../../service/BillDetailService";
import Footer from "../../layout/Footer";
import Chart from "../../component/oderManager/Chart"
import Test from "./Test";
import MyBarChar from "./Test";
import ReactPaginate from "react-paginate";

function OrderManager(effect, deps) {
    let {id} = useParams();
    const [billDetail, setBillDetail] = useState([]);
    const [user, setUser] = useState([]);
    const [product, setProduct] = useState([]);
    const [check, setCheck] = useState(true);
    const [message, setMessage] = useState("");
    const [totalMoNey, setTotalMoNey] = useState(0);
    const [displayMonth, setDisplayMonth] = useState(12)
    const [totalProduct, setTotalProduct] = useState(0);
    const [totalOrder, setTotalOrder] = useState(0);
    const [totalUser, setTotalUser] = useState(0);
    const [year, setYear] = useState(0);
    const [quarter, setQuarter] = useState(0);
    const [month, setMonth] = useState(undefined);
    const [week, setWeek] = useState(0);
    const [startTime, setStartTime] = useState(undefined);
    const [endTime, setEndTime] = useState(undefined);
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

    useEffect(() => {
        if (check) {
            findAllOrdersByMerchant(id).then(r => {
                if (r.length !== 0){
                    let arr = groupByBill(r)
                    setList(arr)
                    setBillDetail(arr.slice(0, ItemsPerPage))
                    setData(calculateTotalByYear(arr))
                    order(arr.length)
                    money(arr)
                    setYear(new Date().getFullYear())
                    setMessage("Statistics")
                    setWeek(totalWeek(year));
                }
            })

        }
        getAllProductByIdMerchant(id).then(re => {
            setProduct(re)
            setTotalProduct(re.length)
        })
        findUser(id).then(r => {
            if (r !== undefined){
                setUser(r.reverse())
                setTotalUser(r.length)
            }
        })
    }, [check]);


    const startDate = (e) => {
        const value = e.target.value
        setStartTime(value)
        if (endTime !== undefined && value !== undefined) {
            findByTimeRange(id, startTime, value).then(r => {
                if (r === undefined) {
                    setCheck(true)
                } else {
                    if (setBill(r)){
                        setData(calculateTotalByYear(groupByBill(r)))
                    }
                }
            })
        }
    }

    const endDate = (e) => {
        const value = e.target.value
        setEndTime(value)
        if (startTime !== undefined && value !== undefined) {
            findByTimeRange(id, startTime, value).then(r => {
                if (r === undefined) {
                    setCheck(true)
                } else {
                    if (setBill(r)){
                        setData(calculateTotalByYear(groupByBill(r)))
                    }
                }
            })
        }
    }
    const fetchDataByQuarter = async (valueQuarter) => {
        try {
            const result = await findByQuarter(id, valueQuarter);
            if (result !== undefined) {
                setDisplayMonth(3)
                setBill(result)
                setData(calculateTotalByQuarter(groupByBill(result)))
            } else {
                setCheck(true);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const selectQuarter = async (e) => {
        const value = e.target.value;
        setQuarter(value);
        await fetchDataByQuarter(value);
    };

    const selectMonth = async (e) => {
        const value = e.target.value;
        try {
            const monthFromQuarter = (quarter === 0) ? value : getMonthFromQuarterAndMonth(quarter, value);
            setWeek(getWeeksInMonth(value, year));
            setMonth(monthFromQuarter);
            const r = await findByMonthAndMerchant(id, year, monthFromQuarter);
            if (r !== undefined) {
                if (setBill(r)){
                    setData(calculateTotalByMonth(groupByBill(r)))
                }
            } else {
                setCheck(true);
            }
        } catch (error) {
            console.error("Error:", error);
            // Xử lý lỗi nếu cần
        }
    };


    const selectWeek = (e) => {
        const value = e.target.value;
        if (month === undefined) {
            findByYearAndWeekAndMerchant(id, year, value).then(r => {
                if (r !== undefined) {
                    if (setBill(r)){
                        setData(calculateTotalByDayOfWeek(groupByBill(r)))
                    }
                } else {
                    setCheck(true)
                }
            })
        } else {
            const valueWeek = getWeeksFromStartOfYear(year, month, value)
            findByYearAndWeekAndMerchant(id, year, valueWeek).then(res => {
                if (res !== undefined) {
                    if (setBill(res)) {
                        setData(calculateTotalByDayOfWeek(groupByBill(res)))
                    }
                } else {
                    setCheck(true)
                }
            })
        }
    }
    const setBill = (r) => {
        if (r.length > 0) {
            let arr = groupByBill(r);
            setList(arr)
            setBillDetail(arr.slice(0, ItemsPerPage))
            order(arr.length);
            money(arr);
            setMessage("Result search");
            setCheck(false);
            return true
        } else {
            setTotalOrder(0);
            setTotalMoNey(0);
            setBillDetail([]);
            setData([{name: '', Money: 0 , Orders: 0}, {name: '', Money: 0 , Orders: 0},
                {name: '', Money: 0 , Orders: 0}, {name: '', Money: 0 , Orders: 0},
                {name: '', Money: 0 , Orders: 0}, {name: '', Money: 0 , Orders: 0}])
            setMessage("No order display");
            return false
        }
    }

    const calculateTotalByDayOfWeek = (billDetails) => {
        let a = 0;
        const result = Array.from({ length: 7 }, (_, index) => {
            const currentDate = new Date();
            currentDate.setDate(currentDate.getDate() - currentDate.getDay() + index);
            return {name: '', Money: 0 ,Orders: 0};
        });
        billDetails.forEach(detail => {
            const orderDate = new Date(detail.bill.time_purchase);
            const dayOfWeek = orderDate.getDay();
            result[dayOfWeek].Money += detail.total;
            result[dayOfWeek].Orders += 1;
        });
        for (let i = 0; i < result.length; i++) {
            result[i].name = "Days " + (i+1);
        }
         return result;
    };


    const calculateTotalByMonth = (billDetails) => {
        const result = Array.from({ length: 4 }, (_, index) => {
            const currentDate = new Date();
            currentDate.setDate(1);
            currentDate.setDate(currentDate.getDate() + (index * 7));
            const monthNumber = currentDate.getMonth() + 1;
            return { name: '', Money: 0, Orders: 0 };
        });
        billDetails.forEach(detail => {
            const orderDate = new Date(detail.bill.time_purchase);
            const monthIndex = Math.floor((orderDate.getDate() - 1) / 7);
            result[monthIndex].Money += detail.total;
            result[monthIndex].Orders += 1;
        });
        for (let i = 0; i < result.length; i++) {
            result[i].name = 'Week ' + (i+1)
        }
        return result;
    };

    const calculateTotalByQuarter = (billDetails) => {
        const result = Array.from({ length: 3 }, (_, index) => {
            return { name: ``, Money: 0, Orders: 0 };
        });
        billDetails.forEach(detail => {
            const orderDate = new Date(detail.bill.time_purchase);
            const monthIndex = orderDate.getMonth() % 3;
            // Cập nhật tổng đơn và tổng tiền cho tháng đó trong mảng kết quả
            result[monthIndex].Money += detail.total;
            result[monthIndex].Orders += 1;
        });
        for (let i = 0; i < result.length; i++) {
            result[i].name = `Month ${i + 1}`;
        }
        return result;
    };

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



    const months = Array.from({length: displayMonth}, (_, index) => (
        <option key={index + 1} value={index + 1}>{index + 1} month</option>
    ));
    const dates = Array.from({length: week}, (_, index) => (
        <option key={index + 1} value={index + 1}>{index + 1} week</option>
    ));

    const totalWeek = (year) => {
        const firstDayOfYear = new Date(year, 0, 1);
        const daysToNearestWednesday = (4 - firstDayOfYear.getDay() + 7) % 7;
        const nearestWednesday = new Date(firstDayOfYear);
        nearestWednesday.setDate(firstDayOfYear.getDate() + daysToNearestWednesday);
        const daysInYear = (new Date(year + 1, 0, 1) - nearestWednesday) / (24 * 60 * 60 * 1000);
        return Math.ceil(daysInYear / 7);

    }

    const getWeeksInMonth = (year, month) => {
        const firstDayOfMonth = new Date(year, month - 1, 1);
        const daysToNearestWednesday = (4 - firstDayOfMonth.getDay() + 7) % 7;
        const nearestWednesday = new Date(firstDayOfMonth);
        nearestWednesday.setDate(firstDayOfMonth.getDate() + daysToNearestWednesday);
        const daysInMonth = new Date(year, month, 0).getDate();
        return Math.ceil((daysInMonth - nearestWednesday.getDate() + 1) / 7);
    }

    const getWeeksFromStartOfYear = (year, month, userInputWeek) => {
        const firstDayOfYear = new Date(year, 0, 1);
        const dateOfUserInputWeek = new Date(year, month - 1, userInputWeek * 7);
        const daysFromStartOfYear = Math.floor((dateOfUserInputWeek - firstDayOfYear) / (24 * 60 * 60 * 1000));
        return Math.ceil(daysFromStartOfYear / 7);


    }
    const getMonthFromQuarterAndMonth = (quarter, monthInQuarter) => {
        const month = (quarter - 1) * 3;
        return month + parseInt(monthInQuarter);
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
                        <aside style={{marginTop: '18px'}} id="sidebar"
                               className="bg-side-nav w-1/2 md:w-1/6 lg:w-1/6 border-r border-side-nav hidden md:block lg:block">

                            <ul className="list-reset flex flex-col">
                                <li style={{backgroundColor: '#efd6d6', height: '73px'}}
                                    className=" w-full h-full py-3 px-2 border-b border-light-border">
                                    <a
                                        className="font-sans font-hairline hover:font-normal text-sm text-nav-item no-underline">
                                        <i className="fas fa-tachometer-alt float-left mx-2"></i>
                                        Dashboard
                                        <span><i className="fas fa-angle-right float-right"></i></span>
                                    </a>
                                </li>
                                <li style={{height: '73px'}}
                                    className="w-full h-full py-3 px-2 border-b border-light-border">
                                    <Link to={`/order-statistics/${id}`}
                                          className="font-sans font-hairline hover:font-normal text-sm text-nav-item no-underline">
                                        <i className="fas fa-table float-left mx-2"></i>
                                        Order statistics
                                        <span><i className="fa fa-angle-right float-right"></i></span>
                                    </Link>
                                </li>
                                <li style={{height: '73px'}}
                                    className="w-full h-full py-3 px-2 border-b border-light-border">
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
                        <main style={{backgroundColor: '#eeeeee'}} className="bg-white-300 flex-1 p-3 overflow-hidden">

                            <div id="show-list" className="flex flex-col">
                                {/* Stats Row Starts Here */}
                                <div className="flex flex-1 flex-col md:flex-row lg:flex-row mx-2">
                                    <div
                                        className="shadow-lg bg-red-vibrant border-l-8 hover:bg-red-vibrant-dark border-red-vibrant-dark mb-2 p-2 md:w-1/4 mx-2">
                                        <div className="p-4 flex flex-col">
                                            <a href="#" className="no-underline text-white text-2xl">
                                                <span className="number">{totalMoNey.toLocaleString()}</span> VND
                                            </a>
                                            <a href="#" className="no-underline text-white text-lg">
                                                Total Money
                                            </a>
                                        </div>
                                    </div>

                                    <div
                                        className="shadow bg-info border-l-8 hover:bg-info-dark border-info-dark mb-2 p-2 md:w-1/4 mx-2">
                                        <div className="p-4 flex flex-col">
                                            <a href="#" className="no-underline text-white text-2xl">
                                                {totalOrder} Orders
                                            </a>
                                            <a href="#" className="no-underline text-white text-lg">
                                                Total Orders
                                            </a>
                                        </div>
                                    </div>

                                    <div
                                        className="shadow bg-warning border-l-8 hover:bg-warning-dark border-warning-dark mb-2 p-2 md:w-1/4 mx-2">
                                        <div className="p-4 flex flex-col">
                                            <a href="#" className="no-underline text-white text-2xl">
                                                {totalUser} Customers
                                            </a>
                                            <a href="#" className="no-underline text-white text-lg">
                                                Total Customers
                                            </a>
                                        </div>
                                    </div>

                                    <div
                                        className="shadow bg-success border-l-8 hover:bg-success-dark border-success-dark mb-2 p-2 md:w-1/4 mx-2">
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
                                            <div className="font-bold text-xl" style={{width: '300px'}}>{message}
                                            </div>
                                            <div style={{marginLeft: '1px', width: '200px'}}
                                                 className="ml-4"> {/* Thêm margin-left để tạo khoảng cách giữa div và select */}
                                                <select onChange={selectQuarter} className="form-select">
                                                    <option>Quarter</option>
                                                    <option value="1">Quarter 1</option>
                                                    <option value="2">Quarter 2</option>
                                                    <option value="3">Quarter 3</option>
                                                    <option value="4">Quarter 4</option>
                                                </select>
                                            </div>
                                            <div style={{marginLeft: '20px', width: '200px'}}
                                                 className="ml-4"> {/* Thêm margin-left để tạo khoảng cách giữa div và select */}
                                                <select onChange={selectMonth} className="form-select">
                                                    <option>Month</option>
                                                    {months}
                                                </select>
                                            </div>
                                            <div style={{marginLeft: '20px', width: '200px'}}
                                                 className="ml-4"> {/* Thêm margin-left để tạo khoảng cách giữa div và select */}
                                                <select onChange={selectWeek} className="form-select">
                                                    <option>Week</option>
                                                    {dates}
                                                </select>
                                            </div>

                                            <div style={{marginLeft: '40px', width: '70px'}}
                                                 className="ml-4"> {/* Thêm margin-left để tạo khoảng cách giữa div và select */}
                                                <div style={{width: '200px'}}>
                                                    <input onChange={startDate} type="date" className="form-input"/>
                                                </div>
                                            </div>
                                            <div style={{width: '245px', marginLeft: '55px'}}>
                                                <input onChange={endDate} type="date" className="form-input"/>
                                            </div>

                                            <div style={{marginLeft: '30px'}}
                                                 className="ml-4"> {/* Thêm margin-left để tạo khoảng cách giữa div và select */}
                                                <button onClick={() => {
                                                    setCheck(true);
                                                    setStartTime(undefined);
                                                    setEndTime(undefined)
                                                }} className="btn btn-dark">Clear
                                                </button>
                                            </div>
                                            <div>
                                                <span style={{marginLeft: '15px'}}>
                                                <button style={{backgroundColor: 'rgb(73 201 121)', color: 'white', borderRadius: '5px', height:'37px', width: '65px'}}
                                                        onClick={()=>{document.getElementById("chart-manage").
                                                        scrollIntoView({behavior: "smooth"})}}>Chart</button>
                                            </span>
                                            </div>


                                        </div>
                                        <div className="table-responsive">
                                            <table className="table text-grey-darkest">
                                                <thead className="bg-grey-dark text-white text-normal">
                                                <tr style={{textAlign: 'center'}}>
                                                    <th scope="col"></th>
                                                    <th scope="col">Customer Name</th>
                                                    <th scope="col">Customer Phone</th>
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
                                                        <td style={{textAlign: 'center'}}>{new Date(item.billDetails[0].time_purchase).toLocaleString(
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
                            </div>

                            <div id="chart-manage" style={{marginTop: '20px',backgroundColor: 'white', marginLeft: '15px', marginRight: '15px', borderRadius: '5px'}} className="footer-wraper">
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

export default OrderManager;