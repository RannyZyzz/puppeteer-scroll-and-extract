import puppeteer from 'puppeteer';
import fs from 'fs';

async function scrollAndExtract() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.setViewport({ width: 1080, height: 1024 });

    await page.goto('https://www.olx.com.br/estado-sc/florianopolis-e-regiao?q=macbook%20m1', { waitUntil: 'networkidle2' });

    let elements = [];

    async function extractInnerText() {
        const extractedElements = await page.$$eval('.iWOuRR', elements => {
            return elements.map(element => element.innerText);
        });
        elements = elements.concat(extractedElements);
    }

    async function scrollPage() {
        await page.evaluate(() => {
            window.scrollBy(0, window.innerHeight);
        });
    }

    // Defina o intervalo de tempo em milissegundos para rolar a página
    const scrollInterval = 1000; // Rolar a página a cada 2 segundos

    // Rolar a página periodicamente
    const scrollIntervalId = setInterval(async () => {
        await scrollPage();
        await extractInnerText();
        //incluir lógica para breakar o código quando chegar ao fim da pagina
    }, scrollInterval);

    // Aguarde um tempo suficiente para rolar a página e coletar os elementos
    await new Promise(resolve => setTimeout(resolve, 30000));


    clearInterval(scrollIntervalId);

    fs.writeFileSync('resultado.txt', elements.join('\n'), 'utf-8');
    console.log("Resultados salvos em 'resultados.txt'");

    await browser.close();
}

scrollAndExtract();