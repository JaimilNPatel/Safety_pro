# SafetyPro

**Safety Inspection Assistant** - Comprehensive facility and equipment inspection management system.

## Overview

SafetyPro is a comprehensive web-based safety inspection and management platform designed to help organizations systematically track, manage, and improve their safety protocols across facilities and equipment.

## Features

- 🔐 Secure user authentication and role-based access control
- 📋 Dynamic inspection checklists for different equipment categories
- 🏭 Site and facility inventory management
- 🧪 Chemical tracking and management
- 📊 Risk assessment and prioritization algorithms
- 📈 Inspection history and reporting
- 🔔 Real-time alerts and notifications
- 📱 Responsive design for desktop and mobile devices

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Supabase
- **State Management**: React Query (TanStack Query)
- **Form Handling**: React Hook Form
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start
# or
npm run dev
```

The application will be available at `http://localhost:8080/`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/        # Reusable React components
├── pages/            # Page components for routing
├── hooks/            # Custom React hooks
├── lib/              # Utility functions and helper libraries
├── integrations/     # External service integrations (Supabase)
└── main.tsx          # Application entry point
```

## Key Pages

- **Login** - User authentication
- **Register** - New user registration
- **Dashboard** - Main application dashboard with inspection overview
- **Inspections** - List and manage inspections
- **New Inspection** - Create a new inspection
- **Chemicals** - Chemical inventory management
- **Sites** - Facility and site management

## Authentication

SafetyPro uses Supabase for authentication. Users can:
- Create a new account via the registration page
- Log in with their email and password
- Access authenticated pages only when logged in

## Contributing

For contributing guidelines, please refer to the project documentation.

## License

Proprietary - SafetyPro Project

## Support

For support or inquiries, please contact the development team.
