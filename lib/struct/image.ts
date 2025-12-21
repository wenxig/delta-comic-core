import { Resource, RawResource } from "./resource"


export class Image extends Resource {
  public static override is(value: unknown): value is Image {
    return value instanceof this
  }
  public static override create(v: RawResource, aspect?: { width: number, height: number }): Image {
    return new this(v, aspect)
  }
  protected constructor(v: RawResource, public aspect?: { width: number, height: number }) {
    super(v)
  }
}
export type Image_ = string | Image
