import { ReactElement, } from 'react';
import './App.css';
import InputSlider from './InputSlider';
import {useSessionStorage} from 'react-use';

import {month, computeLoan, dollar, rate, months, computeInitialEquityStatement, computeRentStatement, computeEquityStatement, Member, EquityStatement, Loan, RentStatement} from './loanmath/loanmath';
import Charts from './Charts';
import DataTable from './DataTable';
import MemberDefinition from './MemberDefinition';

function App() {
  const [purchaseAmount, setPurchaseAmount] = useSessionStorage<dollar>("purchaseAmount", 1_000_000);
  const [monthlyEscrow, setMonthlyEscrow] = useSessionStorage<dollar>("monthlyEscrow", 1_000);
  const [interestRate, setInterestRate] = useSessionStorage<rate>("interestRate", 0.051);
  const [equalizationRate, setEqualizationRate] = useSessionStorage<rate>("equalizationRate", 0.007);
  const [term, setTerm] = useSessionStorage<months>("term", 240);
  const [showData, setShowData] = useSessionStorage<boolean>("showData", false);
  const [members, setMembers] = useSessionStorage<Member[]>("members", [
    {identity:"A", moveInMonth:0, moveOutMonth:240, buyIn:200_000},
    {identity:"B", moveInMonth:0, moveOutMonth:240, buyIn:100_000},
    {identity:"C", moveInMonth:120, moveOutMonth:240, buyIn:20_000},
  ]);

  const loan = computeLoan(purchaseAmount, interestRate, monthlyEscrow, term, members);
  const initialStatement = computeInitialEquityStatement(loan, members);
  let currentStatement = initialStatement;
  const monthsSoFar = Array.from(Array(term).keys()).map(x => x);
  let statementsAndRent:[EquityStatement, RentStatement][] = [];
  monthsSoFar.forEach((month:month)=>{
    const rent = computeRentStatement(month, loan, members, currentStatement, equalizationRate);
    statementsAndRent.push([currentStatement, rent])
    currentStatement = computeEquityStatement(currentStatement, rent);

  }, initialStatement);

  return (
    <div className="App">
      <header>Co-operative Mortgage Scheme</header>
      <Charts statementsAndRent={statementsAndRent} members={members}/> 
      <div style={{display:"flex", alignItems:"flex-start", justifyContent:"space-between"}}>
        <div style={{margin:20}}>
          <h3>Contract</h3>
          <InputSlider value={purchaseAmount/1000} setValue={(value)=>setPurchaseAmount(value*1000)} title="Purchase Amount (k)" min={10} max={1_000} step={10}/>
          <InputSlider value={monthlyEscrow} setValue={setMonthlyEscrow} title="Monthly Fees" min={0} max={1_000} step={10}/>
          <InputSlider value={interestRate} setValue={setInterestRate} title="Mortage Rate" min={0.01} max={0.15} step={0.001}/>
          <InputSlider value={equalizationRate} setValue={setEqualizationRate} title="Equalization Rate" min={0.001} max={0.015} step={0.0001}/>
          <InputSlider value={term} setValue={setTerm} title="Mortage Term (months)" min={12} max={360} step={1}/>
        </div>
        <MemberDefinition members={members} setMembers={setMembers} />
      </div>
      <button onClick={()=>{setShowData(!showData)}}>{showData ? "Hide Data" : "Show Data"}</button>
      {showData ? <DataTable statementsAndRent={statementsAndRent} members={members} /> : <></>}
    </div>
  );
}

export default App;
