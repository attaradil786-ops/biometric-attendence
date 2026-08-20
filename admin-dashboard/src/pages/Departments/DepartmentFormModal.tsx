import React, { useState, useEffect } from 'react';
import { Department } from '../../types';
import { useApp } from '../../context/AppContext';
import { Modal } from '../../components/ui/Modal';

interface DepartmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  deptToEdit?: Department | null;
}

export const DepartmentFormModal: React.FC<DepartmentFormModalProps> = ({
  isOpen,
  onClose,
  deptToEdit,
}) => {
  const { addDepartment, updateDepartment, employees } = useApp();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [managerName, setManagerName] = useState(employees[0]?.fullName || '');
  const [location, setLocation] = useState('Floor 3 - Engineering Hub');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (deptToEdit) {
      setName(deptToEdit.name);
      setCode(deptToEdit.code);
      setManagerName(deptToEdit.managerName);
      setLocation(deptToEdit.location);
      setDescription(deptToEdit.description || '');
    } else {
      setName('');
      setCode('');
      setManagerName(employees[0]?.fullName || '');
      setLocation('Floor 2 - Main Office');
      setDescription('');
    }
    setErrors({});
  }, [deptToEdit, isOpen, employees]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Department Name is required';
    if (!code.trim()) errs.code = 'Department Code is required (e.g. FIN, ENG)';
    if (!managerName.trim()) errs.managerName = 'Manager Name is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (deptToEdit) {
      updateDepartment(deptToEdit.id, {
        name,
        code: code.toUpperCase(),
        managerName,
        location,
        description,
      });
    } else {
      const leadEmp = employees.find((e) => e.fullName.toLowerCase() === managerName.toLowerCase());
      addDepartment({
        name,
        code: code.toUpperCase(),
        managerId: leadEmp ? leadEmp.id : 'EMP-1001',
        managerName,
        location,
        description,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={deptToEdit ? 'Edit Department' : 'Create New Department'}
      subtitle="Organize company teams, locations, and designated supervisors"
      maxWidth="md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
          >
            {deptToEdit ? 'Save Changes' : 'Create Department'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Department Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Finance & Accounting"
            className={`w-full bg-white dark:bg-slate-800 border rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 ${
              errors.name ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
            }`}
          />
          {errors.name && <p className="text-[10px] text-rose-500 mt-1">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Department Code *
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. FIN"
              className={`w-full uppercase bg-white dark:bg-slate-800 border rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 ${
                errors.code ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
              }`}
            />
            {errors.code && <p className="text-[10px] text-rose-500 mt-1">{errors.code}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Department Lead / Manager *
            </label>
            <input
              type="text"
              value={managerName}
              onChange={(e) => setManagerName(e.target.value)}
              placeholder="e.g. Sarah Jenkins"
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Office Wing / Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Floor 4 - North Wing"
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Department Scope / Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief overview of department functions and team responsibilities..."
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </form>
    </Modal>
  );
};
