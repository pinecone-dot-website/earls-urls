'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'Urls',
      'text',
      {
        type: Sequelize.TEXT,
        after: 'url',
        allowNull: true,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      'Urls',
      'text'
    );
  }
};
