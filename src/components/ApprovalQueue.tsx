import React, { useState } from 'react';
import { Card, Button, Alert, Badge, Form, Row, Col } from 'react-bootstrap';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { ReconciliationEntry, Transaction } from '../types';
import { Check, X, MessageSquare, CheckCircle, XCircle, AlertCircle, MessageCircle } from 'lucide-react';

interface ApprovalQueueProps {
  entries: ReconciliationEntry[];
  bankTransactions: Transaction[];
  systemTransactions: Transaction[];
  onApprove: (entryId: string, comments?: string) => void;
  onReject: (entryId: string, reason: string) => void;
  userRole: string;
}

interface ApprovalFormData {
  comments: string;
  rejectionReason: string;
  status: 'approve' | 'reject' | '';
}

export const ApprovalQueue: React.FC<ApprovalQueueProps> = ({
  entries,
  bankTransactions,
  systemTransactions,
  onApprove,
  onReject,
  userRole
}) => {
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<ApprovalFormData>({
    defaultValues: {
      comments: '',
      rejectionReason: '',
      status: ''
    }
  });

  const pendingEntries = entries.filter(entry => entry.status === 'pending_approval');

  const getBankTransaction = (id: string) => 
    bankTransactions.find(t => t.id === id);

  const getSystemTransaction = (id: string) => 
    systemTransactions.find(t => t.id === id);

  const handleFormSubmit: SubmitHandler<ApprovalFormData> = (data) => {
    if (!selectedEntry) return;

    if (data.status === 'approve') {
      onApprove(selectedEntry, data.comments || undefined);
    } else if (data.status === 'reject' && data.rejectionReason.trim()) {
      onReject(selectedEntry, data.rejectionReason);
    }
    
    setSelectedEntry(null);
    reset();
  };

  const canApprove = userRole === 'checker' || userRole === 'admin';
  const watchedStatus = watch('status');
  const watchedRejectionReason = watch('rejectionReason');

  const StatusBadge: React.FC<{ status: string; className?: string }> = ({ status, className = "" }) => {
    const getStatusConfig = (status: string) => {
      switch (status) {
        case 'approved':
          return {
            icon: CheckCircle,
            variant: 'success' as const
          };
        case 'rejected':
          return {
            icon: XCircle,
            variant: 'danger' as const
          };
        case 'pending_approval':
          return {
            icon: AlertCircle,
            variant: 'warning' as const
          };
        default:
          return {
            icon: AlertCircle,
            variant: 'secondary' as const
          };
      }
    };

    const config = getStatusConfig(status);
    const Icon = config.icon;

    return (
      <Badge bg={config.variant} className={`d-inline-flex align-items-center ${className}`}>
        <Icon className="me-1" size={12} />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  return (
    <Card>
      <Card.Header className="bg-white">
        <Card.Title className="mb-1">Approval Queue</Card.Title>
        <Card.Text className="small text-muted mb-0">
          {pendingEntries.length} reconciliation{pendingEntries.length !== 1 ? 's' : ''} pending approval
        </Card.Text>
      </Card.Header>

      <Card.Body className="p-0">
        {entries.length === 0 ? (
          <div className="text-center py-5">
            <MessageSquare className="text-muted mb-3" size={48} />
            <h5 className="mb-2">No Reconciliations</h5>
            <p className="text-muted">No reconciliation entries have been created yet.</p>
          </div>
        ) : (
          <div className="list-group list-group-flush">
            {entries.map((entry) => {
              const bankTxn = getBankTransaction(entry.bankTransactionId);
              const systemTxn = getSystemTransaction(entry.systemTransactionId);
              const isSelected = selectedEntry === entry.id;

              return (
                <div key={entry.id} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h6 className="mb-1 fw-medium">
                        Reconciliation {entry.id}
                      </h6>
                      <p className="mb-0 small text-muted">
                        Created by {entry.createdBy} • {new Date(entry.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <StatusBadge status={entry.status} />
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => setSelectedEntry(isSelected ? null : entry.id)}
                      >
                        {isSelected ? 'Hide Details' : 'View Details'}
                      </Button>
                    </div>
                  </div>

                  {/* Approval/Rejection Remarks Display */}
                  {(entry.status === 'approved' || entry.status === 'rejected') && (
                    <Alert variant={entry.status === 'approved' ? 'success' : 'danger'} className="mb-3">
                      <div className="d-flex align-items-start">
                        {entry.status === 'approved' ? (
                          <CheckCircle className="me-2 mt-1" size={20} />
                        ) : (
                          <XCircle className="me-2 mt-1" size={20} />
                        )}
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="mb-0">
                              {entry.status === 'approved' ? 'Reconciliation Approved' : 'Reconciliation Rejected'}
                            </h6>
                            <small className="text-muted">
                              {entry.approvedBy} • {entry.approvedAt && new Date(entry.approvedAt).toLocaleString()}
                            </small>
                          </div>
                          {entry.rejectionReason && (
                            <Alert variant="light" className="border mb-0">
                              <strong>Reason:</strong> {entry.rejectionReason}
                            </Alert>
                          )}
                          {entry.status === 'approved' && entry.comments && (
                            <Alert variant="light" className="border mb-0">
                              <strong>Comments:</strong> {entry.comments}
                            </Alert>
                          )}
                        </div>
                      </div>
                    </Alert>
                  )}

                  {isSelected && (
                    <div className="mt-3">
                      <Row className="g-3 mb-4">
                        <Col md={6}>
                          <div className="p-3 bg-light rounded">
                            <h6 className="fw-medium mb-2">Bank Transaction</h6>
                            {bankTxn && (
                              <div>
                                <p className="mb-1 fw-medium">{bankTxn.description}</p>
                                <p className="mb-2 small text-muted">
                                  {bankTxn.reference} • {new Date(bankTxn.date).toLocaleDateString()}
                                </p>
                                <p className={`h6 fw-bold mb-0 ${
                                  bankTxn.type === 'credit' ? 'text-success' : 'text-danger'
                                }`}>
                                  {bankTxn.type === 'credit' ? '+' : '-'}${bankTxn.amount.toFixed(2)}
                                </p>
                              </div>
                            )}
                          </div>
                        </Col>

                        <Col md={6}>
                          <div className="p-3 bg-light rounded">
                            <h6 className="fw-medium mb-2">System Transaction</h6>
                            {systemTxn && (
                              <div>
                                <p className="mb-1 fw-medium">{systemTxn.description}</p>
                                <p className="mb-2 small text-muted">
                                  {systemTxn.reference} • {new Date(systemTxn.date).toLocaleDateString()}
                                </p>
                                <p className={`h6 fw-bold mb-0 ${
                                  systemTxn.type === 'credit' ? 'text-success' : 'text-danger'
                                }`}>
                                  {systemTxn.type === 'credit' ? '+' : '-'}${systemTxn.amount.toFixed(2)}
                                </p>
                              </div>
                            )}
                          </div>
                        </Col>
                      </Row>

                      {entry.comments && entry.status === 'pending_approval' && (
                        <Alert variant="info" className="mb-4">
                          <div className="d-flex align-items-start">
                            <MessageCircle className="me-2 mt-1" size={16} />
                            <div>
                              <h6 className="mb-1">Maker Comments</h6>
                              <p className="mb-0 small">{entry.comments}</p>
                            </div>
                          </div>
                        </Alert>
                      )}

                      {canApprove && entry.status === 'pending_approval' && (
                        <Card className="border-top pt-4">
                          <Card.Body>
                            <Form onSubmit={handleSubmit(handleFormSubmit)}>
                              <Row className="g-3">
                                <Col md={6}>
                                  <Form.Group className="mb-3">
                                    <Form.Label className="fw-medium">
                                      Action *
                                    </Form.Label>
                                    <Controller
                                      name="status"
                                      control={control}
                                      rules={{ required: 'Please select an action' }}
                                      render={({ field }) => (
                                        <Form.Select
                                          isInvalid={!!errors.status}
                                          {...field}
                                        >
                                          <option value="">Select Action</option>
                                          <option value="approve">Approve</option>
                                          <option value="reject">Reject</option>
                                        </Form.Select>
                                      )}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                      {errors.status?.message}
                                    </Form.Control.Feedback>
                                  </Form.Group>
                                </Col>

                                <Col md={6}>
                                  <Form.Group className="mb-3">
                                    <Form.Label className="fw-medium">
                                      Comments {watchedStatus === 'approve' ? '(Optional)' : ''}
                                    </Form.Label>
                                    <Controller
                                      name="comments"
                                      control={control}
                                      render={({ field }) => (
                                        <Form.Control
                                          as="textarea"
                                          rows={2}
                                          placeholder="Add any comments..."
                                          {...field}
                                        />
                                      )}
                                    />
                                  </Form.Group>
                                </Col>

                                {watchedStatus === 'reject' && (
                                  <Col md={12}>
                                    <Form.Group className="mb-3">
                                      <Form.Label className="fw-medium">
                                        Rejection Reason *
                                      </Form.Label>
                                      <Controller
                                        name="rejectionReason"
                                        control={control}
                                        rules={{
                                          required: watchedStatus === 'reject' ? 'Rejection reason is required' : false
                                        }}
                                        render={({ field }) => (
                                          <Form.Control
                                            as="textarea"
                                            rows={3}
                                            placeholder="Provide detailed reason for rejection..."
                                            isInvalid={!!errors.rejectionReason}
                                            {...field}
                                          />
                                        )}
                                      />
                                      <Form.Control.Feedback type="invalid">
                                        {errors.rejectionReason?.message}
                                      </Form.Control.Feedback>
                                    </Form.Group>
                                  </Col>
                                )}

                                <Col md={12}>
                                  <div className="d-flex justify-content-end gap-2">
                                    <Button
                                      variant="outline-secondary"
                                      onClick={() => {
                                        setSelectedEntry(null);
                                        reset();
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      variant={watchedStatus === 'reject' ? 'danger' : 'success'}
                                      type="submit"
                                      disabled={
                                        !watchedStatus || 
                                        (watchedStatus === 'reject' && !watchedRejectionReason?.trim())
                                      }
                                    >
                                      {watchedStatus === 'reject' ? (
                                        <>
                                          <X className="me-1" size={16} />
                                          Reject
                                        </>
                                      ) : (
                                        <>
                                          <Check className="me-1" size={16} />
                                          Approve
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                </Col>
                              </Row>
                            </Form>
                          </Card.Body>
                        </Card>
                      )}

                      {!canApprove && entry.status === 'pending_approval' && (
                        <Alert variant="warning">
                          <div className="d-flex align-items-center">
                            <AlertCircle className="me-2" size={20} />
                            <p className="mb-0">
                              You need checker or admin role to approve reconciliations.
                            </p>
                          </div>
                        </Alert>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};