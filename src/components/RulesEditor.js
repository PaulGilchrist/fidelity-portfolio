import React from 'react';
import {useForm} from "react-hook-form";
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
                    The stock portfolio table will highlight cells below the minimum or above the maximum values entered here, scoring them based on the weight given. Direction impacts the score as follows:<br/>
                    <br/>
                    <b>High</b>
                    <ul>
                        <li>Weight added to score when value &gt; Max</li>
                        <li>Weight removed from score when value &lt; Min</li>
                    </ul>
                    <b>Low</b>
                    <ul>
                        <li>Weight added to score when value &lt; Min</li>
                        <li>Weight removed from score when value &gt; Max</li>
                    </ul>                  
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
                                        <input
                                            className="form-control"
                                            name="summaryScoreWeight"
                                            type="number"
                                            defaultValue={props.scoringRules.summaryScore.weight}
                                            step="1"
                                            max="100"
                                            min="1"
                                            required
                                            {...register("summaryScoreWeight", {
                                                max: { value: 100, message: "Summary Score Weight has a maximum value of 100" },
                                                min: { value: 1, message: "Summary Score Weight has a minimum value of 1" },
                                                required: "Summary Score Weight is required"
                                            })}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td>Price / Earnings Ratio (P/E)</td>
                                    <td><input
                                        className="form-control"
                                        name="priceEarningsRatioMin"
                                        type="number"
                                        defaultValue={props.scoringRules.priceEarningsRatio.min}
                                        step="0.1"
                                        max="100"
                                        min="1"
                                        required
                                        {...register("priceEarningsRatioMin", {
                                            max: { value: 100, message: "Price Earnings Ratio Min has a maximum value of 100" },
                                            min: { value: 1, message: "Price Earnings Ratio Min has a minimum value of 1" },
                                            required: "Price Earnings Ratio Min is required"
                                        })}
                                    /></td>
                                    <td><input
                                        className="form-control"
                                        name="priceEarningsRatioMax"
                                        type="number"
                                        defaultValue={props.scoringRules.priceEarningsRatio.max}
                                        step="0.1"
                                        max="100"
                                        min="1"
                                        required
                                        {...register("priceEarningsRatioMax", {
                                            max: { value: 100, message: "Price Earnings Ratio Max has a maximum value of 100" },
                                            min: { value: 1, message: "Price Earnings Ratio Max has a minimum value of 1" },
                                            required: "Price Earnings Ratio Max is required"
                                        })}
                                    /></td>
                                    <td>
                                        <select
                                            className="form-control"
                                            name="priceEarningsRatioHighValueBetter"
                                            defaultValue={props.scoringRules.priceEarningsRatio.highValueBetter}
                                            {...register("priceEarningsRatioHighValueBetter", {
                                                required: true
                                            })}
                                        >
                                            <option value='true'>High</option>
                                            <option value='false'>Low</option>
                                        </select>
                                    </td>
                                    <td><input
                                        className="form-control"
                                        name="priceEarningsRatioWeight"
                                        type="number"
                                        defaultValue={props.scoringRules.priceEarningsRatio.weight}
                                        step="1"
                                        max="100"
                                        min="1"
                                        required
                                        {...register("priceEarningsRatioWeight", {
                                            max: { value: 100, message: "Price Earnings Ratio Weight has a maximum value of 100" },
                                            min: { value: 1, message: "Price Earnings Ratio Weight has a minimum value of 1" },
                                            required: "Price Earnings Ratio Weight is required"
                                        })}
                                    /></td>
                                </tr>
                                <tr>
                                    <td>Dividend Payout Percentage</td>
                                    <td><input
                                        className="form-control"
                                        name="dividendPayoutPercentageMin"
                                        type="number"
                                        defaultValue={props.scoringRules.dividendPayoutPercentage.min}
                                        step="0.01"
                                        max="1"
                                        min="0.01"
                                        required
                                        {...register("dividendPayoutPercentageMin", {
                                            max: { value: 1, message: "Dividend Payout Percentage Min has a maximum value of 1" },
                                            min: { value: 0.01, message: "Dividend Payout Percentage Min has a minimum value of 0.01" },
                                            required: "Dividend Payout Percentage Min is required"
                                        })}
                                    /></td>
                                    <td><input
                                        className="form-control"
                                        name="dividendPayoutPercentageMax"
                                        type="number"
                                        defaultValue={props.scoringRules.dividendPayoutPercentage.max}
                                        step="0.01"
                                        max="1"
                                        min="0.01"
                                        required
                                        {...register("dividendPayoutPercentageMax", {
                                            max: { value: 1, message: "Dividend Payout Percentage Max has a maximum value of 1" },
                                            min: { value: 0.01, message: "Dividend Payout Percentage Max has a minimum value of 0.01" },
                                            required: "Dividend Payout Percentage Max is required"
                                        })}
                                    /></td>
                                    <td>
                                        <select
                                            className="form-control"
                                            name="dividendPayoutPercentageHighValueBetter"
                                            defaultValue={props.scoringRules.dividendPayoutPercentage.highValueBetter}
                                            {...register("dividendPayoutPercentageHighValueBetter", {
                                                required: true
                                            })}
                                        >
                                            <option value='true'>High</option>
                                            <option value='false'>Low</option>
                                        </select>
                                    </td>
                                    <td><input
                                        className="form-control"
                                        name="dividendPayoutPercentageWeight"
                                        type="number"
                                        defaultValue={props.scoringRules.dividendPayoutPercentage.weight}
                                        step="1"
                                        max="100"
                                        min="1"
                                        required
                                        {...register("dividendPayoutPercentageWeight", {
                                            max: { value: 100, message: "Dividend Payout Percentage Weight has a maximum value of 100" },
                                            min: { value: 1, message: "Dividend Payout Percentage Weight has a minimum value of 1" },
                                            required: "Dividend Payout Percentage Weight is required"
                                        })}
                                    /></td>
                                </tr>
                                <tr>
                                    <td>Dividend Yield Percentage</td>
                                    <td><input
                                        className="form-control"
                                        name="dividendYieldPercentageMin"
                                        type="number"
                                        defaultValue={props.scoringRules.dividendYieldPercentage.min}
                                        step="0.001"
                                        max="1"
                                        min="0.001"
                                        required
                                        {...register("dividendYieldPercentageMin", {
                                            max: { value: 1, message: "Dividend Yield Percentage Min has a maximum value of 1" },
                                            min: { value: 0.001, message: "Dividend Yield Percentage Min has a minimum value of 0.001" },
                                            required: "Dividend Yield Percentage Min is required"
                                        })}
                                    /></td>
                                    <td><input
                                        className="form-control"
                                        name="dividendYieldPercentageMax"
                                        type="number"
                                        defaultValue={props.scoringRules.dividendYieldPercentage.max}
                                        step="0.001"
                                        max="1"
                                        min="0.001"
                                        required
                                        {...register("dividendYieldPercentageMax", {
                                            max: { value: 1, message: "Dividend Yield Percentage Max has a maximum value of 1" },
                                            min: { value: 0.001, message: "Dividend Yield Percentage Max has a minimum value of 0.001" },
                                            required: "Dividend Yield Percentage Max is required"
                                        })}
                                    /></td>
                                    <td>
                                        <select
                                            className="form-control"
                                            name="dividendYieldPercentageHighValueBetter"
                                            defaultValue={props.scoringRules.dividendYieldPercentage.highValueBetter}
                                            {...register("dividendYieldPercentageHighValueBetter", {
                                                required: true
                                            })}
                                        >
                                            <option value='true'>High</option>
                                            <option value='false'>Low</option>
                                        </select>
                                    </td>
                                    <td><input
                                        className="form-control"
                                        name="dividendYieldPercentageWeight"
                                        type="number"
                                        defaultValue={props.scoringRules.dividendYieldPercentage.weight}
                                        step="1"
                                        max="100"
                                        min="1"
                                        required
                                        {...register("dividendYieldPercentageWeight", {
                                            max: { value: 100, message: "Dividend Yield Percentage Weight has a maximum value of 100" },
                                            min: { value: 1, message: "Dividend Yield Percentage Weight has a minimum value of 1" },
                                            required: "Dividend Yield Percentage Weight is required"
                                        })}
                                    /></td>
                                </tr>
                                <tr>
                                    <td>Stock Percentage</td>
                                    <td><input
                                        className="form-control"
                                        name="stockPercentageMin"
                                        type="number"
                                        defaultValue={props.scoringRules.stockPercentage.min}
                                        step="0.001"
                                        max="1"
                                        min="0.001"
                                        required
                                        {...register("stockPercentageMin", {
                                            max: { value: 1, message: "Stock Percentage Min has a maximum value of 1" },
                                            min: { value: 0.001, message: "Stock Percentage Min has a minimum value of 0.001" },
                                            required: "Stock Percentage Min is required"
                                        })}
                                    /></td>
                                    <td><input
                                        className="form-control"
                                        name="stockPercentageMax"
                                        type="number"
                                        defaultValue={props.scoringRules.stockPercentage.max}
                                        step="0.001"
                                        max="1"
                                        min="0.001"
                                        required
                                        {...register("stockPercentageMax", {
                                            max: { value: 1, message: "Stock Percentage Max has a maximum value of 1" },
                                            min: { value: 0.001, message: "Stock Percentage Max has a minimum value of 0.001" },
                                            required: "Stock Percentage Max is required"
                                        })}
                                    /></td>
                                    <td>
                                        <select
                                            className="form-control"
                                            name="stockPercentageHighValueBetter"
                                            defaultValue={props.scoringRules.stockPercentage.highValueBetter}
                                            {...register("stockPercentageHighValueBetter", {
                                                required: true
                                            })}
                                        >
                                            <option value='true'>High</option>
                                            <option value='false'>Low</option>
                                        </select>
                                    </td>
                                    <td><input
                                        className="form-control"
                                        name="stockPercentageWeight"
                                        type="number"
                                        defaultValue={props.scoringRules.stockPercentage.weight}
                                        step="1"
                                        max="100"
                                        min="0"
                                        required
                                        {...register("stockPercentageWeight", {
                                            max: { value: 100, message: "Stock Percentage Weight has a maximum value of 100" },
                                            min: { value: 1, message: "Stock Percentage Weight has a minimum value of 1" },
                                            required: "Stock Percentage Weight is required"
                                        })}
                                    /></td>
                                </tr>
                                <tr>
                                    <td>Sector Percentage</td>
                                    <td><input
                                        className="form-control"
                                        name="sectorPercentageMin"
                                        type="number"
                                        defaultValue={props.scoringRules.sectorPercentage.min}
                                        step="0.01"
                                        max="1"
                                        min="0.01"
                                        required
                                        {...register("sectorPercentageMin", {
                                            max: { value: 1, message: "Sector Percentage Min has a maximum value of 1" },
                                            min: { value: 0.01, message: "Sector Percentage Min has a minimum value of 0.01" },
                                            required: "Sector Percentage Min is required"
                                        })}
                                    /></td>
                                    <td><input
                                        className="form-control"
                                        name="sectorPercentageMax"
                                        type="number"
                                        defaultValue={props.scoringRules.sectorPercentage.max}
                                        step="0.01"
                                        max="1"
                                        min="0.01"
                                        required
                                        {...register("sectorPercentageMax", {
                                            max: { value: 1, message: "Sector Percentage Max has a maximum value of 1" },
                                            min: { value: 0.01, message: "Sector Percentage Max has a minimum value of 0.01" },
                                            required: "Sector Percentage Max is required"
                                        })}
                                    /></td>
                                    <td>
                                        <select
                                            className="form-control"
                                            name="sectorPercentageHighValueBetter"
                                            defaultValue={props.scoringRules.sectorPercentage.highValueBetter}
                                            {...register("sectorPercentageHighValueBetter", {
                                                required: true
                                            })}
                                        >
                                            <option value='true'>High</option>
                                            <option value='false'>Low</option>
                                        </select>
                                    </td>
                                    <td><input
                                        className="form-control"
                                        name="sectorPercentageWeight"
                                        type="number"
                                        defaultValue={props.scoringRules.sectorPercentage.weight}
                                        step="1"
                                        max="100"
                                        min="1"
                                        required
                                        {...register("sectorPercentageWeight", {
                                            max: { value: 100, message: "Sector Percentage Weight has a maximum value of 100" },
                                            min: { value: 1, message: "Sector Percentage Weight has a minimum value of 1" },
                                            required: "Sector Percentage Weight is required"
                                        })}
                                    /></td>
                                </tr>
                                <tr>
                                    <td>Industry Percentage</td>
                                    <td><input
                                        className="form-control"
                                        name="industryPercentageMin"
                                        type="number"
                                        defaultValue={props.scoringRules.industryPercentage.min}
                                        step="0.001"
                                        max="1"
                                        min="0.001"
                                        required
                                        {...register("industryPercentageMin", {
                                            max: { value: 1, message: "Industry Percentage Min has a maximum value of 1" },
                                            min: { value: 0.001, message: "Industry Percentage Min has a minimum value of 0.001" },
                                            required: "Industry Percentage Min is required"
                                        })}
                                    /></td>
                                    <td><input
                                        className="form-control"
                                        name="industryPercentageMax"
                                        type="number"
                                        defaultValue={props.scoringRules.industryPercentage.max}
                                        step="0.001"
                                        max="1"
                                        min="0.001"
                                        required
                                        {...register("industryPercentageMax", {
                                            max: { value: 1, message: "Industry Percentage Max has a maximum value of 1" },
                                            min: { value: 0.001, message: "Industry Percentage Max has a minimum value of 0.001" },
                                            required: "Industry Percentage Max is required"
                                        })}
                                    /></td>
                                    <td>
                                        <select
                                            className="form-control"
                                            name="industryPercentageHighValueBetter"
                                            defaultValue={props.scoringRules.industryPercentage.highValueBetter}
                                            {...register("industryPercentageHighValueBetter", {
                                                required: true
                                            })}
                                        >
                                            <option value='true'>High</option>
                                            <option value='false'>Low</option>
                                        </select>
                                    </td>
                                    <td><input
                                        className="form-control"
                                        name="industryPercentageWeight"
                                        type="number"
                                        defaultValue={props.scoringRules.industryPercentage.weight}
                                        step="1"
                                        max="100"
                                        min="1"
                                        required
                                        {...register("industryPercentageWeight", {
                                            max: { value: 100, message: "Industry Percentage Weight has a maximum value of 100" },
                                            min: { value: 1, message: "Industry Percentage Weight has a minimum value of 1" },
                                            required: "Industry Percentage Weight is required"
                                        })}
                                    /></td>
                                </tr>
                                <tr>
                                    <td>Overall Score</td>
                                    <td><input
                                        className="form-control"
                                        name="overallScoreMin"
                                        type="number"
                                        defaultValue={props.scoringRules.overallScore.min}
                                        step="1"
                                        max="100"
                                        min="0"
                                        required
                                        {...register("overallScoreMin", {
                                            max: { value: 100, message: "Overall Score Min has a maximum value of 100" },
                                            min: { value: 0, message: "Overall Score Min has a minimum value of 0" },
                                            required: "Overall Score Min is required"
                                        })}
                                    /></td>
                                    <td><input
                                        className="form-control"
                                        name="overallScoreMax"
                                        type="number"
                                        defaultValue={props.scoringRules.overallScore.max}
                                        step="1"
                                        max="100"
                                        min="0"
                                        required
                                        {...register("overallScoreMax", {
                                            max: { value: 100, message: "Overall Score Max has a maximum value of 100" },
                                            min: { value: 0, message: "Overall Score Max has a minimum value of 0" },
                                            required: "Overall Score Max is required"
                                        })}
                                    /></td>
                                    <td><input className="form-control" disabled defaultValue="N/A"/></td>
                                    <td><input className="form-control" disabled defaultValue="N/A"/></td>
                                </tr>
                            </tbody>
                        </table>
                        <div className="form-buttons">
                            <button className="btn btn-success" type="submit"><span className="fa fa-check"></span> Save</button>&nbsp;
                            <button className="btn btn-warning" onClick={props.onClose}> Cancel</button>&nbsp;
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default RulesEditor;
