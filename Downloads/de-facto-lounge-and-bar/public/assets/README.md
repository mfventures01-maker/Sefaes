# De Facto Lounge & Bar - Asset Guide

## Directory Structure

```
public/
└── assets/
    ├── bar/          # Bar & cocktail images
    ├── food/         # Food dish images
    └── staff/        # Staff member photos
```

## Asset Naming Convention

### Bar Assets (public/assets/bar/)
- `remy-louis-xiii.jpg`
- `hennessy-paradis.jpg`
- `macallan-25.jpg`
- `glenfiddich-30.jpg`
- `johnnie-blue.jpg`
- `pappy-23.jpg`
- `blantons-gold.jpg`
- `belvedere-heritage.jpg`
- `dom-p3.jpg`
- `cristal-rose.jpg`
- `de-facto-signature.jpg`
- `asaba-sunset.jpg`
- `emerald-martini.jpg`
- `gold-rush.jpg`
- `chapman-tray.jpg`
- `negroni-royale.jpg`
- `espresso-luxe.jpg`
- `tropical-thunder.jpg`
- `smoke-mirrors.jpg`
- `velvet-rose.jpg`

### Food Assets (public/assets/food/)
- `seafood-jollof.jpg`
- `asun-platter.jpg`
- `native-soup.jpg`
- `wagyu-steak.jpg`
- `lobster-thermidor.jpg`
- `truffle-pasta.jpg`
- `duck-confit.jpg`
- `peppered-snail.jpg`
- `seafood-paella.jpg`
- `grilled-barracuda.jpg`

### Staff Assets (public/assets/staff/)
- `chidi-okonkwo.jpg`
- `amara-nwosu.jpg`
- `tunde-adeyemi.jpg`
- `ngozi-eze.jpg`
- `emeka-obi.jpg`
- `blessing-okoro.jpg`
- `kunle-balogun.jpg`
- `zainab-ibrahim.jpg`

## Image Specifications

### Recommended Dimensions
- **Bar items**: 800x1000px (portrait, 4:5 ratio)
- **Food items**: 1200x900px (landscape, 4:3 ratio)
- **Staff photos**: 800x1000px (portrait, 4:5 ratio)

### Format
- JPEG or WebP for best compression
- Quality: 80-90%
- Max file size: 500KB per image

## Fallback Behavior

If images are missing, the application displays premium gradient fallbacks:
- **Bar items**: Category-specific gradient with icon
- **Food items**: Gold/orange gradient with dish icon
- **Staff photos**: Initials on colored gradient background

## Adding New Images

1. Place images in the appropriate directory
2. Use the exact filename from the data files
3. Ensure images are optimized for web
4. Test the page to verify images load correctly

## Contact Configuration

Update WhatsApp numbers in:
- `data/staff.ts` - CONCIERGE_CONTACT.whatsappNumber
- `components/home/ReserveTableModal.tsx` - whatsappNumber constant
- `components/home/HomeFooter.tsx` - whatsappNumber constant
- `constants.tsx` - WHATSAPP_CONFIG.targetNumber
