import './index.css';
import theKeys from "../JSON/keys.json"
import labels from "../JSON/labels.json"
import { DownloadTableExcel } from "react-export-table-to-excel";
import React, { useRef } from 'react';

function monthByName(monthID: number) {
    let date = new Date();
    let sumDate = date.getMonth() - monthID;
    date.setDate(15);
    date.setMonth(sumDate);
    const month = date.toLocaleString("default", {
      month: "2-digit",
      year: "2-digit",
    });
    return month;
}

function cellColorText(v: string | undefined, labelIndex: number){
    if (labelIndex !== 0) return;
    return v !== "yellow" ? "white" : "black"; 
}

function cellColor(contract: string, value: number, labelIndex: number){
    if (labelIndex !== 0) return;

    let contractValue = 0;
    if(contract==="Start"){
        contractValue = 500;
    } else if(contract === "Lite"){
        contractValue = 1200;
    } else if(contract === "Business"){
        contractValue = 1500;
    } else {
        contractValue = 10000;
    }

    const percentValue = value/contractValue;
    if(percentValue <0.31){
        return "yellow"
    } else if(percentValue >=0.31 && percentValue <0.71){
        return "blue"
    } else if(percentValue >=0.71 && percentValue <1){
        return "green"
    } else {
        return "red"
    }
}

type TableRowProps = {
  bot: any,
  label: string,
  labelIndex: number,
  theKeys: string[]
};

const TableRow = ({ bot, label, labelIndex, theKeys }: TableRowProps) => {
  const backgroundColor = labelIndex % 2 === 0 ? '#FDFDFD' : '#EEEEEE';
  const months = [3, 2, 1, 0].map(i => {
    const value = bot.months[i][theKeys[labelIndex]] ?? 0;
    const cellBackgroundColor = cellColor(bot.bot_customer_contract_type, value, labelIndex);
    const cellColorTextValue = cellColorText(cellBackgroundColor, labelIndex);
    return <td style={{ backgroundColor: cellBackgroundColor, color: cellColorTextValue }}>{value}</td>;
  });

  return (
    <tr key={labelIndex} style={{ backgroundColor }}>
      <td>{bot.bot_project_name}</td>
      <td>{bot.bot_id}</td>
      <td>{bot.bot_customer_contract_type ?? "--"}</td>
      <td>{label}</td>
      {months}
    </tr>
  );
};

type SearchType = { [key: string]: any }[];

export function ListProjects({ search }: { search: SearchType }) {
  const tableRef = useRef(null)
  const columnNames = ["Nome do Projeto", "Bot ID", "Tipo de Contrato", "Indicador", monthByName(3), monthByName(2), monthByName(1), monthByName(0)];
  const bots = search
  
    return (
        <div>
          <legend style={{fontSize: "12px"}}>Utilização do plano contratado</legend>
          <div style={{display: "flex", flexDirection: "row", fontSize: "12px"}}>
            <div style={{display: "flex", flexDirection: "row", padding: "10px"}}>
              <div style={{backgroundColor: "yellow", width: "10px", height: "10px", borderRadius: "20px", margin: "3px"}}></div>
              <label>- 0 a 30%</label>
            </div>
            <div style={{display: "flex", flexDirection: "row", padding: "10px"}}>
              <div style={{backgroundColor: "blue", width: "10px", height: "10px", borderRadius: "20px", margin: "3px"}}></div>
              <label>- 31 a 70%</label>
            </div>
            <div style={{display: "flex", flexDirection: "row", padding: "10px"}}>
              <div style={{backgroundColor: "green", width: "10px", height: "10px", borderRadius: "20px", margin: "3px"}}></div>
              <label>- 71 a 100%</label>
            </div>
            <div style={{display: "flex", flexDirection: "row", padding: "10px"}}>
              <div style={{backgroundColor: "red", width: "10px", height: "10px", borderRadius: "20px", margin: "3px"}}></div>
              <label>- acima de 100%</label>
            </div>
              <DownloadTableExcel
                filename="RelatorioGestao"
                sheet="users"
                currentTableRef={tableRef.current}
              >
                <button id="download">Baixar xls</button>
              </DownloadTableExcel>
              <button id="download">Baixar csv</button>
          </div>
              <table ref={tableRef}>
      {bots.map((bot, botIndex) => (
        <table key={botIndex}>
          <thead>
            <tr>
              {columnNames.map((name, index) => (
                <th key={index} style={{backgroundColor: "#EE7923", color: "#fff"}}>{name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {labels.map((label, labelIndex) => (
              <TableRow bot={bot} label={label} labelIndex={labelIndex} theKeys={theKeys} />
            ))}
          </tbody>
        </table>
      ))}
    </table>
        </div>
    );
}

export default ListProjects;
