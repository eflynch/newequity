import { buildTimeValue } from "@testing-library/user-event/dist/utils";

export type dollar = number;
export type month = number;
export type months = number;
export type rate = number;

export type Member = {
    identity:string;
    moveInMonth:month;
    moveOutMonth:month;
    buyIn:dollar;
};

export type Loan = {
    purchaseAmount:dollar;
    downPayment:dollar;
    interestRate:rate;
    monthlyEscrow:dollar;
    term:months;
};

export type EquityStatement = {
    mortgagePrincipal:dollar;
    equity:Map<Member, dollar>;
};

export type RentStatement = {
    monthlyRent:dollar,
    interestPaid:dollar,
    principalPaid:dollar,
    equityRate:rate,
    totalEquity:dollar,
    targetEquity:dollar,
    excessEquity:Map<Member, dollar>,
    mortgagePrincipalAdjustment:dollar;
    oneTimeBill:Map<Member, dollar>;
    bill:Map<Member, dollar>;
    equityAdjustment:Map<Member, dollar>;
};

const monthlyPayment = (loan:Loan) => {
    const p = loan.purchaseAmount-loan.downPayment;
    const i = loan.interestRate/12;
    const n = loan.term;
    const gamma = Math.pow(1+i, n);
    return (p * (i*gamma) / (gamma - 1)) + loan.monthlyEscrow;
};

export const computeLoan = (purchaseAmount:dollar, interestRate:rate, monthlyEscrow:number, term:months, members:Member[]) => {
    const downPayment = members.filter(m=>m.moveInMonth == 0).reduce((previousValue:dollar, currentValue:Member)=>{
        return previousValue + currentValue.buyIn as dollar;
    }, 0);
    return {
        purchaseAmount:purchaseAmount,
        downPayment:downPayment,
        interestRate:interestRate,
        monthlyEscrow:monthlyEscrow,
        term:term,
    } as Loan;
};

const memberIsActive = (member:Member, month:month) => {
    return member.moveInMonth <= month && member.moveOutMonth > month
};

export const computeInitialEquityStatement = (loan:Loan, members:Member[]) => {
    const equity = new Map<Member,dollar>(members.map((m)=>[m,0]));
    return {
        mortgagePrincipal:loan.purchaseAmount,
        equity:equity
    } as EquityStatement;
};



export const computeRentStatement = (month:month, loan:Loan, members:Member[], equity:EquityStatement, equalizationRate:rate) => {
    const monthlyRent = monthlyPayment(loan);
    const interestPaid = equity.mortgagePrincipal * loan.interestRate / 12;
    const principalPaid = monthlyRent - interestPaid - loan.monthlyEscrow;
    const equityRate = principalPaid / monthlyRent;

    const currentMembers = members.filter((m)=>memberIsActive(m, month));
    const totalEquityPreTransfer = members.map(m=>equity.equity.get(m)||0).reduce((previousValue:dollar, currentValue)=>previousValue+currentValue, 0);

    // Compute buy-in equity transfers
    const newMembers = members.filter((m)=>m.moveInMonth == month);
    const totalEquityTransfer = newMembers.reduce((previousValue, currentValue)=>{return previousValue + currentValue.buyIn}, 0);
    const totalEquityPostTransfer = totalEquityPreTransfer + totalEquityTransfer;
    const targetEquityPostTransfer = totalEquityPostTransfer / currentMembers.length;

    const excessEquityPreTransfer = new Map<Member, dollar>(members.map(m => [m,  (equity.equity.get(m) || 0) - (memberIsActive(m, month) ? targetEquityPostTransfer : 0)]));
    const positiveExcessMembers = members.filter((m)=>(excessEquityPreTransfer.get(m)|| 0) > 0);
    const totalPositiveExcess = positiveExcessMembers.reduce((previousValue, currentValue)=>{return previousValue + (excessEquityPreTransfer.get(currentValue) || 0)}, 0);
    const totalPositiveExcessEquityTransfer = Math.min(totalEquityTransfer, totalPositiveExcess);

    const principalEquityTransfer = totalEquityTransfer - totalPositiveExcessEquityTransfer;
    const positiveExcessEquityTransfer = new Map<Member, dollar>(positiveExcessMembers.map(m=>[m, totalPositiveExcess < 1 ? 0 : (excessEquityPreTransfer.get(m)||0)*totalPositiveExcessEquityTransfer/totalPositiveExcess ]));
    const transferEquityAdjustment = new Map<Member, dollar>(members.map(m=>[m, -(positiveExcessEquityTransfer.get(m)||0) + (m.moveInMonth == month ? m.buyIn : 0)]))

    const excessEquityPostTransfer = new Map<Member, dollar>(members.map(m => [m,  (equity.equity.get(m) || 0) + (transferEquityAdjustment.get(m) || 0) - (memberIsActive(m, month) ? targetEquityPostTransfer : 0)]));

    const perCurrentBaseBill = monthlyRent / currentMembers.length;
    const principalRent = new Map<Member, dollar>(members.map(m=>[m, (memberIsActive(m, month) ? perCurrentBaseBill : 0)]));
    const adjustmentRent = new Map<Member, dollar>(members.map(m=>[m, -(excessEquityPostTransfer.get(m) || 0) * equalizationRate]));

    const equityAdjustment = new Map<Member, dollar>(members.map(m=>[m,
        (principalRent.get(m) || 0) * equityRate
        + (adjustmentRent.get(m) || 0)
        + (transferEquityAdjustment.get(m) || 0)
    ]));

    const bill = new Map<Member, dollar>(members.map(m=>[m,
        (principalRent.get(m) || 0)
        + (adjustmentRent.get(m) || 0)
    ]));

    const oneTimeBill = new Map<Member, dollar>(members.map(m=>[m,
        (m.moveInMonth == month ? m.buyIn : 0)
        - (positiveExcessEquityTransfer.get(m) || 0)
    ]));

    return {
        monthlyRent:monthlyRent,
        interestPaid:interestPaid,
        principalPaid:principalPaid,
        equityRate:equityRate,
        totalEquity:totalEquityPostTransfer,
        targetEquity:targetEquityPostTransfer,
        excessEquity:excessEquityPostTransfer,
        mortgagePrincipalAdjustment:principalPaid+principalEquityTransfer,
        oneTimeBill:oneTimeBill,
        bill:bill,
        equityAdjustment:equityAdjustment
    } as RentStatement;
};

export const computeEquityStatement = (previous:EquityStatement, rentStatement:RentStatement) => {
    let newEquity = new Map<Member, dollar>;
    previous.equity.forEach((value, key)=>{
        newEquity.set(key, value + (rentStatement.equityAdjustment.get(key) || 0));
    });
    return {
        mortgagePrincipal:previous.mortgagePrincipal - rentStatement.mortgagePrincipalAdjustment,
        equity:newEquity
    } as EquityStatement;
};

