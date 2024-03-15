import { BehaviorSubject, Subject } from 'rxjs';
import { /*read, */ utils, writeFileXLSX } from 'xlsx';
import XlsxExport from './exportXlsx';
const assetContext = import.meta.glob('../assets/miRNA-seq/Bowtie2/03. DE miRNAs/*/*');
type DE_Folder_Data_Type = {
  headers:string[],
  title:string,
  body:string[][]
}
type ProjectInfoType = {
  'Project ID':string,
  'Library Kit':string,
  'miRNA DB':string,
  Date:string,
  Institute:string,
  Customer:string,
  Organism:string,
  Genome:string,
}
interface TableStyle{
  headers:string[],
  body:string[][],
  [propName:string]:any
}
interface MicroRNA_countTab {
  tabs:string[],
  tabsTable:TableStyle[]
}
const _ReadAlignmentSubject$ = new BehaviorSubject({});
const _handleRawReadsFolder$ = new BehaviorSubject({});
const _transferMeg$ = new Subject<any>();
const _visualization_Plot$ = new BehaviorSubject({});
const _CPM_PCA_Info$ = new BehaviorSubject({});
const _DE_Folder_Info$ = new BehaviorSubject({});
const _Project_info_Subject$ = new BehaviorSubject({});
const _export_raw_table_different_expression_XLSX$ = new Subject<boolean>();
const DE_folder_compare_name:string[] = [];
const DE_folder_Data:DE_Folder_Data_Type[] = [];
const conditionSort:any = [];
import { pre_alignment_qaqc, adaptor_trimming, base_trimming, post_alignment, microRNA_counts, CPM_Normalized_counts, CPM_PCA, Project_info } from './getData';

const handleQCReadAlignmentfolder = async() => {
  const readAlignmentTitle = ['Raw reads', 'Adaptor trimmed','Base trimming', 'Alignment'];
  const handleFinish_pre_alignment_qaqc = handleSplitTxt(pre_alignment_qaqc);
  for(let i = 0 ; handleFinish_pre_alignment_qaqc.body.length > i ; i++){
    conditionSort.push({
      name: handleFinish_pre_alignment_qaqc.body[i][0],
      order: handleFinish_pre_alignment_qaqc.body[i][1]
    })
  };
  //@ts-ignore
  conditionSort.sort((a,b)=> {if(b.order > a.order) return -1 });
  const handleFinish_adaptor_trimming = handleSplitTxt(adaptor_trimming);
  const handleFinish_base_trimming = handleSplitTxt(base_trimming);
  const handleFinish_post_alignment = handle_post_alignment(post_alignment);
  const miRNATabs = {
    tabs: readAlignmentTitle,
    tabsTable: [handleFinish_pre_alignment_qaqc, handleFinish_adaptor_trimming, handleFinish_base_trimming, handleFinish_post_alignment]
  }
  await _ReadAlignmentSubject$.next(miRNATabs);
};
const handle_post_alignment = (post_alignment:string) => {
  const finish_post_alignment:TableStyle = handleSplitTxt(post_alignment);
  const headers:string[] = [];
  finish_post_alignment.headers.forEach((header:string) => {
    switch(header){
      case 'Total alignments':
        headers.push('Total alignments reads');
        break;
      case 'Aligned':
        headers.push('%Aligned');
        break;
      case 'Total unaligned':
        headers.push('Total unaligned reads');
        break;
      case 'Unaligned':
        headers.push('%Unaligned')
        break;
      case 'Total unique':
        headers.push('Total unique')
        break;
      case "Unique":
        headers.push('%Unique');
        break;
      case "Total non-unique":
        headers.push('Total non-unique read');
        // headers.push('Total nonUnique read');
        break;
      case "Non-unique":
        headers.push('%Non-unique')
        break;
      default:
        headers.push(header)
    }
    finish_post_alignment.headers = headers;
  });
  return finish_post_alignment
};
const handleRawReadsFolder = () => {
  const microRNA_countTitle = ['Raw_Reads', 'Normalized_Reads'];
  const handleFinish_microRNA_counts =  handleSplitTxt(microRNA_counts);
  const handleFinish_CPM_Normalized_counts = handleSplitTxt(CPM_Normalized_counts);
  const microRNA_countTab = {
    tabs: microRNA_countTitle,
    tabsTable:[handleFinish_microRNA_counts, handleFinish_CPM_Normalized_counts]
  }
  graphPlotVisualization(handleFinish_CPM_Normalized_counts, microRNA_countTab);
}
const handleProject = ()=>{
  const splitSpaceProject_info = Project_info.split(/\n/);
  const project_info_Txt:string[] = [];
  const project_txt_Resolve:ProjectInfoType = {
    'Project ID':'',
    'Library Kit':'',
    'miRNA DB':'',
    Date:'',
    Institute:'',
    Customer:'',
    Organism:'',
    Genome:'',
  };
  for(let i = 0 ; splitSpaceProject_info.length > i ;i++){
    const splitR_Project_info = splitSpaceProject_info[i].split(/\r/)[0];
    if(splitR_Project_info.length > 1){
      project_info_Txt.push(splitR_Project_info)
    }
  }
  project_info_Txt.forEach((item, index) => {
    switch (item){
      case 'Project ID':
        project_txt_Resolve['Project ID'] = project_info_Txt[index + 1];
        break
      case 'Date':
        project_txt_Resolve.Date = project_info_Txt[index + 1];
        break
      case "Institute":
        project_txt_Resolve.Institute = project_info_Txt[index + 1];
        break
      case "Customer":
        project_txt_Resolve.Customer = project_info_Txt[index + 1];
        break
      case "Organism":
        project_txt_Resolve.Organism = project_info_Txt[index + 1];
        break
      case "Library Kit":
        project_txt_Resolve['Library Kit'] = project_info_Txt[index + 1];
        break
      case "Genome":
        project_txt_Resolve.Genome = project_info_Txt[index + 1];
        break
      case "miRNA DB":
        if(index + 1 <= project_info_Txt.length){
          project_txt_Resolve['miRNA DB'] = project_info_Txt[index + 1];
        }
        break
    }
  })
  _Project_info_Subject$.next(project_txt_Resolve);
};
type MiRNA_display_normal_count_Type = {
  [propName:string]:number
}

const graphPlotVisualization = async(normalized_count:TableStyle, microRNA_countTab:MicroRNA_countTab) => {
  if(!normalized_count.headers || !normalized_count.body) return;
  // const headersSort = normalized_count.headers.filter((header, i)=> { if(i > 5)return header } );
  const headersSort:string[] = normalized_count.headers.filter((header, i)=> { if(i > 5)return header } );
  const normalized_Info:number[][] = [];
  const normalized_RNA_title:string[] = [];
  for( let i = 0 ; normalized_count.body.length > i ; i++ ){
    normalized_Info[i] = [];
    const miRNA_display_normal_count:MiRNA_display_normal_count_Type = {};
    normalized_count.body[i].forEach((body, index)=>{ 
      if(index === 5 ) {
        normalized_RNA_title.push(body)
      };
      if(index > 5){
        // 
        const body_number = Number(body);
        const numberBody = body_number + 1;
        const log10Body = Math.log10(numberBody);
        miRNA_display_normal_count[normalized_count.headers[index]] = log10Body;
        normalized_Info[i].push(log10Body);
        // const numberBody = body_number + 1;
        // const log10Body = Math.log10(numberBody);
        // normalized_Info[i].push(log10Body);
    }});
  }
  const microRNA_Info = {
    tabs: microRNA_countTab.tabs,
    tabsTable: microRNA_countTab.tabsTable,
    log: normalized_Info
  };
  await _handleRawReadsFolder$.next(microRNA_Info);
  await _visualization_Plot$.next({headers: headersSort, info: normalized_Info, miRNA_title: normalized_RNA_title, sortOrder: conditionSort});
}
const handleSplitTxt = (tableInfo:string) => {
  const miRNATable:TableStyle = {
    headers:[],
    body:[]
  };
  const split_tableInfo = tableInfo.split(/\n/);
  for(let i = 0 ; split_tableInfo.length > i ; i++){
    const removeSpace_split_tableInfo = split_tableInfo[i].split(/\t/);
    const removeR_split_tableInfo = removeSpace_split_tableInfo.map((item) => item.split(/\r/)[0]);
    if(removeR_split_tableInfo.length === 1) continue;
    if(i === 0){
      miRNATable.headers = removeR_split_tableInfo;
    }else{
      miRNATable.body[i - 1] = [];
      miRNATable.body[i - 1] = removeR_split_tableInfo;
    }
  }
  return miRNATable
};
const handle_CPM_PCA = () => {
  const pca_data:TableStyle = handleSplitTxt(CPM_PCA);
  pca_data.sortOrder = conditionSort;
  _CPM_PCA_Info$.next(pca_data);
}
const handleDE_Folder = async () => {
  const assetContextKeys = Object.keys(assetContext); 
  assetContextKeys.forEach((key:string)=>{
    const assetContent_keySplit = key.split(/\//);
    DE_folder_compare_name.push(assetContent_keySplit[assetContent_keySplit.length - 1 - 1])
  })
  for (let i = 0 ; DE_folder_compare_name.length > i ; i++){
    const { default:readyTxt } = await import(`../assets/miRNA-seq/Bowtie2/03. DE miRNAs/${DE_folder_compare_name[i]}/gene_list.txt?raw`);
    const tempTxt = await handleSplitTxt(readyTxt);
    const de_txtTableInfo:DE_Folder_Data_Type={
      headers:tempTxt.headers,
      title:DE_folder_compare_name[i],
      body:tempTxt.body
    };
    DE_folder_Data.push(de_txtTableInfo);
  }
  await _DE_Folder_Info$.next({'title_Group': DE_folder_compare_name, 'info': DE_folder_Data});
}
const exportRawTable_different_expression = () => {
  _export_raw_table_different_expression_XLSX$.next(true)
};
const exportXlsx = async(readFile:any[][], fileName:string, sheetsName:string[])=> await XlsxExport(readFile, fileName, sheetsName );
const transferHandleFinishMeg = (handleInfo:MicroRNA_countTab) => _transferMeg$.next(handleInfo);
export const dataService = {
  handleProject,
  handleQCReadAlignmentfolder,
  handleRawReadsFolder,
  handle_CPM_PCA,
  transferHandleFinishMeg,
  handleDE_Folder,
  exportXlsx,
  exportRawTable_different_expression,
  ReadAlignmentSubject$: _ReadAlignmentSubject$.asObservable(),
  handleRawReadsFolder$: _handleRawReadsFolder$.asObservable(),
  visualization_Plot$: _visualization_Plot$.asObservable(),
  export_raw_table_different_expression_XLSX$: _export_raw_table_different_expression_XLSX$.asObservable(),
  transferMeg$: _transferMeg$.asObservable(),
  CPM_PCA_Info$: _CPM_PCA_Info$.asObservable(),
  DE_Folder_Info$: _DE_Folder_Info$.asObservable(),
  Project_info_Subject$:_Project_info_Subject$.asObservable(),
} 