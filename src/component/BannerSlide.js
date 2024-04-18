import React, {Component} from "react";
import Slider from "react-slick";


function SampleNextArrow(props) {
    const { className, style, onClick } = props;
    return (
        <div
            className={className}
            style={{ ...style, display: "block", background: "white" }}
            onClick={onClick}>
        </div>

    );
}

function SamplePrevArrow(props) {
    const { className, style, onClick } = props;
    return (
        <div
            className={className}
            style={{ ...style, display: "block", background: "white" }}
            onClick={onClick}
        />
    );
}
export default class BannerSlide extends Component {
    render() {
        var settings = {
            infinite: true,
            slidesToShow: 3,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 3000,
            pauseOnHover: true,
            nextArrow: <SampleNextArrow />,
            prevArrow: <SamplePrevArrow />
        };
        return (
            <div>
                <Slider {...settings}>
                    <div className="banner-item">
                        <img src="https://atpsoftware.vn/wp-content/uploads//2018/11/coppy.jpg"
                             alt=""/>
                    </div>
                    <div className="banner-item">
                        <img src="https://bumshop.com.vn/wp-content/uploads/2019/07/do-the-thao-nu-1.jpg"
                             alt=""/>
                    </div>
                    <div className="banner-item">
                        <img src="https://anlocgroup.com/wp-content/uploads/2023/06/thiet-ke-shop-the-thao-05-jpg.webp"
                             alt=""/>
                    </div>
                    <div className="banner-item">
                        <img src="https://mcdn.coolmate.me/image/October2022/tong-hop-9-dia-chi-ban-quan-ao-the-thao-chat-luong-nhat-tai-ha-noi_559.jpg"
                             alt=""/>
                    </div>
                    <div className="banner-item">
                        <img src="https://noithatkfa.com/wp-content/uploads/2023/04/thiet-ke-shop-the-thao-33-Cong-ty-noi-that-KFA.jpg"
                             alt=""/>
                    </div>
                    <div className="banner-item">
                        <img src="https://anviethouse.vn/wp-content/uploads/2022/06/thiet-ke-cua-hang-the-thao-cao-cap-4.jpg"
                             alt=""/>
                    </div>
                </Slider>
            </div>
        );
    }
}
