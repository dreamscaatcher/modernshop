# ModernShop E-commerce Platform

A responsive e-commerce platform demonstrating modern web development skills using Next.js and Google Cloud Platform.

## Tech Stack

- **Frontend**: Next.js 14 (App Router) with TypeScript
- **Backend**: Next.js API Routes/Server Actions
- **Database**: PostgreSQL with Prisma ORM
- **Hosting**: Google Cloud Platform
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Containerization**: Docker

## Features Implemented

- Responsive design for all device sizes
- Product catalog with categories
- Product detail pages
- User authentication (registration, login)
- Shopping cart with CRUD operations
- Checkout process with multi-step flow
- Payment processing with Stripe integration
- Order management system
- Admin dashboard for product, order, and user management
- Product search and filtering with URL-based parameters
- Promotional banner system for marketing campaigns
- Database schema with Prisma ORM
- API routes for backend functionality
- Docker containerization support
- Google Cloud Platform deployment configuration

## Project Structure

- `src/app`: Next.js App Router pages and layouts
- `src/components`: Reusable UI components
- `src/app/api`: API routes for backend functionality
- `prisma`: Database schema and seed script
- `src/lib`: Utility functions and helper libraries
- `src/types`: TypeScript type definitions

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm/yarn
- PostgreSQL database

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd modernshop

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and other configuration

# Set up the database
npm run db:migrate
npm run db:seed

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

This project includes configuration for deploying to Google Cloud Platform using Cloud Run and Cloud SQL.

See the `gcp-setup.md` file for detailed deployment instructions.

## Docker

You can run the application using Docker:

```bash
# Build the Docker image
docker build -t modernshop .

# Run the container
docker run -p 3000:3000 -e DATABASE_URL="your-database-url" modernshop
```

Or use docker-compose:

```bash
docker-compose up
```

## Database Schema

The database schema includes the following models:

- User: Customer accounts with authentication
- Product: Items available for purchase
- Category: Product categorization
- Cart/CartItem: Shopping cart functionality
- Order/OrderItem: Order management
- Address: Shipping addresses
- PromotionalBanner: Marketing campaigns and promotional content

## Promotional Banner System

The platform includes a comprehensive promotional banner system:

### Features

- **Flexible Positioning**: Place banners on homepage (top/bottom), shop page, product pages, cart page, or checkout page
- **Time-Based Scheduling**: Schedule banners with start and end dates
- **User Targeting**: Target banners to all users, new users, or returning users
- **Discount Information**: Display discount percentages and promo codes in banners
- **Priority System**: Control which banners display first when multiple are active
- **Admin Dashboard**: Complete management interface for creating, editing, and monitoring banners

### Implementation Details

- **Database Schema**: Comprehensive model for banner data storage
- **API Routes**: RESTful endpoints for CRUD operations with admin authentication
- **Admin Interface**: Full management UI for banner creation and editing
- **Banner Components**: Reusable React components for different banner positions
- **Client/Server Architecture**: Server-side rendering for initial load with client-side interactivity

## Next Steps

- Set up CI/CD pipeline
- Implement user reviews and ratings
- Add analytics and reporting
- Enhance promotional system with A/B testing capabilities
- Add inventory management features
- Implement wishlist functionality

## License

MIT