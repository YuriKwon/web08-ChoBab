import { useCallback, useEffect, useRef } from 'react';
import { MapBox } from '@components/MainMap/styles';
import axios from 'axios';
import { DrivingInfoMapLayout } from './styles';

interface PositionType {
  lat: number;
  lng: number;
}

interface PropsType {
  userPos: PositionType;
  restaurantPos: PositionType;
}

interface ResTemplateType<T> {
  message: string;
  data: T;
}

interface DrivingInfoType {
  start: number[];
  goal: number[];
  distance: number;
  duration: number;
  tollFare: number;
  taxiFare: number;
  fuelPrice: number;
  path: number[][];
}

function DrivingInfoMap({ userPos, restaurantPos }: PropsType) {
  const mapRef = useRef<HTMLDivElement>(null);

  // 길찾기 API 호출
  const getDrivingInfo = async (
    startPos: PositionType,
    goalPos: PositionType
  ): Promise<DrivingInfoType> => {
    const { lat: startLat, lng: startLng } = startPos;
    const { lat: goalLat, lng: goalLng } = goalPos;
    try {
      const {
        data: { data: drivingInfo },
      } = await axios.get<ResTemplateType<DrivingInfoType>>('/api/map/driving', {
        params: {
          start: `${startLng},${startLat}`,
          goal: `${goalLng},${goalLat}`,
        },
      });
      return drivingInfo;
    } catch (error: any) {
      console.log(error.response.data.message ?? '길찾기 정보를 불러오는데 실패했습니다.');
      return {} as DrivingInfoType;
    }
  };

  const mapSetting = useCallback(async () => {
    if (!mapRef.current) {
      return;
    }

    const map = new naver.maps.Map(mapRef.current, {
      center: new naver.maps.LatLng(userPos.lat, userPos.lng),
      zoom: 11,
    });

    // 출발지, 도착지 마커 생성
    const startMarker = new naver.maps.Marker({
      position: new naver.maps.LatLng(userPos.lat, userPos.lng),
    });
    const goalMarker = new naver.maps.Marker({
      position: new naver.maps.LatLng(restaurantPos.lat, restaurantPos.lng),
    });

    // 출발지, 도착지 마커 지도에 표시
    startMarker.setMap(map);
    goalMarker.setMap(map);

    // 길찾기 정보를 받아오는 함수 호출
    const drivingInfo = await getDrivingInfo(userPos, restaurantPos);
    if (!drivingInfo) {
      return;
    }

    // 경로를 표시할 좌표들 배열
    const drivingInfoPaths: naver.maps.LatLng[] = drivingInfo.path?.map(
      (pos: number[]) => new naver.maps.LatLng(pos[1], pos[0])
    );

    // 경로 그리기
    const polyline = new naver.maps.Polyline({
      map,
      path: drivingInfoPaths,
      strokeColor: 'blue', // 선 색
      strokeLineCap: 'round', // 라인의 끝 모양
      strokeWeight: 5, // 선 두께
    });

    // 지도 중심을 경로의 중심으로 설정
    map.setCenter(polyline.getBounds().getCenter());
  }, []);

  useEffect(() => {
    mapSetting().then();
  }, []);

  return (
    <DrivingInfoMapLayout>
      <MapBox ref={mapRef} />
    </DrivingInfoMapLayout>
  );
}

export default DrivingInfoMap;
