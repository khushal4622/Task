// server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = 5000;

// Enable CORS
app.use(cors());

// Fetch data from external source
let transactions = [];
const fetchData = async () => {
  if (transactions.length === 0) {
    try {
      const response = await axios.get(
        'https://s3.amazonaws.com/roxiler.com/product_transaction.json'
      );
      transactions = response.data;
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
};

// Utility functions
const filterByMonth = (data, month) => {
  return data.filter((item) => {
    const transactionMonth = new Date(item.dateOfSale).toLocaleString('default', {
      month: 'long',
    });
    return transactionMonth === month;
  });
};

const paginateData = (data, page, perPage) => {
  const start = (page - 1) * perPage;
  return data.slice(start, start + perPage);
};

const calculateStatistics = (data) => {
  const totalSales = data.reduce((sum, item) => sum + (item.sold ? item.price : 0), 0);
  const soldItems = data.filter((item) => item.sold).length;
  const notSoldItems = data.filter((item) => !item.sold).length;

  return { totalSales, soldItems, notSoldItems };
};

const calculateBarChartData = (data) => {
  const ranges = [
    { label: '0 - 100', min: 0, max: 100 },
    { label: '101 - 200', min: 101, max: 200 },
    { label: '201 - 300', min: 201, max: 300 },
    { label: '301 - 400', min: 301, max: 400 },
    { label: '401 - 500', min: 401, max: 500 },
    { label: '501 - 600', min: 501, max: 600 },
    { label: '601 - 700', min: 601, max: 700 },
    { label: '701 - 800', min: 701, max: 800 },
    { label: '801 - 900', min: 801, max: 900 },
    { label: '901-above', min: 901, max: Infinity },
  ];

  return ranges.map((range) => {
    const count = data.filter(
      (item) => item.price >= range.min && item.price <= range.max
    ).length;
    return { range: range.label, count };
  });
};

const calculatePieChartData = (data) => {
  const categoryCounts = {};

  data.forEach((item) => {
    const category = item.category || 'Unknown';
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  });

  return Object.entries(categoryCounts).map(([category, count]) => ({
    category,
    count,
  }));
};

// API Endpoints
app.get('/api/products', async (req, res) => {
  await fetchData();
  const { search = '', page = 1, perPage = 10, month = 'March' } = req.query;

  let filteredData = filterByMonth(transactions, month);

  if (search) {
    const lowerSearch = search.toLowerCase();
    filteredData = filteredData.filter(
      (item) =>
        item.title.toLowerCase().includes(lowerSearch) ||
        item.description.toLowerCase().includes(lowerSearch) ||
        item.price.toString().includes(lowerSearch)
    );
  }

  const paginatedData = paginateData(filteredData, parseInt(page), parseInt(perPage));
  res.json(paginatedData);
});

app.get('/api/products/statistics', async (req, res) => {
  await fetchData();
  const { month = 'March' } = req.query;
  const filteredData = filterByMonth(transactions, month);
  const statistics = calculateStatistics(filteredData);
  res.json(statistics);
});

app.get('/api/products/bar-chart', async (req, res) => {
  await fetchData();
  const { month = 'March' } = req.query;
  const filteredData = filterByMonth(transactions, month);
  const barChartData = calculateBarChartData(filteredData);
  res.json(barChartData);
});

app.get('/api/products/pie-chart', async (req, res) => {
  await fetchData();
  const { month = 'March' } = req.query;
  const filteredData = filterByMonth(transactions, month);
  const pieChartData = calculatePieChartData(filteredData);
  res.json(pieChartData);
});

app.get('/api/products/combined', async (req, res) => {
  await fetchData();
  const { search = '', page = 1, perPage = 10, month = 'March' } = req.query;

  let filteredData = filterByMonth(transactions, month);
  if (search) {
    const lowerSearch = search.toLowerCase();
    filteredData = filteredData.filter(
      (item) =>
        item.title.toLowerCase().includes(lowerSearch) ||
        item.description.toLowerCase().includes(lowerSearch) ||
        item.price.toString().includes(lowerSearch)
    );
  }

  const paginatedData = paginateData(filteredData, parseInt(page), parseInt(perPage));
  const statistics = calculateStatistics(filteredData);
  const barChartData = calculateBarChartData(filteredData);
  const pieChartData = calculatePieChartData(filteredData);

  res.json({
    transactions: paginatedData,
    statistics,
    barChartData,
    pieChartData,
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
