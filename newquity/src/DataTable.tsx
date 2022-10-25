import { ReactElement } from "react";
import { EquityStatement, Member, month, RentStatement } from "./loanmath/loanmath";

type MonthEntryProps = {
    month:month,
    members:Member[],
    statement:EquityStatement,
    rent:RentStatement
  };
  
function MonthEntry(props:MonthEntryProps):ReactElement {
return (
    <tr>
    <td>{props.month}</td>
    {props.members.map((m)=><td>{props.rent.bill.get(m)?.toFixed(2) || 0}</td>)}
    {props.members.map((m)=><td>{props.statement.equity.get(m)?.toFixed(2) || 0}</td>)}
    <td>{props.statement.mortgagePrincipal.toFixed(2)}</td>
    </tr>
);
}

type DataTableProps = {
    members:Member[];
    statementsAndRent:[EquityStatement, RentStatement][];
}
export default function DataTable(props:DataTableProps):ReactElement {
    const {statementsAndRent, members} = props;
    return (
        <table>
            <thead>
            <tr>
                <th>Month</th>
                {members.map(m=><th>{`${m.identity} Payment`}</th>)}
                {members.map(m=><th>{`${m.identity} Equity`}</th>)}
                <th>Outstanding</th>
            </tr>
            </thead>
            <tbody>
            {statementsAndRent.map(([statement, rent], i)=><MonthEntry month={i} members={members} statement={statement} rent={rent}/>)}
            </tbody>
        </table>
    );
}