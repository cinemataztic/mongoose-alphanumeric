function generateAlphaNumericCode(length, chars) {
  let alphanumericCode = "";
  for (let i = length; i > 0; i--) {
    alphanumericCode += chars[Math.floor(Math.random() * chars.length)];
  }

  return alphanumericCode;
}

const alphanumericPlugin = function (schema, options) {
  const optionsCpy = options || {};

  let alphanumeric = optionsCpy.field ? optionsCpy.field : "alphanumeric";
  let unique = optionsCpy.unique ? true : false;
  let length = optionsCpy.length ? parseInt(optionsCpy.length, 10) : 4;
  let chars = optionsCpy.chars
    ? optionsCpy.chars
    : "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  schema.pre("save", function (next) {
    if (this.isNew) {
      const uniqueCode = generateAlphaNumericCode(length, chars);

      if (!unique) {
        this[alphanumeric] = uniqueCode;
        next();
      }

      let self = this;
      let query = {};

      function findNewCode(code) {
        query[alphanumeric] = code;
        query["_id"] = { $ne: self._id };
        self.constructor.findOne(query, function (err, data) {
          if (err) {
            throw err;
          }
          if (!data) {
            self[alphanumeric] = code;
            next();
          } else {
            const newUniqueCode = generateAlphaNumericCode(length, chars);
            findNewCode(newUniqueCode);
          }
        });
      }

      findNewCode(uniqueCode);
    } else {
      next();
    }
  });
};

module.exports = alphanumericPlugin;
