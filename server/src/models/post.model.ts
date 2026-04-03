import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Post extends Model {
  public id!: string;
  public userId!: string;
  public text!: string;
  public imageUrl!: string | null;
  public visibility!: 'PUBLIC' | 'PRIVATE';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public likesCount!: number;
  public commentsCount!: number;
}

Post.init(
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
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    visibility: {
      type: DataTypes.ENUM('PUBLIC', 'PRIVATE'),
      defaultValue: 'PUBLIC',
      allowNull: false,
    },
    likesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    commentsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'posts',
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['createdAt'],
      },
      {
        fields: ['visibility'],
      },
    ],
  },
);

export default Post;
