import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Form, Row, Col, Alert, Badge, Table, Pagination, InputGroup } from 'react-bootstrap';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { FileUpload, Transaction, PaginatedResponse, FileUploadSearchParams } from '../types';
import { Upload, FileText, Check, X, AlertCircle, Download, ArrowUpRight, ArrowDownRight, Eye, EyeOff, MessageCircle, CheckCircle, XCircle, ChevronLeft, ChevronRight, Search, Filter, Loader } from 'lucide-react';

interface FileUploadManagerProps {
  fileUploads: FileUpload[];
  onFileUpload: (file: File, source: 'bank' | 'system', organization: string, schedule: string, remarks?: string) => void;
  onApproveFile: (fileId: string, comments?: string) => void;
  onRejectFile: (fileId: string, reason: string) => void;
  onSearchFiles: (params: FileUploadSearchParams) => Promise<PaginatedResponse<FileUpload>>;
  userRole: string;
}

interface UploadFormData {
  source: 'bank' | 'system';
  organization: string;
  schedule: string;
  remarks: string;
}

interface ApprovalFormData {
  status: 'approve' | 'reject' | '';
  comments: string;
  rejectionReason: string;
}

interface SearchFormData {
  searchTerm: string;
  organization: string;
  schedule: string;
  status: string;
  pageSize: number;
}

const FileUploadManager: React.FC<FileUploadManagerProps> = ({
  fileUploads,
  onFileUpload,
  onApproveFile,
  onRejectFile,
  onSearchFiles,
  userRole
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [showTransactions, setShowTransactions] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Search and pagination state
  const [searchParams, setSearchParams] = useState<FileUploadSearchParams>({
    page: 1,
    pageSize: 10,
    organization: 'all',
    schedule: 'all',
    status: 'all',
    searchTerm: ''
  });
  const [paginatedData, setPaginatedData] = useState<PaginatedResponse<FileUpload> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form instances
  const uploadForm = useForm<UploadFormData>({
    defaultValues: {
      source: 'bank',
      organization: '',
      schedule: '',
      remarks: ''
    }
  });

  const searchForm = useForm<SearchFormData>({
    defaultValues: {
      searchTerm: '',
      organization: 'all',
      schedule: 'all',
      status: 'all',
      pageSize: 10
    }
  });

  const approvalForms = useForm<ApprovalFormData>({
    defaultValues: {
      status: '',
      comments: '',
      rejectionReason: ''
    }
  });

  // Organization options
  const organizationOptions = [
    'Head Office',
    'Branch A',
    'Branch B',
    'Branch C',
    'Regional Office North',
    'Regional Office South',
    'Corporate Division',
    'Operations Division'
  ];

  // Schedule options
  const scheduleOptions = [
    'Daily',
    'Weekly',
    'Monthly',
    'Quarterly',
    'Ad-hoc',
    'End of Day',
    'End of Month',
    'Real-time'
  ];

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((params: FileUploadSearchParams) => {
      performSearch(params);
    }, 500),
    [onSearchFiles]
  );

  // Perform search with loading state
  const performSearch = useCallback(async (params: FileUploadSearchParams) => {
    setIsLoading(true);
    try {
      const result = await onSearchFiles(params);
      setPaginatedData(result);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [onSearchFiles]);

  // Initial load and search when params change
  useEffect(() => {
    debouncedSearch(searchParams);
  }, [searchParams, debouncedSearch]);

  // Handle search form submission
  const handleSearchSubmit: SubmitHandler<SearchFormData> = (data) => {
    setSearchParams(prev => ({
      ...prev,
      searchTerm: data.searchTerm,
      organization: data.organization === 'all' ? 'all' : data.organization,
      schedule: data.schedule === 'all' ? 'all' : data.schedule,
      status: data.status as any,
      pageSize: data.pageSize,
      page: 1
    }));
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setSearchParams(prev => ({ ...prev, page }));
    setSelectedFile(null);
    setShowTransactions(null);
  };

  // Clear all filters
  const clearFilters = () => {
    searchForm.reset({
      searchTerm: '',
      organization: 'all',
      schedule: 'all',
      status: 'all',
      pageSize: searchParams.pageSize
    });
    setSearchParams({
      page: 1,
      pageSize: searchParams.pageSize,
      organization: 'all',
      schedule: 'all',
      status: 'all',
      searchTerm: ''
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileUpload = (file: File) => {
    const formData = uploadForm.getValues();
    
    if (!formData.organization || !formData.schedule) {
      alert('Please select both organization and schedule before uploading');
      return;
    }

    if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
        file.type === 'application/vnd.ms-excel') {
      onFileUpload(file, formData.source, formData.organization, formData.schedule, formData.remarks || undefined);
      
      // Reset form after successful upload
      uploadForm.reset({
        source: 'bank',
        organization: '',
        schedule: '',
        remarks: ''
      });
      
      // Refresh search results
      performSearch(searchParams);
    } else {
      alert('Please upload only Excel files (.xlsx or .xls)');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleUploadSubmit: SubmitHandler<UploadFormData> = (data) => {
    // This is handled by file input change
  };

  const handleDownloadFile = (file: FileUpload) => {
    const csvContent = generateCSVContent(file.transactions);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', file.fileName.replace('.xlsx', '.csv').replace('.xls', '.csv'));
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const generateCSVContent = (transactions: Transaction[]): string => {
    const headers = ['accountId', 'transactionDate', 'transId', 'amount', 'description', 'type', 'reference'];
    const csvRows = [headers.join(',')];
    
    transactions.forEach(transaction => {
      const row = [
        transaction.accountId || '',
        transaction.date,
        transaction.transId || '',
        transaction.amount.toString(),
        `"${transaction.description.replace(/"/g, '""')}"`,
        transaction.type,
        transaction.reference
      ];
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  };

  const handleApprovalSubmit: SubmitHandler<ApprovalFormData> = (data) => {
    if (!selectedFile) return;

    if (data.status === 'approve') {
      onApproveFile(selectedFile, data.comments || undefined);
    } else if (data.status === 'reject' && data.rejectionReason.trim()) {
      onRejectFile(selectedFile, data.rejectionReason);
    }
    
    setSelectedFile(null);
    approvalForms.reset();
    performSearch(searchParams);
  };

  const canUpload = userRole === 'maker' || userRole === 'admin';
  const canApprove = userRole === 'checker' || userRole === 'admin';

  const pendingFiles = fileUploads.filter(file => file.status === 'pending_approval');
  const watchedApprovalStatus = approvalForms.watch('status');
  const watchedRejectionReason = approvalForms.watch('rejectionReason');

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

  const TransactionTable: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => (
    <div className="mt-3">
      <Table responsive size="sm">
        <thead className="table-light">
          <tr>
            <th>Account ID</th>
            <th>Transaction ID</th>
            <th>Date</th>
            <th>Description</th>
            <th>Type</th>
            <th className="text-end">Amount</th>
            <th>Reference</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction, index) => (
            <tr key={transaction.id}>
              <td className="fw-medium">{transaction.accountId}</td>
              <td>{transaction.transId}</td>
              <td>{new Date(transaction.date).toLocaleDateString()}</td>
              <td className="text-truncate" style={{ maxWidth: '200px' }}>
                {transaction.description}
              </td>
              <td>
                <div className="d-flex align-items-center">
                  {transaction.type === 'credit' ? (
                    <ArrowUpRight className="text-success me-1" size={16} />
                  ) : (
                    <ArrowDownRight className="text-danger me-1" size={16} />
                  )}
                  <span className={`fw-medium ${
                    transaction.type === 'credit' ? 'text-success' : 'text-danger'
                  }`}>
                    {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                  </span>
                </div>
              </td>
              <td className="text-end">
                <span className={`fw-bold ${
                  transaction.type === 'credit' ? 'text-success' : 'text-danger'
                }`}>
                  {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                </span>
              </td>
              <td>{transaction.reference}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      {transactions.length === 0 && (
        <div className="text-center py-4 text-muted">
          No transactions found in this file.
        </div>
      )}
    </div>
  );

  const PaginationControls: React.FC = () => {
    if (!paginatedData || paginatedData.pagination.totalPages <= 1) return null;

    const { pagination } = paginatedData;
    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;
      
      if (pagination.totalPages <= maxVisiblePages) {
        for (let i = 1; i <= pagination.totalPages; i++) {
          pages.push(i);
        }
      } else {
        const start = Math.max(1, pagination.currentPage - 2);
        const end = Math.min(pagination.totalPages, start + maxVisiblePages - 1);
        
        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
      }
      
      return pages;
    };

    return (
      <Pagination className="justify-content-center mb-0" size="sm">
        <Pagination.Prev
          onClick={() => handlePageChange(pagination.currentPage - 1)}
          disabled={!pagination.hasPreviousPage}
        />
        
        {getPageNumbers().map(page => (
          <Pagination.Item
            key={page}
            active={pagination.currentPage === page}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </Pagination.Item>
        ))}
        
        <Pagination.Next
          onClick={() => handlePageChange(pagination.currentPage + 1)}
          disabled={!pagination.hasNextPage}
        />
      </Pagination>
    );
  };

  return (
    <div className="container-fluid">
      {/* File Upload Section */}
      {canUpload && (
        <Card className="mb-4">
          <Card.Header className="bg-white">
            <Card.Title className="mb-0">Upload Transaction File</Card.Title>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={uploadForm.handleSubmit(handleUploadSubmit)}>
              <Row className="g-3 mb-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-medium">Transaction Source *</Form.Label>
                    <Controller
                      name="source"
                      control={uploadForm.control}
                      rules={{ required: 'Transaction source is required' }}
                      render={({ field }) => (
                        <div className="d-flex gap-3">
                          <Form.Check
                            type="radio"
                            id="source-bank"
                            label="Bank Transactions"
                            value="bank"
                            checked={field.value === 'bank'}
                            onChange={() => field.onChange('bank')}
                          />
                          <Form.Check
                            type="radio"
                            id="source-system"
                            label="System Transactions"
                            value="system"
                            checked={field.value === 'system'}
                            onChange={() => field.onChange('system')}
                          />
                        </div>
                      )}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-medium">Organization *</Form.Label>
                    <Controller
                      name="organization"
                      control={uploadForm.control}
                      rules={{ required: 'Organization is required' }}
                      render={({ field }) => (
                        <Form.Select
                          isInvalid={!!uploadForm.formState.errors.organization}
                          {...field}
                        >
                          <option value="">Select Organization</option>
                          {organizationOptions.map(org => (
                            <option key={org} value={org}>{org}</option>
                          ))}
                        </Form.Select>
                      )}
                    />
                    <Form.Control.Feedback type="invalid">
                      {uploadForm.formState.errors.organization?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-medium">Schedule *</Form.Label>
                    <Controller
                      name="schedule"
                      control={uploadForm.control}
                      rules={{ required: 'Schedule is required' }}
                      render={({ field }) => (
                        <Form.Select
                          isInvalid={!!uploadForm.formState.errors.schedule}
                          {...field}
                        >
                          <option value="">Select Schedule</option>
                          {scheduleOptions.map(schedule => (
                            <option key={schedule} value={schedule}>{schedule}</option>
                          ))}
                        </Form.Select>
                      )}
                    />
                    <Form.Control.Feedback type="invalid">
                      {uploadForm.formState.errors.schedule?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-medium">Remarks (Optional)</Form.Label>
                    <Controller
                      name="remarks"
                      control={uploadForm.control}
                      render={({ field }) => (
                        <Form.Control
                          as="textarea"
                          rows={3}
                          placeholder="Add any additional notes or comments about this upload..."
                          {...field}
                        />
                      )}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div
                className={`file-upload-zone p-5 text-center ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="text-muted mb-3" size={48} />
                <h6 className="mb-2">Drop your Excel file here, or click to browse</h6>
                <p className="text-muted mb-3">
                  Supports .xlsx and .xls files with columns: accountId, transactionDate, transId, amount, description, type
                </p>
                <Form.Control
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileInputChange}
                  className="d-none"
                  id="file-upload"
                />
                <Button as="label" htmlFor="file-upload" variant="primary">
                  Choose File
                </Button>
              </div>

              <Alert variant="info" className="mt-3">
                <h6 className="alert-heading">Excel File Format Requirements:</h6>
                <ul className="mb-0 small">
                  <li><strong>accountId:</strong> Account identifier</li>
                  <li><strong>transactionDate:</strong> Date in YYYY-MM-DD format</li>
                  <li><strong>transId:</strong> Unique transaction ID</li>
                  <li><strong>amount:</strong> Transaction amount (positive number)</li>
                  <li><strong>description:</strong> Transaction description</li>
                  <li><strong>type:</strong> Either "credit" or "debit"</li>
                </ul>
              </Alert>
            </Form>
          </Card.Body>
        </Card>
      )}

      {/* File Approval Queue */}
      <Card>
        <Card.Header className="bg-white">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <Card.Title className="mb-1">File Approval Queue</Card.Title>
              <Card.Text className="small text-muted mb-0">
                {pendingFiles.length} file{pendingFiles.length !== 1 ? 's' : ''} pending approval
              </Card.Text>
            </div>
            
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="d-flex align-items-center"
            >
              <Filter className="me-1" size={16} />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>

          {/* Search and Filter Form */}
          <Form onSubmit={searchForm.handleSubmit(handleSearchSubmit)}>
            <Row className="g-3 mb-3">
              <Col md={8}>
                <InputGroup>
                  <InputGroup.Text>
                    <Search size={16} />
                  </InputGroup.Text>
                  <Controller
                    name="searchTerm"
                    control={searchForm.control}
                    render={({ field }) => (
                      <Form.Control
                        type="text"
                        placeholder="Search by filename, uploader, organization, schedule, or remarks..."
                        {...field}
                      />
                    )}
                  />
                  {searchForm.watch('searchTerm') && (
                    <Button
                      variant="outline-secondary"
                      onClick={() => {
                        searchForm.setValue('searchTerm', '');
                        searchForm.handleSubmit(handleSearchSubmit)();
                      }}
                    >
                      <X size={16} />
                    </Button>
                  )}
                </InputGroup>
              </Col>
              <Col md={4}>
                <div className="d-flex align-items-center gap-2">
                  <Form.Label className="small mb-0 text-nowrap">Show:</Form.Label>
                  <Controller
                    name="pageSize"
                    control={searchForm.control}
                    render={({ field }) => (
                      <Form.Select
                        size="sm"
                        {...field}
                        onChange={(e) => {
                          field.onChange(Number(e.target.value));
                          searchForm.handleSubmit(handleSearchSubmit)();
                        }}
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </Form.Select>
                    )}
                  />
                </div>
              </Col>
            </Row>

            {/* Advanced Filters */}
            {showFilters && (
              <Row className="g-3 mb-3 p-3 bg-light rounded">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="small mb-1">Organization:</Form.Label>
                    <Controller
                      name="organization"
                      control={searchForm.control}
                      render={({ field }) => (
                        <Form.Select size="sm" {...field}>
                          <option value="all">All Organizations</option>
                          {organizationOptions.map(org => (
                            <option key={org} value={org}>{org}</option>
                          ))}
                        </Form.Select>
                      )}
                    />
                  </Form.Group>
                </Col>
                
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="small mb-1">Schedule:</Form.Label>
                    <Controller
                      name="schedule"
                      control={searchForm.control}
                      render={({ field }) => (
                        <Form.Select size="sm" {...field}>
                          <option value="all">All Schedules</option>
                          {scheduleOptions.map(schedule => (
                            <option key={schedule} value={schedule}>{schedule}</option>
                          ))}
                        </Form.Select>
                      )}
                    />
                  </Form.Group>
                </Col>
                
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="small mb-1">Status:</Form.Label>
                    <Controller
                      name="status"
                      control={searchForm.control}
                      render={({ field }) => (
                        <Form.Select size="sm" {...field}>
                          <option value="all">All Statuses</option>
                          <option value="pending_approval">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </Form.Select>
                      )}
                    />
                  </Form.Group>
                </Col>
                
                <Col md={3} className="d-flex align-items-end">
                  <div className="d-flex gap-2 w-100">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      type="button"
                      onClick={clearFilters}
                      className="flex-grow-1"
                    >
                      Clear Filters
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      type="submit"
                    >
                      Search
                    </Button>
                  </div>
                </Col>
              </Row>
            )}
          </Form>
        </Card.Header>

        <Card.Body className="p-0">
          {isLoading ? (
            <div className="text-center py-5">
              <Loader className="text-primary mb-3 spinner-border" size={48} />
              <h5 className="mb-2">Loading Files...</h5>
              <p className="text-muted">Please wait while we fetch the results.</p>
            </div>
          ) : !paginatedData || paginatedData.data.length === 0 ? (
            <div className="text-center py-5">
              <FileText className="text-muted mb-3" size={48} />
              <h5 className="mb-2">No Files Found</h5>
              <p className="text-muted">
                {searchParams.searchTerm || searchParams.organization !== 'all' || searchParams.schedule !== 'all' || searchParams.status !== 'all'
                  ? 'No files match your search criteria. Try adjusting your filters.'
                  : 'Upload Excel files to begin the reconciliation process.'}
              </p>
              {(searchParams.searchTerm || searchParams.organization !== 'all' || searchParams.schedule !== 'all' || searchParams.status !== 'all') && (
                <Button variant="outline-primary" size="sm" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="list-group list-group-flush">
                {paginatedData.data.map((file) => {
                  const isSelected = selectedFile === file.id;
                  const showingTransactions = showTransactions === file.id;
                  
                  return (
                    <div key={file.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex align-items-center">
                          <div className={`p-2 rounded-circle me-3 ${
                            file.source === 'bank' ? 'bg-primary bg-opacity-10' : 'bg-success bg-opacity-10'
                          }`}>
                            <FileText className={`${
                              file.source === 'bank' ? 'text-primary' : 'text-success'
                            }`} size={20} />
                          </div>
                          <div>
                            <h6 className="mb-1 fw-medium">{file.fileName}</h6>
                            <p className="mb-0 small text-muted">
                              {file.transactionCount} transactions • {file.organization} • {file.schedule} • Uploaded by {file.uploadedBy} • {new Date(file.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <StatusBadge status={file.status} />
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => handleDownloadFile(file)}
                            className="d-flex align-items-center"
                            title="Download file"
                          >
                            <Download className="me-1" size={14} />
                            Download
                          </Button>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => setShowTransactions(showingTransactions ? null : file.id)}
                            className="d-flex align-items-center"
                          >
                            {showingTransactions ? (
                              <>
                                <EyeOff className="me-1" size={14} />
                                Hide
                              </>
                            ) : (
                              <>
                                <Eye className="me-1" size={14} />
                                View
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => setSelectedFile(isSelected ? null : file.id)}
                          >
                            {isSelected ? 'Hide Details' : 'Details'}
                          </Button>
                        </div>
                      </div>

                      {/* Approval/Rejection Remarks Display */}
                      {(file.status === 'approved' || file.status === 'rejected') && (
                        <Alert variant={file.status === 'approved' ? 'success' : 'danger'} className="mb-3">
                          <div className="d-flex align-items-start">
                            {file.status === 'approved' ? (
                              <CheckCircle className="me-2 mt-1" size={20} />
                            ) : (
                              <XCircle className="me-2 mt-1" size={20} />
                            )}
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <h6 className="mb-0">
                                  {file.status === 'approved' ? 'File Approved' : 'File Rejected'}
                                </h6>
                                <small className="text-muted">
                                  {file.approvedBy} • {file.approvedAt && new Date(file.approvedAt).toLocaleString()}
                                </small>
                              </div>
                              {file.rejectionReason && (
                                <Alert variant="light" className="border mb-0">
                                  <strong>Reason:</strong> {file.rejectionReason}
                                </Alert>
                              )}
                            </div>
                          </div>
                        </Alert>
                      )}

                      {showingTransactions && (
                        <div className="mb-3">
                          <h6 className="fw-medium mb-2">
                            Transaction Details ({file.transactionCount} transactions)
                          </h6>
                          <TransactionTable transactions={file.transactions} />
                        </div>
                      )}

                      {isSelected && (
                        <div className="mt-3">
                          <Row className="g-3 mb-4">
                            <Col md={4}>
                              <div className="p-3 bg-light rounded">
                                <h6 className="fw-medium mb-2">File Details</h6>
                                <div className="small">
                                  <p className="mb-1"><span className="fw-medium">Source:</span> {file.source === 'bank' ? 'Bank' : 'System'}</p>
                                  <p className="mb-1"><span className="fw-medium">Organization:</span> {file.organization}</p>
                                  <p className="mb-1"><span className="fw-medium">Schedule:</span> {file.schedule}</p>
                                  <p className="mb-1"><span className="fw-medium">Transactions:</span> {file.transactionCount}</p>
                                  <p className="mb-0"><span className="fw-medium">Uploaded:</span> {new Date(file.uploadedAt).toLocaleString()}</p>
                                </div>
                              </div>
                            </Col>

                            {file.remarks && (
                              <Col md={8}>
                                <div className="p-3 bg-light rounded">
                                  <h6 className="fw-medium mb-2">Upload Remarks</h6>
                                  <p className="mb-0 small">{file.remarks}</p>
                                </div>
                              </Col>
                            )}
                          </Row>

                          {/* Approval Form */}
                          {file.status === 'pending_approval' && canApprove && (
                            <Card className="border-top pt-4">
                              <Card.Body className="bg-light">
                                <h6 className="mb-3">File Approval</h6>
                                
                                <Form onSubmit={approvalForms.handleSubmit(handleApprovalSubmit)}>
                                  <Row className="g-3">
                                    <Col md={6}>
                                      <Form.Group className="mb-3">
                                        <Form.Label className="fw-medium">
                                          Action *
                                        </Form.Label>
                                        <Controller
                                          name="status"
                                          control={approvalForms.control}
                                          rules={{ required: 'Please select an action' }}
                                          render={({ field }) => (
                                            <Form.Select
                                              isInvalid={!!approvalForms.formState.errors.status}
                                              {...field}
                                            >
                                              <option value="">Select Action</option>
                                              <option value="approve">Approve</option>
                                              <option value="reject">Reject</option>
                                            </Form.Select>
                                          )}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                          {approvalForms.formState.errors.status?.message}
                                        </Form.Control.Feedback>
                                      </Form.Group>
                                    </Col>

                                    <Col md={6}>
                                      <Form.Group className="mb-3">
                                        <Form.Label className="fw-medium">
                                          Comments {watchedApprovalStatus === 'approve' ? '(Optional)' : ''}
                                        </Form.Label>
                                        <Controller
                                          name="comments"
                                          control={approvalForms.control}
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

                                    {watchedApprovalStatus === 'reject' && (
                                      <Col md={12}>
                                        <Form.Group className="mb-3">
                                          <Form.Label className="fw-medium">
                                            Rejection Reason *
                                          </Form.Label>
                                          <Controller
                                            name="rejectionReason"
                                            control={approvalForms.control}
                                            rules={{
                                              required: watchedApprovalStatus === 'reject' ? 'Rejection reason is required' : false
                                            }}
                                            render={({ field }) => (
                                              <Form.Control
                                                as="textarea"
                                                rows={3}
                                                placeholder="Provide detailed reason for rejection..."
                                                isInvalid={!!approvalForms.formState.errors.rejectionReason}
                                                {...field}
                                              />
                                            )}
                                          />
                                          <Form.Control.Feedback type="invalid">
                                            {approvalForms.formState.errors.rejectionReason?.message}
                                          </Form.Control.Feedback>
                                        </Form.Group>
                                      </Col>
                                    )}

                                    <Col md={12}>
                                      <div className="d-flex justify-content-end gap-2">
                                        <Button
                                          variant="outline-secondary"
                                          onClick={() => {
                                            setSelectedFile(null);
                                            approvalForms.reset();
                                          }}
                                        >
                                          Cancel
                                        </Button>
                                        <Button
                                          variant={watchedApprovalStatus === 'reject' ? 'danger' : 'success'}
                                          type="submit"
                                          disabled={
                                            !watchedApprovalStatus || 
                                            (watchedApprovalStatus === 'reject' && !watchedRejectionReason?.trim())
                                          }
                                        >
                                          {watchedApprovalStatus === 'reject' ? (
                                            <>
                                              <X className="me-1" size={16} />
                                              Reject File
                                            </>
                                          ) : (
                                            <>
                                              <Check className="me-1" size={16} />
                                              Approve File
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

                          {file.status === 'pending_approval' && !canApprove && (
                            <Alert variant="warning">
                              <div className="d-flex align-items-center">
                                <AlertCircle className="me-2" size={20} />
                                <p className="mb-0">
                                  You need checker or admin role to approve file uploads.
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
              
              {/* Pagination Footer */}
              {paginatedData && paginatedData.pagination.totalPages > 1 && (
                <Card.Footer className="bg-white border-top">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="text-muted small">
                      Showing {((paginatedData.pagination.currentPage - 1) * paginatedData.pagination.pageSize) + 1} to {Math.min(paginatedData.pagination.currentPage * paginatedData.pagination.pageSize, paginatedData.pagination.totalItems)} of {paginatedData.pagination.totalItems} files
                    </div>
                    <PaginationControls />
                  </div>
                </Card.Footer>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default FileUploadManager;