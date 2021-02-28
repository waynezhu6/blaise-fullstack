// use OSRM's demo server
const API_ADDRESS = "https://router.project-osrm.org/route/v1/driving/";

const getOSRMRoute = async(from, to) => {
  // fetches route from osrm api's route service
  let coordinates =  `${from.lon},${from.lat};${to.lon},${to.lat}`;
  let options = '?geometries=geojson&overview=full';
  let res = await fetch(API_ADDRESS + coordinates + options)
    .then(res => res.json());
  return res;
}

export default getOSRMRoute;