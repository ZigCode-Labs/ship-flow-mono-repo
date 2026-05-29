const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'proforma', 'ProformaForm.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Update the schema
content = content.replace(
  `const lineItemsFormSchema = z.object({
  lineItems: z.array(lineItemSchema),
});

type LineItemFormValues = z.infer<typeof lineItemSchema>;
type LineItemsFormValues = z.infer<typeof lineItemsFormSchema>;`,
  `const proformaFormSchema = z.object({
  proformaNumber: z.string().min(1, "Required"),
  date: z.string().min(1, "Required"),
  validUntil: z.string().min(1, "Required"),
  sellerCompanyName: z.string().min(1, "Required"),
  sellerGstin: z.string().min(1, "Required"),
  sellerState: z.string().min(1, "Required"),
  customerName: z.string().min(1, "Required"),
  customerGstin: z.string().min(1, "Required"),
  placeOfSupply: z.string().min(1, "Required"),
  paymentTerms: z.string().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
  lineItems: z.array(lineItemSchema),
});

type LineItemFormValues = z.infer<typeof lineItemSchema>;
type ProformaFormValues = z.infer<typeof proformaFormSchema>;`,
);

// 2. Update useForm
content = content.replace(
  `  const { control, register, setValue } = useForm<LineItemsFormValues>({
    resolver: zodResolver(lineItemsFormSchema),
    defaultValues: {
      lineItems: [],
    },
    mode: "onChange",
  });`,
  `  const { control, register, setValue, handleSubmit, watch } = useForm<ProformaFormValues>({
    resolver: zodResolver(proformaFormSchema),
    defaultValues: {
      proformaNumber: "DPI-26-27-001",
      date: "2026-04-22",
      validUntil: "2026-05-22",
      sellerCompanyName: "",
      sellerGstin: "",
      sellerState: "",
      customerName: "",
      customerGstin: "",
      placeOfSupply: "",
      paymentTerms: "",
      reference: "",
      notes: "",
      lineItems: [],
    },
    mode: "onChange",
  });`,
);

// 3. Update handleSaveProforma
content = content.replace(
  `  const handleSaveProforma = () => {
    if (fields.length === 0) {
      toast.error("Error", {
        description: "Add at least one item",
      });
      return;
    }
    
    // Show success toast
    toast.success("Success", {
      description: "Proforma updated successfully",
    });
    
    // Close form and show card
    onSaveSuccess?.();
  };`,
  `  const handleSaveProforma = handleSubmit(async (data) => {
    if (fields.length === 0) {
      toast.error("Error", {
        description: "Add at least one item",
      });
      return;
    }

    try {
      const payload = {
        ...data,
        date: new Date(data.date).toISOString(),
        validUntil: new Date(data.validUntil).toISOString(),
        exchangeRate: Number(exchangeRate) || 0,
        isRateLocked,
        discountValue,
        discountType,
        subtotal: totals.subtotal,
        discountAmount: totals.discountAmount,
        taxableAmount: totals.taxableAmount,
        igst: totals.igst,
        totalTax: totals.totalTax,
        grandTotal: totals.grandTotal,
      };

      const res = await fetch("http://localhost:4000/domestic-proformas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Save failed");
      }
      
      toast.success("Success", {
        description: "Proforma created successfully",
      });
      
      onSaveSuccess?.();
    } catch (err) {
      console.error(err);
      toast.error("Error", {
        description: "Failed to save proforma",
      });
    }
  });`,
);

// We have multiple instances of identical Inputs, so we can't just replace globally easily.
// Let's use regex matching exact patterns carefully.
const replacements = [
  {
    find: /<Input\s+type="text"\s+defaultValue="DPI 26 27 001"\s+className="h-\[40px\] rounded-md border-outline-variant\/30 bg-white text-sm"\s+\/>/,
    replace: `<Input {...register("proformaNumber")} type="text" className="h-[40px] rounded-md border-outline-variant/30 bg-white text-sm" />`,
  },
  {
    find: /<Input\s+type="date"\s+defaultValue="2026-04-22"\s+className="h-\[40px\] rounded-md border-outline-variant\/30 bg-white text-sm"\s+\/>/,
    replace: `<Input {...register("date")} type="date" className="h-[40px] rounded-md border-outline-variant/30 bg-white text-sm" />`,
  },
  {
    find: /<Input\s+type="date"\s+defaultValue="2026-05-22"\s+className="h-\[40px\] rounded-md border-outline-variant\/30 bg-white text-sm"\s+\/>/,
    replace: `<Input {...register("validUntil")} type="date" className="h-[40px] rounded-md border-outline-variant/30 bg-white text-sm" />`,
  },
  {
    find: /<Input\s+type="text"\s+placeholder="e\.g\., Net 30 days"\s+className="h-9 rounded-md border-outline-variant\/30 bg-white text-sm"\s+\/>/,
    replace: `<Input {...register("paymentTerms")} type="text" placeholder="e.g., Net 30 days" className="h-9 rounded-md border-outline-variant/30 bg-white text-sm" />`,
  },
  {
    find: /<Input\s+type="text"\s+placeholder="e\.g\., PO number, enquiry ref"\s+className="h-9 rounded-md border-outline-variant\/30 bg-white text-sm"\s+\/>/,
    replace: `<Input {...register("reference")} type="text" placeholder="e.g., PO number, enquiry ref" className="h-9 rounded-md border-outline-variant/30 bg-white text-sm" />`,
  },
  {
    find: /<Input\s+type="text"\s+placeholder="e\.g\., 27AABCU9603R1ZM"\s+className="h-9 rounded-md border-outline-variant\/30 bg-white text-sm"\s+\/>/,
    replace: `<Input {...register("customerGstin")} type="text" placeholder="e.g., 27AABCU9603R1ZM" className="h-9 rounded-md border-outline-variant/30 bg-white text-sm" />`,
  },
  {
    find: /<Textarea\s+placeholder="Additional notes for the customer\.\.\."\s+rows={4}\s+className="min-h-\[120px\] resize-y rounded-md border-outline-variant\/30 bg-white text-sm"\s+\/>/,
    replace: `<Textarea {...register("notes")} placeholder="Additional notes for the customer..." rows={4} className="min-h-[120px] resize-y rounded-md border-outline-variant/30 bg-white text-sm" />`,
  },
  {
    find: /<Select>\s*<SelectTrigger className="h-9 border-outline-variant\/30 text-sm">\s*<SelectValue placeholder="Select state" \/>\s*<\/SelectTrigger>\s*<SelectContent className="max-h-\[30rem\]">\s*\{PLACE_OF_SUPPLY_OPTIONS\.map\(\(state\) => \(\s*<SelectItem\s*key=\{state\.code\}\s*value=\{state\.code\}\s*className="pl-3 text-xs"\s*>\s*\{state\.code\} - \{state\.name\}\s*<\/SelectItem>\s*\)\)\}\s*<\/SelectContent>\s*<\/Select>/m,
    replace: `<Controller control={control} name="placeOfSupply" render={({ field }) => ( <Select value={field.value} onValueChange={field.onChange}> <SelectTrigger className="h-9 border-outline-variant/30 text-sm"> <SelectValue placeholder="Select state" /> </SelectTrigger> <SelectContent className="max-h-[30rem]"> {PLACE_OF_SUPPLY_OPTIONS.map((state) => ( <SelectItem key={state.code} value={state.code} className="pl-3 text-xs"> {state.code} - {state.name} </SelectItem> ))} </SelectContent> </Select> )} />`,
  },
];

replacements.forEach(({ find, replace }) => {
  content = content.replace(find, replace);
});

// For the 4 generic text inputs: sellerCompanyName, sellerGstin, sellerState, customerName
// They all look exactly like:
// <Input
//   type="text"
//   className="h-9 rounded-md border-outline-variant/30 bg-white text-sm"
// />

const genericInputStr =
  '<Input\\s+type="text"\\s+className="h-9 rounded-md border-outline-variant\\/30 bg-white text-sm"\\s+\\/>';
const fields = ['sellerCompanyName', 'sellerGstin', 'sellerState', 'customerName'];
fields.forEach((field) => {
  content = content.replace(
    new RegExp(genericInputStr),
    `<Input {...register("` +
      field +
      `")} type="text" className="h-9 rounded-md border-outline-variant/30 bg-white text-sm" />`,
  );
});

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Done');
