import { Component } from './base/Component';
import { IProduct } from '../types';
import { ensureElement, formatNumber } from '../utils/utils';

interface ICardActions {
  onClick: (event: MouseEvent) => void;
}

export class Card extends Component<IProduct> {
  protected _title: HTMLElement;
  protected _price: HTMLElement;
  protected _button: HTMLButtonElement;

  constructor(
    protected blockName: string,
    container: HTMLElement,
    actions?: ICardActions
  ) {
    super(container);

    this._title = ensureElement<HTMLElement>(`.${blockName}__title`, container);
    this._price = ensureElement<HTMLElement>(`.${blockName}__price`, container);
    this._button = container.querySelector(`.${blockName}__button`);

    if (actions?.onClick) {
      if (this._button) {
        this._button.addEventListener('click', actions.onClick);
      } else {
        container.addEventListener('click', actions.onClick);
      }
    }
  }

  set id(value: string) {
    this.container.dataset.id = value;
  }

  get id(): string {
    return this.container.dataset.id || '';
  }

  set title(value: string) {
    this.setText(this._title, value);
  }

  get title(): string {
    return this._title.textContent || '';
  }

  set price(value: number | null) {
    const priceValue =
      value === null ? 'Бесценно' : `${formatNumber(value)} синапсов`;
    this.setText(this._price, priceValue);
  }

  get price(): number {
    return Number(this._price.textContent);
  }

  get button(): HTMLButtonElement {
    return this._button;
  }
}

export class CatalogItem extends Card {
  protected _category: HTMLElement;
  protected _image: HTMLImageElement;

  protected categories: Map<string, string> = new Map([
    ['софт-скил', 'soft'],
    ['хард-скил', 'hard'],
    ['другое', 'other'],
    ['дополнительное', 'additional'],
    ['кнопка', 'button'],
  ]);

  constructor(container: HTMLElement, actions?: ICardActions) {
    super('card', container, actions);
    this._category = ensureElement<HTMLElement>(
      `.${this.blockName}__category`,
      container
    );
    this._image = ensureElement<HTMLImageElement>(
      `.${this.blockName}__image`,
      container
    );
  }

  set category(value: string) {
    this.setText(this._category, value);
    this.setClass(
      this._category,
      `${this.blockName}__category_${this.categories.get(value)}`
    );
  }

  get category(): string {
    return this._category.textContent;
  }

  set image(value: string) {
    this.setImage(this._image, value, this.title);
  }
}

export class PreviewItem extends CatalogItem {
  protected _description: HTMLElement;

  constructor(container: HTMLElement, actions?: ICardActions) {
    super(container, actions);
    this._description = ensureElement<HTMLElement>(
      `.${this.blockName}__text`,
      container
    );
  }

  set description(value: string) {
    this.setText(this._description, value);
  }

  toggleButtonText() {
    const currentText = this._button.textContent;
    this._button.textContent =
      currentText === 'В корзину' ? 'Удалить из корзины' : 'В корзину';
  }
}

export class BasketItem extends Card {
  protected _index: HTMLElement;

  constructor(container: HTMLElement, actions?: ICardActions) {
    super('card', container, actions);
    this._index = ensureElement<HTMLElement>('.basket__item-index', container);
  }

  setIndex(value: number) {
    this.setText(this._index, value);
  }
}
