let fs = require("fs");
require("chromedriver");
let swd = require("selenium-webdriver");
let bldr = new swd.Builder();
let driver = bldr.forBrowser("chrome").build();
let cFile = process.argv[2];
let questionFile = process.argv[3];
(async function(){
    try{
        await loginHelper();
        let DropDownBtn = await driver.findElement(swd.By.css("a[data-analytics=NavBarProfileDropDown]"));
        await DropDownBtn.click();
        let adminLinkanchor = await driver.findElement(swd.By.css("a[data-analytics=NavBarProfileDropDownAdministration]"));
        await adminLinkanchor.click();
        //loaders=>
        //let adminPageUrl = await adminLinkanchor.getAttribut("href");
        //await driver.get(adminPageUrl);
        //stale element => selected elements were in the page but they are not currently here 
        await waitForLoader();
        let manageTabs = await driver.findElements(swd.By.css(".administration header ul li"));
        await manageTabs[1].click();
        let ManageChallengePage = await driver.getCurrentUrl();
        let questions = require(questionFile);
        //questions = JSON.parse(questions);
        // for(let i=0;i<questions.length;i++){
        //     createNewChallenge(questions[i]);
        // }
        //Json File read
        console.log(questions.length);
        for(let i=0;i<questions.length;i++){
            console.log(i);
            await driver.get(ManageChallengePage)
            await waitForLoader();
            await createNewChallenge(questions[i]);
        }
        //content
        //createchallenge
        //console.log("All code editor have some data");
        //await driver.executeScript("alert('Hello All");
        //challenge Name
        //Description
        //Input Format
        //Constraints
        //Output Format
        //Tags
        //save changes
        //manage tabs    
    }catch(err){
        console.log(err);
    }

})()

async function createNewChallenge(question){
    let createChallenge = await driver.findElement(swd.By.css(".btn.btn-green.backbone.pull-right"));
    await createChallenge.click();
    await waitForLoader();
    //operation => selection, data entry
    let eSelector = ["#name", "textarea.description", "#problem_statement-container .CodeMirror textarea", "#input_format-container .CodeMirror textarea", "#constraints-container .CodeMirror textarea", "#output_format-container .CodeMirror textarea", "#tags_tag"];
    //elementwillBefoundPromise
    //let AllSelectors = [];
    //for(let i=0;i<eSelector.length;i++){
    //let elemWillBeFoundPromise = driver.findElement(swd.By.css(eSelector[i]));
    //}
    let eWillBeSelectedPromise = eSelector.map(function(s){
        return driver.findElement(swd.By.css(s));
    })
    let AllElements = await Promise.all(eWillBeSelectedPromise); 
    let NameWillAddedPromise = AllElements[0].sendKeys(question["Challenge Name"]);
    let descWillAddedPromise = AllElements[1].sendKeys(question["Description"]);
    await Promise.all([NameWillAddedPromise, descWillAddedPromise]);
    //console.log("name and desc added");
    //code editor
    await editorHandler("#problem_statement-container .CodeMirror div",AllElements[2], question["Problem Statement"]);
    await editorHandler("#input_format-container .CodeMirror div",AllElements[3], question["Input Format"]);
    await editorHandler("#constraints-container .CodeMirror div",AllElements[4], question["Constraints"]);
    await editorHandler("#output_format-container .CodeMirror div",AllElements[5], question["Output Format"]);
    // tags
    let TagsInput = AllElements[6];
    await TagsInput.sendKeys(question["Tags"]);
    await TagsInput.sendKeys(swd.Key.ENTER);
    // submit
    let submitBtn = await driver.findElement(swd.By.css(".save-challenge.btn.btn-green"));
    await submitBtn.click();
}

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
async function editorHandler(parentSelector, element, data){
let parent = await driver.findElement(swd.By.css(parentSelector));
//selenium => browser js execute
await driver.executeScript("arguments[0].style.height='10px'", parent);
await element.sendKeys(data);
}