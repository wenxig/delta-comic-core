import { SourcedKeyMap, Struct, type MetaData } from "@/utils/data"
import { useGlobalVar } from "@/utils/plugin"
import { isString } from "es-toolkit/compat"


export type ProcessInstance = (nowPath: string, img: Image) => Promise<[path: string, exit: boolean]>
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
  public static processInstances = useGlobalVar(SourcedKeyMap.create<[plugin: string, referenceName: string], ProcessInstance>(), 'uni/image/processInstances')

  public static fork = useGlobalVar(SourcedKeyMap.create<[plugin: string, namespace: string], string[]>(), 'uni/image/fork')
  public static activeFork = useGlobalVar(SourcedKeyMap.create<[plugin: string, namespace: string], string>(), 'uni/image/activeFork')

  public static is(value: unknown): value is Image {
    return value instanceof this
  }
  public static create(v: RawImage, aspect?: { width: number, height: number }): Image {
    return new this(v, aspect)
  }
  private constructor(v: RawImage, public aspect?: { width: number, height: number }) {
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
      const result = await instance(resultPath, this)
      resultPath = result[0]
      if (option.ignoreExit || !result[1]) continue
      break
    }
    if (!URL.canParse(resultPath)) {
      return `${Image.activeFork.get([this.$$plugin, this.forkNamespace])}/${resultPath}`
    }
    return resultPath
  }
}
export type Image_ = string | Image
