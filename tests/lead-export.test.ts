import { test } from "node:test";
import assert from "node:assert/strict";
import ExcelJS from "exceljs";
import { csvCell, exportTable } from "../src/lib/lead-export";
test("CSV escapes quotes and formula prefixes including whitespace",()=>{
  assert.equal(csvCell('one,"two"'), '"one,""two"""');
  for(const value of ["=1+1"," +123","\t@SUM(A1)","-5","\n=1"])assert.ok(csvCell(value).startsWith('"\''));
});
test("Excel preserves literal strings, leading zeroes and long answers",async()=>{
  const bytes=await exportTable("xlsx",["ZIP","Phone","Message"],[["00123","+12345678","=HYPERLINK(\"https://example.com\")"]]);
  const book=new ExcelJS.Workbook();await book.xlsx.load(bytes as unknown as ExcelJS.Buffer);
  const sheet=book.getWorksheet("Leads")!;
  assert.equal(sheet.getCell("A2").value,"00123");assert.equal(sheet.getCell("B2").value,"+12345678");assert.equal(sheet.getCell("C2").type,ExcelJS.ValueType.String);
  assert.equal(sheet.rowCount,2);assert.equal(sheet.views[0].state,"frozen");assert.ok(sheet.autoFilter);
});
