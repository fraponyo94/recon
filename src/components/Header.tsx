import React from 'react';
import { Button, Form } from 'react-bootstrap';
import { User, Settings, LogOut } from 'lucide-react';
import { User as UserType, UserRole } from '../types';

interface HeaderProps {
  currentUser: UserType;
  onRoleChange: (role: UserRole) => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onRoleChange, onLogout }) => {
  return (
    <header className="bg-white shadow-sm border-bottom">
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center py-3">
          <div className="d-flex align-items-center">
            <div className="me-4">
              <h1 className="h3 mb-0 fw-bold text-dark">ReconFlow</h1>
            </div>
            <nav className="d-none d-md-flex">
              <a href="#" className="nav-link text-dark fw-medium me-3">
                Dashboard
              </a>
              <a href="#" className="nav-link text-muted me-3">
                Transactions
              </a>
              <a href="#" className="nav-link text-muted">
                Reports
              </a>
            </nav>
          </div>
          
          <div className="d-flex align-items-center">
            <div className="d-flex align-items-center me-3">
              <span className="small text-muted me-2">Role:</span>
              <Form.Select
                value={currentUser.role}
                onChange={(e) => onRoleChange(e.target.value as UserRole)}
                size="sm"
                style={{ width: 'auto' }}
              >
                <option value="maker">Maker</option>
                <option value="checker">Checker</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </div>
            
            <div className="d-flex align-items-center me-3">
              <User className="me-2" size={20} />
              <span className="small fw-medium">{currentUser.name}</span>
            </div>
            
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={onLogout}
              title="Logout"
            >
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};