import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const isRemoteDb =
  process.env.DB_HOST?.includes('.neon.tech') ||
  process.env.DB_HOST?.includes('amazonaws.com') ||
  process.env.DB_HOST?.includes('supabase');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'social_feed',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASS || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    ...(isRemoteDb || isProduction
      ? {
          dialectOptions: {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          },
        }
      : {}),
  },
);

export default sequelize;
