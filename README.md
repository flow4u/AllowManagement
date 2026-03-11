# AllowManagement Demo Application

A modern, premium domain management dashboard built with React (Vite) and Node.js (Express). This application allows for efficient categorization and review of workspace-related domains.

## Key Features

### 🚀 Modern 3-Column Dashboard
- **Categorization**: Move domains between `<domains allowed>`, `<all domains not reviewed>`, and `<domains not allowed>`.
- **Intuitive UI**: Drag-and-drop-like functionality using simple arrow controls.
- **Manual Addition**: Add domains directly to Allowed or Not Allowed lists.

### 📝 Edit Domains View (Focused Mode)
- **Dedicated Page**: A premium, focused view for auditing domains record-by-record.
- **Record Navigation**: Cycle through all workspaces from the source CSV using navigation arrows.
- **Status-Based Coloring**:
  - 🟢 **Green**: Allowed
  - 🟠 **Orange**: Not Reviewed
  - 🔴 **Not Allowed**
- **Safety Workflow**: Includes mandatory consent checkbox and warning summaries.

### 📧 Persistent Email Workflows
- **Custom Templates**: Separate, persistent templates for 'Not Reviewed' and 'Not Allowed' workflows.
- **Mockup Generator**: Generate live email previews using current workspace data.
- **Mockup Navigation**: Browse through all affected workspaces directly within the mockup preview.
- **Persistence**: Templates are saved to `templates.json` and survive application restarts.

### 📊 Data & Filtering
- **CSV Integration**: Loads initial data from `workspaces.csv`.
- **Smart Filtering**: "Download" lists show only workspaces relevant to the current column filter.
- **Live Refresh**: Repopulate data from source CSV on demand.

## Tech Stack
- **Frontend**: React 18, TypeScript, Material UI (Dark Theme), Vite, Axios, React Router.
- **Backend**: Node.js, Express, File System (Persistence).

## Getting Started

### Installation
1. Clone the repository.
2. Install dependencies for both client and server:
   ```bash
   # Server
   cd server && npm install
   # Client
   cd client && npm install
   ```

### Running the Application
1. Start the server:
   ```bash
   cd server && node index.js
   ```
2. Start the client:
   ```bash
   cd client && npm run dev
   ```

3. Access the application at `http://localhost:3000`.
