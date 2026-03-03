export interface Pizza {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string; // URL to placeholder or asset
}

export interface OrderItem {
    pizzaId: number;
    quantity: number;
}

export interface Order {
    id: number;
    customerName: string;
    items: OrderItem[];
    total: number;
    status: 'pending' | 'completed';
}

export const pizzas: Pizza[] = [
    {
        id: 1,
        name: 'Margherita',
        description: 'Classic tomato sauce, mozzarella, and fresh basil.',
        price: 12.99,
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    },
    {
        id: 2,
        name: 'Pepperoni',
        description: 'Spicy pepperoni slices with mozzarella and tomato sauce.',
        price: 14.99,
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    },
    {
        id: 3,
        name: 'Vegetarian',
        description: 'Loaded with bell peppers, onions, mushrooms, and olives.',
        price: 13.99,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    },
    {
        id: 4,
        name: 'BBQ Chicken',
        description: 'Grilled chicken, red onions, and cilantro with BBQ sauce.',
        price: 15.99,
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    }
];

export const orders: Order[] = [];
