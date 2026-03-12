
export type Language = "en" | "de";

export type TranslationKey =
  | "nav_home"
  | "nav_about"
  | "nav_location"
  | "nav_imprint"
  | "nav_agb"
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
  | "cart_error"
  | "cart_finalize_title"
  | "cart_summary_title"
  | "cart_email_label"
  | "cart_address_label"
  | "cart_confirm_label"
  | "cart_back"
  | "cart_order_now"
  | "cart_proceed"
  | "cart_finalize_alert"
  | "cart_confirm_alert"
  | "menu_search_placeholder"
  | "menu_no_results"
  | "section_map"
  | "hours_title"
  | "hours_mon"
  | "hours_tue"
  | "hours_wed_fri"
  | "hours_sat_sun"
  | "hours_closed"
  | "hours_open_now"
  | "hours_closed_now"
  | "admin_menu_add_item"
  | "admin_menu_menu"
  | "admin_menu_editor"
  | "admin_menu_categories"
  | "admin_menu_settings"
  | "admin_menu_backups"
  | "admin_menu_orders"
  | "admin_menu_design"
  | "design_settings_group_general"
  | "design_settings_group_text"
  | "design_settings_group_matrix"
  | "design_settings_group_items"
  | "design_settings_group_backgrounds"
  | "design_settings_primary_color"
  | "design_settings_secondary_color"
  | "design_settings_bg_dark"
  | "design_settings_text_light"
  | "design_settings_text_muted"
  | "design_settings_card_bg"
  | "design_settings_matrix_price_color"
  | "design_settings_matrix_name_color"
  | "design_settings_matrix_desc_color"
  | "design_settings_matrix_header_text_color"
  | "design_settings_matrix_btn_color"
  | "design_settings_matrix_btn_hover_color"
  | "design_settings_item_title_color"
  | "design_settings_item_price_color"
  | "design_settings_item_desc_color"
  | "general_refresh_btn"
  | "admin_dashboard"
  | "admin_menu_backup_restore"
  | "admin_orders_no_orders_found"
  | "admin_orders_headline"
  | "admin_orders_search_placeholder"
  | "admin_editor_search_placeholder"
  | "admin_categories_search_placeholder"
  | "admin_settings_loading"
  | "admin_settings_col_setting"
  | "admin_settings_col_description"
  | "admin_settings_col_value"
  | "admin_settings_taxes"
  | "admin_settings_shipping_delivery"
  | "admin_settings_tax_notice_food"
  | "admin_settings_tax_notice_drinks"
  | "admin_settings_print_test_btn"
  | "admin_settings_print_test_notice"
  | "admin_settings_tax_category_food"
  | "admin_settings_tax_category_drinks"
  | "admin_settings_delivery_costs"
  | "admin_settings_delivery_costs_infotext"
  | "matrix_pizza_category"
  | "matrix_pizza_category_name"
  | "matrix_pizza_category_description"
  | "matrix_pizza_sizes_normal"
  | "matrix_pizza_sizes_large"
  | "design_settings_add_btn_hover_color"
  | "design_settings_category_title_color"
  | "design_settings_hero_bg"
  | "design_settings_confirm_reset"
  | "category_pizza"
  | "general_loading";

export const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    nav_home: "Home",
    nav_about: "About",
    nav_location: "Location",
    nav_imprint: "Imprint",
    nav_agb: "Terms of Service",
    nav_menu: "Menu",
    nav_cart: "Cart",
    hero_title: "TakeOff Restaurant",
    hero_subtitle: "Pizza-Service, thailändische, italienische und indische Spezialitäten.",
    hero_cta: "View Menu",
    section_menu: "Our Menu",
    section_map: "Our Location",
    add_to_cart: "Add to Cart",
    footer_imprint: "Imprint",
    footer_agb: "Terms of Service (AGB)",
    footer_copyright: "L&S Design. All rights reserved.",
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
    cart_finalize_title: "Complete Order",
    cart_summary_title: "Cart Summary",
    cart_email_label: "Email Address *",
    cart_address_label: "Postal Address *",
    cart_confirm_label: "Confirm correctness of the address and place order",
    cart_back: "Back",
    cart_order_now: "Order Now!",
    cart_proceed: "Proceed to Checkout",
    cart_finalize_alert: "Please enter a valid email address and postal address.",
    cart_confirm_alert: "Please confirm the correctness of your address.",
    menu_search_placeholder: "Search for Salami, Spinach, etc...",
    menu_no_results: "No items found matching your search.",
    hours_title: "Opening Hours",
    hours_mon: "Mon: 11:00 - 14:00 & 17:00 - 23:00",
    hours_tue: "Tue: Closed",
    hours_wed_fri: "Wed - Fri: 11:00 - 14:00 & 17:00 - 23:00",
    hours_sat_sun: "Sat & Sun: 10:00 - 23:00",
    hours_closed: "Closed",
    hours_open_now: "Open Now",
    hours_closed_now: "Closed",
    admin_menu_add_item: "Add Item",
    admin_menu_menu: "Menu Editor",
    admin_menu_editor: "Menu Editor",
    admin_menu_categories: "Categories",
    admin_menu_settings: "General Settings",
    admin_menu_backups: "Backup & Restore",
    admin_menu_orders: "Orders",
    admin_menu_design: "Design Settings",
    design_settings_group_general: "General Styles",
    design_settings_group_text: "Text & Typography",
    design_settings_group_matrix: "Pizza Matrix",
    design_settings_group_items: "Menu Items",
    design_settings_primary_color: "Primary Color",
    design_settings_secondary_color: "Secondary Color",
    design_settings_bg_dark: "Background Dark",
    design_settings_text_light: "Text Light",
    design_settings_text_muted: "Text Muted",
    design_settings_card_bg: "Card Background",
    design_settings_matrix_price_color: "Matrix Price Color",
    design_settings_matrix_name_color: "Matrix Pizza Name Color",
    design_settings_matrix_desc_color: "Matrix Description Color",
    design_settings_matrix_header_text_color: "Matrix Header Text Color",
    design_settings_matrix_btn_color: "Matrix Add Button Color",
    design_settings_matrix_btn_hover_color: "Matrix Add Button Hover Color",
    design_settings_item_title_color: "Item Title Color",
    design_settings_item_price_color: "Item Price Color",
    design_settings_item_desc_color: "Item Description Color",
    design_settings_add_btn_hover_color: "Add to Cart Hover Color",
    design_settings_category_title_color: "Category Title Color",
    design_settings_hero_bg: "Use hangar background for Hero section",
    design_settings_confirm_reset: "Do you want to reset all design settings to default values?",
    category_pizza: "Pizzas",
    design_settings_group_backgrounds: "Backgrounds",
    general_refresh_btn: "Refresh",
    general_loading: "Loading",
    matrix_pizza_category: "Pizza",
    matrix_pizza_category_name: "Name",
    matrix_pizza_category_description: "Description",
    matrix_pizza_sizes_normal: "Normal",
    matrix_pizza_sizes_large: "Large",

    admin_dashboard: "Admin Dashboard",
    admin_menu_backup_restore: "Backup & Restore",
    admin_orders_no_orders_found: "No orders found.",
    admin_orders_headline: "Orders",
    admin_orders_search_placeholder: "Search orders...",
    admin_editor_search_placeholder: "Search items...",
    admin_categories_search_placeholder: "Search categories...",
    admin_settings_loading: "Loading settings...",
    admin_settings_col_setting: "Setting",
    admin_settings_col_description: "Description",
    admin_settings_col_value: "Value",
    admin_settings_taxes: "Taxes",
    admin_settings_shipping_delivery: "Shipping & Delivery",
    admin_settings_tax_notice_food: "Standard VAT percentage for food items.",
    admin_settings_tax_notice_drinks: "Standard VAT percentage for drinks.",
    admin_settings_print_test_btn: "Test Printing",
    admin_settings_print_test_notice: "Generates a test receipt for item 153 and adds it to the print queue.",
    admin_settings_tax_category_food: "Food",
    admin_settings_tax_category_drinks: "Drinks",
    admin_settings_delivery_costs: "Delivery Costs",
    admin_settings_delivery_costs_infotext: "Fixed delivery fee applied to each order in Euro."
  },
  de: {
    nav_home: "Startseite",
    nav_about: "Über uns",
    nav_location: "Anfahrt",
    nav_imprint: "Impressum",
    nav_agb: "AGB",
    nav_menu: "Speisekarte",
    nav_cart: "Warenkorb",
    hero_title: "TakeOff Restaurant",
    hero_subtitle: "Pizza-Service, thailändische, italienische und indische Spezialitäten.",
    hero_cta: "Speisekarte ansehen",
    section_menu: "Unsere Speisekarte",
    section_map: "Unser Standort",
    add_to_cart: "In den Warenkorb",
    footer_imprint: "Impressum",
    footer_agb: "AGB",
    footer_copyright: "L&S Design. Alle Rechte vorbehalten.",
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
    cart_finalize_title: "Bestellung Abschließen",
    cart_summary_title: "Warenkorb Übersicht",
    cart_email_label: "E-Mail Adresse *",
    cart_address_label: "Postanschrift *",
    cart_confirm_label: "Richtigkeit der Adresse überprüft und verbindlich bestellen",
    cart_back: "Zurück",
    cart_order_now: "Jetzt Bestellen!",
    cart_proceed: "Weiter zur Kasse",
    cart_finalize_alert: "Bitte eine gültige E-Mail Adresse und Postanschrift eingeben.",
    cart_confirm_alert: "Bitte bestätigen Sie die Richtigkeit Ihrer Adresse.",
    menu_search_placeholder: "Suche nach Salami, Spinat, Bela...",
    menu_no_results: "Keine Artikel gefunden, die Ihrer Suche entsprechen.",
    hours_title: "Öffnungszeiten",
    hours_mon: "Mo: 11:00 - 14:00 & 17:00 - 23:00",
    hours_tue: "Di: Ruhetag",
    hours_wed_fri: "Mi - Fr: 11:00 - 14:00 & 17:00 - 23:00",
    hours_sat_sun: "Sa & So: 10:00 - 23:00",
    hours_closed: "Ruhetag",
    hours_open_now: "Jetzt geöffnet",
    hours_closed_now: "Geschlossen",
    admin_menu_add_item: "Eintrag hinzufügen",
    admin_menu_menu: "Editor",
    admin_menu_editor: "Editor",
    admin_menu_categories: "Kategorien",
    admin_menu_settings: "Allgemeine Einstellungen",
    admin_menu_backups: "Sichern und Wiederherstellen",
    admin_menu_orders: "Bestellungen",
    admin_menu_design: "Design Einstellungen",
    design_settings_group_general: "Basis Styles",
    design_settings_group_text: "Text & Typografie",
    design_settings_group_matrix: "Pizza Matrix",
    design_settings_group_items: "Speisekarten Einträge",
    design_settings_group_backgrounds: "Hintergründe",
    design_settings_hero_bg: "Hangar-Hintergrund für Hero-Bereich verwenden",
    design_settings_confirm_reset: "Möchten Sie alle Design-Einstellungen auf die Standardwerte zurücksetzen?",
    category_pizza: "Pizzen",
    design_settings_primary_color: "Primärfarbe",
    design_settings_secondary_color: "Sekundärfarbe",
    design_settings_bg_dark: "Hintergrund Dunkel",
    design_settings_text_light: "Text Hell",
    design_settings_text_muted: "Text Gedumpt",
    design_settings_card_bg: "Karten Hintergrund",
    design_settings_matrix_price_color: "Matrix Preis Farbe",
    design_settings_matrix_name_color: "Matrix Pizza Name Farbe",
    design_settings_matrix_desc_color: "Matrix Beschreibung Farbe",
    design_settings_matrix_header_text_color: "Matrix Header Text Farbe",
    design_settings_matrix_btn_color: "Matrix Add Button Farbe",
    design_settings_matrix_btn_hover_color: "Matrix Add Button Hover Farbe",
    design_settings_item_title_color: "Gericht Titel Farbe",
    design_settings_item_price_color: "Gericht Preis Farbe",
    design_settings_item_desc_color: "Gericht Beschreibung Farbe",
    design_settings_add_btn_hover_color: "In den Warenkorb Hover Farbe",
    design_settings_category_title_color: "Kategorie Titel Farbe",
    general_refresh_btn: "Neu Laden",
    general_loading: "Laden",
    matrix_pizza_category: "Pizza",
    matrix_pizza_category_name: "Name",
    matrix_pizza_category_description: "Beschreibung",
    matrix_pizza_sizes_normal: "Normal",
    matrix_pizza_sizes_large: "Large",
    admin_dashboard: "Admin Übersicht",
    admin_menu_backup_restore: "Sichern und Wiederherstellen",
    admin_orders_no_orders_found: "Keine Bestellungen gefunden.",
    admin_orders_headline: "Bestellungen",
    admin_orders_search_placeholder: "Bestellungen durchsuchen...",
    admin_editor_search_placeholder: "Einträge durchsuchen...",
    admin_categories_search_placeholder: "Kategorien durchsuchen...",
    admin_settings_loading: "Lade Einstellungen...",
    admin_settings_col_setting: "Einstellung",
    admin_settings_col_description: "Beschreibung",
    admin_settings_col_value: "Wert",
    admin_settings_taxes: "Steuern",
    admin_settings_shipping_delivery: "Versand & Lieferkosten",
    admin_settings_tax_notice_food: "Mehrwertsteuer für Essen",
    admin_settings_tax_notice_drinks: "Mehrwertsteuer für Getränke",
    admin_settings_print_test_btn: "Drucken testen",
    admin_settings_print_test_notice: "Generiert eine Test-Rechnung mit Item 153 und fügt es der Print-Warteschlange hinzu",
    admin_settings_tax_category_food: "Essen",
    admin_settings_tax_category_drinks: "Getränke",
    admin_settings_delivery_costs: "Lieferkosten",
    admin_settings_delivery_costs_infotext: "Feste Lieferkosten in Euro - angewendet auf jede Bestellung"
  },
};
