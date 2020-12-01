const webdriver = require('selenium-webdriver'),
    By = webdriver.By,
    until = webdriver.until;

const driver = new webdriver.Builder()
      .forBrowser('firefox')
      .usingServer('http://localhost:4444/wd/hub')
      .build();

driver.get('http://www.google.com');
