// 从 .resume 目录读取简历文件，写入内存
import fs from 'fs-extra'
import path from 'path'

const resumeDirPath = path.join(__dirname, '../.resume')

export function getResumeMap() {
  const resumeMap: { [username: string]: any } = {}

  fs.readdirSync(resumeDirPath).map((resumeFileName: string) => {
    const resumeFilePath = path.join(resumeDirPath, resumeFileName)

    if (fs.statSync(resumeFilePath).isFile() && path.extname(resumeFileName) === '.json') {
      resumeMap[resumeFileName.replace(/\.json$/, '')] = JSON.parse(
        fs.readFileSync(resumeFilePath, 'utf8')
      )
    }
  })

  return resumeMap
}
