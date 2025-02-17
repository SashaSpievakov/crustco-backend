import { isMongooseException } from './mongoose.utils';

describe('isMongooseException', () => {
  it('should return true for a valid MongooseException', () => {
    const error = { code: 11000, message: 'Duplicate key error' };
    expect(isMongooseException(error)).toBe(true);
  });

  it('should return false for an error without a code', () => {
    const error = { message: 'Some error' };
    expect(isMongooseException(error)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isMongooseException(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isMongooseException(undefined)).toBe(false);
  });

  it('should return false for a non-object type (string)', () => {
    expect(isMongooseException('some error')).toBe(false);
  });

  it('should return false for an object with a non-number code', () => {
    const error = { code: 'not-a-number' };
    expect(isMongooseException(error)).toBe(false);
  });
});
