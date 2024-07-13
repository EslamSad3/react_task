import React, { useEffect, useState } from "react";
import Table from "react-bootstrap/Table";
import "./App.css";
import axios from "axios";

function App() {
  const [customerTransactions, setCustomerTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchCustomerName, setSearchCustomerName] = useState("");
  const [searchTransactionAmount, setSearchTransactionAmount] = useState("");

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

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Filter data when search inputs change
  useEffect(() => {
    filterTransactions();
  }, [searchCustomerName, searchTransactionAmount, customerTransactions]);

  return (
    <>
      <div className="search-container p-5">
        <input
          className="form-control mb-3"
          type="text"
          placeholder="Search by Customer Name"
          value={searchCustomerName}
          onChange={(e) => setSearchCustomerName(e.target.value)}
        />
        <input
          className="form-control"
          type="number"
          placeholder="Search by Transaction Amount"
          value={searchTransactionAmount}
          onChange={(e) => setSearchTransactionAmount(e.target.value)}
        />
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
    </>
  );
}

export default App;
