import React from 'react';
// import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify' // Must be initialized in App.js (see https://github.com/fkhadra/react-toastify#usage)

import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import 'react-toastify/dist/ReactToastify.min.css';

import css from './app.module.css';

// import {
//     // Actions
//     updatePortfolio,
//     updateScoringRules,
//     // Selectors
//     selectorPortfolio,
//     selectorScoringRules
// } from './appSlice';

import StockChart from './components/StockChart';

const App = () => {
    // Call it once in your app. At the root of your app is the best place
    toast.configure();

    //const forcePrecision = (num, precision=2) => num ? (Math.round(num * 10^precision) / 10^precision).toFixed(precision) : '';
    const forcePrecision = (num, precision = 2) => num ? num.toFixed(precision) : '';

    const getScore = (value, rule) => {
        if(value) {
            if (value > rule.max) {
                if (rule.highValueBetter)
                    return rule.weight;
                return -rule.weight;
            } else if (value < rule.min) {
                if (rule.highValueBetter)
                    return -rule.weight;
                return rule.weight;
            }
        }
        return 0;
    }

    const getStockScore = (stock) => {
        let score = 0;
        // Only give a score when all relavent data exists
        if(stock.earningsPerShare) {
            score += getScore(stock.dividendEarningsRatio, scoringRules.dividendEarningsRatio);
            score += getScore(stock.dividendPriceRatio, scoringRules.dividendPriceRatio);
            score += getScore(stock.industryPercentage, scoringRules.industryPercentage);
            score += getScore(stock.priceEarningsRatio, scoringRules.priceEarningsRatio);
            score += getScore(stock.sectorPercentage, scoringRules.sectorPercentage);
            score += getScore(stock.stockPercentage, scoringRules.stockPercentage);
            // Summary Score is a special rule
            getSummaryScore(stock);
        }
        return score;
    }

    const getSummaryScore = (stock) => {
        let score = 0;
        const weight = scoringRules.summaryScore.weight
        switch (stock.summaryScore) {
            case 'Very Bullish':
                score += (weight*2)
                break;
            case 'Bullish':
                score += weight
                break;
            case 'Bearish':
                score -= weight
                break;
            case 'Very Bearish':
                score -= (weight*2)
                break;
            default: // 'Neutral'
        }
        return score;
    }

    const splitCSVButIgnoreCommasInDoublequotes = (str) => {
        //split the str first  
        //then merge the elments between two double quotes  
        let delimiter = ',';
        let quotes = '"';
        let elements = str.split(delimiter);
        let newElements = [];
        for (let i = 0; i < elements.length; ++i) {
            if (elements[i].indexOf(quotes) >= 0) {//the left double quotes is found  
                let indexOfRightQuotes = -1;
                let tmp = elements[i];
                //find the right double quotes  
                for (let j = i + 1; j < elements.length; ++j) {
                    if (elements[j].indexOf(quotes) >= 0) {
                        indexOfRightQuotes = j;
                        break;
                    }
                }
                //found the right double quotes  
                //merge all the elements between double quotes  
                if (-1 !== indexOfRightQuotes) {
                    for (let k = i + 1; k <= indexOfRightQuotes; ++k) {
                        tmp = tmp + delimiter + elements[k];
                    }
                    newElements.push(tmp);
                    i = indexOfRightQuotes;
                }
                else { //right double quotes is not found  
                    newElements.push(elements[i]);
                }
            }
            else {//no left double quotes is found  
                newElements.push(elements[i]);
            }
        }

        return newElements;
    }

    const processScreenerResultsBasicFacts = (rows) => {
        portfolio.sectors = [];
        // Add new row data to stocks
        for (let i = 1 /* skip header row */; i < rows.length; i++) {
            var columns = splitCSVButIgnoreCommasInDoublequotes(rows[i]);
            // First blank line ends the data portion of the file
            let symbol = columns[0];
            if (symbol === '\r') {
                break;
            }
            // Merge in additional data if stock exists in portfolio
            let stock = portfolio.stocks.find(s => s.symbol === symbol);
            if (stock) {
                // Only get important columns
                stock.sector = columns[7]
                stock.industry = columns[8];
                // Get sector and industry summations
                let sector = portfolio.sectors.find(s => s.name === stock.sector);
                if (sector) {
                    sector.currentValue += stock.currentValue;
                    let industry = sector.industries.find(i => i.name === stock.industry);
                    if (industry) {
                        industry.currentValue += stock.currentValue;
                    } else {
                        sector.industries.push({
                            name: stock.industry,
                            currentValue: stock.currentValue
                        });
                    }
                } else {
                    portfolio.sectors.push({
                        name: stock.sector,
                        currentValue: stock.currentValue,
                        industries: [
                            {
                                name: stock.industry,
                                currentValue: stock.currentValue
                            }
                        ]
                    });
                }
            }
        }
        // Get portfolio summations
        portfolio.currentValue = 0;
        for (const stock of portfolio.stocks) {
            portfolio.currentValue += stock.currentValue;
        }
        // Calculated fields now that all summations are complete
        for (let stock of portfolio.stocks) {
            stock.stockPercentage = stock.currentValue / portfolio.currentValue;
            if (stock.sector) {
                // Funds have no sector
                let sector = portfolio.sectors.find(s => s.name === stock.sector);
                let industry = sector.industries.find(i => i.name === stock.industry);
                stock.sectorPercentage = sector.currentValue / portfolio.currentValue;
                stock.industryPercentage = industry.currentValue / portfolio.currentValue;
            }
            stock.score = getStockScore(stock);
        }
        // dispatch(updatePortfolio(portfolio));
    }

    const processScreenerResultsSearchCriteria = (rows) => {
        for (let i = 1 /* skip header row */; i < rows.length; i++) {
            var columns = splitCSVButIgnoreCommasInDoublequotes(rows[i]);
            // First blank line ends the data portion of the file
            const symbol = columns[0];
            if (symbol === '\r') {
                break;
            }
            // Merge in additional data if stock exists in portfolio
            let stock = portfolio.stocks.find(s => s.symbol === symbol);
            if (stock) {
                // Only get important columns
                stock.earningsPerShare = stock.lastPrice / Number(columns[5].replace(/[$%",]/g, '')); // lastPrice / PriceEarningsRatio
                stock.dividendPerShare = (Number(columns[4].replace(/[$%",]/g, '')) * stock.lastPrice / 400); // dividendYield * lastPrice / 4 (quarterly payments)
                stock.summaryScore = columns[7];
                // Calculated fields
                stock.priceEarningsRatio = stock.lastPrice / stock.earningsPerShare;
                stock.dividendEarningsRatio = stock.dividendPerShare * 4 / stock.earningsPerShare;
                stock.dividendPriceRatio = stock.dividendPerShare * 4 / stock.lastPrice;
                stock.score = getStockScore(stock);
            }
        }
        // dispatch(updatePortfolio(portfolio));
    }

    const processPortfolioOverview = (rows) => {
        portfolio.currentValue = 0;
        portfolio.sectors = [];
        portfolio.stocks = [];
        for (let i = 1 /* skip header row */; i < rows.length; i++) {
            var columns = splitCSVButIgnoreCommasInDoublequotes(rows[i]);
            // First blank line ends the data portion of the file
            if (columns[0] === '\r') {
                break;
            }
            const newStock = {
                // Only get important columns
                symbol: columns[1],
                description: columns[2].split("USD")[0].split(" COM")[0].split(" CORP")[0].split(" INC")[0], // Remove excess description
                quantity: Number(columns[3].replace(/[$%",]/g, '')),
                lastPrice: Number(columns[4].replace(/[$%",]/g, '')),
                currentValue: Number(columns[6].replace(/[$%",]/g, '')),
                costBasis: Number(columns[12].replace(/[$%",]/g, '')),
            }
            // Add or merge into array
            let existingStock = portfolio.stocks.find(s => s.symbol === newStock.symbol);
            if (existingStock) {
                // Merge stocks together
                existingStock.quantity += newStock.quantity;
                existingStock.costBasis += newStock.costBasis;
                existingStock.currentValue += newStock.currentValue;
            } else {
                // Add
                portfolio.stocks.push(newStock);
            }
        }
        portfolio.stocks.sort((a, b) => {
            if (a.symbol < b.symbol) {
                return -1;
            }
            if (b.symbol < a.symbol) {
                return 1;
            }
            return 0;
        });
        // dispatch(updatePortfolio(portfolio));
    }

    // Event Handlers
    const handleDataExport = (event) => {
        let csv = 'Symbol,Score,Description,Sector,Industry,Last Price,Quantity,EPS,Dividend,Cost Basis,Current Value,Summary Score,P/E,D/P,D/E,Stock %,Sector %,Industry %\n';
        // Add each row of the table
        for (const stock of portfolio.stocks) {
            csv += `${stock.symbol},${stock.score},${stock.description},${stock.sector || ''},${stock.industry || ''},${forcePrecision(stock.lastPrice)},${forcePrecision(stock.quantity)},${forcePrecision(stock.earningsPerShare)},${forcePrecision(stock.dividendPerShare)},${forcePrecision(stock.costBasis)},${forcePrecision(stock.currentValue)},${stock.summaryScore || ''},${forcePrecision(stock.priceEarningsRatio)},${forcePrecision(stock.dividendEarningsRatio)},${forcePrecision(stock.dividendPriceRatio, 4)},${forcePrecision(stock.stockPercentage, 4)},${forcePrecision(stock.sectorPercentage, 4)},${forcePrecision(stock.industryPercentage, 4)}\n`;
        }
        const blob = new Blob([csv], { type: 'text/plain' });
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = 'fidelity-portfolio.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const handleDataImport = (event) => {
        if (!event.target.files || event.target.files.length !== 1) {
            toast.error(`No file selected`, {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
            });
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            // handle data processing
            const rows = reader.result.toString().split('\n');
            // Check to see what type of file was imported based off its header
            if (rows[0].substring(0, 12) === 'Account Name') {
                processPortfolioOverview(rows);
            } else {
                if (portfolio.stocks.length === 0) {
                    toast.warn(`Portfolio overview must be imported first`, {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true
                    });
                    return;
                }
                if (rows[0].substring(0, 33) === 'Symbol,Company Name,Security Type') {
                    processScreenerResultsSearchCriteria(rows);
                } else if (rows[0].substring(0, 34) === 'Symbol,Company Name,Security Price') {
                    processScreenerResultsBasicFacts(rows);
                }
            }
            toast.success(`File imported`, {
                position: "top-right",
                autoClose: 500,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: false,
                draggable: false
            });
        }
        reader.readAsText(event.target.files[0]);
    }

    const handleOnPrintStockChart = () => {
        // Not Implemented Yet
    }

    // const dispatch = useDispatch();
    // let portfolio = useSelector(selectorPortfolio);
    // let scoringRules = useSelector(selectorScoringRules);

    let portfolio = {
        currentValue: 0,
        sectors: [],
        stocks: []
    };

    let scoringRules = {
        dividendEarningsRatio: { highValueBetter: true, min: 0.015, max: 0.3, weight: 2 },
        dividendPriceRatio: { highValueBetter: false, min: 0.35, max: 0.5, weight: 2 },
        industryPercentage: { highValueBetter: false, min: 0.002, max: 0.008, weight: 1 },
        priceEarningsRatio: { highValueBetter: false, min: 16, max: 25, weight: 2 },
        sectorPercentage: { highValueBetter: false, min: 0.02, max: 0.04, weight: 1 },
        stockPercentage: { highValueBetter: false, min: 0.002, max: 0.005, weight: 1 },
        summaryScore: { weight: 2 } // Neutral will be 0 and each rating above adds 'weight' and below subtracts 'weight'
    };

    return (
        <div className={`container-fluid ${css.app}`}>
            <div>
                <label className="btn btn-info" onChange={handleDataImport}>
                    Import <input type="file" multiple={false} accept=".csv" hidden />
                </label>
                &nbsp;
                <label className="btn btn-info" onClick={handleDataExport}>Export</label>
            </div>
            <div className="d-flex flex-fill justify-content-center">
                {portfolio.stocks.length > 0 ? <StockChart portfolio={portfolio} onPrintChart={() => handleOnPrintStockChart()}/> : null}
            </div>
        </div>
    );
}

export default App;
