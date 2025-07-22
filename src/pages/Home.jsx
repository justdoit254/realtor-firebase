import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import Slider from "../components/Slider";
import { Link } from "react-router-dom";
import ListingItem from "../components/ListingItem";

/**
 * Fetch listings given Firestore query constraints.
 * Always resolves; never throws.
 * @param {Array} constraints Firestore query constraints: where(...), orderBy(...), limit(...)
 * @returns {Promise<{data: Array, error: Error|null}>}
 */

const fetchListingsByConstraints = async (clause) => {
  try {
    const listingRef = collection(db, "listings");
    const listingQuery = query(
      listingRef,
      clause,
      orderBy("timestamp", "desc"),
      limit(4)
    );
    const querySnap = await getDocs(listingQuery);

    const listings = [];
    querySnap.forEach((doc) => {
      return listings.push({
        id: doc.id,
        data: doc.data(),
      });
    });

    return { data: listings, error: null };
  } catch (error) {
    console.error("Firestore fetch error:", error);
    return { data: [], error };
  }
};

const Home = () => {
  const [offerListings, setOfferListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);
  const [saleListings, setSaleListings] = useState([]);
  const [loading, setLoading] = useState(false); //Can also have individual loading and error

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    (async () => {
      const [offerRes, rentRes, saleRes] = await Promise.allSettled([
        fetchListingsByConstraints(where("offer", "==", true)),
        fetchListingsByConstraints(where("type", "==", "rent")),
        fetchListingsByConstraints(where("type", "==", "sell")),
      ]);

      if (cancelled) return;

      //Offer
      if (offerRes.status == "fulfilled") {
        setOfferListings(offerRes.value.data);
      } else {
        setOfferListings([]);
      }

      //Rent
      if (rentRes.status == "fulfilled") {
        setRentListings(rentRes.value.data);
      } else {
        setRentListings([]);
      }

      //Sale
      if (saleRes.status == "fulfilled") {
        setSaleListings(saleRes.value.data);
      } else {
        setSaleListings([]);
      }
    })();

    setLoading(false);

    return () => (cancelled = true);
  }, []);

  return (
    <div>
      <Slider />
      <div className="max-w-6xl mx-auto pt-4 space-y-6">
        {offerListings?.length > 0 && (
          <div className="m-2 mb-6">
            <h2 className="px-3 text-2xl mt-6 font-semibold">Recent offers</h2>
            <Link to={"/offers"}>
              <p className="px-3 text-sm text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out">
                Show more offers
              </p>
            </Link>
            <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {offerListings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  id={listing.id}
                  listing={listing.data}
                />
              ))}
            </ul>
          </div>
        )}
        {rentListings?.length > 0 && (
          <div className="m-2 mb-6">
            <h2 className="px-3 text-2xl mt-6 font-semibold">
              Places for rent
            </h2>
            <Link to={"/category/rent"}>
              <p className="px-3 text-sm text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out">
                Show more places for rent
              </p>
            </Link>
            <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {rentListings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  id={listing.id}
                  listing={listing.data}
                />
              ))}
            </ul>
          </div>
        )}
        {saleListings?.length > 0 && (
          <div className="m-2 mb-6">
            <h2 className="px-3 text-2xl mt-6 font-semibold">
              Places for sale
            </h2>
            <Link to={"/category/sale"}>
              <p className="px-3 text-sm text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out">
                Show more places for sale
              </p>
            </Link>
            <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {saleListings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  id={listing.id}
                  listing={listing.data}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
