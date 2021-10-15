// Read D365 export file, change PII data and write to new file
"use strict";
const fs = require('fs');
const readline = require('readline');

// Configuration
const input = 'transactions.csv';
let header = true;

// Global variables
let credits = 0;
let debits = 0;
let checks = 0;
let creditCard = 0;
let energy = 0;
let other = 0;
let payroll = 0;
let retirement = 0;
// Start one year prior to today's date
let startDate = new Date();
startDate.setMonth(startDate.getMonth() - 12);
console.log(`\nStartDate: ${startDate.toLocaleString()}`);

// Create our number formatter.
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  // These options are needed to round to whole numbers if that's what you want.
  // minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
  // maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
});

let lineReader = readline.createInterface({
  input: fs.createReadStream(input)
})

const main = async () => {
  // If the file exists, erase its contents
  lineReader.on('close', closeHandler);
  lineReader.on('line', lineHandler);
};

const closeHandler = () => {
  console.log(``);
  console.log(`Credits: ${currencyFormatter.format(credits)}`);
  console.log(`Debits:  ${currencyFormatter.format(debits)}`);
  console.log(``);
  // console.log(`Payroll:  ${currencyFormatter.format(payroll)}`);
  console.log(`Checks:  ${currencyFormatter.format(checks)}`);
  console.log(`   Cabin payment`);
  console.log(`   Cell service`);
  console.log(`   Homeowners association fees`);
  console.log(`   Property taxes`);
  console.log(`Credit Card:  ${currencyFormatter.format(creditCard)}`);
  console.log(`   Discretionary`);
  console.log(`   Insurance & registrations (home and auto)`);
  console.log(`   Internet`);
  console.log(`   Food`);
  console.log(`   Pets (food/medical)`);
  console.log(`   Water & sewer`);
  console.log(`   Yard fertilization`);
  console.log(`Gas & Electric:  ${currencyFormatter.format(energy)}`);
  console.log(`Retirement Savings:  ${currencyFormatter.format(retirement)}`);
  console.log(`Other:  ${currencyFormatter.format(other)}`);
  console.log(``);
  process.exit(0);
}

const lineHandler = (line) => {
  // Replace PII with new fake data, but retain identifiers
  if(header) {
    header = false;
    return;
  }
  // Sum credits and debits
  const lineArray = line.split(',');
  const transactionType = lineArray[0];
  const transactionDate = new Date(lineArray[1]);
  if(transactionDate >= startDate) {
    const description = lineArray[3];
    const amount = Number(lineArray[4]);
    if(amount > 0) {
      credits += amount;  
    } else {
      debits += amount;
    }
    switch(description) {
      case '"CONSUMERS ENERGY ONLINE PMT"':
        energy += amount;
        break;
      case '"BANK OF AMERICA  ONLINE PMT"':
        creditCard += amount;
        break;
      case '"FID BKG SVC LLC  MONEYLINE"':
        retirement += amount;
        break;
      case '"PULTE HOMES      PAYROLL"':
        payroll += amount;
        break;
      default:
        if(transactionType === 'CHECK') {
          checks += amount;
        } else {
          other += amount;
        }
    }
  }
}

main();
