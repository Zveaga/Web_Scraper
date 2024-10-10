const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

let links = [];

/**
 * Uses Puppeteer to retrieve the page html content.\
 * Uses Cheerio to extract the relevant data. 
 */
const getLinks = async function () {
	const URL = 'https://www.funda.nl/zoeken/koop?selected_area=%5B%22den-haag%22%5D&object_type=%5B%22parking%22%5D';
	let hasNextPage = true;
	try {
		const browser = await puppeteer.launch();
		const page = await browser.newPage();
		await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36');
		await page.goto(URL, { waitUntil: 'networkidle2' });

		// while (hasNextPage) {
			const html = await page.content();
			const $ = cheerio.load(html);

			const linkSelector = '[data-test-id="object-image-link"]'; 
			const $links = $(linkSelector);
			links = Array.from($links.map((_, elem) => $(elem).attr('href')));
			console.log(links, '\n\n');			

			// const nextButtonSelector = 'li[data-v-b8a43de0]:not([class])';
			const nextButtonSelector = 'li[data-v-b8a43de0]:last-of-type';
			const nextButtonDisabled = await page.evaluate((nextButtonSelector) => {
				const button = document.querySelector(nextButtonSelector);
				return button && button.classList.contains('disabled');
			});			
			console.log(nextButtonDisabled)
			const nextButton = await page.$(nextButtonSelector);

			// for (let i = 1; i < nextButtons.length; ++i) {
			// 	await nextButtons[i].click();
			// 	await page.waitForSelector(linkSelector);
			// 	const html = await page.content();
			// 	const $ = cheerio.load(html);

			// 	const $links = $('[data-test-id="object-image-link"]');
			// 	const newLinks = Array.from($links.map((_, elem) => $(elem).attr('href')));
			// 	console.log(newLinks, '\n\n');			
			// 	links = [...links, ...newLinks];
			// }

			console.log(nextButton);
		// }
		await browser.close();
	} catch (error) {
		console.error(error);
	}
};

/**
 * Loads the webhook from a local file.
 * @returns The webhook URL
 */
const loadWebHook = function() {
	const pathToFile = path.join(__dirname, 'webhook.txt');
	try {
		const webhook = fs.readFileSync(pathToFile, 'utf-8').trim();
		// console.log(webhook);
		return webhook;
		
	} catch (error) {
		console.error('Error reading the webhook URL file:', error);
		return null;
	}
};

const webhook = loadWebHook();

/**
 * Send the payload to Discord via Webhooks.
 */
const sendToDiscord = function(contentToSend) {
	if (webhook) {
		axios.post(webhook, {
			content: contentToSend.join('\n')
		})
		.then(response => {
			console.log('Message sent successfully');
		})
		.catch(error => {  
			console.error('Error sending message:', error);
		});
	} else {
		console.error('Failed to load Webhook');
	}
};

/**
 * This async IIFE (Immediately Invoked Function Expression) fetches links from a specified source
 * and then sends them to a Discord server via a webhook.
 * 
 * Note: The variable `links` is expected to be populated by the `getLinks` function before being sent.
 */
(async () => {
	await getLinks();
	// console.log(links);
	sendToDiscord(links);
})();


// getLinks()
// 	.then(() => console.log('Content fetched and logged successfully.'))
// 	.catch(err => console.error('Failed to fetch content:', err));




// const getData = async function () {
// 	try {
// 		const { data } = await axios.get('https://www.funda.nl/zoeken/koop?selected_area=%5B%22den-haag%22%5D&object_type=%5B%22parking%22%5D', {
// 			headers: {
// 				 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
// 			}
// 		});
// 		console.log(data);
		
// 		const $ = cheerio.load(data);
// 		const links = [];
// 		$('a').each((_, elem) => {
// 			const href = $(elem).attr('href');

// 			console.log(href);
// 		});

// 		// const {document} = new JSDOM(data).window;

// 		// const links = document.querySelector()
// 		// console.log(data);


// 	} catch (error) {
// 		console.error('Request failed');
// 		throw error;
// 	}

// };

// getData();



		// Extract hrefs from all anchor elements on the page
		// const links = await page.evaluate(function() {
        //     // Select all anchor elements and map their hrefs to an array
        // 	return Array.from(document.querySelectorAll('a[href*="funda.nl/detail/"]')).map(link => link.href);
        // });
		

		// console.log(links);
		// const 

		// const prettyHTML = prettier.format(html, { parser: 'html' });
		// console.log(prettyHTML);


// $('a[href*="funda.nl/detail/"]').each((_, elem) => {
		// 	const href = $(elem).attr('href');
		// 	linksSet.add(href);
		// 	// console.log(href);
		// });
		// const links = Array.from(linksSet);
		// console.log(links);