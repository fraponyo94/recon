import React, { useState } from 'react';
import { Container, Nav, Tab } from 'react-bootstrap';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { TransactionList } from './components/TransactionList';
import { ReconciliationForm } from './components/ReconciliationForm';
import { ApprovalQueue } from './components/ApprovalQueue';
import FileUploadManager from './components/FileUploadManager';
import { IndividualTransactionForm } from './components/IndividualTransactionForm';
import { useReconciliation } from './hooks/useReconciliation';
import { Transaction } from './types';

function App() {
  const {
    bankTransactions,
    systemTransactions,
    reconciliationEntries,
    fileUploads,
    currentUser,
    createReconciliation,
    approveReconciliation,
    rejectReconciliation,
    handleFileUpload,
    approveFile,
    rejectFile,
    addIndividualTransaction,
    changeUserRole,
    searchFileUploads,
  } = useReconciliation();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'upload' | 'individual' | 'reconcile' | 'approve'>('dashboard');
  const [selectedBankTransaction, setSelectedBankTransaction] = useState<Transaction | null>(null);
  const [selectedSystemTransaction, setSelectedSystemTransaction] = useState<Transaction | null>(null);

  const handleCreateReconciliation = (entry: any) => {
    createReconciliation(entry);
    setSelectedBankTransaction(null);
    setSelectedSystemTransaction(null);
  };

  const handleCancelReconciliation = () => {
    setSelectedBankTransaction(null);
    setSelectedSystemTransaction(null);
  };

  const handleLogout = () => {
    // In a real app, this would handle logout logic
    console.log('Logout clicked');
  };

  // Filter unreconciled transactions
  const unreconciled = (transactions: Transaction[]) => 
    transactions.filter(t => t.status === 'unreconciled');

  return (
    <div className="min-vh-100 bg-light">
      <Header 
        currentUser={currentUser}
        onRoleChange={changeUserRole}
        onLogout={handleLogout}
      />
      
      <Container fluid className="py-4">
        <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k as any)}>
          <Nav variant="tabs" className="mb-4">
            <Nav.Item>
              <Nav.Link eventKey="dashboard">Dashboard</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="upload">File Upload</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="individual">Individual Entry</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="reconcile">Reconcile</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="approve">Approve</Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content>
            <Tab.Pane eventKey="dashboard">
              <Dashboard 
                reconciliationEntries={reconciliationEntries}
                bankTransactions={bankTransactions}
                systemTransactions={systemTransactions}
                fileUploads={fileUploads}
              />
            </Tab.Pane>

            <Tab.Pane eventKey="upload">
              <FileUploadManager
                fileUploads={fileUploads}
                onFileUpload={handleFileUpload}
                onApproveFile={approveFile}
                onRejectFile={rejectFile}
                onSearchFiles={searchFileUploads}
                userRole={currentUser.role}
              />
            </Tab.Pane>

            <Tab.Pane eventKey="individual">
              <IndividualTransactionForm
                onAddTransaction={addIndividualTransaction}
                userRole={currentUser.role}
              />
            </Tab.Pane>

            <Tab.Pane eventKey="reconcile">
              <div className="row g-4">
                <div className="col-lg-4">
                  <TransactionList
                    title="Bank Transactions"
                    transactions={unreconciled(bankTransactions)}
                    selectedTransaction={selectedBankTransaction}
                    onTransactionSelect={setSelectedBankTransaction}
                  />
                </div>
                <div className="col-lg-4">
                  <TransactionList
                    title="System Transactions"
                    transactions={unreconciled(systemTransactions)}
                    selectedTransaction={selectedSystemTransaction}
                    onTransactionSelect={setSelectedSystemTransaction}
                  />
                </div>
                <div className="col-lg-4">
                  <ReconciliationForm
                    bankTransaction={selectedBankTransaction}
                    systemTransaction={selectedSystemTransaction}
                    onSubmit={handleCreateReconciliation}
                    onCancel={handleCancelReconciliation}
                    userRole={currentUser.role}
                  />
                </div>
              </div>
            </Tab.Pane>

            <Tab.Pane eventKey="approve">
              <ApprovalQueue
                entries={reconciliationEntries}
                bankTransactions={bankTransactions}
                systemTransactions={systemTransactions}
                onApprove={approveReconciliation}
                onReject={rejectReconciliation}
                userRole={currentUser.role}
              />
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Container>
    </div>
  );
}

export default App;