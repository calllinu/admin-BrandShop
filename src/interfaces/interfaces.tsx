export interface CategoryData {
    id: string;
    name: string;
    subcategories?: SubcategoryData[];
    products: ProductInterface[];
}

export interface SubcategoryData {
  name: string;
  id: string
}

export interface Products {
  name: string;
  id: string;
  discount: number;
  series: string;
  photo: string;
  color: string;
  price: string;
  size: string;
  categoryID: string;
  description: string;
}

export interface ProductInterface {
  name: string;
  discount: string;
  series: string;
  color: string;
  size: string;
  price: string;
  categoryID: string;
  photo: File | null;
  description: string;
}
