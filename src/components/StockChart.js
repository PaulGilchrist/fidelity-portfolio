import React from 'react';
import './StockChart.css'

const StockChart = (props) => {
    /*
    props = {
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
            scoringRules: {
                dividendEarningsRatio: { highValueBetter: boolean, min: number, max: number, weight: number },
                dividendPriceRatio: { highValueBetter: boolean, min: number, max: number, weight: number },
                industryPercentage: { highValueBetter: boolean, min: number, max: number, weight: number },
                priceEarningsRatio: { highValueBetter: boolean, min: number, max: number, weight: number },
                sectorPercentage: { highValueBetter: boolean, min: number, max: number, weight: number },
                stockPercentage: { highValueBetter: boolean, min: number, max: number, weight: number },
                summaryScore: { weight: number }, // Neutral will be 0 and each rating above adds 'weight' and below subtracts 'weight'
            },
            stocks: [
                {
                    costBasis: number,
                    currentValue: number,
                    description: string
                    dividendEarningsRatio: number,
                    dividendPerShare: number,
                    dividendPriceRatio: number,
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
        }
    */

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

    const getSummaryScore = (stock) => {
        let score = 0;
        const weight = props.portfolio.scoringRules.summaryScore.weight
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
    
    return (
        <div className="stock-chart">
            <div className="card" id="chart">
                <div className="card-heading bg-dark text-light">
                    <span>Stock Portfolio</span>
                    <button className='btn btn-secondary' onClick={props.onPrintChart}> Print</button>
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        <table id="stockTable" className="table table-condensed table-striped table-hover font-size-small">
                            <thead>
                                <tr>
                                    <th>Symbol<br/></th>
                                    <th>Score<br/></th>
                                    <th>Description<br/></th>
                                    <th>Sector<br/></th>
                                    <th>Industry<br/></th>
                                    <th>Last Price<br/></th>
                                    <th>Quantity<br/></th>
                                    <th>EPS<br/></th>
                                    <th>Dividend<br/></th>
                                    <th>Cost Basis<br/></th>
                                    <th>Current Value<br/></th>
                                    <th>Summary Score<br/></th>
                                    <th>P/E<br/></th>
                                    <th>D/P<br/></th>
                                    <th>D/E<br/></th>
                                    <th>Stock %<br/></th>
                                    <th>Sector %<br/></th>
                                    <th>Industry %<br/></th>
                                </tr>
                            </thead>
                            <tbody>
                                {props.portfolio.stocks.map((stock, index) => {
                                    const summaryScore = getSummaryScore(stock);
                                    const priceEarningsRatioScore = getScore(stock.priceEarningsRatio, props.portfolio.scoringRules.priceEarningsRatio);
                                    const dividendPriceRatioScore = getScore(stock.dividendPriceRatio, props.portfolio.scoringRules.dividendPriceRatio);
                                    const dividendEarningsRatioScore = getScore(stock.dividendEarningsRatio, props.portfolio.scoringRules.dividendEarningsRatio);
                                    const stockPercentageScore = getScore(stock.stockPercentage, props.portfolio.scoringRules.stockPercentage);
                                    const sectorPercentageScore = getScore(stock.sectorPercentage, props.portfolio.scoringRules.sectorPercentage);
                                    const industryPercentageScore = getScore(stock.industryPercentage, props.portfolio.scoringRules.industryPercentage);
                                    return (
                                        <tr key={index}>
                                            <td>{stock.symbol}</td>
                                            <td className={stock.score > 0 ? 'good' : stock.score < 0  ? 'bad' : null}>{stock.score}</td>
                                            <td>{stock.description}</td>
                                            <td>{stock.sector}</td>
                                            <td>{stock.industry}</td>
                                            <td>{stock.lastPrice}</td>
                                            <td>{stock.quantity}</td>
                                            <td>{stock.earningsPerShare}</td>
                                            <td>{stock.dividendPerShare}</td>
                                            <td>{stock.costBasis}</td>
                                            <td>{stock.currentValue}</td>
                                            <td className={summaryScore > 0 ? 'good' : summaryScore < 0  ? 'bad' : null}>{stock.summaryScore}</td>
                                            <td className={priceEarningsRatioScore > 0 ? 'good' : priceEarningsRatioScore < 0  ? 'bad' : null}>{stock.priceEarningsRatio}</td>
                                            <td className={dividendPriceRatioScore > 0 ? 'good' : dividendPriceRatioScore < 0  ? 'bad' : null}>{stock.dividendPriceRatio}</td>
                                            <td className={dividendEarningsRatioScore > 0 ? 'good' : dividendEarningsRatioScore < 0  ? 'bad' : null}>{stock.dividendEarningsRatio}</td>
                                            <td className={stockPercentageScore > 0 ? 'good' : stockPercentageScore < 0  ? 'bad' : null}>{stock.stockPercentage}</td>
                                            <td className={sectorPercentageScore > 0 ? 'good' : sectorPercentageScore < 0  ? 'bad' : null}>{stock.sectorPercentage}</td>
                                            <td className={industryPercentageScore > 0 ? 'good' : industryPercentageScore < 0  ? 'bad' : null}>{stock.industryPercentage}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="card-footer text-light d-flex p-2 justify-content-around">
                    <span className="text-warning">Orange denotes a negative score</span>
                    <span className="text-danger">Blue denotes a positive score</span>
                </div>
            </div>
        </div>
    );
}

export default StockChart;
