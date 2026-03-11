# AllowManagement - Domain Review Demo

This application is a demo for managing domain permissions based on workspace data.

## Getting Started

1. **Server**: Navigate to `server/` and run `node index.js`. (API runs on http://localhost:5000)
2. **Client**: Navigate to `client/` and run `npm run dev`. (UI runs on http://localhost:3000)

## Features

- **3-Column Domain Management**: Easily move domains between 'Allowed', 'Not Reviewed', and 'Not Allowed' using arrow buttons.
- **Material Dark UI**: A modern, user-friendly interface using Material UI with a deep dark theme.
- **Workspaces Download**: View a filtered list of workspaces that contain domains currently being reviewed (Allowed/Not Allowed).
- **Email Template**: Configure a reusable email template for domain reviews.
- **Send Emails Now**: Generate a mockup email for a random workspace based on the configured template.
- **Refresh**: Repopulate the 'Not Reviewed' column from the latest CSV data.

## Tech Stack

- **Backend**: Node.js, Express, CSV-Parser
- **Frontend**: React, TypeScript, Vite, Material UI, Framer Motion
