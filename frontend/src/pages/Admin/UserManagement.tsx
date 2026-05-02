import React, { useEffect, useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import api from '../../api/axios';
import { useSort } from '../../hooks/useSort';

const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { sortedData, requestSort, getSortIcon } = useSort(users);
  
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: 0,
    full_name: '',
    email: '',
    password: '',
    role: 'Pencari'
  });

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openAddModal = () => {
    setIsEditMode(false);
    setFormData({ id: 0, full_name: '', email: '', password: '', role: 'Pencari' });
    setShowModal(true);
  };

  const openEditModal = (user: any) => {
    setIsEditMode(true);
    setFormData({ id: user.id, full_name: user.full_name, email: user.email, password: '', role: user.role });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await api.put(`/admin/users/${formData.id}`, {
          full_name: formData.full_name,
          email: formData.email,
          role: formData.role
        });
        alert('Berhasil memperbarui pengguna');
      } else {
        await api.post('/admin/users', {
          full_name: formData.full_name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        });
        alert('Berhasil menambahkan pengguna');
      }
      setShowModal(false);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Gagal menyimpan pengguna');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
      try {
        await api.delete(`/admin/users/${id}`);
        alert('Berhasil menghapus pengguna');
        fetchUsers();
      } catch (err: any) {
        alert(err.response?.data?.detail || 'Gagal menghapus pengguna');
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="Admin" />
      <main className="flex-1 p-8 relative">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Pengguna</h1>
          <Button onClick={openAddModal}>+ Tambah Pengguna</Button>
        </div>
        
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 cursor-pointer select-none hover:text-primary" onClick={() => requestSort('id')}>ID{getSortIcon('id')}</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 cursor-pointer select-none hover:text-primary" onClick={() => requestSort('full_name')}>Nama Lengkap{getSortIcon('full_name')}</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 cursor-pointer select-none hover:text-primary" onClick={() => requestSort('email')}>Email{getSortIcon('email')}</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 cursor-pointer select-none hover:text-primary" onClick={() => requestSort('role')}>Role{getSortIcon('role')}</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-4">Memuat...</td></tr>
                ) : sortedData.map((user: any) => (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">USR-{user.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{user.full_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 
                        user.role === 'Petugas' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <Button variant="outline" className="py-1 px-3 text-sm" onClick={() => openEditModal(user)}>Edit</Button>
                      <button className="text-red-600 hover:text-red-800 text-sm font-semibold px-2" onClick={() => handleDelete(user.id)}>Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
              <h2 className="text-2xl font-bold mb-4">{isEditMode ? 'Edit Pengguna' : 'Tambah Pengguna'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input 
                  label="Nama Lengkap" 
                  value={formData.full_name}
                  onChange={e => setFormData({...formData, full_name: e.target.value})}
                  required 
                />
                <Input 
                  label="Email" 
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  required 
                />
                {!isEditMode && (
                  <Input 
                    label="Password" 
                    type="password" 
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    required 
                  />
                )}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
                  <select 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="Pencari">Pencari</option>
                    <option value="Petugas">Petugas</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div className="flex gap-2 mt-6">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Batal</Button>
                  <Button type="submit" className="flex-1">Simpan</Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserManagement;
