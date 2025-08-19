# Codebase Analysis Report

This document provides a detailed analysis of the Debt Collection Agency web application codebase.

## 1. Project Overview

The project is a web application for a debt collection agency built with Next.js. It provides functionalities for managing customers, tracking interactions, monitoring live calls, and configuring the application.

*   **Framework**: Next.js 14
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **Database**: MongoDB
*   **Real-time Communication**: LiveKit
*   **Linting**: ESLint

## 2. Architecture

The application follows a modern web architecture:

*   **Frontend**: A client-side application built with React (Next.js). It uses server components for initial data fetching and client components for interactive UI.
*   **Backend**: Implemented using Next.js API routes. These routes handle database operations, LiveKit integration, and proxying requests to an external API.
*   **Database**: MongoDB is used as the primary data store for customers, interactions, and application settings. The `mongodb` driver is used for database access.

## 3. File-by-File Analysis

### `package.json`
Defines the project's dependencies and scripts. Key dependencies include `next`, `react`, `tailwindcss`, `mongodb`, and `livekit-server-sdk`/`livekit-client`. Scripts for development (`dev`), building (`build`), and linting (`lint`) are present.

### `src/app/layout.tsx`
The root layout of the application. It wraps all pages in an `AppShell` component, which provides the main navigation structure.

### `src/app/page.tsx`
The dashboard page. It displays a high-level overview of key metrics like total outstanding debt, total customers, and recent interactions. It also provides quick links to other sections of the application.

### `src/app/components/AppShell.tsx`
A critical component that acts as the main application shell. It fetches application settings from the backend on load. If essential settings are missing, it redirects the user to the `/settings` page. Otherwise, it displays the main navigation bar.

### `src/app/api/settings/route.ts`
API route for managing application settings.
*   `GET`: Retrieves settings from the `app_settings` collection in MongoDB. It redacts the `livekit_api_secret` for security.
*   `POST`: Updates settings. It encrypts the `livekit_api_secret` before storing it in the database.

### `src/app/api/livekit/token/route.ts`
API route for generating LiveKit access tokens. It receives a `roomName` and `identity`, fetches the LiveKit API key and secret from settings, decrypts the secret, and generates a JWT with permissions to join the specified room.

### `src/app/api/livekit/rooms/route.ts`
API route to list active LiveKit rooms. It uses the `RoomServiceClient` from the LiveKit server SDK to fetch the list of rooms.

### `src/app/api/proxy/[...slug]/route.ts`
A dynamic API route that acts as a proxy to an external API. It fetches the base URL for the external API from the settings and forwards requests to it. This is used for actions like initiating calls.

### `src/app/customers/page.tsx`
The main page for the "Customers" feature. It's a server component that fetches a paginated list of customers from the database and passes them to the `CustomerTable` component.

### `src/app/customers/CustomerTable.tsx`
A client component that displays the list of customers in a table. It includes features for pagination, selecting customers, and actions for each customer (call, view history, view details, edit).

### `src/app/interactions/page.tsx`
The main page for the "Interactions" feature. It's a server component that fetches a paginated and filterable list of customer interactions from the database using a complex MongoDB aggregation pipeline.

### `src/app/interactions/InteractionsTable.tsx`
A client component that displays the list of interactions. It features expandable rows to show detailed conversation transcripts and includes pagination.

### `src/app/interactions/InteractionFilter.tsx`
A client component that provides a UI for filtering interactions by date, customer name, email, and phone number. It updates the URL with search parameters to trigger a data refetch on the server.

### `src/app/live/page.tsx`
The main page for the "Live" feature. It's a client component that displays a list of active LiveKit rooms, polling for updates every 5 seconds. It handles the logic for joining rooms in either "listen-only" or "takeover" mode.

### `src/app/live/RoomCard.tsx`
A presentational component used on the "Live" page to display information about a single LiveKit room and provide buttons to join it.

## 4. Feature Summary

*   **Dashboard**: Provides a quick overview of the agency's performance.
*   **Customers**: A complete customer relationship management (CRM) module to view and manage customer information.
*   **Interactions**: A detailed log of all customer interactions, with powerful filtering and search capabilities. This includes conversation transcripts.
*   **Live**: A real-time monitoring feature for live calls, allowing supervisors to listen in or take over calls.
*   **Settings**: A configuration page for the application, including API URLs and LiveKit credentials.

## 5. Backend API Endpoints

*   `GET /api/settings`: Get application settings.
*   `POST /api/settings`: Update application settings.
*   `POST /api/livekit/token`: Generate a LiveKit access token.
*   `GET /api/livekit/rooms`: Get a list of active LiveKit rooms.
*   `/api/proxy/[...slug]`: Proxy requests to an external API.

## 6. Data Model

The application appears to use two main MongoDB collections:

*   **`customers`**: Stores information about each customer (name, contact details, debt information).
*   **`customer_interaction`**: Stores records of all interactions with customers. This collection seems to be central, containing detailed information about each interaction, including transcripts, sentiment analysis, and agent notes.
