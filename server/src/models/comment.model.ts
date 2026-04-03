import { DataTypes, Model } from 'sequelize';

import sequelize from '../config/database';

class Comment extends Model {
  public id!: string;
  public userId!: string;
  public postId!: string;
  public text!: string;
  public parentId!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Comment.init(
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
    postId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'posts',
        key: 'id',
      },
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'comments',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'comments',
    indexes: [
      {
        fields: ['postId'],
      },
      {
        fields: ['parentId'],
      },
      {
        fields: ['userId'],
      },
      {
        fields: ['createdAt'],
      },
    ],
  },
);

export default Comment;
