import { useEffect, useRef, useState } from 'react';

import riceImageSrc from '@assets/images/rice.svg';
import sushiImageSrc from '@assets/images/sushi.svg';
import dumplingImageSrc from '@assets/images/dumpling.svg';
import spaghettiImageSrc from '@assets/images/spaghetti.svg';
import chickenImageSrc from '@assets/images/chicken.svg';
import hamburgerImageSrc from '@assets/images/hamburger.svg';
import hotdogImageSrc from '@assets/images/hotdog.svg';
import userImageSrc from '@assets/images/user.svg';
import { ReactComponent as LoadingSpinner } from '@assets/images/loading-spinner.svg';

import { useSelectedCategoryStore } from '@store/index';

import { CATEGORY_TYPE } from '@constants/category';

import stc from 'string-to-color';

import { useNaverMaps } from '@hooks/useNaverMaps';

import classes from '@styles/marker.module.css';

import '@utils/MarkerClustering.js';

import { MapLayout, MapLoadingBox, MapBox } from './styles';

interface RestaurantType {
  id: string;
  name: string;
  category: string;
  phone: string;
  lat: number;
  lng: number;
  address: string;
}

interface RoomLocationType {
  lat: number;
  lng: number;
}

interface PropsType {
  restaurantData: RestaurantType[];
  roomLocation: RoomLocationType;
  joinList: Map<string, UserType>;
}

const getIconUrlByCategory = (category: CATEGORY_TYPE) => {
  switch (category) {
    case CATEGORY_TYPE.일식:
      return sushiImageSrc;
    case CATEGORY_TYPE.중식:
      return dumplingImageSrc;
    case CATEGORY_TYPE.양식:
      return spaghettiImageSrc;
    case CATEGORY_TYPE.치킨:
      return chickenImageSrc;
    case CATEGORY_TYPE.패스트푸드:
      return hamburgerImageSrc;
    case CATEGORY_TYPE.분식:
      return hotdogImageSrc;
    case CATEGORY_TYPE.한식:
    default:
      return riceImageSrc;
  }
};

type userIdType = string;

function MainMap({ restaurantData, roomLocation, joinList }: PropsType) {
  const [loading, setLoading] = useState<boolean>(false);

  const [mapRef, mapDivRef] = useNaverMaps();

  const joinListMarkersRef = useRef<Map<userIdType, naver.maps.Marker>>(new Map());
  const joinListInfoWindowsRef = useRef<Map<userIdType, naver.maps.InfoWindow>>(new Map());

  const infoWindowsRef = useRef<naver.maps.InfoWindow[]>([]);

  const markerClusteringObjectsRef = useRef<Map<CATEGORY_TYPE, MarkerClustering>>(new Map());

  const { selectedCategoryData } = useSelectedCategoryStore((state) => state);

  const closeAllRestaurantMarkerInfoWindow = () => {
    infoWindowsRef.current.forEach((infoWindow) => {
      infoWindow.close();
    });
  };

  const updateExitUserMarker = () => {
    joinListMarkersRef.current.forEach((marker, userId, thisMap) => {
      if (joinList.has(userId)) {
        return;
      }

      marker.setMap(null);

      thisMap.delete(userId);
    });
  };

  const updateExitUserInfoWindow = () => {
    joinListInfoWindowsRef.current.forEach((infoWindow, userId, thisMap) => {
      if (joinList.has(userId)) {
        return;
      }

      infoWindow.setMap(null);

      thisMap.delete(userId);
    });
  };

  const updateJoinUserMarkerAndInfoWindow = () => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    joinList.forEach((user, userId) => {
      const { userLat, userLng, userName } = user;

      if (joinListMarkersRef.current.has(userId)) {
        return;
      }

      const marker = new naver.maps.Marker({
        map,
        position: new naver.maps.LatLng(userLat, userLng),
        title: userName,
        icon: {
          content: `
            <div class="${classes.userMarker}" style="background:${stc(userId)}">
              <img src="${userImageSrc}">
            </div>
          `,
        },
      });

      joinListMarkersRef.current.set(userId, marker);

      const infoWindow = new naver.maps.InfoWindow({
        content: `
          <div class="${classes.infoWindowBox}">
            <p class="${classes.infoWindowParagraph}">${userName}</p>
          </div>
        `,
        disableAnchor: true,
        borderWidth: 0,
        backgroundColor: 'transparent',
        borderColor: 'transparent',
      });

      joinListInfoWindowsRef.current.set(userId, infoWindow);

      naver.maps.Event.addListener(marker, 'click', () => {
        infoWindow.open(map, marker);
      });
    });
  };

  const getRestaurantDividedByCategory = (): Map<CATEGORY_TYPE, RestaurantType[]> => {
    const restaurantListDividedByCategory: Map<CATEGORY_TYPE, RestaurantType[]> = new Map();

    // 카테고리로 분류
    restaurantData.forEach((restaurant) => {
      const { category } = restaurant as { category: CATEGORY_TYPE };

      if (!selectedCategoryData.has(category) && selectedCategoryData.size) {
        return;
      }

      if (!restaurantListDividedByCategory.has(category)) {
        restaurantListDividedByCategory.set(category, []);
      }

      restaurantListDividedByCategory.get(category)?.push(restaurant);
    });

    return restaurantListDividedByCategory;
  };

  const createMarkerClusteringObjects = (map: naver.maps.Map) => {
    Object.values(CATEGORY_TYPE).forEach((categoryName) => {
      const iconUrl = getIconUrlByCategory(categoryName);

      const markerClustering = new MarkerClustering({
        map,
        maxZoom: 18,
        gridSize: 200,
        disableClickZoom: false,
        icons: [
          {
            content: `
              <div class="${classes.clusterMarkerLayout}">
                <div name="counter" class="${classes.clusterMarkerCountBox}">0</div>
                <img src=${iconUrl} width="30" height="30" />
              </div>
            `,
          },
        ],
        indexGenerator: [0],
        // @types/navermaps 에 Marker 클래스 타입에 getElement 메서드가 정의되어 있질 않다.
        stylingFunction: (clusterMarker: any, count) => {
          const markerDom = clusterMarker.getElement() as HTMLElement;

          const counterDOM = markerDom.querySelector('div[name="counter"]');

          if (!(counterDOM instanceof HTMLElement)) {
            return;
          }

          counterDOM.innerText = `${count}`;
        },
      });

      markerClusteringObjectsRef.current.set(categoryName, markerClustering);
    });
  };

  const updateMarkerClusteringObjects = (
    restaurantListDividedByCategory: Map<CATEGORY_TYPE, RestaurantType[]>
  ) => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    markerClusteringObjectsRef.current.forEach((markerClustering, categoryName) => {
      const markers: naver.maps.Marker[] = [];

      const iconUrl = getIconUrlByCategory(categoryName);

      restaurantListDividedByCategory.get(categoryName)?.forEach((restaurant) => {
        const { name, lat, lng } = restaurant;

        // (map 에 반영시키지 않는)마커 객체 생성
        const marker = new naver.maps.Marker({
          title: name,
          position: new naver.maps.LatLng(lat, lng),
          icon: {
            content: `
              <img
                class="${classes.restaurantMarker}"
                src=${iconUrl}
                alt=${name}
              />
            `,
          },
        });

        markers.push(marker);

        // 인포윈도우 객체 생성
        const infoWindow = new naver.maps.InfoWindow({
          content: `
            <div class="${classes.infoWindowBox}">
              <p class="${classes.infoWindowParagraph}">${name}</p>
            </div>
          `,
          disableAnchor: true,
          borderWidth: 0,
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        });

        infoWindowsRef.current.push(infoWindow);

        // 마커 클릭 이벤트 등록
        naver.maps.Event.addListener(marker, 'click', () => {
          infoWindow.open(map, marker);
        });
      });

      markerClustering.setMarkers(markers);
    });

    // 갱신을 위해 map 좌표를 제자리로 이동
    map.setCenter(map.getBounds().getCenter());
  };

  const onInit = (map: naver.maps.Map): naver.maps.MapEventListener => {
    const onInitListener = naver.maps.Event.addListener(map, 'init', () => {
      if (!map) {
        return;
      }

      createMarkerClusteringObjects(map);
      const restaurantListDividedByCategory = getRestaurantDividedByCategory();
      updateMarkerClusteringObjects(restaurantListDividedByCategory);
    });
    return onInitListener;
  };

  const onDragend = (map: naver.maps.Map): naver.maps.MapEventListener => {
    const onDragendListener = naver.maps.Event.addListener(map, 'dragend', () => {
      if (!map) {
        return;
      }

      closeAllRestaurantMarkerInfoWindow();
    });
    return onDragendListener;
  };

  const onClick = (map: naver.maps.Map): naver.maps.MapEventListener => {
    const onClickListener = naver.maps.Event.addListener(map, 'click', () => {
      if (!map) {
        return;
      }

      closeAllRestaurantMarkerInfoWindow();
    });

    return onClickListener;
  };

  const onZooming = (map: naver.maps.Map): naver.maps.MapEventListener => {
    const onZoomingListener = naver.maps.Event.addListener(mapRef.current, 'zooming', () => {
      if (!map) {
        return;
      }

      setLoading(true);
    });

    return onZoomingListener;
  };

  const onZoomChanged = (map: naver.maps.Map): naver.maps.MapEventListener => {
    const onZoomChangedListener = naver.maps.Event.addListener(
      mapRef.current,
      'zoom_changed',
      () => {
        if (!map) {
          return;
        }

        setLoading(false);
      }
    );

    return onZoomChangedListener;
  };

  useEffect(() => {
    const restaurantListDividedByCategory = getRestaurantDividedByCategory();
    updateMarkerClusteringObjects(restaurantListDividedByCategory);
  }, [selectedCategoryData]);

  useEffect(() => {
    updateExitUserMarker();
    updateExitUserInfoWindow();
    updateJoinUserMarkerAndInfoWindow();
  }, [joinList]);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    const initListener = onInit(mapRef.current);
    const clickListener = onClick(mapRef.current);
    const dragendListener = onDragend(mapRef.current);
    const zoomingListener = onZooming(mapRef.current);
    const zoomChangedListener = onZoomChanged(mapRef.current);

    // eslint-disable-next-line consistent-return
    return () => {
      naver.maps.Event.removeListener(initListener);
      naver.maps.Event.removeListener(clickListener);
      naver.maps.Event.removeListener(dragendListener);
      naver.maps.Event.removeListener(zoomingListener);
      naver.maps.Event.removeListener(zoomChangedListener);
    };
  }, []);

  // 모임 위치(props) 변경 시 지도 화면 이동
  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    mapRef.current.setCenter({ x: roomLocation.lng, y: roomLocation.lat });
  }, [roomLocation]);

  return (
    <MapLayout>
      {loading && (
        <MapLoadingBox>
          <LoadingSpinner />
        </MapLoadingBox>
      )}
      <MapBox ref={mapDivRef} />
    </MapLayout>
  );
}

export default MainMap;
