import React, { useState } from "react"
import { RolllStateType } from "shared/models/roll"
import { RollStateIcon } from "staff-app/components/roll-state/roll-state-icon.component"

interface Props {
  rollKey:number,
  initialState?: RolllStateType
  size?: number,
  rollCountUpdate:(next:any,id:any) => void,
  onStateChange?: (newState: RolllStateType) => void
}
export const RollStateSwitcher: React.FC<Props> = ({ rollKey, initialState = "unmark", size = 40,rollCountUpdate, onStateChange }) => {
  const [rollState, setRollState] = useState(initialState)

  const nextState = () => {
    const states: RolllStateType[] = ["present", "late", "absent"]
    if (rollState === "unmark" || rollState === "absent") return states[0]
    const matchingIndex = states.findIndex((s) => s === rollState)
    return matchingIndex > -1 ? states[matchingIndex + 1] : states[0]
  }

  const onClick = () => {
    const next = nextState()
    rollCountUpdate(next,rollKey)
    setRollState(next)
    if (onStateChange) {
      onStateChange(next)
    }
  }

  return <RollStateIcon type={rollState} size={size} onClick={onClick} />
}
