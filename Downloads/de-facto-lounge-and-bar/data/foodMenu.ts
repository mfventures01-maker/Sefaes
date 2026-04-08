// Food Menu - Premium Dishes (Local, Intercontinental, Seafood)
// 10 total dishes with diverse categories

export interface FoodMenuItem {
    id: string;
    name: string;
    tags: ('Local' | 'Intercontinental' | 'Seafood')[];
    description: string;
    price: number;
    image: string; // Path to local asset
}

export const foodMenuItems: FoodMenuItem[] = [
    // === LOCAL DISHES (3 items) ===
    {
        id: 'seafood-jollof-special',
        name: 'Seafood Jollof Special',
        tags: ['Local', 'Seafood'],
        description: 'Smoky party jollof rice with jumbo prawns, grilled croaker fish, and spicy pepper sauce.',
        price: 18000,
        image: '/assets/food/seafood-jollof.jpg'
    },
    {
        id: 'asun-premium',
        name: 'Premium Asun Platter',
        tags: ['Local'],
        description: 'Spicy grilled goat meat with caramelized onions, bell peppers, and scotch bonnet heat.',
        price: 12500,
        image: '/assets/food/asun-platter.jpg'
    },
    {
        id: 'native-soup-assorted',
        name: 'Native Soup with Assorted Meat',
        tags: ['Local'],
        description: 'Rich palm oil-based soup with stockfish, cow leg, shaki, and pounded yam.',
        price: 15000,
        image: '/assets/food/native-soup.jpg'
    },

    // === INTERCONTINENTAL DISHES (4 items) ===
    {
        id: 'wagyu-steak',
        name: 'Wagyu Beef Steak (250g)',
        tags: ['Intercontinental'],
        description: 'Premium Japanese Wagyu, grilled to perfection, served with truffle mash and asparagus.',
        price: 45000,
        image: '/assets/food/wagyu-steak.jpg'
    },
    {
        id: 'lobster-thermidor',
        name: 'Lobster Thermidor',
        tags: ['Intercontinental', 'Seafood'],
        description: 'Whole lobster baked in a creamy brandy sauce with parmesan crust and herb butter.',
        price: 38000,
        image: '/assets/food/lobster-thermidor.jpg'
    },
    {
        id: 'truffle-pasta',
        name: 'Black Truffle Fettuccine',
        tags: ['Intercontinental'],
        description: 'Fresh pasta tossed in black truffle cream sauce, topped with shaved parmesan.',
        price: 22000,
        image: '/assets/food/truffle-pasta.jpg'
    },
    {
        id: 'duck-confit',
        name: 'Duck Confit with Cherry Glaze',
        tags: ['Intercontinental'],
        description: 'Slow-cooked duck leg, crispy skin, served with roasted root vegetables and cherry reduction.',
        price: 28000,
        image: '/assets/food/duck-confit.jpg'
    },

    // === SEAFOOD DISHES (3 items, some overlap with Local/Intercontinental) ===
    {
        id: 'grilled-snail-peppered',
        name: 'Grilled Peppered Snail',
        tags: ['Local', 'Seafood'],
        description: 'Giant snails grilled in spicy pepper sauce with onions and aromatic herbs.',
        price: 14000,
        image: '/assets/food/peppered-snail.jpg'
    },
    {
        id: 'seafood-paella',
        name: 'Seafood Paella Valenciana',
        tags: ['Intercontinental', 'Seafood'],
        description: 'Spanish saffron rice with prawns, mussels, calamari, and chorizo.',
        price: 32000,
        image: '/assets/food/seafood-paella.jpg'
    },
    {
        id: 'grilled-barracuda',
        name: 'Whole Grilled Barracuda',
        tags: ['Local', 'Seafood'],
        description: 'Fresh barracuda marinated in local spices, grilled and served with yam chips.',
        price: 16500,
        image: '/assets/food/grilled-barracuda.jpg'
    }
];
