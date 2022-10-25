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
    <div style={{display:"flex"}}>
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
          <YAxis label={{ value: 'equity (k)', position: 'insideLeft', angle: -90}} />
          {members.map((m, i)=><Line strokeWidth={2} dot={false} stroke={colors[i]} type="monotone" dataKey={m.identity} />)}
          <Line dot={false} strokeWidth={2} type="monotone" stroke="black" dataKey="Bank"/>
          <Tooltip/>
          <Legend/>
        </LineChart>

        <LineChart width={500} height={300} data={statementsAndRent.slice(1).map(([statement, rent], i)=>{
          let dataPoint:any = {month:i+1};
          members.forEach((m)=>{
            if (m.moveInMonth <= i) {
              dataPoint[m.identity] = rent.bill.get(m) || 0;
            }
          });
          return dataPoint;
        })}>
          <XAxis label={{ value: 'month', position: 'insideBottomLeft', offset: -2 }} dataKey="month"/>
          <YAxis label={{ value: 'payment', position: 'insideLeft', angle: -90}} />
          {members.map((m, i)=><Line strokeWidth={2} dot={false} stroke={colors[i]} type="monotone" dataKey={m.identity} />)}
          <Tooltip/>
          <Legend/>
        </LineChart>
      </div>
  );
}