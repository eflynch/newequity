import { ReactElement } from "react";
import { Member } from "./loanmath/loanmath";
import update from 'immutability-helper';
import MuiInput from '@mui/material/Input';
import styled from "@emotion/styled";

const Input = styled(MuiInput)`
  width: 80px;
`;



type RowProps = {
    member:Member;
    setMember:(member:Member)=>void
    removeMember:()=>void;
    disableRemove:boolean;
};
function Row(props:RowProps):ReactElement {
    return (
        <tr>
            <td>
                <button disabled={props.disableRemove} onClick={props.removeMember}>-</button>
            </td>
            <td>
                <input type="text" value={props.member.identity} onChange={(e)=>{
                    props.setMember(update(props.member, {identity: {$set: e.currentTarget.value}}));
                }} />
            </td>
            <td>
                <Input value={props.member.moveInMonth} onChange={(e)=>{
                    const moveInMonth = e.target.value === '' ? 0 : Number(e.target.value) as number;
                    props.setMember(update(props.member, {moveInMonth: {$set: moveInMonth}}));
                }} inputProps={{
                    step: 1,
                    min: 0,
                    max: 360,
                    type: 'number',
                }} />
            </td>
            <td>
                <Input value={props.member.moveOutMonth} onChange={(e)=>{
                    const moveOutMonth = e.target.value === '' ? 0 : Number(e.target.value) as number;
                    props.setMember(update(props.member, {moveOutMonth: {$set: moveOutMonth}}));
                }} inputProps={{
                    step: 1,
                    min: 0,
                    max: 360,
                    type: 'number',
                }} />
            </td>
            <td>
                <Input value={props.member.buyIn} onChange={(e)=>{
                    const buyIn = e.target.value === '' ? 0 : Number(e.target.value) as number;
                    props.setMember(update(props.member, {buyIn: {$set: buyIn}}));
                }} inputProps={{
                    step: 1000,
                    min: 0,
                    max: 1_000_000,
                    type: 'number',
                }} />
            </td>
        </tr>
    );
}

type MemberDefinitionProps = {
    members:Member[];
    setMembers:(members:Member[])=>void;
}
export default function MemberDefinition(props:MemberDefinitionProps):ReactElement {
    return (
        <div style={{margin:20}}>
            <h3>Members</h3>
            <table>
                <thead>
                    <tr>
                        <th></th>
                        <th>name</th>
                        <th>move in</th>
                        <th>move out</th>
                        <th>buy in</th>
                    </tr>
                </thead>
                <tbody>
                    {props.members.map((m, i)=><Row disableRemove={props.members.length < 2} member={m} setMember={(member:Member)=>{
                        props.setMembers(update(props.members, {
                            [i]: {$set: member}
                        }))
                    }} removeMember={()=>{
                        props.setMembers(update(props.members, {
                            $splice: [[i, 1]]
                        }))
                    }} />)}
                </tbody>
            </table>

            <button onClick={()=>{
                props.setMembers(update(props.members, {
                    $push: [{identity:"New Member", moveInMonth:0, moveOutMonth:240, buyIn:0}]
                }))
            }}>Add Member</button>
        </div>
    );
}