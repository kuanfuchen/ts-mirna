import { /*read, */ utils, writeFileXLSX } from 'xlsx';
const xlsxExport =  async(readFile:any[][], fileName:string, sheetsName:string[])=> {
  let sheets_Title:string[] = [];
  let excelName = '';
  if(fileName === 'readAndAlignment'){
    sheets_Title = ['Raw reads', 'Adaptor Trimmed', 'Base Trimming', 'Alignment'];
    excelName = 'Read And Alignment'
  }else if(fileName === 'difference_expression'){
    sheets_Title = sheetsName;
    excelName = 'Difference Expression'
  }else if(fileName === 'visualization'){
    sheets_Title = sheetsName;
    excelName = 'Visualization'
  }
  const export_wb = utils.book_new();
  for(let i = 0 ; readFile.length > i ; i++){
    const ws = await utils.aoa_to_sheet(readFile[i]);
    await utils.book_append_sheet(export_wb, ws, sheets_Title[i]);
  }
  writeFileXLSX(export_wb, excelName + '.xlsx');
}
export default xlsxExport