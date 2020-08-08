let fs = require("fs");
require("chromedriver");
let swd = require("selenium-webdriver");
let bldr = new swd.Builder();
let driver = bldr.forBrowser("chrome").build();
let cFile = process.argv[2];
let questionFile = process.argv[3];
let friend = process.argv[4];
(async function(){
    try{
        await loginHelper();
        let DropDownBtn = await driver.findElement(swd.By.css("a[data-analytics=NavBarProfileDropDown]"));
        await DropDownBtn.click();
        let adminLinkanchor = await driver.findElement(swd.By.css("a[data-analytics=NavBarProfileDropDownAdministration]"));
        await adminLinkanchor.click();
        await waitForLoader();
        let manageTabs = await driver.findElements(swd.By.css(".administration header ul li"));
        await manageTabs[1].click();
        const ManageChallengePage = await driver.getCurrentUrl();
        await waitForLoader();
        let allQuestions = require(questionFile);
        let paginations = await driver.findElements(swd.By.css(".pagination ul li"));
        let pages = paginations.length-4;
        while(pages>0){
            let questionArr = await driver.findElements(swd.By.css(".backbone.block-center"));
            let len = questionArr.length;
            for(let i=0;i<len;i++){
                let questionArr = await driver.findElements(swd.By.css(".backbone.block-center"));
                await waitForLoader();        
                await questionArr[i].click();
                await waitForLoader();
                // let tag = await driver.findElement("span.tag");
                await driver.wait(swd.until.elementLocated(swd.By.css("span.tag")));
                //await addModerator();
                await testCases(allQuestions[i]["Testcases"]);
                await driver.get(ManageChallengePage);
            }
            paginations = await driver.findElements(swd.By.css(".pagination ul li"));
            let btnRight = paginations[paginations.length-2];
            pages--;
            if(pages>0)
                await btnRight.click();
        }
    }catch(err){
        console.log(err);
    }

})()

async function loginHelper(){
    await driver.manage().setTimeouts({implicit: 100000, pageLoad:100000});
    let data = await fs.promises.readFile(cFile);
    let {url, pwd, user} = JSON.parse(data);
    //Login page
    await driver.get(url);
    let unInputWillBeFPromise = driver.findElement(swd.By.css("#input-1"));
    let psInputWillBeFPromise = driver.findElement(swd.By.css("#input-2"));
    let unNpsE1 = await Promise.all([unInputWillBeFPromise, psInputWillBeFPromise]);
    let uNameWillBeSendPromise = unNpsE1[0].sendKeys(user);
    let pWillBeSendPromise = unNpsE1[1].sendKeys(pwd);
    await Promise.all([uNameWillBeSendPromise, pWillBeSendPromise]);
    let loginBtn = await driver.findElement(swd.By.css("button[data-analytics=LoginPassword]"));
    await loginBtn.click();
}
async function waitForLoader(){
    let loader = await driver.findElement(swd.By.css("#ajax-msg"));
    await driver.wait(swd.until.elementIsNotVisible(loader));
}
async function gotonext(){
    let btnRight = await driver.findElement(swd.By.css("a[data-attr1=Right]"));
    await btnRight.click();
}
async function testCases(question){
    // let currentPage = await driver.getCurrentUrl();
    let test = await driver.findElement(swd.By.css("li[data-tab=testcases]"));
    //await driver.wait(swd.until.elementIsSelected(test));
    await test.click();  
    await waitForLoader();      
    for(let i=0;i<question.length;i++){
        let addtest = await driver.findElement(swd.By.css(".btn.add-testcase.btn-green"));
        await addtest.click();
        await waitForLoader();
        let inputArea = await driver.findElement(swd.By.css(".input-testcase-row .CodeMirror textarea"));
        let inputParent = await driver.findElement(swd.By.css(".input-testcase-row .CodeMirror div"));
        await driver.executeScript("arguments[0].style.height='10px'", inputParent);
        await inputArea.sendKeys(question[i]["Input"]);
        await inputArea.sendKeys(swd.Key.ENTER);
        let outputArea = await driver.findElement(swd.By.css(".output-testcase-row .CodeMirror textarea"));
        let outputParent = await driver.findElement(swd.By.css(".output-testcase-row .CodeMirror div"));
        await driver.executeScript("arguments[0].style.height='10px'", outputParent);
        await outputArea.sendKeys(question[i]["Output"]);
        await outputArea.sendKeys(swd.Key.ENTER);    
        let tempbtn = await driver.findElement(swd.By.css(".btn.btn-primary.btn-large.save-testcase"));
        await tempbtn.click();
        // await waitForLoader();
        await driver.sleep(5000);
        // await driver.wait(swd.until.elementLocated(swd.By.css("li[data-tab=testcases]")));
        test = await driver.findElement(swd.By.css("li[data-tab=testcases]"));
        // await driver.wait(swd.until.elementIsNotSelected(test));
        await test.click();  
        await waitForLoader();      
    }
    let finbtn = await driver.findElement(swd.By.css(".save-challenge.btn.btn-green"));
    await finbtn.click();
    // // await waitForLoader();
}
async function addModerator(){
    let allOptions = await driver.findElement(swd.By.css("li[data-tab=moderators]"));
    await allOptions.click();
    await waitForLoader();
    let modinput = await driver.findElement(swd.By.css("#moderator"));
    await modinput.sendKeys(friend);
    let modbtn = await driver.findElement(swd.By.css(".btn.moderator-save"));
    await modbtn.click();
    await waitForLoader();
    stnBtn = await driver.findElement(swd.By.css(".save-challenge.btn.btn-green"));
    await stnBtn.click();
    await waitForLoader();
}
