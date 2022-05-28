'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    'Users',
      [
        {
          name: 'Jane Doe',
          email: 'janedoe@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Jon Doe',
          email: 'jondoe@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
