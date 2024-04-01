import { defineStore } from 'pinia'
import { type ResumeMap } from '../index.d'

export const useResumeStore = defineStore({
  id: 'resume',
  state: (): {
    resumeMap: ResumeMap
  } => ({
    resumeMap: process.env.RESUME_MAP as any
  })
})
