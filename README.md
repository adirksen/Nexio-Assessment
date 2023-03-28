# Nexio Express Payment App

This is a simple Express app that allows users to process payments and fetch transactions using Nexio's APIs. The app is built using Node.js and the Express framework.

## Features

1. An endpoint to process a card payment through Nexio's processing API.
2. An endpoint to fetch transactions from Nexio's transactions API.

## Prerequisites

Before you begin, make sure you have the following installed:

- Node.js (version 14.x or higher)
- npm (version 6.x or higher)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/adirksen/Nexio-Assessment.git
```

2. Change to the project directory:

```bash
cd Nexio-Assessment
```

3. Install the required dependencies:

```console
npm install
```

4. Create a `.env` file in the project root directory, and add the following environment variables:

```makefile
NEXIO_API_USER=your_nexio_user
NEXIO_API_KEY=your_nexio_api_key
NEXIO_API_BASE_URL=https://api.nexiopaysandbox.com
PORT=3000
```

replace `your_nexio_api_key` with your actual Nexio API key.
replace `your_nexio_user` with your actual Nexio API user identifier.

## Usage

1. Start the server:

```console
npm start
```

The server will be running at `http://localhost:3000`.

2.  Use the following endpoints:

* Process a payment:
    ```
    POST http://localhost:3000/api/payment
    ```

    Request body example:
    ```
    {
        "amount": 10,
        "currency": "USD",
        "expirationMonth": "12",
        "expirationYear": "28",
        "cardType": "amex",
        "cardHolderName": "John H Doe",
        "securityCode": "927", 
        "cardNumber": "4111111111111111"
    }
    ```

* Fetch transactions (Example):
    ```
        GET http://localhost:3000/api/transactions?startDate=2023-01-01&endDate=2023-12-31
    ```
