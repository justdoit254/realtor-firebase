import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { db } from "../firebase";
import Spinner from "../components/Spinner";
import SwiperCore from "swiper";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css/bundle";
import { imagesUrl } from "../assets/imagesUrl";
import {
  FaBath,
  FaBed,
  FaChair,
  FaMapMarkerAlt,
  FaParking,
  FaShare,
} from "react-icons/fa";
import { getAuth } from "firebase/auth";
import Contact from "../components/Contact";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

const Listing = () => {
  const auth = getAuth();
  const { listingId } = useParams();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const [contactLandlord, setContactLandlord] = useState(false);

  const {
    name,
    offer,
    discountedPrice,
    regularPrice,
    type,
    address,
    description,
    bedrooms,
    bathrooms,
    parking,
    furnished,
    geolocation,
    userRef,
  } = listing || {};

  SwiperCore.use([Autoplay, Navigation, Pagination]);

  useEffect(() => {
    (async function () {
      setLoading(true);
      const docRef = doc(db, "listings", listingId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const docData = docSnap.data();
        setListing(docData);
      }
      setLoading(false);
    })();
  }, [listingId]);

  return loading ? (
    <Spinner />
  ) : (
    <main>
      <Swiper
        slidesPerView={1}
        navigation
        pagination={{ type: "progressbar" }}
        effect="fade"
        modules={[EffectFade]}
        autoplay={{ delay: 3000 }}
      >
        {imagesUrl.slice(4).map((url, index) => (
          <SwiperSlide key={index}>
            <div
              className="w-full overflow-hidden h-[300px]"
              style={{
                background: `url(${url}) center no-repeat`,
                backgroundSize: "cover",
              }}
            ></div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div
        className="fixed top-[13%] right-[3%] z-10 bg-white cursor-pointer border-gray-400 border-2 rounded-full p-2"
        onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          setShareLinkCopied(true);
          setTimeout(() => {
            setShareLinkCopied(false);
          }, 2000);
        }}
      >
        <FaShare />
      </div>
      {shareLinkCopied && (
        <p className="fixed top-[23%] right-[3%] font-semibold text-sm border-2 border-gray-400 rounded-md bg-white z-10 px-2 py-1">
          Link copied
        </p>
      )}
      <div className="flex flex-col md:flex-row max-w-6xl lg:mx-auto m-4 p-4 rounded-lg shadow-lg bg-white lg:space-x-5">
        <div className="w-full lg-[400px]">
          <p className="text-2xl font-bold mb-3 text-blue-900">
            {name} - ₹{" "}
            {offer
              ? discountedPrice
                  ?.toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              : regularPrice?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            {type === "rent" && " / month"}
          </p>
          <p className="flex items-center mb-3 font-semibold">
            <FaMapMarkerAlt className="text-green-700 mr-1" />
            {address}
          </p>
          <div className="flex justify-start items-center space-x-4 w-[75%]">
            <p className="bg-red-800 w-full max-w-[150px] rounded-md p-1 text-white text-center font-semibold shadow-md">
              {type === "rent" ? "Rent" : "Sale"}
            </p>
            {offer && (
              <p className="bg-green-800 w-full max-w-[200px] rounded-md p-1 text-white text-center font-semibold shadow-md">
                ₹{" "}
                {(regularPrice - discountedPrice)
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                discount
              </p>
            )}
          </div>
          <p className="my-3">
            <span className="font-semibold">Description</span> - {description}
          </p>
          <ul className="flex items-center space-x-2 sm:space-x-10 text-sm font-semibold mb-6">
            <li className="flex items-center whitespace-nowrap">
              <FaBed className="text-lg mr-1" />
              {+bedrooms > 1 ? `${bedrooms} Beds` : "1 Bed"}
            </li>
            <li className="flex items-center whitespace-nowrap">
              <FaBath className="text-lg mr-1" />
              {+bathrooms > 1 ? `${bathrooms} Baths` : "1 Bath"}
            </li>
            <li className="flex items-center whitespace-nowrap">
              <FaParking className="text-lg mr-1" />
              {parking ? "Parking spot" : "No parking"}
            </li>
            <li className="flex items-center whitespace-nowrap">
              <FaChair className="text-lg mr-1" />
              {furnished ? "Furnished" : "Not furnished"}
            </li>
          </ul>
          {userRef !== auth?.currentUser?.uid && !contactLandlord && (
            <div className="mt-6">
              <button
                className="px-7 py-3 bg-blue-600 text-white font-medium text-sm uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg w-full text-center transition duration-150 ease-in-out"
                onClick={() => setContactLandlord(true)}
              >
                Contact Landlord
              </button>
            </div>
          )}
          {contactLandlord && <Contact userRef={userRef} listing={listing} />}
        </div>
        {geolocation && (
          <div className="w-full h-[200px] md:h-[400px] z-10 overflow-x-hidden mt-6 md:mt-0 md:ml-2">
            <MapContainer
              center={[+geolocation?.lat, +geolocation?.lng]}
              zoom={13}
              scrollWheelZoom={false}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[+geolocation?.lat, +geolocation?.lng]}>
                <Popup>{address}</Popup>
              </Marker>
            </MapContainer>
          </div>
        )}
      </div>
    </main>
  );
};

export default Listing;
