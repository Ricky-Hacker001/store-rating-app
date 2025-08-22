# Store Rating Full-Stack Application

This is a complete full-stack web application built with the MERN stack (MySQL, Express.js, React, Node.js). The platform allows users to register, log in, view a list of stores, and submit ratings. It features a comprehensive role-based access control system for three types of users: Normal Users, Store Owners, and System Administrators, all with professionally designed dashboards.

---
## Features

### 👤 **Normal User**

* **Modern Interface**: Sign up and log in on clean, professionally designed pages.
* **Browse & Rate**: View stores in a uniform, card-based layout. The dashboard is organized into tabs for browsing stores and managing settings.
* **Interactive Details**: Click on any store card to open a popup modal with detailed information.
* **Search & Filter**: Easily find stores using a real-time search bar.
* **Account Management**: Update their own password in a dedicated settings tab.

### 👑 **System Administrator**

* **Professional Dashboard**: A powerful, tabbed interface to manage the entire platform (Overview, Users, Stores, Settings).
* **Data at a Glance**: View key statistics on the overview tab: total users, stores, and ratings.
* **Full CRUD Functionality**:
    * **Create**: Add new users and stores through intuitive popup modals.
    * **Read**: View, filter, and search comprehensive lists of all users and stores.
    * **Update**: Edit user and store details in a popup modal.
    * **Delete**: Securely delete users and stores with a confirmation prompt.
* **Role Management**: Assign roles to new users and manage existing ones.

### 🏪 **Store Owner**

* **Dedicated Dashboard**: A clean, professional dashboard to monitor their store's performance.
* **Performance Metrics**: See their store's current average rating displayed prominently.
* **Customer Insights**: View a list of all users who have submitted a rating for their specific store.
* **Account Management**: Update their own password.

---
## Tech Stack

* **Frontend**: React.js, Material-UI (MUI), Axios
* **Backend**: Node.js, Express.js
* **Database**: MySQL
* **Authentication**: JSON Web Tokens (JWT), bcrypt

---
## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing.

### Prerequisites

* Node.js (v14 or later)
* npm (v6 or later)
* MySQL Server

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Ricky-Hacker001/store-rating-app.git
    cd store-rating-app
    ```

2.  **Backend Setup:**
    ```bash
    cd backend
    npm install
    ```
    Create a `.env` file in the `backend` directory and add your database credentials and JWT secret:
    ```dotenv
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your_mysql_password
    DB_NAME=rating_system_db
    JWT_SECRET=a_very_long_and_secure_secret_key
    ```
    Start the backend server:
    ```bash
    npm start
    ```
    The server will be running on `http://localhost:5001`.

3.  **Frontend Setup:**
    Open a new terminal window.
    ```bash
    cd frontend
    npm install
    ```
    Start the frontend development server:
    ```bash
    npm start
    ```
    The application will be available at `http://localhost:3000`.

4.  **Database Setup:**
    * Connect to your MySQL instance.
    * Create a new database named `rating_system_db`.
    * Execute the SQL script provided during development to create the necessary tables (`users`, `stores`, `ratings`).

---
## Future Improvements

* **Table Sorting**: Add clickable headers to all tables for ascending/descending sorting.
* **Pagination**: Implement pagination for user and store lists to handle large datasets efficiently.
* **Advanced Analytics**: Enhance the admin and store owner dashboards with charts and graphs for visual data representation.
* **Testing**: Write unit and integration tests using a framework like Jest to ensure code quality and reliability.
