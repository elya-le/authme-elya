'use strict';
const uploadImage = require('../utils/uploadImage');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up(queryInterface) {
    const images = [
      { eventId: 1, filePath: 'path/to/local/image1.png' },
      { eventId: 2, filePath: 'path/to/local/image2.png' },
      { eventId: 3, filePath: 'path/to/local/image3.png' },
      { eventId: 4, filePath: 'path/to/local/image4.png' },
      { eventId: 5, filePath: 'path/to/local/image5.png' },
      { eventId: 6, filePath: 'path/to/local/image6.png' },
      { eventId: 7, filePath: 'path/to/local/image7.png' },
      { eventId: 8, filePath: 'path/to/local/image8.png' },
      { eventId: 9, filePath: 'path/to/local/image9.png' },
      { eventId: 10, filePath: 'path/to/local/image10.png' },
      { eventId: 11, filePath: 'path/to/local/image11.png' },
      { eventId: 12, filePath: 'path/to/local/image12.png' },
    ];

    for (let image of images) {
      image.url = await uploadImage(image.filePath, `event_${image.eventId}`);
      image.preview = true;
      image.createdAt = new Date();
      image.updatedAt = new Date();
    }

    await queryInterface.bulkInsert(
      { tableName: 'EventImages', schema: options.schema },
      images,
      { validate: true }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      { tableName: 'EventImages', schema: options.schema },
      null,
      {}
    );
  },
};
