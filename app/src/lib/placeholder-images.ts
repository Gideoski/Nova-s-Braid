
import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

// The data is already an object with a placeholderImages property.
export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;
