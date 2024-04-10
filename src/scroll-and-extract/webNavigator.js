import puppeteer from "puppeteer";
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { createFolder } from './fileManager.js';

const rmdirAsync = promisify(fs.rmdir);

export async function scrollAndExtract(urlLoja, folderCliente, resenhasFolderPath) {
    const folderPath = path.join(resenhasFolderPath, folderCliente);
    await createFolder(resenhasFolderPath);
    await createFolder(folderPath);

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

        const data = await page.$$eval('div.RHo1pe span.bp9Aid, div.RHo1pe .h3YV2d, div.RHo1pe div.iXRFPc', divs => {
            return divs.map(div => {
                if (div.classList.contains('bp9Aid')) {
                    return { type: 'data', value: div.innerText.trim() };
                } else if (div.classList.contains('h3YV2d')) {
                    return { type: 'comentario', value: div.innerText.trim() };
                } else if (div.classList.contains('iXRFPc')) {
                    return { type: 'ariaLabel', value: div.getAttribute('aria-label').trim() };
                }
            }).filter(item => item !== undefined);
        });


        await browser.close();

        // Organizando os dados em pares de "data" e "comentário"
        const pairs = [];
        let currentAvaliacao = null
        let currentData = null

        data.forEach(item => {
            if (item.type === 'ariaLabel') {
                currentAvaliacao = item.value;
            } else if (item.type === 'data') {
                currentData = item.value;
            } else if (item.type === 'comentario') {
                const pair = {
                    data: currentData,
                    comentario: item.value,
                    ariaLabel: currentAvaliacao
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
    } finally {
        await browser.close()
    }
}