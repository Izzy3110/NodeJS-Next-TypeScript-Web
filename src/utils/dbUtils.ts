import { Item } from '../types';

export const parseVal = (v: any) => {
    if (v === null || v === undefined) return 0;
    if (typeof v === 'number') return v;
    return parseFloat(String(v).replace(',', '.')) || 0;
};

export function mapItemRow(item: any): Item {
    return {
        id: item.id,
        cartid: item.cartid,
        category_id: item.category_id,
        name: item.name,
        description: item.description,
        price_type: item.price_type,
        price: parseVal(item.price),
        price_s: parseVal(item.price_s),
        price_m: parseVal(item.price_m),
        price_l: parseVal(item.price_l),
        price_xl: parseVal(item.price_xl),
        in_menu_1: item.in_menu_1,
        in_menu_2: item.in_menu_2,
        in_menu_3: item.in_menu_3,
        show_menu: item.show_menu,
        zutaten: item.zutaten,
        goods_item: item.goods_item
    };
}
