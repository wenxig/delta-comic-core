import type { MetaData } from "@/utils/data"
import { Resource, RawResource, type ProcessStep_ } from "./resource"


export interface RawImage {
  $$plugin: string
  $$meta?: MetaData
  path: string
  forkNamespace: string
  processSteps?: ProcessStep_[]
}

export class Image extends Resource {
  public static override is(value: unknown): value is Image {
    return value instanceof this
  }
  public static override create(v: RawResource | RawImage, aspect?: { width: number, height: number }): Image {
    return new this(v, aspect)
  }
  protected constructor(v: RawResource | RawImage, aspect?: { width: number, height: number }) {
    if ('forkNamespace' in v) super({
      $$plugin: v.$$plugin,
      $$meta: v.$$meta,
      pathname: v.path,
      type: v.forkNamespace,
      processSteps: v.processSteps
    })
    else super(v)
    this.aspect = aspect
  }
  public aspect?: { width: number, height: number }
}
export type Image_ = string | Image
