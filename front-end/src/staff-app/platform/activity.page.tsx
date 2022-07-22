import React, { useEffect, useState } from "react"
import styled from "styled-components"
import { BorderRadius, FontWeight, Spacing } from "shared/styles/styles"
import { useApi } from "shared/hooks/use-api"
import { Activity } from "shared/models/activity"
import { StudentListTile } from "staff-app/components/student-list-tile/student-list-tile.component"
import { Person } from "shared/models/person"
import { Colors } from "shared/styles/colors"
import { Button } from "@material-ui/core"

export const ActivityPage: React.FC = () => {
  let [getSaveRollCallBack, getSaveRollData, loadGetSaveRollState] = useApi<{activity:Activity[]}>({url:'get-activities'})
  let [getStudents, data, loadState] = useApi<{ students: Person[] }>({ url: "get-homeboard-students" })
  let studentdata = data?.students
  let [activities, setActivities] = useState([])
  
  useEffect(() => {
    void getSaveRollCallBack(),
    void getStudents()
  }, [getSaveRollCallBack, getStudents])

  const getStudentData = (id) =>{
    return studentdata?.filter((item) => item.id === id)[0]
  }

  const getActivities = (activities) => {
    let activity = []
    activities.map((item) => {
      item.entity.student_roll_states.map((roll_state) =>{
        if(activity[roll_state.student_id-1]){
          activity[roll_state.student_id-1].push(roll_state.roll_state)
        }
        else{
          activity[roll_state.student_id-1] = [roll_state.roll_state]
        }

        
      })
    })
    console.log(activity)
    setActivities(activity)
    return true
  }
  if(loadGetSaveRollState ==="loaded" && !activities.length && getSaveRollData.activity.length){
    getActivities(getSaveRollData?.activity)
  }
  

  

  return (
    <>
    <S.Container>
          
          {loadGetSaveRollState === 'loaded' && studentdata?.length>0 && loadState ==="loaded" && getSaveRollData.activity.length > 0 &&(
              
            <>
                <S.ToolbarContainer>
                  <S.Button>Name</S.Button>
                  <S.Button>Roll states(By days)</S.Button>
                </S.ToolbarContainer>
                {activities.map((item,i) => {
                  let s = getStudentData(i+1)
                  return (
                    <StudentListTile rollkey={i} isRollMode={true} student={s} types={item}/>
                  )
               }
                  
                )}
            </>        
          )}
          { getSaveRollData && getSaveRollData.activity.length === 0 && (
            
            <S.NoData>No data to show</S.NoData>
        
          ) }
          
    </S.Container>
    </> 
  )
}

const S = {
  Container: styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;
    margin: ${Spacing.u4} auto 0;
  `,
  NoData: styled.p`
    margin-top:30%;
    padding:30px;
    box-shadow:1px 1px 1px 1px;
    display:flex;
    justify-content:center;
    z-index:10;

  `,
  ToolbarContainer: styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${Colors.blue.base};
  padding: 6px 14px;
  font-weight: ${FontWeight.strong};
  border-radius: ${BorderRadius.default};
`,

Button: styled(Button)`
  && {
    padding: ${Spacing.u2};
    font-weight: ${FontWeight.strong};
    border-radius: ${BorderRadius.default};
    color:#fff;
  }
`,
}
