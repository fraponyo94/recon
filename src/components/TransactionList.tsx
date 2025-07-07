import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { Transaction } from '../types';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface TransactionListProps {
  title: string;
  transactions: Transaction[];
  selectedTransaction?: Transaction;
  onTransactionSelect: (transaction: Transaction) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  title,
  transactions,
  selectedTransaction,
  onTransactionSelect
}) => {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'reconciled':
        return 'success';
      case 'pending':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  return (
    <Card className="h-100">
      <Card.Header className="bg-white">
        <Card.Title className="mb-0">{title}</Card.Title>
      </Card.Header>
      <Card.Body className="p-0">
        <div className="list-group list-group-flush">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              onClick={() => onTransactionSelect(transaction)}
              className={`list-group-item list-group-item-action transaction-card ${
                selectedTransaction?.id === transaction.id ? 'selected-transaction' : ''
              }`}
              style={{ cursor: 'pointer' }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <div className={`p-2 rounded-circle me-3 ${
                    transaction.type === 'credit' ? 'bg-credit' : 'bg-debit'
                  }`}>
                    {transaction.type === 'credit' ? (
                      <ArrowUpRight className="transaction-type-credit" size={16} />
                    ) : (
                      <ArrowDownRight className="transaction-type-debit" size={16} />
                    )}
                  </div>
                  <div>
                    <p className="mb-1 fw-medium">{transaction.description}</p>
                    <p className="mb-0 small text-muted">
                      {transaction.reference} • {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-end">
                  <p className={`mb-1 h6 fw-bold ${
                    transaction.type === 'credit' ? 'transaction-type-credit' : 'transaction-type-debit'
                  }`}>
                    {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </p>
                  <Badge bg={getStatusBadgeVariant(transaction.status)}>
                    {transaction.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="text-center py-4 text-muted">
              No transactions available
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};