# Restaurant Order System

A full-stack restaurant order management system built with React, Express, and PostgreSQL.

## 🚀 Quick Deploy

### Option 1: Deploy to Railway (Recommended)

1. **Fork this repository** to your GitHub account

2. **Set up Database (Neon)**:
   - Go to [neon.tech](https://neon.tech) and create a free account
   - Create a new project
   - Copy your database connection string

3. **Deploy to Railway**:
   - Go to [railway.app](https://railway.app) and create an account
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your forked repository
   - Add environment variables:
     ```
     DATABASE_URL = your-neon-database-url
     NODE_ENV = production
     ```
   - Deploy!

4. **Set up Database Tables**:
   - After deployment, run the database setup (see below)

### Option 2: Deploy to Render

1. **Create a Render account** at [render.com](https://render.com)
2. **Create a new Web Service**
3. **Connect your GitHub repository**
4. **Configure**:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Add environment variables (same as Railway)

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL

# Run development server
npm run dev

# Set up database tables
npm run db:push
```

## 📁 Project Structure

```
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared types and schemas
├── attached_assets/ # Images and static assets
└── scripts/         # Database setup scripts
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://username:password@host/database
NODE_ENV=development
```

## 🗄️ Database Setup

After deployment, you need to create the database tables. You can do this by:

1. **Using Drizzle Kit** (recommended):
   ```bash
   npm run db:push
   ```

2. **Or manually running the setup script**:
   ```bash
   npm run db:setup
   ```

## 🌐 API Endpoints

- `GET /api/customer/current` - Get current customer
- `GET /api/customer/registered` - Check if customer is registered
- `POST /api/customer/register` - Register new customer
- `GET /api/products` - Get all products
- `POST /api/orders` - Create new order

## 🎨 Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Express + TypeScript
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM
- **Deployment**: Railway/Render

## 📝 License

MIT 