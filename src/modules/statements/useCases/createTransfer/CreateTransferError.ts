import { AppError } from "../../../../shared/errors/AppError";

export namespace CreateTransferError {

  export class SameUser extends AppError {
    constructor() {
      super('Same User', 400)
    }
  }

  export class UserNotFound extends AppError {
    constructor() {
      super('User not found', 400)
    }
  }

  export class InsufficientFunds extends AppError {
    constructor() {
      super('Insufficient Funds', 400)
    }
  }
}
