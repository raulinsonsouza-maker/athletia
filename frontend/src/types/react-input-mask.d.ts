declare module 'react-input-mask' {
  import { ComponentType, InputHTMLAttributes } from 'react'

  export interface InputState {
    value: string
  }

  export interface BeforeMaskedStateChangeStates {
    previousState: InputState
    currentState: InputState
    nextState: InputState
  }

  export interface InputMaskProps extends InputHTMLAttributes<HTMLInputElement> {
    mask: string | Array<string | RegExp>
    maskChar?: string | null
    formatChars?: { [key: string]: string }
    alwaysShowMask?: boolean
    beforeMaskedStateChange?: (states: BeforeMaskedStateChangeStates) => InputState
    children?: (inputProps: InputHTMLAttributes<HTMLInputElement>) => React.ReactElement
  }

  const InputMask: ComponentType<InputMaskProps>
  export default InputMask
}

