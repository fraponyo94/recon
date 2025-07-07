import React from 'react';
import { Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { Transaction, ReconciliationEntry } from '../types';
import { Check, X, MessageSquare } from 'lucide-react';

interface ReconciliationFormProps {
  bankTransaction: Transaction | null;
  systemTransaction: Transaction | null;
  onSubmit: (entry: Omit<ReconciliationEntry, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  userRole: string;
}

interface ReconciliationFormData {
  comments: string;
}

export const ReconciliationForm: React.FC<ReconciliationFormProps> = ({
  bankTransaction,
  systemTransaction,
  onSubmit,
  onCancel,
  userRole
}) => {
  const { control, handleSubmit, reset } = useForm<ReconciliationFormData>({
    defaultValues: {
      comments: ''
    }
  });

  const handleFormSubmit: SubmitHandler<ReconciliationFormData> = (data) => {
    if (!bankTransaction || !systemTransaction) return;

    onSubmit({
      bankTransactionId: bankTransaction.id,
      systemTransactionId: systemTransaction.id,
      createdBy: 'John Doe', // In real app, this would come from auth context
      status: 'pending_approval',
      comments: data.comments || undefined
    });

    reset();
  };

  const canMatch = bankTransaction && systemTransaction && 
    bankTransaction.amount === systemTransaction.amount &&
    bankTransaction.type === systemTransaction.type;

  if (!bankTransaction || !systemTransaction) {
    return (
      <Card className="h-100">
        <Card.Body className="d-flex align-items-center justify-content-center">
          <div className="text-center py-4">
            <MessageSquare className="text-muted mb-3" size={48} />
            <Card.Title>Select Transactions to Match</Card.Title>
            <Card.Text className="text-muted">
              Please select one bank transaction and one system transaction to create a reconciliation.
            </Card.Text>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="h-100">
      <Card.Header className="bg-white">
        <Card.Title className="mb-0">Create Reconciliation</Card.Title>
      </Card.Header>
      
      <Card.Body>
        <Form onSubmit={handleSubmit(handleFormSubmit)}>
          <Row className="g-3 mb-4">
            <Col md={6}>
              <h6 className="fw-medium mb-3">Bank Transaction</h6>
              <div className="p-3 bg-light rounded">
                <p className="fw-medium mb-1">{bankTransaction.description}</p>
                <p className="small text-muted mb-2">
                  {bankTransaction.reference} • {new Date(bankTransaction.date).toLocaleDateString()}
                </p>
                <p className={`h5 fw-bold mb-0 ${
                  bankTransaction.type === 'credit' ? 'text-success' : 'text-danger'
                }`}>
                  {bankTransaction.type === 'credit' ? '+' : '-'}${bankTransaction.amount.toFixed(2)}
                </p>
              </div>
            </Col>

            <Col md={6}>
              <h6 className="fw-medium mb-3">System Transaction</h6>
              <div className="p-3 bg-light rounded">
                <p className="fw-medium mb-1">{systemTransaction.description}</p>
                <p className="small text-muted mb-2">
                  {systemTransaction.reference} • {new Date(systemTransaction.date).toLocaleDateString()}
                </p>
                <p className={`h5 fw-bold mb-0 ${
                  systemTransaction.type === 'credit' ? 'text-success' : 'text-danger'
                }`}>
                  {systemTransaction.type === 'credit' ? '+' : '-'}${systemTransaction.amount.toFixed(2)}
                </p>
              </div>
            </Col>
          </Row>

          <Alert 
            variant={canMatch ? 'success' : 'danger'} 
            className="d-flex align-items-center mb-4"
          >
            {canMatch ? (
              <Check className="me-2" size={20} />
            ) : (
              <X className="me-2" size={20} />
            )}
            <span className="fw-medium">
              {canMatch ? 'Transactions Match' : 'Transactions Do Not Match'}
            </span>
            {!canMatch && (
              <div className="ms-auto">
                <small>Amount, type, or other criteria do not match between the selected transactions.</small>
              </div>
            )}
          </Alert>

          <Form.Group className="mb-4">
            <Form.Label className="fw-medium">
              Comments (Optional)
            </Form.Label>
            <Controller
              name="comments"
              control={control}
              render={({ field }) => (
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Add any additional notes or comments..."
                  {...field}
                />
              )}
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button
              variant="outline-secondary"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={userRole !== 'maker' && userRole !== 'admin'}
            >
              Create Reconciliation
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};