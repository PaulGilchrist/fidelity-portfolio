import React from 'react';
import { useForm } from "react-hook-form";

import './GettingStarted.css'

const GettingStarted = (props) => {
    if(props.stocks.length === 0) {
        return (
            <div className="getting-started">
                <div className="card">
                    <div className="card-heading bg-dark text-light p-2">
                        Step 1
                    </div>
                    <div className="card-body">
                        From Fidelity's website, <a href="https://oltx.fidelity.com/ftgw/fbc/oftop/portfolio#positions" target="_blank" rel="noreferrer">download your Profile's Positions</a> "Overview" data and import it into this application.
                    </div>
                </div>
            </div>
        );
    } else {
        // Do we have any Screen data?
        let found = props.stocks.find(s => s.sector || s.summaryScore) // Look for any stock with sector information (Basic Facts) or summaryScore (Search Criteria) data
        if(!found) {
            return (
                <div className="getting-started">
                    <div className="card">
                        <div className="card-heading bg-dark text-light d-flex p-2">
                            Step 2
                        </div>
                        <div className="card-body">
                            <ol>
                                <li>From Fidelity's website <a href="https://research2.fidelity.com/fidelity/screeners/commonstock/landing.asp?" target="_blank" rel="noreferrer">load existing or create a new "Screen"</a> with the following criteria and order, as the order they are added determines the order columns appear in the resulting data flie</li>
                                <ul>
                                    <li><b>"Company Value - P/E - Price/TTM Earnings"</b> choosing all categories "Very Low" through "Very High"</li>
                                    <li><b>"Analyst Opinions - Equity Summary Score from StarMine from Fefinitiv"</b> choosing all categories "Very Bearish" through "Very Bullish"</li>
                                    <li><b>"Basic Company Facts / Index"</b> choosing all 3 indexes "DJIA", "NASDAQ 100" and "S&P 500"</li>
                                </ul>
                                <li>Optionally, add up to 5 stocks manually that may not have been returned from the search results</li>
                                <li>Select "Save to My Screens" for later reuse</li>
                                <li>Download the Screen's "Search Criteria" and "Basic Facts" data.  Data will be saved in Excel format, but this application needs the data in CSV format.</li>
                                <li>Open the file in Excel and save each of the two tabs as separate "CSV (Comma delimited) (*.csv)" files.  "SaveAs" is disabled unless "enable Editing" has first been selected.</li>
                                <li>Import the two previous saved Screen "Search Criteria" and "Basic Facts" data files.  This data will merge together with your portfolio data</li>
                            </ol>
                        </div>
                    </div>
                </div>
            );
        } else {
            // Do we have both Screen data files already imported?
            let foundSearchCriteriaData = props.stocks.find(s => s.summaryScore)            
            let foundBasicData = props.stocks.find(s => s.sector)
            if(!foundSearchCriteriaData) {
                return (
                    <div className="getting-started">
                        <div className="card">
                            <div className="card-heading bg-dark text-light d-flex p-2">
                                Step 3
                            </div>
                            <div className="card-body">
                                Import the saved screen's <b>"Search Criteria"</b> data file.  This data will merge together with your portfolio data
                            </div>
                        </div>
                    </div>
                );
            } else if(!foundBasicData) {
                return (
                    <div className="getting-started">
                        <div className="card">
                            <div className="card-heading bg-dark text-light d-flex p-2">
                                Step 3
                            </div>
                            <div className="card-body">
                                Import the saved screen's <b>"Basic Facts"</b> data file.  This data will merge together with your portfolio data
                            </div>
                        </div>
                    </div>
                );
            } else {
                return null;
            }
        }
    }
}

export default GettingStarted;
