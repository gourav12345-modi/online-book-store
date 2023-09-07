# Online Bookstore API

This is the backend API for an online bookstore. The API allows users to browse and search for books, view book details, add books to their cart, place orders, and more. It includes user authentication, input validation, and security measures.

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Testing](#testing)
- [Documentation](#documentation)

## Getting Started

Follow these instructions to set up and run the API locally.

### Prerequisites

Before you begin, make sure you have the following installed on your system:

- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)

### Installation

1. Clone this repository to your local machine:

    ```shell
    git clone <repository-url>
2. Navigate to the project directory:

    ```shell
    cd online-bookstore-api
3. Install the project dependencies:

    ```shell
    npm install
4. Create a .env file in the project root and add the following configuration:
    ```
    PORT=3000
    MONGODB_URI=<your-mongodb-uri>
    JWT_SECRET=<your-secret-key>
    ```
    Replace `<your-mongodb-uri>` with your MongoDB connection URI and `<your-secret-key>` with a secret key for JWT token generation.

### Testing
To run the tests, use the following command:
  ```shell
  npm test
  ```

### Documentation
API documentation is available using Swagger. Start the API server and navigate to http://localhost:3000/api-docs in your web browser to access the Swagger UI.
