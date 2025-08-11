# Overview

This is a Redis AI Query Optimizer system designed to monitor database performance in real-time and provide AI-powered optimization suggestions. The application combines Redis caching and vector search capabilities with Google's Gemini AI to analyze SQL queries and predict performance bottlenecks before they impact production systems.

The system features a modern full-stack architecture with a Node.js/Express backend, React frontend with real-time updates via WebSockets, and a PostgreSQL database for demo data. It includes comprehensive monitoring dashboards, live query analysis, and automated traffic generation for demonstration purposes.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Styling**: Tailwind CSS with shadcn/ui components for a modern dark theme interface
- **State Management**: React Query (@tanstack/react-query) for server state and caching
- **Routing**: Wouter for lightweight client-side routing
- **Real-time Updates**: WebSocket connection for live data streaming
- **UI Components**: Comprehensive component library using Radix UI primitives

## Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database ORM**: Drizzle ORM with PostgreSQL as the primary database
- **Real-time Communication**: WebSocket server for live updates and notifications
- **AI Integration**: Google Gemini 2.0 Flash API for query analysis and optimization suggestions
- **Middleware**: Custom query interceptor for automatic SQL analysis
- **Demo System**: Automated traffic generator for realistic query simulation

## Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon serverless hosting
- **Caching Layer**: Redis with multiple modules (Vector Search, JSON, TimeSeries, Pub/Sub)
- **Schema Management**: Drizzle migrations with TypeScript schema definitions
- **Data Models**: Users, products, categories, orders, query logs, AI optimizations, performance metrics, and alerts

## Authentication and Session Management
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **User Management**: Basic user authentication system with role-based access
- **Security**: Middleware-based request tracking and validation

## Real-time Features
- **WebSocket Integration**: Live query monitoring and performance updates
- **Redis Pub/Sub**: Real-time event broadcasting for system notifications
- **Streaming Data**: Redis Streams for query log processing and analysis
- **Live Metrics**: Real-time dashboard updates for performance monitoring

# External Dependencies

## AI and Machine Learning
- **Google Gemini API**: Primary AI service for query optimization and analysis suggestions
- **Vector Search**: Redis vector search capabilities for query pattern matching
- **Embeddings**: Query pattern analysis using AI-generated embeddings

## Database and Caching
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Redis Stack**: Full Redis deployment with all modules (Vector Search, JSON, TimeSeries, Pub/Sub, Streams)
- **Connection Management**: WebSocket constructor override for Neon compatibility

## UI and Visualization  
- **Chart.js**: Performance charts and real-time data visualization
- **Font Awesome**: Icon library for dashboard interface
- **Google Fonts**: Inter font family for consistent typography
- **Radix UI**: Accessible component primitives for complex UI elements

## Development and Build Tools
- **Vite**: Frontend build tool with React plugin and development server
- **TypeScript**: Full type safety across frontend and backend
- **ESBuild**: Backend bundling for production deployment
- **PostCSS**: CSS processing with Tailwind and Autoprefixer

## Monitoring and Analytics
- **WebSocket Server**: Real-time connection management for live updates
- **Performance Tracking**: Query execution time monitoring and analysis
- **Alert System**: Automated notifications for performance issues
- **Demo Traffic**: Simulated database load for testing and demonstration