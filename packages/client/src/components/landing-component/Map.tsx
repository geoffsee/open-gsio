import ReactMap from 'react-map-gl/mapbox'; // ↔ v5+ uses this import path
import 'mapbox-gl/dist/mapbox-gl.css';
import { Box, HStack, Button, Input, Center } from '@chakra-ui/react';
import { useState, useEffect, useCallback } from 'react';

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
  const [mapboxToken, setMapboxToken] = useState(atob(key));
  const [isTokenLoading, setIsTokenLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setAuthenticated(true);
    setIsTokenLoading(false);
  }, []);

  const [mapView, setMapView] = useState({
    longitude: -122.4,
    latitude: 37.8,
    zoom: 14,
  });

  const handleNavigationClick = useCallback(async () => {
    console.log('handling navigation in map');
  }, []);

  const handleSearchClick = useCallback(async () => {
    console.log('handling click search in map');
  }, []);

  const handleMapViewChange = useCallback(async (evt: any) => {
    const { longitude, latitude, zoom } = evt.viewState;
    setMapView({ longitude, latitude, zoom });
  }, []);

  return (
    <Box
      p={4}
      height="80%"
      width="100%"
      position="relative"
      display={props.visible ? undefined : 'none'}
    >
      <Box width={'100%'} height={'100%'} position="relative" zIndex={0}>
        {/* Map itself */}
        {authenticated && (
          <ReactMap
            mapboxAccessToken={mapboxToken}
            initialViewState={mapView}
            onMove={handleMapViewChange}
            mapStyle="mapbox://styles/mapbox/dark-v11"
            attributionControl={false}
            style={{ width: '100%', height: '100%' }} // let the wrapper dictate size
          />
        )}
      </Box>
      {/* Button bar — absolutely positioned inside the wrapper */}
      <HStack position="relative" top={1} right={4} zIndex={1} justify={'right'}>
        <Button size="sm" variant="solid" onClick={handleNavigationClick}>
          Navigation
        </Button>
        <Button size="sm" variant="solid" onClick={handleSearchClick}>
          Search
        </Button>
      </HStack>
    </Box>
  );
}

export default Map;
