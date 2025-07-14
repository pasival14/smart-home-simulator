import React, { useState } from 'react';
import type { Rule, Device } from '../types';

interface AutomationSectionProps {
  rules: Rule[];
  devices: Device[];
  onAddRule: (rule: Omit<Rule, 'id'>) => void;
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
    const rule: Omit<Rule, 'id'> = {
      name: newRule.name,
      condition: {
        deviceId: newRule.conditionDevice,
        property: newRule.conditionProperty,
        operator: newRule.conditionOperator,
        value: newRule.conditionValue === 'true' ? true : newRule.conditionValue === 'false' ? false : newRule.conditionValue,
      },
      actions: [
        {
          deviceId: newRule.actionDevice,
          property: newRule.actionProperty,
          value: newRule.actionValue === 'true' ? true : newRule.actionValue === 'false' ? false : newRule.actionValue,
        },
      ],
      enabled: true,
    };
    onAddRule(rule);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
      <h2 className="text-2xl font-bold mb-4">Automation Rules</h2>
      <div className="space-y-4">
        {rules.map(rule => (
          <div key={rule.id} className="p-4 border rounded-lg flex justify-between items-center">
            <div>
              <p className="font-semibold">{rule.name}</p>
              <p className="text-sm text-gray-600">
                IF {devices.find(d => d.id === rule.condition.deviceId)?.name} {rule.condition.property} is {rule.condition.operator} {String(rule.condition.value)}
                <br />
                THEN {devices.find(d => d.id === rule.actions[0].deviceId)?.name} {rule.actions[0].property} = {String(rule.actions[0].value)}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onToggleRule(rule.id, !rule.enabled)}
                className={`px-3 py-1 rounded ${rule.enabled ? 'bg-green-500 text-white' : 'bg-gray-300'}`}
              >
                {rule.enabled ? 'Enabled' : 'Disabled'}
              </button>
              <button onClick={() => onDeleteRule(rule.id)} className="px-3 py-1 bg-red-500 text-white rounded">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleAddRule} className="mt-6 p-4 border-t">
        <h3 className="text-lg font-semibold mb-2">Add New Rule</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" name="name" placeholder="Rule Name" value={newRule.name} onChange={handleInputChange} className="p-2 border rounded" />
          <select name="conditionDevice" value={newRule.conditionDevice} onChange={handleInputChange} className="p-2 border rounded">
            <option value="">Select Condition Device</option>
            {devices.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <input type="text" name="conditionProperty" placeholder="Condition Property" value={newRule.conditionProperty} onChange={handleInputChange} className="p-2 border rounded" />
          <select name="conditionOperator" value={newRule.conditionOperator} onChange={handleInputChange} className="p-2 border rounded">
            <option value="eq">Equals</option>
            <option value="gt">Greater Than</option>
            <option value="lt">Less Than</option>
          </select>
          <input type="text" name="conditionValue" placeholder="Condition Value" value={newRule.conditionValue} onChange={handleInputChange} className="p-2 border rounded" />
          <select name="actionDevice" value={newRule.actionDevice} onChange={handleInputChange} className="p-2 border rounded">
            <option value="">Select Action Device</option>
            {devices.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <input type="text" name="actionProperty" placeholder="Action Property" value={newRule.actionProperty} onChange={handleInputChange} className="p-2 border rounded" />
          <input type="text" name="actionValue" placeholder="Action Value" value={newRule.actionValue} onChange={handleInputChange} className="p-2 border rounded" />
        </div>
        <button type="submit" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg">Add Rule</button>
      </form>
    </div>
  );
};

export default AutomationSection;