let fs = require("fs");
require("chromedriver");
let swd = require("selenium-webdriver");
let bldr = new swd.Builder();
let driver = bldr.forBrowser("chrome").build();

let cFile = process.argv[2];
let uToAdd = process.argv[3];

(async function(){
    try{
        await driver.manage().setTimeouts({implicit: 100000, pageLoad:100000})
        let data = await fs.promises.readFile(cFile);
        let {user, pwd, url} = JSON.parse(data);
        await driver.get(url);
        let unInputWillBeFPromise = driver.findElement(swd.By.css("#input-1"));
        let psInputWillBeFPromise = driver.findElement(swd.By.css("#input-2"));
        let unNpsE1 = await Promise.all([unInputWillBeFPromise, psInputWillBeFPromise]);
        let uNameWillBeSendPromise = unNpsE1[0].sendKeys(user);
        let pWillBeSendPromise = unNpsE1[1].sendKeys(pwd);
        await Promise.all([uNameWillBeSendPromise, pWillBeSendPromise]);
        let loginBtn = await driver.findElement(swd.By.css("button[data-analytics=LoginPassword]"));
        await loginBtn.click();
        //console.log("We have logged in");    
        let adminLinkanchor = await driver.findElement(swd.By.css("a[data-analytics=NavBarProfileDropDownAdministration]"));
        let adminPageUrl = await adminLinkanchor.getAttribute("href");
        await driver.get(adminPageUrl);
        // let manageTabs = await driver.findElements(swd.By.css(".administration header ul li"));
        //await driver.navigate().refresh();
        let manageTabs = await driver.findElements(swd.By.css("ul.nav-tabs li"));
        await manageTabs[1].click();
    }catch(err){
        console.log(err);
    }
})()