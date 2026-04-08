
import React from 'react';
import { Dish, Offer, ValueProp } from './types';

export const INITIAL_MENU: Dish[] = [
  {
    id: 'hennessy-vsop',
    name: 'Hennessy VSOP',
    description: 'A balanced, harmonious cognac with a complex aromatic palette.',
    prompt: 'Premium studio photography of a Hennessy VSOP bottle and a glass with one large ice cube, dark luxury lounge background, amber glow, rim lighting, 8K resolution, expensive aesthetic',
    price: 85000,
    category: 'drink'
  },
  {
    id: 'olmeca-tequila',
    name: 'Olmeca Tequila Gold',
    description: 'High-quality tequila with a hint of citrus and a smoky finish.',
    prompt: 'Commercial product shot of Olmeca Tequila Gold, lime slices and salt shaker nearby, golden lighting, sharp focus, luxury bar setting, tropical vibe',
    price: 45000,
    category: 'drink'
  },
  {
    id: 'de-facto-cocktail',
    name: 'De Facto Signature Cocktail',
    description: 'A refreshing blend of passion fruit, premium gin, and elderflower.',
    prompt: 'High-end cocktail photography, vibrant yellow drink in a crystal martini glass, garnished with a dried orange wheel and mint sprig, condensation on glass, luxurious cream background with green accents, soft lighting',
    price: 7500,
    category: 'cocktail'
  },
  {
    id: 'chapman',
    name: 'Classic Nigerian Chapman',
    description: 'The ultimate local refresher. Fruity, bitter, and sweet with plenty of garnish.',
    prompt: 'Vibrant red Chapman drink in a large dimpled mug, cucumber slices, lemon slices, and cherries visible, crushed ice, refreshing condensation, outdoor lounge setting, sun-drenched',
    price: 3500,
    category: 'cocktail'
  },
  {
    id: 'jollof-premium',
    name: 'Seafood Jollof Special',
    description: 'Smoky Jollof rice topped with jumbo prawns and grilled croaker fish.',
    prompt: 'Gourmet seafood jollof rice, massive grilled prawns, large croaker fish, vibrant red rice, steam rising, white ceramic plate, emerald green tablecloth, professional culinary lighting',
    price: 15000,
    category: 'food'
  }
];

export const OTHER_MENU_ITEMS = [
  'Moët & Chandon',
  'Glenfiddich 12yrs',
  'Margarita',
  'Long Island Iced Tea',
  'Grilled Peppered Snail',
  'Asun Special'
];

export const OFFERS: Offer[] = [
  {
    id: 'nightlife',
    title: 'PREMIUM NIGHTLIFE',
    description: 'Asaba\'s most exclusive lounge experience with live DJs and VIP service.',
    promise: 'Unmatched vibes, top-tier security, and world-class sound.',
    benefit: 'The best night out you\'ve ever had.',
    icon: '✨'
  },
  {
    id: 'mixology',
    title: 'EXPERT MIXOLOGY',
    description: 'Cocktails crafted by the city\'s finest bartenders using premium spirits.',
    promise: 'Every drink is a work of art, balanced to perfection.',
    benefit: 'Unique flavors you won\'t find elsewhere.',
    icon: '🍸'
  }
];

export const VALUE_PROPS: ValueProp[] = [
  { text: 'Premium Spirits Only' },
  { text: 'VIP Table Service' },
  { text: 'Exclusive Events' },
  { text: 'Gourmet Kitchen' }
];

// CARSS Configuration
export const WHATSAPP_CONFIG = {
  targetNumber: '2348000000000', // Update with actual De Facto WhatsApp number
  businessName: 'De Facto Lounge & Bar'
};

export const TELEGRAM_CONFIG = {
  botUsername: 'defactolounge', // Update with actual Telegram bot username or channel
  businessName: 'De Facto Lounge & Bar'
};

export const BANK_DETAILS = {
  bankName: 'First Bank of Nigeria',
  accountName: 'De Facto Lounge & Bar',
  accountNumber: '1234567890', // Update with actual account
  note: 'Use your Order ID as payment reference'
};

export const CONTEXT_TTL_HOURS = 6;
