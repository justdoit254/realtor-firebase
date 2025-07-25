import { useEffect, useState } from "react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import Spinner from "./Spinner";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import { useNavigate } from "react-router";
import { imagesUrl } from "../assets/imagesUrl";

const Slider = () => {
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);

  SwiperCore.use([Autoplay, Navigation, Pagination]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const listingsRef = collection(db, "listings");
      const q = query(listingsRef, orderBy("timestamp", "desc"), limit(5));
      const querySnap = await getDocs(q);

      let listings = [];
      querySnap.forEach((doc) =>
        listings.push({
          id: doc.id,
          data: doc.data(),
        })
      );
      setListings(listings);
      setLoading(false);
      console.log({ listings });
    })();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  if (listings.length === 0) {
    return <></>;
  }

  return (
    <Swiper
      slidesPerView={1}
      navigation
      pagination={{ type: "progressbar" }}
      effect="fade"
      modules={[EffectFade]}
      autoplay={{ delay: 3000 }}
    >
      {listings.map(({ data, id }) => (
        <SwiperSlide
          key={id}
          onClick={() => navigate(`/category/${data.type}/${id}`)}
        >
          <div
            style={{
              background: `url(${
                imagesUrl[Math.floor(Math.random() * 10)]
              }) center, no-repeat`,
              //   background: `url(${data.imgUrls[0]}) center, no-repeat`,
              backgroundSize: "cover",
            }}
            className="relative w-full h-[300px] overflow-hidden"
          ></div>
          <p className="text-[#f1faee] absolute left-1 top-3 font-medium max-w-[90%] bg-[#457b9d] shadow-lg opacity-90 p-2 rounded-br-3xl">
            {data.name}
          </p>
          <p className="text-[#f1faee] absolute left-1 bottom-1 font-semibold max-w-[90%] bg-[#e63946] shadow-lg opacity-90 p-2 rounded-tr-3xl">
            ${data.discountedPrice ?? data.regularPrice}
            {data.type === "rent" && " / month"}
          </p>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default Slider;
