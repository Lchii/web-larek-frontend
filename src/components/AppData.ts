import {
	IModel,
	IOrder,
	IProduct,
	TBasketCard,
	TOrderData,
	FormErrors,
} from '../types';
import { Model } from './base/Model';

export type CatalogChangeEvent = {
	catalog: Product[];
};

export class Product extends Model<IProduct> {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
}

export class Order extends Model<IOrder> {
	payment: 'card' | 'cash';
	email: string;
	phone: string;
	address: string;
	total: number;
	items: string[];
}

export class AppState extends Model<IModel> {
	catalog: IProduct[];
	preview: string;
	basket: Map<string, number> = new Map();
	order: IOrder = new Order(
		{ payment: 'card', address: '', email: '', phone: '' },
		this.events
	);
	orderFormErrors: FormErrors = {};
	contactsFormErrors: FormErrors = {};

	setCatalog(items: IProduct[]): void {
		this.catalog = items.map((item) => new Product(item, this.events));
		this.emitChanges('items:changed', { catalog: this.catalog });
	}

	setPreview(item: Product): void {
		this.preview = item.id;
		this.emitChanges('preview:changed', item);
	}

	private addProductToBasket(id: string, price: number | null): void {
		this.basket.set(id, price ?? 0);
	}

	private removeProductFromBasket(id: string): void {
		this.basket.delete(id);
	}

	toggleProductState(id: string, price: number | null): void {
		if (!this.isProductInBasket(id)) {
			this.addProductToBasket(id, price);
		} else {
			this.removeProductFromBasket(id);
		}
		this.emitChanges('basket:changed');
	}

	isProductInBasket(id: string): boolean {
		return this.basket.has(id);
	}

	getBasketCounter(): number {
		return this.basket.size;
	}

	getBasketItems(): TBasketCard[] {
		return this.catalog
			.filter((item) => this.isProductInBasket(item.id))
			.map((item) => {
				return {
					id: item.id,
					title: item.title,
					price: item.price,
				};
			});
	}

	getTotal(): number {
		return Array.from(this.basket.values()).reduce(
			(acc, curr) => acc + curr,
			0
		);
	}

	clearBasket(): void {
		this.basket.clear();
		this.emitChanges('basket:changed');
	}

	setOrderItems(): void {
		this.order.items = Array.from(this.basket.keys());
	}

	setOrderTotal(): void {
		this.order.total = this.getTotal();
	}

	setOrderField(field: keyof TOrderData, value: string): void {
		this.order[field] = value;
		if (this.validateOrder() && this.validateContacts()) {
			this.events.emit('order:ready', this.order);
		}
	}

	validateOrder(): boolean {
		const errors: typeof this.orderFormErrors = {};
		if (!this.order.address) {
			errors.address = 'Необходимо указать адрес';
		}
		this.orderFormErrors = errors;
		this.events.emit('orderFormErrors:changed', this.orderFormErrors);
		return Object.keys(errors).length === 0;
	}

	validateContacts(): boolean {
		const errors: typeof this.contactsFormErrors = {};
		if (!this.order.email || !this.order.phone) {
			errors.email = 'Необходимо заполнить все поля';
		}
		this.contactsFormErrors = errors;
		this.events.emit('contactsFormErrors:changed', this.contactsFormErrors);
		return Object.keys(errors).length === 0;
	}
}
