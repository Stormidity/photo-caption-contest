'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Images', [
      {
        image_url: '/images/image1.jpg',
        description: 'Image description',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        image_url: '/images/image2.jpg',
        description: 'Image description',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        image_url: '/images/image3.jpg',
        description: 'Image description',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        image_url: '/images/image4.jpg',
        description: 'Image description',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {})
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Images', null, {})
  }
};
