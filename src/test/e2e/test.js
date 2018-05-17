require('chromedriver');
const webdriver = require('selenium-webdriver');
const Promise = require('bluebird');

const driver = new webdriver.Builder()
  .forBrowser('chrome')
  .build();

const rowsArray = new Array();

const handleRow = function (row, i) {
  rowsArray[i] = new Array();
  return row.findElements(webdriver.By.tagName('td')).then(columns =>
    // for every column
    Promise.each(columns, (column, j) => columns[j].getText().then((number) => {
      console.log(`Row: ${i}`);
      console.log(`Column:${j}`);
      console.log(`Number:${number}`);
      rowsArray[i][j] = parseInt(number);
    })));
};

const calcIndex = function (arr) {
  for (let j = 0; j < arr.length; j++) {
    // calculate left numbers sum
    const leftn = arr.slice(0, j);
    // add left
    let sumleftn = 0;
    if (leftn.length !== 0) {
      sumleftn = leftn.reduce((acc, val) => acc + val);
    }

    // calculate right numbers sum
    const rightn = arr.slice(j + 1);
    // add right;
    let sumrightn = 0;
    if (rightn.length !== 0) {
      sumrightn = rightn.reduce((acc, val) => acc + val);
    }

    if (sumrightn === sumleftn) {
      return j;
    }
  }

  return null;
};

const calculateChallengeAnswers = function (row, i) {
  const challengeAnswer = calcIndex(row);
  console.log(`Challenge ${i + 1} answer: ${challengeAnswer}`);
  return driver.findElements(webdriver.By.tagName('input')).then((inputFields) => {
    inputFields[i].sendKeys(challengeAnswer);
  });
};

describe('Read the array challenge', () => {
  before(() => driver.get('http://localhost:3000'));

  after(() => {
    setTimeout(function () {
      return driver.quit();
    }, 5000);
  });

  it('Clicks the render challenge button', () => driver.findElement(webdriver.By.xpath('//*[@id="home"]/div/div/button')).click());

  it('Reads the table rows', () => driver.findElements(webdriver.By.tagName('tr'))
    .then(rows => Promise.each(rows, handleRow)));

  it('Prints the rows', () => console.log(rowsArray));
  it('Calculates the challenge answers', () => Promise.each(rowsArray, calculateChallengeAnswers));
  it('Submits the challenges ', () => driver.findElement(webdriver.By.xpath('//*[@id="challenge"]/div/div/div[2]/div/div[2]/button')).click());
});
