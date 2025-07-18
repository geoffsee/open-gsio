import 'mapbox-gl/dist/mapbox-gl.css';
import { Box, Button, HStack, Input } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';

import clientChatStore from '../../stores/ClientChatStore.ts';

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

export type Layer = { name: string; value: string };
export type Layers = Layer[];

// public key
const key =
  'cGsuZXlKMUlqb2laMlZ2Wm1aelpXVWlMQ0poSWpvaVkycDFOalo0YkdWNk1EUTRjRE41YjJnNFp6VjNNelp6YXlKOS56LUtzS1l0X3VGUGdCSDYwQUFBNFNn';

const layers = [
  { name: 'Bathymetry', value: 'mapbox://styles/geoffsee/cmd1qz39x01ga01qv5acea02y' },
  { name: 'Satellite', value: 'mapbox://styles/mapbox/satellite-v9' },
];

function LayerSelector(props: { onClick: (e) => Promise<void> }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Box position="relative">
      <Button colorScheme="blue" size="sm" variant="solid" onClick={() => setIsOpen(!isOpen)}>
        Layer
      </Button>

      {isOpen && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          w="200px"
          bg="background.secondary"
          boxShadow="md"
          zIndex={2}
        >
          {layers.map(layer => (
            <Box
              id={layer.value}
              p={2}
              cursor="pointer"
              _hover={{ bg: 'whiteAlpha.200' }}
              onClick={async e => {
                setIsOpen(false);
                await props.onClick(e);
              }}
            >
              {layer.name}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

function Map(props: { visible: boolean }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState(layers[0]);
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // const handleSearchClick = useCallback(async () => {
  //   console
  // }, []);
  //

  async function selectSearchResult({ lat, lon }) {
    // clientChatStore.mapState.latitude = searchResult.lat;
    // clientChatStore.mapState.longitude = searchResult.lon;
    await clientChatStore.setMapView(lon, lat, 15);
  }

  async function handleSc(e) {
    if (isSearchOpen && searchInput.length > 1) {
      try {
        console.log(`trying to geocode ${searchInput}`);
        const geocode = await fetch('https://geocode.geoffsee.com', {
          method: 'POST',
          mode: 'cors',
          body: JSON.stringify({
            location: searchInput,
          }),
        });
        const coordinates = await geocode.json();
        const { lat, lon } = coordinates;
        console.log(`got geocode coordinates: ${coordinates}`);
        setSearchResults([{ lat, lon }]);
      } catch (e) {
        // continue without
      }
    } else {
      setIsSearchOpen(!isSearchOpen);
    }
  }

  useEffect(() => {
    console.log(selectedLayer);
  }, [selectedLayer]);

  function handleLayerChange(e) {
    setSelectedLayer(layers.find(layer => layer.value === e.target.id));
  }

  return (
    /* Full-screen wrapper — fills the viewport and becomes the positioning context */
    <Box position={'absolute'} top={0} w="100%" h={'100vh'} overflow="hidden">
      {/* Button bar — absolutely positioned inside the wrapper */}

      <HStack position="relative" zIndex={1}>
        <Box display="flex" alignItems="center">
          <Button size="sm" variant="solid" onClick={handleSc} mr={2}>
            Search
          </Button>
          {isSearchOpen && (
            <Box
              w="200px"
              transition="all 0.3s"
              transform={`translateX(${isSearchOpen ? '0' : '100%'})`}
              background="background.secondary"
              opacity={isSearchOpen ? 1 : 0}
              color="white"
            >
              <Input
                placeholder="Search..."
                size="sm"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                color="white"
                bg="background.secondary"
                border="none"
                borderRadius="0"
                _focus={{
                  outline: 'none',
                }}
                _placeholder={{
                  color: '#d1cfcf',
                }}
              />
              {searchResults.length > 0 && (
                <Box
                  position="absolute"
                  top="100%"
                  left={0}
                  w="200px"
                  bg="background.secondary"
                  boxShadow="md"
                  zIndex={2}
                >
                  {searchResults.map((result, index) => (
                    <Box
                      key={index}
                      p={2}
                      cursor="pointer"
                      _hover={{ bg: 'whiteAlpha.200' }}
                      onClick={async () => {
                        // setSearchInput(result);
                        console.log(`selecting result ${result.lat}, ${result.lon}`);
                        await selectSearchResult(result);
                        setSearchResults([]);
                        setIsSearchOpen(false);
                      }}
                    >
                      {`${result.lat}, ${result.lon}`}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </Box>
        <LayerSelector onClick={handleLayerChange} />
      </HStack>
      <MapNext mapboxPublicKey={atob(key)} visible={props.visible} layer={selectedLayer} />
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
