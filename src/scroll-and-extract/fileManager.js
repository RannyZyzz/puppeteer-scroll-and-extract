import fs from 'fs';
import { promisify } from 'util';

const mkdirAsync = promisify(fs.mkdir);
const writeFileAsync = promisify(fs.writeFile);

export async function createFolder(folderPath) {
    try {
        await mkdirAsync(folderPath);
    } catch (err) {
        if (err.code !== 'EEXIST') {
            throw err;
        }
    }
}

export async function writeCSVFile(filePath, data) {
    const csvData = data.map(pair => `"${pair.data}";"${pair.comentario}";"${pair.ariaLabel}"`).join('\n');
    await writeFileAsync(filePath, '"Data";"Comentário";"Avaliação"\n' + csvData);
}