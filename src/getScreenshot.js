import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { urlStores } from './urlStores.js';

// Função para criar a pasta se não existir
const mkdirAsync = promisify(fs.mkdir);

async function saveScreenshot(urlLoja, folderCliente) {
    const currentDate = new Date();
    const formateDate = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;
    const __dirname = path.dirname(new URL(import.meta.url).pathname);
    const screenshotFolderPath = path.join(__dirname, 'screenshots');

    try {
        await mkdirAsync(screenshotFolderPath);
    } catch (err) {
        if (err.code !== 'EEXIST') {
            throw err;
        }
    }

    const folderName = folderCliente;
    const folderPath = path.join(screenshotFolderPath, folderName);

    try {
        await mkdirAsync(folderPath);
    } catch (err) {
        if (err.code !== 'EEXIST') {
            throw err;
        }
    }

    // Inicia o navegador
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navega até a página desejada
    await page.goto(urlLoja);

    // Captura o screenshot
    await page.screenshot({ path: path.join(folderPath, `${formateDate}.png`), fullPage: true });

    // Fecha o navegador
    await browser.close();
}

// Função para processar as URLs em sequência
async function processURLs(urls) {
    for (const url of urls) {
        const urlLoja = url[1];
        const folderCliente = url[0];

        try {
            await saveScreenshot(urlLoja, folderCliente);
            console.log(`${folderCliente} : Screenshot salvo com sucesso!`);
        } catch (err) {
            console.error(`${folderCliente} : Erro ao salvar o screenshot:`, err);
        }
    }
}

// Limita o número de instâncias do navegador abertas simultaneamente
const CONCURRENT_INSTANCES = 3;
const chunks = [];
for (let i = 0; i < urlStores.length; i += CONCURRENT_INSTANCES) {
    chunks.push(urlStores.slice(i, i + CONCURRENT_INSTANCES));
}

// Processa as URLs em sequência, com um número limitado de instâncias do navegador abertas simultaneamente
for (const chunk of chunks) {
    await processURLs(chunk);
}
