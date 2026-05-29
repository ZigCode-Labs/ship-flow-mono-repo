const fs = require('fs');
const path = require('path');

const filePath = path.join(
  __dirname,
  'src',
  'app',
  '(dashboard)',
  'domestic',
  'proforma',
  'page.tsx',
);
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Import useEffect
content = content.replace(
  `import { useState } from "react";`,
  `import { useState, useEffect } from "react";`,
);

// 2. Add fetch logic and update handleSaveSuccess
content = content.replace(
  `  const [proformas, setProformas] = useState<any[]>([]);

  const handleSaveSuccess = () => {
    setProformas([{ id: 1 }]);
    setShowForm(false);
  };`,
  `  const [proformas, setProformas] = useState<any[]>([]);

  const fetchProformas = async () => {
    try {
      const res = await fetch("http://localhost:4000/domestic-proformas");
      if (res.ok) {
        const data = await res.json();
        setProformas(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProformas();
  }, []);

  const handleSaveSuccess = () => {
    fetchProformas();
    setShowForm(false);
  };`,
);

// 3. Update the rendering of cards
content = content.replace(
  `              <div className="text-[11px] text-gray-500 px-1 font-medium">{proformas.length} proforma</div>
              <div className="border border-outline-variant/30 rounded-xl p-3 bg-white hover:bg-gray-50/50 transition-colors cursor-pointer shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="pt-0.5">
                    <input type="checkbox" className="rounded border-gray-300 text-primary w-4 h-4 cursor-pointer" />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex justify-between items-start mb-1.5">
                      <h3 className="font-semibold text-[13px] text-[#0f172a]">No customer</h3>
                      <span className="text-[10px] bg-gray-100/80 text-gray-600 px-2.5 py-0.5 rounded-full font-medium">Draft</span>
                    </div>
                    <div className="text-[11px] text-gray-400">DPI-26-27-001</div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-[11px] text-gray-400">17 May 2026</span>
                      <span className="font-bold text-[13px] text-black">₹1,180</span>
                    </div>
                  </div>
                </div>
              </div>`,
  `              <div className="text-[11px] text-gray-500 px-1 font-medium">{proformas.length} proforma(s)</div>
              {proformas.map((p) => (
                <div key={p.id} className="border border-outline-variant/30 rounded-xl p-3 bg-white hover:bg-gray-50/50 transition-colors cursor-pointer shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="pt-0.5">
                      <input type="checkbox" className="rounded border-gray-300 text-primary w-4 h-4 cursor-pointer" />
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex justify-between items-start mb-1.5">
                        <h3 className="font-semibold text-[13px] text-[#0f172a]">{p.customerName || "No customer"}</h3>
                        <span className="text-[10px] bg-gray-100/80 text-gray-600 px-2.5 py-0.5 rounded-full font-medium">{p.status || "Draft"}</span>
                      </div>
                      <div className="text-[11px] text-gray-400">{p.proformaNumber}</div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-[11px] text-gray-400">{new Date(p.date).toLocaleDateString()}</span>
                        <span className="font-bold text-[13px] text-black">₹{p.grandTotal?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}`,
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Done');
