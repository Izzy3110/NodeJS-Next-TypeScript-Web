export interface Pizza {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
}

export interface OrderItem {
    itemId: number;
    name: string;
    quantity: number;
    price: number;
}

export interface Order {
    customerName: string;
    items: OrderItem[];
}

export interface Item {
    id: number;
    name: string;
    description: string | null;
    price: number;
    price_type?: number; // 1 = Single, 2 = Multi
    category_id: number;
    cartid?: string | null;
    goods_item?: number; // 0 or 1
    price_s?: number;
    price_m?: number;
    price_l?: number;
    price_xl?: number;
    in_menu_1?: number; // 0 or 1
    in_menu_2?: number; // 0 or 1
    in_menu_3?: number; // 0 or 1
    zutaten?: string | null;
    additional_text?: string | null;
    show_menu?: number; // 0 or 1
}

export interface Category {
    id: number;
    name: string;
    description: string | null;
    pic_url?: string | null;
    items?: Item[];
    order_id?: number;
    additional_text?: string | null;
}

export interface CustomerAddress {
    name: string;
    street: string;
    city: string;
    zipCode: string;
    country?: string;
}

export interface InvoiceItem {
    description: string;
    details?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface InvoiceData {
    invoiceNumber: string;
    date: Date;
    customer: CustomerAddress;
    items: InvoiceItem[];
    deliveryCosts: number;
    totalAmount: number;
    currency: string;
}

export interface Zutat {
    id: number;
    name: string;
    good_price: number;
}
