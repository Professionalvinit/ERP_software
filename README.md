# ErpFlow - Business Management System

A modern, full-stack ERP (Enterprise Resource Planning) system built with Next.js, TypeScript, and Prisma.

## 🚀 Features

- **Customer Management** - Track and manage customer information
- **Product Inventory** - Manage products, stock levels, and categories
- **Invoice Management** - Create, track, and manage invoices
- **Lead Management** - Sales pipeline and lead tracking
- **Dashboard Analytics** - Business insights and reporting
- **User Authentication** - Secure login system
- **Responsive Design** - Works on desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Custom CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **Authentication**: Custom JWT implementation
- **Styling**: Custom CSS with professional design system

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd erp-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your configuration.

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Seed the database (optional)**
   ```bash
   # Start the development server first
   npm run dev

   # Then call the seed endpoint
   curl -X POST http://localhost:3000/api/seed
   ```

## 🚀 Getting Started

1. **Development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

2. **Production build**
   ```bash
   npm run build
   npm start
   ```

## 🔐 Authentication

- **Demo Login**: Click "🚀 Try Demo Login" on the login page
- **Default Credentials**: admin@demo.com / demo123456
- **Manual Registration**: Use the `/api/auth/register` endpoint

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── customers/     # Customer management
│   │   ├── products/      # Product management
│   │   ├── invoices/      # Invoice management
│   │   ├── leads/         # Lead management
│   │   └── seed/          # Database seeding
│   ├── dashboard/         # Dashboard page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Login page
├── components/            # Reusable components
├── lib/                   # Utility functions
│   ├── auth.ts           # Authentication utilities
│   └── database.ts       # Database connection
└── prisma/               # Database schema and migrations
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Business Data
- `GET/POST /api/customers` - Customer management
- `GET/POST /api/products` - Product management
- `GET/POST /api/invoices` - Invoice management
- `GET/POST /api/leads` - Lead management

### Utilities
- `POST /api/seed` - Seed database with sample data
- `GET /api/analytics/dashboard` - Dashboard analytics

## 🎨 Design System

The application uses a custom CSS design system with:
- Professional color palette (Blue primary, clean grays)
- Responsive grid layouts
- Smooth animations and transitions
- Consistent spacing and typography
- Mobile-first responsive design

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables
4. Deploy automatically

### Manual Deployment
1. Build the application: `npm run build`
2. Start the production server: `npm start`
3. Configure your web server to serve the application

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the existing issues on GitHub
2. Create a new issue with detailed information
3. Include steps to reproduce any bugs

---

Built with ❤️ using Next.js and TypeScript
