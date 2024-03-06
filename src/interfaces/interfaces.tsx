import firebase from "firebase/compat/app";

export interface CategoryData {
    id: string;
    name: string;
    subcategories?: SubcategoryData[];
    products: Product[];
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

export interface DataItem {
    id: string;
    image: string;
    name: string;
    value: string;
    currency: string;
}

export interface PhotoData {
  id: string;
  url: string;
}

export interface ResolvedCategoryData extends CategoryData {
  subcategories: CategoryData[];
}


export interface Product {
  categoryID: string;
  color: string;
  discount: number;
  name: string;
  photo: firebase.firestore.DocumentReference;
  price: string;
  series: string;
  size: string;
}
  