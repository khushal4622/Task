import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const App = () => {
  const [transactions, setTransactions] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [barChartData, setBarChartData] = useState([]);
  const [pieChartData, setPieChartData] = useState([]);
  const [search, setSearch] = useState('');
  const [month, setMonth] = useState('March');
  const [page, setPage] = useState(1);
  const [perPage] = useState(5);

  const months = [
    'January', 'February', 'March', 'April', 'May',
    'June', 'July', 'August', 'September', 'October',
    'November', 'December',
  ];

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products/combined', {
        params: { page, perPage, search, month },
      });

      const { transactions, statistics, barChartData, pieChartData } = response.data;

      setTransactions(transactions);
      setStatistics(statistics);
      setBarChartData(barChartData);
      setPieChartData(pieChartData);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, search, month]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleMonthChange = (e) => {
    setMonth(e.target.value);
    setPage(1);
  };

  const handleNextPage = () => setPage(page + 1);
  const handlePreviousPage = () => page > 1 && setPage(page - 1);

  const barChartConfig = {
    labels: barChartData.map((item) => item.range),
    datasets: [
      {
        label: 'Items Count',
        data: barChartData.map((item) => item.count),
        backgroundColor: '#4CAF50',
      },
    ],
  };

  const pieChartConfig = {
    labels: pieChartData.map((item) => item.category),
    datasets: [
      {
        data: pieChartData.map((item) => item.count),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#FF5733', '#D4FF33'],
      },
    ],
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <h1 className='text-3xl my-5'>Transaction Dashboard</h1>
      <div className="flex justify-between mb-5">
        {/* Dropdownlist for select month */}
        <select className='p-2 text-normal border-[1px] border-[solid] border-[black]' value={month} onChange={handleMonthChange}>
          {months.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        {/* Search functionality */}
        <input
          className='p-2 text-normal border-[1px] border-[solid] border-[black]'
          type="text"
          placeholder="Search transactions..."
          value={search}
          onChange={handleSearch}
        />
      </div>
      {/* Bar Chart */}
      <div className="charts">
        <div className="bar-chart">
          <h3>Bar Chart</h3>
          <Bar data={barChartConfig} options={{ responsive: true }} />
        </div>
        {/* Pie Chart */}
        <div className="pie-chart">
          <h3>Pie Chart</h3>
          <Pie data={pieChartConfig} options={{ responsive: true }} />
        </div>
      </div>

      <table className="transactions-table">
        <thead>
          <tr>
            <th className="border border-slate-900">Title</th>
            <th>Description</th>
            <th>Price</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {/* Sold Transactions */}
          {transactions.filter(transaction => transaction.sold).map((transaction, index) => (
            <tr key={index}>
              <td>{transaction.title}</td>
              <td>{transaction.description}</td>
              <td>${transaction.price}</td>
              <td>{transaction.dateOfSale}</td>
              <td>Sold</td>
            </tr>
          ))}
          {/* Not Sold Transactions */}
          {transactions.filter(transaction => !transaction.sold).map((transaction, index) => (
            <tr key={index}>
              <td>{transaction.title}</td>
              <td>{transaction.description}</td>
              <td>${transaction.price}</td>
              <td>{transaction.dateOfSale}</td>
              <td>Not Sold</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="w-full flex justify-between">
        <button className='bg-black text-white py-2 px-3 rounded hover:bg-white hover:text-black hover:border-[1px] hover:border-[black] hover:border-[solid] cursor-pointer' onClick={handlePreviousPage} disabled={page === 1}>Previous</button>
        <button className='bg-black text-white py-2 px-3 rounded hover:bg-white hover:text-black hover:border-[1px] hover:border-[black] hover:border-[solid] cursor-pointer' onClick={handleNextPage}>Next</button>
      </div>
      <div className="border-[1px] border-[solid] border-[black] my-10 p-10">
        <h2 className='text-3xl my-5 text-center'>Statistics</h2>
        <div className='flex gap-5 justify-around border-[1px] border-[solid] border-[black] py-2'>
          <p className='text-[18px]'>Total Amount of Sale: ${statistics.totalSales || 0}</p>
          <p className='text-[18px]'>Total Sold Items: {statistics.soldItems || 0}</p>
          <p className='text-[18px]'>Total Not Sold Items: {statistics.notSoldItems || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default App;
