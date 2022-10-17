import {ClassConstructor} from "class-transformer";
import {HttpContext, HttpContextToken, HttpRequest} from "@angular/common/http";

export class TypeUtils {
  private static readonly TYPE_TOKEN = new HttpContextToken<ClassConstructor<any>>(() => EmptyType)

  public static of<T>(type: ClassConstructor<T>): object {
    return {context: new HttpContext().set(TypeUtils.TYPE_TOKEN, type)}
  }

  public static get<T>(req: HttpRequest<any>): ClassConstructor<T> {
    return req.context.get(this.TYPE_TOKEN)
  }

}

export class EmptyType {}
