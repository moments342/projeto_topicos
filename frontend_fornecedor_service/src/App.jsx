import { useEffect, useState } from "react";

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

function formatCnpj(value) {
  const digits = value.replace(/\D/g, "").slice(0, 14);

  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  }

  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

function formatInscricaoEstadual(value) {
  const digits = value.replace(/\D/g, "").slice(0, 14);

  if (!digits) {
    return "";
  }

  return digits.match(/.{1,3}/g)?.join(".") || digits;
}

function normalizeDigits(value) {
  return value.replace(/\D/g, "");
}

function App() {
  const [fornecedor, setFornecedor] = useState(() => ({ ...emptyFornecedor }));
  const [fornecedores, setFornecedores] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [searchCnpj, setSearchCnpj] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchedCnpj, setSearchedCnpj] = useState("");
  const [listError, setListError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [loadingEditId, setLoadingEditId] = useState(null);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    loadFornecedores();
  }, []);

  async function readErrorMessage(response, fallbackMessage) {
    try {
      const data = await response.json();
      return data.erro || data.message || fallbackMessage;
    } catch {
      return fallbackMessage;
    }
  }

  async function loadFornecedores() {
    setIsLoadingList(true);
    setListError("");

    try {
      const response = await fetch(fornecedoresUrl);

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, "Erro ao buscar fornecedores"));
      }

      const data = await response.json();
      setFornecedores(data);
      setIsSearchActive(false);
      setSearchedCnpj("");
    } catch (error) {
      setFornecedores([]);
      setListError(error.message || "Erro ao buscar fornecedores");
    } finally {
      setIsLoadingList(false);
    }
  }

  async function searchFornecedorByCnpj(cnpj) {
    setIsLoadingList(true);
    setListError("");

    try {
      const normalizedCnpj = normalizeDigits(cnpj);
      const maskedCnpj = formatCnpj(cnpj);
      const candidates = [...new Set([maskedCnpj, normalizedCnpj].filter(Boolean))];
      let foundFornecedor = null;

      for (const candidate of candidates) {
        const response = await fetch(
          `${fornecedoresUrl}/cnpj/${encodeURIComponent(candidate)}`
        );

        if (response.status === 404) {
          continue;
        }

        if (!response.ok) {
          throw new Error(
            await readErrorMessage(response, "Erro ao buscar fornecedor por CNPJ")
          );
        }

        foundFornecedor = await response.json();
        break;
      }

      if (!foundFornecedor) {
        setFornecedores([]);
        setIsSearchActive(true);
        setSearchedCnpj(maskedCnpj || cnpj);
        return;
      }

      setFornecedores([foundFornecedor]);
      setIsSearchActive(true);
      setSearchedCnpj(maskedCnpj || cnpj);
    } catch (error) {
      setFornecedores([]);
      setListError(error.message || "Erro ao buscar fornecedor por CNPJ");
    } finally {
      setIsLoadingList(false);
    }
  }

  async function refreshCurrentView() {
    const cnpj = searchCnpj.trim() || searchedCnpj.trim();

    if (isSearchActive && cnpj) {
      await searchFornecedorByCnpj(cnpj);
      return;
    }

    await loadFornecedores();
  }

  function handleChange(event) {
    const { name, value } = event.target;

    const maskedValue =
      name === "cnpj"
        ? formatCnpj(value)
        : name === "inscricao_estadual"
          ? formatInscricaoEstadual(value)
          : value;

    setFornecedor((currentFornecedor) => ({
      ...currentFornecedor,
      [name]: maskedValue
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

  async function handleEditClick(id) {
    setIsLoadingEdit(true);
    setLoadingEditId(id);
    setFeedback(null);

    try {
      const response = await fetch(`${fornecedoresUrl}/${id}`);

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, "Erro ao buscar fornecedor"));
      }

      const data = await response.json();

      setFornecedor({
        razao_social: data.razao_social || "",
        cnpj: formatCnpj(data.cnpj || ""),
        inscricao_estadual: formatInscricaoEstadual(data.inscricao_estadual || ""),
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
      setLoadingEditId(null);
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
      await refreshCurrentView();
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Erro ao salvar fornecedor"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSearchSubmit(event) {
    event.preventDefault();

    const cnpj = searchCnpj.trim();

    if (!cnpj) {
      await loadFornecedores();
      return;
    }

    await searchFornecedorByCnpj(cnpj);
  }

  async function handleClearSearch() {
    setSearchCnpj("");
    await loadFornecedores();
  }

  function handleDeleteRequest(item) {
    setDeleteTarget(item);
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);
    setFeedback(null);

    try {
      const response = await fetch(`${fornecedoresUrl}/${deleteTarget.id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, "Erro ao excluir fornecedor"));
      }

      setFeedback({
        type: "success",
        message: "Fornecedor excluido com sucesso"
      });
      setDeleteTarget(null);
      await refreshCurrentView();
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Erro ao excluir fornecedor"
      });
    } finally {
      setIsDeleting(false);
    }
  }

  function renderTableBody() {
    if (isLoadingList) {
      return (
        <tr>
          <td colSpan="5" className="px-4 py-8 text-center text-sm text-slate-500">
            Carregando fornecedores...
          </td>
        </tr>
      );
    }

    if (listError) {
      return (
        <tr>
          <td colSpan="5" className="px-4 py-8 text-center text-sm text-rose-600">
            Erro ao buscar fornecedores
          </td>
        </tr>
      );
    }

    if (fornecedores.length === 0 && isSearchActive) {
      return (
        <tr>
          <td colSpan="5" className="px-4 py-8 text-center text-sm text-slate-500">
            Nenhum fornecedor encontrado para este CNPJ
          </td>
        </tr>
      );
    }

    if (fornecedores.length === 0) {
      return (
        <tr>
          <td colSpan="5" className="px-4 py-8 text-center text-sm text-slate-500">
            Nenhum fornecedor cadastrado
          </td>
        </tr>
      );
    }

    return fornecedores.map((item) => (
      <tr key={item.id} className="border-b border-slate-100">
        <td className="px-4 py-4 text-sm text-slate-700">{item.id}</td>
        <td className="px-4 py-4 text-sm text-slate-700">{item.razao_social}</td>
        <td className="px-4 py-4 text-sm text-slate-700">{formatCnpj(item.cnpj || "")}</td>
        <td className="px-4 py-4 text-sm text-slate-700">
          {item.inscricao_estadual
            ? formatInscricaoEstadual(item.inscricao_estadual)
            : "-"}
        </td>
        <td className="px-4 py-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleEditClick(item.id)}
              disabled={isLoadingEdit}
              className="rounded-md bg-blue-500 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoadingEdit && loadingEditId === item.id ? "Abrindo..." : "Editar"}
            </button>

            <button
              type="button"
              onClick={() => handleDeleteRequest(item)}
              className="rounded-md bg-red-500 px-3 py-2 text-xs font-medium text-white transition hover:bg-red-600"
            >
              Excluir
            </button>
          </div>
        </td>
      </tr>
    ));
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
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <form className="flex-1" onSubmit={handleSearchSubmit}>
              <label className="mb-2 block text-sm font-medium text-slate-600">
                Buscar fornecedor por CNPJ
              </label>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={searchCnpj}
                  onChange={(event) => setSearchCnpj(formatCnpj(event.target.value))}
                  placeholder="00.000.000/0000-00"
                  className="h-11 flex-1 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <button
                  type="submit"
                  className="rounded-md bg-blue-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-600"
                >
                  Buscar
                </button>

                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="rounded-md border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Limpar
                </button>
              </div>
            </form>

            <div className="lg:self-end">
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
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold text-slate-900">Lista de Fornecedores</h2>

            <button
              type="button"
              onClick={refreshCurrentView}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Atualizar
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700">ID</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                    Razao Social
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700">CNPJ</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                    Inscricao Estadual
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700">Acoes</th>
                </tr>
              </thead>

              <tbody>{renderTableBody()}</tbody>
            </table>
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

      {deleteTarget && (
        <ModalShell title="Excluir fornecedor" onClose={() => setDeleteTarget(null)}>
          <div className="space-y-4">
            <p className="text-sm text-slate-700">
              Tem certeza que deseja excluir este fornecedor?
            </p>

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <strong>{deleteTarget.razao_social}</strong>
              <div>CNPJ: {formatCnpj(deleteTarget.cnpj || "")}</div>
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="rounded-md bg-red-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? "Excluindo..." : "Excluir fornecedor"}
              </button>

              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-md bg-slate-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-600"
              >
                Cancelar
              </button>
            </div>
          </div>
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
