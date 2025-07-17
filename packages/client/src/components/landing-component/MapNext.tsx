import { Box } from '@chakra-ui/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Map, {
  FullscreenControl,
  GeolocateControl,
  Marker,
  NavigationControl,
  Popup,
  ScaleControl,
} from 'react-map-gl/mapbox';

import PORTS from './nautical-base-data.json';
import Pin from './pin';

export default function MapNext(props: any = { mapboxPublicKey: '' } as any) {
  const [popupInfo, setPopupInfo] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
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
        initialViewState={{
          latitude: 40,
          longitude: -100,
          zoom: 3.5,
          bearing: 0,
          pitch: 0,
        }}
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
