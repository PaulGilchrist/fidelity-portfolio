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

import {getStockScore} from './libraries/scores';

const App = (props) => {
    let [showRules, setShowRules] = useState(false);
    let [portfolio, setPortfolio] = useState(props.initialPortfolio);
    let [scoringRules, setScoringRules] = useState(props.initialScoringRules);

    // Call it once in your app. At the root of your app is the best place
    toast.configure();

    const forcePrecision = (num, precision = 2) => num ? num.toFixed(precision) : '';

    // Event Handlers
    const handleOnCloseRulesEditor = (event) => {
        setShowRules(false);
    }

    const handleDataExport = (event) => {
        let csv = 'Symbol,Score,Description,Sector,Industry,Last Price,Quantity,EPS,Dividend,Cost Basis,Current Value,Summary Score,P/E,Dividend Payout %,Dividend Yield %,Stock %,Sector %,Industry %\n';
        // Add each row of the table
        for (const stock of portfolio.stocks) {
            let score = getStockScore(stock, scoringRules);
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
        let rows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets['Basic Facts']);
            for (let row of rows) {
            const companyName = row['Company Name'];
            if (!companyName) {
                break;  // end of file
            }
            let stock = portfolio.stocks.find(s => s.symbol === row['Symbol']);
            if (stock) {
                stock.lastPrice = row['Security Price']
                stock.dividendPerShare = row['Dividend Yield'] * stock.lastPrice / 400; // 4 (quarterly payments)
                stock.sector = row['Sector'];
                stock.industry = row['Industry'];
                stock.dividendYieldPercentage = stock.dividendPerShare * 4 / stock.lastPrice;
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
        rows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets['Valuation, Growth & Ownership']);
        for (let row of rows) {
            const companyName = row['Company Name'];
            if (!companyName) {
                break; // end of file
            }
            let stock = portfolio.stocks.find(s => s.symbol === row['Symbol']);
            if (stock) {
                stock.earningsPerShare = stock.lastPrice / row['P/E (Price/TTM Earnings)']; // lastPrice / PriceEarningsRatio
                stock.priceEarningsRatio = stock.lastPrice / stock.earningsPerShare;
                stock.dividendPayoutPercentage = stock.dividendPerShare * 4 / stock.earningsPerShare;
            }
        }
        rows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets['Analyst Opinions']);
        for (let row of rows) {
            const companyName = row['Company Name'];
            if (!companyName) {
                break; // end of file
            }
            let stock = portfolio.stocks.find(s => s.symbol === row['Symbol']);
            if (stock) {
                stock.summaryScore = row['Equity Summary Score from StarMine from Refinitiv'];
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
        