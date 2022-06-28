const chromium = require("chrome-aws-lambda");
const Handlebars = require('handlebars');

exports.create = (html, data) => {
    return new Promise(async (resolve, reject) => {
        let browser = await chromium.puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
        });
        
        Handlebars.registerHelper('iff', function(a, operator, b, opts) {
            var bool = false;
            switch(operator) {
               case '!=':
                   bool = a != b;
                   break;
               case '==':
                   bool = a == b;
                   break;
               case '>':
                   bool = a > b;
                   break;
               case '<':
                   bool = a < b;
                   break;
               default:
                   throw "Unknown operator " + operator;
            }

            if (bool) {
                return opts.fn(this);
            } else {
                return opts.inverse(this);
            }
        });
        
        /**
         * 
         */
        const template = Handlebars.compile(html);
        const templateFinally = template(data);
        const page = await browser.newPage();
        await page.setContent(templateFinally);
        /**
         *
         */
        const buffer = await page.pdf({
            format: "letter",
            printBackground: true,
            margin: "0.5cm",
        });
        if (!buffer) {
            reject('A failure occurred and the pdf could not be generated.');
        }
        /**
         * 
         */
        resolve(buffer);
    });
}

