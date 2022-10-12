function generateAlphaNumericCode(length, chars) {
  let alphanumericCode = "";
  for (let i = length; i > 0; i--) {
    alphanumericCode += chars[Math.floor(Math.random() * chars.length)];
  }
  return alphanumericCode;
}

/*
 * @param {Object} self Model document reference
 * @param {String} code Alphanumeric code
 * @param {String} alphaNumId Field path set in model and passed in options
 * @param {Number} length Length for generating alphanumeric code
 * @param {String} chars Set of characters from where alphanumeric code shall be generated
 * @callback next
 */
function findNewCode(self, code, alphaNumId, length, chars, next) {
  let query = {};
  query[alphaNumId] = code;
  query["_id"] = { $ne: self._id };
  self.constructor.findOne(query, function (err, data) {
    if (err) {
      throw err;
    }
    if (!data) {
      self[alphaNumId] = code;
      next();
    } else {
      const newUniqueCode = generateAlphaNumericCode(length, chars);
      findNewCode(self, newUniqueCode, alphaNumId, length, chars, next);
    }
  });
}

const alphanumericPlugin = function (schema, options) {
  let optionsCpy = options || {};

  let unique = optionsCpy.unique ? true : false;
  let alphanumeric = optionsCpy.field ? optionsCpy.field : "alphanumeric";
  let length = optionsCpy.length ? parseInt(optionsCpy.length, 10) : 4; //parse length to integer in case a string is provided in edge case
  let chars = optionsCpy.chars
    ? optionsCpy.chars
    : "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  // DOCUMENT MIDDLEWARE: runs before .save() and .create()
  schema.pre("save", function (next) {
    //* If document is new then generate alphanumeric code
    if (this.isNew) {
      const uniqueCode = generateAlphaNumericCode(length, chars);

      //* If alphanumeric is not unique then assign code to document without unique constraint check
      if (!unique) {
        this[alphanumeric] = uniqueCode;
        next();
      }

      let self = this;

      findNewCode(self, uniqueCode, alphanumeric, length, chars, next);
    } else {
      let self = this;
      let query = {};

      function findCodeInDocument() {
        query[alphanumeric] = { $exists: false };
        query["_id"] = { $eq: self._id };
        //* If document is not new then update document by _id where alphanumeric code does not exists
        self.constructor.findOne(query, function (err, data) {
          if (err) {
            throw err;
          }
          if (data) {
            //* If no alphanumeric code exists in document then generate alphanumeric code
            const uniqueCode = generateAlphaNumericCode(length, chars);
            //* Non-unique constraint check for alphanumeric code
            if (!unique) {
              self[alphanumeric] = uniqueCode;
              next();
            } else {
              //* Unique constraint check for alphanumeric code
              findNewCode(self, uniqueCode, alphanumeric, length, chars, next);
            }
          } else {
            //* If alphanumeric code exists in document then exit middleware
            next();
          }
        });
      }

      findCodeInDocument();
    }
  });
};

module.exports = alphanumericPlugin;
