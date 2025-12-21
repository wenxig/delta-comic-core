import { SourcedKeyMap, Struct, type MetaData } from "@/utils/data"
import { useGlobalVar } from "@/utils/plugin"
import { isString } from "es-toolkit/compat"


export type ProcessInstance = (nowPath: string, resource: Resource) => Promise<[path: string, exit: boolean]>
export interface ProcessStep {
  referenceName: string
  ignoreExit?: boolean
}
type ProcessStep_ = ProcessStep | string
export interface RawResource {
  $$plugin: string
  $$meta?: MetaData
  path: string
  forkNamespace: string
  processSteps?: ProcessStep_[]
}
export class Resource extends Struct<RawResource> implements RawResource {
  public static processInstances = useGlobalVar(SourcedKeyMap.create<[plugin: string, referenceName: string], ProcessInstance>(), 'uni/resource/processInstances')

  public static fork = useGlobalVar(SourcedKeyMap.create<[plugin: string, namespace: string], string[]>(), 'uni/resource/fork')
  public static activeFork = useGlobalVar(SourcedKeyMap.create<[plugin: string, namespace: string], string>(), 'uni/resource/activeFork')

  public static is(value: unknown): value is Resource {
    return value instanceof this
  }
  public static create(v: RawResource): Resource {
    return new this(v)
  }
  protected constructor(v: RawResource) {
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
      const instance = Resource.processInstances.get([this.$$plugin, option.referenceName])
      if (!instance) {
        console.warn(`[Resource.getUrl] process not found, fullname: [${this.$$plugin}, ${option.referenceName}]`)
        continue
      }

      // call
      const result = await instance(resultPath, this)
      resultPath = result[0]
      if (option.ignoreExit || !result[1]) continue
      break
    }
    if (!URL.canParse(resultPath)) {
      return `${Resource.activeFork.get([this.$$plugin, this.forkNamespace])}/${resultPath}`
    }
    return resultPath
  }
}
export type Resource_ = string | Resource
