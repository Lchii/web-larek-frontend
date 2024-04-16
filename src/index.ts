import './scss/styles.scss';
import { TOrderData } from './types';
import { API_URL, CDN_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';
import { EventEmitter } from './components/base/events';
import { AppApi } from './components/AppApi';
import { AppState, CatalogChangeEvent, Product } from './components/AppData';
import { Page } from './components/Page';
import { BasketItem, CatalogItem, PreviewItem } from './components/Card';
import { Order, Contacts } from './components/Order';
import { Modal } from './components/common/Modal';
import { Basket } from './components/common/Basket';
import { Success } from './components/common/Success';

const events = new EventEmitter();
const api = new AppApi(CDN_URL, API_URL);

const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

const model = new AppState({}, events);

const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

const basket = new Basket(cloneTemplate(basketTemplate), events);

const order = new Order(cloneTemplate(orderTemplate), events, {
  onCardClick: () => {
    model.order.payment = 'card';
    order.switchPayment();
  },
  onCashClick: () => {
    model.order.payment = 'cash';
    order.switchPayment();
  },
});
const contacts = new Contacts(cloneTemplate(contactsTemplate), events);

events.on<CatalogChangeEvent>('items:changed', () => {
  page.catalog = model.catalog.map((item) => {
    const card = new CatalogItem(cloneTemplate(cardCatalogTemplate), {
      onClick: () => events.emit('card:select', item),
    });
    return card.render({
      title: item.title,
      image: item.image,
      category: item.category,
      price: item.price,
    });
  });

  page.counter = model.getBasketCounter();
});

events.on('basket:changed', () => {
  page.counter = model.getBasketCounter();
  basket.setDisabled(basket.button, model.getBasketCounter() === 0);
});

events.on('basket:open', () => {
  let basketCounter = 0;
  basket.setDisabled(basket.button, model.getBasketCounter() === 0);
  basket.items = model.getBasketItems().map((item) => {
    const card = new BasketItem(cloneTemplate(cardBasketTemplate), {
      onClick: () => {
        model.toggleProductState(item.id, item.price);
        events.emit('basket:open');
      },
    });
    basketCounter++;
    card.setIndex(basketCounter);
    return card.render({
      title: item.title,
      price: item.price,
    });
  });
  modal.render({
    content: basket.render({
      total: model.getTotal(),
    }),
  });
});

events.on('card:select', (item: Product) => {
  model.setPreview(item);
});

events.on('preview:changed', (item: Product) => {
  const showItem = (item: Product) => {
    const card = new PreviewItem(cloneTemplate(cardPreviewTemplate), {
      onClick: () => {
        model.toggleProductState(item.id, item.price);
        card.toggleButtonText();
        modal.render({ content: card.render() });
      },
    });
    if (model.isProductInBasket(item.id)) {
      card.toggleButtonText();
    }
    modal.render({
      content: card.render({
        title: item.title,
        category: item.category,
        image: item.image,
        description: item.description,
        price: item.price,
      }),
    });
  };

  if (item) {
    api
      .getProductItem(item.id)
      .then((result) => {
        item.description = result.description;
        showItem(item);
      })
      .catch((err) => {
        console.error(err);
      });
  } else {
    modal.close();
  }
});

events.on('order:open', () => {
  model.setOrderItems();
  model.setOrderTotal();
  modal.render({
    content: order.render({
      address: '',
      valid: false,
      errors: [],
    }),
  });
});

events.on(
  /^order\..*:change/,
  (data: { field: keyof TOrderData; value: string }) => {
    model.setOrderField(data.field, data.value);
  }
);

events.on(
  /^contacts\..*:change/,
  (data: { field: keyof TOrderData; value: string }) => {
    model.setOrderField(data.field, data.value);
  }
);

events.on('orderFormErrors:changed', (errors: Partial<TOrderData>) => {
  const { address } = errors;
  order.valid = !address;
  order.errors = Object.values({ address })
    .filter((i) => !!i)
    .join('; ');
});

events.on('contactsFormErrors:changed', (errors: Partial<TOrderData>) => {
  const { email, phone } = errors;
  contacts.valid = !email && !phone;
  contacts.errors = Object.values({ email, phone })
    .filter((i) => !!i)
    .join('; ');
});

events.on('order:submit', () => {
  modal.render({
    content: contacts.render({
      email: '',
      phone: '',
      valid: false,
      errors: [],
    }),
  });
});

events.on('contacts:submit', () => {
  api
    .postOrder(model.order)
    .then((result) => {
      model.clearBasket();
      const success = new Success(cloneTemplate(successTemplate), {
        onClick: () => {
          modal.close();
        },
      });

      modal.render({
        content: success.render({
          total: result.total,
        }),
      });
    })
    .catch((err) => {
      console.error(err);
    });
});

events.on('modal:open', () => {
  page.locked = true;
});

events.on('modal:close', () => {
  page.locked = false;
});

api
  .getProductsList()
  .then(model.setCatalog.bind(model))
  .catch((err) => {
    console.error(err);
  });
