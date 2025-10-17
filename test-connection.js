
require('dotenv').config();
const axios = require('axios');

// Check proxy health
function checkProxyHealth() {
	const proxyUrl = 'https://lu-deno-proxy.deno.dev';
	axios.get(proxyUrl)
		.then(res => {
			console.log('--- Proxy Health Check ---');
			console.log('Status:', res.status);
			console.log('Body:', res.data);
			if (res.status === 200 && res.data.includes('Proxy is Running')) {
				console.log('Proxy is working!');
			} else {
				console.log('Proxy is NOT working!');
			}
			console.log('--------------------------\n');
		})
		.catch(err => {
			console.error('Proxy Health Error:', err.response ? err.response.data : err.message);
		});
}

// Check OpenAI API via proxy

async function checkOpenAIProxy() {
	const openaiProxyUrl = 'https://lu-deno-proxy.deno.dev/api.openai.com/v1/chat/completions';
	const apiKey = process.env.OPENAI_API_KEY || '<YOUR_OPENAI_API_KEY>';
	try {
		const response = await axios.post(openaiProxyUrl, {
			model: 'gpt-4o-mini',
			messages: [
				{ role: 'system', content: 'You are a helpful assistant.' },
				{ role: 'user', content: 'Hello!' }
			]
		}, {
			headers: {
				'Authorization': `Bearer ${apiKey}`,
				'Content-Type': 'application/json'
			}
		});
		console.log('--- OpenAI Proxy Test ---');
		console.log('Status:', response.status);
		console.log('Body:', JSON.stringify(response.data, null, 2));
		if (response.status === 200 && response.data.choices) {
			console.log('Proxy can access OpenAI API!');
		} else {
			console.log('Proxy CANNOT access OpenAI API!');
		}
		console.log('--------------------------\n');
	} catch (err) {
		console.error('OpenAI Proxy Error:', err.response ? err.response.data : err.message);
	}
}

checkProxyHealth();
checkOpenAIProxy();


