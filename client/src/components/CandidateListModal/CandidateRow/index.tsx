import { CandidateRowBox, ImageBox, ThumbnailImage } from './styles';

interface CandidateType {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  like: number;
  rating?: number;
  thumbnailImage?: string;
}

interface PropsType {
  candidateRestaurant: CandidateType;
}

export function CandidateRow({ candidateRestaurant }: PropsType) {
  const { id, name, category, lat, lng, like, rating, thumbnailImage } = candidateRestaurant;
  return (
    <CandidateRowBox>
      <ImageBox>
        <ThumbnailImage style={{ backgroundImage: `url(${thumbnailImage})` }} />
      </ImageBox>
    </CandidateRowBox>
  );
}
