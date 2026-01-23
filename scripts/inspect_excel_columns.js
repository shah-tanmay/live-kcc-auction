
import "dotenv/config";
import xlsx from "xlsx";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXCEL_FILE = path.join(__dirname, "..", "KCC Tournament Season #5 (Responses).xlsx");

function inspectExcelColumns() {
  console.log(`\n📄 Reading Excel file: ${EXCEL_FILE}`);
  
  const workbook = xlsx.readFile(EXCEL_FILE);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Get headers
  const headers = [];
  const range = xlsx.utils.decode_range(worksheet['!ref']);
  for(let C = range.s.c; C <= range.e.c; ++C) {
    const address = xlsx.utils.encode_cell({c:C, r:range.s.r}); // 0 is first row
    const cell = worksheet[address];
    if(cell && cell.v) headers.push(cell.v);
  }

  console.log("Headers found:");
  headers.forEach((h, i) => console.log(`${i}: ${h}`));
}

inspectExcelColumns();
