# CV-Express Backend

Job scraper API built with Node.js, Express, MongoDB, and Puppeteer.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cv-express
NODE_ENV=development
```

4. Make sure MongoDB is running locally or provide a MongoDB Atlas connection string.

5. Run the development server:
```bash
npm run dev
```

## API Endpoints

### Scraping
- `POST /api/scrape` - Scrape jobs from multiple sources
  - Body: `{ keyword: string, location: string, sources?: string[] }`

### Jobs
- `GET /api/jobs` - Get all jobs (with filtering and pagination)
- `GET /api/jobs/saved` - Get saved jobs
- `GET /api/jobs/:id` - Get single job
- `POST /api/jobs/:id/save` - Toggle save status
- `DELETE /api/jobs/:id` - Delete job

## Tech Stack

- **Express.js** - Web framework
- **MongoDB + Mongoose** - Database
- **Puppeteer** - Web scraping
- **TypeScript** - Type safety

## Notes

- Web scraping may face challenges due to bot detection
- Scraping respects rate limits and includes delays
- Some job sites may require authentication or have legal restrictions

