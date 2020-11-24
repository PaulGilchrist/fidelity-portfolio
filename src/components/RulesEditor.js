import React, {useState} from 'react';
import { useForm } from "react-hook-form";

import './RulesEditor.css'

/*
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

const RulesEditor = (props) => {

    const [isOpen, setIsOpen] = useState(true);
    const { register, errors, handleSubmit } = useForm({ mode: 'onBlur' });

    return (
        <div className="rules-editor ">
            <div className="card">
                <div className="card-heading bg-dark text-light d-flex p-2">
                    Rules Editor
                </div>
                <div className={`card-body ${!isOpen ? 'collapse' : null}`}>
                    Chart will highlight values above the minimum and maximum values enmtered here and score them based on the weight given. Scoring will be positive if direction is set to 'High' and above the max, and negative if below the min.  Scoring will be negative if direction is set to 'Low' and above the max, and positive if below the min.<br/>
                    <br/>
                    <form onSubmit={handleSubmit(props.onSubmit)}>
                        <table id="stockTable" className="table table-condensed table-striped table-hover font-size-small">
                            <thead>
                                <tr>
                                    <th className="name-column">Rule Name</th>
                                    <th>Min</th>
                                    <th>Max</th>
                                    <th>High/Low</th>
                                    <th>Weight</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Summary Score</td>
                                    <td><input className="form-control" disabled defaultValue="N/A"/></td>
                                    <td><input className="form-control" disabled defaultValue="N/A"/></td>
                                    <td><input className="form-control" disabled defaultValue="N/A"/></td>
                                    <td><input className="form-control" name="summaryScoreWeight" type="number" defaultValue={props.scoringRules.summaryScore.weight} min="0" max="100" required step="1"/></td>
                                </tr>
                                <tr>
                                    <td>Price / Earnings Ratio (P/E)</td>
                                    <td><input className="form-control" name="priceEarningsRatioMin" type="number" defaultValue={props.scoringRules.priceEarningsRatio.min} min="1" max="100" required step="0.1"/></td>
                                    <td><input className="form-control" name="priceEarningsRatioMax" type="number" defaultValue={props.scoringRules.priceEarningsRatio.max} min="1" max="100" required step="0.1"/></td>
                                    <td>
                                        <select className="form-control" name="priceEarningsRatioHighValueBetter" defaultValue={props.scoringRules.priceEarningsRatio.highValueBetter}>
                                            <option value='true'>High</option>
                                            <option value='false'>Low</option>
                                        </select>
                                    </td>
                                    <td><input className="form-control" name="priceEarningsRatioWeight" type="number" defaultValue={props.scoringRules.priceEarningsRatio.weight} min="0" max="100" required step="1"/></td>
                                </tr>
                                <tr>
                                    <td>Dividend Payout Percentage</td>
                                    <td><input className="form-control" name="dividendPayoutPercentageMin" type="number" defaultValue={props.scoringRules.dividendPayoutPercentage.min} min="0.01" max="1" required step="0.01"/></td>
                                    <td><input className="form-control" name="dividendPayoutPercentageMax" type="number" defaultValue={props.scoringRules.dividendPayoutPercentage.max} min="0.01" max="1" required step="0.01"/></td>
                                    <td>
                                        <select className="form-control" name="dividendPayoutPercentageHighValueBetter" defaultValue={props.scoringRules.dividendPayoutPercentage.highValueBetter}>
                                            <option value='true'>High</option>
                                            <option value='false'>Low</option>
                                        </select>
                                    </td>
                                    <td><input className="form-control" name="dividendPayoutPercentageWeight" type="number" defaultValue={props.scoringRules.dividendPayoutPercentage.weight} min="0" max="100" required step="1"/></td>
                                </tr>
                                <tr>
                                    <td>Dividend Yield Percentage</td>
                                    <td><input className="form-control" name="dividendYieldPercentageMin" type="number" defaultValue={props.scoringRules.dividendYieldPercentage.min} min="0.001" max="1" required step="0.001"/></td>
                                    <td><input className="form-control" name="dividendYieldPercentageMax" type="number" defaultValue={props.scoringRules.dividendYieldPercentage.max} min="0.001" max="1" required step="0.001"/></td>
                                    <td>
                                        <select className="form-control" name="dividendYieldPercentageHighValueBetter" defaultValue={props.scoringRules.dividendYieldPercentage.highValueBetter}>
                                            <option value='true'>High</option>
                                            <option value='false'>Low</option>
                                        </select>
                                    </td>
                                    <td><input className="form-control" name="dividendYieldPercentageWeight" type="number" defaultValue={props.scoringRules.dividendYieldPercentage.weight} min="0" max="100" required step="1"/></td>
                                </tr>
                                <tr>
                                    <td>Stock Percentage</td>
                                    <td><input className="form-control" name="stockPercentageMin" type="number" defaultValue={props.scoringRules.stockPercentage.min} min="0.001" max="1" required step="0.001"/></td>
                                    <td><input className="form-control" name="stockPercentageMax" type="number" defaultValue={props.scoringRules.stockPercentage.max} min="0.001" max="1" required step="0.001"/></td>
                                    <td>
                                        <select className="form-control" name="stockPercentageHighValueBetter" defaultValue={props.scoringRules.stockPercentage.highValueBetter}>
                                            <option value='true'>High</option>
                                            <option value='false'>Low</option>
                                        </select>
                                    </td>
                                    <td><input className="form-control" name="stockPercentageWeight" type="number" defaultValue={props.scoringRules.stockPercentage.weight} min="0" max="100" required step="1"/></td>
                                </tr>
                                <tr>
                                    <td>Sector Percentage</td>
                                    <td><input className="form-control" name="sectorPercentageMin" type="number" defaultValue={props.scoringRules.sectorPercentage.min} min="0.01" max="1" required step="0.01"/></td>
                                    <td><input className="form-control" name="sectorPercentageMax" type="number" defaultValue={props.scoringRules.sectorPercentage.max} min="0.01" max="1" required step="0.01"/></td>
                                    <td>
                                        <select className="form-control" name="sectorPercentageHighValueBetter" defaultValue={props.scoringRules.sectorPercentage.highValueBetter}>
                                            <option value='true'>High</option>
                                            <option value='false'>Low</option>
                                        </select>
                                    </td>
                                    <td><input className="form-control" name="sectorPercentageWeight" type="number" defaultValue={props.scoringRules.sectorPercentage.weight} min="0" max="100" required step="1"/></td>
                                </tr>
                                <tr>
                                    <td>Industry Percentage</td>
                                    <td><input className="form-control" name="industryPercentageMin" type="number" defaultValue={props.scoringRules.industryPercentage.min} min="0.001" max="1" required step="0.001"/></td>
                                    <td><input className="form-control" name="industryPercentageMax" type="number" defaultValue={props.scoringRules.industryPercentage.max} min="0.001" max="1" required step="0.001"/></td>
                                    <td>
                                        <select className="form-control" name="industryPercentageHighValueBetter" defaultValue={props.scoringRules.industryPercentage.highValueBetter}>
                                            <option value='true'>High</option>
                                            <option value='false'>Low</option>
                                        </select>
                                    </td>
                                    <td><input className="form-control" name="industryPercentageWeight" type="number" defaultValue={props.scoringRules.industryPercentage.weight} min="0" max="100" required step="1"/></td>
                                </tr>
                                <tr>
                                    <td>Overall Score</td>
                                    <td><input className="form-control" name="overallScoreMin" type="number" defaultValue={props.scoringRules.overallScore.min} min="1" max="100" required step="1"/></td>
                                    <td><input className="form-control" name="overallScoreMax" type="number" defaultValue={props.scoringRules.overallScore.max} min="1" max="100" required step="1"/></td>
                                    <td><input className="form-control" disabled defaultValue="N/A"/></td>
                                    <td><input className="form-control" disabled defaultValue="N/A"/></td>
                                </tr>
                            </tbody>
                        </table>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default RulesEditor;
