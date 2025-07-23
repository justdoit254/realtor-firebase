import React, { useEffect, useState } from "react";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate, useParams } from "react-router";
import ListingItem from "../components/ListingItem";

const Category = () => {
  const navigate = useNavigate();
  const { categoryName } = useParams();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastFetchedListing, setLastFetchedListing] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const listingRef = collection(db, "listings");
        const queryForData = query(
          listingRef,
          where("type", "==", categoryName),
          orderBy("timestamp", "desc"),
          limit(8)
        );
        const querySnap = await getDocs(queryForData);
        const lastListingIndex = querySnap.docs[querySnap.docs.length - 1];
        setLastFetchedListing(lastListingIndex);

        let listings = [];

        querySnap.forEach((doc) =>
          listings.push({ id: doc.id, data: doc.data() })
        );
        setListings(listings);
      } catch (error) {
        console.log("Error in fetching offer", error);
        toast.error("Error fetching offers");
        navigate("/");
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate, categoryName]);

  const onFetchMoreListings = async () => {
    try {
      const listingRef = collection(db, "listings");
      const queryForData = query(
        listingRef,
        where("type", "==", categoryName),
        orderBy("timestamp", "desc"),
        startAfter(lastFetchedListing),
        limit(4)
      );
      const querySnap = await getDocs(queryForData);
      const lastListingIndex = querySnap.docs[querySnap.docs.length - 1];
      setLastFetchedListing(lastListingIndex);

      let listings = [];

      querySnap.forEach((doc) =>
        listings.push({ id: doc.id, data: doc.data() })
      );
      setListings((prevListing) => [...prevListing, ...listings]);
    } catch (error) {
      console.log("Error in fetching offer", error);
      toast.error("Error fetching offers");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-3">
      <h1 className="text-3xl text-center mt-6 font-bold mb-6">
        {categoryName === "rent" ? "Places for rent" : "Places for sale"}
      </h1>
      {loading ? (
        <Spinner />
      ) : listings?.length > 0 ? (
        <>
          <main>
            <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {listings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  id={listing.id}
                  listing={listing.data}
                />
              ))}
            </ul>
          </main>
          {lastFetchedListing && (
            <div className="flex justify-center items-center">
              <button
                className="bg-white px-3 py-1.5 text-gray-700 border border-gray-300 mb-6 mt-6 hover:border-slate-600 rounded transition duration-150 ease-in-out"
                onClick={onFetchMoreListings}
              >
                Load more
              </button>
            </div>
          )}
        </>
      ) : (
        <p>There are no current offers</p>
      )}
    </div>
  );
};

export default Category;
