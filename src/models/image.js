'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  const Image = sequelize.define('Image', {
    image_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
  }, {});

  Image.associate = (models) => {
    Image.hasMany(models.Caption, { foreignKey: 'imageId' });
  };

  return Image;
};