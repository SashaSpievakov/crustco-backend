import { MongooseException } from '../exceptions/mongoose.exception';

export function isMongooseException(error: unknown): error is MongooseException {
  return (
    typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'number'
  );
}
