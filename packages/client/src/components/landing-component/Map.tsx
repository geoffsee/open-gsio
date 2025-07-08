import ReactMap from 'react-map-gl/mapbox'; // ↔ v5+ uses this import path
import 'mapbox-gl/dist/mapbox-gl.css';
import { Box, HStack, Button, Input, Center } from '@chakra-ui/react';
import { useState, useEffect, useCallback } from 'react';

import MapNext from './MapNext.tsx';

// Types for bevy_flurx_ipc communication
interface GpsPosition {
  latitude: number;
  longitude: number;
  zoom: number;
}

interface VesselStatus {
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
}

interface MapViewParams {
  latitude: number;
  longitude: number;
  zoom: number;
}

interface AuthParams {
  authenticated: boolean;
  token: string | null;
}

// public key
const key =
  'cGsuZXlKMUlqb2laMlZ2Wm1aelpXVWlMQ0poSWpvaVkycDFOalo0YkdWNk1EUTRjRE41YjJnNFp6VjNNelp6YXlKOS56LUtzS1l0X3VGUGdCSDYwQUFBNFNn';

function Map(props: { visible: boolean }) {
  return (
    /* Full-screen wrapper — fills the viewport and becomes the positioning context */
    <Box w="100%" h="100vh" position="relative" overflow="hidden">
      {/* Button bar — absolutely positioned inside the wrapper */}

      <MapNext mapboxPublicKey={atob(key)} />
      {/*<Map*/}
      {/*    mapboxAccessToken={atob(key)}*/}
      {/*    initialViewState={mapView}*/}
      {/*    onMove={handleMapViewChange}*/}
      {/*    mapStyle="mapbox://styles/mapbox/dark-v11"*/}
      {/*    reuseMaps*/}
      {/*    attributionControl={false}*/}
      {/*    style={{width: '100%', height: '100%'}}  // let the wrapper dictate size*/}
      {/*>*/}
      {/*    /!*{vesselPosition && (*!/*/}
      {/*    /!*    <Source id="vessel-data" type="geojson" data={vesselGeojson}>*!/*/}
      {/*    /!*        <Layer {...vesselLayerStyle} />*!/*/}
      {/*    /!*    </Source>*!/*/}
      {/*    /!*)}*!/*/}
      {/*</Map>*/}
    </Box>
  );
}

export default Map;
