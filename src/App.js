import React, { useEffect, useState } from "react";
import Table from "react-bootstrap/Table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./App.css";
import axios from "axios";

function App() {
  const [customerTransactions, setCustomerTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchCustomerName, setSearchCustomerName] = useState("");
  const [searchTransactionAmount, setSearchTransactionAmount] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [transactionDataPerDay, setTransactionDataPerDay] = useState([]);

  // Fetch customer and transaction data
  const fetchData = async () => {
    try {
      const [customersResponse, transactionsResponse] = await Promise.all([
        axios.get("http://localhost:3000/customers"),
        axios.get("http://localhost:3000/transactions"),
      ]);

      const customers = customersResponse.data;
      const transactions = transactionsResponse.data;

      // Combine customers and their transactions
      const combinedData = customers.map((customer) => ({
        ...customer,
        transactions: transactions.filter(
          (transaction) => +transaction.customer_id === +customer.id
        ),
      }));

      setCustomerTransactions(combinedData);
      setFilteredTransactions(combinedData);
      console.log("Combined Customer Transactions:", combinedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Filter transactions based on search inputs
  const filterTransactions = () => {
    const lowerCaseName = searchCustomerName.toLowerCase();
    const filtered = customerTransactions.map((customer) => {
      const filteredTransactions = customer.transactions.filter(
        (transaction) => {
          const matchName = customer.name.toLowerCase().includes(lowerCaseName);
          const matchAmount = searchTransactionAmount
            ? transaction.amount == searchTransactionAmount
            : true;
          return matchName && matchAmount;
        }
      );

      return { ...customer, transactions: filteredTransactions };
    });

    setFilteredTransactions(filtered);
  };

  // Aggregate transactions per day for the selected customer
  const aggregateTransactionDataPerDay = (customerId) => {
    const selectedCustomer = customerTransactions.find(
      (customer) => customer.id == customerId
    );

    if (!selectedCustomer) {
      setTransactionDataPerDay([]);
      return;
    }

    const transactionData = selectedCustomer.transactions.reduce(
      (acc, transaction) => {
        const date = new Date(transaction.date).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = 0;
        }
        acc[date] += transaction.amount;
        return acc;
      },
      {}
    );

    const formattedData = Object.entries(transactionData).map(
      ([date, total]) => ({
        date,
        total,
      })
    );

    setTransactionDataPerDay(formattedData);
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Filter data when search inputs change
  useEffect(() => {
    filterTransactions();
  }, [searchCustomerName, searchTransactionAmount, customerTransactions]);

  // Update transaction data per day when the selected customer changes
  useEffect(() => {
    if (selectedCustomerId) {
      aggregateTransactionDataPerDay(selectedCustomerId);
    }
  }, [selectedCustomerId, customerTransactions]);

  return (
    <>
      <div className="search-container p-3">
        <input
          className="form-control "
          type="text"
          placeholder="Search by Customer Name"
          value={searchCustomerName}
          onChange={(e) => setSearchCustomerName(e.target.value)}
        />
        <input
          className="form-control my-3"
          type="number"
          placeholder="Search by Transaction Amount"
          value={searchTransactionAmount}
          onChange={(e) => setSearchTransactionAmount(e.target.value)}
        />
        <select
          onChange={(e) => setSelectedCustomerId(e.target.value)}
          className="form-control "
        >
          <option value="">Select Customer</option>
          {customerTransactions.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </select>
      </div>
      <Table responsive>
        <thead>
          <tr>
            <th>Customer ID</th>
            <th>Customer Name</th>
            <th>Transaction ID</th>
            <th>Transaction Date</th>
            <th>Transaction Amount</th>
          </tr>
        </thead>
        <tbody>
          {filteredTransactions.map((customer) => (
            <React.Fragment key={customer.id}>
              {customer.transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{customer.id}</td>
                  <td>{customer.name}</td>
                  <td>{transaction.id}</td>
                  <td>{transaction.date}</td>
                  <td>{transaction.amount}</td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </Table>
      {transactionDataPerDay.length > 0 && (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={transactionDataPerDay}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </>
  );
}

export default App;
