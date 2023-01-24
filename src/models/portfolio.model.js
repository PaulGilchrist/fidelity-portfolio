/*
portfolio = {
    currentValue: number,
    portfolioOverviewFileDate: date,
    screenFileDate: date,
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
    stocks: [
        {
            costBasis: number,
            currentValue: number,
            description: string
            dividendPerShare: number,
            dividendRatio: number,
            dividendYieldPercent: number,
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
},
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