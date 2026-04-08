# De Facto Lounge & Bar - Deployment Guide

## 🚀 Netlify Deployment

### Option 1: GitHub/GitLab Integration (Recommended)

1. **Push to Repository**
   ```bash
   git add .
   git commit -m "feat: Add premium De Facto homepage with QR routing fix"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Choose your Git provider (GitHub/GitLab)
   - Select the `de-facto-lounge-and-bar` repository

3. **Build Settings**
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: 18 or higher (set in Netlify UI or use `.nvmrc`)

4. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete
   - Your site will be live at `https://[random-name].netlify.app`

### Option 2: Manual Deploy

1. **Build Locally**
   ```bash
   npm run build
   ```

2. **Deploy via Netlify CLI**
   ```bash
   # Install Netlify CLI (if not installed)
   npm install -g netlify-cli

   # Login to Netlify
   netlify login

   # Deploy
   netlify deploy --prod --dir=dist
   ```

3. **Or Drag & Drop**
   - Go to [Netlify Drop](https://app.netlify.com/drop)
   - Drag the `dist` folder
   - Site will be deployed instantly

---

## ✅ Pre-Deployment Checklist

### Required Updates
- [ ] Update WhatsApp numbers (see `WHATSAPP_CONFIG.md`)
- [ ] Update bank details in `constants.tsx`
- [ ] Add real images to `public/assets/` (or use fallbacks)
- [ ] Test locally: `npm run dev`

### Verification
- [ ] Build succeeds: `npm run build`
- [ ] Homepage loads at `/`
- [ ] QR route works: `/q/T1`
- [ ] All CTAs functional (Bar, Food, Reserve, Chapman)
- [ ] Reservation modal opens and sends WhatsApp message
- [ ] Staff concierge contact works
- [ ] Mobile responsive

---

## 🧪 Post-Deployment Testing

### 1. Test Homepage
Visit: `https://your-site.netlify.app/`
- [ ] Hero section loads
- [ ] All 4 CTAs work (Bar, Restaurant, Reserve, Chapman)
- [ ] Smooth scroll to sections
- [ ] Reservation modal opens and closes
- [ ] WhatsApp links work

### 2. Test QR Routes (CRITICAL)
Visit directly (simulate QR scan):
- [ ] `https://your-site.netlify.app/q/T1`
- [ ] `https://your-site.netlify.app/q/T2`
- [ ] `https://your-site.netlify.app/q/T4`

**Expected**: Should load TableLanding, NOT 404

Refresh page while on QR route:
- [ ] Page reloads correctly (no 404)

### 3. Test Sections
- [ ] Bar Tray section displays 20 items
- [ ] Category filters work (All, Cognac, Whisky, etc.)
- [ ] Search functionality works
- [ ] Food Menu displays 10 dishes
- [ ] Food filters work (All, Local, Intercontinental, Seafood)
- [ ] Staff section displays 8 members
- [ ] Footer displays correctly

### 4. Test Dashboards
- [ ] `https://your-site.netlify.app/#staff` → Staff dashboard
- [ ] `https://your-site.netlify.app/#ceo` → CEO dashboard

### 5. Mobile Testing
Test on actual mobile devices:
- [ ] Homepage responsive
- [ ] QR ordering flow works
- [ ] Reservation form usable
- [ ] WhatsApp links open app correctly

---

## 🔧 Troubleshooting

### Issue: 404 on QR Routes
**Cause**: Netlify redirects not working

**Fix**:
1. Verify `netlify.toml` exists in root
2. Verify `public/_redirects` exists
3. Check build output includes `dist/_redirects`
4. Redeploy

### Issue: WhatsApp Links Don't Work
**Cause**: Incorrect number format

**Fix**:
- Use format: `2348012345678` (no `+`, no spaces)
- Test link manually: `https://wa.me/2348012345678`

### Issue: Images Not Loading
**Cause**: Images not in `public/assets/`

**Fix**:
- Add images to `public/assets/bar/`, `public/assets/food/`, `public/assets/staff/`
- Or use fallbacks (already implemented)

### Issue: Build Fails
**Cause**: TypeScript errors or missing dependencies

**Fix**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📊 Performance Optimization (Optional)

### Image Optimization
If adding real images:
```bash
# Install sharp for image optimization
npm install -D sharp

# Use tools like:
# - TinyPNG (https://tinypng.com)
# - Squoosh (https://squoosh.app)
```

### Lighthouse Score
Run Lighthouse audit:
- Performance: Target 90+
- Accessibility: Target 95+
- Best Practices: Target 95+
- SEO: Target 95+

---

## 🌐 Custom Domain (Optional)

### Add Custom Domain in Netlify
1. Go to Site Settings → Domain Management
2. Click "Add custom domain"
3. Enter your domain (e.g., `defactolounge.com`)
4. Follow DNS configuration instructions
5. Enable HTTPS (automatic with Netlify)

### DNS Configuration
Point your domain to Netlify:
- **A Record**: `75.2.60.5`
- **CNAME**: `your-site.netlify.app`

---

## 📱 QR Code Generation

### Generate QR Codes for Tables

Use a QR code generator (e.g., [QR Code Generator](https://www.qr-code-generator.com/)):

**Table 1**: `https://your-site.netlify.app/q/T1`  
**Table 2**: `https://your-site.netlify.app/q/T2`  
**Table 4**: `https://your-site.netlify.app/q/T4`  
**Cabana 1**: `https://your-site.netlify.app/q/T7`

Print and place QR codes on tables.

---

## 🔒 Security Checklist

- [ ] `.env.local` is in `.gitignore` (already configured)
- [ ] No sensitive data in public files
- [ ] WhatsApp numbers are business numbers (not personal)
- [ ] HTTPS enabled (automatic with Netlify)

---

## 📈 Analytics (Optional)

### Add Google Analytics
1. Get GA4 tracking ID
2. Add to `index.html` in `<head>`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## 🎉 Launch Checklist

### Pre-Launch
- [ ] All WhatsApp numbers updated
- [ ] Bank details updated
- [ ] Images added (or fallbacks confirmed working)
- [ ] Local testing complete
- [ ] Build successful

### Launch
- [ ] Deploy to Netlify
- [ ] Test all routes on live site
- [ ] Test QR routes (critical!)
- [ ] Test on mobile devices
- [ ] Generate and print QR codes

### Post-Launch
- [ ] Monitor Netlify analytics
- [ ] Test customer feedback
- [ ] Monitor WhatsApp messages
- [ ] Update content as needed

---

## 📞 Support

For issues or questions:
1. Check `IMPLEMENTATION_SUMMARY.md`
2. Check `WHATSAPP_CONFIG.md`
3. Review build logs in Netlify dashboard
4. Check browser console for errors

---

## 🔄 Future Updates

To update the site:
1. Make changes locally
2. Test: `npm run dev`
3. Build: `npm run build`
4. Push to Git (auto-deploys) or manual deploy
5. Verify on live site

---

**Ready to deploy! 🚀**
