import { scrollAndExtract } from './webNavigator.js';
import { createFolder, writeCSVFile } from './fileManager.js';

export async function processURLs(urls, resenhasFolderPath) {
    for (const url of urls) {
        const [folderCliente, urlLoja] = url;

        if (folderCliente === 'finish') {
            throw new Error('Finish command received.');
        }

        try {
            await scrollAndExtract(urlLoja, folderCliente, resenhasFolderPath, createFolder, writeCSVFile);
            console.log(`${folderCliente} : Resenha salva com sucesso!`);
        } catch (err) {
            console.error(`${folderCliente} : Erro ao salvar a resenha:`, err);
        }
    }
}