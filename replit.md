# Guitar Practice Pro

## Overview

Guitar Practice Pro is a full-stack web application designed to help guitarists practice and improve their skills. It provides essential practice tools including a metronome, chord library, scale reference, tuner, and practice session tracking. The application features a modern dark theme optimized for guitar practice sessions and includes both frontend tools and backend practice session management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built with React and TypeScript using Vite as the build tool. The application follows a component-based architecture with clear separation of concerns:

- **Component Structure**: Organized into feature-specific components (metronome, chord-library, scales, tuner, practice) with shared UI components
- **State Management**: Uses React hooks for local state and TanStack Query for server state management
- **Routing**: Implements client-side routing with Wouter for lightweight navigation
- **Styling**: Utilizes Tailwind CSS with a custom dark theme and shadcn/ui component library for consistent UI elements
- **Audio Processing**: Custom audio engine for metronome clicks, reference tones, and audio analysis for the tuner

### Backend Architecture
The backend follows a REST API pattern built with Express.js:

- **API Design**: RESTful endpoints for practice sessions, goals, and chord progressions
- **Data Validation**: Uses Zod schemas for request validation and type safety
- **Storage Layer**: Abstract storage interface with in-memory implementation, designed for easy database integration
- **Development Setup**: Integrated with Vite for hot reloading during development

### Data Storage Solutions
The application uses Drizzle ORM with PostgreSQL as the target database:

- **Schema Design**: Defines tables for users, practice sessions, practice goals, and chord progressions
- **Type Safety**: Leverages Drizzle's TypeScript integration for type-safe database operations
- **Migration Management**: Configured for schema migrations with Drizzle Kit
- **Current Implementation**: Uses in-memory storage for development with interface designed for easy PostgreSQL integration

### Authentication and Authorization
Currently implements a basic user system:

- **User Management**: Basic user schema with username/password authentication
- **Session Storage**: Configured for PostgreSQL session storage with connect-pg-simple
- **Authorization**: User-scoped data access for practice sessions, goals, and progressions

### Audio and Media Features
Specialized audio processing capabilities:

- **Web Audio API**: Custom audio engine for generating metronome clicks and reference tones
- **Tuner Functionality**: Real-time audio analysis for pitch detection and instrument tuning
- **Audio Context Management**: Handles browser audio context lifecycle and permissions

## External Dependencies

### Database and ORM
- **Neon Database**: Serverless PostgreSQL database provider (@neondatabase/serverless)
- **Drizzle ORM**: Type-safe ORM for database operations with PostgreSQL dialect
- **Drizzle Kit**: Database schema management and migrations

### UI and Styling
- **Radix UI**: Comprehensive component library for accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Component variant management

### Frontend Framework and Tools
- **React**: Core frontend framework with TypeScript support
- **Vite**: Build tool and development server
- **TanStack Query**: Server state management and data fetching
- **Wouter**: Lightweight client-side routing

### Audio and Media
- **Web Audio API**: Browser-native audio processing (no external dependencies)
- **Media Devices API**: Microphone access for tuner functionality

### Development and Build Tools
- **TypeScript**: Type safety across the entire application
- **ESBuild**: Fast bundling for production builds
- **PostCSS**: CSS processing with Tailwind integration
- **Replit Integration**: Development environment optimizations