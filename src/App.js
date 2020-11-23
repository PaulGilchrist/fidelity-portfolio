import React, {useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { cloneDeep } from 'lodash'

import { toast } from 'react-toastify' // Must be initialized in App.js (see https://github.com/fkhadra/react-toastify#usage)

import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import 'react-toastify/dist/ReactToastify.min.css';

import css from './app.module.css';

import {
    // Actions
    updatePortfolio,
    updateScoringRules,
    // Selectors
    selectorPortfolio,
    selectorScoringRules
} from './appSlice';

import StockChart from './components/StockChart';

const App = () => {
    // Call it once in your app. At the root of your app is the best place
    toast.configure();

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
        // Do not get an overall score unless we have earningsPerShare, as it is needed to calculate many of the important metrics
        if(stock.earningsPerShare) {
            score += getScore(stock.dividendPayoutPercentage, scoringRules.dividendPayoutPercentage);
            score += getScore(stock.dividendYieldPercentage, scoringRules.dividendYieldPercentage);
            score += getScore(stock.industryPercentage, scoringRules.industryPercentage);
            score += getScore(stock.priceEarningsRatio, scoringRules.priceEarningsRatio);
            score += getScore(stock.sectorPercentage, scoringRules.sectorPercentage);
            score += getScore(stock.stockPercentage, scoringRules.stockPercentage);
            // Summary Score is a special rule
            score += getSummaryScore(stock);
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
        portfolio = cloneDeep(portfolio);
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
                stock.sector = columns[7];
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
        }
        dispatch(updatePortfolio(portfolio));
    }

    const processScreenerResultsSearchCriteria = (rows) => {
        portfolio = cloneDeep(portfolio);
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
                stock.dividendPayoutPercentage = stock.dividendPerShare * 4 / stock.earningsPerShare;
                stock.dividendYieldPercentage = stock.dividendPerShare * 4 / stock.lastPrice;
            }
        }
        dispatch(updatePortfolio(portfolio));
    }

    const processPortfolioOverview = (rows) => {
        let portfolio = {
            currentValue: 0,
            sectors: [],
            stocks: []
        }
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
        //setPortfolio(portfolio);
        console.log(portfolio);
        dispatch(updatePortfolio(portfolio));
    }

    // Event Handlers
    const handleDataExport = (event) => {
        let csv = 'Symbol,Score,Description,Sector,Industry,Last Price,Quantity,EPS,Dividend,Cost Basis,Current Value,Summary Score,P/E,Dividend Payout %,Dividend Yield %,Stock %,Sector %,Industry %\n';
        // Add each row of the table
        for (const stock of portfolio.stocks) {
            let score = getStockScore(stock);
            csv += `${stock.symbol},${score},${stock.description},${stock.sector || ''},${stock.industry || ''},${forcePrecision(stock.lastPrice)},${forcePrecision(stock.quantity)},${forcePrecision(stock.earningsPerShare)},${forcePrecision(stock.dividendPerShare)},${forcePrecision(stock.costBasis)},${forcePrecision(stock.currentValue)},${stock.summaryScore || ''},${forcePrecision(stock.priceEarningsRatio)},${forcePrecision(stock.dividendPayoutPercentage)},${forcePrecision(stock.dividendYieldPercentage, 4)},${forcePrecision(stock.stockPercentage, 4)},${forcePrecision(stock.sectorPercentage, 4)},${forcePrecision(stock.industryPercentage, 4)}\n`;
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

    const dispatch = useDispatch();
    let portfolio = useSelector(selectorPortfolio);
    let scoringRules = useSelector(selectorScoringRules);

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
                {portfolio.stocks.length > 0 ? <StockChart portfolio={portfolio} scoringRules={scoringRules} onPrintChart={() => handleOnPrintStockChart()}/> : null}
            </div>
        </div>
    );
}

export default App;
