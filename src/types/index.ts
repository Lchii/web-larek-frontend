export interface IProduct {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
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
	catalog: IProduct[];
	preview: string | null;
	basket: Map<string, number>;
	order: IOrder;
}

export type TBasketCard = Pick<IProduct, 'id' | 'title' | 'price'>;

export type TOrderData = Pick<
	IOrder,
	'payment' | 'address' | 'email' | 'phone'
>;

export type FormErrors = Partial<Record<keyof IOrder, string>>;

export interface IOrderResult {
	id: string;
	total: number;
}
