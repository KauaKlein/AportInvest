const API_BASE = '/api';
const formatarMoeda = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
const formatarPorcentagem = (val) => `${(val || 0) >= 0 ? '+' : ''}${(val || 0).toFixed(2)}%`;
const CATEGORIAS = {
    ACOES: { nome: 'Ações', icon: 'S', cssClass: 'cat-acoes', tipos: ['ACAO', 'BDR'] },
    FIIS: { nome: 'FIIs', icon: '🏢', cssClass: 'cat-fiis', tipos: ['FII', 'FUNDO_IMOBILIARIO'] },
    CRIPTO: { nome: 'Criptomoedas', icon: '₿', cssClass: 'cat-cripto', tipos: ['CRIPTO'] },
    ETFS: { nome: 'ETFs Intern.', icon: 'ETF', cssClass: 'cat-etfs', tipos: ['ETF'] },
    TESOURO: { nome: 'Tesouro Direto', icon: '🏛️', cssClass: 'cat-tesouro', tipos: ['TESOURO_SELIC', 'TESOURO_PREFIXADO', 'IPCA_PLUS'] },
    OUTROS: { nome: 'Outros', icon: '📦', cssClass: 'cat-outros', tipos: ['RENDA_FIXA', 'CDB', 'LCI_LCA', 'DEBENTURE', 'PREVIDENCIA', 'OUTRO'] }
};
const TIPO_LABELS = {
    IPCA_PLUS: 'IPCA+', ACAO: 'Ações', FII: 'FIIs', CRIPTO: 'Criptomoedas',
    RENDA_FIXA: 'Renda Fixa', TESOURO_SELIC: 'Tesouro Selic',
    TESOURO_PREFIXADO: 'Tesouro Prefixado', CDB: 'CDB', LCI_LCA: 'LCI/LCA',
    FUNDO_IMOBILIARIO: 'Fundo Imobiliário', ETF: 'ETF', BDR: 'BDR',
    DEBENTURE: 'Debênture', PREVIDENCIA: 'Previdência', OUTRO: 'Outro'
};
const app = {
    estado: {
        aportes: [],
        callbackConfirmacao: null
    },
    iniciar() {
        this.configurarNavegacao();
        this.configurarFormularios();
        this.preencherSeletores();
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
    },
    configurarFormularios() {
        document.getElementById('form-ativo').addEventListener('submit', (e) => this.salvarAtivo(e));
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
            if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
            if (resposta.status === 204) return null;
            return await resposta.json();
        } catch (erro) {
            console.error(erro);
            this.mostrarAviso('Erro ao processar requisição', 'error');
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
    async carregarHome() {
        try {
            const aportes = await this.chamarAPI('/aportes');
            this.estado.aportes = aportes;
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
        } catch (erro) {
            console.error('Erro ao carregar home:', erro);
        }
    },
    async carregarMeusAtivos() {
        try {
            const aportes = await this.chamarAPI('/aportes');
            this.estado.aportes = aportes;
            document.getElementById('ativos-count').textContent = `(${aportes.length})`;
            const grupos = this.agruparPorCategoria(aportes);
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
            precoDesejavel: parseFloat(document.getElementById('ativo-precoDesejavel').value) || null
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
    }
};
document.addEventListener('DOMContentLoaded', () => app.iniciar());
