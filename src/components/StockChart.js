import React, {useState} from 'react';
import {utilities} from './../utilities';

import './StockChart.css'

const StockChart = (props) => {

    let [descendingSort, setDecendingSort] = useState(true);
    let [stocks, setStocks] = useState(props.portfolio.stocks);

    const getScore = (value, rule) => {
        let score = 0;
        if(value) {
            if (value > rule.max) {
                if (rule.highValueBetter) {
                    score = rule.weight;
                } else {
                    score = -rule.weight;
                }
            } else if (value < rule.min) {
                if (rule.highValueBetter) {
                    score = -rule.weight;
                } else {
                    score = rule.weight;
                }
            }
        }
        return score;
    }

    const getSummaryScore = (stock) => {
        let score = 0;
        const weight = props.scoringRules.summaryScore.weight
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
    
    const handleSort = (propertyName) => {
        setDecendingSort(!descendingSort);
        setStocks(utilities.sort(stocks, propertyName, descendingSort));
    }

    let subtitle = '';
    if(props.portfolio.portfolioOverviewFileDate) {
        subtitle += `(portfolio-${utilities.shortDate(props.portfolio.portfolioOverviewFileDate)}`;
        if(props.portfolio.screenFileDate) {
            subtitle += `, screen-${utilities.shortDate(props.portfolio.screenFileDate)}`;
        }
        subtitle += ')';
    }

    return (
        <div className="stock-chart">
            <div className="card" id="chart">
                <div className="card-heading bg-dark text-light">
                    <button className='btn btn-secondary btn-rules' onClick={props.onRules}> Rules</button>
                    <div className="title">Stock Portfolio<span className="subtitle">{subtitle}</span></div>
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        <table id="stockTable" className="table table-condensed table-striped table-hover font-size-small">
                            <thead>
                                <tr>
                                    <th onClick={() => handleSort('symbol')}>Symbol</th>
                                    <th onClick={() => handleSort('score')}>Score</th>
                                    <th onClick={() => handleSort('description')}>Description</th>
                                    <th onClick={() => handleSort('sector')}>Sector</th>
                                    <th onClick={() => handleSort('industry')}>Industry</th>
                                    <th onClick={() => handleSort('lastPrice')}>Last Price</th>
                                    <th onClick={() => handleSort('quantity')}>Quantity</th>
                                    <th onClick={() => handleSort('earningsPerShare')}>EPS</th>
                                    <th onClick={() => handleSort('dividendPerShare')}>Dividend</th>
                                    <th onClick={() => handleSort('costBasis')}>Cost Basis</th>
                                    <th onClick={() => handleSort('currentValue')}>Current Value</th>
                                    <th onClick={() => handleSort('summaryScore')}>Summary Score</th>
                                    <th onClick={() => handleSort('priceEarningsRatio')}>P/E</th>
                                    <th onClick={() => handleSort('dividendPayoutPercentage')}>Div Payout %</th>
                                    <th onClick={() => handleSort('dividendYieldPercentage')}>Div Yield %</th>
                                    <th onClick={() => handleSort('stockPercentage')}>Stock %</th>
                                    <th onClick={() => handleSort('sectorPercentage')}>Sector %</th>
                                    <th onClick={() => handleSort('industryPercentage')}>Industry %</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stocks.map((stock, index) => {
                                    const summaryScore = getSummaryScore(stock);
                                    const priceEarningsRatioScore = getScore(stock.priceEarningsRatio, props.scoringRules.priceEarningsRatio);
                                    const dividendPayoutPercentageScore = getScore(stock.dividendPayoutPercentage, props.scoringRules.dividendPayoutPercentage);
                                    const dividendYieldPercentageScore = getScore(stock.dividendYieldPercentage, props.scoringRules.dividendYieldPercentage);
                                    const stockPercentageScore = getScore(stock.stockPercentage, props.scoringRules.stockPercentage);
                                    const sectorPercentageScore = getScore(stock.sectorPercentage, props.scoringRules.sectorPercentage);
                                    const industryPercentageScore = getScore(stock.industryPercentage, props.scoringRules.industryPercentage);
                                    let score = 0
                                    // Do not get an overall score unless we have earningsPerShare, as it is needed to calculate many of the important metrics
                                    if(stock.earningsPerShare) {
                                        score = summaryScore+priceEarningsRatioScore+dividendPayoutPercentageScore+dividendYieldPercentageScore+stockPercentageScore+sectorPercentageScore+industryPercentageScore;
                                    }
                                    return (
                                        <tr key={index}>
                                            <td>{stock.symbol}</td>
                                            <td className={score > props.scoringRules.overallScore.max ? 'good-background' : score < props.scoringRules.overallScore.min ? 'bad-background' : null}>{score}</td>
                                            <td>{stock.description}</td>
                                            <td>{stock.sector ? stock.sector.replace(/["]/g, '') : null}</td>
                                            <td>{stock.industry ? stock.industry.replace(/["]/g, '') : null}</td>
                                            <td>${stock.lastPrice.toFixed(2)}</td>
                                            <td>{stock.quantity}</td>
                                            <td>{stock.earningsPerShare ? `$${stock.earningsPerShare.toFixed(2)}` : null}</td>
                                            <td>{stock.dividendPerShare ? `$${stock.dividendPerShare.toFixed(2)}` : null}</td>
                                            <td>{stock.costBasis ? `$${stock.costBasis.toFixed(2)}` : null}</td>
                                            <td className={stock.currentValue < stock.costBasis ? 'bad-text' : null}>{stock.currentValue ? `$${stock.currentValue.toFixed(2)}` : null}</td>
                                            <td className={summaryScore > 0 ? 'good-background' : summaryScore < 0  ? 'bad-background' : null}>{stock.summaryScore}</td>
                                            <td className={priceEarningsRatioScore > 0 ? 'good-background' : priceEarningsRatioScore < 0  ? 'bad-background' : null}>{stock.priceEarningsRatio ? stock.priceEarningsRatio.toFixed(2) : null}</td>
                                            <td className={dividendPayoutPercentageScore > 0 ? 'good-background' : dividendPayoutPercentageScore < 0 ? 'bad-background' : null}>{stock.dividendPayoutPercentage ? (stock.dividendPayoutPercentage*100).toFixed(0) : null}</td>
                                            <td className={dividendYieldPercentageScore > 0 ? 'good-background' : dividendYieldPercentageScore < 0 ? 'bad-background' : null}>{stock.dividendYieldPercentage ? (stock.dividendYieldPercentage*100).toFixed(2) : null}</td>
                                            <td className={stockPercentageScore > 0 ? 'good-background' : stockPercentageScore < 0  ? 'bad-background' : null}>{stock.stockPercentage ? (stock.stockPercentage*100).toFixed(2) : null}</td>
                                            <td className={sectorPercentageScore > 0 ? 'good-background' : sectorPercentageScore < 0  ? 'bad-background' : null}>{stock.sectorPercentage ? (stock.sectorPercentage*100).toFixed(2) : null}</td>
                                            <td className={industryPercentageScore > 0 ? 'good-background' : industryPercentageScore < 0  ? 'bad-background' : null}>{stock.industryPercentage ? (stock.industryPercentage*100).toFixed(2) : null}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="card-footer d-flex p-2 justify-content-around">
                    <span className="bad-text">Orange denotes a negative score</span>
                    <span className="good-text">Blue denotes a positive score</span>
                </div>
            </div>
        </div>
    );
}

export default StockChart;
