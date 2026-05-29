'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Trash2,
  ChevronDown,
  Check,
  X,
  AlertTriangle,
  Search,
  Filter,
  Building2,
  Trash,
  CheckSquare,
  Eye,
} from 'lucide-react';
import AddDomesticBuyerModal from './AddDomesticBuyerModal';
import DomesticBuyerCard from './DomesticBuyerCard';
import DomesticBuyersEmptyState from './DomesticBuyersEmptyState';
import { useDomesticBuyersStore, type Buyer, type BuyerPayload } from '@/store/domesticBuyers';

export default function DomesticBuyersList() {
  const router = useRouter();
  const buyers = useDomesticBuyersStore((state) => state.buyers);
  const isLoading = useDomesticBuyersStore((state) => state.isLoading);
  const error = useDomesticBuyersStore((state) => state.error);
  const fetchBuyers = useDomesticBuyersStore((state) => state.fetchBuyers);
  const addBuyer = useDomesticBuyersStore((state) => state.addBuyer);
  const updateBuyer = useDomesticBuyersStore((state) => state.updateBuyer);
  const removeBuyer = useDomesticBuyersStore((state) => state.removeBuyer);

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'trash'>('active');
  const [showModal, setShowModal] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState<Buyer | null>(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [viewingBuyer, setViewingBuyer] = useState<Buyer | null>(null);
  const [deleteConfirmBuyer, setDeleteConfirmBuyer] = useState<Buyer | null>(null);
  const [selectedBuyers, setSelectedBuyers] = useState<string[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    fetchBuyers();
  }, [fetchBuyers]);

  const activeCount = useMemo(() => buyers.filter((b) => b.status !== 'trash').length, [buyers]);
  const trashCount = useMemo(() => buyers.filter((b) => b.status === 'trash').length, [buyers]);

  const filtered = useMemo(() => {
    return buyers.filter((b) => {
      const matchesStatus = activeTab === 'active' ? b.status !== 'trash' : b.status === 'trash';
      const matchesSearch =
        search === '' ||
        b.companyName.toLowerCase().includes(search.toLowerCase()) ||
        b.gstin.toLowerCase().includes(search.toLowerCase()) ||
        (b.city && b.city.toLowerCase().includes(search.toLowerCase())) ||
        b.state.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [buyers, search, activeTab]);
  const isPermanentDelete = deleteConfirmBuyer?.status === 'trash';

  const handleAdd = () => {
    router.push('/domestic/buyers/new');
  };

  const handleEdit = (buyer: Buyer) => {
    setEditingBuyer(buyer);
    setShowModal(true);
  };

  const handleDeleteClick = (buyer: Buyer) => {
    setDeleteConfirmBuyer(buyer);
  };

  const confirmDelete = async () => {
    if (deleteConfirmBuyer) {
      try {
        setActionError(null);
        await removeBuyer(deleteConfirmBuyer.id);
        setSelectedBuyers((prev) => prev.filter((id) => id !== deleteConfirmBuyer.id));
        setDeleteConfirmBuyer(null);
      } catch (error) {
        setActionError(error instanceof Error ? error.message : 'Failed to delete buyer');
      }
    }
  };

  const handleView = (buyer: Buyer) => {
    setViewingBuyer(buyer);
  };

  const handleSubmit = async (formData: Record<string, string>) => {
    setActionError(null);
    const payload = { ...formData, status: 'active' } as BuyerPayload;

    try {
      if (editingBuyer) {
        await updateBuyer(editingBuyer.id, payload);
        setEditingBuyer(null);
      } else {
        await addBuyer(payload);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save buyer';
      setActionError(message);
      throw error;
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedBuyers((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSetActive = async () => {
    setActionError(null);
    try {
      await Promise.all(selectedBuyers.map((id) => updateBuyer(id, { status: 'active' })));
      setSelectedBuyers([]);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to update buyers');
    }
  };

  const handleSetInactive = async () => {
    setActionError(null);
    try {
      await Promise.all(selectedBuyers.map((id) => updateBuyer(id, { status: 'inactive' })));
      setSelectedBuyers([]);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to update buyers');
    }
  };

  const handleBulkDelete = async () => {
    setActionError(null);
    try {
      await Promise.all(selectedBuyers.map((id) => removeBuyer(id)));
      setSelectedBuyers([]);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to delete buyers');
    }
  };

  return (
    <div className="w-full min-h-full overflow-y-auto px-6 pt-6 pb-16">
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Domestic Buyers</h1>
          <p className="text-sm text-gray-500">Manage Indian buyers with GST details</p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded flex gap-2 items-center hover:bg-blue-700 transition-colors cursor-pointer"
        >
          <Plus size={16} />
          Add Domestic Buyer
        </button>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-[500px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search by company, GSTIN, city, state..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* STATUS FILTER */}
        <div className="relative">
          <button
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white hover:bg-gray-50 min-w-[130px]"
          >
            <Filter size={16} className="text-gray-500" />
            <span>All Status</span>
            <ChevronDown size={14} className="ml-auto text-gray-500" />
          </button>

          {showStatusDropdown && (
            <div className="absolute top-full mt-1 bg-white border rounded-lg shadow-lg z-10 min-w-[140px]">
              <button
                onClick={() => {
                  setShowStatusDropdown(false);
                }}
                className="flex items-center justify-between w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg"
              >
                <span>All Status</span>
                <Check size={14} className="text-blue-600" />
              </button>
              <button
                onClick={() => {
                  setActiveTab('active');
                  setShowStatusDropdown(false);
                }}
                className="flex items-center justify-between w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg"
              >
                <span>Active</span>
                {activeTab === 'active' && <Check size={14} className="text-blue-600" />}
              </button>
              <button
                onClick={() => {
                  setActiveTab('trash');
                  setShowStatusDropdown(false);
                }}
                className="flex items-center justify-between w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg"
              >
                <span>Trash</span>
                {activeTab === 'trash' && <Check size={14} className="text-blue-600" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-4 items-center">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border ${
            activeTab === 'active'
              ? 'border-blue-200 bg-blue-50 text-blue-700'
              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Building2 size={14} />
          <span>Active ({activeCount})</span>
        </button>
        <button
          onClick={() => setActiveTab('trash')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border ${
            activeTab === 'trash'
              ? 'border-blue-200 bg-blue-50 text-blue-700'
              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Trash size={14} />
          <span>Trash ({trashCount})</span>
        </button>

        {selectedBuyers.length > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="flex items-center gap-1.5 text-sm text-blue-600 font-medium border border-blue-200 bg-blue-50 px-3 py-1.5 rounded-md">
              <CheckSquare size={14} />
              {selectedBuyers.length} selected
            </span>
            <button
              onClick={handleSetActive}
              className="px-3 py-1.5 text-sm font-medium border border-gray-200 bg-white text-gray-700 rounded-md hover:bg-gray-50"
            >
              Set Active
            </button>
            <button
              onClick={handleSetInactive}
              className="px-3 py-1.5 text-sm font-medium border border-gray-200 bg-white text-gray-700 rounded-md hover:bg-gray-50"
            >
              Set Inactive
            </button>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              <Trash2 size={14} />
              Delete
            </button>
            <button
              onClick={() => setSelectedBuyers([])}
              className="px-3 py-1.5 text-sm font-medium border border-gray-200 bg-white text-gray-700 rounded-md hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {(error || actionError) && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {actionError || error}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
          Loading domestic buyers...
        </div>
      ) : filtered.length === 0 ? (
        <DomesticBuyersEmptyState
          onAddBuyer={handleAdd}
          message={
            buyers.length === 0
              ? 'Add your first domestic buyer with GST details'
              : 'No buyers match the current filters'
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((buyer) => (
            <DomesticBuyerCard
              key={buyer.id}
              buyer={buyer}
              isSelected={selectedBuyers.includes(buyer.id)}
              onSelect={toggleSelect}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      <AddDomesticBuyerModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingBuyer(null);
        }}
        onSubmit={handleSubmit}
        editingBuyer={editingBuyer}
      />

      {/* VIEW MODAL */}
      {viewingBuyer && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-[600px] max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Eye size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">Buyer Details</h2>
                    <p className="text-sm text-gray-500">{viewingBuyer.companyName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingBuyer(null)}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <X size={16} className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    viewingBuyer.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {viewingBuyer.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Company Info */}
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Company Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Company Name</p>
                    <p className="text-sm font-medium">{viewingBuyer.companyName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Trade Name</p>
                    <p className="text-sm font-medium">{viewingBuyer.tradeName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">GSTIN</p>
                    <p className="text-sm font-medium">{viewingBuyer.gstin}</p>
                  </div>
                  {viewingBuyer.panNumber && (
                    <div>
                      <p className="text-xs text-gray-500">PAN Number</p>
                      <p className="text-sm font-medium">{viewingBuyer.panNumber}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Address */}
              {(viewingBuyer.address || viewingBuyer.city || viewingBuyer.state) && (
                <div className="border rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Address</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {viewingBuyer.address && (
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500">Address</p>
                        <p className="text-sm font-medium">{viewingBuyer.address}</p>
                      </div>
                    )}
                    {viewingBuyer.city && (
                      <div>
                        <p className="text-xs text-gray-500">City</p>
                        <p className="text-sm font-medium">{viewingBuyer.city}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-500">State</p>
                      <p className="text-sm font-medium">{viewingBuyer.state}</p>
                    </div>
                    {viewingBuyer.pincode && (
                      <div>
                        <p className="text-xs text-gray-500">Pincode</p>
                        <p className="text-sm font-medium">{viewingBuyer.pincode}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Contact */}
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium">{viewingBuyer.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium">{viewingBuyer.phone}</p>
                  </div>
                  {viewingBuyer.contactPerson && (
                    <div>
                      <p className="text-xs text-gray-500">Contact Person</p>
                      <p className="text-sm font-medium">{viewingBuyer.contactPerson}</p>
                    </div>
                  )}
                  {viewingBuyer.designation && (
                    <div>
                      <p className="text-xs text-gray-500">Designation</p>
                      <p className="text-sm font-medium">{viewingBuyer.designation}</p>
                    </div>
                  )}
                  {viewingBuyer.alternatePhone && (
                    <div>
                      <p className="text-xs text-gray-500">Alternate Phone</p>
                      <p className="text-sm font-medium">{viewingBuyer.alternatePhone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bank Details */}
              {(viewingBuyer.bankName || viewingBuyer.accountNumber || viewingBuyer.ifscCode) && (
                <div className="border rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Bank Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {viewingBuyer.bankName && (
                      <div>
                        <p className="text-xs text-gray-500">Bank Name</p>
                        <p className="text-sm font-medium">{viewingBuyer.bankName}</p>
                      </div>
                    )}
                    {viewingBuyer.accountNumber && (
                      <div>
                        <p className="text-xs text-gray-500">Account Number</p>
                        <p className="text-sm font-medium">{viewingBuyer.accountNumber}</p>
                      </div>
                    )}
                    {viewingBuyer.ifscCode && (
                      <div>
                        <p className="text-xs text-gray-500">IFSC Code</p>
                        <p className="text-sm font-medium">{viewingBuyer.ifscCode}</p>
                      </div>
                    )}
                    {viewingBuyer.branch && (
                      <div>
                        <p className="text-xs text-gray-500">Branch</p>
                        <p className="text-sm font-medium">{viewingBuyer.branch}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {viewingBuyer.notes && (
                <div className="border rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Notes</h3>
                  <p className="text-sm text-gray-600">{viewingBuyer.notes}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => {
                  setViewingBuyer(null);
                  handleEdit(viewingBuyer);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Edit Buyer
              </button>
              <button
                onClick={() => setViewingBuyer(null)}
                className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmBuyer && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-[520px]">
            {/* Header */}
            <div className="p-6">
              <div className="flex items-center gap-3">
                {!isPermanentDelete && (
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle size={20} className="text-red-600" />
                  </div>
                )}
                <div>
                  <h2 className="text-base font-semibold text-gray-900">
                    {isPermanentDelete ? 'Delete Permanently?' : 'Delete Buyer'}
                  </h2>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 pb-6">
              <p className={`text-sm ${isPermanentDelete ? 'text-red-600' : 'text-gray-600'}`}>
                {isPermanentDelete ? (
                  <>
                    Are you sure you want to permanently delete{' '}
                    <strong>{deleteConfirmBuyer.companyName}</strong>? This action cannot be undone.
                  </>
                ) : (
                  <>
                    Are you sure you want to delete{' '}
                    <strong className="text-gray-900">{deleteConfirmBuyer.companyName}</strong>?
                    This action cannot be undone.
                  </>
                )}
              </p>
            </div>

            {/* Footer */}
            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmBuyer(null)}
                className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                {isPermanentDelete ? 'Delete Permanently' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
