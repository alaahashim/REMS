import React, { useEffect, useState } from 'react';
import { Badge, Button, Card, Form, Modal, Table } from 'react-bootstrap';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ username: '', password: '', name: '', role: 'Finance' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem('tax_users')) || [];
    setUsers(storedUsers);
  }, []);

  const saveUsers = (updatedUsers) => {
    localStorage.setItem('tax_users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newUser = { id: Date.now(), ...formData, status: 'Active' };
    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);
    setFormData({ username: '', password: '', name: '', role: 'Finance' });
  };

  const handleToggleStatus = (user) => {
    const updatedUsers = users.map((u) =>
      u.id === user.id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u
    );
    saveUsers(updatedUsers);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleModalSave = () => {
    const updatedUsers = users.map((u) =>
      u.id === selectedUser.id ? selectedUser : u
    );
    saveUsers(updatedUsers);
    setShowModal(false);
  };

  const handleModalChange = (field, value) => {
    setSelectedUser({ ...selectedUser, [field]: value });
  };

  return (
    <div>
      <h1 className="mb-4">إدارة الموظفين</h1>

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="username">
              <Form.Label>اسم المستخدم</Form.Label>
              <Form.Control
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>كلمة المرور</Form.Label>
              <Form.Control
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>الاسم</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="role">
              <Form.Label>الدور</Form.Label>
              <Form.Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="Finance">Finance</option>
                <option value="Reviewer">Reviewer</option>
                <option value="DataEntry">DataEntry</option>
                <option value="Committee">Committee</option>
                <option value="Manager">Manager</option>
              </Form.Select>
            </Form.Group>
            <Button type="submit">إضافة موظف</Button>
          </Form>
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Header>قائمة الموظفين</Card.Header>
        <Card.Body>
          <Table responsive striped bordered hover>
            <thead>
              <tr>
                <th>الاسم</th>
                <th>اسم المستخدم</th>
                <th>الدور</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.username}</td>
                  <td>{user.role}</td>
                  <td>
                    <Badge bg={user.status === 'Active' ? 'success' : 'secondary'}>
                      {user.status || 'Active'}
                    </Badge>
                  </td>
                  <td>
                    <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEdit(user)}>
                      تعديل
                    </Button>
                    <Button variant={user.status === 'Active' ? 'outline-danger' : 'outline-success'} size="sm" onClick={() => handleToggleStatus(user)}>
                      {user.status === 'Active' ? 'إلغاء التفعيل' : 'تفعيل'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>تعديل موظف</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <Form>
              <Form.Group className="mb-3" controlId="editName">
                <Form.Label>الاسم</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedUser.name}
                  onChange={(e) => handleModalChange('name', e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="editUsername">
                <Form.Label>اسم المستخدم</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedUser.username}
                  onChange={(e) => handleModalChange('username', e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="editRole">
                <Form.Label>الدور</Form.Label>
                <Form.Select
                  value={selectedUser.role}
                  onChange={(e) => handleModalChange('role', e.target.value)}
                >
                  <option value="Finance">Finance</option>
                  <option value="Reviewer">Reviewer</option>
                  <option value="DataEntry">DataEntry</option>
                  <option value="Committee">Committee</option>
                  <option value="Manager">Manager</option>
                </Form.Select>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            إلغاء
          </Button>
          <Button variant="primary" onClick={handleModalSave}>
            حفظ التغييرات
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserManagement;
