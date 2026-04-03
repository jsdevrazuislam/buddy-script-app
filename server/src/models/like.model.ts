import { DataTypes, Model } from 'sequelize';

import sequelize from '../config/database';

class Like extends Model {
  public id!: string;
  public userId!: string;
  public targetId!: string;
  public targetType!: 'POST' | 'COMMENT' | 'REPLY';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Like.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    targetId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    targetType: {
      type: DataTypes.ENUM('POST', 'COMMENT', 'REPLY'),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'likes',
    indexes: [
      {
        unique: true,
        fields: ['userId', 'targetId', 'targetType'],
      },
      {
        fields: ['targetId', 'targetType'],
      },
    ],
  },
);

export default Like;
