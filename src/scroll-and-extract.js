import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { urlStores } from './urlStores.js';

// process.setMaxListeners(15);
const mkdirAsync = promisify(fs.mkdir);
const rmdirAsync = promisify(fs.rmdir);

async function scrollAndExtract(urlLoja, folderCliente) {

    const __dirname = path.dirname(new URL(import.meta.url).pathname);
    const resenhasFolderPath = path.join(__dirname, 'resenhas');

    try {
        await mkdirAsync(resenhasFolderPath);
    } catch (err) {
        if (err.code !== 'EEXIST') {
            throw err;
        }
    }

    const folderName = folderCliente;
    const folderPath = path.join(resenhasFolderPath, folderName);

    try {
        await mkdirAsync(folderPath);
    } catch (err) {
        if (err.code !== 'EEXIST') {
            throw err;
        }
    }

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
        await page.setViewport({ width: 1080, height: 1024 });
        await page.goto(`${urlLoja}`, { waitUntil: 'networkidle2' });
        await page.evaluate(() => {
            window.scrollBy(0, window.innerHeight);
            window.scrollBy(0, window.innerHeight);
        });
        await page.keyboard.press('Enter');
        await page.click('#yDmH0d > c-wiz.SSPGKf.Czez9d > div > div > div:nth-child(1) > div > div.wkMJlb.YWi3ub > div > div.qZmL0 > div:nth-child(1) > c-wiz:nth-child(5) > section > div > div.Jwxk6d > div:nth-child(5) > div > div > button > span');
        await page.focus('div.jgIq1')
        await page.waitForSelector('#yDmH0d > div.VfPpkd-Sx9Kwc.cC1eCc.UDxLd.PzCPDd.HQdjr.VfPpkd-Sx9Kwc-OWXEXe-FNFY6c > div.VfPpkd-wzTsW > div > div > div > div > div.fysCi');
        async function scrollForDuration(page, duration) {
            const endTime = Date.now() + duration;
            while (Date.now() < endTime) {
                await page.evaluate(() => {
                    const modal = document.querySelector('#yDmH0d > div.VfPpkd-Sx9Kwc.cC1eCc.UDxLd.PzCPDd.HQdjr.VfPpkd-Sx9Kwc-OWXEXe-FNFY6c > div.VfPpkd-wzTsW > div > div > div > div > div.fysCi');
                    modal.scrollTo(0, modal.scrollHeight);
                });
                await new Promise(resolve => setTimeout(resolve, 1000)); // Aguarda 1 segundo
            }
        }


        await scrollForDuration(page, 10000); // Scroll por 10 segundos
        const data = await page.$$eval('span.bp9Aid, .h3YV2d, div.iXRFPc', divs => {
            return divs.map(div => {
                if (div.classList.contains('bp9Aid')) {
                    return { type: 'data', value: div.innerText.trim() };
                } else if (div.classList.contains('h3YV2d')) {
                    console.log(div.innerText.trim())
                    return { type: 'comentario', value: div.innerText.trim() };
                } else if (div.classList.contains('iXRFPc')) {
                    return { type: 'ariaLabel', value: div.getAttribute('aria-label').trim() };
                }
            }).filter(item => item !== undefined);
        });
        await browser.close();

        // Organizando os dados em pares de "data" e "comentário"
        const pairs = [];
        let currentData;
        let currentComentario;
        data.forEach(item => {
            if (item.type === 'data') {
                currentData = item.value;
            } else if (item.type === 'comentario') {
                currentComentario = item.value;
            } else if (item.type === 'ariaLabel') {
                const pair = {
                    data: currentData,
                    comentario: currentComentario,
                    ariaLabel: item.value
                };
                pairs.push(pair);
            }
        });

        const csvData = pairs.map(pair => `"${pair.data}";"${pair.comentario}";"${pair.ariaLabel}"`).join('\n');
        fs.writeFileSync(`${folderPath}/dados-${folderCliente}.csv`, '"Data";"Comentário";"Avaliação"\n' + csvData);

        console.log('Dados foram escritos no arquivo dados.csv');
    } catch (err) {
        console.error(`${folderCliente} : Erro ao salvar a resenha:`, err);
        // Se ocorrer um erro, exclui o diretório folderCliente
        try {
            await rmdirAsync(folderPath, { recursive: true });
            console.log(`Diretório ${folderCliente} excluído.`);
        } catch (removeErr) {
            console.error(`Erro ao excluir o diretório ${folderCliente}:`, removeErr);
        }
    }
}

async function processURLs(urls) {
    for (const url of urls) {
        const urlLoja = url[1];
        const folderCliente = url[0];

        try {
            await scrollAndExtract(urlLoja, folderCliente);
            console.log(`${folderCliente} : Resenha salva com sucesso!`);
        } catch (err) {
            console.error(`${folderCliente} : Erro ao salvar a resenha:`, err);
        }
    }
}

// Limita o número de instâncias do navegador abertas simultaneamente
const CONCURRENT_INSTANCES = 2;
const chunks = [];
for (let i = 0; i < urlStores.length; i += CONCURRENT_INSTANCES) {
    chunks.push(urlStores.slice(i, i + CONCURRENT_INSTANCES));
}

for (const chunk of chunks) {
    await processURLs(chunk);
}