import React from "react";
import { Link } from "react-router-dom";
import { imagesUrl } from "../assets/imagesUrl";
import { useFromNow } from "../hooks/useFromNow";
import { MdEdit, MdLocationOn } from "react-icons/md";
import { FaTrash } from "react-icons/fa";

const ListingItem = ({ listing, id, onDelete, onEdit }) => {
  const {
    type,
    timestamp,
    address,
    name,
    offer,
    discountedPrice,
    regularPrice,
    bedrooms,
    bathrooms,
  } = listing;
  const fromNowListingTime = useFromNow(timestamp);
  return (
    <li className="relative bg-white flex flex-col justify-between items-center shadow-md hover:shadow-xl rounded-md overflow-hidden transition-shadow duration-150 m-[10px]">
      <Link to={`/category/${type}/${id}`} className="contents">
        <img
          className="h-[170px] w-full object-cover hover:scale-105 transition-scale duration-200 ease-in"
          src={imagesUrl[Math.floor(Math.random() * 10)]}
          alt="house"
          loading="lazy"
        />
        <span className="absolute top-2 left-2 bg-[#3377cc] text-white uppercase text-xs font-semibold rounded-md px-2 py-1 shadow-lg">
          {fromNowListingTime}
        </span>
        <div className="w-full p-[10px]">
          <div className="flex items-center space-x-1">
            <MdLocationOn className="h-4 w-4 text-green-600" />
            <p className="font-semibold text-sm mb-[2px] text-gray-600 truncate">
              {address}
            </p>
          </div>
          <p className="font-semibold m-0 text-xl truncate">{name}</p>
          <p className="text-[#457b9d] mt-2 font-semibold">
            ₹{" "}
            {offer
              ? discountedPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              : regularPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            {type === "rent" && " / month"}
          </p>
          <div className="flex items-center mt-[10px] space-x-3">
            <div className="flex items-center space-x-1">
              <p className="font-bold text-xs">
                {bedrooms > 1 ? `${bedrooms} Beds` : "1 Bed"}
              </p>
            </div>
            <div className="flex items-center space-x-1">
              <p className="font-bold text-xs">
                {bathrooms > 1 ? `${bathrooms} Baths` : "1 Bath"}
              </p>
            </div>
          </div>
        </div>
      </Link>
      {onDelete && (
        <FaTrash
          className="absolute bottom-2 right-2 h-[14px] cursor-pointer text-red-500"
          onClick={() => onDelete(id)}
        />
      )}
      {onEdit && (
        <MdEdit
          className="absolute bottom-2 right-7 h-4 cursor-pointer "
          onClick={() => onEdit(id)}
        />
      )}
    </li>
  );
};

export default ListingItem;
