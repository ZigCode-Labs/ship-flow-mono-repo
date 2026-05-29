'use client';

import { useEffect, useState } from 'react';

interface FieldConfig {
  name: string;
  label: string;
  required?: boolean;
  type: string;
  span: number;
}

interface SectionConfig {
  title: string;
  fields: FieldConfig[];
}

interface BuyerFormConfig {
  sections: SectionConfig[];
}

export type BuyerFormValues = Record<string, string>;

export type Buyer = {
  id?: string;
  companyName: string;
  tradeName?: string | null;
  gstin: string;
  panNumber?: string | null;
  address?: string | null;
  city?: string | null;
  state: string;
  pincode?: string | null;
  contactPerson?: string | null;
  designation?: string | null;
  email?: string | null;
  phone?: string | null;
  alternatePhone?: string | null;
  bankName?: string | null;
  accountNumber?: string | null;
  ifscCode?: string | null;
  branch?: string | null;
  notes?: string | null;
  status?: 'active' | 'inactive' | 'trash';
};

interface DomesticBuyerFormProps {
  editingBuyer?: Buyer | null;
  onSubmit: (data: Record<string, string>) => void;
  onCancel: () => void;
  submitLabel?: string;
  title?: string;
  description?: string;
}

type FieldNameMapping = Record<string, keyof Buyer>;

const fieldNameMapping: FieldNameMapping = {
  pan: 'panNumber',
  altPhone: 'alternatePhone',
  ifsc: 'ifscCode',
};

const uppercaseFields = new Set(['gstin', 'pan', 'ifsc']);

const fieldValidators: Record<string, { pattern: RegExp; message: string }> = {
  gstin: {
    pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
    message: 'GSTIN must be a valid 15 character GST number',
  },
  pan: {
    pattern: /^[A-Z]{5}[0-9]{4}[A-Z]$/,
    message: 'PAN number must be valid',
  },
  pincode: {
    pattern: /^[1-9][0-9]{5}$/,
    message: 'Pincode must be a valid 6 digit code',
  },
  ifsc: {
    pattern: /^[A-Z]{4}0[A-Z0-9]{6}$/,
    message: 'IFSC code must be valid',
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Email must be valid',
  },
};

const normalizeFieldValue = (name: string, value: string) => {
  const trimmedValue = value.trim();
  return uppercaseFields.has(name) ? trimmedValue.toUpperCase() : trimmedValue;
};

const indianStates = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Puducherry',
];

export default function DomesticBuyerForm({
  editingBuyer = null,
  onSubmit,
  onCancel,
  submitLabel = 'Add Buyer',
  title = 'Add Domestic Buyer',
  description = 'Enter details for the Indian buyer with GST information',
}: DomesticBuyerFormProps) {
  const [formConfig, setFormConfig] = useState<BuyerFormConfig | null>(null);
  const [formData, setFormData] = useState<BuyerFormValues>({});
  const [errors, setErrors] = useState<Partial<BuyerFormValues>>({});

  useEffect(() => {
    import('../data/buyer-form-config.json')
      .then((module) => {
        const config = module.default as BuyerFormConfig;
        setFormConfig(config);

        const initialData: BuyerFormValues = {};
        config.sections.forEach((section) => {
          section.fields.forEach((field) => {
            const buyerFieldName = fieldNameMapping[field.name] || field.name;
            const buyerValue = editingBuyer?.[buyerFieldName as keyof Buyer];
            initialData[field.name] = (buyerValue as string) || '';
          });
        });
        setFormData(initialData);
      })
      .catch((error) => {
        console.error('Failed to load form config:', error);
      });
  }, [editingBuyer]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name } = e.target;
    const value = uppercaseFields.has(name) ? e.target.value.toUpperCase() : e.target.value;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    if (!formConfig) return false;

    const newErrors: Partial<BuyerFormValues> = {};

    formConfig.sections.forEach((section) => {
      section.fields.forEach((field) => {
        if (field.required && !formData[field.name]?.trim()) {
          newErrors[field.name] = `${field.label} is required`;
          return;
        }

        const validator = fieldValidators[field.name];
        const value = normalizeFieldValue(field.name, formData[field.name] || '');

        if (validator && value && !validator.pattern.test(value)) {
          newErrors[field.name] = validator.message;
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (validateForm()) {
      const mappedData: Record<string, string> = {};
      Object.entries(formData).forEach(([key, value]) => {
        const buyerFieldName = fieldNameMapping[key] || key;
        mappedData[buyerFieldName] = normalizeFieldValue(key, value);
      });

      onSubmit(mappedData);
    }
  };

  if (!formConfig) {
    return <div className="p-8 text-center text-sm text-gray-500">Loading buyer form...</div>;
  }

  return (
    <div className="flex flex-col bg-white rounded-xl shadow-xl w-full max-h-[90vh] overflow-hidden">
      <div className="flex-none px-6 py-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {formConfig.sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">
                {section.title}
              </h3>
              <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                {section.fields.map((field) => (
                  <div key={field.name} className={field.span === 2 ? 'sm:col-span-2' : ''}>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {field.label}
                      {field.required && <span className="text-red-500"> *</span>}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={handleInputChange}
                        className={`w-full min-h-[80px] rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 shadow-sm ${
                          errors[field.name]
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300'
                        }`}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                      />
                    ) : field.type === 'select' ? (
                      <select
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={handleInputChange}
                        className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 shadow-sm ${
                          errors[field.name]
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select state</option>
                        {indianStates.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={handleInputChange}
                        className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 shadow-sm ${
                          errors[field.name]
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300'
                        }`}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                      />
                    )}
                    {errors[field.name] && (
                      <p className="mt-1 text-xs text-red-600">{errors[field.name]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex-none px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 shadow-sm transition-colors"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
