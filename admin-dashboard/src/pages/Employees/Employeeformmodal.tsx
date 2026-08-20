import { FormEvent, useState } from "react";



type EmployeeFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
};

export const EmployeeFormModal = ({
  isOpen,
  onClose,
  onSaved,
}: EmployeeFormModalProps) => {
  const [form, setForm] = useState({
    employee_id: "",
    full_name: "",
    email: "",
    department: "",
    role: "",
    status: "active",
  });

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const response = await fetch("https://biometric-attendence-p6nc.onrender.com/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to save employee");
      }

      setForm({
        employee_id: "",
        full_name: "",
        email: "",
        department: "",
        role: "",
        status: "active",
      });

      onSaved?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save employee");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-bold">Add Employee</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            required
            placeholder="Employee ID"
            value={form.employee_id}
            onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
            className="w-full rounded border p-2"
          />

          <input
            required
            placeholder="Full name"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="w-full rounded border p-2"
          />

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded border p-2"
          />

          <input
            placeholder="Department"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            className="w-full rounded border p-2"
          />

          <input
            placeholder="Role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full rounded border p-2"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded border px-4 py-2">
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
