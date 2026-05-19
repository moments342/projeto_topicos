
const API_URL = 'http://localhost:3000/clientes';

const form = document.getElementById('clienteForm');
const tableBody = document.getElementById('clientesTable');
const cancelarBtn = document.getElementById('cancelarBtn');

document.addEventListener('DOMContentLoaded', () => {
  carregarClientes();
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const id = document.getElementById('clienteId').value;

  const cliente = {
    nome: document.getElementById('nome').value,
    cpf: document.getElementById('cpf').value,
    data_nascimento: document.getElementById('dataNascimento').value,
    endereco: document.getElementById('endereco').value,
    cidade: parseInt(document.getElementById('cidade').value)
  };

  try {
    let response;

    if (id) {
      response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cliente)
      });
    } else {
      response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cliente)
      });
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.erro || 'Erro ao salvar cliente');
    }

    M.toast({ html: 'Cliente salvo com sucesso!' });

    limparFormulario();
    carregarClientes();
  } catch (error) {
    M.toast({ html: error.message });
  }
});

cancelarBtn.addEventListener('click', limparFormulario);

async function carregarClientes() {
  try {
    const response = await fetch(API_URL);
    const clientes = await response.json();

    tableBody.innerHTML = '';

    clientes.forEach(cliente => {
      const row = document.createElement('tr');

      row.innerHTML = `
        <td>${cliente.serial}</td>
        <td>${cliente.nome}</td>
        <td>${cliente.cpf}</td>
        <td>${formatarData(cliente.data_nascimento)}</td>
        <td>${cliente.cidade || '-'}</td>
        <td>${cliente.uf || '-'}</td>
        <td>
          <div class="actions">
            <button class="btn-small blue" onclick="editarCliente(${cliente.serial})">
              <i class="material-icons">edit</i>
            </button>

            <button class="btn-small red" onclick="excluirCliente(${cliente.serial})">
              <i class="material-icons">delete</i>
            </button>
          </div>
        </td>
      `;

      tableBody.appendChild(row);
    });
  } catch (error) {
    M.toast({ html: 'Erro ao carregar clientes' });
  }
}

async function editarCliente(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    const cliente = await response.json();

    document.getElementById('clienteId').value = cliente.serial;
    document.getElementById('nome').value = cliente.nome;
    document.getElementById('cpf').value = cliente.cpf;
    document.getElementById('dataNascimento').value = cliente.data_nascimento?.split('T')[0];
    document.getElementById('endereco').value = cliente.endereco;
    document.getElementById('cidade').value = cliente.cidade;

    M.updateTextFields();

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  } catch (error) {
    M.toast({ html: 'Erro ao buscar cliente' });
  }
}

async function excluirCliente(id) {
  const confirmar = confirm('Deseja realmente excluir este cliente?');

  if (!confirmar) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.erro || 'Erro ao excluir cliente');
    }

    M.toast({ html: 'Cliente removido com sucesso!' });

    carregarClientes();
  } catch (error) {
    M.toast({ html: error.message });
  }
}

function limparFormulario() {
  form.reset();
  document.getElementById('clienteId').value = '';

  M.updateTextFields();
}

function formatarData(data) {
  if (!data) return '-';

  return new Date(data).toLocaleDateString('pt-BR');
}
