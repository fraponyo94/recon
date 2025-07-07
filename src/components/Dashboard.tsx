import React from 'react';
import { Card, Row, Col, Alert, Badge } from 'react-bootstrap';
import { CheckCircle, Clock, AlertCircle, FileText, Upload, Users, XCircle, MessageCircle } from 'lucide-react';
import { ReconciliationEntry, Transaction, FileUpload } from '../types';

interface DashboardProps {
  reconciliationEntries: ReconciliationEntry[];
  bankTransactions: Transaction[];
  systemTransactions: Transaction[];
  fileUploads: FileUpload[];
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  reconciliationEntries, 
  bankTransactions, 
  systemTransactions,
  fileUploads
}) => {
  const pendingApproval = reconciliationEntries.filter(entry => entry.status === 'pending_approval').length;
  const approved = reconciliationEntries.filter(entry => entry.status === 'approved').length;
  const rejected = reconciliationEntries.filter(entry => entry.status === 'rejected').length;
  const unreconciled = bankTransactions.filter(t => t.status === 'unreconciled').length;
  const totalTransactions = bankTransactions.length + systemTransactions.length;
  const pendingFiles = fileUploads.filter(file => file.status === 'pending_approval').length;

  const stats = [
    {
      title: 'Pending Reconciliations',
      value: pendingApproval,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning',
      bgLight: 'bg-warning-subtle'
    },
    {
      title: 'Approved Reconciliations',
      value: approved,
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success',
      bgLight: 'bg-success-subtle'
    },
    {
      title: 'Rejected Reconciliations',
      value: rejected,
      icon: XCircle,
      color: 'text-danger',
      bgColor: 'bg-danger',
      bgLight: 'bg-danger-subtle'
    },
    {
      title: 'Unreconciled Transactions',
      value: unreconciled,
      icon: AlertCircle,
      color: 'text-warning',
      bgColor: 'bg-warning',
      bgLight: 'bg-warning-subtle'
    },
    {
      title: 'Total Transactions',
      value: totalTransactions,
      icon: FileText,
      color: 'text-primary',
      bgColor: 'bg-primary',
      bgLight: 'bg-primary-subtle'
    },
    {
      title: 'Pending File Approvals',
      value: pendingFiles,
      icon: Upload,
      color: 'text-info',
      bgColor: 'bg-info',
      bgLight: 'bg-info-subtle'
    }
  ];

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'danger';
      case 'pending_approval':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getStatusIndicatorClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-success';
      case 'rejected':
        return 'bg-danger';
      case 'pending_approval':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <div className="container-fluid">
      <Row className="g-4 mb-4">
        {stats.map((stat) => (
          <Col key={stat.title} md={6} lg={4}>
            <Card className={`h-100 border-0 ${stat.bgLight}`}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <Card.Text className="small text-muted mb-1">{stat.title}</Card.Text>
                    <Card.Title className="mb-0 fw-bold h3">{stat.value}</Card.Title>
                  </div>
                  <div className={`p-3 rounded-circle ${stat.bgColor} bg-opacity-10`}>
                    <stat.icon className={stat.color} size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="g-4">
        {/* Recent Reconciliation Activity */}
        <Col lg={6}>
          <Card className="h-100">
            <Card.Header className="bg-white">
              <Card.Title className="mb-0">Recent Reconciliation Activity</Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="d-flex flex-column gap-3">
                {reconciliationEntries.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                    <div className="d-flex align-items-center">
                      <div className={`rounded-circle me-3`} style={{ width: '12px', height: '12px' }}>
                        <div className={`w-100 h-100 rounded-circle ${getStatusIndicatorClass(entry.status)}`}></div>
                      </div>
                      <div className="flex-grow-1">
                        <p className="mb-1 fw-medium">
                          Reconciliation {entry.id}
                        </p>
                        <p className="mb-0 small text-muted">
                          Created by {entry.createdBy} • {new Date(entry.createdAt).toLocaleDateString()}
                        </p>
                        {entry.rejectionReason && (
                          <p className="mb-0 small text-danger mt-1">
                            Rejected: {entry.rejectionReason.substring(0, 50)}...
                          </p>
                        )}
                        {entry.status === 'approved' && entry.approvedBy && (
                          <p className="mb-0 small text-success mt-1">
                            Approved by {entry.approvedBy}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge bg={getStatusBadgeVariant(entry.status)}>
                      {entry.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                ))}
                {reconciliationEntries.length === 0 && (
                  <div className="text-center py-4 text-muted">
                    No reconciliation activity yet.
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Recent File Upload Activity */}
        <Col lg={6}>
          <Card className="h-100">
            <Card.Header className="bg-white">
              <Card.Title className="mb-0">Recent File Upload Activity</Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="d-flex flex-column gap-3">
                {fileUploads.slice(0, 5).map((file) => (
                  <div key={file.id} className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                    <div className="d-flex align-items-center">
                      <div className={`rounded-circle me-3`} style={{ width: '12px', height: '12px' }}>
                        <div className={`w-100 h-100 rounded-circle ${getStatusIndicatorClass(file.status)}`}></div>
                      </div>
                      <div className="flex-grow-1">
                        <p className="mb-1 fw-medium">
                          {file.fileName}
                        </p>
                        <p className="mb-0 small text-muted">
                          {file.transactionCount} transactions • {file.source} • {file.uploadedBy}
                        </p>
                        {file.rejectionReason && (
                          <p className="mb-0 small text-danger mt-1">
                            Rejected: {file.rejectionReason.substring(0, 50)}...
                          </p>
                        )}
                        {file.status === 'approved' && file.approvedBy && (
                          <p className="mb-0 small text-success mt-1">
                            Approved by {file.approvedBy}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge bg={getStatusBadgeVariant(file.status)}>
                      {file.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                ))}
                {fileUploads.length === 0 && (
                  <div className="text-center py-4 text-muted">
                    No file upload activity yet.
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};