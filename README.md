# Average Calculator Microservice
This is a Node.js microservice that calculates the average of numbers fetched from a third-party API based on specific number IDs. The service exposes a REST API to interact with and allows fetching numbers of different types (Prime, Fibonacci, Even, and Random) and calculating their average.

Table of Contents
Installation

Usage

API Endpoints

Error Handling

License

Installation
Clone the repository:

bash
Copy
Edit
git clone https://github.com/arm4nahmad/average-calculator-service.git
cd average-calculator-service
Install the required dependencies:

bash
Copy
Edit
npm install
Usage
Set your Bearer Token (for authentication with the third-party API) in the BEARER_TOKEN variable in the code.

To start the service, run:

bash
Copy
Edit
npm start
This will start the server on port 9876 by default.

You can access the service at: http://localhost:9876

API Endpoints
1. GET /
Description: A simple endpoint to check if the microservice is running.

Response:

json
Copy
Edit
"Average Calculator Microservice is running!"
2. GET /numbers/:numberid
Description: This endpoint accepts a valid number ID (p, f, e, or r) as a parameter. It fetches numbers from a third-party API, processes them, stores them in a window of size 10, and returns the previous and current state of the window, the fetched numbers, and their average.

URL Parameter: :numberid

p: Prime numbers

f: Fibonacci numbers

e: Even numbers

r: Random numbers

Response Format:

json
Copy
Edit
{
    "windowPrevState": [previous numbers in window],
    "windowCurrState": [current numbers in window],
    "numbers": [numbers fetched from third-party server],
    "avg": 4.00 // average of numbers in window
}
Example Requests:

Fetch even numbers:

bash
Copy
Edit
GET http://localhost:9876/numbers/e
Fetch prime numbers:

bash
Copy
Edit
GET http://localhost:9876/numbers/p
Fetch Fibonacci numbers:

bash
Copy
Edit
GET http://localhost:9876/numbers/f
Fetch random numbers:

bash
Copy
Edit
GET http://localhost:9876/numbers/r
Response Example:

json
Copy
Edit
{
    "windowPrevState": [],
    "windowCurrState": [2, 4, 6, 8],
    "numbers": [2, 4, 6, 8],
    "avg": 5.00
}
Error Handling
Invalid numberid: If an invalid numberid is passed (other than p, f, e, or r), the service will return a 400 Bad Request error with a descriptive message.

json
Copy
Edit
{
    "error": "Invalid number ID. Must be 'p', 'f', 'e', or 'r'."
}
503 Service Unavailable: If the third-party service is unavailable or unreachable, the service will return a 503 error with a message indicating that the third-party service is unavailable.

json
Copy
Edit
{
    "error": "503 Service Unavailable. Unable to fetch numbers."
}
Timeout Error: If the third-party API takes longer than 500ms to respond, it will be ignored, and the service will continue to process the next request.

License
This project is licensed under the MIT License - see the LICENSE file for details.
