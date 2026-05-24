'use client';

import { useState } from 'react';
import { Search, UserCheck, Shield, Building2, MapPin, Phone, MoreVertical } from 'lucide-react';
import Link from 'next/link';

// Mock Data to prevent crashes
const MOCK_CLIENTS = [
  {
    id: 'cli_1',
    name: 'Acme Corporation',
    email: 'contact@acmecorp.com',
    status: 'active',
    location: 'New York, USA',
    phone: '+1 (555) 123-4567',
    tier: 'Enterprise',
  },
  {
    id: 'cli_2',
    name: 'Globex Inc',
    email: 'admin@globex.io',
    status: 'active',
    location: 'London, UK',
    phone: '+44 20 7123 4567',
    tier: 'Pro',
  },
  {
    id: 'cli_3',
    name: 'Initech Solutions',
    email: 'billing@initech.net',
    status: 'suspended',
    location: 'Austin, USA',
    phone: '+1 (555) 987-6543',
    tier: 'Basic',
  },
];

export default function AdminClientsDashboard() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredClients = MOCK_CLIENTS.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(search.toLowerCase()) || 
                          client.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? client.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 pb-32 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Client Management</h1>
        <p className="text-gray-400 mt-2">Oversee client accounts, business details, and subscription tiers.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search clients by name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl py-2 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-vault-green/50 transition-colors"
          />
        </div>
        
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-2 text-white focus:outline-none appearance-none cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.02] border-b border-white/[0.05]">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-400">Client</th>
                <th className="px-6 py-4 font-semibold text-gray-400">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-400">Location / Contact</th>
                <th className="px-6 py-4 font-semibold text-gray-400">Tier</th>
                <th className="px-6 py-4 font-semibold text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <Building2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-lg font-medium text-gray-400">No clients found</p>
                    <p className="text-sm">Try adjusting your search or filter parameters.</p>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-300 font-bold border border-white/10">
                          {client.name[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-white group-hover:text-vault-green transition-colors flex items-center gap-2">
                            {client.name}
                            {client.status === 'active' && <UserCheck size={14} className="text-blue-400" />}
                          </div>
                          <div className="text-gray-400 text-xs">{client.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        client.status === 'active' ? 'bg-vault-green/10 text-vault-green' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-gray-300 text-xs">
                          <MapPin size={12} className="text-gray-500" /> {client.location}
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                          <Phone size={12} className="text-gray-500" /> {client.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-purple-400 font-medium">
                        {client.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
