# mongoose-alphanumeric

Plugin for Mongoose that generates alphanumeric code from a set of specified characters and length. Inspired by [mongoose-sluggable](https://www.npmjs.com/package/mongoose-sluggable).

## Installation

```sh
npm install mongoose-alphanumeric
```

## Requirements

Plugin requires alphanumeric field path to be added to the model without the **required** property.

## Usage

```
const mongooseAlphanumeric = require('mongoose-alphanumeric');

const schema = new Schema({
    alphanumeric: { type: String, index: true , unique: true}
});

schema.plugin(mongooseAlphanumeric)

const Model = mongoose.model('Model',  schema);
```

**Options**
Add options as per your requirements for alphanumeric code generation

- `[options]` {Object}
  - `[field]` {String} - Name of field for storing alphanumeric, field name must match the field name set on the model schema. Default value is **alphanumeric**
  - `[unique]` {Boolean} - If unique is set to false then the same alphanumeric code can be used in other documents within the same collection. Default value is **true**
  - `[length]` {Number} - Determines the length of the alphanumeric code to be generated. Default value is **4**
  - `[chars]` {String} - Set of characters from where alphanumeric code can be generated. Default value is **0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ**

### Example

```
schema.plugin(mongooseAlphanumeric, {
  field: 'alphanumeric',
  unique: true,
  length: 5,
  chars: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
});
```
