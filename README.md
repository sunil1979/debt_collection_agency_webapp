# Debt Collection Agency Webapp

This is a web application for a debt collection agency, built with Next.js and MongoDB.

## Design

The application will have the following components:

*   **Dashboard:** The main entry point of the application, providing navigation to other sections.
*   **Customers Page:** This page will display a list of all customers from the MongoDB database. It will allow the user to:
    *   View a list of customers.
    *   Click on a customer to view their details.
    *   Edit a customer's information.
    *   Perform actions on one or more customers.
*   **Customer Details Page:** This page will display the detailed information of a selected customer.
*   **Customer Edit Page:** This page will provide a form to edit the details of a customer.

## Running the App

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Run the development server:**
    ```bash
    npm run dev
    ```
3.  **Open your browser** to [http://localhost:3000](http://localhost:3000) to see the application.

## MongoDB Connection

The application connects to a MongoDB database at the following URL: `mongodb://adminuser:password123@localhost:32000/?authSource=admin`
