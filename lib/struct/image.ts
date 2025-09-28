import { Struct, type MetaData } from "@/utils/data"
import { isString } from "lodash-es"


export interface ProcessInstance {
  fullName: string
  plugin: string
  referenceName: string
  func: (nowPath: string, img: Image) => Promise<[path: string, exit: string]>
}
export interface ProcessStep {
  referenceName: string
  ignoreExit?: boolean
}
type ProcessStep_ = ProcessStep | string
export interface RawImage {
  $$plugin: string
  $$meta?: MetaData
  path: string
  forkNamespace: string
  processSteps?: ProcessStep_[]
}
export class Image extends Struct<RawImage> implements RawImage {
  private static processInstances = new Map<string, ProcessInstance>()
  public static setProcess(plugin: string, referenceName: string, func: ProcessInstance['func']) {
    const fullName = `${plugin}:${referenceName}`
    this.processInstances.set(fullName, {
      func,
      plugin,
      referenceName,
      fullName
    })
  }

  private static fork = new Map<string, string>()
  public static setFork(plugin: string, namespace: string, fork: string) {
    const key = `${plugin}:${namespace}`
    this.fork.set(key, fork)
  }
  constructor(v: RawImage, public aspect?: { width: number, height: number }) {
    super(v)
    this.$$plugin = v.$$plugin
    this.$$meta = v.$$meta
    this.path = v.path
    this.forkNamespace = v.forkNamespace
    this.processSteps = (v.processSteps ?? []).map<ProcessStep>(v => isString(v) ? {
      referenceName: v,
      ignoreExit: false
    } : v)
  }
  public forkNamespace: string
  public path: string
  public processSteps: ProcessStep[]
  public $$meta?: MetaData
  public $$plugin: string
  public async getUrl(): Promise<string> {
    let resultPath = this.path
    for (const option of this.processSteps) {
      // preflight
      const fullName = `${this.$$plugin}:${option.referenceName}`
      const instance = Image.processInstances.get(fullName)
      if (!instance) {
        console.warn(`[Image.getUrl] process not found, fullname: "${fullName}"`)
        continue
      }

      // call
      const result = await instance.func(resultPath, this)
      resultPath = result[0]
      if (option.ignoreExit || !result[1]) continue
      break
    }
    return `${Image.fork.get(`${this.$$plugin}:${this.forkNamespace}`)}/${resultPath}`
  }
}
export type Image_ = string | Image
