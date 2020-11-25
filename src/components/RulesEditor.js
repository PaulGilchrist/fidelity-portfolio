import React from 'react';
import { useForm } from "react-hook-form";

import './RulesEditor.css'

const RulesEditor = (props) => {

    const { register, handleSubmit } = useForm({ mode: 'onBlur' });

    const handleFormSubmit = (values) => {
        // Values are the actual form fields that use ref={register()}
        const scoringRules = {
            dividendPayoutPercentage: { highValueBetter: values.dividendPayoutPercentageHighValueBetter === 'true', min: Number(values.dividendPayoutPercentageMin), max: Number(values.dividendPayoutPercentageMax), weight: Number(values.dividendPayoutPercentageWeight) },
            dividendYieldPercentage: { highValueBetter: values.dividendYieldPercentageHighValueBetter === 'true', min: Number(values.dividendYieldPercentageMin), max: Number(values.dividendYieldPercentageMax), weight: Number(values.dividendYieldPercentageWeight) },
            industryPercentage: { highValueBetter: values.industryPercentageHighValueBetter === 'true', min: Number(values.industryPercentageMin), max: Number(values.industryPercentageMax), weight: Number(values.industryPercentageWeight) },
            overallScore: { highValueBetter: true, min: Number(values.overallScoreMin), max: Number(values.overallScoreMax) }, // Summation of all the other scores with min/max used only for highlighting chart
            priceEarningsRatio: { highValueBetter: values.priceEarningsRatioHighValueBetter === 'true', min: Number(values.priceEarningsRatioMin), max: Number(values.priceEarningsRatioMax), weight: Number(values.priceEarningsRatioWeight) },
            sectorPercentage: { highValueBetter: values.sectorPercentageHighValueBetter === 'true', min: Number(values.sectorPercentageMin), max: Number(values.sectorPercentageMax), weight: Number(values.sectorPercentageWeight) },
            stockPercentage: { highValueBetter: values.stockPercentageHighValueBetter === 'true', min: Number(values.stockPercentageMin), max: Number(values.stockPercentageMax), weight: Number(values.stockPercentageWeight) },
            summaryScore: { weight: Number(values.summaryScoreWeight) } // Neutral will be 0 and each rating above adds 'weight' and below subtracts 'weight'
        }
        props.onSubmit(scoringRules);
    }

    return (
        <div className="rules-editor">
            <div className="card">
                <div className="card-heading bg-dark text-light d-flex p-2">
                    Rules Editor
                </div>
                <div className="card-body">
                    The stock portfolio table will highlight cells below the minimum or above the maximum values enmtered here, scoring them based on the weight given. Scoring will be positive 'Weight' value if the direction is set to 'High' and above 'Max', or negative if below the 'Min'.  Scoring will be negative 'Weight' value if the direction is set to 'Low' and above the 'Max', or positive if below the 'Min'.<br/>
                    <br/>
                    <form onSubmit={handleSubmit(handleFormSubmit)}>
                        <table id="stockTable" className="table table-condensed table-striped table-hover font-size-small">
                            <thead>
                                <tr>
                                    <th className="name-column">Rule Name</th>
                                    <th>Min</th>
                                    <th>Max</th>
                                    <th>Direction</th>
                                    <th>Weight</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Summary Score</td>
                                    <td><input className="form-control" disabled defaultValue="N/A"/></td>
                                    <td><input className="form-control" disabled defaultValue="N/A"/></td>
                                    <td><input className="form-control" disabled defaultValue="N/A"/></td>
                                    <td>
                                        <input className="form-control" name="summaryScoreWeight" type="number" defaultValue={props.scoringRules.summaryScore.weight} min="0" max="100" required step="1" ref={register()}/>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Price / Earnings Ratio (P/E)</td>
                                    <td><input className="form-control" name="priceEarningsRatioMin" type="number" defaultValue={props.scoringRules.priceEarningsRatio.min} min="1" max="100" required step="0.1" ref={register()}/></td>
                                    <td><input className="form-control" name="priceEarningsRatioMax" type="number" defaultValue={props.scoringRules.priceEarningsRatio.max} min="1" max="100" required step="0.1" ref={register()}/></td>
                                    <td>
                                        <select className="form-control" name="priceEarningsRatioHighValueBetter" defaultValue={props.scoringRules.priceEarningsRatio.highValueBetter} ref={register()}>
                                            <option value='true'>High</option>
                                            <option value='false'>Low</option>
                                        </select>
                                    </td>
                                    <td><input className="form-control" name="priceEarningsRatioWeight" type="number" defaultValue={props.scoringRules.priceEarningsRatio.weight} min="0" max="100" required step="1" ref={register()}/></td>
                                </tr>
                                <tr>
                                    <td>Dividend Payout Percentage</td>
                                    <td><input className="form-control" name="dividendPayoutPercentageMin" type="number" defaultValue={props.scoringRules.dividendPayoutPercentage.min} min="0.01" max="1" required step="0.01" ref={register()}/></td>
                                    <td><input className="form-control" name="dividendPayoutPercentageMax" type="number" defaultValue={props.scoringRules.dividendPayoutPercentage.max} min="0.01" max="1" required step="0.01" ref={register()}/></td>
                                    <td>
                                        <select className="form-control" name="dividendPayoutPercentageHighValueBetter" defaultValue={props.scoringRules.dividendPayoutPercentage.highValueBetter} ref={register()}>
                                            <option value='true'>High</option>
                                            <option value='false'>Low</option>
                                        </select>
                                    </td>
                                    <td><input className="form-control" name="dividendPayoutPercentageWeight" type="number" defaultValue={props.scoringRules.dividendPayoutPercentage.weight} min="0" max="100" required step="1" ref={register()}/></td>
                                </tr>
                                <tr>
                                    <td>Dividend Yield Percentage</td>
                                    <td><input className="form-control" name="dividendYieldPercentageMin" type="number" defaultValue={props.scoringRules.dividendYieldPercentage.min} min="0.001" max="1" required step="0.001" ref={register()}/></td>
                                    <td><input className="form-control" name="dividendYieldPercentageMax" type="number" defaultValue={props.scoringRules.dividendYieldPercentage.max} min="0.001" max="1" required step="0.001" ref={register()}/></td>
                                    <td>
                                        <select className="form-control" name="dividendYieldPercentageHighValueBetter" defaultValue={props.scoringRules.dividendYieldPercentage.highValueBetter} ref={register()}>
                                            <option value='true'>High</option>
                                            <option value='false'>Low</option>
                                        </select>
                                    </td>
                                    <td><input className="form-control" name="dividendYieldPercentageWeight" type="number" defaultValue={props.scoringRules.dividendYieldPercentage.weight} min="0" max="100" required step="1" ref={register()}/></td>
                                </tr>
                                <tr>
                                    <td>Stock Percentage</td>
                                    <td><input className="form-control" name="stockPercentageMin" type="number" defaultValue={props.scoringRules.stockPercentage.min} min="0.001" max="1" required step="0.001" ref={register()}/></td>
                                    <td><input className="form-control" name="stockPercentageMax" type="number" defaultValue={props.scoringRules.stockPercentage.max} min="0.001" max="1" required step="0.001" ref={register()}/></td>
                                    <td>
                                        <select className="form-control" name="stockPercentageHighValueBetter" defaultValue={props.scoringRules.stockPercentage.highValueBetter} ref={register()}>
                                            <option value='true'>High</option>
                                            <option value='false'>Low</option>
                                        </select>
                                    </td>
                                    <td><input className="form-control" name="stockPercentageWeight" type="number" defaultValue={props.scoringRules.stockPercentage.weight} min="0" max="100" required step="1" ref={register()}/></td>
                                </tr>
                                <tr>
                                    <td>Sector Percentage</td>
                                    <td><input className="form-control" name="sectorPercentageMin" type="number" defaultValue={props.scoringRules.sectorPercentage.min} min="0.01" max="1" required step="0.01" ref={register()}/></td>
                                    <td><input className="form-control" name="sectorPercentageMax" type="number" defaultValue={props.scoringRules.sectorPercentage.max} min="0.01" max="1" required step="0.01" ref={register()}/></td>
                                    <td>
                                        <select className="form-control" name="sectorPercentageHighValueBetter" defaultValue={props.scoringRules.sectorPercentage.highValueBetter} ref={register()}>
                                            <option value='true'>High</option>
                                            <option value='false'>Low</option>
                                        </select>
                                    </td>
                                    <td><input className="form-control" name="sectorPercentageWeight" type="number" defaultValue={props.scoringRules.sectorPercentage.weight} min="0" max="100" required step="1" ref={register()}/></td>
                                </tr>
                                <tr>
                                    <td>Industry Percentage</td>
                                    <td><input className="form-control" name="industryPercentageMin" type="number" defaultValue={props.scoringRules.industryPercentage.min} min="0.001" max="1" required step="0.001" ref={register()}/></td>
                                    <td><input className="form-control" name="industryPercentageMax" type="number" defaultValue={props.scoringRules.industryPercentage.max} min="0.001" max="1" required step="0.001" ref={register()}/></td>
                                    <td>
                                        <select className="form-control" name="industryPercentageHighValueBetter" defaultValue={props.scoringRules.industryPercentage.highValueBetter} ref={register()}>
                                            <option value='true'>High</option>
                                            <option value='false'>Low</option>
                                        </select>
                                    </td>
                                    <td><input className="form-control" name="industryPercentageWeight" type="number" defaultValue={props.scoringRules.industryPercentage.weight} min="0" max="100" required step="1" ref={register()}/></td>
                                </tr>
                                <tr>
                                    <td>Overall Score</td>
                                    <td><input className="form-control" name="overallScoreMin" type="number" defaultValue={props.scoringRules.overallScore.min} min="0" max="100" required step="1" ref={register()}/></td>
                                    <td><input className="form-control" name="overallScoreMax" type="number" defaultValue={props.scoringRules.overallScore.max} min="0" max="100" required step="1" ref={register()}/></td>
                                    <td><input className="form-control" disabled defaultValue="N/A"/></td>
                                    <td><input className="form-control" disabled defaultValue="N/A"/></td>
                                </tr>
                            </tbody>
                        </table>
                        <button className="btn btn-success" type="submit"><span className="fa fa-check"></span> Save</button>&nbsp;
                    </form>
                </div>
            </div>
        </div>
    );
}

export default RulesEditor;
