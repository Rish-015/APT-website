import axios from 'axios';

// API documentation: https://data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi
// API Base URL format: https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070

const API_KEY = process.env.NEXT_PUBLIC_DATA_GOV_API_KEY;
const RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070'; // The Agmarknet Mandi Price dataset ID
const BASE_URL = `https://api.data.gov.in/resource/${RESOURCE_ID}`;

export interface MandiPrice {
    state: string;
    district: string;
    market: string;
    commodity: string;
    variety: string;
    grade: string;
    arrival_date: string;
    min_price: string;
    max_price: string;
    modal_price: string;
}

export async function fetchMandiPrices(limit = 100, offset = 0, filters: Record<string, string> = {}): Promise<MandiPrice[]> {
    try {
        if (!API_KEY) {
            console.warn("DATA_GOV_API_KEY is missing. Using fallback mock data.");
            return []; // Return empty or mock data when no key exists
        }

        const params = new URLSearchParams({
            'api-key': API_KEY,
            'format': 'json',
            'limit': limit.toString(),
            'offset': offset.toString(),
        });

        // Add any specific filters (like State or Commodity)
        Object.entries(filters).forEach(([key, value]) => {
            params.append(`filters[${key}]`, value);
        });

        const response = await axios.get(`${BASE_URL}?${params.toString()}`);

        if (response.data && response.data.records) {
            return response.data.records as MandiPrice[];
        }

        return [];
    } catch (error) {
        console.error("Error fetching Mandi prices:", error);
        return [];
    }
}
