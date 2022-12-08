import { useState } from 'react';
import Modal from '@components/Modal';
import { CATEGORY_TYPE } from '@constants/category';
import { useSelectedCategoryStore } from '@store/index';
import * as palette from '@styles/Variables';
import {
  RestaurantCategoryControlBarBox,
  RestaurantCategoryBox,
  RestaurantCategoryLayout,
} from './styles';

function RestaurantCategory() {
  const [isCategoryOpen, setCategoryOpen] = useState<boolean>(false);

  const { selectedCategoryData, updateSelectedCategoryData } = useSelectedCategoryStore(
    (state) => state
  );

  const handleToggleCategory = (categoryName: CATEGORY_TYPE | null): ((event: Event) => void) => {
    return () => {
      // '전체'가 선택된 경우
      if (!categoryName) {
        updateSelectedCategoryData(new Set());
        return;
      }

      // '카테고리'가 선택된 경우
      const newSelectedCategoryData = new Set(selectedCategoryData);

      if (selectedCategoryData.has(categoryName)) {
        newSelectedCategoryData.delete(categoryName);
      } else {
        newSelectedCategoryData.add(categoryName);
      }

      // '카테고리'가 전부 선택된 경우
      if (newSelectedCategoryData.size === Object.keys(CATEGORY_TYPE).length) {
        updateSelectedCategoryData(new Set());
        return;
      }

      updateSelectedCategoryData(newSelectedCategoryData);
    };
  };

  return (
    <RestaurantCategoryLayout>
      <RestaurantCategoryControlBarBox>
        <p>
          {!selectedCategoryData.size
            ? '먹고싶은 음식을 선택해주세요!'
            : [...selectedCategoryData].reduce((acc, categoryName, index, arr) => {
                let ret = '';
                if (index === arr.length - 1) {
                  ret = acc.concat(`${categoryName}`);
                } else {
                  ret = acc.concat(`${categoryName}, `);
                }
                return ret;
              }, '')}
        </p>
        <button
          type="button"
          onClick={(event) => {
            setCategoryOpen(!isCategoryOpen);

            event.stopPropagation();
          }}
        >
          열림/닫힘
        </button>
      </RestaurantCategoryControlBarBox>

      <Modal isOpen={isCategoryOpen} setIsOpen={setCategoryOpen}>
        <RestaurantCategoryBox>
          <button
            type="button"
            onClick={handleToggleCategory(null)}
            style={{ backgroundColor: !selectedCategoryData.size ? palette.PRIMARY : 'white' }}
          >
            전체
          </button>
          {Object.values(CATEGORY_TYPE).map((categoryName) => {
            return (
              <button
                type="button"
                onClick={handleToggleCategory(categoryName)}
                style={{
                  backgroundColor: selectedCategoryData.has(categoryName)
                    ? palette.PRIMARY
                    : 'white',
                }}
              >
                {categoryName}
              </button>
            );
          })}
        </RestaurantCategoryBox>
      </Modal>
    </RestaurantCategoryLayout>
  );
}

export default RestaurantCategory;
