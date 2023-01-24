import React, {useState} from 'react';
import {cloneDeep} from 'lodash'
import {toast} from 'react-toastify' // Must be initialized in App.js (see https://github.com/fkhadra/react-toastify#usage)
import XLSX from 'xlsx';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import 'react-toastify/dist/ReactToastify.min.css';
import css from './app.module.css';

import GettingStarted from './components/GettingStarted';
import RulesEditor from './components/RulesEditor';
import StockChart from './components/StockChart';

const App = (props) => {
    let [showRules, setShowRules] = useState(false);
    let [portfolio, setPortfolio] = useState(props.initialPortfolio);
    let [scoringRules, setScoringRules] = useState(props.initialScoringRules);

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

    // Event Handlers
    const handleOnCloseRulesEditor = (event) => {
        setShowRules(false);
    }

    const handleDataExport = (event) => {
        let csv = 'Symbol,Score,Description,Sector,Industry,Last Price,Quantity,EPS,Dividend,Cost Basis,Current Value,Summary Score,P/E,Dividend Payout %,Dividend Yield %,Stock %,Sector %,Industry %\n';
        // Add each row of the table
        for (const stock of portfolio.stocks) {
            let score = getStockScore(stock);
            csv += `${stock.symbol},${score},${stock.description},${stock.sector || ''},${(stock.industry || '').replace(',', '')},${forcePrecision(stock.lastPrice)},${forcePrecision(stock.quantity)},${forcePrecision(stock.earningsPerShare)},${forcePrecision(stock.dividendPerShare)},${forcePrecision(stock.costBasis)},${forcePrecision(stock.currentValue)},${stock.summaryScore || ''},${forcePrecision(stock.priceEarningsRatio)},${forcePrecision(stock.dividendPayoutPercentage)},${forcePrecision(stock.dividendYieldPercentage, 4)},${forcePrecision(stock.stockPercentage, 4)},${forcePrecision(stock.sectorPercentage, 4)},${forcePrecision(stock.industryPercentage, 4)}\n`;
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
        let file = event.target.files[0]
        let fileDate = new Date(file.lastModified);
       if(file.name.indexOf("Portfolio_Position") === 0) {
            // const textReader = new FileReader();
            // textReader.onloadend = () => {
            //     const rows = textReader.result.toString().split('\n');
            //     processPortfolioOverview(rows, fileDate);
            // }
            //textReader.readAsText(file);
            const binaryStringReader = new FileReader();
            binaryStringReader.onload = () => {
                const workbook = XLSX.read(binaryStringReader.result, { type: 'binary' });
                processPortfolioOverview(workbook, fileDate);
            }
            binaryStringReader.readAsBinaryString(file);
        } else {
            const binaryStringReader = new FileReader();
            binaryStringReader.onload = () => {
                const workbook = XLSX.read(binaryStringReader.result, { type: 'binary' });
                processScreener(workbook, fileDate);
            }
            binaryStringReader.readAsBinaryString(file);
        }
    }

    const handleOnRules = () => {
        setShowRules(!showRules);
    }

    const handleOnUpdateRules = (values) => {
        updateScoringRules(values);
        setShowRules(false);
    }

    const processPortfolioOverview = (workbook, fileDate) => {
        // handle data processing of portfolio
        let newPortfolio = {
            currentValue: 0,
            portfolioOverviewFileDate: fileDate,
            screenFileDate: null,
            sectors: [],
            stocks: []
        }
        let rows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets.Sheet1);
        for (let row of rows) {
            // First missing Quantity ends the data portion of the file
            const lastPriceChange = row['Quantity'];
            if (!lastPriceChange) {
                break;
            }
            const newStock = {
                // Only get important columns
                symbol: row['Symbol'],
                description: row['Description'].split("USD")[0].split(" COM")[0].split(" CORP")[0].split(" INC")[0], // Remove excess description
                quantity: Number(row['Quantity']),
                lastPrice: Number(row['Last Price']),
                currentValue: Number(row['Current Value']), // .replace(/[$%",]/g, '')
                costBasis: Number(row['Cost Basis Total']),
            }
            // Add or merge into array
            let existingStock = newPortfolio.stocks.find(s => s.symbol === newStock.symbol);
            if (existingStock) {
                // Merge stocks together
                existingStock.quantity += newStock.quantity;
                existingStock.costBasis += newStock.costBasis;
                existingStock.currentValue += newStock.currentValue;
            } else {
                // Add
                newPortfolio.stocks.push(newStock);
            }
        }
        newPortfolio.stocks.sort((a, b) => {
            if (a.symbol < b.symbol) {
                return -1;
            }
            if (b.symbol < a.symbol) {
                return 1;
            }
            return 0;
        });
        updatePortfolio(newPortfolio);
        toast.success(`Portfolio data imported`, {
            position: "top-right",
            autoClose: 500,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: false,
            draggable: false
        });
    }

    const processScreener = (workbook, fileDate) => {
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
        portfolio.screenFileDate = fileDate;
        portfolio.sectors = [];
        let rows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets['Search Criteria']);
        for (let row of rows) {
            // First missing company name ends the data portion of the file
            const companyName = row['Company Name'];
            if (!companyName) {
                break;
            }
            // Merge in additional data if stock exists in portfolio
            let stock = portfolio.stocks.find(s => s.symbol === row['Symbol']);
            if (stock) {
                // Only get important columns
                stock.earningsPerShare = stock.lastPrice / row['P/E (Price/TTM Earnings)']; // lastPrice / PriceEarningsRatio
                stock.summaryScore = row['Equity Summary Score from StarMine from Refinitiv'];
                // Calculated fields
                stock.priceEarningsRatio = stock.lastPrice / stock.earningsPerShare;
            }
        }
        rows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets['Basic Facts']);
            for (let row of rows) {
            // First missing company name ends the data portion of the file
            const companyName = row['Company Name'];
            if (!companyName) {
                break;
            }
            // Merge in additional data if stock exists in portfolio
            let stock = portfolio.stocks.find(s => s.symbol === row['Symbol']);
            if (stock) {
                // Only get important columns
                stock.dividendPerShare = row['Dividend Yield'] * stock.lastPrice / 400; // dividendYield * lastPrice / 4 (quarterly payments)
                stock.sector = row['Sector'];
                stock.industry = row['Industry'];
                // Calculated fields
                stock.dividendPayoutPercentage = stock.dividendPerShare * 4 / stock.earningsPerShare;
                stock.dividendYieldPercentage = stock.dividendPerShare * 4 / stock.lastPrice;
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
        updatePortfolio(cloneDeep(portfolio));
        toast.success(`Screen data imported`, {
            position: "top-right",
            autoClose: 500,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: false,
            draggable: false
        });
    }

    const updatePortfolio = (newPortfolio) => {
        localStorage.setItem('portfolio', JSON.stringify(newPortfolio));
        setPortfolio(newPortfolio);
    }

    const updateScoringRules = (newScoringRules) => {
        localStorage.setItem('scoringRules', JSON.stringify(newScoringRules));
        setScoringRules(newScoringRules);
    }

    return (
        <div className={`container-fluid ${css.app}`}>
            <div>
                <label className="btn btn-info" onChange={handleDataImport}>
                    Import <input type="file" multiple={false} accept=".csv,.xls" hidden />
                </label>
                &nbsp;
                <label className="btn btn-info" onClick={handleDataExport}>Export</label>
            </div>
            <GettingStarted stocks={portfolio.stocks}/>
            {showRules ? <RulesEditor scoringRules={scoringRules} onClose={handleOnCloseRulesEditor} onSubmit={(values) => handleOnUpdateRules(values)}/> : null}
            {portfolio.stocks.length > 0 ? <StockChart portfolio={portfolio} scoringRules={scoringRules} onRules={() => handleOnRules()}/> : null}
        </div>
    );
}

export default App;
        
// const processPortfolioOverviewPreview = (rows, fileDate) => {
//     // handle data processing of portfolio
//     let portfolio = {
//         currentValue: 0,
//         portfolioOverviewFileDate: fileDate,
//         screenFileDate: null,
//         sectors: [],
//         stocks: []
//     }
//     for (let i = 1 /* skip header row */; i < rows.length; i++) {
//         var columns = splitCSVButIgnoreCommasInDoublequotes(rows[i]);
//         // First blank line ends the data portion of the file
//         if (columns[0] === '\r') {
//             break;
//         }
//         const newStock = {
//             // Only get important columns
//             symbol: columns[1],
//             description: columns[2].split("USD")[0].split(" COM")[0].split(" CORP")[0].split(" INC")[0], // Remove excess description
//             quantity: Number(columns[3].replace(/[$%",]/g, '')),
//             lastPrice: Number(columns[4].replace(/[$%",]/g, '')),
//             currentValue: Number(columns[6].replace(/[$%",]/g, '')),
//             costBasis: Number(columns[12].replace(/[$%",]/g, '')),
//         }
//         // Add or merge into array
//         let existingStock = portfolio.stocks.find(s => s.symbol === newStock.symbol);
//         if (existingStock) {
//             // Merge stocks together
//             existingStock.quantity += newStock.quantity;
//             existingStock.costBasis += newStock.costBasis;
//             existingStock.currentValue += newStock.currentValue;
//         } else {
//             // Add
//             portfolio.stocks.push(newStock);
//         }
//     }
//     portfolio.stocks.sort((a, b) => {
//         if (a.symbol < b.symbol) {
//             return -1;
//         }
//         if (b.symbol < a.symbol) {
//             return 1;
//         }
//         return 0;
//     });
//     dispatch(updatePortfolio(portfolio));
//     toast.success(`Portfolio data imported`, {
//         position: "top-right",
//         autoClose: 500,
//         hideProgressBar: false,
//         closeOnClick: false,
//         pauseOnHover: false,
//         draggable: false
//     });
// }

// const splitCSVButIgnoreCommasInDoublequotes = (str) => {
//     //split the str first  
//     //then merge the elments between two double quotes  
//     let delimiter = ',';
//     let quotes = '"';
//     let elements = str.split(delimiter);
//     let newElements = [];
//     for (let i = 0; i < elements.length; ++i) {
//         if (elements[i].indexOf(quotes) >= 0) {//the left double quotes is found  
//             let indexOfRightQuotes = -1;
//             let tmp = elements[i];
//             //find the right double quotes  
//             for (let j = i + 1; j < elements.length; ++j) {
//                 if (elements[j].indexOf(quotes) >= 0) {
//                     indexOfRightQuotes = j;
//                     break;
//                 }
//             }
//             //found the right double quotes  
//             //merge all the elements between double quotes  
//             if (-1 !== indexOfRightQuotes) {
//                 for (let k = i + 1; k <= indexOfRightQuotes; ++k) {
//                     tmp = tmp + delimiter + elements[k];
//                 }
//                 newElements.push(tmp);
//                 i = indexOfRightQuotes;
//             }
//             else { //right double quotes is not found  
//                 newElements.push(elements[i]);
//             }
//         }
//         else {//no left double quotes is found  
//             newElements.push(elements[i]);
//         }
//     }

//     return newElements;
// }
