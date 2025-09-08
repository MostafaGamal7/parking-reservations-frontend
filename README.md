# WeLink Cargo Parking System - Frontend

A production-ready parking reservation system frontend built with Next.js, TypeScript, and modern web technologies.

## 🚀 Features

- **Gate Management**: Real-time gate access with visitor and subscriber check-in
- **Checkpoint System**: Employee ticket verification and checkout
- **Admin Dashboard**: Comprehensive system management and reporting
- **Real-time Updates**: WebSocket integration for live data synchronization
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Type Safety**: Full TypeScript implementation
- **Modern UI**: shadcn/ui components with accessibility features

## 🛠 Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + radix/ui
- **State Management**: Redux Toolkit
- **Data Fetching**: React Query (TanStack Query)
- **Icons**: Lucide React
- **Real-time**: WebSocket API

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Update the environment variables in `.env.local`:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
   NEXT_PUBLIC_WS_URL=ws://localhost:3000/api/v1/ws
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3001](http://localhost:3001)

## 🏗 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard pages
│   │   ├── dashboard/     # Admin dashboard
│   │   ├── employees/     # Employee management
│   │   ├── zones/         # Zone management
│   │   ├── rates/         # Rate management
│   │   ├── settings/      # System settings
│   │   └── layout.tsx     # Admin layout
│   │
│   ├── checkpoint/        # Checkpoint interface
│   │   ├── page.tsx
│   │   └── components/    # Checkpoint-specific components
│   │
│   ├── gate/              # Gate interface
│   │   ├── [gateId]/      # Dynamic gate pages
│   │   └── components/    # Gate-specific components
│   │
│   ├── login/             # Login page
│   │   └── page.tsx
│   │
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── providers.tsx      # App providers
│
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...            # Other UI components
│   │
│   ├── common/            # Reusable components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── ...            # Other common components
│   │
│   ├── admin/             # Admin components
│   │   ├── EmployeeForm.tsx
│   │   ├── ZoneControls.tsx
│   │   └── ...            # Other admin components
│   │
│   ├── checkpoint/        # Checkpoint components
│   ├── gate/              # Gate components
│   ├── forms/             # Form components
│   └── modals/            # Modal components
│
├── hooks/                 # Custom React hooks
│   ├── useAuth.ts
│   ├── useWebSocket.ts
│   └── ...                # Other custom hooks
│
├── services/              # API and services
│   ├── api/               # API clients
│   ├── websocket/         # WebSocket services
│   └── ...                # Other services
│
├── store/                 # State management
│   ├── slices/            # Redux slices
│   │   ├── authSlice.ts
│   │   ├── zonesSlice.ts
│   │   └── ...            # Other slices
│   └── index.ts           # Store configuration
│
├── types/                 # TypeScript types
│   ├── index.ts           # Common types
│   ├── api/               # API response/request types
│   └── ...                # Other type definitions
│
├── utils/                 # Utility functions
│   ├── formatters.ts
│   ├── validators.ts
│   └── ...                # Other utilities
│
├── styles/                # Additional styles
│   ├── theme.css
│   └── ...                # Other style files
│
└── lib/                   # Third-party library configurations
    ├── logger.ts
    └── ...                # Other library configs
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🌐 API Integration

The frontend integrates with the backend API through:

- **REST API**: HTTP requests for data operations
- **WebSocket**: Real-time updates for zone changes and admin actions
- **Authentication**: JWT token-based authentication

### API Endpoints

- **Master Data**: Gates, zones, categories
- **Authentication**: Login for employees and admins
- **Tickets**: Check-in and check-out operations
- **Admin**: System management and reporting

## 🔐 Authentication

The system supports two user roles:

- **Employee**: Access to checkpoint functionality
- **Admin**: Full system access and management

## 📱 Responsive Design

The application is built with a mobile-first approach:

- **Mobile**: Optimized for touch interactions
- **Tablet**: Enhanced layout for medium screens
- **Desktop**: Full-featured desktop experience

## ♿ Accessibility

- **WCAG 2.1 AA** compliance
- **Keyboard navigation** support
- **Screen reader** compatibility
- **High contrast** color schemes
- **Focus management** for modals and forms

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Docker

```bash
# Build Docker image
docker build -t parking-frontend .

# Run container
docker run -p 3001:3001 parking-frontend
```

### Static Export

```bash
# Build static export
npm run build
npm run export

# Serve static files
npx serve out
```

## 🔧 Configuration

### Environment Variables

| Variable               | Description      | Default                         |
| ---------------------- | ---------------- | ------------------------------- |
| `NEXT_PUBLIC_API_URL`  | Backend API URL  | `http://localhost:3000/api/v1`  |
| `NEXT_PUBLIC_WS_URL`   | WebSocket URL    | `ws://localhost:3000/api/v1/ws` |
| `NEXT_PUBLIC_APP_NAME` | Application name | `WeLink Cargo Parking System`   |

### Tailwind Configuration

The project uses a custom Tailwind configuration with:

- Custom color palette
- Extended spacing scale
- Custom component classes
- Dark mode support

## 📊 Performance

- **Lighthouse Score**: 90+ for all metrics
- **Bundle Size**: Optimized with code splitting
- **Loading Time**: < 2s initial page load
- **Real-time Updates**: < 100ms WebSocket latency

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary software developed for WeLink Cargo.

## 🆘 Support

For support and questions:

- Check the [implementation notes](./implementation-notes.md)
- Contact the development team

---

Built with ❤️ for WeLink Cargo
