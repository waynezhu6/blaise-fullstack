import { useState } from 'react';
import getOSRMRoute from './api';

const useOSRMRoute = () => {
  // keep a memoized list of previously accessed coordinates
  const [routes, setRoutes] = useState({});
  
  const getOSMRRoute = async(from, to) => {
    let key = formatCoordinates(from, to);
    if(key in routes){
      console.log('memoized route');
      return routes[key];
    }
    else{
      let res = await getOSRMRoute(from, to);
      setRoutes({...routes, [key]: res.routes[0].geometry.coordinates});
      return res.routes[0].geometry.coordinates;
    }
  }

  return getOSMRRoute;
}

const formatCoordinates = (from, to) => {
  // returns representation of coordinates to 3 significant digits
  return `${from.lon.toFixed(3)},${from.lat.toFixed(3)};` +
    `${to.lon.toFixed(3)},${to.lat.toFixed(3)}`;
}

export default useOSRMRoute;