import puppeteer from 'puppeteer';


async function scrollAndExtract() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.setViewport({ width: 1080, height: 1024 });

    await page.goto('https://play.google.com/store/apps/details?id=br.com.mobilesaude.unimed.valedosinos&hl=pt_BR&gl=US', { waitUntil: 'networkidle2' });

    await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight);
        window.scrollBy(0, window.innerHeight);
    });

    await page.keyboard.press('Enter');

    await page.click('#yDmH0d > c-wiz.SSPGKf.Czez9d > div > div > div:nth-child(1) > div > div.wkMJlb.YWi3ub > div > div.qZmL0 > div:nth-child(1) > c-wiz:nth-child(5) > section > div > div.Jwxk6d > div:nth-child(5) > div > div > button > span');

    await page.focus('div.jgIq1')

    await page.evaluate(() => {
        const modal = document.querySelector('div.jgIq1');
        modal.scrollTo(0, modal.scrollHeight); // Rolar para o final do modal
        // Você também pode ajustar o valor de scrollTo conforme necessário
    });

    // let elements = []; 

    // async function extractInnerText() {
    //     const extractedElements = await page.$$eval('.VfPpkd-vQzf8d', elements => {
    //         return elements.map(element => element.innerText);
    //     });
    //     elements = elements.concat(extractedElements);
    // }

    // async function scrollPage() {
    //     await page.evaluate(() => {
    //         window.scrollBy(0, window.innerHeight);
    //     });
    // }

    // // Defina o intervalo de tempo em milissegundos para rolar a página
    // const scrollInterval = 1000; // Rolar a página a cada 2 segundos

    // // Rolar a página periodicamente
    // const scrollIntervalId = setInterval(async () => {
    //     await scrollPage();
    //     await extractInnerText();
    //     //incluir lógica para breakar o código quando chegar ao fim da pagina
    // }, scrollInterval);

    // // Aguarde um tempo suficiente para rolar a página e coletar os elementos
    // await new Promise(resolve => setTimeout(resolve, 30000));


    // clearInterval(scrollIntervalId);

    // fs.writeFileSync('resultado.txt', elements.join('\n'), 'utf-8');
    // console.log("Resultados salvos em 'resultados.txt'");

    // await browser.close();
}

scrollAndExtract();