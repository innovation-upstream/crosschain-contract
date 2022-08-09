'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('TxLists', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      from_address: {
        type: Sequelize.STRING
      },
      to_address: {
        type: Sequelize.STRING
      },
      from_chain: {
        type: Sequelize.STRING
      },
      to_chain: {
        type: Sequelize.STRING
      },
      from_amount: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('TxLists');
  }
};