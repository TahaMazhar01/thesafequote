import ExcelJS from "exceljs";

// Excel cells are explicitly strings. CSV needs a separate formula-injection guard.
export function csvCell(value: unknown) {
  let text = String(value ?? "").replace(/\u0000/g, "");
  if (/^[\s\uFEFF]*[=+@-]/u.test(text) || /^[\t\r\n]/u.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}
export async function exportTable(format: "csv" | "xlsx", headers: string[], rows: string[][]) {
  if (format === "csv") return Buffer.from("\uFEFF" + [headers, ...rows].map(row => row.map(csvCell).join(",")).join("\r\n") + "\r\n", "utf8");
  const book = new ExcelJS.Workbook();
  book.creator = "The Safe Quote";
  const sheet = book.addWorksheet("Leads", { views: [{ state: "frozen", ySplit: 1 }] });
  sheet.columns = headers.map(header => ({ header, width: Math.min(38, Math.max(20, header.length + 3)) }));
  rows.forEach(row => sheet.addRow(row));
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: rows.length + 1, column: headers.length } };
  sheet.eachRow((row, index) => {
    row.height = index === 1 ? 30 : 24;
    row.eachCell(cell => {
      cell.numFmt = "@";
      cell.font = { name: "Calibri", size: 11, bold: index === 1, color: { argb: index === 1 ? "FFFFFFFF" : "FF193442" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: index === 1 ? "FF285866" : index % 2 ? "FFF0F5F7" : "FFFFFFFF" } };
      cell.alignment = { vertical: "middle", wrapText: true };
    });
  });
  return Buffer.from(await book.xlsx.writeBuffer());
}
