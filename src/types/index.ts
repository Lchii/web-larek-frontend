import { IEvents } from "../components/base/events";

export interface IProduct {
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number;
}

export interface IOrder {
  payment: string;
  email: string;
  phone: string;
  address: string;
  total: number;
  items: string[];
}

export interface IModel {
  totalProducts: number;
  gallery: IProduct[];
  productIdForPreview: string;
  basket: Map<string, number>;
  order: IOrder;
  setGallery(value: IProduct[]): void;
  getGallery(): IProduct[];
  setTotal(value: number): void;
  getTotal(): number;
  getProduct(productId: string): IProduct;
  addProductToBasket(productId: string): void;
  removeProductFromBasket(productId: string): void;
  setOrder(value: IOrder): void;
  getOrder(): IOrder;
}

export type TGalleryCard = Omit<IProduct, 'description'>;

export type TBasketCard = Pick<IProduct, 'id' | 'title' | 'price'>;

export type TOrderDeliveryData = Pick<IOrder, 'payment' | 'address'>;

export type TOrderClientData = Pick<IOrder, 'email' | 'phone'>;
