export interface ResumeData {
  profile: {
    name?: string
    job?: string
  }
  detail: {
    origin?: string
    address?: string
    email?: string
    phone?: string
    wechat?: string
  }
  skill: string[]
  statment: {
    content?: string
  }
  education: {
    school?: string
    degree?: string
    time?: string
    description?: string
  }[]
  employment: {
    employer?: string
    time?: string
    description?: string
  }[]
  project: {
    label?: string
    url?: string
  }[]
  link: {
    label?: string
    url?: string
  }[]
}

export interface ResumeMap {
  [username: string]: {
    zh: ResumeData
    en?: ResumeData
  }
}
