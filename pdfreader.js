import fs from 'fs';
import mysql from 'mysql2/promise';
import pdfjsLib from 'pdfjs-dist/build/pdf.js';

async function extractInfoFromPDF(pdfPath) {
  const loadingTask = pdfjsLib.getDocument(pdfPath);
  const pdfDoc = await loadingTask.promise;

  let workersInfo = [];

  for (let i = 0; i < pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i + 1);
    const textContent = await page.getTextContent();
    const textItems = textContent.items.map(item => item.str).join(' ');

    const regex = /(\d+\.\d+|\d+)\s+(\d+)\s+([A-Z\s]+)\s+([A-Z]+)\s+([A-Z\s]+)\s+([A-Z\s]+)\s+[A-Z]/gi;
    let match;
    while ((match = regex.exec(textItems)) !== null) {
      const worker = {
        date: match[1],
        id: match[2],
        name: match[3].trim(),
        company: match[4],
        function1: match[5],
        subfunction: match[6].trim()
      };
      workersInfo.push(worker);
    }
  }

  return workersInfo;
}

async function insertIntoDatabase(workersInfo) {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root', // replace with your MySQL username
    password: 'sind10', // replace with your MySQL password
    database: 'workers_db' // replace with your database name
  });

  const query = `
    INSERT INTO workers (date, worker_id, name, company, function1, subfunction)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  for (const worker of workersInfo) {
    await connection.execute(query, [worker.date, worker.id, worker.name, worker.company, worker.function1, worker.subfunction]);
  }

  await connection.end();
}

async function main() {
  try {
    const pdfPath = 'C:/Users/Marce/OneDrive/Documentos/project/escalas/ESCALA 31-05-2024 OFICIAL - DIA.pdf';
    const workersInfo = await extractInfoFromPDF(pdfPath);
    await insertIntoDatabase(workersInfo);
    console.log('Data successfully inserted into the database.');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
