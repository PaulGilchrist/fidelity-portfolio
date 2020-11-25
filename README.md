# Fidelity Portfolio Analysis

Loads your Fidelity Portfolio and Screener data, combines them, and runs an analysis on the quality and diversification of your portfolio

## Getting Started

1. From [Fidelity's website](https://research2.fidelity.com/fidelity/screeners/commonstock/landing.asp?) load existing or create a new "Screen" with the following criteria.  Criteria must be added in this order, as the order they are added determines the order the columns appear in the resulting data
   * "Company Value - P/E - Price/TTM Earnings" choosing all categories "Very Low" through "Very High"
   * "Analyst Opinions - Equity Summary Score from StarMine from Fefinitiv" choosing all categories "Very Bearish" through "Very Bullish"
   * "Basic Company Facts / Index" choosing all 3 indexes "DJIA", "NASDAQ 100" and "S&P 500"

2. Add up to 5 stocks manually that may not have been returned from the search results

3. Select "Save to My Screens" for later reuse

4. Download the Screen's "Search Criteria" and "Basic Facts" data

5. Open the file in Excel and save each of the two tabs as separate "CSV (Comma delimited) (*.csv)" files.  "SaveAs" is disabled unless "enable Editing" has first been selected.

6. Download your [Profile's Positions](https://oltx.fidelity.com/ftgw/fbc/oftop/portfolio#positions) "Overview" data

7. Swith to this application and import that same profile positions overview data file

8. Import the two previous saved Screen "Search Criteria" and "Basic Facts" data files.  This data will merge together with your portfolio data
