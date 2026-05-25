import { useState } from "react";

const apiBaseUrl = (import.meta.env.VITE_API_URL || "http://localhost:3002").replace(
  /\/$/,
  ""
);
const fornecedoresUrl = `${apiBaseUrl}/fornecedores`;

const emptyFornecedor = {
  razao_social: "",
  cnpj: "",
  inscricao_estadual: "",
  contatos: "",
  financeiro: ""
};

function App() {
  const [fornecedor, setFornecedor] = useState(() => ({ ...emptyFornecedor }));
  const [editingId, setEditingId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);

  async function readErrorMessage(response, fallbackMessage) {
    try {
      const data = await response.json();
      return data.erro || data.message || fallbackMessage;
    } catch {
      return fallbackMessage;
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFornecedor((currentFornecedor) => ({
      ...currentFornecedor,
      [name]: value
    }));
  }

  function resetForm() {
    setFornecedor({ ...emptyFornecedor });
    setEditingId(null);
  }

  function closeFormModal() {
    setIsFormModalOpen(false);
    resetForm();
  }

  function openCreateModal() {
    resetForm();
    setFeedback(null);
    setIsFormModalOpen(true);
  }

  async function handleEditClick() {
    const id = window.prompt("Informe o ID do fornecedor para editar:");

    if (!id || !id.trim()) {
      return;
    }

    setIsLoadingEdit(true);
    setFeedback(null);

    try {
      const response = await fetch(`${fornecedoresUrl}/${id.trim()}`);

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, "Erro ao buscar fornecedor"));
      }

      const data = await response.json();

      setFornecedor({
        razao_social: data.razao_social || "",
        cnpj: data.cnpj || "",
        inscricao_estadual: data.inscricao_estadual || "",
        contatos: data.contatos || "",
        financeiro: data.financeiro || ""
      });
      setEditingId(data.id);
      setIsFormModalOpen(true);
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Erro ao buscar fornecedor"
      });
    } finally {
      setIsLoadingEdit(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!fornecedor.razao_social.trim() || !fornecedor.cnpj.trim()) {
      setFeedback({
        type: "error",
        message: "Campos obrigatorios nao preenchidos"
      });
      return;
    }

    const payload = {
      razao_social: fornecedor.razao_social.trim(),
      cnpj: fornecedor.cnpj.trim(),
      inscricao_estadual: fornecedor.inscricao_estadual.trim(),
      contatos: fornecedor.contatos.trim(),
      financeiro: fornecedor.financeiro.trim()
    };

    const isEditing = editingId !== null;
    const endpoint = isEditing ? `${fornecedoresUrl}/${editingId}` : fornecedoresUrl;
    const method = isEditing ? "PUT" : "POST";

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, "Erro ao salvar fornecedor"));
      }

      await response.json();

      setFeedback({
        type: "success",
        message: isEditing
          ? "Fornecedor atualizado com sucesso"
          : "Fornecedor cadastrado com sucesso"
      });

      closeFormModal();
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Erro ao salvar fornecedor"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const isEditing = editingId !== null;

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <nav className="bg-blue-600">
        <div className="container mx-auto flex h-16 items-center px-4">
          <a href="#" className="text-2xl font-semibold text-white">
            Fornecedores
          </a>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {feedback && (
          <div
            className={[
              "mb-6 rounded-xl border px-4 py-3 text-sm shadow-sm",
              feedback.type === "success" && "border-emerald-200 bg-emerald-50 text-emerald-800",
              feedback.type === "error" && "border-rose-200 bg-rose-50 text-rose-800"
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {feedback.message}
          </div>
        )}

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              Pesquisar fornecedor - Implementar campo de pesquisa
            </div>

            <div className="md:self-end">
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex h-11 items-center justify-center rounded-md bg-blue-500 px-5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-600"
              >
                + Fornecedor
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
          <div className="space-y-4">
            <p>
              Lista de Fornecedores - Implementar listagem de fornecedores cadastrados,
              com as acoes de editar e excluir cada fornecedor. A listagem deve ser
              atualizada apos cada operacao de cadastro, edicao ou exclusao.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={handleEditClick}
                disabled={isLoadingEdit}
                className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoadingEdit ? "Abrindo..." : "Editar"}
              </button>

              <span>
                Botao funcional de editar: informe o ID para carregar o modal de edicao.
              </span>
            </div>
          </div>
        </section>
      </div>

      {isFormModalOpen && (
        <ModalShell
          title={isEditing ? "Editar Fornecedor" : "Cadastrar Fornecedor"}
          onClose={closeFormModal}
        >
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Razao social"
                name="razao_social"
                value={fornecedor.razao_social}
                onChange={handleChange}
                required
              />

              <FormField
                label="CNPJ"
                name="cnpj"
                value={fornecedor.cnpj}
                onChange={handleChange}
                required
              />
            </div>

            <FormField
              label="Inscricao estadual"
              name="inscricao_estadual"
              value={fornecedor.inscricao_estadual}
              onChange={handleChange}
            />

            <TextAreaField
              label="Contatos"
              name="contatos"
              value={fornecedor.contatos}
              onChange={handleChange}
            />

            <TextAreaField
              label="Financeiro"
              name="financeiro"
              value={fornecedor.financeiro}
              onChange={handleChange}
            />

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-blue-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? "Salvando..."
                  : isEditing
                    ? "Atualizar fornecedor"
                    : "Salvar fornecedor"}
              </button>

              <button
                type="button"
                onClick={closeFormModal}
                className="rounded-md bg-slate-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-600"
              >
                Cancelar
              </button>
            </div>
          </form>
        </ModalShell>
      )}
    </main>
  );
}

function ModalShell({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4 py-6">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="text-2xl font-semibold text-slate-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1 text-slate-500 transition hover:bg-slate-100"
          >
            X
          </button>
        </div>

        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function FormField({ label, name, value, onChange, required = false }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-600">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>
      <input
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

function TextAreaField({ label, name, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-600">{label}</span>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={4}
        className="w-full rounded-md border border-slate-300 px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

export default App;
