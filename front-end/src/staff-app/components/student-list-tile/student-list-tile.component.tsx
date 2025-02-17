import React from "react"
import styled from "styled-components"
import { Spacing, BorderRadius, FontWeight } from "shared/styles/styles"
import { Images } from "assets/images"
import { Colors } from "shared/styles/colors"
import { Person, PersonHelper } from "shared/models/person"
import { RollStateSwitcher } from "staff-app/components/roll-state/roll-state-switcher.component"
import { RolllStateType } from "shared/models/roll"

interface Props {
  rollkey:number,
  isRollMode?: boolean
  student: Person,
  type?:RolllStateType | 'all',
  types?: Array<any>,
  rollCountUpdate?:(next:any,id:any) => void
}
export const StudentListTile: React.FC<Props> = ({rollkey, isRollMode, student, type, types, rollCountUpdate }) => {
  return (
    <S.Container>
      <S.Avatar url={Images.avatar}></S.Avatar>
      <S.Content>
        <div>{PersonHelper.getFullName(student)}</div>
      </S.Content>
      {isRollMode && type!==undefined && type==='all' && (
        <S.Roll>
          <RollStateSwitcher rollKey={rollkey} rollCountUpdate={rollCountUpdate} />
        </S.Roll>
      )}

      {isRollMode && type!==undefined && type!=='all' && (
        <S.Roll>
          <RollStateSwitcher rollKey={rollkey} rollCountUpdate={rollCountUpdate} initialState ={type}/>
        </S.Roll>
      )}

      {isRollMode && types && types.length > 0 && (
        <S.Rolls>
          <>
          {types.map((item) => {
            return (
              <S.Roll>
                <RollStateSwitcher rollKey={rollkey} rollCountUpdate={rollCountUpdate} initialState ={item}/>
              </S.Roll>
            )
          })}
          
          </>
        </S.Rolls>

      )}
    </S.Container>
  )
}

const S = {
  Container: styled.div`
    margin-top: ${Spacing.u3};
    padding-right: ${Spacing.u2};
    display: flex;
    height: 60px;
    min-width:100%;
    border-radius: ${BorderRadius.default};
    background-color: #fff;
    box-shadow: 0 2px 7px rgba(5, 66, 145, 0.13);
    transition: box-shadow 0.3s ease-in-out;

    &:hover {
      box-shadow: 0 2px 7px rgba(5, 66, 145, 0.26);
    }
  `,
  Avatar: styled.div<{ url: string }>`
    width: 60px;
    background-image: url(${({ url }) => url});
    border-top-left-radius: ${BorderRadius.default};
    border-bottom-left-radius: ${BorderRadius.default};
    background-size: cover;
    background-position: 50%;
    align-self: stretch;
  `,
  Content: styled.div`
    flex-grow: 1;
    padding: ${Spacing.u2};
    color: ${Colors.dark.base};
    font-weight: ${FontWeight.strong};
  `,
  Roll: styled.div`
    display: flex;
    flex-direction:column;  
    align-items: center;
    margin-right: ${Spacing.u4};
  `,
  Rolls: styled.div `
    display: flex;
    align-items:center;
  `
}
