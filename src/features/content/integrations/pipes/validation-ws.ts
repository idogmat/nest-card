import { Injectable, ValidationPipe } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";

@Injectable()
export class WSValidationPipe extends ValidationPipe {
  createExceptionFactory(): (validationError) => unknown {
    return (validationError = []) => {
      if (this.isDetailedOutputDisabled) throw new WsException('Bad Request')
      const errors = this.flattenValidationErrors(validationError)
      return new WsException(errors)
    }
  }
}