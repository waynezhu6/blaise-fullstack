import React, { useState, useEffect, useRef } from 'react';
import ReactMapGL, { Marker } from 'react-map-gl';
import { useDebounce } from 'use-debounce';
import Pin from './Pin';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import styles from '../styles/Map.module.scss';
import Overlay from './Overlay';
import useOSRMRoute from '../lib/hooks';
// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;

const Map = ( ) => {

  const map = useRef(); // access underlying mapbox-gl object on mount

  const [viewport, setViewport] = useState({
    width: "100%",
    height: "100%",
    longitude: -79.3971,
    latitude: 43.6597,
    zoom: 12
  });

  const [from, setFrom] = useState({lon: -79.3971, lat: 43.6597});
  const [to, setTo] = useState({lon: -79.337409, lat: 43.689225});
  const getOSRMRoute = useOSRMRoute();

  const [linear, setLinear] = useState(false); // true to display walking path
  const [linearDebounce] = useDebounce(linear, 300);

  const [last, setLast] = useState(Date.now()); // value for debouncing marker dragging
  const [lastDebounce] = useDebounce(last, 300);

  // draw initial route on load
  useEffect(() => {
    const MapboxGL = map.current.getMap();
    console.log('loaded');
    MapboxGL.on('load', () => renderOSRMRoute());

    const updateSize = () => setViewport(viewport);
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize)
  }, []);

  // redraw route when debounced values are changed
  useEffect(() => {
    console.log('recalculating route...');
    clearPath();
    renderOSRMRoute();
  }, [lastDebounce, linearDebounce]);

  const getGeoJSONCoordinates = async() => {
    // return route coordinates
    if(linear)
      return [[from.lon, from.lat], [to.lon, to.lat]]

    else{
      let route = await getOSRMRoute(from, to);
      return [
        [from.lon, from.lat],
        ...route,
        [to.lon, to.lat]
      ]
    }
  }

  const renderOSRMRoute = async() => {
    // render route line on map
    if(!map.current)
      return;

    let coordinates = await getGeoJSONCoordinates();

    try{
      const MapboxGL = map.current.getMap();
      MapboxGL.addSource('route', {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'properties': {},
          'geometry': {
            'type': 'LineString',
            'coordinates': coordinates
          }
        }
      });
  
      MapboxGL.addLayer({
        'id': 'route',
        'type': 'line',
        'source': 'route',
        'layout': {
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
        'line-color': '#00CCAD',
        'line-width': 4
        }
      });
    }
    catch(e){
      console.log(e);
    }

  }

  const clearPath = () => {
    // remove existing paths
    const MapboxGL = map.current.getMap();
    if(MapboxGL.getLayer('route')){
      MapboxGL.removeLayer('route');
      MapboxGL.removeSource('route');
    }
  }

  return (
    <div className={styles.body}>

      <Overlay setLinear={setLinear} from={from} to={to}/>

      <ReactMapGL
        {...viewport}
        minZoom={1}
        maxZoom={16}
        onViewportChange={nextViewport => setViewport(nextViewport)}
        mapboxApiAccessToken={"pk.eyJ1Ijoid2F5bmV6IiwiYSI6ImNrbDdmN3BtcTJteWsyb3BsNGt0YmpnZmYifQ.A-To5_8sa_6FqSTUW5TG1g"}
        ref={map}
      >

        <Marker
          longitude={from.lon}
          latitude={from.lat}
          draggable
          offsetTop={-40}
          offsetLeft={-20}
          onDragStart={() => clearPath()}
          onDrag={(e) => setFrom({lon: e.lngLat[0], lat: e.lngLat[1]})}
          onDragEnd={(e) => {
            setFrom({lon: e.lngLat[0], lat: e.lngLat[1]});
            setLast(Date.now());
          }}
        >
          <Pin size={40} fill="#DD0000"/>
        </Marker>

        <Marker
          longitude={to.lon}
          latitude={to.lat}
          draggable
          offsetTop={-40}
          offsetLeft={-20}
          onDragStart={() => clearPath()}
          onDrag={(e) => setTo({lon: e.lngLat[0], lat: e.lngLat[1]})}
          onDragEnd={(e) => {
            setTo({lon: e.lngLat[0], lat: e.lngLat[1]});
            setLast(Date.now());
          }}
        >
          <Pin size={40} fill="#766DB1"/>
        </Marker>

      </ReactMapGL>
    </div>

  );
}

export default Map;