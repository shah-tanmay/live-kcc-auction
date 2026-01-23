
import "dotenv/config";
import xlsx from "xlsx";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NO_STATS_JSON = path.join(__dirname, "no_stats_player.json");
const EXCEL_FILE = path.join(__dirname, "..", "KCC Tournament Season #5 (Responses).xlsx");

function normalize(value) {
  if (!value) return "";
  return String(value).trim().toLowerCase();
}

function addPhoneNumbers() {
  console.log(`Reading target players from: ${NO_STATS_JSON}`);
  if (!fs.existsSync(NO_STATS_JSON)) {
    console.error("Target file not found!");
    process.exit(1);
  }
  
  const rawTarget = fs.readFileSync(NO_STATS_JSON, "utf8");
  const targetPlayers = JSON.parse(rawTarget);
  // targetPlayers is likely an array of strings currently

  console.log(`Reading Excel file: ${EXCEL_FILE}`);
  const workbook = xlsx.readFile(EXCEL_FILE);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet);

  // Create lookup map
  const phoneMap = {};
  data.forEach(row => {
    const name = row["Player Name"];
    const phone = row["Phone Number"];
    if (name) {
      phoneMap[normalize(name)] = phone;
    }
  });

  const updatedPlayers = [];
  
  // Handle if targetPlayers is array of strings or objects
  targetPlayers.forEach(p => {
    const name = typeof p === 'string' ? p : p.name;
    const phone = phoneMap[normalize(name)] || "Not Found";
    
    updatedPlayers.push({
      name: name,
      phoneNumber: phone
    });
  });

  console.log("Updated players with phone numbers:");
  updatedPlayers.forEach(p => console.log(`${p.name}: ${p.phoneNumber}`));

  fs.writeFileSync(NO_STATS_JSON, JSON.stringify(updatedPlayers, null, 2));
  console.log(`\nUpdated ${NO_STATS_JSON} successfully.`);
}

addPhoneNumbers();
