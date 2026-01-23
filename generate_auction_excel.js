import ExcelJS from 'exceljs';
import path from 'path';

const players = [
    "Sagar",
    "Abhi",
    "Aj",
    "Samrat",
    "Chirag oswal",
    "Viru",
    "Rushab"
];

const data = {
    "Chirag": {
        "Sagar": 70, "Abhi": 70, "Aj": 30, "Samrat": 30, "Chirag oswal": 50, "Viru": 50, "Rushab": 35
    },
    "Sagar": {
        "Sagar": 60, "Abhi": 60, "Aj": 15, "Samrat": 15, "Chirag oswal": 50, "Viru": 60, "Rushab": 15
    },
    "Samrat": {
        "Sagar": 50, "Abhi": 50, "Aj": 25, "Samrat": 25, "Chirag oswal": 50, "Viru": 50, "Rushab": 35
    },
    "Abhishek": {
        "Sagar": 60, "Abhi": 60, "Aj": 40, "Samrat": 40, "Chirag oswal": 40, "Viru": 60, "Rushab": 25
    }
};

async function generateExcel() {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Auction Bids');

    // Add headers
    const senders = Object.keys(data);
    const headerRow = ["Player Name", ...senders];
    sheet.addRow(headerRow);

    // Style header row
    const firstRow = sheet.getRow(1);
    firstRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    firstRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
    };
    firstRow.alignment = { horizontal: 'center' };

    // Add data rows
    players.forEach(player => {
        const rowData = [player];
        senders.forEach(sender => {
            rowData.push(data[sender][player]);
        });
        sheet.addRow(rowData);
    });

    // Formatting
    sheet.columns.forEach((col, index) => {
        col.width = 15;
        if (index > 0) {
            col.numFmt = '#,##0"k"';
            col.alignment = { horizontal: 'center' };
        } else {
            col.width = 20;
            col.font = { bold: true };
        }
    });

    // Borders for all cells
    sheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });
    });

    const fileName = 'Auction_Bids.xlsx';
    const filePath = path.join(process.cwd(), fileName);
    await workbook.xlsx.writeFile(filePath);
    console.log(`Excel file created successfully: ${filePath}`);
}

generateExcel().catch(err => {
    console.error('Error generating Excel:', err);
    process.exit(1);
});
