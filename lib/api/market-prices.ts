import axios from 'axios';

// API documentation: https://data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi
// API Base URL format: https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070

const API_KEY = process.env.DATA_GOV_API_KEY || process.env.NEXT_PUBLIC_DATA_GOV_API_KEY;
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

// Fallback mock data when API key is missing or fails
const MOCK_DATA: MandiPrice[] = [
    { state: "Tamil Nadu", district: "Chennai", market: "Koyambedu", commodity: "Rice", variety: "Ponni", grade: "FAQ", arrival_date: new Date().toLocaleDateString(), min_price: "4500", max_price: "5200", modal_price: "4850" },
    { state: "Punjab", district: "Ludhiana", market: "Ludhiana", commodity: "Wheat", variety: "Kalyan", grade: "FAQ", arrival_date: new Date().toLocaleDateString(), min_price: "2100", max_price: "2400", modal_price: "2275" },
    { state: "Maharashtra", district: "Nagpur", market: "Nagpur", commodity: "Cotton", variety: "H-4", grade: "FAQ", arrival_date: new Date().toLocaleDateString(), min_price: "6200", max_price: "7500", modal_price: "6800" },
    { state: "Karnataka", district: "Bangalore", market: "Bangalore", commodity: "Tomato", variety: "Local", grade: "FAQ", arrival_date: new Date().toLocaleDateString(), min_price: "1500", max_price: "2500", modal_price: "2000" },
    { state: "Tamil Nadu", district: "Madurai", market: "Madurai", commodity: "Paddy(Dhan)", variety: "Common", grade: "FAQ", arrival_date: new Date().toLocaleDateString(), min_price: "1800", max_price: "2200", modal_price: "2050" },
    { state: "Maharashtra", district: "Pune", market: "Pune", commodity: "Onion", variety: "Red", grade: "FAQ", arrival_date: new Date().toLocaleDateString(), min_price: "1200", max_price: "1800", modal_price: "1500" },
    { state: "Gujarat", district: "Rajkot", market: "Rajkot", commodity: "Groundnut", variety: "Bold", grade: "FAQ", arrival_date: new Date().toLocaleDateString(), min_price: "5500", max_price: "6500", modal_price: "6000" },
    { state: "Rajasthan", district: "Jaipur", market: "Jaipur", commodity: "Mustard", variety: "FAQ", grade: "FAQ", arrival_date: new Date().toLocaleDateString(), min_price: "4800", max_price: "5400", modal_price: "5100" },
];

export async function fetchMandiPrices(limit = 100, offset = 0, filters: Record<string, string> = {}): Promise<MandiPrice[]> {
    try {
        if (!API_KEY) {
            console.warn("DATA_GOV_API_KEY is missing. Using high-quality mock data.");
            return MOCK_DATA; 
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
