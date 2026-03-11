# Design Decisions - AllowManagement

## visual Identity
- **Material Dark Theme**: Used a deep palette (`#0a1929`) to create a professional, "admin-dashboard" feel that is easy on the eyes.
- **Premium UX**: Leveraged Material UI's `Paper` and `Elevation` to create distinct sections. Added `Inter` font for a modern typographic feel.
- **Interactive Elements**: Used `IconButton` with intuitive icons (ArrowForward, ArrowBack) for moving domains, providing immediate visual feedback.

## Architecture
- **Simplified Server**: Used a single Express file for the demo to minimize complexity while providing robust CSV parsing.
- **In-Memory State**: Domain classifications are stored in memory on the server for the demo. In a production app, this would be backed by a database.
- **Vite/React**: Chosen for the fastest development cycle and modern component-based architecture.

## Functional Choices
- **Fuzzy Refresh**: The "Refresh" action reloading the CSV allows the user to simulate real-time data updates.
- **Popup Logic**: Dialogs are used for actions like "Download" and "Email Template" to keep the main view focused on the domain review task.
