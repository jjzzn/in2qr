# Prompt for Windsurf: IN2 QR Code Generator

Create a complete QR Code Generator web application with React + TypeScript + Vite that matches the design and functionality shown in the screenshot.

## Project Setup
```
Tech Stack:
- React 18 + TypeScript
- Vite
- Tailwind CSS
- qr-code-styling (for QR generation)
- react-colorful (for color picker)
- lucide-react (for icons)
- file-saver (for downloads)
```

## Core Requirements

### 1. QR Code Types (Exactly 12 types in this order)

Create these QR code types with specific icons and descriptions:

```typescript
// src/constants/qrTypes.ts

export const QR_TYPES = [
  {
    id: 'website',
    label: 'Website',
    description: 'Link to any website',
    icon: 'Link',
    placeholder: 'https://example.com'
  },
  {
    id: 'pdf',
    label: 'PDF',
    description: 'Share PDF document',
    icon: 'FileText',
    placeholder: 'https://example.com/document.pdf'
  },
  {
    id: 'video',
    label: 'Video',
    description: 'Link to video content',
    icon: 'Video',
    placeholder: 'https://youtube.com/watch?v=...'
  },
  {
    id: 'image',
    label: 'Image',
    description: 'Display image content',
    icon: 'Image',
    placeholder: 'https://example.com/image.jpg'
  },
  {
    id: 'facebook',
    label: 'Facebook',
    description: 'Link to Facebook profile or page',
    icon: 'Facebook',
    placeholder: 'https://facebook.com/username'
  },
  {
    id: 'instagram',
    label: 'Instagram',
    description: 'Link to Instagram profile',
    icon: 'Instagram',
    placeholder: 'https://instagram.com/username'
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    description: 'Send WhatsApp message',
    icon: 'MessageCircle',
    placeholder: '+66812345678'
  },
  {
    id: 'text',
    label: 'Text',
    description: 'Plain text message',
    icon: 'FileText',
    placeholder: 'Enter your text here'
  },
  {
    id: 'email',
    label: 'Email',
    description: 'Send email with details',
    icon: 'Mail',
    placeholder: 'email@example.com'
  },
  {
    id: 'phone',
    label: 'Phone Number',
    description: 'Call phone number',
    icon: 'Phone',
    placeholder: '+66812345678'
  },
  {
    id: 'wifi',
    label: 'WiFi',
    description: 'Connect to WiFi',
    icon: 'Wifi',
    placeholder: 'WiFi Network Name'
  },
  {
    id: 'location',
    label: 'Location',
    description: 'Share GPS location',
    icon: 'MapPin',
    placeholder: '13.7563,100.5018'
  }
];
```

### 2. UI Layout Requirements

**Header:**
- Logo: "IN2 QR Code Generate" with orange gradient icon
- Right side: "Dashboard" icon, "test user" text, "Logout" button

**Hero Section (Step 1 only):**
```
Title: "QR Code Generator Generator" (H1, large, bold)
Subtitle: "Create beautiful, customizable QR codes in minutes"
```

**4-Step Progress Bar:**
```
Step 1: Select Type - Choose QR type
Step 2: Add Content - Enter information  
Step 3: Customize - Design your QR
Step 4: Download - Get your QR code

Design:
- Numbered circles (1, 2, 3, 4)
- Active step: Orange background (#f97316)
- Inactive step: Gray background (#e5e7eb)
- Connected with lines
- Text below each step
```

### 3. Step 1: Select Type

**Layout:**
- Grid: 4 columns on desktop, 2 on tablet, 1 on mobile
- Gap between cards: 1rem

**Card Design:**
```css
- White background
- Rounded corners (12px)
- 2px border (gray-100, hover: orange)
- Padding: 1.5rem
- Icon: 40px, orange color (#f97316)
- Title: font-semibold, 16px
- Description: text-xs, gray-500
- Hover effect: shadow-lg, border-orange
- Click: auto-advance to Step 2
```

### 4. Step 2: Add Content

**Default Form (for most types):**
```
- Large textarea (6 rows)
- Placeholder from QR type
- Character counter
- Back button (left)
- Next button (right, disabled if empty)
```

**Special WiFi Form:**
```
Fields:
1. Network Name (SSID) - text input
2. Security Type - dropdown (WPA/WPA2, WEP, No Password)
3. Password - password input (hide if No Password selected)

Format output as: WIFI:T:{security};S:{ssid};P:{password};;
```

### 5. Step 3: Customize

**Layout: 2 columns**

**Left: Live Preview**
- White card with shadow
- Gray background for QR display
- Real-time updates on any change

**Right: Customization Options**

1. **Size Slider**
   - Range: 200-800px
   - Default: 300px
   - Show current value

2. **Colors**
   - Foreground color picker (default: #000000)
   - Background color picker (default: #ffffff)
   - Use HexColorPicker component
   - Show/hide on button click

3. **Dot Style (4 buttons)**
   - square, dots, rounded, extra-rounded
   - Active: orange background
   - Inactive: gray background

4. **Logo Upload (Optional)**
   - Upload button with file input
   - Remove button if logo exists
   - Logo size slider (20-100%)

5. **Error Correction (4 buttons)**
   - L, M, Q, H
   - Default: M
   - Tooltip: "Higher levels allow QR code to be read even with damage"

### 6. Step 4: Download

**Layout: 2 columns**

**Left: Final Preview**
- Same as Step 3
- Info card below:
  - Size
  - Type
  - Error Correction Level

**Right: Download Options**

1. **Format Selection (4 buttons)**
   - PNG, SVG, JPEG, WebP
   - Default: PNG

2. **Action Buttons (full width)**
   - Download QR Code (orange, primary)
   - Copy to Clipboard (gray, secondary)

3. **Tips Card (gradient orange background)**
   ```
   • Test your QR code before printing
   • Use high error correction for outdoor use
   • PNG format is best for printing
   • SVG format is scalable without quality loss
   ```

4. **Create Another Button**
   - Gradient orange background
   - Full width
   - Resets to Step 1

### 7. Color Scheme

```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      primary: {
        50: '#fff7ed',
        100: '#ffedd5',
        200: '#fed7aa',
        300: '#fdba74',
        400: '#fb923c',
        500: '#f97316',  // Main orange
        600: '#ea580c',
        700: '#c2410c',
        800: '#9a3412',
        900: '#7c2d12',
      }
    }
  }
}
```

### 8. Key Features to Implement

✅ **Auto-format values:**
- Website: Add "https://" if missing
- Email: Add "mailto:" prefix
- Phone: Add "tel:" prefix
- WhatsApp: Format as "https://wa.me/{phone}"
- Location: Format as "geo:{lat},{lng}"

✅ **Real-time preview:**
- Debounce input changes (300ms)
- Update QR code instantly on any change

✅ **Download functionality:**
- Use qr-code-styling's download() method
- Filename format: "qr-code-{timestamp}.{format}"

✅ **Copy to clipboard:**
- Convert canvas to blob
- Use Clipboard API
- Show "Copied!" feedback

✅ **Step navigation:**
- Can click on completed steps
- Can't skip ahead
- Back button available (except Step 1)

### 9. TypeScript Interfaces

```typescript
export type QRCodeType = 
  | 'website' | 'pdf' | 'video' | 'image'
  | 'facebook' | 'instagram' | 'whatsapp' | 'text'
  | 'email' | 'phone' | 'wifi' | 'location';

export interface QRConfig {
  type: QRCodeType;
  value: string;
  size: number;
  bgColor: string;
  fgColor: string;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  dotStyle: 'square' | 'dots' | 'rounded' | 'extra-rounded';
  cornerSquareStyle: 'square' | 'extra-rounded' | 'dot';
  cornerDotStyle: 'square' | 'dot';
  logo?: string;
  logoSize: number;
  format: 'png' | 'svg' | 'jpeg' | 'webp';
}

export type WizardStep = 1 | 2 | 3 | 4;
```

### 10. Component Structure

```
src/
├── components/
│   ├── Header.tsx
│   ├── StepProgress.tsx
│   ├── QRTypeCard.tsx
│   └── steps/
│       ├── Step1SelectType.tsx
│       ├── Step2AddContent.tsx
│       ├── Step3Customize.tsx
│       └── Step4Download.tsx
├── constants/
│   └── qrTypes.ts
├── utils/
│   └── qrCode.ts
├── types.ts
├── pages/
│   └── Home.tsx
├── App.tsx
└── main.tsx
```

### 11. Animation & Transitions

```css
/* Add to index.css */
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* All transitions should be smooth */
transition-all duration-300
```

### 12. Responsive Breakpoints

```
Mobile: < 640px (sm) - 1 column grid
Tablet: 640px - 1024px (md/lg) - 2 column grid
Desktop: > 1024px (xl) - 4 column grid for Step 1, 2 columns for Steps 3 & 4
```

---

## Implementation Order

1. ✅ Setup project with Vite + React + TypeScript + Tailwind
2. ✅ Create all type definitions and constants
3. ✅ Build Header component
4. ✅ Build StepProgress component
5. ✅ Build QRTypeCard component
6. ✅ Implement Step1SelectType with grid layout
7. ✅ Implement Step2AddContent with WiFi special form
8. ✅ Implement Step3Customize with live preview
9. ✅ Implement Step4Download with all download options
10. ✅ Add QR code generation utils
11. ✅ Wire up all navigation and state management
12. ✅ Add animations and polish
13. ✅ Test all QR code types
14. ✅ Responsive testing

---

## Critical Design Notes

🎨 **Orange is the primary color** - Use #f97316 consistently
📱 **Mobile-first** - Start with mobile layout, scale up
⚡ **Performance** - Debounce QR regeneration, optimize re-renders
♿ **Accessibility** - Proper button states, labels, keyboard navigation
🎯 **User Flow** - Auto-advance on Step 1, clear CTAs on all steps

---

## Testing Checklist

- [ ] All 12 QR code types generate correctly
- [ ] WiFi QR codes format properly
- [ ] Colors update in real-time
- [ ] Logo upload and removal works
- [ ] All download formats work
- [ ] Copy to clipboard functions
- [ ] Step navigation works correctly
- [ ] Mobile responsive (all steps)
- [ ] Tablet responsive (all steps)
- [ ] Desktop layout perfect match
- [ ] Back/Next buttons work
- [ ] Create Another resets properly

---

Generate the complete, production-ready code following this specification exactly.
