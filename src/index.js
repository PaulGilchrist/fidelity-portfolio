import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { utilities } from './utilities';

// Get initialState
let initialPortfolio = null;
const portfolioJson = localStorage.getItem('portfolio');
if(portfolioJson) {
    initialPortfolio = utilities.jsonParseNumbers(portfolioJson);
} else {
    initialPortfolio = {
        currentValue: 0,
        portfolioOverviewFileDate: null,
        screenFileDate: null,
        sectors: [],
        stocks: []
    };
}

let initialScoringRules = null;
const scoringRulesJson = localStorage.getItem('scoringRules');
if(scoringRulesJson) {
    initialScoringRules = utilities.jsonParseNumbers(scoringRulesJson);
} else {
    initialScoringRules = {
        dividendPayoutPercentage: { highValueBetter: false, min: 0.35, max: 0.6, weight: 3 },
        dividendYieldPercentage: { highValueBetter: true, min: 0.015, max: 0.025, weight: 3 },
        industryPercentage: { highValueBetter: false, min: 0.02, max: 0.05, weight: 2 },
        overallScore: { highValueBetter: true, min: 0, max: 8 }, // Summation of all the other scores with min/max used only for highlighting chart
        priceEarningsRatio: { highValueBetter: false, min: 16, max: 25, weight: 3 },
        sectorPercentage: { highValueBetter: false, min: 0.1, max: 0.2, weight: 1 },
        stockPercentage: { highValueBetter: false, min: 0.02, max: 0.05, weight: 3 },
        summaryScore: { weight: 3 } // Neutral will be 0 and each rating above adds 'weight' and below subtracts 'weight'
    };
}

// Setup UI
const container = document.getElementById('root');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(
    <React.StrictMode>
        <App initialPortfolio={initialPortfolio} initialScoringRules={initialScoringRules}/>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
