import { ReactElement } from "react";
import { Legend, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { EquityStatement, Member, RentStatement } from "./loanmath/loanmath";

const colors = ["red", "green", "blue", "purple", "gray", "red", "green", "blue", "purple", "gray", "red", "green", "blue", "purple", "gray"]

type ChartsProps = {
  statementsAndRent:[EquityStatement, RentStatement][];
  members:Member[];
}
export default function Charts(props:ChartsProps):ReactElement {
  const {statementsAndRent, members} = props; 
  return (
    <div style={{display:"flex", flexWrap:"wrap", justifyContent:"center"}}>
        <LineChart width={500} height={300} data={statementsAndRent.slice(1).map(([statement, rent], i)=>{
          let dataPoint:any = {month:i+1};
          members.forEach((m)=>{
            if (m.moveInMonth <= i) {
              dataPoint[m.identity] = (statement.equity.get(m) || 0) / 1000;
            }
          });
          dataPoint["Bank"] = statement.mortgagePrincipal / 1000;
          return dataPoint;
        })}>
          <XAxis label={{ value: 'month', position: 'insideBottomLeft', offset: -2 }} dataKey="month"/>
          <YAxis label={{ value: 'equity (k)', position: 'insideBottomLeft', angle: -90, offset: 18}} />
          {members.map((m, i)=><Line strokeWidth={2} dot={false} stroke={colors[i]} type="monotone" dataKey={m.identity} />)}
          <Line dot={false} strokeWidth={2} type="monotone" stroke="black" dataKey="Bank"/>
          <Tooltip/>
          <Legend/>
        </LineChart>

        <LineChart width={500} height={300} data={statementsAndRent.map(([statement, rent], i)=>{
          let dataPoint:any = {month:i};
          members.forEach((m)=>{
            if (m.moveInMonth <= i) {
              dataPoint[m.identity] = (rent.bill.get(m) || 0);
            }
          });
          return dataPoint;
        })}>
          <XAxis label={{ value: 'month', position: 'insideBottomLeft', offset: -2 }} dataKey="month"/>
          <YAxis label={{ value: 'rent', position: 'insideBottomLeft', angle: -90, offset: 18}} />
          {members.map((m, i)=><Line strokeWidth={2} dot={false} stroke={colors[i]} type="monotone" dataKey={m.identity} />)}
          <Tooltip/>
          <Legend/>
        </LineChart>
        <LineChart width={500} height={300} data={statementsAndRent.map(([statement, rent], i)=>{
          let dataPoint:any = {month:i};
          members.forEach((m)=>{
            if (rent.oneTimeBill.get(m)) {
              dataPoint[m.identity] = (rent.oneTimeBill.get(m) || 0) / 1000;
            }
          });
          return dataPoint;
        })}>
          <XAxis label={{ value: 'month', position: 'insideBottomLeft', offset: -2 }} dataKey="month"/>
          <YAxis label={{ value: 'capital transfer (k)', position: 'insideBottomLeft', angle: -90, offset: 18}} />
          {members.map((m, i)=><Line strokeWidth={2} stroke={colors[i]} type="monotone" dataKey={m.identity} />)}
          <Tooltip/>
          <Legend/>
        </LineChart>
      </div>
  );
}