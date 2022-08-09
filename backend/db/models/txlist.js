'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TxList extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  TxList.init({
    from_address: DataTypes.STRING,
    to_address: DataTypes.STRING,
    from_chain: DataTypes.STRING,
    to_chain: DataTypes.STRING,
    from_amount: DataTypes.STRING,
    status: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'TxList',
  });
  return TxList;
};