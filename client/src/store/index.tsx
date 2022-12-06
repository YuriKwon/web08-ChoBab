import create from 'zustand';
import { RESTAURANT_LIST_TYPES, RESTAURANT_DETAIL_TYPES } from '@constants/modal';
import { NAVER_LAT, NAVER_LNG } from '@constants/map';

interface MeetLocationStoreType {
  meetLocation: { lat: number; lng: number };
  updateMeetLocation: (lat: number, lng: number) => void;
}

export const useMeetLocationStore = create<MeetLocationStoreType>((set) => ({
  meetLocation: { lat: NAVER_LAT, lng: NAVER_LNG },
  updateMeetLocation: (lat, lng) => set(() => ({ meetLocation: { lat, lng } })),
}));

// 식당 목록 레이어(RestaurantListLayer)의 화면 상태를 관리하는 전역 저장소
interface RestaurantListLayerStatusStore {
  restaurantListLayerStatus: RESTAURANT_LIST_TYPES;
  updateRestaurantListLayerStatus: (restaurantListType: RESTAURANT_LIST_TYPES) => void;
}

export const useRestaurantListLayerStatusStore = create<RestaurantListLayerStatusStore>((set) => ({
  restaurantListLayerStatus: RESTAURANT_LIST_TYPES.hidden,
  updateRestaurantListLayerStatus: (restaurantListType: RESTAURANT_LIST_TYPES) =>
    set(() => ({ restaurantListLayerStatus: restaurantListType })),
}));

// 식당 상세정보 레이어(RestaurantDetailLayer)의 화면 상태를 관리하는 전역 저장소
interface RestaurantDetailLayerStatusStore {
  restaurantDetailLayerStatus: RESTAURANT_DETAIL_TYPES;
  updateRestaurantDetailLayerStatus: (restaurantDetailType: RESTAURANT_DETAIL_TYPES) => void;
}

export const useRestaurantDetailLayerStatusStore = create<RestaurantDetailLayerStatusStore>(
  (set) => ({
    restaurantDetailLayerStatus: RESTAURANT_DETAIL_TYPES.hidden,
    updateRestaurantDetailLayerStatus: (restaurantDetailType: RESTAURANT_DETAIL_TYPES) =>
      set(() => ({ restaurantDetailLayerStatus: restaurantDetailType })),
  })
);

interface ToastStoreType {
  isOpen: boolean;
  content: string;
  bottom: number; // 아래에서 몇 px 띄울건지 지정
  duration: number;
  updateIsOpen: (isOpen: boolean) => void;
  updateToast: (content: string, bottom?: number, duration?: number) => void;
}

export const useToastStore = create<ToastStoreType>((set) => ({
  isOpen: false,
  content: '',
  bottom: 100,
  duration: 2000,
  updateIsOpen: (isOpen) => set(() => ({ isOpen })),
  updateToast: (content, bottom, duration) => set(() => ({ content, bottom, duration })),
}));
