'use client';

import { CostSheetField } from './CostSheetField';
import { headerFields, FieldDefinition } from '../data/field-definitions';

interface HeaderSectionProps {
  values: Record<string, any>;
  onChange: (fieldName: string, value: any) => void;
}

export function HeaderSection({ values, onChange }: HeaderSectionProps) {
  const handleFieldChange = (field: FieldDefinition, value: any) => {
    onChange(field.name, value);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-6 text-sm font-medium tracking-wider text-gray-500">Header</h3>

      {/* Row 1: Date + Shipping Term */}
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <CostSheetField
            field={headerFields[0]}
            value={values.date}
            onChange={(val) => handleFieldChange(headerFields[0], val)}
            bgWhite
          />
        </div>
        <div className="md:col-span-2">
          <CostSheetField
            field={headerFields[1]}
            value={values.shippingTerm}
            onChange={(val) => handleFieldChange(headerFields[1], val)}
            bgWhite
          />
        </div>
      </div>

      {/* Row 2: Finished Item Name + Batch Quantity */}
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <CostSheetField
            field={headerFields[2]}
            value={values.finishedItemName}
            onChange={(val) => handleFieldChange(headerFields[2], val)}
            bgWhite
          />
        </div>
        <div>
          <CostSheetField
            field={headerFields[3]}
            value={values.batchQuantity}
            onChange={(val) => handleFieldChange(headerFields[3], val)}
            bgWhite
          />
        </div>
      </div>

      {/* Row 3: Unit of Measure */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <CostSheetField
            field={headerFields[4]}
            value={values.unitOfMeasure}
            onChange={(val) => handleFieldChange(headerFields[4], val)}
            bgWhite
          />
        </div>
      </div>
    </div>
  );
}
