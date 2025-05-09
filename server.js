const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 9876;

// Constants
const WINDOW_SIZE = 10;
const BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ2ODAyNzk1LCJpYXQiOjE3NDY4MDI0OTUsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImQxYjFlNjI1LWU1NDItNGUwYi04NGJlLWM4MzMyOGNkYjA3MSIsInN1YiI6ImFybWFuLjIyMjZjczEwMjFAa2lldC5lZHUifSwiZW1haWwiOiJhcm1hbi4yMjI2Y3MxMDIxQGtpZXQuZWR1IiwibmFtZSI6ImFybWFuIGFobWFkIiwicm9sbE5vIjoiMjIwMDI5MDEyMDA1MCIsImFjY2Vzc0NvZGUiOiJTeFZlamEiLCJjbGllbnRJRCI6ImQxYjFlNjI1LWU1NDItNGUwYi04NGJlLWM4MzMyOGNkYjA3MSIsImNsaWVudFNlY3JldCI6ImtHbUNNRXpwcVJwZXlZWXoifQ.pIjR1tzs_o3GRHW3sg2aQyEoAFw0KEGzktOBECHeUfQ';
const TEST_SERVER_BASE_URL = 'http://20.244.56.144/evaluation-service';

// Storage for numbers
let numberWindow = [];

app.use(express.json());

// Fetch numbers from third-party API
async function fetchNumbersFromServer(numberType) {
    const typeToPath = {
        'p': '/primes',
        'f': '/fibo',
        'e': '/even',
        'r': '/rand',
    };

    const path = typeToPath[numberType];
    if (!path) {
        console.error('Invalid number type for fetching:', numberType);
        return [];
    }

    const url = `${TEST_SERVER_BASE_URL}${path}`;
    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${BEARER_TOKEN}`,
            },
            timeout: 450, // setting timeout for quick failure
        });

        if (response.data && Array.isArray(response.data.numbers)) {
            return response.data.numbers;
        }
        return [];
    } catch (error) {
        if (error.response && error.response.status === 503) {
            console.error(`503 Service Unavailable: ${url}`);
        } else if (axios.isCancel(error)) {
            console.error(`Request to ${url} was canceled: ${error.message}`);
        } else if (error.response) {
            console.error(
                `Error fetching numbers from ${url}: Status ${error.response.status}`,
                error.response.data
            );
        } else if (error.request) {
            console.error(`No response received from ${url}:`, error.request);
        } else {
            console.error(`Error setting up the request to ${url}:`, error.message);
        }
        return [];
    }
}


// Health Check
app.get('/', (req, res) => {
    res.send('✅ Average Calculator Microservice is running!');
});

// Main API
app.get('/numbers/:numberid', async (req, res) => {
    const { numberid } = req.params;
    const validIds = ['p', 'f', 'e', 'r'];

    if (!validIds.includes(numberid)) {
        return res
            .status(400)
            .json({ error: "Invalid number ID. Must be 'p', 'f', 'e', or 'r'." });
    }

    const requestStartTime = Date.now();
    const windowPrevState = [...numberWindow];

    const fetchedNumbers = await fetchNumbersFromServer(numberid);

    if (fetchedNumbers && fetchedNumbers.length > 0) {
        const uniqueNumbersFromFetch = [...new Set(fetchedNumbers)];

        uniqueNumbersFromFetch.forEach((num) => {
            if (!numberWindow.includes(num)) {
                if (numberWindow.length >= WINDOW_SIZE) {
                    numberWindow.shift(); // Remove oldest
                }
                numberWindow.push(num); // Add newest
            }
        });
    }

    let avg = 0;
    if (numberWindow.length > 0) {
        const sum = numberWindow.reduce((acc, curr) => acc + curr, 0);
        avg = sum / numberWindow.length;
    }

    const windowCurrState = [...numberWindow];
    const responseJson = {
        windowPrevState,
        windowCurrState,
        numbers: fetchedNumbers,
        avg: parseFloat(avg.toFixed(2)),
    };

    const requestEndTime = Date.now();
    const duration = requestEndTime - requestStartTime;
    console.log(`Processed /numbers/${numberid} in ${duration}ms.`);

    if (duration > 500) {
        console.warn(`⚠️ WARNING: Response for ${numberid} took ${duration}ms.`);
    }

    return res.json(responseJson);
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
