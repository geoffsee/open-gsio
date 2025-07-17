import { Box } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Map, {
  FullscreenControl,
  GeolocateControl,
  Marker,
  NavigationControl,
  Popup,
  ScaleControl,
  Source,
} from 'react-map-gl/mapbox';

import clientChatStore from '../../stores/ClientChatStore';

import PORTS from './nautical-base-data.json';
import Pin from './pin';

function MapNextComponent(props: any = { mapboxPublicKey: '', visible: true } as any) {
  const [popupInfo, setPopupInfo] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isTokenLoading, setIsTokenLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    setAuthenticated(true);
    setIsTokenLoading(false);
  }, []);

  // Handle map resize when component becomes visible
  useEffect(() => {
    if (props.visible && mapRef.current) {
      // Small delay to ensure the container is fully visible
      const timer = setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.resize();
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [props.visible]);

  const handleNavigationClick = useCallback(async () => {
    console.log('handling navigation in map');
  }, []);

  const handleSearchClick = useCallback(async () => {
    console.log('handling click search in map');
  }, []);

  const handleMapViewChange = useCallback(async (evt: any) => {
    const { longitude, latitude, zoom } = evt.viewState;
    clientChatStore.setMapView(longitude, latitude, zoom);
    // setMapView({ longitude, latitude, zoom });

    // Update the store with the new view state
  }, []);

  const pins = useMemo(
    () =>
      PORTS.map((city, index) => (
        <Marker
          key={`marker-${index}`}
          longitude={city.longitude}
          latitude={city.latitude}
          anchor="bottom"
          onClick={e => {
            // If we let the click event propagates to the map, it will immediately close the popup
            // with `closeOnClick: true`
            e.originalEvent.stopPropagation();
            /*
            src/MapNext.tsx:34:38 - error TS2345: Argument of type '{ city: string; population: string; image: string; state: string; latitude: number; longitude: number; }' is not assignable to parameter of type 'SetStateAction<null>'.
Type '{ city: string; population: string; image: string; state: string; latitude: number; longitude: number; }' provides no match for the signature '(prevState: null): null'.
             */
            // @ts-ignore
            setPopupInfo(city);
          }}
        >
          <Pin />
        </Marker>
      )),
    [],
  );

  return (
    <Box justifySelf={'right'} w={'100%'}>
      {/*<HStack position="absolute" top={4} right={4} zIndex={1}>*/}
      {/*  <Box display="flex" alignItems="center">*/}
      {/*    <Button colorScheme="teal" size="sm" variant="solid" onClick={handleSearchClick} mr={2}>*/}
      {/*      Search*/}
      {/*    </Button>*/}
      {/*    {isSearchOpen && (*/}
      {/*      <Box*/}
      {/*        w="200px"*/}
      {/*        transition="all 0.3s"*/}
      {/*        transform={`translateX(${isSearchOpen ? '0' : '100%'})`}*/}
      {/*        opacity={isSearchOpen ? 1 : 0}*/}
      {/*        color="white"*/}
      {/*      >*/}
      {/*        <Input*/}
      {/*          placeholder="Search..."*/}
      {/*          size="sm"*/}
      {/*          _placeholder={{*/}
      {/*            color: '#d1cfcf',*/}
      {/*          }}*/}
      {/*        />*/}
      {/*      </Box>*/}
      {/*    )}*/}
      {/*  </Box>*/}
      {/*  <Button colorScheme="blue" size="sm" variant="solid" onClick={handleNavigationClick}>*/}
      {/*    Layer*/}
      {/*  </Button>*/}
      {/*</HStack>*/}
      <Map
        ref={mapRef}
        initialViewState={{
          latitude: clientChatStore.mapState.latitude,
          longitude: clientChatStore.mapState.longitude,
          zoom: clientChatStore.mapState.zoom,
          bearing: clientChatStore.mapState.bearing,
          pitch: clientChatStore.mapState.pitch,
        }}
        onMove={handleMapViewChange}
        terrain={{ source: 'mapbox-dem', exaggeration: 1.5 }}
        maxPitch={85}
        mapStyle="mapbox://styles/geoffsee/cmd1qz39x01ga01qv5acea02y"
        attributionControl={false}
        mapboxAccessToken={props.mapboxPublicKey}
        style={{
          position: 'absolute',
          width: '100%',
          // height: '50%',
          bottom: 0,
          top: 0,
          left: 0,
          right: 0,
        }}
      >
        <Source
          id="mapbox-dem"
          type="raster-dem"
          url="mapbox://mapbox.mapbox-terrain-dem-v1"
          tileSize={512}
          maxzoom={14}
        />
        <GeolocateControl position="top-left" style={{ marginTop: '6rem' }} />
        <FullscreenControl position="top-left" />
        <NavigationControl position="top-left" />
        <ScaleControl position="top-left" />
        {pins}

        {popupInfo && (
          <Popup
            anchor="top"
            /*
            src/MapNext.tsx:66:53 - error TS2339: Property 'longitude' does not exist on type 'never'.

66                         longitude={Number(popupInfo.longitude)}
             */
            // @ts-ignore
            longitude={Number(popupInfo.longitude)}
            /*
            src/MapNext.tsx:67:52 - error TS2339: Property 'latitude' does not exist on type 'never'.

67                         latitude={Number(popupInfo.latitude)}
                                          ~~~~~~~~
             */
            // @ts-ignore
            latitude={Number(popupInfo.latitude)}
            onClose={() => setPopupInfo(null)}
          >
            <div style={{ color: 'black' }}>
              {/*src/MapNext.tsx:71:40 - error TS2339: Property 'city' does not exist on type 'never'.

71                             {popupInfo.city}, {popupInfo.state} |{' '}
                                          ~~~~*/}
              {/*@ts-ignore*/}
              {/*@ts-ignore*/}
              {popupInfo.city},{popupInfo.state}
              {/*@ts-ignore*/}
            </div>
            {/*@ts-ignore*/}
            <img width="100%" src={popupInfo.image} />
            <br />
            <a
              style={{ color: 'blue' }}
              target="_new"
              href={`http://en.wikipedia.org/w/index.php?title=Special:Search&search=${(popupInfo as any).city}, ${(popupInfo as any).state}`}
            >
              Wikipedia
            </a>
          </Popup>
        )}
      </Map>
    </Box>
  );
}

const MapNext = observer(MapNextComponent);
export default MapNext;
