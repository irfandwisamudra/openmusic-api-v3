const InvariantError = require('../../exception/InvariantError');
const { CoverHeadersSchema } = require('./schema');

const UploadsValidator = {
  validateCoverHeaders: (headers) => {
    const validationResult = CoverHeadersSchema.validate(headers);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = UploadsValidator;
