# iNotebook Frontend

React-based frontend for the **iNotebook** secure note‑taking application.  
This SPA (single-page application) provides the user interface for authentication, managing notes, and working with profile data, and communicates with a Django REST API backend.

---

## Features

- **User authentication**: Signup, login, logout, and protected routes.
- **Secure note management**: Notes are stored and fetched from a Django backend.
- **Create, edit, delete notes** with a simple and intuitive UI.
- **Search notes** to quickly find content.
- **Profile management**: View account details and change password.
- **Password visibility toggle** with eye icons on password fields.
- **Responsive Bootstrap UI** that works across desktop and mobile.
- **Integration with Django REST API** via the Fetch API.
- **Client-side state management** with the React Context API.

---

## Tech Stack

- **React** (with functional components and hooks)
- **Vite** (for fast development and bundling)
- **Bootstrap** (layout, grid system, and form styling)
- **Bootstrap Icons** (icons for UI elements like password visibility)
- **Context API** (global state for auth and/or notes)
- **JavaScript (ES6+)**

---

## Project Structure

High-level structure of the frontend:

```text
frontend
│
├── public
├── src
│   ├── components
│   ├── context
│   ├── pages
│   ├── App.jsx
│   ├── main.jsx
│
├── package.json
└── vite.config.js
```

### Folder overview

- **`public`**: Static assets that may be served directly by Vite (favicons, static images, etc.).
- **`src/components`**: Reusable React components such as forms, layout elements, and UI widgets.
- **`src/context`**: Context providers and hooks for shared state (e.g. authentication, notes).
- **`src/pages`**: Page-level components such as Login, Signup, Notes Dashboard, and Profile.
- **`src/App.jsx`**: Root application component that defines routes and layout.
- **`src/main.jsx`**: Vite entry point that mounts the React app and wires global styles.
- **`package.json`**: Project metadata, scripts, and npm dependency list.
- **`vite.config.js`**: Vite configuration (aliases, dev server options, build settings, etc.).

---

## Clone the Repository

First, clone the project from GitHub to your local machine.

```bash
git clone https://github.com/jenitlalshakya/inotebook.git
```

## Installation

From the `frontend` directory, install the dependencies:

```bash
npm install
```

Make sure you have **Node.js** and **npm** installed on your system.

---

## Running the Development Server

To start the Vite development server:

```bash
npm run dev
```

By default, the app will be available at:

```text
http://localhost:5173
```

Open this URL in your browser to access the iNotebook frontend.

---

## Backend Requirement

This frontend expects the **Django backend API** for iNotebook to be running.

A typical local development URL is:

```text
http://127.0.0.1:8000
```

Make sure:

- The backend server is running.
- CORS is configured to allow requests from the frontend origin (e.g. `http://localhost:5173`).
- Environment variables (see below) point the frontend to the correct backend base URL.

---

## Environment Setup (Optional)

The frontend can be configured to talk to different backend environments (local, staging, production) using environment variables.

Typical setup with Vite:

- Create a `.env` file in the `frontend` directory (not committed to version control).
- Define the backend base URL, for example:

```env
VITE_BACKEND_URL=http://127.0.0.1:8000
```

Components that call the API can then read this value via `import.meta.env.VITE_BACKEND_URL`.  
If the variable is not set, code may fall back to a sane default (such as `http://localhost:8000`).

---

## Notes on Forms and UI

- All inputs use Bootstrap’s `form-control` classes for consistent styling.
- Password fields include a **password visibility toggle** implemented with Bootstrap input groups and **Bootstrap Icons**.
- The app is intended to be responsive and usable on both desktop and mobile devices thanks to Bootstrap’s grid and utility classes.

---

## Future Improvements

Potential enhancements for the iNotebook frontend:

- **Dark mode** / theme switcher.
- **Advanced search and filters** (by tags, date ranges, content type).
- **Improved UI/UX** with refined layouts and animations.
- **Note tagging system** for better organization.
- **In-app notifications** (e.g. for sync status, errors, and updates).
- **Offline support** and local caching for notes.

---

## Author

**Author:** Jenit Lal Shakya

If you find this project useful, feel free to star it on GitHub or open issues/PRs with suggestions and improvements.
