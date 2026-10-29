import { Plus, X, Globe, DollarSign, Briefcase, Info } from 'lucide-react';

const ComparisonTable = ({ countries, onAdd, onRemove }) => {
  const features = [
    { label: 'Avg. Tuition Fee', key: 'tuition', icon: <Globe className="w-4 h-4" /> },
    { label: 'Yearly Living', key: 'living', icon: <DollarSign className="w-4 h-4" /> },
    { label: 'Visa Application', key: 'visa', icon: <Briefcase className="w-4 h-4" /> },
    { label: 'Part-time Income', key: 'income', icon: <DollarSign className="w-4 h-4 text-green-500" /> },
    { label: 'Post-study Work', key: 'work', icon: <Info className="w-4 h-4" /> },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="p-6 text-left border-b border-gray-100 min-w-[200px]">
                <span className="text-xl font-bold text-primary-600">Compare</span>
              </th>
              {countries.map((country, index) => (
                <th key={index} className="p-6 border-b border-gray-100 min-w-[250px] relative">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img loading="lazy" decoding="async"
                        src={`https://flagcdn.com/w80/${country.code.toLowerCase()}.png`}
                        alt={country.name}
                        className="w-8 h-6 object-cover rounded shadow-sm"
                      />
                      <span className="font-bold text-gray-900">{country.name}</span>
                    </div>
                    <button
                      onClick={() => onRemove(index)}
                      className="p-1.5 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </th>
              ))}
              {countries.length < 3 && (
                <th className="p-6 border-b border-gray-100 min-w-[250px]">
                  <button
                    onClick={onAdd}
                    className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-primary-400 hover:text-primary-500 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add Country
                  </button>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {features.map((feature, idx) => (
              <tr key={idx} className="group">
                <td className="p-6 border-b border-gray-50 font-medium text-gray-600 group-hover:bg-primary-50/30 transition-colors">
                  <div className="flex items-center gap-2">
                    {feature.icon}
                    {feature.label}
                  </div>
                </td>
                {countries.map((country, cIdx) => (
                  <td key={cIdx} className="p-6 border-b border-gray-50 text-center font-bold text-gray-900 group-hover:bg-primary-50/30 transition-colors">
                    {country.data[feature.key]}
                  </td>
                ))}
                {countries.length < 3 && <td className="p-6 border-b border-gray-50 group-hover:bg-primary-50/30 transition-colors" />}
              </tr>
            ))}
            <tr className="bg-primary-600">
              <td className="p-6 font-bold text-white text-lg">Estimated Total</td>
              {countries.map((country, cIdx) => (
                <td key={cIdx} className="p-6 text-center font-bold text-white text-2xl">
                  {country.total}
                </td>
              ))}
              {countries.length < 3 && <td className="p-6" />}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparisonTable;
