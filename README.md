# IN2 QR Code Generator

A complete, production-ready QR Code Generator web application with React, TypeScript, Vite, and Supabase integration.

## 🚀 Features

### QR Code Generation
- **12 QR Code Types**: Website, PDF, Video, Image, Facebook, Instagram, WhatsApp, Text, Email, Phone, WiFi, Location
- **Live Preview**: Real-time QR code updates as you customize
- **Full Customization**:
  - Size adjustment (200-800px)
  - Foreground & background colors
  - 4 dot styles (square, dots, rounded, extra-rounded)
  - Logo upload with size control
  - Error correction levels (L, M, Q, H)
- **Multiple Export Formats**: PNG, SVG, JPEG, WebP
- **Copy to Clipboard**: One-click copy functionality

### User Authentication (Supabase)
- User registration and login
- Secure authentication with Supabase Auth
- Session management

### Database Integration
- Save QR codes to your account
- View all saved QR codes in dashboard
- Track scan counts
- Delete saved QR codes
- Download previously created QR codes

### User Interface
- **4-Step Wizard**: Select Type → Add Content → Customize → Download
- **Responsive Design**: Mobile, tablet, and desktop optimized
- **Modern UI**: Tailwind CSS with orange (#f97316) primary theme
- **Smooth Animations**: Fade-in effects and transitions

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 4
- **Styling**: Tailwind CSS
- **QR Generation**: qr-code-styling
- **Color Picker**: react-colorful
- **Icons**: lucide-react
- **Backend**: Supabase (Auth + PostgreSQL)
- **File Downloads**: file-saver

## 📦 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd windsurf-project-2
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**

Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=https://pnozpuxxqcbnijragick.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_94DcwDt23uj_OMq7iqI2Zg_zsN2fFbi
```

4. **Run development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5174`

## 🗄️ Database Schema

The application uses the following Supabase tables:

- **users**: User accounts
- **qr_codes**: Saved QR codes with design settings
- **qr_scans**: Analytics for QR code scans
- **links**: Short links for dynamic QR codes
- **analytics**: Detailed analytics data
- **galleries**: Image galleries

## 📱 Usage

### Creating a QR Code

1. **Select Type**: Choose from 12 different QR code types
2. **Add Content**: Enter the information (special WiFi form available)
3. **Customize**: Adjust colors, size, style, and add logo
4. **Download**: Save to account (if logged in) or download directly

### Managing QR Codes

1. **Sign In**: Click "Sign In" in the header
2. **Create Account**: Register with email and password
3. **Dashboard**: View all your saved QR codes
4. **Download/Delete**: Manage your QR codes from the dashboard

## 🎨 Customization Options

- **Size**: 200px - 800px
- **Colors**: Full color picker for foreground and background
- **Dot Styles**: square, dots, rounded, extra-rounded
- **Logo**: Upload custom logo with size control (20-100%)
- **Error Correction**: L (7%), M (15%), Q (25%), H (30%)

## 🔐 Authentication Flow

1. User registers with email, password, and name
2. Supabase Auth creates user account
3. User record created in `users` table
4. Session maintained across page refreshes
5. Protected routes require authentication

## 📊 Features Breakdown

### Step 1: Select Type
- Grid layout (4 columns desktop, 2 tablet, 1 mobile)
- Hover effects with orange border
- Auto-advance to next step

### Step 2: Add Content
- Standard textarea for most types
- Special WiFi form (SSID, Security, Password)
- Character counter
- Validation before proceeding

### Step 3: Customize
- Live preview with real-time updates
- Color pickers with hex values
- Slider controls for size and logo
- Tooltips for error correction

### Step 4: Download
- Save to account (authenticated users)
- Download in multiple formats
- Copy to clipboard
- Pro tips card
- Create another QR code

## 🚀 Build for Production

```bash
npm run build
```

The production build will be in the `dist` folder.

## 📝 Project Structure

```
src/
├── components/
│   ├── Header.tsx              # Navigation header
│   ├── StepProgress.tsx        # 4-step progress indicator
│   ├── QRTypeCard.tsx          # QR type selection card
│   └── steps/
│       ├── Step1SelectType.tsx
│       ├── Step2AddContent.tsx
│       ├── Step3Customize.tsx
│       └── Step4Download.tsx
├── contexts/
│   └── AuthContext.tsx         # Authentication context
├── pages/
│   ├── Login.tsx               # Login page
│   ├── Register.tsx            # Registration page
│   └── Dashboard.tsx           # User dashboard
├── services/
│   └── qrCodeService.ts        # Database operations
├── lib/
│   └── supabase.ts             # Supabase client
├── constants/
│   └── qrTypes.ts              # QR type definitions
├── utils/
│   └── qrCode.ts               # QR generation utilities
├── types.ts                    # TypeScript interfaces
├── App.tsx                     # Main app component
└── main.tsx                    # Entry point
```

## 🎯 Key Features Implementation

### Auto-format Values
- URLs: Add "https://" if missing
- Email: Add "mailto:" prefix
- Phone: Add "tel:" prefix
- WhatsApp: Format as "https://wa.me/{phone}"
- Location: Format as "geo:{lat},{lng}"

### Real-time Preview
- Debounced input changes (300ms)
- Instant QR code regeneration
- Smooth transitions

### Download Functionality
- Multiple format support
- Custom filename with timestamp
- Blob-based clipboard copy

## 🔧 Environment Variables

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
