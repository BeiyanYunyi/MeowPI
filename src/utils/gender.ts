import { createContext } from './createContext'

export enum Gender {
  FEMALE = 'F',
  MALE = 'M',
}

export const { Provider: genderProvider, Consumer: useGender } = createContext(Gender.FEMALE)
