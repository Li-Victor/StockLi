import redis from 'redis';
import { promisify } from 'util';

const client = redis.createClient();
client.on('connect', () => console.log('Connected to Redis'));
const zAddAsync = promisify(client.zadd).bind(client);
const zRangeAync = promisify(client.zrange).bind(client);
const zRemRangeByScoreAsync = promisify(client.zremrangebyscore).bind(client);
const hSetAsync = promisify(client.hset).bind(client);
const hGetAllAsync = promisify(client.hgetall).bind(client);

export const addStock = (id, value) => zAddAsync('Stocks', id, value);
export const deleteStock = stockID => zRemRangeByScoreAsync('Stocks', stockID, stockID);
export const getAllStocks = async () => {
  const stocks = [];
  const stocksWithScores = await zRangeAync('Stocks', 0, -1, 'WITHSCORES');
  for (let i = 0; i < stocksWithScores.length; i += 2) {
    stocks.push({
      id: Number(stocksWithScores[i + 1]),
      value: stocksWithScores[i]
    });
  }
  return stocks;
};

export const setupCurrencyList = (currencyCode, currencyName) =>
  hSetAsync('currencyList', currencyCode, currencyName);
export const getCurrencyList = async () => {
  // hGetAll returns a huge object with key and values
  // need to make array of objects
  const list = [];
  const currencyList = await hGetAllAsync('currencyList');
  Object.entries(currencyList).forEach(([key, value]) => {
    list.push({ code: key, name: value });
  });
  return list;
};