//import React, { useState } from 'react';
import { toast } from 'react-toastify' // Must be initialized in App.js (see https://github.com/fkhadra/react-toastify#usage)

import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import 'react-toastify/dist/ReactToastify.min.css';

import css from './app.module.css';

const App = () => {
    // Call it once in your app. At the root of your app is the best place
    toast.configure();

    //const [stocks, setStocks] = useState([]);
    let stocks = [];

    //const forcePrecision = (num, precision=2) => num ? (Math.round(num * 10^precision) / 10^precision).toFixed(precision) : '';
    const forcePrecision = (num, precision=2) => num ? num.toFixed(precision) : '';

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
        for (let i = 1 /* skip header row */; i < rows.length; i++) {
            var columns = splitCSVButIgnoreCommasInDoublequotes(rows[i]);
            // First blank line ends the data portion of the file
            let symbol = columns[0];
            if (symbol === '\r') {
                break;
            }
            // Merge in additional data if stock exists in portfolio
            let found = stocks.find(s => s.symbol === symbol);
            if (found) {
                // Only get important columns
                found.sector = columns[7]
                found.industry = columns[8];
            }
        }
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
            let found = stocks.find(s => s.symbol === symbol);
            if (found) {
                // Only get important columns
                found.earningsPerShare = found.lastPrice / Number(columns[5].replace(/[$%",]/g, '')); // lastPrice / PriceEarningsRatio
                found.dividendPerShare = (Number(columns[4].replace(/[$%",]/g, '')) * found.lastPrice / 400); // dividendYield * lastPrice / 4 (quarterly payments)
                found.summaryScore = columns[7];
                // Calculated fields
                found.priceEarningsRatio = found.lastPrice / found.earningsPerShare;
                found.dividendEarningsRatio = found.dividendPerShare * 4 / found.earningsPerShare;
                found.dividendPriceRatio = found.dividendPerShare * 4 / found.lastPrice;
            }
        }
    }

    const processPortfolioOverview = (rows) => {
        stocks = [];
        for (let i = 1 /* skip header row */; i < rows.length; i++) {
            var columns = splitCSVButIgnoreCommasInDoublequotes(rows[i]);
            // First blank line ends the data portion of the file
            if (columns[0] === '\r') {
                break;
            }
            const stock = {
                // Only get important columns
                symbol: columns[1],
                description: columns[2].split("USD")[0].split(" COM")[0].split(" CORP")[0].split(" INC")[0],
                quantity: Number(columns[3].replace(/[$%",]/g, '')),
                lastPrice: Number(columns[4].replace(/[$%",]/g, '')),
                currentValue: Number(columns[6].replace(/[$%",]/g, '')),
                costBasis: Number(columns[12].replace(/[$%",]/g, '')),
            }
            // Add or merge into array
            let found = stocks.find(s => s.symbol === stock.symbol);
            if (found) {
                // Merge stocks together
                found.quantity += stock.quantity;
                found.costBasis += stock.costBasis;
                found.currentValue += stock.currentValue;
            } else {
                // Add
                stocks.push(stock);
            }
        }
        stocks.sort((a, b) => {
            if (a.symbol < b.symbol) {
                return -1;
            }
            if (b.symbol < a.symbol) {
                return 1;
            }
            return 0;
        });
    }

    // Event Handlers
    const handleDataExport = (event) => {
        let csv = 'Symbol,Description,Sector,Industry,Last Price,Quantity,EPS,Dividend,Cost Basis,Current Value,Summary Score,P/E,D/P,D/E\n';
        // Add each row of the table
        for (const stock of stocks) {
            csv += `${stock.symbol},${stock.description},${stock.sector || ''},${stock.industry || ''},${forcePrecision(stock.lastPrice)},${forcePrecision(stock.quantity)},${forcePrecision(stock.earningsPerShare)},${forcePrecision(stock.dividendPerShare)},${forcePrecision(stock.costBasis)},${forcePrecision(stock.currentValue)},${stock.summaryScore || ''},${forcePrecision(stock.priceEarningsRatio)},${forcePrecision(stock.dividendEarningsRatio)},${forcePrecision(stock.dividendPriceRatio,4)}\n`;
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
        } else {
            const reader = new FileReader();
            reader.onloadend = () => {
                // handle data processing
                const rows = reader.result.toString().split('\n');
                // Check to see what type of file was imported based off its header
                if (rows[0].substring(0, 12) === 'Account Name') {
                    processPortfolioOverview(rows);
                } else if (rows[0].substring(0, 33) === 'Symbol,Company Name,Security Type') {
                    processScreenerResultsSearchCriteria(rows);
                } else if (rows[0].substring(0, 34) === 'Symbol,Company Name,Security Price') {
                    processScreenerResultsBasicFacts(rows);
                }
                console.log(stocks);
                toast.success(`File imported`, {
                    position: "top-right",
                    autoClose: 500,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: false,
                    draggable: false
                });
            };
            reader.readAsText(event.target.files[0]);
        }
    }

    return (
        <div className={`container-fluid ${css.app}`}>
            <div>
                <label className="btn btn-info" onChange={handleDataImport}>
                    Import <input type="file" multiple={false} accept=".csv" hidden />
                </label>
                &nbsp;
                <label className="btn btn-info" onClick={handleDataExport}>Export</label>
            </div>
        </div>
    );
}

export default App;
