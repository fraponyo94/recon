import React, { useState } from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { Transaction } from '../types';
import { Plus, X } from 'lucide-react';

interface IndividualTransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'status'>) => void;
  userRole: string;
}

interface TransactionFormData {
  accountId: string;
  date: string;
  transId: string;
  amount: string;
  description: string;
  type: 'credit' | 'debit';
  reference: string;
  source: 'bank' | 'system';
}

export const IndividualTransactionForm: React.FC<IndividualTransactionFormProps> = ({
  onAddTransaction,
  userRole
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const { control, handleSubmit, reset, formState: { errors } } = useForm<TransactionFormData>({
    defaultValues: {
      accountId: '',
      date: '',
      transId: '',
      amount: '',
      description: '',
      type: 'credit',
      reference: '',
      source: 'bank'
    }
  });

  const handleFormSubmit: SubmitHandler<TransactionFormData> = (data) => {
    const transaction: Omit<Transaction, 'id' | 'status'> = {
      accountId: data.accountId,
      date: data.date,
      transId: data.transId,
      amount: parseFloat(data.amount),
      description: data.description,
      type: data.type,
      reference: data.reference || data.transId,
      source: data.source
    };

    onAddTransaction(transaction);
    reset();
    setIsOpen(false);
  };

  const handleCancel = () => {
    reset();
    setIsOpen(false);
  };

  const canAdd = userRole === 'maker' || userRole === 'admin';

  if (!canAdd) {
    return (
      <Card>
        <Card.Body className="text-center py-4">
          <p className="text-muted mb-0">
            You need maker or admin role to add individual transactions.
          </p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header className="bg-white">
        <div className="d-flex justify-content-between align-items-center">
          <Card.Title className="mb-0">Add Individual Transaction</Card.Title>
          <Button
            variant="primary"
            onClick={() => setIsOpen(!isOpen)}
            className="d-flex align-items-center"
          >
            {isOpen ? (
              <>
                <X className="me-1" size={16} />
                Cancel
              </>
            ) : (
              <>
                <Plus className="me-1" size={16} />
                Add Transaction
              </>
            )}
          </Button>
        </div>
      </Card.Header>

      {isOpen && (
        <Card.Body>
          <Form onSubmit={handleSubmit(handleFormSubmit)}>
            <Row className="g-3 mb-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium">
                    Transaction Source *
                  </Form.Label>
                  <Controller
                    name="source"
                    control={control}
                    rules={{ required: 'Transaction source is required' }}
                    render={({ field }) => (
                      <Form.Select
                        isInvalid={!!errors.source}
                        {...field}
                      >
                        <option value="bank">Bank Transaction</option>
                        <option value="system">System Transaction</option>
                      </Form.Select>
                    )}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.source?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium">
                    Account ID *
                  </Form.Label>
                  <Controller
                    name="accountId"
                    control={control}
                    rules={{ required: 'Account ID is required' }}
                    render={({ field }) => (
                      <Form.Control
                        type="text"
                        placeholder="e.g., ACC-001"
                        isInvalid={!!errors.accountId}
                        {...field}
                      />
                    )}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.accountId?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium">
                    Transaction Date *
                  </Form.Label>
                  <Controller
                    name="date"
                    control={control}
                    rules={{ required: 'Transaction date is required' }}
                    render={({ field }) => (
                      <Form.Control
                        type="date"
                        isInvalid={!!errors.date}
                        {...field}
                      />
                    )}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.date?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium">
                    Transaction ID *
                  </Form.Label>
                  <Controller
                    name="transId"
                    control={control}
                    rules={{ required: 'Transaction ID is required' }}
                    render={({ field }) => (
                      <Form.Control
                        type="text"
                        placeholder="e.g., TXN-001"
                        isInvalid={!!errors.transId}
                        {...field}
                      />
                    )}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.transId?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium">
                    Amount *
                  </Form.Label>
                  <Controller
                    name="amount"
                    control={control}
                    rules={{ 
                      required: 'Amount is required',
                      pattern: {
                        value: /^\d+(\.\d{1,2})?$/,
                        message: 'Please enter a valid amount'
                      },
                      min: {
                        value: 0.01,
                        message: 'Amount must be greater than 0'
                      }
                    }}
                    render={({ field }) => (
                      <Form.Control
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        isInvalid={!!errors.amount}
                        {...field}
                      />
                    )}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.amount?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium">
                    Transaction Type *
                  </Form.Label>
                  <Controller
                    name="type"
                    control={control}
                    rules={{ required: 'Transaction type is required' }}
                    render={({ field }) => (
                      <Form.Select
                        isInvalid={!!errors.type}
                        {...field}
                      >
                        <option value="credit">Credit</option>
                        <option value="debit">Debit</option>
                      </Form.Select>
                    )}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.type?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">
                Description *
              </Form.Label>
              <Controller
                name="description"
                control={control}
                rules={{ required: 'Description is required' }}
                render={({ field }) => (
                  <Form.Control
                    type="text"
                    placeholder="Transaction description"
                    isInvalid={!!errors.description}
                    {...field}
                  />
                )}
              />
              <Form.Control.Feedback type="invalid">
                {errors.description?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-medium">
                Reference (Optional)
              </Form.Label>
              <Controller
                name="reference"
                control={control}
                render={({ field }) => (
                  <Form.Control
                    type="text"
                    placeholder="Reference number or code"
                    {...field}
                  />
                )}
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="outline-secondary"
                type="button"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
              >
                Add Transaction
              </Button>
            </div>
          </Form>
        </Card.Body>
      )}
    </Card>
  );
};