
export type Language = "en" | "de";

export type TranslationKey =
  | "nav_menu"
  | "nav_cart"
  | "hero_title"
  | "hero_subtitle"
  | "hero_cta"
  | "section_menu"
  | "add_to_cart"
  | "footer_imprint"
  | "footer_agb"
  | "footer_copyright"
  | "cart_title"
  | "cart_empty"
  | "cart_total"
  | "cart_checkout"
  | "cart_close"
  | "cart_remove"
  | "cart_name_placeholder"
  | "cart_name_alert"
  | "cart_order_success"
  | "cart_order_fail"
  | "cart_remove_all"
  | "cart_error";

export const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    nav_menu: "Menu",
    nav_cart: "Cart",
    hero_title: "TakeOff Restaurant",
    hero_subtitle: "Pizza-Service, thailändische, italienische und indische Spezialitäten.",
    hero_cta: "View Menu",
    section_menu: "Our Menu",
    add_to_cart: "Add to Cart",
    footer_imprint: "Imprint",
    footer_agb: "Terms of Service (AGB)",
    footer_copyright: "Slice & Savor. All rights reserved.",
    cart_title: "Your Cart",
    cart_empty: "Your cart is empty.",
    cart_total: "Total",
    cart_checkout: "Place Order",
    cart_close: "Close",
    cart_remove: "Remove 1",
    cart_remove_all: "Remove all",
    cart_name_placeholder: "Your Name",
    cart_name_alert: "Please enter your name.",
    cart_order_success: "Order placed successfully! Enjoy your meal, ",
    cart_order_fail: "Failed to place order.",
    cart_error: "Something went wrong.",
  },
  de: {
    nav_menu: "Speisekarte",
    nav_cart: "Warenkorb",
    hero_title: "TakeOff Restaurant",
    hero_subtitle: "Pizza-Service, thailändische, italienische und indische Spezialitäten.",
    hero_cta: "Speisekarte ansehen",
    section_menu: "Unsere Speisekarte",
    add_to_cart: "In den Warenkorb",
    footer_imprint: "Impressum",
    footer_agb: "AGB",
    footer_copyright: "Slice & Savor. Alle Rechte vorbehalten.",
    cart_title: "Dein Warenkorb",
    cart_empty: "Dein Warenkorb ist leer.",
    cart_total: "Gesamt",
    cart_checkout: "Bestellen",
    cart_close: "Schließen",
    cart_remove: "1 Entfernen",
    cart_remove_all: "Ganz entfernen",
    cart_name_placeholder: "Dein Name",
    cart_name_alert: "Bitte gib deinen Namen ein.",
    cart_order_success: "Bestellung erfolgreich! Guten Appetit, ",
    cart_order_fail: "Bestellung fehlgeschlagen.",
    cart_error: "Etwas ist schief gelaufen.",
  },
};
