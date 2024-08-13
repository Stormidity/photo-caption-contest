'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  const Caption = sequelize.define('Caption', {
    caption_text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    imageId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Images',
        key: 'id',
      },
    },
  }, {});

  Caption.associate = (models) => {
    Caption.belongsTo(models.User, { foreignKey: 'userId' });
    Caption.belongsTo(models.Image, { foreignKey: 'imageId' });
  };
  return Caption;
};