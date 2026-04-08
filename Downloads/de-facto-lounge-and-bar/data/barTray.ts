// Bar Tray - Premium Spirits & Signature Cocktails
// 20 items: 10 most expensive spirits + 10 premium cocktails

export interface BarTrayItem {
    id: string;
    name: string;
    category: 'Cognac' | 'Whisky' | 'Bourbon' | 'Vodka' | 'Champagne' | 'Cocktail';
    tastingNote: string;
    price: number;
    image: string; // Path to local asset
}

export const barTrayItems: BarTrayItem[] = [
    // === COGNAC (2 items) ===
    {
        id: 'remy-louis-xiii',
        name: 'Rémy Martin Louis XIII',
        category: 'Cognac',
        tastingNote: 'A century of heritage in every sip. Floral, honeyed, with deep oak complexity.',
        price: 1850000,
        image: '/assets/bar/remy-louis-xiii.jpg'
    },
    {
        id: 'hennessy-paradis',
        name: 'Hennessy Paradis Imperial',
        category: 'Cognac',
        tastingNote: 'Silky elegance with notes of jasmine, orange blossom, and aged oak.',
        price: 950000,
        image: '/assets/bar/hennessy-paradis.jpg'
    },

    // === WHISKY (3 items) ===
    {
        id: 'macallan-25',
        name: 'The Macallan 25 Year Sherry Oak',
        category: 'Whisky',
        tastingNote: 'Rich dried fruits, ginger spice, and chocolate. A masterpiece of patience.',
        price: 1200000,
        image: '/assets/bar/macallan-25.jpg'
    },
    {
        id: 'glenfiddich-30',
        name: 'Glenfiddich 30 Year Suspended Time',
        category: 'Whisky',
        tastingNote: 'Warm oak, vanilla, and subtle smoke. Three decades of refinement.',
        price: 850000,
        image: '/assets/bar/glenfiddich-30.jpg'
    },
    {
        id: 'johnnie-walker-blue',
        name: 'Johnnie Walker Blue Label',
        category: 'Whisky',
        tastingNote: 'Smooth, balanced, with hints of honey and hazelnut. Rare and refined.',
        price: 185000,
        image: '/assets/bar/johnnie-blue.jpg'
    },

    // === BOURBON (2 items) ===
    {
        id: 'pappy-van-winkle-23',
        name: 'Pappy Van Winkle 23 Year',
        category: 'Bourbon',
        tastingNote: 'Legendary American bourbon. Caramel, vanilla, and toasted oak.',
        price: 1450000,
        image: '/assets/bar/pappy-23.jpg'
    },
    {
        id: 'blanton-gold',
        name: 'Blanton\'s Gold Edition',
        category: 'Bourbon',
        tastingNote: 'Single barrel excellence. Citrus, honey, and a long, warm finish.',
        price: 320000,
        image: '/assets/bar/blantons-gold.jpg'
    },

    // === VODKA (1 item) ===
    {
        id: 'belvedere-heritage',
        name: 'Belvedere Heritage 176',
        category: 'Vodka',
        tastingNote: 'Crystal-clear purity with a creamy, velvety texture. Rye perfection.',
        price: 420000,
        image: '/assets/bar/belvedere-heritage.jpg'
    },

    // === CHAMPAGNE (2 items) ===
    {
        id: 'dom-perignon-p3',
        name: 'Dom Pérignon P3 1990',
        category: 'Champagne',
        tastingNote: 'Third plénitude. Toasted brioche, truffle, and infinite depth.',
        price: 2100000,
        image: '/assets/bar/dom-p3.jpg'
    },
    {
        id: 'cristal-rose',
        name: 'Louis Roederer Cristal Rosé',
        category: 'Champagne',
        tastingNote: 'Delicate red berries, minerality, and a silky mousse. Pure luxury.',
        price: 780000,
        image: '/assets/bar/cristal-rose.jpg'
    },

    // === COCKTAILS (10 items) ===
    {
        id: 'de-facto-signature',
        name: 'De Facto Signature',
        category: 'Cocktail',
        tastingNote: 'House blend: passion fruit, premium gin, elderflower, and a whisper of lime.',
        price: 12000,
        image: '/assets/bar/de-facto-signature.jpg'
    },
    {
        id: 'asaba-sunset',
        name: 'Asaba Sunset',
        category: 'Cocktail',
        tastingNote: 'Tequila, mango, chili-infused agave, and fresh grapefruit. Bold and bright.',
        price: 10500,
        image: '/assets/bar/asaba-sunset.jpg'
    },
    {
        id: 'emerald-martini',
        name: 'Emerald Martini',
        category: 'Cocktail',
        tastingNote: 'Vodka, cucumber, basil, and a hint of green chartreuse. Crisp and herbal.',
        price: 11000,
        image: '/assets/bar/emerald-martini.jpg'
    },
    {
        id: 'gold-rush-deluxe',
        name: 'Gold Rush Deluxe',
        category: 'Cocktail',
        tastingNote: 'Bourbon, honey syrup, and lemon. Smooth, sweet, and timeless.',
        price: 9500,
        image: '/assets/bar/gold-rush.jpg'
    },
    {
        id: 'chapman-tray',
        name: 'Chapman Tray (Serves 4)',
        category: 'Cocktail',
        tastingNote: 'Classic Nigerian refresher. Fruity, fizzy, and loaded with garnish.',
        price: 18000,
        image: '/assets/bar/chapman-tray.jpg'
    },
    {
        id: 'negroni-royale',
        name: 'Negroni Royale',
        category: 'Cocktail',
        tastingNote: 'Gin, Campari, sweet vermouth, topped with prosecco. Bitter elegance.',
        price: 13500,
        image: '/assets/bar/negroni-royale.jpg'
    },
    {
        id: 'espresso-luxe',
        name: 'Espresso Luxe Martini',
        category: 'Cocktail',
        tastingNote: 'Vodka, coffee liqueur, fresh espresso, and a hint of vanilla. Bold and smooth.',
        price: 11500,
        image: '/assets/bar/espresso-luxe.jpg'
    },
    {
        id: 'tropical-thunder',
        name: 'Tropical Thunder',
        category: 'Cocktail',
        tastingNote: 'Rum, pineapple, coconut cream, and a dash of Angostura. Island vibes.',
        price: 9000,
        image: '/assets/bar/tropical-thunder.jpg'
    },
    {
        id: 'smoke-and-mirrors',
        name: 'Smoke & Mirrors',
        category: 'Cocktail',
        tastingNote: 'Mezcal, blackberry, lime, and smoked rosemary. Mysterious and bold.',
        price: 14000,
        image: '/assets/bar/smoke-mirrors.jpg'
    },
    {
        id: 'velvet-rose',
        name: 'Velvet Rose',
        category: 'Cocktail',
        tastingNote: 'Gin, rose water, lychee, and champagne. Floral, delicate, and luxurious.',
        price: 12500,
        image: '/assets/bar/velvet-rose.jpg'
    }
];
