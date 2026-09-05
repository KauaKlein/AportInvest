const API_BASE = '/api';
const formatarMoeda = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
const formatarPorcentagem = (val) => `${(val || 0) >= 0 ? '+' : ''}${(val || 0).toFixed(2)}%`;
const CATEGORIAS = {
    ACOES: { nome: 'Ações', icon: '<i class="fas fa-arrow-trend-up"></i>', cssClass: 'cat-acoes', tipos: ['ACAO',] },
    FIIS: { nome: 'FIIs', icon: '<i class="fas fa-building"></i>', cssClass: 'cat-fiis', tipos: ['FII', 'FUNDO_IMOBILIARIO'] },
    CRIPTO: { nome: 'Criptomoedas', icon: '<i class="fab fa-bitcoin"></i>', cssClass: 'cat-cripto', tipos: ['CRIPTO'] },
    ETFS: { nome: 'ETFs Intern.', icon: '<i class="fas fa-layer-group"></i>', cssClass: 'cat-etfs', tipos: ['ETF'] },
    TESOURO: { nome: 'Tesouro Direto', icon: '<i class="fas fa-landmark"></i>', cssClass: 'cat-tesouro', tipos: ['IPCA'] },
    OUTROS: { nome: 'Outros', icon: '<i class="fas fa-wallet"></i>', cssClass: 'cat-outros', tipos: ['RENDA_FIXA', 'CDB', 'OUTRO'] }
};
const TIPO_LABELS = {
    IPCA: 'IPCA+',
    ACAO: 'Ações',
    FII: 'FIIs',
    CRIPTO: 'Criptomoedas',
    RENDA_FIXA: 'Renda Fixa',
    CDB: 'CDB',
    FUNDO_IMOBILIARIO: 'Fundo Imobiliário',

};
const CORES_PLANEJAMENTO = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#6366f1', '#14b8a6', '#f97316', '#84cc16'];
const app = {
    estado: {
        aportes: [],
        planejamento: {
            salario: 0,
            rendaExtra: 0,
            categorias: []
        },
        callbackConfirmacao: null,
        usuario: JSON.parse(localStorage.getItem('usuario_logado') || 'null')
    },
    iniciar() {
        this.configurarNavegacao();
        this.configurarFormularios();
        this.preencherSeletores();
        this.atualizarInterfaceUsuario();
        this.navegarPara('home');
    },
    alternarMenuLateral() {
        document.getElementById('sidebar').classList.toggle('open');
        document.getElementById('sidebar-overlay').classList.toggle('active');
    },
    fecharMenuLateral() {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebar-overlay').classList.remove('active');
    },
    configurarNavegacao() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.navegarPara(item.getAttribute('data-target'));
                this.fecharMenuLateral();
            });
        });
    },
    navegarPara(idSecao) {
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        const navItem = document.querySelector(`.nav-item[data-target="${idSecao}"]`);
        if (navItem) navItem.classList.add('active');
        document.querySelectorAll('.section').forEach(el => el.classList.remove('active'));
        const secao = document.getElementById(idSecao);
        if (secao) secao.classList.add('active');
        if (idSecao === 'home') this.carregarHome();
        if (idSecao === 'meus-ativos') this.carregarMeusAtivos();
        if (idSecao === 'planejador') this.carregarPlanejador();
    },
    configurarFormularios() {
        document.getElementById('form-ativo').addEventListener('submit', (e) => this.salvarAtivo(e));
        const formCad = document.getElementById('form-cadastro');
        if (formCad) {
            formCad.addEventListener('submit', (e) => this.cadastrarUsuario(e));
        }
        const formLog = document.getElementById('form-login');
        if (formLog) {
            formLog.addEventListener('submit', (e) => this.logarUsuario(e));
        }
        const formItemPlan = document.getElementById('form-item-planejamento');
        if (formItemPlan) {
            formItemPlan.addEventListener('submit', (e) => this.salvarItemPlanejamento(e));
        }
        const formCatPlan = document.getElementById('form-categoria-planejamento');
        if (formCatPlan) {
            formCatPlan.addEventListener('submit', (e) => this.salvarCategoriaPlanejamento(e));
        }
        document.getElementById('btn-confirmar-sim').addEventListener('click', () => {
            if (this.estado.callbackConfirmacao) this.estado.callbackConfirmacao();
            this.fecharModal('confirm');
        });
    },
    preencherSeletores() {
        const seletorTipo = document.getElementById('ativo-tipo');
        seletorTipo.innerHTML = '';
        Object.entries(TIPO_LABELS).forEach(([valor, rotulo]) => {
            seletorTipo.add(new Option(rotulo, valor));
        });
    },
    async chamarAPI(endpoint, opcoes = {}) {
        try {
            const resposta = await fetch(`${API_BASE}${endpoint}`, {
                headers: { 'Content-Type': 'application/json' },
                ...opcoes
            });
            if (resposta.status === 204) return null;
            const dados = await resposta.json().catch(() => null);
            if (!resposta.ok) {
                const msgErro = dados && dados.mensagem ? dados.mensagem : `HTTP ${resposta.status}`;
                this.mostrarAviso(msgErro, 'error');
                throw new Error(msgErro);
            }
            return dados;
        } catch (erro) {
            console.error(erro);
            throw erro;
        }
    },
    mostrarAviso(msg, tipo = 'success') {
        const container = document.getElementById('toast-container');
        const aviso = document.createElement('div');
        aviso.className = `toast ${tipo}`;
        aviso.textContent = msg;
        container.appendChild(aviso);
        setTimeout(() => {
            aviso.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => aviso.remove(), 300);
        }, 3000);
    },
    abrirModal(id) {
        document.getElementById('modal-overlay').classList.add('active');
        document.getElementById(`modal-${id}`).classList.add('active');
    },
    fecharModal(id) {
        document.getElementById(`modal-${id}`).classList.remove('active');
        const modaisAtivos = document.querySelectorAll('.modal.active');
        if (modaisAtivos.length === 0) {
            document.getElementById('modal-overlay').classList.remove('active');
        }
    },
    confirmarAcao(msg, callback) {
        document.getElementById('confirm-msg').textContent = msg;
        this.estado.callbackConfirmacao = callback;
        this.abrirModal('confirm');
    },
    obterCategoriaPorTipo(tipo) {
        for (const [chaveCat, defCat] of Object.entries(CATEGORIAS)) {
            if (defCat.tipos.includes(tipo)) return chaveCat;
        }
        return 'OUTROS';
    },
    agruparPorCategoria(aportes) {
        const grupos = {};
        for (const chaveCat of Object.keys(CATEGORIAS)) {
            grupos[chaveCat] = [];
        }
        aportes.forEach(a => {
            const cat = this.obterCategoriaPorTipo(a.tipo);
            grupos[cat].push(a);
        });
        return grupos;
    },
    calcularEstatisticasCategoria(aportes) {
        const totalInvestido = aportes.reduce((s, a) => s + (a.valorAportado || 0), 0);
        const totalAtual = aportes.reduce((s, a) => s + (a.valorAtual || a.valorAportado || 0), 0);
        const rentabilidade = totalInvestido > 0 ? ((totalAtual - totalInvestido) / totalInvestido) * 100 : 0;
        return { totalInvestido, totalAtual, numAtivos: aportes.length, rentabilidade };
    },
    carregarHome() {
        const heroBtn = document.getElementById('hero-btn-text');
        if (heroBtn) {
            heroBtn.textContent = this.estado.usuario ? 'Minha Carteira' : 'Fazer Login';
        }
    },
    async carregarMeusAtivos() {
        const boxDeslogado = document.getElementById('meus-ativos-deslogado');
        const boxLogado = document.getElementById('meus-ativos-logado');
        const btnNovo = document.getElementById('btn-novo-ativo');

        if (!this.estado.usuario) {
            this.estado.aportes = [];
            document.getElementById('ativos-count').textContent = '(0)';
            if (boxDeslogado) boxDeslogado.style.display = 'block';
            if (boxLogado) boxLogado.style.display = 'none';
            if (btnNovo) btnNovo.style.display = 'none';
            return;
        }

        if (boxDeslogado) boxDeslogado.style.display = 'none';
        if (boxLogado) boxLogado.style.display = 'block';
        if (btnNovo) btnNovo.style.display = 'inline-flex';

        try {
            const aportes = await this.chamarAPI(`/aportes?usuarioId=${this.estado.usuario.id}`);
            this.estado.aportes = aportes;
            document.getElementById('ativos-count').textContent = `(${aportes.length})`;
            const totalInvestido = aportes.reduce((s, a) => s + (a.valorAportado || 0), 0);
            const totalAtual = aportes.reduce((s, a) => s + (a.valorAtual || a.valorAportado || 0), 0);
            const rentabilidade = totalInvestido > 0 ? ((totalAtual - totalInvestido) / totalInvestido) * 100 : 0;
            document.getElementById('dash-total-investido').textContent = formatarMoeda(totalInvestido);
            document.getElementById('dash-valor-atual').textContent = formatarMoeda(totalAtual);
            document.getElementById('dash-rentabilidade').textContent = formatarPorcentagem(rentabilidade);
            document.getElementById('dash-rentabilidade').className = rentabilidade >= 0 ? 'text-green' : 'text-red';
            document.getElementById('dash-num-ativos').textContent = aportes.length;

            const grupos = this.agruparPorCategoria(aportes);
            const containerDist = document.getElementById('home-distribuicao');
            const htmlDist = Object.entries(grupos)
                .filter(([, itens]) => itens.length > 0)
                .map(([chaveCat, itens]) => {
                    const cat = CATEGORIAS[chaveCat];
                    const stats = this.calcularEstatisticasCategoria(itens);
                    const percentual = totalAtual > 0 ? ((stats.totalAtual / totalAtual) * 100).toFixed(1) : '0.0';
                    return `
                        <div class="distribuicao-item">
                            <div class="cat-info">
                                <div class="cat-icon ${cat.cssClass}">${cat.icon}</div>
                                <div>
                                    <div class="cat-name">${cat.nome}</div>
                                    <div class="cat-percent">${itens.length} ativo${itens.length > 1 ? 's' : ''} · ${percentual}%</div>
                                </div>
                            </div>
                            <div style="text-align:right">
                                <div class="cat-value">${formatarMoeda(stats.totalAtual)}</div>
                                <div class="cat-percent ${stats.rentabilidade >= 0 ? 'text-green' : 'text-red'}">${formatarPorcentagem(stats.rentabilidade)}</div>
                            </div>
                        </div>
                    `;
                }).join('');
            containerDist.innerHTML = htmlDist || '<div class="empty-state"><i class="fas fa-chart-pie"></i><p>Nenhum ativo cadastrado</p></div>';

            const recentes = [...aportes]
                .sort((a, b) => (b.id || 0) - (a.id || 0))
                .slice(0, 5);
            const tbody = document.querySelector('#table-recentes tbody');
            tbody.innerHTML = recentes.length ? recentes.map(a => {
                const saldo = (a.valorAtual || a.valorAportado || 0);
                return `
                    <tr>
                        <td><span class="ativo-nome">${a.nome}</span></td>
                        <td><span class="badge badge-blue">${TIPO_LABELS[a.tipo] || a.tipo}</span></td>
                        <td>${a.quantidade || 0}</td>
                        <td>${formatarMoeda(a.precoUnitario || 0)}</td>
                        <td><strong>${formatarMoeda(saldo)}</strong></td>
                    </tr>
                `;
            }).join('') : '<tr><td colspan="5" class="empty-state">Nenhum ativo cadastrado</td></tr>';

            const totalGeralAtual = aportes.reduce((s, a) => s + (a.valorAtual || a.valorAportado || 0), 0);
            const container = document.getElementById('categorias-container');
            const html = Object.entries(grupos)
                .filter(([, itens]) => itens.length > 0)
                .map(([chaveCat, itens]) => {
                    const cat = CATEGORIAS[chaveCat];
                    const stats = this.calcularEstatisticasCategoria(itens);
                    const percentualCarteira = totalGeralAtual > 0
                        ? ((stats.totalAtual / totalGeralAtual) * 100).toFixed(0)
                        : '0';
                    const linhasAtivos = itens.map(a => {
                        const saldoCalc = a.valorAtual || a.valorAportado || 0;
                        return `
                            <tr>
                                <td><span class="ativo-nome">${a.nome}</span></td>
                                <td>${a.quantidade || 0}</td>
                                <td>${formatarMoeda(a.precoUnitario || 0)}</td>
                                <td><strong>${formatarMoeda(saldoCalc)}</strong></td>
                                <td>${a.precoTeto ? formatarMoeda(a.precoTeto) : '-'}</td>
                                <td>${a.precoDesejavel ? formatarMoeda(a.precoDesejavel) : '-'}</td>
                                <td class="ativo-actions">
                                    <button class="btn-icon" title="Editar" onclick="app.editarAtivo(${a.id})"><i class="fas fa-pen"></i></button>
                                    <button class="btn-icon" title="Excluir" onclick="app.excluirAtivo(${a.id})"><i class="fas fa-trash"></i></button>
                                </td>
                            </tr>
                        `;
                    }).join('');
                    return `
                        <div class="categoria-card" id="cat-${chaveCat}">
                            <div class="categoria-header" onclick="app.alternarCategoria('${chaveCat}')">
                                <div class="categoria-icon ${cat.cssClass}">${cat.icon}</div>
                                <div class="categoria-nome">${cat.nome}</div>
                                <div class="categoria-stats">
                                    <div class="categoria-stat">
                                        <div class="stat-label">Ativos</div>
                                        <div class="stat-value">${itens.length}</div>
                                    </div>
                                    <div class="categoria-stat">
                                        <div class="stat-label">Valor total</div>
                                        <div class="stat-value">${formatarMoeda(stats.totalAtual)}</div>
                                    </div>
                                    <div class="categoria-stat">
                                        <div class="stat-label">Rentabilidade</div>
                                        <div class="stat-value ${stats.rentabilidade >= 0 ? 'text-green' : 'text-red'}">${formatarPorcentagem(stats.rentabilidade)}</div>
                                    </div>
                                    <div class="categoria-stat">
                                        <div class="stat-label">% na carteira</div>
                                        <div class="stat-value">${percentualCarteira}%</div>
                                    </div>
                                </div>
                                <span class="categoria-mobile-stats">
                                    <span class="ms-value">${itens.length}</span> · <span class="ms-value">${formatarMoeda(stats.totalAtual)}</span>
                                </span>
                                <i class="fas fa-chevron-down categoria-chevron"></i>
                            </div>
                            <div class="categoria-body">
                                <div class="categoria-body-inner">
                                    <table class="ativos-table">
                                        <thead>
                                            <tr>
                                                <th>Ativo</th>
                                                <th>Quant.</th>
                                                <th>Preço Médio</th>
                                                <th>Saldo</th>
                                                <th>Preço Teto</th>
                                                <th>Preço Desejável</th>
                                                <th>Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${linhasAtivos}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            container.innerHTML = html || `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <p>Nenhum ativo cadastrado ainda.</p>
                    <p style="margin-top:8px;"><button class="btn btn-primary" onclick="app.abrirModalNovoAtivo()"><i class="fas fa-plus"></i> Adicionar Ativo</button></p>
                </div>
            `;
        } catch (erro) {
            console.error('Erro ao carregar ativos:', erro);
        }
    },
    alternarCategoria(chaveCat) {
        const cartao = document.getElementById(`cat-${chaveCat}`);
        cartao.classList.toggle('open');
    },
    abrirModalNovoAtivo() {
        if (!this.estado.usuario) {
            this.mostrarAviso('Faça login primeiro para cadastrar um ativo!', 'error');
            this.navegarPara('login');
            return;
        }
        document.getElementById('form-ativo').reset();
        document.getElementById('ativo-id').value = '';
        document.getElementById('ativo-modal-title').textContent = 'Novo Ativo';
        this.abrirModal('ativo');
    },
    async editarAtivo(id) {
        try {
            const ativo = await this.chamarAPI(`/aportes/${id}`);
            document.getElementById('ativo-id').value = ativo.id;
            document.getElementById('ativo-nome').value = ativo.nome;
            document.getElementById('ativo-tipo').value = ativo.tipo;
            document.getElementById('ativo-quantidade').value = ativo.quantidade || '';
            document.getElementById('ativo-precoMedio').value = ativo.precoUnitario || '';
            document.getElementById('ativo-precoTeto').value = ativo.precoTeto || '';
            document.getElementById('ativo-precoDesejavel').value = ativo.precoDesejavel || '';
            document.getElementById('ativo-modal-title').textContent = 'Editar Ativo';
            this.abrirModal('ativo');
        } catch (erro) {
            console.error('Erro ao editar:', erro);
        }
    },
    async salvarAtivo(e) {
        e.preventDefault();
        if (!this.estado.usuario) {
            this.mostrarAviso('Faça login para salvar o ativo!', 'error');
            this.navegarPara('login');
            return;
        }

        const id = document.getElementById('ativo-id').value;
        const quantidade = parseFloat(document.getElementById('ativo-quantidade').value) || 0;
        const precoMedio = parseFloat(document.getElementById('ativo-precoMedio').value) || 0;
        const valorTotal = quantidade * precoMedio;
        const dados = {
            nome: document.getElementById('ativo-nome').value,
            tipo: document.getElementById('ativo-tipo').value,
            quantidade: quantidade,
            precoUnitario: precoMedio,
            valorAportado: valorTotal > 0 ? valorTotal : 0.01,
            valorAtual: valorTotal > 0 ? valorTotal : 0.01,
            dataAporte: new Date().toISOString().split('T')[0],
            precoTeto: parseFloat(document.getElementById('ativo-precoTeto').value) || null,
            precoDesejavel: parseFloat(document.getElementById('ativo-precoDesejavel').value) || null,
            usuario: { id: this.estado.usuario.id }
        };
        try {
            const metodo = id ? 'PUT' : 'POST';
            const url = id ? `/aportes/${id}` : '/aportes';
            await this.chamarAPI(url, { method: metodo, body: JSON.stringify(dados) });
            this.fecharModal('ativo');
            this.mostrarAviso(id ? 'Ativo atualizado!' : 'Ativo adicionado!');
            this.carregarMeusAtivos();
        } catch (erro) {
            console.error('Erro ao salvar:', erro);
        }
    },
    excluirAtivo(id) {
        this.confirmarAcao('Tem certeza que deseja excluir este ativo?', async () => {
            try {
                await this.chamarAPI(`/aportes/${id}`, { method: 'DELETE' });
                this.mostrarAviso('Ativo excluído');
                this.carregarMeusAtivos();
            } catch (erro) {
                console.error('Erro ao excluir:', erro);
            }
        });
    },
    async cadastrarUsuario(e) {
        e.preventDefault();
        const dados = {
            nome: document.getElementById('cad-nome').value,
            email: document.getElementById('cad-email').value,
            telefone: document.getElementById('cad-telefone').value,
            senha: document.getElementById('cad-senha').value
        };
        try {
            await this.chamarAPI('/usuarios/cadastro', {
                method: 'POST',
                body: JSON.stringify(dados)
            });
            this.mostrarAviso('Usuário cadastrado com sucesso!', 'success');
            document.getElementById('form-cadastro').reset();
            setTimeout(() => this.navegarPara('login'), 1200);
        } catch (erro) {
            console.error('Erro no cadastro:', erro);
        }
    },
    async logarUsuario(e) {
        e.preventDefault();
        const dados = {
            login: document.getElementById('login-usuario').value,
            senha: document.getElementById('login-senha').value
        };
        try {
            const usuario = await this.chamarAPI('/usuarios/login', {
                method: 'POST',
                body: JSON.stringify(dados)
            });
            this.estado.usuario = usuario;
            localStorage.setItem('usuario_logado', JSON.stringify(usuario));
            this.mostrarAviso(`Bem-vindo(a), ${usuario.nome}!`, 'success');
            document.getElementById('form-login').reset();
            this.atualizarInterfaceUsuario();
            setTimeout(() => this.navegarPara('home'), 1000);
        } catch (erro) {
            console.error('Erro no login:', erro);
        }
    },
    deslogar() {
        this.estado.usuario = null;
        localStorage.removeItem('usuario_logado');
        this.atualizarInterfaceUsuario();
        this.mostrarAviso('Você saiu da sua conta', 'info');
        this.navegarPara('home');
    },
    atualizarInterfaceUsuario() {
        const box = document.getElementById('usuario-logado-box');
        const navLogin = document.getElementById('nav-login');
        const nomeLabel = document.getElementById('usuario-logado-nome');
        if (this.estado.usuario) {
            if (box) box.style.display = 'block';
            if (navLogin) navLogin.style.display = 'none';
            if (nomeLabel) nomeLabel.textContent = `Olá, ${this.estado.usuario.nome}`;
        } else {
            if (box) box.style.display = 'none';
            if (navLogin) navLogin.style.display = 'flex';
        }
    },
    async carregarPlanejador() {
        const boxDeslogado = document.getElementById('planejador-deslogado');
        const boxLogado = document.getElementById('planejador-logado');
        const btnNovo = document.getElementById('btn-novo-planejamento');
        const btnNovaCat = document.getElementById('btn-nova-cat-planejamento');
        if (!this.estado.usuario) {
            if (boxDeslogado) boxDeslogado.style.display = 'block';
            if (boxLogado) boxLogado.style.display = 'none';
            if (btnNovo) btnNovo.style.display = 'none';
            if (btnNovaCat) btnNovaCat.style.display = 'none';
            return;
        }
        if (boxDeslogado) boxDeslogado.style.display = 'none';
        if (boxLogado) boxLogado.style.display = 'block';
        if (btnNovo) btnNovo.style.display = 'inline-flex';
        if (btnNovaCat) btnNovaCat.style.display = 'inline-flex';

        try {
            const dados = await this.chamarAPI(`/planejamento?usuarioId=${this.estado.usuario.id}`);
            this.estado.planejamento = dados || { salario: 0, rendaExtra: 0, categorias: [] };
        } catch (erro) {
            console.error('Erro ao buscar dados do planejador na nuvem:', erro);
            this.estado.planejamento = { salario: 0, rendaExtra: 0, categorias: [] };
        }

        this.renderizarPlanejamento();
    },
    async atualizarSalarioPlanejamento() {
        if (!this.estado.usuario) return;
        const inputSalario = document.getElementById('input-salario-mensal');
        const inputExtra = document.getElementById('input-renda-extra');
        const novoSalario = parseFloat(inputSalario ? inputSalario.value : 0) || 0;
        const novaRendaExtra = parseFloat(inputExtra ? inputExtra.value : 0) || 0;

        if (novoSalario < 0 || novaRendaExtra < 0) {
            this.mostrarAviso('Por favor, informe valores válidos maiores ou iguais a zero.', 'error');
            return;
        }

        try {
            const res = await this.chamarAPI(`/planejamento/rendas?usuarioId=${this.estado.usuario.id}`, {
                method: 'PUT',
                body: JSON.stringify({ salario: novoSalario, rendaExtra: novaRendaExtra })
            });
            if (res) {
                this.estado.planejamento.salario = res.salario;
                this.estado.planejamento.rendaExtra = res.rendaExtra;
            }
            this.mostrarAviso('Salário e Renda Extra salvos na nuvem!', 'success');
            this.renderizarPlanejamento();
        } catch (erro) {
            console.error('Erro ao atualizar rendas:', erro);
        }
    },
    abrirModalNovoItemPlanejamento(categoriaIdPreferencial = null) {
        const categorias = this.estado.planejamento.categorias || [];
        if (categorias.length === 0) {
            this.mostrarAviso('Adicione primeiro uma categoria para alocar os gastos.', 'info');
            this.abrirModalNovaCategoriaPlanejamento();
            return;
        }
        document.getElementById('form-item-planejamento').reset();
        document.getElementById('plan-item-id').value = '';
        document.getElementById('plan-item-qtd').value = '1';
        document.getElementById('plan-item-parcelas').value = '1';
        document.getElementById('plan-item-modal-title').textContent = 'Novo Campo / Gasto / Aporte';

        const selCat = document.getElementById('plan-item-categoria');
        selCat.innerHTML = '';
        categorias.forEach(cat => {
            const opt = new Option(`${cat.nome} (${cat.percent}%)`, cat.id);
            if (categoriaIdPreferencial && String(cat.id) === String(categoriaIdPreferencial)) {
                opt.selected = true;
            }
            selCat.add(opt);
        });

        this.atualizarPreviewItemPlanejamento();
        this.abrirModal('item-planejamento');
    },
    abrirModalEditarItemPlanejamento(categoriaId, itemId) {
        const categorias = this.estado.planejamento.categorias || [];
        const cat = categorias.find(c => String(c.id) === String(categoriaId));
        if (!cat) return;
        const item = (cat.itens || []).find(i => String(i.id) === String(itemId));
        if (!item) return;

        document.getElementById('plan-item-id').value = `${categoriaId}::${itemId}`;
        document.getElementById('plan-item-nome').value = item.nome;
        document.getElementById('plan-item-qtd').value = item.quantidade || 1;
        document.getElementById('plan-item-valor').value = item.valor || '';
        document.getElementById('plan-item-parcelas').value = item.parcelas || 1;
        document.getElementById('plan-item-modal-title').textContent = 'Editar Campo / Gasto';

        const selCat = document.getElementById('plan-item-categoria');
        selCat.innerHTML = '';
        categorias.forEach(c => {
            const opt = new Option(`${c.nome} (${c.percent}%)`, c.id);
            if (String(c.id) === String(categoriaId)) opt.selected = true;
            selCat.add(opt);
        });

        this.atualizarPreviewItemPlanejamento();
        this.abrirModal('item-planejamento');
    },
    atualizarPreviewItemPlanejamento() {
        const qtd = parseFloat(document.getElementById('plan-item-qtd').value) || 0;
        const valor = parseFloat(document.getElementById('plan-item-valor').value) || 0;
        const parcelas = parseInt(document.getElementById('plan-item-parcelas').value, 10) || 1;
        const elPreview = document.getElementById('plan-item-preview');
        if (!elPreview) return;

        const gastoMensal = qtd * valor;
        if (parcelas > 1) {
            const totalCompra = gastoMensal * parcelas;
            elPreview.innerHTML = `
                <div>Gasto neste mês: <strong class="text-blue" style="font-size: 15px;">${formatarMoeda(gastoMensal)}</strong></div>
                <div style="font-size: 12px; color: var(--text-secondary); margin-top: 3px;">
                    <i class="fas fa-credit-card"></i> Compra parcelada em <strong>${parcelas}x</strong> de ${formatarMoeda(valor)} ${qtd > 1 ? `(${qtd} un.)` : ''} · Total: <strong>${formatarMoeda(totalCompra)}</strong>
                </div>
            `;
        } else {
            elPreview.innerHTML = `
                <div>Gasto neste mês: <strong class="text-blue" style="font-size: 15px;">${formatarMoeda(gastoMensal)}</strong></div>
                <div style="font-size: 12px; color: var(--text-secondary); margin-top: 3px;">
                    <i class="fas fa-coins"></i> À vista / aporte único no mês · ${qtd} un. x ${formatarMoeda(valor)}
                </div>
            `;
        }
    },
    async salvarItemPlanejamento(e) {
        e.preventDefault();
        if (!this.estado.usuario) return;
        const idFull = document.getElementById('plan-item-id').value;
        const categoriaId = document.getElementById('plan-item-categoria').value;
        const nome = document.getElementById('plan-item-nome').value.trim();
        const qtd = parseFloat(document.getElementById('plan-item-qtd').value) || 1;
        const valor = parseFloat(document.getElementById('plan-item-valor').value) || 0;
        const parcelas = parseInt(document.getElementById('plan-item-parcelas').value, 10) || 1;

        if (!nome) {
            this.mostrarAviso('Informe o nome do item/gasto.', 'error');
            return;
        }
        if (valor <= 0) {
            this.mostrarAviso('Informe um valor válido maior que zero.', 'error');
            return;
        }

        let itemId = null;
        if (idFull) {
            const parts = idFull.split('::');
            itemId = parts[1] ? Number(parts[1]) : null;
        }

        const payload = {
            id: itemId,
            categoriaId: Number(categoriaId),
            nome: nome,
            quantidade: qtd,
            valor: valor,
            parcelas: parcelas
        };

        try {
            await this.chamarAPI(`/planejamento/itens?usuarioId=${this.estado.usuario.id}`, {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            this.mostrarAviso(itemId ? 'Item atualizado na nuvem!' : `"${nome}" salvo na nuvem!`, 'success');
            this.fecharModal('item-planejamento');
            await this.carregarPlanejador();
        } catch (erro) {
            console.error('Erro ao salvar item:', erro);
        }
    },
    async alternarStatusItemPlanejamento(categoriaId, itemId) {
        if (!this.estado.usuario) return;
        try {
            const salvo = await this.chamarAPI(`/planejamento/itens/${itemId}/status?usuarioId=${this.estado.usuario.id}`, {
                method: 'PATCH'
            });
            if (salvo && salvo.concluido) {
                this.mostrarAviso(`${salvo.nome} salvo com sucesso!`, 'success');
            }
            await this.carregarPlanejador();
        } catch (erro) {
            console.error('Erro ao alternar status do item:', erro);
        }
    },
    removerItemPlanejamento(categoriaId, itemId) {
        if (!this.estado.usuario) return;
        this.confirmarAcao('Deseja excluir este item/gasto da nuvem?', async () => {
            try {
                await this.chamarAPI(`/planejamento/itens/${itemId}?usuarioId=${this.estado.usuario.id}`, {
                    method: 'DELETE'
                });
                this.mostrarAviso('Item excluído da nuvem!', 'info');
                await this.carregarPlanejador();
            } catch (erro) {
                console.error('Erro ao remover item:', erro);
            }
        });
    },
    abrirModalNovaCategoriaPlanejamento() {
        document.getElementById('form-categoria-planejamento').reset();
        document.getElementById('plan-cat-id').value = '';
        document.getElementById('plan-cat-modal-title').textContent = 'Nova Categoria / Divisão';
        this.abrirModal('categoria-planejamento');
    },
    abrirModalEditarCategoriaPlanejamento(catId) {
        const cat = (this.estado.planejamento.categorias || []).find(c => String(c.id) === String(catId));
        if (!cat) return;
        document.getElementById('plan-cat-id').value = cat.id;
        document.getElementById('plan-cat-nome').value = cat.nome;
        document.getElementById('plan-cat-percent').value = cat.percent;
        document.getElementById('plan-cat-modal-title').textContent = 'Editar Categoria';
        this.abrirModal('categoria-planejamento');
    },
    async salvarCategoriaPlanejamento(e) {
        e.preventDefault();
        if (!this.estado.usuario) return;
        const id = document.getElementById('plan-cat-id').value;
        const nome = document.getElementById('plan-cat-nome').value.trim();
        const percent = parseFloat(document.getElementById('plan-cat-percent').value) || 0;

        if (!nome) {
            this.mostrarAviso('Informe o nome da categoria.', 'error');
            return;
        }
        if (percent <= 0 || percent > 100) {
            this.mostrarAviso('A porcentagem deve estar entre 0.1% e 100%.', 'error');
            return;
        }

        const payload = {
            id: id ? Number(id) : null,
            nome: nome,
            percent: percent
        };

        try {
            await this.chamarAPI(`/planejamento/categorias?usuarioId=${this.estado.usuario.id}`, {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            this.mostrarAviso(id ? 'Categoria atualizada na nuvem!' : 'Nova categoria salva na nuvem!', 'success');
            this.fecharModal('categoria-planejamento');
            await this.carregarPlanejador();
        } catch (erro) {
            console.error('Erro ao salvar categoria:', erro);
        }
    },
    removerCategoriaPlanejamento(catId) {
        if (!this.estado.usuario) return;
        this.confirmarAcao('Deseja excluir esta categoria e todos os seus itens da nuvem?', async () => {
            try {
                await this.chamarAPI(`/planejamento/categorias/${catId}?usuarioId=${this.estado.usuario.id}`, {
                    method: 'DELETE'
                });
                this.mostrarAviso('Categoria removida da nuvem!', 'info');
                await this.carregarPlanejador();
            } catch (erro) {
                console.error('Erro ao remover categoria:', erro);
            }
        });
    },
    alternarCategoriaPlanejador(catId) {
        const card = document.getElementById(`plan-cat-card-${catId}`);
        if (card) {
            card.classList.toggle('open');
        }
    },
    renderizarPlanejamento() {
        const dados = this.estado.planejamento || { salario: 0, rendaExtra: 0, categorias: [] };
        const salario = parseFloat(dados.salario) || 0;
        const rendaExtra = parseFloat(dados.rendaExtra) || 0;
        const rendaTotal = salario + rendaExtra;
        const categorias = dados.categorias || [];

        const inputSalario = document.getElementById('input-salario-mensal');
        if (inputSalario) inputSalario.value = salario > 0 ? salario : '';
        const inputExtra = document.getElementById('input-renda-extra');
        if (inputExtra) inputExtra.value = rendaExtra > 0 ? rendaExtra : '';

        const totalPercent = categorias.reduce((s, c) => s + (parseFloat(c.percent) || 0), 0);
        const todosItens = categorias.flatMap(c => (c.itens || []).map(i => ({ ...i, catId: c.id })));
        const totalItens = todosItens.length;
        const itensConcluidos = todosItens.filter(i => i.concluido);
        const totalExecutado = itensConcluidos.reduce((s, i) => s + (i.quantidade * i.valor), 0);

        const elSalarioDisplay = document.getElementById('plan-salario-display');
        const elTotalAlocado = document.getElementById('plan-total-alocado');
        const elTotalExecutado = document.getElementById('plan-total-executado');
        const elMetasConcluidas = document.getElementById('plan-metas-concluidas');

        if (elSalarioDisplay) {
            if (rendaExtra > 0) {
                elSalarioDisplay.innerHTML = `
                    <span>${formatarMoeda(rendaTotal)}</span>
                    <div style="font-size: 11px; font-weight: 500; color: var(--text-secondary); margin-top: 2px;">
                        Salário: ${formatarMoeda(salario)} | Extra: ${formatarMoeda(rendaExtra)}
                    </div>
                `;
            } else {
                elSalarioDisplay.textContent = formatarMoeda(salario);
            }
        }
        if (elTotalAlocado) {
            elTotalAlocado.textContent = `${totalPercent.toFixed(1)}%`;
            elTotalAlocado.className = totalPercent > 100 ? 'text-red' : (totalPercent === 100 ? 'text-green' : 'text-purple');
        }
        if (elTotalExecutado) elTotalExecutado.textContent = formatarMoeda(totalExecutado);
        if (elMetasConcluidas) elMetasConcluidas.textContent = `${itensConcluidos.length} / ${totalItens}`;

        const elAlertBadge = document.getElementById('plan-alert-badge');
        if (elAlertBadge) {
            if (totalPercent > 100) {
                elAlertBadge.innerHTML = `<span class="badge badge-red" style="font-size: 13px; padding: 6px 12px;"><i class="fas fa-exclamation-triangle"></i> Soma: ${totalPercent.toFixed(1)}% (Excede 100%)</span>`;
            } else if (totalPercent === 100) {
                elAlertBadge.innerHTML = `<span class="badge badge-green" style="font-size: 13px; padding: 6px 12px;"><i class="fas fa-check-double"></i> 100% Alocado com perfeição!</span>`;
            } else {
                const restante = 100 - totalPercent;
                elAlertBadge.innerHTML = `<span class="badge badge-blue" style="font-size: 13px; padding: 6px 12px;"><i class="fas fa-info-circle"></i> ${restante.toFixed(1)}% livre para alocar</span>`;
            }
        }

        const elStatusBadge = document.getElementById('plan-status-badge');
        if (elStatusBadge) {
            elStatusBadge.textContent = `${totalPercent.toFixed(1)}% Definido`;
            elStatusBadge.className = `badge ${totalPercent === 100 ? 'badge-green' : (totalPercent > 100 ? 'badge-red' : 'badge-blue')}`;
        }

        const elProgressBar = document.getElementById('plan-progress-bar');
        const elLegendas = document.getElementById('plan-legendas');
        if (elProgressBar && elLegendas) {
            if (categorias.length === 0) {
                elProgressBar.innerHTML = '<div style="flex: 1; background: var(--border-color); border-radius: 999px;"></div>';
                elLegendas.innerHTML = '<span style="font-size: 12px; color: var(--text-secondary);">Nenhuma categoria cadastrada ainda.</span>';
            } else {
                let barHtml = '';
                let legendasHtml = '';
                categorias.forEach((cat, idx) => {
                    const cor = CORES_PLANEJAMENTO[idx % CORES_PLANEJAMENTO.length];
                    const valorSugerido = (rendaTotal * cat.percent) / 100;
                    barHtml += `<div class="plan-progress-segment" style="width: ${cat.percent}%; background-color: ${cor};" title="${cat.nome}: ${cat.percent}% (${formatarMoeda(valorSugerido)})"></div>`;
                    legendasHtml += `
                        <div style="display: flex; align-items: center; gap: 6px; font-size: 12.5px;">
                            <span class="plan-color-dot" style="background-color: ${cor};"></span>
                            <strong>${cat.nome}:</strong>
                            <span style="color: var(--text-secondary);">${cat.percent}% (${formatarMoeda(valorSugerido)})</span>
                        </div>
                    `;
                });
                elProgressBar.innerHTML = barHtml;
                elLegendas.innerHTML = legendasHtml;
            }
        }

        const elLista = document.getElementById('plan-categorias-lista');
        if (elLista) {
            if (categorias.length === 0) {
                elLista.innerHTML = `
                    <div style="text-align: center; padding: 32px 16px; color: var(--text-secondary);">
                        <i class="fas fa-folder-open" style="font-size: 32px; margin-bottom: 10px; opacity: 0.5;"></i>
                        <p style="font-size: 14px;">Nenhuma categoria adicionada. Clique em <strong>"Nova Categoria"</strong> para começar a dividir sua renda!</p>
                    </div>
                `;
            } else {
                elLista.innerHTML = categorias.map((cat, idx) => {
                    const cor = CORES_PLANEJAMENTO[idx % CORES_PLANEJAMENTO.length];
                    const valorSugerido = (rendaTotal * cat.percent) / 100;
                    const itensCat = cat.itens || [];
                    const gastoTotalCat = itensCat.reduce((acc, i) => acc + (i.quantidade * i.valor), 0);
                    const saldoRestante = valorSugerido - gastoTotalCat;
                    const concluidosCat = itensCat.filter(i => i.concluido).length;

                    const linhasTabela = itensCat.length === 0 ? `
                        <tr>
                            <td colspan="7" style="text-align: center; color: var(--text-secondary); padding: 20px;">
                                Nenhum item ou gasto cadastrado nesta categoria.
                                <button class="btn btn-secondary" style="font-size: 11.5px; padding: 4px 10px; margin-left: 8px;" onclick="app.abrirModalNovoItemPlanejamento('${cat.id}')">
                                    <i class="fas fa-plus"></i> Adicionar Item
                                </button>
                            </td>
                        </tr>
                    ` : itensCat.map(item => {
                        const gastoMes = item.quantidade * item.valor;
                        const parcelasText = item.parcelas > 1 
                            ? `<span class="badge badge-purple" title="Parcela mensal">${item.parcelas}x</span> <span style="font-size: 11.5px; color: var(--text-secondary); margin-left: 4px;">(Total: ${formatarMoeda(gastoMes * item.parcelas)})</span>`
                            : `<span class="badge badge-gray">À vista</span>`;
                        const rowStyle = item.concluido ? 'background: rgba(16, 185, 129, 0.04);' : '';
                        const textStrike = item.concluido ? 'text-decoration: line-through; color: var(--text-secondary);' : 'font-weight: 700; color: var(--text-primary);';

                        return `
                            <tr style="${rowStyle}">
                                <td style="width: 40px; text-align: center;">
                                    <input type="checkbox" class="plan-checkbox" ${item.concluido ? 'checked' : ''} onchange="app.alternarStatusItemPlanejamento('${cat.id}', '${item.id}')" title="Marcar como concluído / aportado">
                                </td>
                                <td>
                                    <span style="${textStrike}">${item.nome}</span>
                                    ${item.concluido ? '<span class="badge badge-green" style="margin-left: 6px; font-size: 10.5px;"><i class="fas fa-check"></i> Concluído</span>' : ''}
                                </td>
                                <td>${item.quantidade}</td>
                                <td>${formatarMoeda(item.valor)}</td>
                                <td>${parcelasText}</td>
                                <td><strong class="${item.concluido ? 'text-green' : 'text-blue'}">${formatarMoeda(gastoMes)}</strong></td>
                                <td class="ativo-actions">
                                    <button class="btn-icon" title="Editar Item" onclick="app.abrirModalEditarItemPlanejamento('${cat.id}', '${item.id}')"><i class="fas fa-pen"></i></button>
                                    <button class="btn-icon" style="color: var(--color-red);" title="Excluir Item" onclick="app.removerItemPlanejamento('${cat.id}', '${item.id}')"><i class="fas fa-trash"></i></button>
                                </td>
                            </tr>
                        `;
                    }).join('');

                    return `
                        <div class="categoria-card" id="plan-cat-card-${cat.id}">
                            <div class="categoria-header" onclick="app.alternarCategoriaPlanejador('${cat.id}')">
                                <div class="categoria-icon" style="background: ${cor}18; color: ${cor}; border: 1px solid ${cor}30;">
                                    <i class="fas fa-layer-group"></i>
                                </div>
                                <div class="categoria-nome">
                                    ${cat.nome}
                                    <span class="badge badge-blue" style="margin-left: 6px; font-size: 11px;">${cat.percent}%</span>
                                </div>
                                <div class="categoria-stats">
                                    <div class="categoria-stat">
                                        <div class="stat-label">Itens / Metas</div>
                                        <div class="stat-value">${concluidosCat} / ${itensCat.length}</div>
                                    </div>
                                    <div class="categoria-stat">
                                        <div class="stat-label">Valor Sugerido</div>
                                        <div class="stat-value text-blue">${formatarMoeda(valorSugerido)}</div>
                                    </div>
                                    <div class="categoria-stat">
                                        <div class="stat-label">Gasto no Mês</div>
                                        <div class="stat-value">${formatarMoeda(gastoTotalCat)}</div>
                                    </div>
                                    <div class="categoria-stat">
                                        <div class="stat-label">Saldo Restante</div>
                                        <div class="stat-value ${saldoRestante >= 0 ? 'text-green' : 'text-red'}">${formatarMoeda(saldoRestante)}</div>
                                    </div>
                                </div>
                                <div class="categoria-mobile-stats">
                                    <div><span style="color: var(--text-secondary);">Sugerido:</span> <span class="ms-value text-blue">${formatarMoeda(valorSugerido)}</span></div>
                                    <div><span style="color: var(--text-secondary);">Gasto:</span> <span class="ms-value">${formatarMoeda(gastoTotalCat)}</span></div>
                                    <div><span style="color: var(--text-secondary);">Saldo:</span> <span class="ms-value ${saldoRestante >= 0 ? 'text-green' : 'text-red'}">${formatarMoeda(saldoRestante)}</span></div>
                                </div>
                                <div style="display: flex; align-items: center; gap: 6px; margin-right: 10px;" onclick="event.stopPropagation()">
                                    <button class="btn-icon" title="Editar Categoria" onclick="app.abrirModalEditarCategoriaPlanejamento('${cat.id}')"><i class="fas fa-pen"></i></button>
                                    <button class="btn-icon" style="color: var(--color-red);" title="Excluir Categoria" onclick="app.removerCategoriaPlanejamento('${cat.id}')"><i class="fas fa-trash"></i></button>
                                </div>
                                <div class="categoria-chevron"><i class="fas fa-chevron-down"></i></div>
                            </div>
                            <div class="categoria-body">
                                <div class="categoria-body-inner">
                                    <table class="ativos-table">
                                        <thead>
                                            <tr>
                                                <th style="width: 40px; text-align: center;"><i class="fas fa-check"></i></th>
                                                <th>Item</th>
                                                <th>Quant.</th>
                                                <th>Valor Unit.</th>
                                                <th>Parcelas</th>
                                                <th>Gasto no Mês</th>
                                                <th>Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${linhasTabela}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }
    }
};
document.addEventListener('DOMContentLoaded', () => app.iniciar());
