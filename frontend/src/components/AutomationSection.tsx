import React, { useState } from 'react';
import type { Rule, Device } from '../types';
import { Zap, PlusCircle } from 'lucide-react';

interface AutomationSectionProps {
  rules: Rule[];
  devices: Device[];
  onAddRule: (rule: Omit<Rule, 'id'|'createdAt'|'lastTriggered'|'triggerCount'>) => void;
  onToggleRule: (ruleId: string, enabled: boolean) => void;
  onDeleteRule: (ruleId: string) => void;
}

const AutomationSection: React.FC<AutomationSectionProps> = ({
  rules,
  devices,
  onAddRule,
  onToggleRule,
  onDeleteRule,
}) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    conditionDevice: '',
    conditionProperty: '',
    conditionOperator: 'eq',
    conditionValue: '',
    actionDevice: '',
    actionProperty: '',
    actionValue: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewRule(prev => ({ ...prev, [name]: value }));
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.name || !newRule.conditionDevice || !newRule.actionDevice) {
        alert("Please fill out all required fields.");
        return;
    }
    onAddRule({
      name: newRule.name,
      condition: {
        deviceId: newRule.conditionDevice,
        property: newRule.conditionProperty,
        operator: newRule.conditionOperator as 'eq', // Cast for simplicity
        value: newRule.conditionValue,
      },
      actions: [
        {
          deviceId: newRule.actionDevice,
          property: newRule.actionProperty,
          value: newRule.actionValue,
        },
      ],
      enabled: true,
    });
    // Reset form and hide it
    setNewRule({ name: '', conditionDevice: '', conditionProperty: '', conditionOperator: 'eq', conditionValue: '', actionDevice: '', actionProperty: '', actionValue: '' });
    setIsFormVisible(false);
  };

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <Zap className="w-8 h-8 text-sky-600" />
          <h2 className="text-2xl font-bold text-slate-800">Automation</h2>
        </div>
        <button
          onClick={() => setIsFormVisible(!isFormVisible)}
          className="flex items-center gap-2 px-3 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition font-semibold"
        >
          <PlusCircle className="w-5 h-5" />
          <span className="hidden sm:inline">Add Rule</span>
        </button>
      </div>
      
      {isFormVisible && (
        <form onSubmit={handleAddRule} className="mb-4 p-4 bg-slate-50 rounded-lg space-y-4">
          <input type="text" name="name" placeholder="Rule Name (e.g., 'Night Light')" value={newRule.name} onChange={handleInputChange} required className="w-full p-2 border rounded-md" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select name="conditionDevice" value={newRule.conditionDevice} onChange={handleInputChange} required className="w-full p-2 border rounded-md">
              <option value="">IF Device...</option>
              {devices.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <input type="text" name="conditionProperty" placeholder="Property (e.g., 'on')" value={newRule.conditionProperty} onChange={handleInputChange} required className="w-full p-2 border rounded-md" />
            <input type="text" name="conditionValue" placeholder="Is... (e.g., 'true')" value={newRule.conditionValue} onChange={handleInputChange} required className="w-full p-2 border rounded-md" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select name="actionDevice" value={newRule.actionDevice} onChange={handleInputChange} required className="w-full p-2 border rounded-md">
              <option value="">THEN Device...</option>
              {devices.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <input type="text" name="actionProperty" placeholder="Set Property..." value={newRule.actionProperty} onChange={handleInputChange} required className="w-full p-2 border rounded-md" />
            <input type="text" name="actionValue" placeholder="To Value..." value={newRule.actionValue} onChange={handleInputChange} required className="w-full p-2 border rounded-md" />
          </div>
          <button type="submit" className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold">Save Rule</button>
        </form>
      )}

      <div className="space-y-2">
        {rules.map(rule => (
          <div key={rule.id} className="p-3 bg-white rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <p className="font-semibold text-slate-700">{rule.name}</p>
              <p className="text-sm text-slate-500">
                IF {devices.find(d => d.id === rule.condition.deviceId)?.name} property '{rule.condition.property}' is {String(rule.condition.value)}
              </p>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center">
              <button onClick={() => onToggleRule(rule.id, !rule.enabled)} className={`px-2 py-1 text-xs rounded-full font-bold ${rule.enabled ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-600'}`}>
                {rule.enabled ? 'ENABLED' : 'DISABLED'}
              </button>
              <button onClick={() => onDeleteRule(rule.id)} className="text-slate-400 hover:text-red-500 transition">
                &times;
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AutomationSection;