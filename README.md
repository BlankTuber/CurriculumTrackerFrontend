# Curriculum Tracker Frontend

A React-based frontend application for the Curriculum Tracker API. This application allows users to manage their learning curricula, track projects, and take notes on their educational journey.

## Features

### Authentication

-   User registration and login
-   Session-based authentication
-   Profile management (update username/password)
-   Account deletion

### Curriculum Management

-   Create, view, edit, and delete curricula
-   Add descriptions to curricula
-   Manage curriculum resources (links to documentation, videos, articles, etc.)

### Project Management

-   Create projects within curricula
-   Link GitHub repositories
-   Add project-specific resources
-   Edit and delete projects

### Note Taking

-   Add notes to projects with different types:
    -   Reflection
    -   Todo
    -   Idea
    -   Bug
    -   Improvement
    -   Question
    -   Achievement
    -   Other
-   View notes chronologically
-   Delete notes

### Resource Management

-   Add various types of resources:
    -   Documentation
    -   Theory
    -   Books
    -   Online resources
    -   Videos
    -   Tutorials
    -   Articles
    -   Other
-   Manage resources at both curriculum and project levels

## Tech Stack

-   **React 18.3.1** - Frontend framework
-   **React Router 6.24.0** - Client-side routing
-   **Vite 5.3.1** - Build tool and dev server
-   **Vanilla CSS** - Styling (no external CSS frameworks)

## Prerequisites

-   Node.js (version 16 or higher)
-   npm or yarn
-   Curriculum Tracker API running on `http://localhost:3000`

## Installation

1. Clone or download the project files
2. Install dependencies:
    ```bash
    npm install
    ```

## Development

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Build

To build for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/          # Reusable React components
│   ├── Header.jsx      # Application header with navigation
│   ├── LoadingSpinner.jsx  # Loading indicator
│   ├── Modal.jsx       # Modal dialog component
│   ├── CurriculumForm.jsx  # Form for creating/editing curricula
│   ├── ProjectForm.jsx # Form for creating/editing projects
│   ├── ResourceForm.jsx    # Form for creating/editing resources
│   └── NoteForm.jsx    # Form for creating/editing notes
├── contexts/           # React contexts
│   └── AuthContext.jsx    # Authentication state management
├── pages/              # Page components
│   ├── Login.jsx       # Login page
│   ├── Register.jsx    # Registration page
│   ├── Dashboard.jsx   # Main dashboard with curricula list
│   ├── CurriculumDetail.jsx   # Individual curriculum view
│   ├── ProjectDetail.jsx      # Individual project view
│   └── UserProfile.jsx        # User profile management
├── styles/             # CSS files
│   └── index.css       # Global styles and CSS variables
├── utils/              # Utility functions
│   └── api.js          # API interaction functions
├── App.jsx             # Main app component with routing
└── main.jsx            # Application entry point
```

## API Integration

The frontend communicates with the Curriculum Tracker API running on `http://localhost:3000`. All API requests include session cookies for authentication.

### API Endpoints Used

-   **User Management**: Registration, login, profile updates, account deletion
-   **Curriculum Management**: CRUD operations for curricula and their resources
-   **Project Management**: CRUD operations for projects and their resources
-   **Note Management**: CRUD operations for project notes

## Styling

The application uses a dark theme optimized for desktop/landscape orientation with:

-   Dark background colors for reduced eye strain
-   Consistent color scheme using CSS variables
-   Responsive grid layouts
-   Accessible contrast ratios
-   Smooth transitions and hover effects

### Color Scheme

-   **Primary Background**: `#0f1419`
-   **Secondary Background**: `#1a1f2e`
-   **Tertiary Background**: `#242938`
-   **Primary Text**: `#e6e6e6`
-   **Accent Color**: `#64b5f6`
-   **Success**: `#4caf50`
-   **Warning**: `#ff9800`
-   **Error**: `#f44336`

## Key Features

### Session Management

-   Automatic authentication checking on app load
-   Persistent login sessions via cookies
-   Automatic logout on session expiry

### Form Validation

-   Client-side validation for all forms
-   Real-time error display
-   Proper URL validation for resource links
-   GitHub URL validation for project links

### Navigation

-   Protected routes requiring authentication
-   Breadcrumb navigation
-   Back navigation between related pages

### Responsive Design

-   Grid layouts that adapt to screen size
-   Mobile-friendly modal dialogs
-   Flexible button groups

## Configuration

The API base URL is configured in `src/utils/api.js`. Update this if your API is running on a different port or domain:

```javascript
const API_BASE_URL = "http://localhost:3000/api";
```

## Browser Support

This application uses modern JavaScript features and requires:

-   Chrome 88+
-   Firefox 78+
-   Safari 14+
-   Edge 88+

## Known Limitations

-   Designed primarily for desktop use (landscape orientation)
-   Requires JavaScript enabled
-   No offline functionality
-   Single-user session management

## Contributing

This is a private-use application. The codebase follows React best practices with:

-   Functional components and hooks
-   Context for state management
-   Proper error handling
-   Accessible markup
-   Semantic HTML structure

## License

Private use only.
