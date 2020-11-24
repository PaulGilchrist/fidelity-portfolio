import { createSlice } from '@reduxjs/toolkit';
import { utilities } from './utilities';

/*
portfolio = {
    currentValue: number,
    sectors: [
        {
            name: string,
            currentValue: number,
            industries: [
                {
                    name: string,
                    currentValue: number
                }
            ]
        }
    ],
    stocks: [
        {
            costBasis: number,
            currentValue: number,
            description: string
            dividendPerShare: number,
            dividendRatio: number,
            dividendYieldPercent: number,
            earningsPerShare: number,
            industry: string,
            industryPercentage: number,
            lastPrice: number,
            priceEarningsRatio: number,
            quantity: number,
            score: number,
            sector: string,
            sectorPercentage: number,
            stockPercentage: number,
            summaryScore: string,
            symbol: string
        }
    ]
},
scoringRules: {
    dividendPayoutPercentage: { highValueBetter: boolean, min: number, max: number, weight: number },
    dividendYieldPercentage { highValueBetter: boolean, min: number, max: number, weight: number },
    industryPercentage: { highValueBetter: boolean, min: number, max: number, weight: number },
    priceEarningsRatio: { highValueBetter: boolean, min: number, max: number, weight: number },
    sectorPercentage: { highValueBetter: boolean, min: number, max: number, weight: number },
    stockPercentage: { highValueBetter: boolean, min: number, max: number, weight: number },
    summaryScore: { weight: number }, // Neutral will be 0 and each rating above adds 'weight' and below subtracts 'weight'
}
*/

// Get initialState
let initialPortfolio = null;
const portfolioJson = localStorage.getItem('portfolio');
if(portfolioJson) {
    initialPortfolio = utilities.jsonParseNumbers(portfolioJson);
} else {
    initialPortfolio = {
        currentValue: 0,
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
        dividendPayoutPercentage: { highValueBetter: false, min: 0.35, max: 0.6, weight: 2 },
        dividendYieldPercentage: { highValueBetter: true, min: 0.015, max: 0.025, weight: 1 },
        industryPercentage: { highValueBetter: false, min: 0.002, max: 0.008, weight: 1 },
        overallScore: { highValueBetter: true, min: 0, max: 3 }, // Summation of all the other scores with min/max used only for highlighting chart
        priceEarningsRatio: { highValueBetter: false, min: 16, max: 25, weight: 2 },
        sectorPercentage: { highValueBetter: false, min: 0.02, max: 0.04, weight: 1 },
        stockPercentage: { highValueBetter: false, min: 0.002, max: 0.005, weight: 1 },
        summaryScore: { weight: 1 } // Neutral will be 0 and each rating above adds 'weight' and below subtracts 'weight'
    };
}

////////////////////////////////////////////////////////////////////////////////////////////
// Use createAsyncThunk() if adding any async side effects to a reducer
// https://redux-toolkit.js.org/api/createAsyncThunk
////////////////////////////////////////////////////////////////////////////////////////////

export const appSlice = createSlice({
  name: 'app',
  initialState: {
    portfolio: initialPortfolio,
    scoringRules: initialScoringRules
  },
  reducers: {
    // Redux Toolkit allows us to write "mutating" logic in reducers. It
    // doesn't actually mutate the state because it uses the Inner library,
    // which detects changes to a "draft state" and produces a brand new
    // immutable state based off those changes
    updatePortfolio: (state, action) => {
        // action must pass portfolio
        state.portfolio = action.payload;
        localStorage.setItem('portfolio', JSON.stringify(state.portfolio));
    },
    updateScoringRules: (state, action) => {
        // action must pass scoringRules
        state.scoringRules = action.payload;
        localStorage.setItem('scoringRules', JSON.stringify(state.scoringRules));
    },

    // deleteStock: (state, action) => {
    //     // action must pass stock
    //     let stock = action.payload;
    //     const stockIndex = state.portfolio.stocks.findIndex((s) => s.symbol===stock.symbol);
    //     if(stockIndex !== -1) {                    
    //         state.portfolio.stocks = state.portfolio.stocks.splice(stockIndex, 1);
    //         localStorage.setItem('portfolio', JSON.stringify(state.portfolio));
    //     }
    // },
    // insertStock: (state, action) => {
    //     // action must pass stock
    //     let stock = action.payload;
    //     state.portfolio.stocks.push(stock);
    //     utilities.sort(state.portfolio.stocks, 'symbol');
    //     localStorage.setItem('portfolio', JSON.stringify(state.portfolio));
    // },
    // updateStock: (state, action) => {
    //     // action must pass stock
    //     let stock = action.payload;
    //     const stockIndex = state.portfolio.stocks.findIndex((s) => s.symbol===stock.symbol);
    //     if(stockIndex !== -1) {
    //         state.portfolio.stocks[stockIndex] = stock;
    //         localStorage.setItem('portfolio', JSON.stringify(state.portfolio));
    //     }
    // }
  }
});

export const {
    updatePortfolio,
    updateScoringRules
    // deleteStock,
    // insertStock,
    // updateStock
 } = appSlice.actions;

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched
// export const incrementAsync = amount => dispatch => {
//   setTimeout(() => {
//     dispatch(incrementByAmount(amount));
//   }, 1000);
// };

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`
export const selectorPortfolio = state => state.app.portfolio;
export const selectorScoringRules = state => state.app.scoringRules;

export default appSlice.reducer;
