# CV-Express

A modern job scraper application that searches across multiple job boards (LinkedIn, Indeed, Glassdoor) and provides a beautiful, user-friendly interface to browse and save job listings.

## Features

- 🔍 **Multi-Source Scraping** - Search jobs from LinkedIn, Indeed, and Glassdoor simultaneously
- 💾 **Save Jobs** - Bookmark interesting positions for later review
- 🎨 **Modern UI** - Beautiful, responsive interface built with React and Tailwind CSS
- 🔧 **Flexible Filtering** - Filter by source, location, and sort results
- ⚡ **Real-time Updates** - Live scraping with progress indicators

## Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Puppeteer (web scraping)
- TypeScript

### Frontend
- React 18 + Vite
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Zustand (state management)
- React Router

## Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB running locally or MongoDB Atlas account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd CV-Express
```

2. Install backend dependencies:
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB connection string
npm run dev
```

3. Install frontend dependencies (in a new terminal):
```bash
cd frontend
npm install
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

1. **Search for Jobs**: Enter job keywords and location, select job boards
2. **Browse Results**: View scraped jobs in a modern card layout
3. **Save Jobs**: Click the bookmark icon to save jobs for later
4. **View Saved Jobs**: Navigate to the "Saved Jobs" page to see your bookmarked positions
5. **Apply**: Click "View Job" to open the original job posting

## Project Structure

```
CV-Express/
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic & scrapers
│   │   └── server.ts       # Entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── store/          # State management
│   │   └── lib/            # Utilities
│   └── package.json
│
└── README.md
```

## API Documentation

See [backend/README.md](backend/README.md) for detailed API documentation.

## Important Notes

⚠️ **Web Scraping Considerations**:
- Job sites actively block automated scrapers
- HTML structures change frequently - scrapers may need updates
- Some sites may have legal restrictions on scraping
- Consider using official APIs where available (e.g., Indeed Publisher API)

## Future Enhancements

- [ ] Auto-apply feature integration
- [ ] LinkedIn authentication
- [ ] Job application tracking
- [ ] Email notifications for new jobs
- [ ] Advanced filtering (salary range, experience level)
- [ ] Export saved jobs to CSV/PDF

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
