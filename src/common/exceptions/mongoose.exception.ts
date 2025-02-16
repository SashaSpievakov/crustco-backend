import { MongooseError } from 'mongoose';

export class MongooseException extends MongooseError {
  code?: number;
  keyPattern?: Record<string, any>;
  keyValue?: Record<string, any>;

  constructor(
    message: string,
    code?: number,
    keyPattern?: Record<string, any>,
    keyValue?: Record<string, any>,
  ) {
    super(message);
    this.code = code;
    this.keyPattern = keyPattern;
    this.keyValue = keyValue;
  }
}
