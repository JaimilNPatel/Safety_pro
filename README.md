# SafetyPro

**Safety Inspection Assistant** - Comprehensive facility and equipment inspection management system.

> **Complete Documentation:** For comprehensive project details, architecture, algorithms, setup instructions, and development guidelines, see [PROJECT_COMPLETE_DOCUMENTATION.md](PROJECT_COMPLETE_DOCUMENTATION.md)

## Quick Start

### Prerequisites
- Node.js v16+ 
- npm/yarn

### Installation
```bash
npm install
npm run dev
```
App runs at `http://localhost:5173`

### Build for Production
```bash
npm run build
```

## What is SafetyPro?

SafetyPro is an enterprise-grade web-based safety inspection and risk management platform that helps organizations:

- **Conduct systematic equipment inspections** using dynamic, equipment-type-specific checklists
- **Assess chemical hazards** using industry-standard methodologies (Dow F&EI, Toxic Load Analysis)
- **Evaluate equipment condition** with multi-factor scoring algorithms
- **Manage NH₃ (ammonia) safety** with specialized dispersion modeling, LOPA/SIL analysis, and incident tracking
- **Track inspection history** and generate audit-ready reports
- **Identify risk hotspots** through prioritization algorithms

## Key Features

- 🔐 Secure authentication with role-based access control
- 📋 Dynamic equipment-type-specific inspection checklists  
- 🏭 Multi-facility inventory management
- 🧪 Chemical hazard assessment (Dow F&EI, Toxic Load)
- 📊 Industry-standard risk assessment algorithms
- 🔬 Ammonia (NH₃) safety module with dispersion modeling & LOPA analysis
- 📈 Historical tracking and trend analysis
- 📱 Responsive design for desktop/mobile/tablet

## Tech Stack

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui  
**Backend:** Supabase (PostgreSQL, Auth, RLS)  
**APIs:** React Query, React Hook Form, Recharts  
**Deployment:** Vercel/Netlify ready

## Project Structure

```
src/
├── components/       # React components + shadcn/ui
├── pages/           # Page-level components (Dashboard, Inspections, etc.)
├── hooks/           # Custom React hooks (useAuth, useToast)
├── lib/             # Business logic (equipmentCondition, riskCalculations)
└── integrations/    # Supabase client & types
```

## Database

PostgreSQL via Supabase with Row-Level Security (RLS) for multi-tenant access control. Tables include:
- Users (via Supabase Auth)
- Equipment & Inspections
- Chemicals & Risk Assessments
- NH₃ Module: LOPA scenarios, checklists, incidents

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Run ESLint
npm run test         # Run tests (Vitest)
npm run test:watch   # Tests in watch mode
npm run preview      # Preview production build
```

## Algorithms Implemented

| Algorithm | Purpose | Standard |
|-----------|---------|----------|
| **4-Factor Condition Scoring** | Equipment condition assessment | Custom (equipment-type specific) |
| **Dow Fire & Explosion Index** | Chemical hazard quantification | AIChE (1994) |
| **Toxic Load Analysis** | Inhalation hazard evaluation | NIOSH/OSHA |
| **Gaussian Dispersion Modeling** | Toxic release simulation | EPA ALOHA equivalent |
| **LOPA/SIL Analysis** | Layer of protection quantification | IEC 61511 |

## Documentation

📚 **[PROJECT_COMPLETE_DOCUMENTATION.md](PROJECT_COMPLETE_DOCUMENTATION.md)** - Complete reference with:
- Detailed feature descriptions
- Algorithm documentation with formulas
- API endpoints and integration patterns
- Database schema with RLS policies
- Installation & deployment guides
- Development workflow & best practices
- Performance optimization strategies
- Future roadmap and scalability plans

## License

Proprietary - SafetyPro Project

## Support

For issues, feature requests, or support: [GitHub Issues] or contact the development team.
