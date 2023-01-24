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

const getSummaryScore = (stock, scoringRules) => {
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

export const getStockScore = (stock, scoringRules) => {
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
        score += getSummaryScore(stock, scoringRules);
    }
    return score;
}
