import React, { Component } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import api from '../../api/axios';
import { withRouter } from '../../utils/withRouter';
import type { WithRouterProps } from '../../utils/withRouter';
import { FiArrowLeft, FiUserPlus } from 'react-icons/fi';

import { toast } from 'react-hot-toast';

interface CreateUserState {
  formData: {
    full_name: string;
    email: string;
    password: string;
    role: string;
  };
  loading: boolean;
  formErrors: Record<string, string>;
}

class CreateUserComponent extends Component<WithRouterProps, CreateUserState> {
  constructor(props: WithRouterProps) {
    super(props);
    this.state = {
      formData: {
        full_name: '',
        email: '',
        password: '',
        role: 'Pencari'
      },
      loading: false,
      formErrors: {}
    };
  }

  handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { formData, formErrors } = this.state;
    this.setState({
      formData: { ...formData, [e.target.name]: e.target.value }
    });
    
    if (formErrors[e.target.name]) {
      this.setState({
        formErrors: { ...formErrors, [e.target.name]: '' }
      });
    }
  };

  validateForm = () => {
    const { formData } = this.state;
    const errors: Record<string, string> = {};
    
    if (!formData.full_name.trim()) errors.full_name = "Nama lengkap wajib diisi";
    if (!formData.email.trim()) errors.email = "Email wajib diisi";
    if (!formData.password.trim()) errors.password = "Password wajib diisi";
    if (!formData.role) errors.role = "Role wajib dipilih";
    
    this.setState({ formErrors: errors });
    return Object.keys(errors).length === 0;
  };

  handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!this.validateForm()) return;
    this.setState({ loading: true });
    
    try {
      await api.post('/admin/users', this.state.formData);
      this.props.navigate('/admin/users');
    } catch (err: unknown) {
      console.error(err);
      toast.error('Gagal membuat user. Pastikan email belum terdaftar.');
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { formData, loading } = this.state;

    return (
      <div className="flex min-h-screen bg-[#F8FAFC]">
        <Sidebar role="Admin" />
        <main className="flex-1 p-10">
          <header className="mb-10">
            <div className="flex items-center gap-2 text-xs font-black text-gray-400 tracking-wide mb-4">
              <span>Manajemen Pengguna</span>
              <span className="text-gray-300">/</span>
              <span className="text-gray-900 font-black">Membuat Akun</span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => this.props.navigate('/admin/users')} 
                className="w-12 h-12 bg-white ring-1 ring-gray-100 rounded-xl flex items-center justify-center text-gray-900 hover:bg-gray-50 transition-all shadow-sm"
              >
                <FiArrowLeft size={24} />
              </button>
              <h1 className="text-5xl font-bold text-gray-900 tracking-tighter">Membuat Akun</h1>
            </div>
          </header>
          
          <Card className="max-w-4xl border-none ring-1 ring-gray-100 p-12 shadow-sm bg-white rounded-3xl">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                <FiUserPlus size={20} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Personal Information</h2>
            </div>

            <form onSubmit={this.handleSubmit} noValidate>
              <div className="relative group">
                <Input 
                  label="Full Name" 
                  name="full_name"
                  value={formData.full_name}
                  onChange={this.handleChange}
                  required 
                  placeholder="e.g. Jonathan Doe"
                  className="w-full"
                  error={this.state.formErrors.full_name}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input 
                  label="Email Address" 
                  name="email"
                  type="email" 
                  value={formData.email}
                  onChange={this.handleChange}
                  required 
                  placeholder="jonathan@university.edu"
                  error={this.state.formErrors.email}
                />
                  <Select 
                    label="Role"
                    name="role"
                    className="w-full"
                    value={formData.role}
                    onChange={this.handleChange as any}
                    required
                    error={this.state.formErrors.role}
                    options={[
                      { label: "Pencari", value: "Pencari" },
                      { label: "Petugas", value: "Petugas" },
                      { label: "Admin", value: "Admin" }
                    ]}
                  />
              </div>

              <div className="max-w-md">
                <Input 
                  label="Password" 
                  name="password"
                  type="password" 
                  value={formData.password}
                  onChange={this.handleChange}
                  required 
                  placeholder="••••••••"
                  error={this.state.formErrors.password}
                />
              </div>

              <div className="flex justify-end pt-6">
                <Button 
                  type="submit" 
                  className="px-8"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Simpan Akun'}
                </Button>
              </div>
            </form>
          </Card>
        </main>
      </div>
    );
  }
}

export default withRouter(CreateUserComponent);
