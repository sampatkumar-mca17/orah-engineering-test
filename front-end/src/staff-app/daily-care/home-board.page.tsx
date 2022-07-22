import React, { useState, useEffect } from "react"
import styled from "styled-components"
import Button from "@material-ui/core/ButtonBase"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowUp, faArrowDown }  from "@fortawesome/free-solid-svg-icons"
import { Spacing, BorderRadius, FontWeight } from "shared/styles/styles"
import { Colors } from "shared/styles/colors"
import { CenteredContainer } from "shared/components/centered-container/centered-container.component"
import { Person } from "shared/models/person"
import { useApi } from "shared/hooks/use-api"
import { StudentListTile } from "staff-app/components/student-list-tile/student-list-tile.component"
import { ActiveRollOverlay, ActiveRollAction } from "staff-app/components/active-roll-overlay/active-roll-overlay.component"
import { RolllStateType } from "shared/models/roll"
import { useNavigate } from "react-router-dom";

export const HomeBoardPage: React.FC = () => {
  const navigate = useNavigate()
  const [isRollMode, setIsRollMode] = useState(false)
  let [getStudents, data, loadState] = useApi<{ students: Person[] }>({ url: "get-homeboard-students" })
  let [saveRollCallBack,  saveRollData, loadSaveRollState, saveRollError] = useApi<{}>({url:'save-roll'})

  let studentdata = data?.students
  let[initialNames, setInitialNames] = useState([])
  let [arrowIcon, setArrowIcon] = useState()
  const [allCount , setAllCount] = useState(0)
  const [presentCount , setPresentCount] = useState(0)
  const [lateCount , setLateCount] = useState(0)
  const [absentCount , setAbsentCount] = useState(0)
  const initialRollStatesCount:Array<any> = Array(data?.students.length).fill('unmark')
  const[rollStates,setRoll] = useState(initialRollStatesCount)
  
  interface idObj{
    typeContent:Array<{id:number,type:RolllStateType|'all'}>,
    ids:Array<any>|undefined
  }
  let rollids:idObj = {
    typeContent:[],
    ids:[]
  }
  const [ids, setRollId] = useState(rollids)
  useEffect(() => {
    void getStudents()
  }, [getStudents])

  const onToolbarAction = (action: ToolbarAction, value?) => {
    if (action === "roll") {
      setIsRollMode(true)
    }
    else if(action === 'sort'){
      onArrowClick()
    }
    else if(action === 'filter'){
      if(!value){
        filterStudents(null,'no match')
      }
      else{
        filterStudents(null,value)
      }
      
    }
  }
  const clearCounts = () => {
    setAllCount(0)
    setPresentCount(0)
    setAbsentCount(0)
    setLateCount(0)
    setRoll(initialRollStatesCount)
  }
  const onActiveRollAction = (action: ActiveRollAction) => {
    if (action === "exit") {
      
      setIsRollMode(false)
      setRollId({
        typeContent:[],
        ids:[]
      })
      clearCounts()
    }
    else if(action === "complete") {
      let rollState:Array<any> = []
        studentdata.map((item) =>{
          rollState.push({
            student_id: item.id,
            roll_state: rollStates[item.id-1]? rollStates[item.id-1]:'unmark'
          })
        })
         saveRollCallBack({
          student_roll_states:rollState
        }).then((result) => navigate('/staff/activity'))       
    }
  }
  const updateRollCount = (next:any, id:any) => {
    rollStates[id-1]=next
    setAllCount(getCount('all',rollStates))
    setPresentCount(getCount('present',rollStates))
    setLateCount(getCount('late',rollStates))
    setAbsentCount(getCount('absent',rollStates))

  }
  const getCount = (type:string, arr:Array<any>) =>{
    if(type === 'all'){
      return arr.filter((item) => item !== "unmark").length
    }
    else{
      return arr.filter((item) => item == type).length
    }
  }
  const typeAllClick = (typeContent, rollids) => {
    rollStates.map((item, i) => {
      if(item !== "unmark"){
        rollids.push(i)
        typeContent = [...typeContent,{id:i,type:item}]
      }
    })
    return [rollids, typeContent]
  }
  const typeClick = (typeContent, rollids, type) => {
    rollStates.map((item,i) => {
      if(item === type){
        rollids.push(i)
        typeContent = [...typeContent,{id:i,type:item}]
      }
    })
    return [rollids, typeContent]
  }
  const updateRollIds = (typeContent, rollids) => {
    if(rollids.length){
      setRollId({typeContent, ids:rollids})
    }
  }
  const applyFilter = (typeContent, rollids, match:string) => {
    studentdata.map((item) => {
      if(item.first_name.toLocaleLowerCase().match(match.toLocaleLowerCase()) || item.last_name.toLocaleLowerCase().match(match.toLocaleLowerCase())){
        rollids.push(item.id-1)
        typeContent = [...typeContent,{id:item.id-1,type:rollStates[item.id-1]}]
      }
    })
    return [rollids,typeContent]
  }

  const filterStudentsMatch = (match, rollids, typeContent) => {
    if(match === 'no match'){
      rollStates.map((item, i) => {
          rollids.push(i)
          typeContent = [...typeContent,{id:i,type:item}]
      })
      studentdata.map((item) =>{
        if(!rollids.includes(item.id-1)){
          rollids.push(item.id-1)
          typeContent = [...typeContent,{id:item.id-1,type:'all'}]
        }
      })
    }
    else{
      [rollids, typeContent] = applyFilter(typeContent,rollids,match)
      if (!rollids.length){
          rollids = Array(studentdata.length).fill(-1)
      }
    }
    return [rollids, typeContent]
  }

  const filterStudentsType = (type, rollids, typeContent) => {
    if(type === 'all'){
      [rollids, typeContent] = typeAllClick(typeContent, rollids)
     }
     else{
       [rollids, typeContent] = typeClick(typeContent, rollids, type)
     }

     return [rollids, typeContent]
  }

  const filterStudents = (type?:RolllStateType |'all', match?:string,) => { 
    let rollids:Array<any> = [];
    let typeContent:Array<{id:number,type:RolllStateType|'all'}> = [];
    if(match){
      [rollids, typeContent] = filterStudentsMatch(match, rollids, typeContent)
    }
    else if(type){
      [rollids, typeContent] = filterStudentsType(type, rollids, typeContent)
    } 
    updateRollIds(typeContent, rollids)
  }

  const noArrow = () => { 
    studentdata = data?.students.map((item, i)=>{
       let names = initialNames[i].split(' ')
       item.first_name = names[0]
       item.last_name = names[1]
       return item
    })
  }

  const arrowUp = () => {
    studentdata?.sort((a,b) => {
      if(a.first_name < b.first_name){
        return -1
      }
      else{
        return 1
      }
    })
  }

  const arrowDown = () => {
    studentdata?.sort((a,b) => {
      if(a.first_name < b.first_name){
        return 1
      }
      else{
        return -1
      }
    })
  }

  const onArrowClick = () => {
    let icon
    if(!initialNames.length){
      let names = studentdata.map((item) => `${item.first_name} ${item.last_name} ${item.id}`)
      
      setInitialNames(names)
    }
    if(!arrowIcon){
      icon = faArrowUp
      arrowUp()
    }
    else{
      if(arrowIcon === faArrowUp){
        arrowDown()
        icon = faArrowDown
      }
      else{
        noArrow()
        icon = null
      }
    }

    setArrowIcon(icon)
    
  }

  return (
    <>
      <S.PageContainer>
        <Toolbar onItemClick={(action, value?) => onToolbarAction(action, value)} arrowIcon={arrowIcon} />

        {loadState === "loading" && (
          <CenteredContainer>
            <FontAwesomeIcon icon="spinner" size="2x" spin />
          </CenteredContainer>
        )}

        {loadState === "loaded" && ids.ids?.length > 0 && studentdata?.length && (
          <>
            {studentdata.map((s) =>           
            {
              if(ids.ids?.includes(s.id-1)){
                let type = ids.typeContent.filter((item) => item?.id == s.id-1)[0]
      
                return (
                    <StudentListTile rollkey={s.id} isRollMode={isRollMode} student={s} rollCountUpdate={updateRollCount} type={type.type}/>
                )
              }
            }
            )}
          </>
        )}

        {loadState === "loaded" && !ids.ids?.length && studentdata?.length && (
          <>
            {studentdata.map((s) => 
              
                  (
                    <StudentListTile rollkey={s.id} isRollMode={isRollMode} student={s} rollCountUpdate={updateRollCount} type="all"/>
                  )
                  
                
            )}
          </>
        )}

        {loadState === "error" && (
          <CenteredContainer>
            <div>Failed to load</div>
          </CenteredContainer>
        )}
      </S.PageContainer>
      <ActiveRollOverlay 
        isActive={isRollMode} 
        all={allCount} 
        present={presentCount}
        late={lateCount} 
        absent={absentCount} 
        onItemClick={onActiveRollAction} 
        onRollClick={filterStudents}
      />
    </>
  )
}

type ToolbarAction = "roll" | "sort" | "filter"
interface ToolbarProps {
  onItemClick: (action: ToolbarAction, value?: string) => void,
  arrowIcon: any
}
const Toolbar: React.FC<ToolbarProps> = (props) => {
  const { onItemClick, arrowIcon } = props
  return (
    <S.ToolbarContainer>

      <S.ButtonContainer>
        <S.Button onClick={() => onItemClick("sort")}>First Name</S.Button>
        <S.Button onClick={() => onItemClick("sort")}>
          {arrowIcon && (
            <FontAwesomeIcon icon={arrowIcon} size= "sm" />
          )}
        </S.Button>
      </S.ButtonContainer>
        <S.Input placeholder="Search" onChange={($event) => onItemClick('filter',$event.target.value) }  />
        <S.Button onClick={() => onItemClick("roll")}>Start Roll</S.Button>
      
    </S.ToolbarContainer>
    
  )
}

const S = {
  PageContainer: styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;
    margin: ${Spacing.u4} auto 140px;
  `,
  ToolbarContainer: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    background-color: ${Colors.blue.base};
    padding: 6px 14px;
    font-weight: ${FontWeight.strong};
    border-radius: ${BorderRadius.default};
  `,
  ButtonContainer: styled.div`
    display:grid;
    grid-template-columns:100px 50px;
  `,
  Button: styled(Button)`
    && {
      padding: ${Spacing.u2};
      font-weight: ${FontWeight.strong};
      border-radius: ${BorderRadius.default};
    }
  `,

  Input: styled.input`
    padding:5px; 
    background: transparent;
    border:none;
    color:white;
    &::placeholder{
      color:white;
      font-weight:${FontWeight.strong};
      border-radius: ${BorderRadius.default};
    }
  `
}
