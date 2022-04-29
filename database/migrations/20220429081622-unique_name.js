'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.addIndex(
      'Users',
      ['username'],
      {
        fields: 'username',
        unique: true,
      }
    );
  },

  async down (queryInterface, Sequelize) {
    queryInterface.removeIndex(
      'Users',
      'username'
    );
  }
};
