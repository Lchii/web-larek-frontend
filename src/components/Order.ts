import { Form } from './common/Form';
import { IOrder } from '../types';
import { IEvents } from './base/events';

interface IOrderActions {
  onCardClick: (event: MouseEvent) => void;
  onCashClick: (event: MouseEvent) => void;
}

export class Order extends Form<IOrder> {
  protected _card: HTMLButtonElement;
  protected _cash: HTMLButtonElement;

  protected buttonActiveClass = 'button_alt-active';

  constructor(
    container: HTMLFormElement,
    events: IEvents,
    actions?: IOrderActions
  ) {
    super(container, events);
    this._card = this.container.elements.namedItem('card') as HTMLButtonElement;
    this._cash = this.container.elements.namedItem('cash') as HTMLButtonElement;
    this.setClass(this._card, this.buttonActiveClass);

    if (actions?.onCardClick) {
      if (this._card) {
        this._card.addEventListener('click', actions.onCardClick);
      }
    }

    if (actions?.onCashClick) {
      if (this._cash) {
        this._cash.addEventListener('click', actions.onCashClick);
      }
    }

    this.valid = false;
  }

  get card() {
    return this._card;
  }

  get cash() {
    return this._cash;
  }

  set address(value: string) {
    (this.container.elements.namedItem('address') as HTMLInputElement).value =
      value;
  }

  switchPayment(): void {
    this.toggleClass(this.cash, this.buttonActiveClass);
    this.toggleClass(this.card, this.buttonActiveClass);
  }
}

export class Contacts extends Form<IOrder> {
  constructor(container: HTMLFormElement, events: IEvents) {
    super(container, events);
  }

  set phone(value: string) {
    (this.container.elements.namedItem('phone') as HTMLInputElement).value =
      value;
  }

  set email(value: string) {
    (this.container.elements.namedItem('email') as HTMLInputElement).value =
      value;
  }
}
